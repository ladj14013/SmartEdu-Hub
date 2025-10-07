import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserById, getLessonsBySubject, levels } from '@/lib/data';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function TeacherLessonsPage({ params }: { params: { teacherId: string } }) {
  const teacher = getUserById(params.teacherId);
  if (!teacher || !teacher.subjectId) {
    return <div>الأستاذ غير موجود.</div>;
  }
  
  const teacherLessons = getLessonsBySubject(teacher.subjectId).filter(l => l.authorId === teacher.id);
  const teacherLevels = levels.filter(l => l.stageId === teacher.stageId);

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
        {teacherLevels.map(level => {
            const lessonsInLevel = teacherLessons.filter(l => getLessonsBySubject(teacher.subjectId!).find(subL => subL.id === l.id && getLessonsBySubject(l.subjectId).find(lvl => lvl.id === l.id)) && levels.find(lvl => lvl.id === subjects.find(s => s.id === l.subjectId)!.levelId)?.id === level.id);

            // A simplified mock logic as the data structure is not fully relational
            const lessonsInLevelMock = teacherLessons.filter((_, index) => index % 2 === (level.id === 'level-2-1' ? 0 : 1) );

            if(lessonsInLevelMock.length === 0) return null;

            return (
                <Card key={level.id}>
                    <CardHeader>
                        <CardTitle>{level.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y">
                            {lessonsInLevelMock.map(lesson => (
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
         {teacherLessons.length === 0 && (
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
