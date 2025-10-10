
'use client';

import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Lock, Unlock, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where, orderBy } from 'firebase/firestore';
import type { Subject, Level, Stage, Lesson } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';
import React, { useMemo } from 'react';

// Function to group lessons by level ID
const groupLessonsByLevel = (lessons: Lesson[] | null, levels: Level[] | null) => {
    if (!lessons || !levels) return [];

    const levelMap = new Map(levels.map(level => [level.id, { ...level, lessons: [] as Lesson[] }]));

    lessons.forEach(lesson => {
        if (levelMap.has(lesson.levelId)) {
            levelMap.get(lesson.levelId)?.lessons.push(lesson);
        }
    });

    return Array.from(levelMap.values()).filter(level => level.lessons.length > 0);
};

export default function SubjectContentPage() {
  const params = useParams();
  const { stageId, subjectId } = params as { stageId: string; subjectId: string };
  const firestore = useFirestore();

  const subjectRef = useMemoFirebase(() => firestore ? doc(firestore, 'subjects', subjectId) : null, [firestore, subjectId]);
  const stageRef = useMemoFirebase(() => firestore ? doc(firestore, 'stages', stageId) : null, [firestore, stageId]);
  
  // Fetch all levels for the stage to create groupings
  const levelsInStageQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'levels'), where('stageId', '==', stageId), orderBy('order')) : null, [firestore, stageId]);
  
  // Fetch all lessons for the subject, ordered by level and title
  const lessonsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, 'lessons'), 
        where('subjectId', '==', subjectId),
        orderBy('levelId'),
        orderBy('title')
    );
  }, [firestore, subjectId]);

  const { data: subject, isLoading: isLoadingSubject } = useDoc<Subject>(subjectRef);
  const { data: stage, isLoading: isLoadingStage } = useDoc<Stage>(stageRef);
  const { data: levels, isLoading: isLoadingLevels } = useCollection<Level>(levelsInStageQuery);
  const { data: lessons, isLoading: isLoadingLessons } = useCollection<Lesson>(lessonsQuery);

  const groupedLessons = useMemo(() => groupLessonsByLevel(lessons, levels), [lessons, levels]);
  
  const isLoading = isLoadingSubject || isLoadingStage || isLoadingLessons || isLoadingLevels;

  if (isLoading) {
    return (
        <div className="space-y-6">
            <PageHeader title={<Skeleton className="h-8 w-64" />} description={<Skeleton className="h-4 w-80" />}><Skeleton className="h-10 w-24" /></PageHeader>
            <div className="flex justify-end"><Skeleton className="h-10 w-32" /></div>
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <Card><CardContent className="p-0"><div className="divide-y"><Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-full" /></div></CardContent></Card>
            </div>
             <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <Card><CardContent className="p-0"><div className="divide-y"><Skeleton className="h-14 w-full" /></div></CardContent></Card>
            </div>
        </div>
    );
  }

  if (!subject || !stage) {
    return <div>المادة أو المرحلة غير موجودة.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`محتوى مادة: ${subject.name}`} 
        description={`عرض جميع الدروس في مادة ${subject.name} مجمعة حسب المستوى الدراسي.`}
      >
        <Button variant="outline" asChild>
          <Link href="/dashboard/directeur/content">
            <ArrowRight className="ml-2 h-4 w-4" /> العودة للهيكل
          </Link>
        </Button>
      </PageHeader>
      
      <div className="flex justify-start">
        <Button variant="accent"><Plus className="ml-2 h-4 w-4" /> أضف درس</Button>
      </div>

      <div className="space-y-8">
        {groupedLessons.length > 0 ? (
            groupedLessons.map(level => (
                <div key={level.id}>
                    <h2 className="text-xl font-bold mb-3">{level.name}</h2>
                    <Card>
                        <CardContent className="p-0">
                        <div className="divide-y">
                            {level.lessons.map((lesson) => (
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
                                    <Link href={`/dashboard/directeur/content/${stageId}/${lesson.levelId}/${subjectId}/${lesson.id}`}>
                                        عرض/تعديل
                                    </Link>
                                </Button>
                            </div>
                            ))}
                        </div>
                        </CardContent>
                    </Card>
                </div>
            ))
        ) : (
             <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                    لا توجد دروس في هذه المادة حتى الآن.
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
