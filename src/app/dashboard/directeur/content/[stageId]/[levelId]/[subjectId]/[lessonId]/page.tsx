'use client';

import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Plus, Save, Trash2, FileUp, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Lesson } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


export default function EditLessonPage({ params }: { params: { stageId: string; levelId: string; subjectId: string; lessonId: string } }) {
  const { stageId, levelId, subjectId, lessonId } = params;
  const firestore = useFirestore();

  const lessonRef = useMemoFirebase(() => firestore ? doc(firestore, 'lessons', lessonId) : null, [firestore, lessonId]);
  const { data: lesson, isLoading } = useDoc<Lesson>(lessonRef);

  if (isLoading) {
    return (
        <div className="space-y-6">
            <PageHeader title={<Skeleton className="h-8 w-56" />}><div className="flex gap-2"><Skeleton className="h-10 w-24" /><Skeleton className="h-10 w-36" /></div></PageHeader>
            <Skeleton className="h-4 w-72" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card><CardHeader><CardTitle><Skeleton className="h-6 w-32" /></CardTitle></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div><div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-20 w-full" /></div><div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div><div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div></CardContent></Card>
                    <Card><CardHeader><CardTitle><Skeleton className="h-6 w-24" /></CardTitle></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
                </div>
                <div className="lg:col-span-1"><Card><CardHeader><CardTitle><Skeleton className="h-6 w-32" /></CardTitle></CardHeader><CardContent><Skeleton className="h-12 w-full" /></CardContent></Card></div>
            </div>
        </div>
    );
  }

  if (!lesson) {
    return <div>الدرس غير موجود.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="تعديل محتوى الدرس"
        description={`أنت تقوم بتعديل درس "${lesson.title}"`}
      >
        <div className="flex gap-2">
            <Button variant="outline" asChild>
                <Link href={`/dashboard/directeur/content/${stageId}/${levelId}/${subjectId}`}>
                    <ArrowRight className="ml-2 h-4 w-4" /> العودة
                </Link>
            </Button>
            <Button variant="accent">
                <Save className="ml-2 h-4 w-4" /> حفظ كل التغييرات
            </Button>
        </div>
      </PageHeader>
      
      <Alert variant="destructive">
        <UploadCloud className="h-4 w-4" />
        <AlertTitle>ملاحظة حول رفع الملفات (قيد التطوير)</AlertTitle>
        <AlertDescription>
          حاليًا، ميزة الرفع المباشر للملفات غير مكتملة. لربط ملف PDF، يرجى رفعه أولاً على خدمة مثل Google Drive أو Dropbox، ثم انسخ **رابط المشاركة العام** والصقه في الحقل المخصص.
        </AlertDescription>
      </Alert>

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
                    <div className="space-y-2">
                        <Label htmlFor="pdfUrl">رابط ملف PDF للدرس</Label>
                        <div className='flex gap-2'>
                          <Input id="pdfUrl" type="url" placeholder="https://example.com/file.pdf" defaultValue={lesson.pdfUrl} />
                           <Button variant="outline" type="button" disabled>
                              <FileUp className="ml-2 h-4 w-4" /> رفع ملف
                           </Button>
                        </div>
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
                    {lesson.exercises?.map((exercise, index) => (
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
                                <div className="space-y-2">
                                    <Label htmlFor={`ex-pdf-${exercise.id}`}>رابط ملف PDF للتمرين (اختياري)</Label>
                                    <div className='flex gap-2'>
                                      <Input id={`ex-pdf-${exercise.id}`} type="url" placeholder="https://example.com/exercise.pdf" defaultValue={exercise.pdfUrl} />
                                       <Button variant="outline" type="button" disabled>
                                          <FileUp className="ml-2 h-4 w-4" /> رفع ملف
                                       </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {(!lesson.exercises || lesson.exercises.length === 0) && (
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
