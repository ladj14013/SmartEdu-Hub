'use client';
import { useMemo } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User as UserType } from '@/lib/types';
import { ArrowRight, Ban } from 'lucide-react';


export default function TeacherStudentsPage() {
  const { user: authUser, isLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  
  const teacherRef = useMemoFirebase(() => (firestore && authUser) ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: teacher, isLoading: isTeacherLoading } = useDoc<UserType>(teacherRef);
  
  const isLoading = isAuthLoading || isTeacherLoading;
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="قائمة الطلاب"
        description={`عرض الطلاب المرتبطين بك أستاذ ${teacher?.name || ''}`}
      >
          <Button variant="outline" asChild>
            <Link href="/dashboard/teacher">
                <ArrowRight className="ml-2 h-4 w-4" /> العودة للرئيسية
            </Link>
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
            <CardTitle>الطلاب المرتبطون</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الطالب</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الإجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                  <TableCell colSpan={3} className="h-48 text-center">
                      <Ban className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-4 font-semibold">ميزة الارتباط معطلة حالياً</p>
                      <p className="text-muted-foreground">تم تعطيل ميزة ربط الطلاب بالأساتذة في هذا الإصدار.</p>
                  </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
