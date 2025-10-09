'use client';
import { useMemo, useState, useEffect } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, getDoc, getDocs, query } from 'firebase/firestore';
import type { User as UserType } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';

// A component to fetch and render a single student's data
function StudentRow({ studentId }: { studentId: string }) {
  const firestore = useFirestore();
  const studentRef = useMemoFirebase(() => firestore ? doc(firestore, 'users', studentId) : null, [firestore, studentId]);
  const { data: student, isLoading } = useDoc<UserType>(studentRef);

  if (isLoading || !student) {
    return (
      <TableRow>
        <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-5 w-24" /></div></TableCell>
        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
        <TableCell><Skeleton className="h-9 w-24" /></TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow key={student.id}>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={student.avatar} alt={student.name} />
            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{student.name}</span>
        </div>
      </TableCell>
      <TableCell>{student.email}</TableCell>
      <TableCell>
        <Button asChild variant="outline" size="sm" disabled>
          <Link href={`#`}>
            عرض الأداء
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  );
}


export default function TeacherStudentsPage() {
  const firestore = useFirestore();
  const { user: authUser, isLoading: isAuthLoading } = useUser();
  
  // Get current teacher data to find their linked students
  const teacherRef = useMemoFirebase(() => (firestore && authUser) ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: teacher, isLoading: isTeacherLoading } = useDoc<UserType>(teacherRef);
  
  const studentIds = teacher?.linkedStudentIds || [];
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
              {isLoading && Array.from({length: 3}).map((_, i) => (
                <TableRow key={i}>
                    <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-5 w-24" /></div></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-9 w-24" /></TableCell>
                </TableRow>
              ))}
              {!isLoading && studentIds.length > 0 && (
                studentIds.map(id => <StudentRow key={id} studentId={id} />)
              )}
              {!isLoading && studentIds.length === 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        لم يقم أي طالب بالربط معك حتى الآن.
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
