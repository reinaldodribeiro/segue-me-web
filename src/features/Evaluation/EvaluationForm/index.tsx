import { useState, useEffect, useCallback } from 'react';
import Button from '@/components/Button';
import EvaluationService from '@/services/api/EvaluationService';
import { FulfilledResponsibilities, MemberEvaluationPayload, RecommendStatus } from '@/interfaces/Evaluation';
import TeamQuestions from './TeamQuestions';
import MemberQuestions from './MemberQuestions';
import { EvaluationFormProps, TeamFormState, MemberFormState } from './types';

const INITIAL_TEAM: TeamFormState = {
  preparation_rating: 0,
  preparation_comment: '',
  teamwork_rating: 0,
  teamwork_comment: '',
  materials_rating: 0,
  materials_comment: '',
  issues_text: '',
  improvements_text: '',
  overall_team_rating: 0,
};

function storageKey(token: string) {
  return `evaluation_draft_${token}`;
}

function loadDraft(token: string): { team: TeamFormState; members: MemberFormState[] } | null {
  try {
    const raw = localStorage.getItem(storageKey(token));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveDraft(token: string, team: TeamFormState, members: MemberFormState[]) {
  try {
    localStorage.setItem(storageKey(token), JSON.stringify({ team, members }));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

function clearDraft(token: string) {
  try {
    localStorage.removeItem(storageKey(token));
  } catch {
    // ignore
  }
}

const EvaluationForm: React.FC<EvaluationFormProps> = ({
  token,
  sessionToken,
  formData,
  onSuccess,
}) => {
  const draft = loadDraft(token);

  const [teamForm, setTeamForm] = useState<TeamFormState>(draft?.team ?? INITIAL_TEAM);
  const [members, setMembers] = useState<MemberFormState[]>(() => {
    // Merge draft with current member list (members may have changed)
    return formData.members.map((m) => {
      const saved = draft?.members?.find((d) => d.team_member_id === m.team_member_id);
      return saved ?? {
        team_member_id: m.team_member_id,
        person_name: m.person_name,
        commitment_rating: 0,
        fulfilled_responsibilities: '',
        positive_highlight: '',
        issue_observed: '',
        recommend: '',
      };
    });
  });
  const [teamErrors, setTeamErrors] = useState<Partial<Record<keyof TeamFormState, string>>>({});
  const [memberErrors, setMemberErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');

  // Persist to localStorage on every change
  const persistDraft = useCallback(() => {
    saveDraft(token, teamForm, members);
  }, [token, teamForm, members]);

  useEffect(() => {
    persistDraft();
  }, [persistDraft]);

  function handleTeamChange(field: keyof TeamFormState, value: string | number) {
    setTeamForm((prev) => ({ ...prev, [field]: value }));
    setTeamErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleMemberChange(index: number, field: keyof MemberFormState, value: string | number) {
    setMembers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setMemberErrors((prev) => {
      const next = { ...prev };
      delete next[`members.${index}.${field}`];
      return next;
    });
  }

  function validate(): boolean {
    const tErr: Partial<Record<keyof TeamFormState, string>> = {};
    const mErr: Record<string, string> = {};

    if (!teamForm.preparation_rating) tErr.preparation_rating = 'Obrigatório';
    if (!teamForm.teamwork_rating) tErr.teamwork_rating = 'Obrigatório';
    if (!teamForm.materials_rating) tErr.materials_rating = 'Obrigatório';
    if (!teamForm.overall_team_rating) tErr.overall_team_rating = 'Obrigatório';

    members.forEach((m, i) => {
      if (!m.commitment_rating) mErr[`members.${i}.commitment_rating`] = 'Obrigatório';
      if (!m.fulfilled_responsibilities) mErr[`members.${i}.fulfilled_responsibilities`] = 'Obrigatório';
      if (!m.recommend) mErr[`members.${i}.recommend`] = 'Obrigatório';
    });

    setTeamErrors(tErr);
    setMemberErrors(mErr);
    return Object.keys(tErr).length === 0 && Object.keys(mErr).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setGlobalError('');

    try {
      const memberPayloads: MemberEvaluationPayload[] = members.map((m) => ({
        team_member_id: m.team_member_id,
        commitment_rating: m.commitment_rating,
        fulfilled_responsibilities: m.fulfilled_responsibilities as FulfilledResponsibilities,
        positive_highlight: m.positive_highlight || undefined,
        issue_observed: m.issue_observed || undefined,
        recommend: m.recommend as RecommendStatus,
      }));

      await EvaluationService.submitEvaluation(token, {
        session_token: sessionToken,
        ...teamForm,
        preparation_comment: teamForm.preparation_comment || undefined,
        teamwork_comment: teamForm.teamwork_comment || undefined,
        materials_comment: teamForm.materials_comment || undefined,
        issues_text: teamForm.issues_text || undefined,
        improvements_text: teamForm.improvements_text || undefined,
        members: memberPayloads,
      });

      clearDraft(token);
      onSuccess();
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Erro ao enviar avaliação.';
      setGlobalError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-panel border border-border rounded-xl p-5">
        <h1 className="text-lg font-bold text-text">{formData.encounter_name}</h1>
        <p className="text-sm text-text-muted mt-0.5">
          {formData.movement_name}
          {formData.encounter_date ? ` · ${formData.encounter_date}` : ''}
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-lg">
          {formData.team_icon && <span>{formData.team_icon}</span>}
          Equipe: {formData.team_name}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Team Questions */}
        <div className="bg-panel border border-border rounded-xl p-5">
          <TeamQuestions form={teamForm} onChange={handleTeamChange} errors={teamErrors} />
        </div>

        {/* Member Questions */}
        <div className="bg-panel border border-border rounded-xl p-5">
          <MemberQuestions members={members} onChange={handleMemberChange} errors={memberErrors} />
        </div>

        {globalError && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            {globalError}
          </div>
        )}

        <Button type="submit" loading={submitting} className="w-full">
          Enviar Avaliação
        </Button>
      </form>
    </div>
  );
};

export default EvaluationForm;
