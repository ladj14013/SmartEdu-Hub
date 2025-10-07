import React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
} from '@/components/ui/sidebar';
import { SidebarContent } from './components/sidebar-content';
import { UserNav } from './components/user-nav';
import { Logo } from '@/components/common/logo';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In a real app, you would get this from cookies or a server-side check.
  const isSidebarOpen = true; 

  return (
    <SidebarProvider defaultOpen={isSidebarOpen}>
      <Sidebar side="right" collapsible="offcanvas">
        <SidebarContent />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:py-4">
          <SidebarTrigger className="md:hidden" />
          <div className="hidden md:block">
            <Logo href="/" />
          </div>
          <div className="flex-1" />
          <UserNav />
        </header>
        <main className="flex-1 p-4 sm:p-6">
            {children}
        </main>
      </SidebarInset>
      <SidebarRail />
    </SidebarProvider>
  );
}
