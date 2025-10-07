'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createUserWithEmailAndPassword, initializeAuth, browserLocalPersistence, browserPopupRedirectResolver } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useFirebaseApp } from '@/firebase';
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


const newUserSchema = z.object({
  name: z.string().min(1, { message: "الرجاء إدخال الاسم الكامل." }),
  email: z.string().email({ message: "الرجاء إدخال بريد إلكتروني صالح." }),
  password: z.string().min(6, { message: "يجب أن تكون كلمة المرور 6 أحرف على الأقل." }),
  role: z.enum(['student', 'teacher', 'parent', 'supervisor_subject', 'supervisor_general', 'directeur']),
});

type NewUserFormValues = z.infer<typeof newUserSchema>;


export default function NewUserPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const app = useFirebaseApp();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<NewUserFormValues>({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: NewUserFormValues) => {
    if (!app || !firestore) return;
    setIsLoading(true);
    try {
      // In a real-world scenario, this should be done via a secure backend (Firebase Functions).
      // We create a temporary, isolated Auth instance to create a new user without
      // affecting the currently signed-in admin user.
      const tempAuth = initializeAuth(app, {
          persistence: browserLocalPersistence,
          popupRedirectResolver: browserPopupRedirectResolver
      });

      // 1. Create user in Auth
      const userCredential = await createUserWithEmailAndPassword(tempAuth, data.email, data.password);
      const user = userCredential.user;

      // 2. Create user document in Firestore
      await setDoc(doc(firestore, "users", user.uid), {
        uid: user.uid,
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: `https://i.pravatar.cc/150?u=${user.uid}`
      });


      toast({
        title: "تم إنشاء المستخدم بنجاح!",
        description: `تم إنشاء حساب لـ ${data.name} وتخزين بياناته.`,
      });
      router.push('/dashboard/directeur/users');
    } catch (error: any) {
      console.error("User creation failed:", error);
      const description = error.code === 'auth/email-already-in-use'
          ? 'هذا البريد الإلكتروني مستخدم بالفعل.'
          : 'حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.';
      toast({
        title: "فشل إنشاء المستخدم",
        description,
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
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" asChild type="button">
                    <Link href="/dashboard/directeur/users">إلغاء</Link>
                </Button>
                <Button type="submit" variant="accent" disabled={isLoading}>
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
