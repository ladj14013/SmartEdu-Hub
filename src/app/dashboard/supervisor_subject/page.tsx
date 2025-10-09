'use client';
import { useMemo } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookCopy, Users, GraduationCap, ArrowLeft, Loader2, BookLock } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import type { User as UserType, Lesson, Stage, Subject as SubjectType } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const StatCard = ({ title, value, description, icon: Icon, isLoading }: { title: string, value: string | number, description: string, icon: React.ElementType, isLoading: boolean }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <Skeleton className="h-8 w-1/2" />
        ) : (
            <>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </>
        )}
      </CardContent>
    </Card>
);

export default function SupervisorSubjectDashboard() {
    const firestore = useFirestore();
    const { user: authUser, isLoading: isAuthLoading } = useUser();

    // --- Data Fetching ---
    const supervisorRef = useMemoFirebase(() => (firestore && authUser) ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
    const { data: supervisor, isLoading: isSupervisorLoading } = useDoc<UserType>(supervisorRef);

    const stageRef = useMemoFirebase(() => (firestore && supervisor?.stageId) ? doc(firestore, 'stages', supervisor.stageId) : null, [firestore, supervisor?.stageId]);
    const { data: stage, isLoading: isStageLoading } = useDoc<Stage>(stageRef);

    const subjectRef = useMemoFirebase(() => (firestore && supervisor?.subjectId) ? doc(firestore, 'subjects', supervisor.subjectId) : null, [firestore, supervisor?.subjectId]);
    const { data: subject, isLoading: isSubjectLoading } = useDoc<SubjectType>(subjectRef);
    
    // teachersQuery is disabled to prevent permission errors
    const areTeachersLoading = false;
    const teachers = [];

    const mockPrivateLessonsCount = 12;
    const arePrivateLessonsLoading = false;

    // Query for public lessons created by this supervisor
    const publicLessonsQuery = useMemoFirebase(() => {
        if (!firestore || !authUser || !supervisor?.subjectId) return null;
        return query(
            collection(firestore, 'lessons'),
            where('authorId', '==', authUser.uid),
            where('subjectId', '==', supervisor.subjectId),
            where('type', '==', 'public')
        );
    }, [firestore, authUser, supervisor]);
    const { data: publicLessons, isLoading: arePublicLessonsLoading } = useCollection<Lesson>(publicLessonsQuery);
    
    const isLoading = isAuthLoading || isSupervisorLoading || isStageLoading || isSubjectLoading || arePublicLessonsLoading || areTeachersLoading;
    
    const supervisorName = supervisor?.name || '...';
    const subjectName = subject?.name || '...';
    const stageName = stage?.name || '...';

  return (
    <div className="space-y-6">
      <PageHeader
        title="لوحة تحكم مشرف المادة"
        description={isLoading ? 'جاري تحميل البيانات...' : `مرحباً ${supervisorName}، أنت تشرف على مادة ${subjectName} ل${stageName}.`}
      />

      <div className="grid gap-6 md:grid-cols-2">
         <Card className="hover:bg-muted/50 transition-colors">
            <Link href="/dashboard/supervisor_subject/teachers">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>متابعة الأساتذة</CardTitle>
                        <ArrowLeft className="h-5 w-5 text-primary" />
                    </div>
                    <CardDescription>عرض الدروس الخاصة بالأساتذة الذين تشرف عليهم وتقديم ملاحظات.</CardDescription>
                </CardHeader>
            </Link>
        </Card>
        <Card className="hover:bg-muted/50 transition-colors">
            <Link href="/dashboard/supervisor_subject/content">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>إدارة المحتوى العام</CardTitle>
                        <ArrowLeft className="h-5 w-5 text-primary" />
                    </div>
                    <CardDescription>إضافة وتعديل الدروس العامة للمادة التي تشرف عليها.</CardDescription>
                </CardHeader>
            </Link>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <StatCard 
            title="الدروس العامة" 
            value={publicLessons?.length ?? 0}
            description="درساً قمت بإنشائه"
            icon={BookCopy}
            isLoading={isLoading}
        />
         <StatCard 
            title="الدروس الخاصة" 
            value={mockPrivateLessonsCount}
            description="دروس أنشأها الأساتذة"
            icon={BookLock}
            isLoading={arePrivateLessonsLoading}
        />
      </div>
    </div>
  );
}
