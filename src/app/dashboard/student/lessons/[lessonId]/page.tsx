'use client';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BookOpen, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ExerciseEvaluator } from '../../components/exercise-evaluator';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Lesson } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentLessonPage({ params }: { params: { lessonId: string } }) {
  const firestore = useFirestore();
  const lessonRef = useMemoFirebase(() => firestore ? doc(firestore, 'lessons', params.lessonId) : null, [firestore, params.lessonId]);
  const { data: lesson, isLoading } = useDoc<Lesson>(lessonRef);

  if (isLoading) {
    return (
       <div className="space-y-6">
        <PageHeader title={<Skeleton className="h-8 w-64" />}>
            <Skeleton className="h-10 w-36" />
        </PageHeader>
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader><CardTitle><Skeleton className="h-6 w-32" /></CardTitle></CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-48 w-full mt-6" />
              </CardContent>
            </Card>
          </div>
           <div className="lg:col-span-1">
            <Card>
              <CardHeader><CardTitle><Skeleton className="h-6 w-48" /></CardTitle></CardHeader>
              <CardContent><Skeleton className="h-64 w-full" /></CardContent>
            </Card>
           </div>
         </div>
       </div>
    )
  }

  if (!lesson) {
    return <div>الدرس غير موجود.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={lesson.title}>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/student/subjects/${lesson.subjectId}`}>
            <ArrowRight className="ml-2 h-4 w-4" /> العودة للدروس
          </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader className="flex-row items-center gap-2 space-y-0">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <CardTitle>محتوى الدرس</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-wrap text-muted-foreground">{lesson.content}</p>
                    {lesson.videoUrl && (
                        <div className="mt-6">
                            <iframe
                                className="w-full aspect-video rounded-lg"
                                src={lesson.videoUrl.replace('watch?v=', 'embed/')}
                                title="YouTube video player"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1">
            <ExerciseEvaluator lesson={lesson} />
        </div>
      </div>
    </div>
  );
}
