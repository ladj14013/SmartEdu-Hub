'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
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
import { MoreHorizontal, UserCog } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { User as UserType, Subject, Stage } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function SupervisorsListPage() {
  const firestore = useFirestore();

  // Queries
  const supervisorsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'users'), where('role', '==', 'supervisor_subject')) : null, [firestore]);
  const subjectsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'subjects') : null, [firestore]);
  const stagesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'stages') : null, [firestore]);

  // Data fetching
  const { data: supervisors, isLoading: isLoadingSupervisors } = useCollection<UserType>(supervisorsQuery);
  const { data: subjects, isLoading: isLoadingSubjects } = useCollection<Subject>(subjectsQuery);
  const { data: stages, isLoading: isLoadingStages } = useCollection<Stage>(stagesQuery);

  const isLoading = isLoadingSupervisors || isLoadingSubjects || isLoadingStages;

  // Memoized maps for efficient lookup
  const subjectsMap = useMemo(() => subjects?.reduce((acc, subject) => {
    acc[subject.id] = subject.name;
    return acc;
  }, {} as Record<string, string>) || {}, [subjects]);

  const stagesMap = useMemo(() => stages?.reduce((acc, stage) => {
    acc[stage.id] = stage.name;
    return acc;
  }, {} as Record<string, string>) || {}, [stages]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="قائمة مشرفي المواد"
        description="عرض وتعديل بيانات مشرفي المواد في المنصة."
      />

      <Card>
        <CardHeader>
          <CardTitle>مشرفو المواد</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>المادة</TableHead>
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
              {!isLoading && supervisors?.map(supervisor => {
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
                            <Badge variant="secondary">{supervisor.subjectId ? subjectsMap[supervisor.subjectId] : 'غير محدد'}</Badge>
                        </TableCell>
                        <TableCell>
                             <Badge variant="outline">{supervisor.stageId ? stagesMap[supervisor.stageId] : 'غير محدد'}</Badge>
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
               {!isLoading && supervisors?.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        لا يوجد مشرفو مواد في المنصة حالياً.
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
