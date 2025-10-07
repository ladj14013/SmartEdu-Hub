import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { getLessonById, getUserById, supervisorNotes } from '@/lib/data';
import { ArrowRight, Send, UserCircle } from 'lucide-react';
import Link from 'next/link';

export default function ReviewLessonPage({ params }: { params: { teacherId: string, lessonId: string } }) {
  const lesson = getLessonById(params.lessonId);
  const teacher = getUserById(params.teacherId);
  const notes = supervisorNotes.filter(n => n.lessonId === params.lessonId);

  if (!lesson || !teacher) {
    return <div>الدرس أو الأستاذ غير موجود.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="عرض محتوى الدرس"
        description={`مراجعة درس "${lesson.title}" للأستاذ ${teacher.name}`}
      >
        <Button variant="outline" asChild>
          <Link href={`/dashboard/supervisor_subject/teachers/${params.teacherId}`}>
            <ArrowRight className="ml-2 h-4 w-4" /> العودة لدروس الأستاذ
          </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            {/* Lesson Details */}
            <Card>
                <CardHeader>
                    <CardTitle>{lesson.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-wrap">{lesson.content}</p>
                    {lesson.videoUrl && (
                        <div className="mt-4">
                            <iframe
                                className="w-full aspect-video rounded-lg"
                                src={lesson.videoUrl}
                                title="YouTube video player"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    )}
                </CardContent>
            </Card>
            {/* Exercises */}
            <Card>
                <CardHeader><CardTitle>التمارين</CardTitle></CardHeader>
                <CardContent className='space-y-4'>
                    {lesson.exercises.map((exercise, index) => (
                        <div key={exercise.id} className="p-4 border rounded-md bg-muted/30">
                            <p className="font-semibold">تمرين {index + 1}: {exercise.question}</p>
                            <p className="text-sm text-muted-foreground mt-1">الإجابة النموذجية: {exercise.modelAnswer}</p>
                        </div>
                    ))}
                    {lesson.exercises.length === 0 && <p className="text-muted-foreground">لا توجد تمارين في هذا الدرس.</p>}
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>ملاحظات المشرف</CardTitle>
                    <CardDescription>اترك ملاحظة خاصة للأستاذ على هذا الدرس.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4">
                        <Textarea placeholder="اكتب ملاحظاتك هنا..." />
                        <Button variant="accent" className="w-full">
                            <Send className="ml-2 h-4 w-4" /> إرسال الملاحظات
                        </Button>
                    </form>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>الملاحظات السابقة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {notes.map(note => {
                        const author = getUserById(note.authorId);
                        return (
                            <div key={note.id} className="flex gap-3">
                                <UserCircle className="h-5 w-5 text-muted-foreground mt-1" />
                                <div className='flex-1'>
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold text-sm">{author?.name || 'مشرف'}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(note.timestamp).toLocaleDateString('ar-EG')}</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{note.content}</p>
                                </div>
                            </div>
                        )
                    })}
                    {notes.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center">لا توجد ملاحظات سابقة.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
