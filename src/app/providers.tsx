'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { ParishColorProvider } from '@/context/ParishColorContext';
import { LayoutProvider } from '@/context/LayoutContext';
import { QueryProvider } from '@/lib/query/provider';
import { TutorialProvider } from '@/context/TutorialContext';

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ToastProvider>
        <ThemeProvider>
          <ParishColorProvider>
            <LayoutProvider>
              <AuthProvider>
                <TutorialProvider>
                  {children}
                </TutorialProvider>
              </AuthProvider>
            </LayoutProvider>
          </ParishColorProvider>
        </ThemeProvider>
      </ToastProvider>
    </QueryProvider>
  );
}

export default Providers;
