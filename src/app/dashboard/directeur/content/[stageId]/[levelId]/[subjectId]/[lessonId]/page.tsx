import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { getLessonById, getSubjectById } from '@/lib/data';
import { ArrowRight, Plus, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function EditLessonPage({ params }: { params: { subjectId: string; lessonId: string } }) {
  const lesson = getLessonById(params.lessonId);
  const subject = getSubjectById(params.subjectId);

  if (!lesson || !subject) {
    return <div>الدرس أو المادة غير موجود.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="تعديل محتوى الدرس"
        description={`أنت تقوم بتعديل درس "${lesson.title}"`}
      >
        <div className="flex gap-2">
            <Button variant="outline" asChild>
                <Link href={`/dashboard/directeur/content/${params.stageId}/${params.levelId}/${params.subjectId}`}>
                    <ArrowRight className="ml-2 h-4 w-4" /> العودة
                </Link>
            </Button>
            <Button variant="accent">
                <Save className="ml-2 h-4 w-4" /> حفظ كل التغييرات
            </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>تفاصيل الدرس</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">عنوان الدرس</Label>
                        <Input id="title" defaultValue={lesson.title} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="content">المحتوى</Label>
                        <Textarea id="content" defaultValue={lesson.content} rows={8} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="videoUrl">رابط الفيديو (اختياري)</Label>
                        <Input id="videoUrl" defaultValue={lesson.videoUrl} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>التمارين</CardTitle>
                    <Button variant="outline" size="sm">
                        <Plus className="ml-2 h-4 w-4" /> أضف تمرين
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {lesson.exercises.map((exercise, index) => (
                        <Card key={exercise.id} className="bg-muted/50">
                            <CardHeader className="flex flex-row items-center justify-between p-4">
                                <h4 className="font-semibold">تمرين {index + 1}</h4>
                                <Button variant="ghost" size="icon" className="text-red-500">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4 p-4 pt-0">
                                <div className="space-y-2">
                                    <Label htmlFor={`q-${exercise.id}`}>السؤال</Label>
                                    <Textarea id={`q-${exercise.id}`} defaultValue={exercise.question} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`a-${exercise.id}`}>الإجابة النموذجية</Label>
                                    <Textarea id={`a-${exercise.id}`} defaultValue={exercise.modelAnswer} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {lesson.exercises.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">لا توجد تمارين مضافة.</p>
                    )}
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>إعدادات الدرس</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="lesson-lock" className="font-medium">
                            قفل الدرس
                            <p className="text-sm text-muted-foreground">لن يتمكن التلاميذ من الوصول للدرس المقفل.</p>
                        </Label>
                        <Switch id="lesson-lock" defaultChecked={lesson.isLocked} />
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
