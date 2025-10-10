
'use client';

import React, { useMemo, useState } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock Data
const mockSupervisors = [
    {
        id: 'supervisor-1',
        name: 'أ. خالد العامري',
        email: 'k.amri@example.com',
        avatar: 'https://i.pravatar.cc/150?u=supervisor-1',
        subjectName: 'الرياضيات',
        stageName: 'المرحلة الثانوية'
    },
    {
        id: 'supervisor-2',
        name: 'أ. سارة القحطاني',
        email: 's.qahtani@example.com',
        avatar: 'https://i.pravatar.cc/150?u=supervisor-2',
        subjectName: 'اللغة العربية',
        stageName: 'المرحلة الإعدادية'
    },
    {
        id: 'supervisor-3',
        name: 'أ. محمد الغامدي',
        email: 'm.ghamdi@example.com',
        avatar: 'https://i.pravatar.cc/150?u=supervisor-3',
        subjectName: 'العلوم',
        stageName: 'المرحلة الابتدائية'
    }
];


export default function SupervisorsListPage() {
  const [isLoading, setIsLoading] = useState(false); // Kept for UI consistency, can be removed.
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="قائمة مشرفي المواد"
        description="عرض بيانات مشرفي المواد في المنصة."
      />

      <Card>
        <CardHeader>
            <div className='flex flex-col md:flex-row gap-4 justify-between'>
                <CardTitle>مشرفو المواد</CardTitle>
                 {/* Filters are disabled as we are using mock data */}
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <Select disabled>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="فلترة حسب المرحلة" />
                        </SelectTrigger>
                    </Select>
                    <Select disabled>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="فلترة حسب المادة" />
                        </SelectTrigger>
                    </Select>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>المادة المشرف عليها</TableHead>
                <TableHead>المرحلة</TableHead>
                <TableHead>
                  <span className="sr-only">إجراءات</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-5 w-32" /></div></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              )}
              {!isLoading && mockSupervisors.map(supervisor => {
                return (
                    <TableRow key={supervisor.id}>
                        <TableCell className="font-medium">
                           <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={supervisor.avatar} alt={`@${supervisor.name}`} />
                                    <AvatarFallback>{supervisor.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                {supervisor.name}
                            </div>
                        </TableCell>
                        <TableCell>{supervisor.email}</TableCell>
                        <TableCell>
                            <Badge variant="secondary">{supervisor.subjectName}</Badge>
                        </TableCell>
                        <TableCell>
                             <Badge variant="outline">{supervisor.stageName}</Badge>
                        </TableCell>
                        <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">فتح القائمة</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={`/dashboard/directeur/users/${supervisor.id}/edit`}>تعديل</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500" disabled>حذف</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                )
              })}
               {!isLoading && mockSupervisors.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        لا يوجد مشرفو مواد لعرضهم.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
