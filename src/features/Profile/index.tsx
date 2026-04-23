'use client';

import { useState } from 'react';
import { User, Lock, CheckCircle2 } from 'lucide-react';
import Input from '@/components/Input';
import PasswordInput from '@/components/PasswordInput';
import Button from '@/components/Button';
import SectionCard from '@/components/SectionCard';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/useToast';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { ROLE_LABELS, UserRole } from '@/types/roles';
import AdminUserService from '@/services/api/AdminUserService';
import UserService from '@/services/api/UserService';
import TutorialSection from './TutorialSection';

function getInitials(name: string) {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getUserRole(user: { roles: (UserRole | { name: string })[] }): UserRole | null {
  if (!user.roles?.length) return null;
  const r = user.roles[0];
  return (typeof r === 'string' ? r : r.name) as UserRole;
}

const Profile: SafeFC = () => {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  const permissions = usePermissions();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  if (!user) return null;

  const role = getUserRole(user);

  async function handleSaveProfile(e: React.SyntheticEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await AdminUserService.update(user!.id, { name, email });
      setUser((prev) => prev ? { ...prev, name: res.data.data.name, email: res.data.data.email } : prev);
      toast({ title: 'Perfil atualizado com sucesso.', variant: 'success' });
    } catch (err: unknown) {
      handleError(err, 'handleSaveProfile()');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSavePassword(e: React.SyntheticEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: 'As senhas não coincidem.', variant: 'error' });
      return;
    }
    setSavingPassword(true);
    try {
      await UserService.updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      toast({ title: 'Senha alterada com sucesso.', variant: 'success' });
    } catch (err: unknown) {
      handleError(err, 'handleSavePassword()');
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-lg">{getInitials(user.name)}</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-text">{user.name}</h1>
          <p className="text-sm text-text-muted">{user.email}</p>
          {role && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary mt-1">
              <CheckCircle2 size={12} />
              {ROLE_LABELS[role]}
            </span>
          )}
        </div>
      </div>

      {/* Scope info */}
      {(permissions.isDioceseAdmin || permissions.isSectorAdmin || permissions.isParishAdmin || permissions.isCoordinator) && (
        <div className="bg-panel border border-border rounded-xl px-5 py-3 text-sm text-text-muted space-y-1">
          {user.parish?.name && (
            <p><span className="font-medium text-text">Paróquia:</span> {user.parish.name}</p>
          )}
          {user.sector_id && !user.parish?.name && (
            <p><span className="font-medium text-text">Setor ID:</span> {user.sector_id}</p>
          )}
          {user.diocese_id && !user.sector_id && (
            <p><span className="font-medium text-text">Diocese ID:</span> {user.diocese_id}</p>
          )}
        </div>
      )}

      {/* Profile info */}
      <SectionCard
        title="Informações Pessoais"
        action={<User size={15} className="text-text-muted" />}
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            name="name"
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            name="email"
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="flex justify-end">
            <Button type="submit" loading={savingProfile}>
              Salvar
            </Button>
          </div>
        </form>
      </SectionCard>

      {/* Password */}
      <SectionCard
        title="Alterar Senha"
        action={<Lock size={15} className="text-text-muted" />}
      >
        <form onSubmit={handleSavePassword} className="space-y-4">
          <PasswordInput
            name="current_password"
            label="Senha atual"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <PasswordInput
            name="password"
            label="Nova senha"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <PasswordInput
            name="password_confirmation"
            label="Confirmar nova senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <div className="flex justify-end">
            <Button type="submit" loading={savingPassword}>
              Alterar senha
            </Button>
          </div>
        </form>
      </SectionCard>

      {/* Tutorial */}
      <TutorialSection />
    </div>
  );
};

export default Profile;
