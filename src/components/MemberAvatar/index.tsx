"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { X, UserCircle } from "lucide-react";
import {
  TEAM_MEMBER_STATUS_LABELS,
  TeamMemberStatus,
  PersonHistory,
  PersonTeamExperience,
} from "@/interfaces/Person";
import { memberDisplayName, memberInitials } from "@/utils/personDisplay";
import { useEncounterTeams } from "@/hooks/useEncounterTeams";
import { storageUrl } from "@/utils/helpers";
import PersonService from "@/services/api/PersonService";
import Drawer from "@/components/Drawer";
import PersonProfileDrawer from "@/components/PersonProfileDrawer";
import { MemberAvatarProps } from "./types";
import { TYPE_COLOR, STATUS_DOT, STATUS_ICON } from "./constants";

/* ─── RemoveModal ────────────────────────────────────────────────── */

interface RemoveModalProps {
  open: boolean;
  displayName: string;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

const RemoveModal = memo(function RemoveModal({
  open,
  displayName,
  onClose,
  onConfirm,
}: RemoveModalProps) {
  const [removeReason, setRemoveReason] = useState("");
  const [removing, setRemoving] = useState(false);

  // Reset reason when modal opens
  useEffect(() => {
    if (open) setRemoveReason("");
  }, [open]);

  if (!open) return null;

  async function handleConfirm() {
    if (!removeReason.trim()) return;
    setRemoving(true);
    await onConfirm(removeReason.trim());
    setRemoving(false);
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={() => !removing && onClose()}
      />
      <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-panel border border-border rounded-2xl shadow-2xl w-80 p-5 space-y-4">
        <div>
          <p className="text-sm font-semibold text-text">
            Remover membro confirmado
          </p>
          <p className="text-xs text-text-muted mt-1">
            <span className="font-medium text-text">{displayName}</span> já
            confirmou presença. Informe o motivo da remoção.
          </p>
        </div>
        <textarea
          autoFocus
          value={removeReason}
          onChange={(e) => setRemoveReason(e.target.value)}
          placeholder="Ex: indisponibilidade, substituição..."
          rows={3}
          className="w-full text-xs rounded-xl border border-input-border bg-input-bg text-input-text px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <div className="flex gap-2">
          <button
            onClick={() => {
              setRemoveReason("");
              onClose();
            }}
            disabled={removing}
            className="flex-1 py-2 rounded-xl border border-border text-xs text-text-muted hover:bg-hover transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!removeReason.trim() || removing}
            className="flex-1 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {removing ? "Removendo…" : "Confirmar remoção"}
          </button>
        </div>
      </div>
    </>
  );
});

/* ─── RefusalModal ───────────────────────────────────────────────── */

interface RefusalModalProps {
  open: boolean;
  displayName: string;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

const RefusalModal = memo(function RefusalModal({
  open,
  displayName,
  onClose,
  onConfirm,
}: RefusalModalProps) {
  const [refusalReason, setRefusalReason] = useState("");
  const [refusing, setRefusing] = useState(false);

  // Reset reason when modal opens
  useEffect(() => {
    if (open) setRefusalReason("");
  }, [open]);

  if (!open) return null;

  async function handleConfirm() {
    if (!refusalReason.trim()) return;
    setRefusing(true);
    await onConfirm(refusalReason.trim());
    setRefusing(false);
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={() => !refusing && onClose()}
      />
      <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-panel border border-border rounded-2xl shadow-2xl w-80 p-5 space-y-4">
        <div>
          <p className="text-sm font-semibold text-text">
            Marcar como recusado
          </p>
          <p className="text-xs text-text-muted mt-1">
            Informe o motivo da recusa de{" "}
            <span className="font-medium text-text">{displayName}</span>.
          </p>
        </div>
        <textarea
          autoFocus
          value={refusalReason}
          onChange={(e) => setRefusalReason(e.target.value)}
          placeholder="Ex: indisponibilidade, viagem..."
          rows={3}
          className="w-full text-xs rounded-xl border border-input-border bg-input-bg text-input-text px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <div className="flex gap-2">
          <button
            onClick={() => {
              setRefusalReason("");
              onClose();
            }}
            disabled={refusing}
            className="flex-1 py-2 rounded-xl border border-border text-xs text-text-muted hover:bg-hover transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!refusalReason.trim() || refusing}
            className="flex-1 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {refusing ? "Salvando…" : "Confirmar recusa"}
          </button>
        </div>
      </div>
    </>
  );
});

/* ─── ProfileDrawer ──────────────────────────────────────────────── */

interface ProfileDrawerProps {
  open: boolean;
  member: MemberAvatarProps["member"];
  onClose: () => void;
}

const ProfileDrawer = memo(function ProfileDrawer({
  open,
  member,
  onClose,
}: ProfileDrawerProps) {
  const [loadingExps, setLoadingExps] = useState(false);
  const [experiences, setExperiences] = useState<PersonTeamExperience[]>([]);
  const [historyData, setHistoryData] = useState<PersonHistory[]>([]);

  useEffect(() => {
    if (!open || !member.person) return;
    async function load() {
      setLoadingExps(true);
      try {
        const res = await PersonService.search(member.person!.id);
        const p = res.data.data;
        setExperiences(p.team_experiences ?? []);
        setHistoryData(p.history ?? []);
      } finally {
        setLoadingExps(false);
      }
    }
    load();
  }, [open, member.person?.id]);

  return (
    <Drawer open={open} onClose={onClose} title="Perfil">
      {member.person && (
        <PersonProfileDrawer
          person={member.person}
          experiences={experiences}
          historyData={historyData}
          loadingExps={loadingExps}
          memberStatus={member.status}
          onClose={onClose}
        />
      )}
    </Drawer>
  );
});

/* ─── MemberAvatar ───────────────────────────────────────────────── */

const MemberAvatar: SafeFC<MemberAvatarProps> = ({ member }) => {
  const { removeMember, updateMemberStatus } = useEncounterTeams();
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 });
  const [profileOpen, setProfileOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [refusalModalOpen, setRefusalModalOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleRemoveConfirm = useCallback(
    async (reason: string) => {
      await removeMember(member.id, reason || undefined);
      setRemoveModalOpen(false);
      setOpen(false);
    },
    [removeMember, member.id],
  );

  const handleRefusalConfirm = useCallback(
    async (reason: string) => {
      await updateMemberStatus(member.id, "refused", reason);
      setRefusalModalOpen(false);
    },
    [updateMemberStatus, member.id],
  );

  function requestRemove() {
    setOpen(false);
    if (member.status === "confirmed") {
      setRemoveModalOpen(true);
    } else {
      removeMember(member.id);
    }
  }

  function requestRefusal() {
    setOpen(false);
    setRefusalModalOpen(true);
  }

  function handleToggle() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropPos({ top: rect.top - 8, left: rect.left + rect.width / 2 });
    }
    setOpen((v) => !v);
  }

