import AuthRootLayout from './auth-layout';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthRootLayout>{children}</AuthRootLayout>;
}
