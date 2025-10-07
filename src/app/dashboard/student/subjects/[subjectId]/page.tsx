import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getSubjectById, getLessonsBySubject, getUserById } from '@/lib/data';
import { ArrowRight, User, CheckCircle, Lock, PlayCircle } from 'lucide-react';
import Link from 'next/link';

export default function SubjectPage({ params }: { params: { subjectId: string } }) {
  const subject = getSubjectById(params.subjectId);
  // Mock student data, assuming they are linked to 'user-4'
  const student = getUserById('user-5');
  const teacher = student?.linkedTeacherId ? getUserById(student.linkedTeacherId) : null;
  const lessons = getLessonsBySubject(params.subjectId)
    .filter(l => l.type === 'public' || l.authorId === student?.linkedTeacherId);

  if (!subject) {
    return <div>المادة غير موجودة.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`مادة: ${subject.name}`}
        description={subject.description}
      >
        <Button variant="outline" asChild>
          <Link href="/dashboard/student/subjects">
            <ArrowRight className="ml-2 h-4 w-4" /> العودة للمواد
          </Link>
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>الربط مع الأستاذ</CardTitle>
          <CardDescription>أدخل كود الأستاذ الخاص بهذه المادة للوصول إلى دروسه الخاصة.</CardDescription>
        </CardHeader>
        <CardContent>
          {teacher ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 border-r-4 border-green-500 rounded-md">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-semibold">أنت مرتبط مع الأستاذ:</p>
                <p className="text-green-700">{teacher.name}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input placeholder="أدخل كود الأستاذ" className="flex-1" />
              <Button variant="accent">
                <User className="ml-2 h-4 w-4" /> ربط الحساب
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle>قائمة الدروس</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {lessons.map((lesson, index) => {
              const isCompleted = false; // Mock status
              const isAvailable = !lesson.isLocked;
              const lessonStatus = isCompleted ? 'completed' : (isAvailable ? 'available' : 'locked');
              
              const statusMap = {
                  completed: { icon: CheckCircle, text: 'مكتمل', color: 'text-green-500' },
                  available: { icon: PlayCircle, text: 'متاح', color: 'text-primary' },
                  locked: { icon: Lock, text: 'مقفل', color: 'text-muted-foreground' }
              }
              const { icon: Icon, text, color } = statusMap[lessonStatus];
              
              const Wrapper = isAvailable ? Link : 'div';

              return (
              <Wrapper key={lesson.id} href={isAvailable ? `/dashboard/student/lessons/${lesson.id}` : ''} className={`flex items-center justify-between p-4 ${isAvailable ? 'hover:bg-muted/50 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}>
                <div className="flex items-center gap-4">
                    <span className="font-medium">{lesson.title}</span>
                </div>
                <Badge variant="outline" className={`gap-2 ${color}`}>
                    <Icon className="h-4 w-4" />
                    {text}
                </Badge>
              </Wrapper>
            )})}
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
