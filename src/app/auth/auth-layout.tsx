'use client';

import { useEffect, useState } from 'react';
import AuthLayout from '@/features/Auth/Layout';

export default function AuthRootLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return <AuthLayout>{children}</AuthLayout>;
}
