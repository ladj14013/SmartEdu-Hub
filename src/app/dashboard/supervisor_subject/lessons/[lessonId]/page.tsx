'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import type { Lesson, Exercise } from '@/lib/types';
import { ArrowRight, Plus, Save, Trash2, Info, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

export default function EditPublicLessonPage({ params }: { params: { lessonId: string } }) {
  const { lessonId } = params;
  const { user: authUser, isLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const lessonRef = useMemoFirebase(() => firestore ? doc(firestore, 'lessons', lessonId) : null, [firestore, lessonId]);
  const { data: lesson, isLoading: isLessonLoading } = useDoc<Lesson>(lessonRef);
  
  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title);
      setContent(lesson.content);
      setVideoUrl(lesson.videoUrl || '');
      setPdfUrl(lesson.pdfUrl || '');
      setIsLocked(lesson.isLocked);
      setExercises(lesson.exercises || []);
    }
  }, [lesson]);

  const isLoading = isAuthLoading || isLessonLoading;

  if (!lesson && !isLoading) {
    return <div>الدرس غير موجود.</div>;
  }
  
  const canEdit = lesson?.type === 'public';
  
  const handleUpdate = async () => {
      if (!canEdit || !lessonRef) return;
      setIsSaving(true);
      try {
          await updateDoc(lessonRef, {
              title,
              content,
              videoUrl,
              pdfUrl,
              isLocked,
              exercises,
          });
          toast({
              title: "تم الحفظ بنجاح",
              description: "تم تحديث بيانات الدرس العام.",
          });
      } catch (error) {
          console.error("Error updating lesson:", error);
          toast({
              title: "فشل الحفظ",
              description: "حدث خطأ أثناء تحديث الدرس.",
              variant: "destructive",
          });
      } finally {
          setIsSaving(false);
      }
  };

  const handleAddExercise = () => {
    setExercises([...exercises, { id: uuidv4(), question: '', modelAnswer: '' }]);
  };

  const handleExerciseChange = (index: number, field: 'question' | 'modelAnswer', value: string) => {
    const newExercises = [...exercises];
    newExercises[index][field] = value;
    setExercises(newExercises);
  };
  
  const handleRemoveExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };


  if (isLoading) {
      return (
        <div className="space-y-6">
            <PageHeader title="جاري تحميل الدرس..." description="الرجاء الانتظار...">
                <div className="flex gap-2"><Skeleton className="h-10 w-24" /><Skeleton className="h-10 w-36" /></div>
            </PageHeader>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card><CardHeader><CardTitle><Skeleton className="h-6 w-32" /></CardTitle></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
                    <Card><CardHeader><CardTitle><Skeleton className="h-6 w-24" /></CardTitle></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
                </div>
                <div className="lg:col-span-1"><Card><CardHeader><CardTitle><Skeleton className="h-6 w-32" /></CardTitle></CardHeader><CardContent><Skeleton className="h-12 w-full" /></CardContent></Card></div>
            </div>
        </div>
      );
  }


  return (
    <div className="space-y-6">
      <PageHeader
        title={"تعديل محتوى الدرس العام"}
        description={`أنت تقوم بتعديل درس "${lesson?.title}"`}
      >
        <div className="flex gap-2">
            <Button variant="outline" asChild>
                <Link href={`/dashboard/supervisor_subject/content`}>
                    <ArrowRight className="ml-2 h-4 w-4" /> العودة
                </Link>
            </Button>
            {canEdit && (
                <Button variant="accent" onClick={handleUpdate} disabled={isSaving}>
                     {isSaving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
                     {isSaving ? 'جاري الحفظ...' : 'حفظ كل التغييرات'}
                </Button>
            )}
        </div>
      </PageHeader>

      {!canEdit && (
        <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertTitle>غير مصرح به</AlertTitle>
            <AlertDescription>
                لا يمكنك تعديل هذا الدرس. هذا الدرس ليس درسًا عامًا.
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
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} readOnly={!canEdit} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="content">المحتوى</Label>
                        <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={8} readOnly={!canEdit} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="videoUrl">رابط الفيديو (اختياري)</Label>
                        <Input id="videoUrl" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} readOnly={!canEdit} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pdfUrl">رابط ملف PDF (اختياري)</Label>
                        <Input id="pdfUrl" value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} readOnly={!canEdit} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>التمارين</CardTitle>
                    {canEdit && (
                        <Button variant="outline" size="sm" onClick={handleAddExercise}>
                            <Plus className="ml-2 h-4 w-4" /> أضف تمرين
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    {exercises?.map((exercise, index) => (
                        <Card key={exercise.id} className="bg-muted/50">
                            <CardHeader className="flex flex-row items-center justify-between p-4">
                                <h4 className="font-semibold">تمرين {index + 1}</h4>
                                {canEdit && (
                                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleRemoveExercise(exercise.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4 p-4 pt-0">
                                <div className="space-y-2">
                                    <Label htmlFor={`q-${exercise.id}`}>السؤال</Label>
                                    <Textarea 
                                      id={`q-${exercise.id}`} 
                                      value={exercise.question} 
                                      onChange={(e) => handleExerciseChange(index, 'question', e.target.value)}
                                      readOnly={!canEdit} />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor={`a-${exercise.id}`}>الإجابة النموذجية</Label>
                                    <Textarea 
                                      id={`a-${exercise.id}`} 
                                      value={exercise.modelAnswer} 
                                      onChange={(e) => handleExerciseChange(index, 'modelAnswer', e.target.value)}
                                      readOnly={!canEdit} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {exercises?.length === 0 && <p className="text-center text-muted-foreground py-4">لا توجد تمارين.</p>}
                </CardContent>
            </Card>
        </div>
        {canEdit && (
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader><CardTitle>إعدادات الدرس</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="lesson-lock" className="font-medium">قفل الدرس</Label>
                            <Switch id="lesson-lock" checked={isLocked} onCheckedChange={setIsLocked} />
                        </div>
                         <p className="text-sm text-muted-foreground mt-2">عند قفل الدرس، لن يتمكن التلاميذ من الوصول إليه.</p>
                    </CardContent>
                </Card>
            </div>
        )}
      </div>
    </div>
  );
}
