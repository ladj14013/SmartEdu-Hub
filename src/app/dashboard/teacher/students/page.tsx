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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import type { User as UserType, Level } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';

export default function TeacherStudentsPage() {
  const firestore = useFirestore();
  const { user: authUser, isLoading: isAuthLoading } = useUser();

  // Get current teacher data
  const teacherRef = useMemoFirebase(() => (firestore && authUser) ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: teacher, isLoading: isTeacherLoading } = useDoc<UserType>(teacherRef);

  // Get students linked to this teacher for this teacher's subject
  const linkedStudentsQuery = useMemoFirebase(() => {
    if (!firestore || !authUser || !teacher?.subjectId) return null;
    // This query finds all users where the `linkedTeachers` map contains a key matching the teacher's subjectId,
    // and the value for that key is the teacher's UID.
    return query(collection(firestore, 'users'), where(`linkedTeachers.${teacher.subjectId}`, '==', authUser.uid));
  }, [firestore, authUser, teacher?.subjectId]);
  const { data: students, isLoading: areStudentsLoading } = useCollection<UserType>(linkedStudentsQuery);
  
  // Get all levels to display student's level name
  const levelsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'levels') : null, [firestore]);
  const { data: levels, isLoading: areLevelsLoading } = useCollection<Level>(levelsQuery);
  
  const levelsMap = useMemo(() => {
    if (!levels) return {};
    return levels.reduce((acc, level) => {
        acc[level.id] = level.name;
        return acc;
    }, {} as Record<string, string>);
  }, [levels]);

  const isLoading = isAuthLoading || isTeacherLoading || areStudentsLoading || areLevelsLoading;

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
                <TableHead>المستوى الدراسي</TableHead>
                <TableHead>الإجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({length: 3}).map((_, i) => (
                <TableRow key={i}>
                    <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-5 w-24" /></div></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-9 w-24" /></TableCell>
                </TableRow>
              ))}
              {!isLoading && students?.map(student => {
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
                        <TableCell>{student.levelId ? levelsMap[student.levelId] : 'غير محدد'}</TableCell>
                        <TableCell>
                            <Button asChild variant="outline" size="sm" disabled>
                                <Link href={`#`}>
                                    عرض الأداء
                                </Link>
                            </Button>
                        </TableCell>
                    </TableRow>
                )
              })}
              {!isLoading && students?.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
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
