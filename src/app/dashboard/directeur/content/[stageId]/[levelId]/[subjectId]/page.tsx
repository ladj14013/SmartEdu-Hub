'use client';

import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Lock, Unlock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import type { Subject, Level, Stage, Lesson } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function SubjectContentPage({ params }: { params: { stageId: string; levelId: string; subjectId: string } }) {
  const { stageId, levelId, subjectId } = params;
  const firestore = useFirestore();

  const subjectRef = useMemoFirebase(() => firestore ? doc(firestore, 'subjects', subjectId) : null, [firestore, subjectId]);
  const levelRef = useMemoFirebase(() => firestore ? doc(firestore, 'levels', levelId) : null, [firestore, levelId]);
  const stageRef = useMemoFirebase(() => firestore ? doc(firestore, 'stages', stageId) : null, [firestore, stageId]);
  
  const lessonsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'lessons'), where('subjectId', '==', subjectId));
  }, [firestore, subjectId]);

  const { data: subject, isLoading: isLoadingSubject } = useDoc<Subject>(subjectRef);
  const { data: level, isLoading: isLoadingLevel } = useDoc<Level>(levelRef);
  const { data: stage, isLoading: isLoadingStage } = useDoc<Stage>(stageRef);
  const { data: lessons, isLoading: isLoadingLessons } = useCollection<Lesson>(lessonsQuery);

  const isLoading = isLoadingSubject || isLoadingLevel || isLoadingStage || isLoadingLessons;

  if (isLoading) {
    return (
        <div className="space-y-6">
            <PageHeader
                title={<Skeleton className="h-8 w-64" />}
                description={<Skeleton className="h-4 w-80 mt-2" />}
            >
                <Skeleton className="h-10 w-24" />
            </PageHeader>
            <Card>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-6 w-40" />
                                    <Skeleton className="h-6 w-16" />
                                    <Skeleton className="h-6 w-20" />
                                </div>
                                <Skeleton className="h-8 w-24" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
  }

  if (!subject || !level || !stage) {
    return <div>المادة أو المستوى أو المرحلة غير موجودة.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`محتوى مادة: ${subject.name}`}
        description={`عرض الدروس لمادة ${subject.name} - ${level.name} - ${stage.name}`}
      >
        <Button variant="outline" asChild>
          <Link href="/dashboard/directeur/content">
            <ArrowRight className="ml-2 h-4 w-4" /> العودة
          </Link>
        </Button>
      </PageHeader>
      
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {lessons?.map((lesson) => (
              <div key={lesson.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                <div className="flex items-center gap-4">
                    <span className="font-medium">{lesson.title}</span>
                    <Badge variant={lesson.type === 'public' ? 'secondary' : 'default'}>
                        {lesson.type === 'public' ? 'عام' : 'خاص'}
                    </Badge>
                    <Badge variant={lesson.isLocked ? 'destructive' : 'outline'}>
                        {lesson.isLocked ? <Lock className="h-3 w-3 ml-1" /> : <Unlock className="h-3 w-3 ml-1" />}
                        {lesson.isLocked ? 'مقفل' : 'مفتوح'}
                    </Badge>
                </div>
                <Button asChild variant="ghost" size="sm">
                    <Link href={`/dashboard/directeur/content/${stageId}/${levelId}/${subjectId}/${lesson.id}`}>
                        عرض/تعديل
                    </Link>
                </Button>
              </div>
            ))}
             {lessons?.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                    لا توجد دروس في هذه المادة حتى الآن.
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
