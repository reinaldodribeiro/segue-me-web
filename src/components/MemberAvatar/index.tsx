"use client";

import { useEffect, useRef, useState } from "react";
import { X, UserCircle } from "lucide-react";
import {
  TEAM_MEMBER_STATUS_LABELS,
  TeamMemberStatus,
  PersonHistory,
  PersonTeamExperience,
} from "@/interfaces/Person";
import { memberDisplayName, memberInitials } from "@/utils/personDisplay";
import { useEncounterTeams } from "@/context/EncounterTeamsContext";
import { storageUrl } from "@/utils/helpers";
import PersonService from "@/services/api/PersonService";
import Drawer from "@/components/Drawer";
import PersonProfileDrawer from "@/components/PersonProfileDrawer";
import { MemberAvatarProps } from "./types";
import { TYPE_COLOR, STATUS_DOT, STATUS_ICON } from "./constants";

const MemberAvatar: React.FC<MemberAvatarProps> = ({ member }) => {
  const { removeMember, updateMemberStatus } = useEncounterTeams();
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 });
  const [profileOpen, setProfileOpen] = useState(false);
  const [loadingExps, setLoadingExps] = useState(false);
  const [experiences, setExperiences] = useState<PersonTeamExperience[]>([]);
  const [historyData, setHistoryData] = useState<PersonHistory[]>([]);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [removeReason, setRemoveReason] = useState("");
  const [removing, setRemoving] = useState(false);
  const [refusalModalOpen, setRefusalModalOpen] = useState(false);
  const [refusalReason, setRefusalReason] = useState("");
  const [refusing, setRefusing] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  async function handleRemove() {
    if (member.status === "confirmed" && !removeReason.trim()) return;
    setRemoving(true);
    await removeMember(member.id, removeReason.trim() || undefined);
    setRemoving(false);
    setRemoveModalOpen(false);
    setRemoveReason("");
    setOpen(false);
  }

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
    setRefusalReason("");
    setRefusalModalOpen(true);
  }

  async function handleRefusal() {
    if (!refusalReason.trim()) return;
    setRefusing(true);
    await updateMemberStatus(member.id, "refused", refusalReason.trim());
    setRefusing(false);
    setRefusalModalOpen(false);
    setRefusalReason("");
  }

  useEffect(() => {
    if (!profileOpen || !member.person) return;
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
  }, [profileOpen, member.person?.id]);

  function handleToggle() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropPos({ top: rect.top - 8, left: rect.left + rect.width / 2 });
    }
    setOpen((v) => !v);
  }

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
            <img src={photo} alt={displayName} className="w-full h-full object-cover" />
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
      {removeModalOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => !removing && setRemoveModalOpen(false)}
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
                  setRemoveModalOpen(false);
                  setRemoveReason("");
                }}
                disabled={removing}
                className="flex-1 py-2 rounded-xl border border-border text-xs text-text-muted hover:bg-hover transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleRemove}
                disabled={!removeReason.trim() || removing}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {removing ? "Removendo…" : "Confirmar remoção"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Refusal reason modal */}
      {refusalModalOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => !refusing && setRefusalModalOpen(false)}
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
                  setRefusalModalOpen(false);
                  setRefusalReason("");
                }}
                disabled={refusing}
                className="flex-1 py-2 rounded-xl border border-border text-xs text-text-muted hover:bg-hover transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleRefusal}
                disabled={!refusalReason.trim() || refusing}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {refusing ? "Salvando…" : "Confirmar recusa"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Profile drawer */}
      <Drawer
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        title="Perfil"
      >
        {member.person && (
          <PersonProfileDrawer
            person={member.person}
            experiences={experiences}
            historyData={historyData}
            loadingExps={loadingExps}
            memberStatus={member.status}
            onClose={() => setProfileOpen(false)}
          />
        )}
      </Drawer>
    </div>
  );
};

export default MemberAvatar;
