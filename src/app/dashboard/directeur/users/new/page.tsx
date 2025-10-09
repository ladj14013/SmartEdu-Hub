'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createUserWithEmailAndPassword, type UserCredential } from 'firebase/auth';
import { doc, setDoc, collection } from 'firebase/firestore';
import { useAuth, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import type { Stage, Level, Subject } from '@/lib/types';


const newUserSchema = z.object({
  name: z.string().min(1, { message: "الرجاء إدخال الاسم الكامل." }),
  email: z.string().email({ message: "الرجاء إدخال بريد إلكتروني صالح." }),
  password: z.string().min(6, { message: "يجب أن تكون كلمة المرور 6 أحرف على الأقل." }),
  role: z.enum(['student', 'teacher', 'parent', 'supervisor_subject', 'supervisor_general', 'directeur']),
  stageId: z.string().optional(),
  levelId: z.string().optional(),
  subjectId: z.string().optional(),
}).refine((data) => {
    // Stage is required for student, teacher, and subject supervisor
    if (['student', 'teacher', 'supervisor_subject'].includes(data.role)) {
      return !!data.stageId;
    }
    return true;
  }, {
    message: "الرجاء اختيار المرحلة الدراسية.",
    path: ["stageId"],
  }).refine((data) => {
    // Level is required for student
    if (data.role === 'student') {
        return !!data.levelId;
    }
    return true;
  }, {
    message: "الرجاء اختيار المستوى الدراسي.",
    path: ["levelId"],
  }).refine((data) => {
    // Subject is required for teacher and subject supervisor
    if (['teacher', 'supervisor_subject'].includes(data.role)) {
        return !!data.subjectId;
    }
    return true;
  }, {
    message: "الرجاء اختيار المادة.",
    path: ["subjectId"],
  });

type NewUserFormValues = z.infer<typeof newUserSchema>;

export default function NewUserPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();

  const stagesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'stages') : null, [firestore]);
  const levelsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'levels') : null, [firestore]);
  const subjectsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'subjects') : null, [firestore]);

  const { data: stages, isLoading: isLoadingStages } = useCollection<Stage>(stagesQuery);
  const { data: levels, isLoading: isLoadingLevels } = useCollection<Level>(levelsQuery);
  const { data: subjects, isLoading: isLoadingSubjects } = useCollection<Subject>(subjectsQuery);


  const form = useForm<NewUserFormValues>({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'student',
    },
  });

  const role = form.watch('role');
  const selectedStage = form.watch('stageId');
  
  const filteredLevels = levels?.filter(level => level.stageId === selectedStage) || [];
  const filteredSubjects = subjects?.filter(subject => subject.stageId === selectedStage) || [];


  const onSubmit = async (data: NewUserFormValues) => {
    if (!firestore || !auth) {
        toast({
            title: "خطأ في التهيئة",
            description: "خدمات Firebase غير متاحة. الرجاء المحاولة مرة أخرى.",
            variant: "destructive"
        });
        return;
    };
    setIsLoading(true);

    let userCredential: UserCredential | null = null;

    try {
      // --- Step 1: Create User in Firebase Auth ---
      userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      toast({
        title: "الخطوة 1: نجاح المصادقة",
        description: `تم إنشاء حساب المصادقة لـ ${data.email} بنجاح.`,
      });
    } catch (error: any) {
      console.error("Authentication creation failed:", error);
      const description = error.code === 'auth/email-already-in-use'
          ? 'هذا البريد الإلكتروني مستخدم بالفعل.'
          : 'فشل إنشاء المستخدم في نظام المصادقة.';
      toast({
        title: "فشل في الخطوة 1: المصادقة",
        description,
        variant: "destructive"
      });
      setIsLoading(false); // Stop loading on auth failure
      return; 
    }

    try {
        // --- Step 2: Create User Document in Firestore ---
        const user = userCredential.user;
        let userData: any = {
            uid: user.uid,
            name: data.name,
            email: data.email,
            role: data.role,
            stageId: data.stageId || null,
            levelId: data.levelId || null,
            subjectId: data.subjectId || null,
            avatar: `https://i.pravatar.cc/150?u=${user.uid}`
        };

        if (data.role === 'teacher') {
            userData.teacherCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        }
        if (data.role === 'student') {
            userData.linkedTeachers = {};
        }

        await setDoc(doc(firestore, "users", user.uid), userData);

        toast({
            title: "الخطوة 2: نجاح قاعدة البيانات",
            description: `تم إنشاء حساب لـ ${data.name} وتخزين بياناته بنجاح.`,
        });
        
        router.push('/dashboard/directeur/users');

    } catch (error: any) {
        console.error("Firestore document creation failed:", error);
        toast({
            title: "فشل في الخطوة 2: قاعدة البيانات",
            description: "نجحت المصادقة ولكن فشل حفظ البيانات في قاعدة البيانات. قد تكون هناك مشكلة في قواعد الأمان أو الاتصال بـ Firestore.",
            variant: "destructive"
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="إضافة مستخدم جديد" description="إنشاء حساب جديد وتعيين دور له." />

      <Card className="max-w-2xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>تفاصيل المستخدم</CardTitle>
              <CardDescription>املأ النموذج أدناه لإنشاء حساب جديد.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="name">الاسم الكامل</Label>
                    <FormControl>
                      <Input id="name" placeholder="مثال: خالد إبراهيم" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <FormControl>
                      <Input id="email" type="email" placeholder="example@domain.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="password">كلمة المرور</Label>
                    <FormControl>
                      <Input id="password" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="role">الدور</Label>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger id="role">
                        <SelectValue placeholder="اختر الدور" />
                      </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="student">تلميذ</SelectItem>
                        <SelectItem value="teacher">أستاذ</SelectItem>
                        <SelectItem value="supervisor_subject">مشرف مادة</SelectItem>
                        <SelectItem value="supervisor_general">مشرف عام</SelectItem>
                        <SelectItem value="directeur">مدير</SelectItem>
                        <SelectItem value="parent">ولي أمر</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

                {(role === 'student' || role === 'teacher' || role === 'supervisor_subject') && (
                   <FormField
                      control={form.control}
                      name="stageId"
                      render={({ field }) => (
                        <FormItem>
                          <Label>المرحلة الدراسية</Label>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر المرحلة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {stages?.map(stage => (
                                <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                )}
                
                {role === 'student' && selectedStage && (
                   <FormField
                      control={form.control}
                      name="levelId"
                      render={({ field }) => (
                        <FormItem>
                          <Label>المستوى الدراسي</Label>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر المستوى" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filteredLevels.map(level => (
                                <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                )}

                {(role === 'teacher' || role === 'supervisor_subject') && selectedStage && (
                   <FormField
                      control={form.control}
                      name="subjectId"
                      render={({ field }) => (
                        <FormItem>
                          <Label>المادة</Label>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر المادة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filteredSubjects.map(subject => (
                                <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                )}

            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" asChild type="button">
                    <Link href="/dashboard/directeur/users">إلغاء</Link>
                </Button>
                <Button type="submit" variant="accent" disabled={isLoading || isLoadingStages || isLoadingLevels || isLoadingSubjects}>
                  {isLoading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <Save className="ml-2 h-4 w-4"/>
                      إنشاء مستخدم
                    </>
                  )}
                </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
