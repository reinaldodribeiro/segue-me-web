'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, X } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useParishColor } from '@/hooks/useParishColor';
import { AnalyticsProvider } from '@/context/AnalyticsContext';
import TutorialOverlay from '@/components/Tutorial/TutorialOverlay';

/** Watches the logged-in user's parish colors and applies them automatically. */
function ParishColorSync() {
  const { user } = useAuth();
  const { applyParishColors } = useParishColor();

  useEffect(() => {
    if (!user) return;
    applyParishColors(
      user.parish?.primary_color ?? null,
      user.parish?.secondary_color ?? null,
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.parish?.primary_color, user?.parish?.secondary_color]);

  return null;
}

/** Sticky banner shown when a color preview is active in Parish settings. */
function PreviewBanner() {
  const { previewActive, clearPreview, primaryColor, secondaryColor } = useParishColor();
  if (!previewActive) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 flex items-center justify-between gap-4 px-6 py-3 bg-amber-50 border-t-2 border-amber-300 shadow-lg">
      <div className="flex items-center gap-2 text-amber-800">
        <Eye size={16} />
        <span className="text-sm font-medium">Pré-visualização ativa</span>
        <div className="flex items-center gap-1.5 ml-2">
          {primaryColor && (
            <span
              className="w-4 h-4 rounded-full border border-amber-300 inline-block"
              style={{ backgroundColor: primaryColor }}
            />
          )}
          {secondaryColor && (
            <span
              className="w-4 h-4 rounded-full border border-amber-300 inline-block"
              style={{ backgroundColor: secondaryColor }}
            />
          )}
        </div>
        <span className="text-xs text-amber-600 ml-1">As cores não foram salvas.</span>
      </div>
      <button
        onClick={clearPreview}
        className="flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors"
      >
        <X size={14} /> Fechar prévia
      </button>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { isLogged } = useAuth();
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !isLogged) router.push('/auth/login');
  }, [mounted, isLogged, router]);

  if (!mounted) return null;
  if (!isLogged) return null;

  return (
    <AnalyticsProvider>
      <ParishColorSync />
      <Layout>{children}</Layout>
      <PreviewBanner />
      <TutorialOverlay />
    </AnalyticsProvider>
  );
}
