'use client';

import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Presentation, Users, Clipboard, ClipboardCheck, ArrowLeft, Loader2, Wand2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useMemo, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, query, where, updateDoc } from 'firebase/firestore';
import type { User as UserType, Lesson, Stage, Subject as SubjectType } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { v4 as uuidv4 } from 'uuid';


function TeacherDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeader
        title={<Skeleton className="h-8 w-48" />}
        description={<Skeleton className="h-4 w-72 mt-2" />}
      />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
        <Card className="hover:bg-muted/50 transition-colors">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </CardHeader>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    </div>
  );
}

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

export default function TeacherDashboard() {
  const [isClient, setIsClient] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user: authUser, isLoading: isAuthLoading } = useUser();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- Data Fetching ---
  const teacherRef = useMemoFirebase(
    () => (firestore && authUser) ? doc(firestore, 'users', authUser.uid) : null,
    [firestore, authUser]
  );
  const { data: teacher, isLoading: isTeacherLoading, refetch } = useDoc<UserType>(teacherRef);

  const stageRef = useMemoFirebase(
    () => (firestore && teacher?.stageId) ? doc(firestore, 'stages', teacher.stageId) : null,
    [firestore, teacher?.stageId]
  );
  const { data: stage, isLoading: isStageLoading } = useDoc<Stage>(stageRef);

  const subjectRef = useMemoFirebase(
    () => (firestore && teacher?.subjectId) ? doc(firestore, 'subjects', teacher.subjectId) : null,
    [firestore, teacher?.subjectId]
  );
  const { data: subject, isLoading: isSubjectLoading } = useDoc<SubjectType>(subjectRef);

  const privateLessonsQuery = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return query(collection(firestore, 'lessons'), where('authorId', '==', authUser.uid), where('type', '==', 'private'));
  }, [firestore, authUser]);
  const { data: privateLessons, isLoading: areLessonsLoading } = useCollection<Lesson>(privateLessonsQuery);

  const isLoading =
    isAuthLoading || isTeacherLoading || isStageLoading || isSubjectLoading || areLessonsLoading;


  if (!isClient || isLoading) {
    return <TeacherDashboardSkeleton />;
  }

  const teacherName = teacher?.name || 'أستاذ';
  const subjectName = subject?.name || 'مادة';
  const stageName = stage?.name || 'مرحلة';


  return (
    <div className="space-y-6" suppressHydrationWarning>
      <PageHeader
        title={
            <span>
                مرحباً بك أستاذ: <span className="text-primary font-bold">{teacherName}</span>
            </span>
        }
        description={
            <span>
                أنت تدرس مادة <span className="text-primary font-semibold">{subjectName}</span> لـ <span className="text-primary font-semibold">{stageName}</span>.
            </span>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
         <Card>
          <CardHeader>
            <CardTitle>إدارة المحتوى</CardTitle>
            <CardDescription>إضافة وتعديل دروسك الخاصة والاطلاع على الدروس العامة.</CardDescription>
          </CardHeader>
          <CardContent>
             <Button asChild className='w-full' variant="accent">
               <Link href="/dashboard/teacher/subjects">
                 الانتقال لإدارة الدروس
                 <ArrowLeft className="mr-2 h-4 w-4" />
               </Link>
             </Button>
          </CardContent>
        </Card>
        <Card className="hover:bg-muted/50 transition-colors">
          <Link href="/dashboard/teacher/students" className="flex flex-col justify-center h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>قائمة الطلاب</CardTitle>
                <ArrowLeft className="h-5 w-5 text-primary" />
              </div>
              <CardDescription>عرض الطلاب المرتبطين بك ومتابعة أدائهم.</CardDescription>
            </CardHeader>
          </Link>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
            title="الطلاب"
            value={'N/A'}
            description="ميزة الارتباط معطلة حالياً"
            icon={Users}
            isLoading={false}
        />
        <StatCard
            title="الدروس الخاصة"
            value={privateLessons?.length ?? 0}
            description="دروس قمت بإنشائها"
            icon={Presentation}
            isLoading={isLoading}
        />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط الأداء</CardTitle>
            <div className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82%</div>
            <p className="text-xs text-muted-foreground">(عنصر نائب)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
