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


export default function TeacherDashboard() {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user: authUser, isLoading: isAuthLoading } = useUser();

  // --- Data Fetching ---
  const teacherRef = useMemoFirebase(() => (firestore && authUser) ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: teacher, isLoading: isTeacherLoading, refetch } = useDoc<UserType>(teacherRef);

  const stageRef = useMemoFirebase(() => (firestore && teacher?.stageId) ? doc(firestore, 'stages', teacher.stageId) : null, [firestore, teacher?.stageId]);
  const { data: stage, isLoading: isStageLoading } = useDoc<Stage>(stageRef);

  const subjectRef = useMemoFirebase(() => (firestore && teacher?.subjectId) ? doc(firestore, 'subjects', teacher.subjectId) : null, [firestore, teacher?.subjectId]);
  const { data: subject, isLoading: isSubjectLoading } = useDoc<SubjectType>(subjectRef);

  const privateLessonsQuery = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return query(collection(firestore, 'lessons'), where('authorId', '==', authUser.uid), where('type', '==', 'private'));
  }, [firestore, authUser]);
  const { data: privateLessons, isLoading: areLessonsLoading } = useCollection<Lesson>(privateLessonsQuery);

  const linkedStudentsQuery = useMemoFirebase(() => {
    if (!firestore || !authUser || !teacher?.subjectId) return null;
    return query(collection(firestore, 'users'), where(`linkedTeachers.${teacher.subjectId}`, '==', authUser.uid));
  }, [firestore, authUser, teacher?.subjectId]);
  const { data: linkedStudents, isLoading: areStudentsLoading } = useCollection<UserType>(linkedStudentsQuery);

  const isLoading = isAuthLoading || isTeacherLoading || isStageLoading || isSubjectLoading || areLessonsLoading || areStudentsLoading;

  const handleCopy = () => {
    if (!teacher?.teacherCode) return;
    navigator.clipboard.writeText(teacher.teacherCode);
    setCopied(true);
    toast({ title: "تم نسخ الكود بنجاح!" });
    setTimeout(() => setCopied(false), 2000);
  };
  
  const generateTeacherCode = async () => {
    if (!firestore || !authUser) return;
    setIsGenerating(true);
    try {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const teacherDocRef = doc(firestore, 'users', authUser.uid);
        await updateDoc(teacherDocRef, { teacherCode: code });
        refetch(); // Refetch teacher data to get the new code
        toast({ title: "تم توليد الكود بنجاح", description: `الكود الجديد هو: ${code}` });
    } catch (error) {
        console.error("Error generating teacher code:", error);
        toast({ title: "فشل توليد الكود", variant: "destructive" });
    } finally {
        setIsGenerating(false);
    }
  }

  const teacherCode = teacher?.teacherCode;
  const teacherName = teacher?.name || '...';
  const subjectName = subject?.name || '...';
  const stageName = stage?.name || '...';

  return (
    <div className="space-y-6">
      <PageHeader
        title={isLoading ? <Skeleton className="h-8 w-48" /> : `مرحباً بك أستاذ: ${teacherName}`}
        description={isLoading ? <Skeleton className="h-4 w-72 mt-2" /> : `أنت تدرس مادة ${subjectName} لـ ${stageName}.`}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>كود الربط مع التلاميذ</CardTitle>
                <CardDescription>شارك هذا الكود مع تلاميذك لربطهم بحسابك.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4 p-4 bg-muted rounded-b-lg">
                {isLoading ? <Skeleton className="h-10 w-full" /> : (
                    <>
                        {teacherCode ? (
                            <>
                                <Button onClick={generateTeacherCode} variant="ghost" size="icon" disabled={isGenerating}>
                                    {isGenerating ? <Loader2 className="h-5 w-5 animate-spin"/> : <RefreshCw className="h-5 w-5" />}
                                    <span className="sr-only">توليد كود جديد</span>
                                </Button>
                                <p className="text-2xl font-mono font-bold text-primary flex-1 text-center">{teacherCode}</p>
                                <Button onClick={handleCopy} variant="ghost" size="icon" disabled={!teacherCode}>
                                    {copied ? <ClipboardCheck className="h-5 w-5 text-green-500" /> : <Clipboard className="h-5 w-5" />}
                                    <span className="sr-only">نسخ الكود</span>
                                </Button>
                            </>
                        ) : (
                            <Button onClick={generateTeacherCode} disabled={isGenerating} className='w-full'>
                                {isGenerating ? <Loader2 className="h-4 w-4 ml-2 animate-spin" /> : <Wand2 className="h-4 w-4 ml-2" />}
                                توليد كود
                            </Button>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
        <Card className="hover:bg-muted/50 transition-colors">
            <Link href="/dashboard/teacher/subjects" className="flex flex-col justify-center h-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>إدارة المحتوى</CardTitle>
                        <ArrowLeft className="h-5 w-5 text-primary" />
                    </div>
                    <CardDescription>إضافة وتعديل دروسك الخاصة والاطلاع على الدروس العامة.</CardDescription>
                </CardHeader>
            </Link>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عدد الطلاب</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{linkedStudents?.length ?? 0}</div>}
            <p className="text-xs text-muted-foreground">طالب مرتبط بك</p>
          </CardContent>
        </Card>
        <Link href="/dashboard/teacher/subjects">
            <Card className="hover:bg-muted/50 transition-colors h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الدروس الخاصة</CardTitle>
                <Presentation className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{privateLessons?.length ?? 0}</div>}
                <p className="text-xs text-muted-foreground">دروس قمت بإنشائها</p>
            </CardContent>
            </Card>
        </Link>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط الأداء</CardTitle>
            <div className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">82%</div>}
            <p className="text-xs text-muted-foreground">(عنصر نائب)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
