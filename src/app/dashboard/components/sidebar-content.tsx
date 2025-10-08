'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  BookCopy,
  FolderKanban,
  Github,
  GraduationCap,
  Home,
  Mail,
  Users,
  Presentation,
  Library,
  PenSquare,
} from 'lucide-react';
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent as SidebarContentArea,
  SidebarFooter,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Logo } from '@/components/common/logo';

// In a real app, this role would be determined from the user's session
const useUserRole = () => {
    const pathname = usePathname();
    if (pathname.startsWith('/dashboard/directeur')) return 'directeur';
    if (pathname.startsWith('/dashboard/supervisor_general')) return 'supervisor_general';
    if (pathname.startsWith('/dashboard/supervisor_subject')) return 'supervisor_subject';
    if (pathname.startsWith('/dashboard/teacher')) return 'teacher';
    if (pathname.startsWith('/dashboard/student')) return 'student';
    return 'student'; // Default fallback
};

const navLinks = {
  directeur: [
    { href: '/dashboard/directeur', label: 'الرئيسية', icon: Home },
    { href: '/dashboard/directeur/content', label: 'إدارة هيكل المحتوى', icon: FolderKanban },
    { href: '/dashboard/directeur/users', label: 'إدارة المستخدمين', icon: Users },
    { href: '/dashboard/directeur/messages', label: 'صندوق الرسائل', icon: Mail },
    { href: '/dashboard/directeur/github-guide', label: 'دليل GitHub', icon: Github },
  ],
  supervisor_subject: [
    { href: '/dashboard/supervisor_subject', label: 'الرئيسية', icon: Home },
    { href: '/dashboard/supervisor_subject/content', label: 'إدارة المحتوى العام', icon: BookCopy },
    { href: '/dashboard/supervisor_subject/teachers', label: 'قائمة الأساتذة', icon: Users },
  ],
  supervisor_general: [
    { href: '/dashboard/supervisor_general', label: 'الرئيسية', icon: Home },
    { href: '/dashboard/supervisor_general/supervisors', label: 'قائمة مشرفي المواد', icon: Users },
    { href: '/dashboard/supervisor_general/messages', label: 'الرسائل الموجهة', icon: Mail },
  ],
  teacher: [
    { href: '/dashboard/teacher', label: 'الرئيسية', icon: Home },
    { href: '/dashboard/teacher/subjects', label: 'إدارة الدروس', icon: Presentation },
  ],
  student: [
    { href: '/dashboard/student', label: 'الرئيسية', icon: Home },
    { href: '/dashboard/student/subjects', label: 'المواد الدراسية', icon: Library },
  ],
  parent: [],
};


export function SidebarContent() {
  const pathname = usePathname();
  const role = useUserRole();
  const links = navLinks[role] || [];

  return (
    <>
      <SidebarHeader>
        <Logo href="/" />
      </SidebarHeader>
      <SidebarContentArea>
        <SidebarMenu>
          {links.map((link) => (
            <SidebarMenuItem key={link.href}>
              <Link href={link.href}>
                <SidebarMenuButton isActive={pathname === link.href} tooltip={link.label}>
                  <link.icon />
                  <span>{link.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContentArea>
      <SidebarFooter>
         {/* Footer content can go here */}
      </SidebarFooter>
    </>
  );
}
