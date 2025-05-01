
import { useState } from 'react';
import AppSidebar from './AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
