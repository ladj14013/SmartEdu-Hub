'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { addDoc, collection, doc, query, where } from 'firebase/firestore';

import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import type { Level, User } from '@/lib/types';


const newLessonSchema = z.object({
  title: z.string().min(3, "عنوان الدرس قصير جدًا."),
  content: z.string().min(10, "محتوى الدرس قصير جدًا."),
  videoUrl: z.string().url("الرجاء إدخال رابط فيديو صالح.").optional().or(z.literal('')),
  levelId: z.string({ required_error: "الرجاء اختيار المستوى الدراسي." }),
});

type NewLessonFormValues = z.infer<typeof newLessonSchema>;

export default function NewLessonPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user: authUser, isLoading: isAuthLoading } = useUser();

  const teacherRef = useMemoFirebase(() => (firestore && authUser) ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: teacher } = useDoc<User>(teacherRef);
  
  const levelsQuery = useMemoFirebase(() => {
    if (!firestore || !teacher?.stageId) return null;
    return query(collection(firestore, 'levels'), where('stageId', '==', teacher.stageId));
  }, [firestore, teacher?.stageId]);
  const { data: levels, isLoading: areLevelsLoading } = useCollection<Level>(levelsQuery);
  
  const form = useForm<NewLessonFormValues>({
    resolver: zodResolver(newLessonSchema),
    defaultValues: {
      title: '',
      content: '',
      videoUrl: '',
    },
  });

  const selectedLevelId = form.watch('levelId');
  const isLevelSelected = !!selectedLevelId;

  const onSubmit = async (data: NewLessonFormValues) => {
    if (!firestore || !authUser || !teacher?.subjectId) {
        toast({ title: "خطأ", description: "لا يمكن إنشاء الدرس. البيانات الأساسية غير متوفرة.", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    try {
        await addDoc(collection(firestore, 'lessons'), {
            title: data.title,
            content: data.content,
            videoUrl: data.videoUrl || null,
            authorId: authUser.uid,
            subjectId: teacher.subjectId,
            levelId: data.levelId,
            type: 'private',
            isLocked: false,
            exercises: [],
            createdAt: new Date(),
        });
        toast({ title: "تم إنشاء الدرس بنجاح!" });
        router.push('/dashboard/teacher/subjects');
    } catch (error) {
        console.error("Error creating lesson: ", error);
        toast({ title: "فشل إنشاء الدرس", description: "حدث خطأ غير متوقع.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="إضافة درس خاص جديد"
        description="اختر المستوى الدراسي ثم املأ النموذج لإنشاء درس جديد."
      >
         <Button variant="outline" asChild>
            <Link href="/dashboard/teacher/subjects">
                <ArrowRight className="ml-2 h-4 w-4" /> العودة
            </Link>
        </Button>
      </PageHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
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
                </div>

                <div className="lg:col-span-1 space-y-6">
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
                    <Button type="submit" variant="accent" className="w-full" disabled={isLoading || !isLevelSelected}>
                    {isLoading ? (
                        <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري الحفظ...
                        </>
                    ) : (
                        <>
                        <Save className="ml-2 h-4 w-4"/>
                        حفظ الدرس
                        </>
                    )}
                    </Button>
                </div>
            </div>
        </form>
      </Form>
    </div>
  );
}
