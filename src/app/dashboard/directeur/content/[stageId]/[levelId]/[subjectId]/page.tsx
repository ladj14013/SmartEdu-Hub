import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSubjectById, getLessonsBySubject, getLevelById, getStageById } from '@/lib/data';
import { ArrowRight, Lock, Unlock } from 'lucide-react';
import Link from 'next/link';

export default function SubjectContentPage({ params }: { params: { stageId: string; levelId: string; subjectId: string } }) {
  const subject = getSubjectById(params.subjectId);
  const level = getLevelById(params.levelId);
  const stage = getStageById(params.stageId);
  const lessons = getLessonsBySubject(params.subjectId);

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
            {lessons.map((lesson) => (
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
                    <Link href={`/dashboard/directeur/content/${params.stageId}/${params.levelId}/${params.subjectId}/${lesson.id}`}>
                        عرض/تعديل
                    </Link>
                </Button>
              </div>
            ))}
             {lessons.length === 0 && (
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
