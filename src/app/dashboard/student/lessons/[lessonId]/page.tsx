
'use client';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BookOpen, Loader2, FileText, User } from 'lucide-react';
import Link from 'next/link';
import { ExerciseEvaluator } from '../../components/exercise-evaluator';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Lesson, User as UserType } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';
import React from 'react';

// Component to fetch and display teacher's name using useDoc, enabled by security rules
function LessonAuthorInfo({ authorId }: { authorId: string | undefined }) {
  const firestore = useFirestore();
  const authorRef = useMemoFirebase(() => (firestore && authorId) ? doc(firestore, 'users', authorId) : null, [firestore, authorId]);
  const { data: author, isLoading } = useDoc<UserType>(authorRef);

  if (isLoading || !author) {
    return <Skeleton className="h-5 w-40 mt-2" />;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
      <User className="h-4 w-4" />
      <span>بواسطة الأستاذ: {author.name}</span>
    </div>
  );
}


export default function StudentLessonPage() {
  const params = useParams();
  const lessonId = Array.isArray(params.lessonId) ? params.lessonId[0] : params.lessonId;
  const firestore = useFirestore();
  const lessonRef = useMemoFirebase(() => firestore && lessonId ? doc(firestore, 'lessons', lessonId) : null, [firestore, lessonId]);
  const { data: lesson, isLoading } = useDoc<Lesson>(lessonRef);

  if (isLoading) {
    return (
       <div className="space-y-6">
        <PageHeader title={<Skeleton className="h-8 w-64" />}><div className='flex gap-2'><Skeleton className="h-10 w-36" /></div></PageHeader>
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle><Skeleton className="h-6 w-32" /></CardTitle></CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
             <Card>
              <CardHeader><CardTitle><Skeleton className="h-6 w-32" /></CardTitle></CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
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
       {lesson.type === 'private' && (
         <LessonAuthorInfo authorId={lesson.authorId} />
       )}

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
                     {lesson.pdfUrl && (
                        <div className="mt-6">
                            <Button asChild variant="secondary" className='w-full'>
                                <Link href={lesson.pdfUrl} target="_blank" rel="noopener noreferrer">
                                    <FileText className="ml-2 h-4 w-4" />
                                    فتح ملف الدرس (PDF)
                                </Link>
                            </Button>
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
