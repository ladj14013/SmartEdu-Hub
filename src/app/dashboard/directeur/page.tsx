
'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, BookCopy, GraduationCap, UserCheck, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { User, Lesson, Subject } from '@/lib/types';

const StatCard = ({ title, value, icon: Icon, isLoading }: { title: string, value: number, icon: React.ElementType, isLoading: boolean }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className="h-8 w-1/2" />
      ) : (
        <div className="text-2xl font-bold">{value}</div>
      )}
    </CardContent>
  </Card>
);


export default function DirecteurDashboard() {
  const firestore = useFirestore();

  const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const lessonsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'lessons') : null, [firestore]);
  const subjectsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'subjects') : null, [firestore]);

  const { data: usersData, isLoading: isLoadingUsers } = useCollection<User>(usersQuery);
  const { data: lessonsData, isLoading: isLoadingLessons } = useCollection<Lesson>(lessonsQuery);
  const { data: subjectsData, isLoading: isLoadingSubjects } = useCollection<Subject>(subjectsQuery);

  const stats = useMemo(() => {
    if (!usersData) {
      return { students: 0, teachers: 0 };
    }
    const students = usersData.filter(u => u.role === 'student').length;
    const teachers = usersData.filter(u => u.role === 'teacher').length;
    return { students, teachers };
  }, [usersData]);

  const totalLessons = lessonsData?.length ?? 0;
  const totalSubjects = subjectsData?.length ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="لوحة تحكم المدير"
        description="مرحباً بعودتك، إليك نظرة عامة على المنصة."
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="إجمالي الطلاب" value={stats.students} icon={Users} isLoading={isLoadingUsers} />
        <StatCard title="إجمالي المعلمين" value={stats.teachers} icon={UserCheck} isLoading={isLoadingUsers} />
        <StatCard title="إجمالي المواد" value={totalSubjects} icon={GraduationCap} isLoading={isLoadingSubjects} />
        <StatCard title="إجمالي الدروس" value={totalLessons} icon={BookCopy} isLoading={isLoadingLessons} />
      </div>

       <div className="grid gap-6 md:grid-cols-1">
            <Card>
                <CardHeader>
                <CardTitle>نشاط المستخدمين</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                    <BarChart className="mx-auto h-12 w-12" />
                    <p>مخطط بياني لنشاط المستخدمين (عنصر نائب)</p>
                </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
