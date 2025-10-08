'use client';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent } from '@/components/ui/card';
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
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import type { User as UserType, Level } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Badge } from 'lucide-react';
import { useMemo } from 'react';

export default function TeacherStudentsPage() {
  const firestore = useFirestore();
  const { user: authUser, isLoading: isAuthLoading } = useUser();

  // Get current teacher data
  const teacherRef = useMemoFirebase(() => (firestore && authUser) ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: teacher, isLoading: isTeacherLoading } = useDoc<UserType>(teacherRef);

  // Get students linked to this teacher
  const linkedStudentsQuery = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return query(collection(firestore, 'users'), where('linkedTeacherId', '==', authUser.uid));
  }, [firestore, authUser]);
  const { data: linkedStudents, isLoading: areStudentsLoading } = useCollection<UserType>(linkedStudentsQuery);
  
  // Get all levels in the teacher's stage to display student level names
  const levelsQuery = useMemoFirebase(() => {
    if (!firestore || !teacher?.stageId) return null;
    return query(collection(firestore, 'levels'), where('stageId', '==', teacher.stageId));
  }, [firestore, teacher?.stageId]);
  const { data: levels, isLoading: areLevelsLoading } = useCollection<Level>(levelsQuery);
  
  const levelsMap = useMemo(() => {
    if (!levels) return new Map();
    return new Map(levels.map(level => [level.id, level.name]));
  }, [levels]);


  const isLoading = isAuthLoading || isTeacherLoading || areStudentsLoading || areLevelsLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="قائمة طلابك"
        description="عرض الطلاب المرتبطين بك وحساباتهم."
      >
        <Button variant="outline" asChild>
            <Link href="/dashboard/teacher">
                <ArrowRight className="ml-2 h-4 w-4" /> العودة للرئيسية
            </Link>
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الطالب</TableHead>
                <TableHead>المستوى الدراسي</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الإجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({length: 5}).map((_, i) => (
                <TableRow key={i}>
                    <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-5 w-24" /></div></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-9 w-24" /></TableCell>
                </TableRow>
              ))}
              {!isLoading && linkedStudents?.map(student => {
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
                        <TableCell>
                            {student.levelId ? levelsMap.get(student.levelId) || 'غير محدد' : 'غير محدد'}
                        </TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>
                            <Button asChild variant="outline" size="sm" disabled>
                                <Link href={`#`}>
                                    عرض التقدم
                                </Link>
                            </Button>
                        </TableCell>
                    </TableRow>
                )
              })}
              {!isLoading && linkedStudents?.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        لم يرتبط أي طالب بك حتى الآن. شارك كود الربط الخاص بك.
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
