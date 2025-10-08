'use client';

import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Lock, Unlock, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import type { Subject, Level, Stage, Lesson } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from 'react';

export default function SubjectContentPage({ params }: { params: { stageId: string; levelId: string; subjectId: string } }) {
  const { stageId, levelId: initialLevelId, subjectId } = params;
  const firestore = useFirestore();

  const [selectedLevelId, setSelectedLevelId] = useState(initialLevelId);

  const subjectRef = useMemoFirebase(() => firestore ? doc(firestore, 'subjects', subjectId) : null, [firestore, subjectId]);
  const stageRef = useMemoFirebase(() => firestore ? doc(firestore, 'stages', stageId) : null, [firestore, stageId]);
  const levelsInStageQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'levels'), where('stageId', '==', stageId)) : null, [firestore, stageId]);
  
  const lessonsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    let q = query(collection(firestore, 'lessons'), where('subjectId', '==', subjectId));
    if (selectedLevelId !== 'all-levels') {
        q = query(q, where('levelId', '==', selectedLevelId));
    }
    return q;
  }, [firestore, subjectId, selectedLevelId]);

  const { data: subject, isLoading: isLoadingSubject } = useDoc<Subject>(subjectRef);
  const { data: stage, isLoading: isLoadingStage } = useDoc<Stage>(stageRef);
  const { data: levels, isLoading: isLoadingLevels } = useCollection<Level>(levelsInStageQuery);
  const { data: lessons, isLoading: isLoadingLessons } = useCollection<Lesson>(lessonsQuery);

  const isLoading = isLoadingSubject || isLoadingStage || isLoadingLessons || isLoadingLevels;
  const currentLevelName = levels?.find(l => l.id === selectedLevelId)?.name;
  const pageTitle = selectedLevelId === 'all-levels' ? `كل دروس مادة: ${subject?.name || ''}` : `محتوى مادة: ${subject?.name || ''}`;
  const pageDescription = selectedLevelId === 'all-levels' 
    ? `عرض جميع الدروس في مادة ${subject?.name || ''} لكل المستويات.`
    : `عرض الدروس لمادة ${subject?.name || ''} - ${currentLevelName || ''}`;

  if (isLoading) {
    return (
        <div className="space-y-6">
            <PageHeader title={<Skeleton className="h-8 w-64" />}>
                <Skeleton className="h-10 w-24" />
            </PageHeader>
            <Skeleton className="h-4 w-80" />
            <div className="flex justify-end"><Skeleton className="h-10 w-48" /></div>
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

  if (!subject || !stage) {
    return <div>المادة أو المرحلة غير موجودة.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={pageTitle} description={pageDescription}>
        <Button variant="outline" asChild>
          <Link href="/dashboard/directeur/content">
            <ArrowRight className="ml-2 h-4 w-4" /> العودة
          </Link>
        </Button>
      </PageHeader>
      
      <div className="flex justify-between items-center">
        <Button variant="accent"><Plus className="ml-2 h-4 w-4" /> أضف درس</Button>
        <Select value={selectedLevelId} onValueChange={setSelectedLevelId}>
            <SelectTrigger className="w-full md:w-[220px]">
                <SelectValue placeholder="اختر المستوى الدراسي" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all-levels">كل المستويات</SelectItem>
                {levels?.map(level => (
                    <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>

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
                    <Link href={`/dashboard/directeur/content/${stageId}/${lesson.levelId}/${subjectId}/${lesson.id}`}>
                        عرض/تعديل
                    </Link>
                </Button>
              </div>
            ))}
             {lessons?.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                    {selectedLevelId === 'all-levels' ? 'لا توجد دروس في هذه المادة حتى الآن.' : 'لا توجد دروس في هذا المستوى حتى الآن.'}
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
