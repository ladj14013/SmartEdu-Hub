'use client';

import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Presentation, Users, Clipboard, ClipboardCheck, ArrowLeft, Loader2, Wand2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, query, where, updateDoc } from 'firebase/firestore';
import type { User as UserType, Lesson, Stage, Subject as SubjectType } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';


function TeacherDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeader
        title={<Skeleton className="h-8 w-48" />}
        description={<Skeleton className="h-4 w-72 mt-2" />}
      />
       <Skeleton className="h-40 w-full" />
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
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user: authUser, isLoading: isAuthLoading } = useUser();

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

  const handleCopy = async () => {
    const codeToCopy = teacher?.teacherCode;
    if (!codeToCopy) return;

    try {
        // Modern method: Clipboard API
        await navigator.clipboard.writeText(codeToCopy);
        setCopied(true);
        toast({ title: 'تم نسخ الكود بنجاح!' });
        setTimeout(() => setCopied(false), 2000);
    } catch (err) {
        // Fallback method: execCommand
        try {
            const textArea = document.createElement('textarea');
            textArea.value = codeToCopy;
            // Make the textarea out of sight
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            setCopied(true);
            toast({ title: 'تم نسخ الكود بنجاح!' });
            setTimeout(() => setCopied(false), 2000);
        } catch (fallbackErr) {
            console.error('Failed to copy text with both methods: ', err, fallbackErr);
            toast({
                title: 'فشل النسخ',
                description: 'لم يتمكن المتصفح من نسخ الكود تلقائياً. الرجاء نسخه يدوياً.',
                variant: 'destructive',
            });
        }
    }
  };

  const handleGenerateCode = async () => {
    if (!teacherRef) return;
    setIsGenerating(true);
    const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    try {
      await updateDoc(teacherRef, { teacherCode: newCode });
      toast({ title: 'تم توليد كود جديد بنجاح!' });
      refetch(); // Refetch teacher data to display the new code
    } catch (error) {
      console.error('Error generating code:', error);
      toast({
        title: 'فشل توليد الكود',
        description: 'حدث خطأ أثناء محاولة تحديث الكود.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };


  if (isLoading) {
    return <TeacherDashboardSkeleton />;
  }

  const teacherName = teacher?.name || 'أستاذ';
  const subjectName = subject?.name || 'مادة';
  const stageName = stage?.name || 'مرحلة';
  const teacherCode = teacher?.teacherCode;


  return (
    <div className="space-y-6">
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
      
      <Card>
          <CardHeader>
             <div className="flex items-center justify-between">
                <CardTitle>كود الأستاذ</CardTitle>
                <Wand2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>شارك هذا الكود مع تلاميذك ليرتبطوا بك.</CardDescription>
          </CardHeader>
          <CardContent>
            {teacherCode ? (
                <div className="flex items-center justify-between gap-2 p-2 bg-muted rounded-md border border-dashed">
                    <span className="font-mono text-lg tracking-widest text-primary font-bold">{teacherCode}</span>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
                            {copied ? <ClipboardCheck className="text-green-500" /> : <Clipboard />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleGenerateCode} disabled={isGenerating}>
                            {isGenerating ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                        </Button>
                    </div>
                </div>
            ) : (
                <Button onClick={handleGenerateCode} className="w-full" disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Wand2 className="ml-2 h-4 w-4" />}
                    توليد كود
                </Button>
            )}
          </CardContent>
        </Card>

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

      <div className="grid gap-4 md:grid-cols-2">
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
      </div>
    </div>
  );
}
