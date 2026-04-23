import { memo } from 'react';
import Sidebar from '@/components/Layout/Sidebar';
import MobileDrawer from '@/components/Layout/MobileDrawer';
import Header from '@/components/Layout/Header';
import { useLayout } from '@/hooks/useLayout';
import { cn } from '@/utils/helpers';
import { LayoutProps } from './types';

const Layout: SafeFC<LayoutProps> = memo(({ children }) => {
  const { isSidebarCollapsed } = useLayout();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg text-text">
      {/* Desktop Sidebar */}
      <div
        className={cn(
          'hidden lg:flex flex-col shrink-0 transition-all duration-300',
          isSidebarCollapsed ? 'w-[72px]' : 'w-64',
        )}
      >
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-content-bg">
          {children}
        </main>
      </div>
    </div>
  );
});

export default Layout;
