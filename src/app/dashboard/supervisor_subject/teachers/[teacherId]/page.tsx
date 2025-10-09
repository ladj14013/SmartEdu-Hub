'use client';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import type { User as UserType, Lesson } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';

export default function TeacherLessonsPage() {
  const params = useParams();
  const teacherId = params.teacherId as string;
  const firestore = useFirestore();

  // --- Data Fetching ---
  const teacherRef = useMemoFirebase(() => firestore ? doc(firestore, 'users', teacherId) : null, [firestore, teacherId]);
  const { data: teacher, isLoading: isTeacherLoading } = useDoc<UserType>(teacherRef);

  const teacherLessonsQuery = useMemoFirebase(() => {
    if (!firestore || !teacher?.id) return null;
    return query(collection(firestore, 'lessons'), where('authorId', '==', teacher.id));
  }, [firestore, teacher]);

  const { data: teacherLessons, isLoading: areLessonsLoading } = useCollection<Lesson>(teacherLessonsQuery);

  const isLoading = isTeacherLoading || areLessonsLoading;
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title={<Skeleton className="h-8 w-80" />} description={<Skeleton className="h-4 w-96 mt-2"/>}>
          <Skeleton className="h-10 w-44" />
        </PageHeader>
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
      
      <Card>
          <CardHeader>
              <CardTitle>قائمة الدروس</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="divide-y">
                  {teacherLessons && teacherLessons.length > 0 ? (
                      teacherLessons.map(lesson => (
                          <Link
                              key={lesson.id}
                              href={`/dashboard/supervisor_subject/teachers/${teacher.id}/lessons/${lesson.id}`}
                              className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-md"
                          >
                              <span className="font-medium">{lesson.title}</span>
                              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                          </Link>
                      ))
                  ) : (
                      <div className="p-8 text-center text-muted-foreground">
                          هذا الأستاذ لم يضف أي دروس خاصة بعد.
                      </div>
                  )}
              </div>
          </CardContent>
      </Card>
    </div>
  );
}
