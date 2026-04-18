'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import Input from '@/components/Input';
import Button from '@/components/Button';

const LoginForm: React.FC = () => {
  const router = useRouter();
  const { signIn } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const next: typeof errors = {};
    if (!email.trim()) next.email = 'E-mail obrigatório';
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = 'E-mail inválido';
    if (!password) next.password = 'Senha obrigatória';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    await signIn(
      { email, password },
      () => {
        toast({ title: 'Bem-vindo!', description: 'Login realizado com sucesso.', variant: 'success' });
        router.push('/app');
      },
      () => {
        toast({ title: 'Credenciais inválidas', description: 'Verifique seu e-mail e senha.', variant: 'error' });
      },
    );
    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm mx-auto animate-in fade-in slide-in-from-right-8 duration-700">

      {/* Heading */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Acesso ao Sistema</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-1" style={{ fontFamily: 'Georgia, serif' }}>
          Entrar na conta
        </h3>
        <p className="text-slate-400 text-sm">
          Informe suas credenciais para acessar o painel
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          name="email"
          type="email"
          label="E-mail"
          placeholder="seu@email.com"
          startIcon={<Mail size={16} />}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors(p => ({ ...p, email: undefined }));
          }}
          error={errors.email}
          autoComplete="email"
        />

        <Input
          name="password"
          type={showPassword ? 'text' : 'password'}
          label="Senha"
          placeholder="••••••••"
          startIcon={<Lock size={16} />}
          endIcon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          onEndIconClick={() => setShowPassword((v) => !v)}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors(p => ({ ...p, password: undefined }));
          }}
          error={errors.password}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-slate-500 select-none">
            <input type="checkbox" className="rounded border-slate-300 accent-primary" />
            Lembrar de mim
          </label>
          <button
            type="button"
            className="text-primary hover:text-primary-hover font-medium hover:underline transition-colors"
          >
            Esqueci minha senha
          </button>
        </div>

        <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
          {!loading && 'Entrar'}
        </Button>
      </form>

      {/* Footer note */}
      <p className="text-center text-[11px] text-slate-400 mt-8 leading-relaxed">
        Sistema exclusivo para membros autorizados da diocese.
        <br />
        Em caso de dúvidas, contacte o administrador da paróquia.
      </p>
    </div>
  );
};

export default LoginForm;
