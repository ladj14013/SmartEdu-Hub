'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { addDoc, collection, doc, query, where } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import type { Level, User as UserType } from '@/lib/types';


const newLessonSchema = z.object({
  title: z.string().min(3, "عنوان الدرس قصير جدًا."),
  content: z.string().min(10, "محتوى الدرس قصير جدًا."),
  videoUrl: z.string().url("الرجاء إدخال رابط فيديو صالح.").optional().or(z.literal('')),
  levelId: z.string({ required_error: "الرجاء اختيار المستوى الدراسي." }),
  exercises: z.array(z.object({
    id: z.string(),
    question: z.string().min(1, "السؤال لا يمكن أن يكون فارغًا."),
    modelAnswer: z.string().min(1, "الإجابة النموذجية لا يمكن أن تكون فارغة."),
  })).optional(),
});

type NewLessonFormValues = z.infer<typeof newLessonSchema>;

export default function NewPublicLessonPage() {
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user: authUser } = useUser();

  const supervisorRef = useMemoFirebase(() => (firestore && authUser) ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: supervisor } = useDoc<UserType>(supervisorRef);
  
  const levelsQuery = useMemoFirebase(() => {
    if (!firestore || !supervisor?.stageId) return null;
    return query(collection(firestore, 'levels'), where('stageId', '==', supervisor.stageId));
  }, [firestore, supervisor?.stageId]);
  const { data: levels, isLoading: areLevelsLoading } = useCollection<Level>(levelsQuery);
  
  const form = useForm<NewLessonFormValues>({
    resolver: zodResolver(newLessonSchema),
    defaultValues: {
      title: '',
      content: '',
      videoUrl: '',
      levelId: undefined,
      exercises: [],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "exercises"
  });

  const selectedLevelId = form.watch('levelId');
  const isLevelSelected = !!selectedLevelId;

  const onSubmit = async (data: NewLessonFormValues) => {
    if (!firestore || !authUser || !supervisor?.subjectId) {
        toast({ title: "خطأ", description: "لا يمكن إنشاء الدرس. البيانات الأساسية غير متوفرة.", variant: "destructive" });
        return;
    }
    setIsSaving(true);
    try {
        await addDoc(collection(firestore, 'lessons'), {
            title: data.title,
            content: data.content,
            videoUrl: data.videoUrl || null,
            authorId: authUser.uid,
            subjectId: supervisor.subjectId,
            levelId: data.levelId,
            type: 'public', // Set lesson type to public
            isLocked: false,
            exercises: data.exercises || [],
            createdAt: new Date(),
        });
        toast({ title: "تم إنشاء الدرس العام بنجاح!" });
        router.push('/dashboard/supervisor_subject/content');
    } catch (error) {
        console.error("Error creating lesson: ", error);
        toast({ title: "فشل إنشاء الدرس", description: "حدث خطأ غير متوقع.", variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="إضافة درس عام جديد"
        description="اختر المستوى الدراسي ثم املأ النموذج لإنشاء درس عام."
      >
         <Button variant="outline" asChild>
            <Link href="/dashboard/supervisor_subject/content">
                <ArrowRight className="ml-2 h-4 w-4" /> العودة
            </Link>
        </Button>
      </PageHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <Card>
                <CardHeader>
                    <CardTitle>إعدادات النشر</CardTitle>
                        <CardDescription>
                        يجب اختيار المستوى الدراسي أولاً.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                        <FormField
                        control={form.control}
                        name="levelId"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>المستوى الدراسي</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger disabled={areLevelsLoading}>
                                    <SelectValue placeholder={areLevelsLoading ? "جاري تحميل المستويات..." : "اختر المستوى"} />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {levels?.map(level => (
                                    <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>المعلومات الأساسية للدرس</CardTitle>
                        <CardDescription>
                        {isLevelSelected ? 'يمكنك الآن ملء تفاصيل الدرس.' : 'الرجاء اختيار المستوى الدراسي أولاً لتفعيل الحقول.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>عنوان الدرس</FormLabel>
                            <FormControl>
                            <Input placeholder="مثال: مقدمة في الجبر" {...field} disabled={!isLevelSelected} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>المحتوى النصي للدرس</FormLabel>
                            <FormControl>
                            <Textarea placeholder="اشرح الدرس هنا..." {...field} rows={10} disabled={!isLevelSelected} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="videoUrl"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>رابط فيديو (اختياري)</FormLabel>
                            <FormControl>
                            <Input placeholder="https://www.youtube.com/watch?v=..." {...field} disabled={!isLevelSelected} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>التمارين</CardTitle>
                        <CardDescription>
                            {isLevelSelected ? 'أضف تمارين تفاعلية للدرس.' : 'اختر المستوى الدراسي لتفعيل هذا القسم.'}
                        </CardDescription>
                    </div>
                    <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => append({ id: uuidv4(), question: '', modelAnswer: '' })}
                        disabled={!isLevelSelected}
                    >
                        <Plus className="ml-2 h-4 w-4" /> أضف تمرين
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {fields.map((field, index) => (
                        <Card key={field.id} className="bg-muted/50 p-4">
                             <div className="flex justify-between items-center mb-4">
                                <h4 className="font-semibold">تمرين {index + 1}</h4>
                                <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => remove(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name={`exercises.${index}.question`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>السؤال</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="اكتب نص السؤال..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name={`exercises.${index}.modelAnswer`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>الإجابة النموذجية</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="اكتب الإجابة المتوقعة من التلميذ..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </Card>
                    ))}
                    {fields.length === 0 && isLevelSelected && (
                        <p className="text-center text-muted-foreground py-4">لا توجد تمارين مضافة بعد.</p>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" variant="accent" className="w-full md:w-auto" disabled={isSaving || !isLevelSelected}>
                {isSaving ? (
                    <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                    </>
                ) : (
                    <>
                    <Save className="ml-2 h-4 w-4"/>
                    حفظ الدرس العام
                    </>
                )}
                </Button>
            </div>
        </form>
      </Form>
    </div>
  );
}
