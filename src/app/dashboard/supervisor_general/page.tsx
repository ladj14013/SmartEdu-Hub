'use client';
import { useMemo } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, BookCopy, GraduationCap, UserCheck, Users } from 'lucide-react';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import type { User, Lesson, Subject } from '@/lib/types';
import { collection, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function SupervisorGeneralDashboard() {
  const firestore = useFirestore();
  const { user: authUser } = useUser();

  const supervisorRef = useMemoFirebase(() => (firestore && authUser) ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: supervisor } = useDoc<User>(supervisorRef);

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
        title="لوحة تحكم المشرف العام"
        description={`مرحباً ${supervisor?.name || '...'}، يمكنك من هنا متابعة أداء المنصة.`}
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="إجمالي الطلاب" value={stats.students} icon={Users} isLoading={isLoadingUsers} />
        <StatCard title="إجمالي المعلمين" value={stats.teachers} icon={UserCheck} isLoading={isLoadingUsers} />
        <StatCard title="إجمالي المواد" value={totalSubjects} icon={GraduationCap} isLoading={isLoadingSubjects} />
        <StatCard title="إجمالي الدروس" value={totalLessons} icon={BookCopy} isLoading={isLoadingLessons} />
      </div>

       <Card>
        <CardHeader>
          <CardTitle>تقرير الأداء العام</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <BarChart className="mx-auto h-12 w-12" />
            <p>مساحة لعرض تقارير ومكونات خاصة بالمشرف العام مستقبلاً.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
