import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Segue-me',
  description: 'Segue-me — Gestão de Encontros',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-theme="light">
      <body className="bg-bg text-text antialiased transition-colors duration-300">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