  const handleProfileClose = useCallback(() => setProfileOpen(false), []);
  const handleRemoveModalClose = useCallback(() => setRemoveModalOpen(false), []);
  const handleRefusalModalClose = useCallback(() => setRefusalModalOpen(false), []);

  const colors = TYPE_COLOR[member.person?.type ?? "youth"];
  const initials = memberInitials(member);
  const displayName = memberDisplayName(member);
  const photo = member.person?.photo ? storageUrl(member.person.photo) : null;
  const isPending = member.status === "pending";

  return (
    <div className="relative flex flex-col items-center gap-1 w-16">
      {/* Avatar button */}
      <div className="relative w-12 h-12">
        <button
          ref={buttonRef}
          onClick={handleToggle}
          className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all hover:scale-105 hover:shadow-md
            ${isPending ? "border-amber-300 opacity-75" : member.status === "refused" ? "border-red-300 opacity-50" : "border-white shadow-sm"}
          `}
        >
          {photo ? (
            <img src={photo} alt={displayName} width={48} height={48} loading="lazy" className="w-full h-full object-cover" />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center text-sm font-bold
              ${isPending ? `${colors.light} ${colors.text}` : `${colors.solid} text-white`}`}
            >
              {initials}
            </div>
          )}
        </button>
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${STATUS_DOT[member.status]}`}
        />
      </div>

      {/* Name */}
      <p className="text-[10px] text-text-muted text-center leading-tight w-full truncate px-0.5">
        {displayName.split(" ")[0]}
        {member.person?.type === "couple" && member.person?.partner_name
          ? ` & ${member.person.partner_name.split(" ")[0]}`
          : ""}
      </p>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed -translate-x-1/2 -translate-y-full bg-panel border border-border rounded-xl shadow-xl z-50 w-52 overflow-hidden"
            style={{ top: dropPos.top, left: dropPos.left }}
          >
            <div
              className={`px-3 py-2.5 flex items-center gap-2.5 ${colors.light}`}
            >
              {photo ? (
                <img
                  src={photo}
                  alt={displayName}
                  width={32}
                  height={32}
                  loading="lazy"
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
              ) : (
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${colors.solid} text-white`}
                >
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-text truncate">
                  {displayName}
                </p>
                <p
                  className={`text-[10px] flex items-center gap-1 ${colors.text}`}
                >
                  {STATUS_ICON[member.status]}
                  {TEAM_MEMBER_STATUS_LABELS[member.status]}
                </p>
              </div>
            </div>

            <div className="py-1">
              {(["pending", "confirmed", "refused"] as TeamMemberStatus[]).map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => {
                      if (s === "refused") {
                        requestRefusal();
                      } else {
                        updateMemberStatus(member.id, s);
                        setOpen(false);
                      }
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-hover transition-colors
                    ${member.status === s ? "font-semibold text-primary bg-primary/5" : "text-text"}`}
                  >
                    {STATUS_ICON[s]}
                    {TEAM_MEMBER_STATUS_LABELS[s]}
                  </button>
                ),
              )}
            </div>

            <div className="border-t border-border">
              <button
                onClick={() => {
                  setOpen(false);
                  setProfileOpen(true);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-text hover:bg-hover transition-colors flex items-center gap-2"
              >
                <UserCircle size={11} /> Ver perfil
              </button>
              <button
                onClick={requestRemove}
                className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <X size={11} /> Remover da equipe
              </button>
            </div>
          </div>
        </>
      )}

      {/* Remove reason modal */}
      <RemoveModal
        open={removeModalOpen}
        displayName={displayName}
        onClose={handleRemoveModalClose}
        onConfirm={handleRemoveConfirm}
      />

      {/* Refusal reason modal */}
      <RefusalModal
        open={refusalModalOpen}
        displayName={displayName}
        onClose={handleRefusalModalClose}
        onConfirm={handleRefusalConfirm}
      />

      {/* Profile drawer */}
      <ProfileDrawer
        open={profileOpen}
        member={member}
        onClose={handleProfileClose}
      />
    </div>
  );
};

export default memo(MemberAvatar);
