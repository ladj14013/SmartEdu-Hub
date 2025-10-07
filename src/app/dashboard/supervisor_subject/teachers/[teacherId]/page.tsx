'use client';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import type { User as UserType, Lesson, Subject, Level } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function TeacherLessonsPage({ params }: { params: { teacherId: string } }) {
  const { teacherId } = params;
  const firestore = useFirestore();

  // --- Data Fetching ---
  const teacherRef = useMemoFirebase(() => firestore ? doc(firestore, 'users', teacherId) : null, [firestore, teacherId]);
  const { data: teacher, isLoading: isTeacherLoading } = useDoc<UserType>(teacherRef);

  const teacherLessonsQuery = useMemoFirebase(() => {
    if (!firestore || !teacher?.subjectId) return null;
    return query(collection(firestore, 'lessons'), where('subjectId', '==', teacher.subjectId), where('authorId', '==', teacherId));
  }, [firestore, teacher?.subjectId, teacherId]);
  const { data: teacherLessons, isLoading: areLessonsLoading } = useCollection<Lesson>(teacherLessonsQuery);

  const teacherLevelsQuery = useMemoFirebase(() => {
    if (!firestore || !teacher?.stageId) return null;
    return query(collection(firestore, 'levels'), where('stageId', '==', teacher.stageId));
  }, [firestore, teacher?.stageId]);
  const { data: teacherLevels, isLoading: areLevelsLoading } = useCollection<Level>(teacherLevelsQuery);
  
  const subjectsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'subjects') : null, [firestore]);
  const { data: subjects, isLoading: areSubjectsLoading } = useCollection<Subject>(subjectsQuery);

  const isLoading = isTeacherLoading || areLessonsLoading || areLevelsLoading || areSubjectsLoading;
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title={<Skeleton className="h-8 w-80" />}>
          <Skeleton className="h-10 w-44" />
        </PageHeader>
        <Skeleton className="h-4 w-96" />
        <Card><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
        <Card><CardContent className="p-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
      </div>
    );
  }

  if (!teacher) {
    return <div>الأستاذ غير موجود.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`الدروس المضافة من قبل الأستاذ: ${teacher.name}`}
        description="عرض ومراجعة الدروس التي أنشأها الأستاذ."
      >
        <Button variant="outline" asChild>
          <Link href="/dashboard/supervisor_subject/teachers">
            <ArrowRight className="ml-2 h-4 w-4" /> العودة لقائمة الأساتذة
          </Link>
        </Button>
      </PageHeader>
      
      <div className="space-y-6">
        {teacherLevels?.map(level => {
            const lessonsInLevel = teacherLessons?.filter(lesson => {
              const subject = subjects?.find(s => s.id === lesson.subjectId);
              return subject && subject.levelId === level.id;
            });

            if(!lessonsInLevel || lessonsInLevel.length === 0) return null;

            return (
                <Card key={level.id}>
                    <CardHeader>
                        <CardTitle>{level.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y">
                            {lessonsInLevel.map(lesson => (
                                <Link
                                    key={lesson.id}
                                    href={`/dashboard/supervisor_subject/teachers/${teacher.id}/lessons/${lesson.id}`}
                                    className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-md"
                                >
                                    <span className="font-medium">{lesson.title}</span>
                                    <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )
        })}
         {teacherLessons?.length === 0 && (
            <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                    هذا الأستاذ لم يضف أي دروس خاصة بعد.
                </CardContent>
            </Card>
         )}
      </div>
    </div>
  );
}
