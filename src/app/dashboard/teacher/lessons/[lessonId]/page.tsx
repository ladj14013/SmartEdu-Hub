import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { getLessonById } from '@/lib/data';
import { ArrowRight, Plus, Save, Trash2, Info } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function EditViewLessonPage({ params }: { params: { lessonId: string } }) {
  const lesson = getLessonById(params.lessonId);
  const teacherId = 'user-4'; // Mock teacher ID

  if (!lesson) {
    return <div>الدرس غير موجود.</div>;
  }
  
  const isPrivate = lesson.type === 'private' && lesson.authorId === teacherId;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isPrivate ? "تعديل محتوى الدرس" : "عرض محتوى الدرس"}
        description={`أنت تقوم ب${isPrivate ? 'تعديل' : 'عرض'} درس "${lesson.title}"`}
      >
        <div className="flex gap-2">
            <Button variant="outline" asChild>
                <Link href={`/dashboard/teacher/subjects`}>
                    <ArrowRight className="ml-2 h-4 w-4" /> العودة
                </Link>
            </Button>
            {isPrivate && (
                <Button variant="accent">
                    <Save className="ml-2 h-4 w-4" /> حفظ كل التغييرات
                </Button>
            )}
        </div>
      </PageHeader>

      {!isPrivate && (
        <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>درس عام</AlertTitle>
            <AlertDescription>
                هذا الدرس هو محتوى عام مقدم من المشرفين. يمكنك عرضه فقط ولا يمكنك تعديله.
            </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader><CardTitle>تفاصيل الدرس</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">عنوان الدرس</Label>
                        <Input id="title" defaultValue={lesson.title} readOnly={!isPrivate} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="content">المحتوى</Label>
                        <Textarea id="content" defaultValue={lesson.content} rows={8} readOnly={!isPrivate} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>التمارين</CardTitle>
                    {isPrivate && (
                        <Button variant="outline" size="sm">
                            <Plus className="ml-2 h-4 w-4" /> أضف تمرين
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    {lesson.exercises.map((exercise, index) => (
                        <Card key={exercise.id} className="bg-muted/50">
                            <CardHeader className="flex flex-row items-center justify-between p-4">
                                <h4 className="font-semibold">تمرين {index + 1}</h4>
                                {isPrivate && (
                                    <Button variant="ghost" size="icon" className="text-red-500">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4 p-4 pt-0">
                                <div className="space-y-2">
                                    <Label htmlFor={`q-${exercise.id}`}>السؤال</Label>
                                    <Textarea id={`q-${exercise.id}`} defaultValue={exercise.question} readOnly={!isPrivate} />
                                </div>
                                {isPrivate && (
                                     <div className="space-y-2">
                                        <Label htmlFor={`a-${exercise.id}`}>الإجابة النموذجية</Label>
                                        <Textarea id={`a-${exercise.id}`} defaultValue={exercise.modelAnswer} readOnly={!isPrivate} />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                    {lesson.exercises.length === 0 && <p className="text-center text-muted-foreground py-4">لا توجد تمارين.</p>}
                </CardContent>
            </Card>
        </div>
        {isPrivate && (
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader><CardTitle>إعدادات الدرس</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="lesson-lock" className="font-medium">قفل الدرس</Label>
                            <Switch id="lesson-lock" defaultChecked={lesson.isLocked} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}
      </div>
    </div>
  );
}
