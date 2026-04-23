'use client';

import { useState, useEffect } from 'react';

interface AuthLayoutProps {}

const VERSES = [
  { text: 'Vinde após mim, e eu vos farei pescadores de homens.', ref: 'Mateus 4:19' },
  { text: 'Eu sou o caminho, a verdade e a vida. Ninguém vai ao Pai senão por mim.', ref: 'João 14:6' },
  { text: 'O Senhor é o meu pastor; nada me faltará.', ref: 'Salmos 23:1' },
  { text: 'Tudo posso naquele que me fortalece.', ref: 'Filipenses 4:13' },
  { text: 'Sede fortes e corajosos. Não temais nem vos assusteis, porque o Senhor, vosso Deus, está convosco.', ref: 'Josué 1:9' },
  { text: 'Amai-vos uns aos outros como eu vos amei.', ref: 'João 15:12' },
  { text: 'Buscai primeiro o reino de Deus e a sua justiça, e todas essas coisas vos serão acrescentadas.', ref: 'Mateus 6:33' },
  { text: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito.', ref: 'João 3:16' },
];

const ScriptureCarousel: SafeFC = () => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setVisible(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % VERSES.length);
        setVisible(true);
      }, 600);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const verse = VERSES[index];

  return (
    <div className="relative z-10 hidden md:block text-center mt-auto">
      <div className="h-px w-12 bg-yellow-500/30 mx-auto mb-4" />

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-1.5 mb-4">
        {VERSES.map((_, i) => (
          <button
            key={i}
            onClick={() => { setVisible(false); setTimeout(() => { setIndex(i); setVisible(true); }, 300); }}
            className="transition-all duration-300 rounded-full"
            style={{
              width: i === index ? '16px' : '6px',
              height: '6px',
              background: i === index ? '#d4a017' : 'rgba(212,160,23,0.3)',
            }}
            aria-label={`Versículo ${i + 1}`}
          />
        ))}
      </div>

      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
          minHeight: '72px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <blockquote className="text-slate-300/65 text-xs italic leading-relaxed max-w-[240px] mx-auto auth-serif">
          &ldquo;{verse.text}&rdquo;
        </blockquote>
        <cite className="text-yellow-500/45 text-[10px] mt-2 block not-italic tracking-wide">
          — {verse.ref}
        </cite>
      </div>
    </div>
  );
};

const AuthLayout: SafeFC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-0 md:p-6">
      <div className="bg-white w-full max-w-5xl md:min-h-[640px] rounded-none md:rounded-2xl shadow-none md:shadow-2xl overflow-hidden flex flex-col lg:flex-row auth-container">

        {/* Left panel — Catholic branding */}
        <div
          className="relative lg:w-5/12 p-8 sm:p-12 flex flex-col justify-between overflow-hidden auth-panel-dark"
          style={{ background: 'linear-gradient(160deg, #1a0a2e 0%, #0f172a 50%, #1e1040 100%)' }}
        >
          {/* Decorative background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-700 rounded-full blur-[100px] opacity-25" />
            <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-indigo-600 rounded-full blur-[80px] opacity-20" />
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[180%] h-36 rounded-t-full"
              style={{ background: 'rgba(0,0,0,0.15)' }}
            />
          </div>

          {/* Main branding */}
          <div className="relative z-10 flex flex-col items-center text-center w-full animate-in fade-in slide-in-from-left-8 duration-700">
            {/* Cross */}
            <div className="relative mb-6 flex items-center justify-center">
              <div className="absolute w-20 h-20 bg-yellow-500/10 rounded-full blur-2xl" />
              <svg viewBox="0 0 72 72" className="w-16 h-16 drop-shadow-lg" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="30" y="6" width="12" height="60" rx="3" fill="#d4a017" opacity="0.15" />
                <rect x="6" y="22" width="60" height="12" rx="3" fill="#d4a017" opacity="0.15" />
                <rect x="31" y="7" width="10" height="58" rx="2.5" fill="url(#goldGrad)" />
                <rect x="7" y="23" width="58" height="10" rx="2.5" fill="url(#goldGrad)" />
                <rect x="33" y="7" width="3" height="58" rx="1.5" fill="white" opacity="0.15" />
                <rect x="7" y="25" width="58" height="3" rx="1.5" fill="white" opacity="0.15" />
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f0c040" />
                    <stop offset="50%" stopColor="#d4a017" />
                    <stop offset="100%" stopColor="#a07010" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <h1 className="text-white text-3xl font-bold tracking-wide mb-1 auth-serif">
              Segue-me
            </h1>
            <div className="flex items-center gap-2 justify-center mb-5">
              <div className="h-px w-8 bg-yellow-500/40" />
              <span className="text-yellow-400/70 text-[10px] uppercase tracking-[0.2em]">Sistema Paroquial</span>
              <div className="h-px w-8 bg-yellow-500/40" />
            </div>

            <div className="hidden md:block">
              <h2 className="text-xl font-semibold text-white/90 mb-3">
                Bem-vindo de volta!
              </h2>
              <p className="text-slate-300/80 text-sm leading-relaxed max-w-[260px] mx-auto">
                Gerencie encontros, equipes e pessoas da sua paróquia em um só lugar.
              </p>
            </div>
          </div>

          {/* Rotating scripture verses */}
          <ScriptureCarousel />
        </div>

        {/* Right panel — form */}
        <div className="relative lg:w-7/12 bg-white flex flex-col justify-center auth-panel-white overflow-hidden">
          <div
            className="absolute top-0 right-0 w-40 h-40 rounded-bl-full opacity-40"
            style={{ background: 'radial-gradient(circle at top right, #f3e8ff, transparent)' }}
          />
          <div
            className="absolute bottom-0 left-0 w-28 h-28 rounded-tr-full opacity-30"
            style={{ background: 'radial-gradient(circle at bottom left, #ede9fe, transparent)' }}
          />
          <div className="relative z-10 w-full px-8 sm:px-14 py-10 flex flex-col justify-center">
            {children}
          </div>
        </div>

      </div>

      <style>{`
        .auth-serif {
          font-family: Georgia, 'Times New Roman', serif;
        }
        @media (max-width: 1023px) {
          .auth-container {
            flex-direction: column !important;
            min-height: 100vh !important;
            border-radius: 0 !important;
          }
          .auth-panel-dark {
            flex: 0 0 auto;
            padding-top: 2.5rem !important;
            padding-bottom: 2.5rem !important;
          }
          .auth-panel-white {
            flex: 1 1 auto;
            border-top-left-radius: 1.5rem;
            border-top-right-radius: 1.5rem;
            margin-top: -1.25rem;
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .auth-container {
            min-height: auto !important;
            border-radius: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AuthLayout;
