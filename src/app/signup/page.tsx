'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Logo } from '@/components/common/logo';
import { stages, levels, subjects } from '@/lib/data';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const signupSchema = z.object({
  fullName: z.string().min(1, { message: "الرجاء إدخال الاسم الكامل." }),
  email: z.string().email({ message: "الرجاء إدخال بريد إلكتروني صالح." }),
  password: z.string().min(6, { message: "يجب أن تكون كلمة المرور 6 أحرف على الأقل." }),
  role: z.enum(['student', 'teacher', 'parent']),
  stage: z.string().optional(),
  level: z.string().optional(),
  subject: z.string().optional(),
  teacherCode: z.string().optional(),
}).refine((data) => {
    if (data.role === 'student' || data.role === 'teacher') {
        return !!data.stage;
    }
    return true;
}, {
    message: "الرجاء اختيار المرحلة الدراسية.",
    path: ['stage'],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
        fullName: '',
        email: '',
        password: '',
        role: 'student',
    },
  });

  const role = form.watch('role');
  const selectedStage = form.watch('stage');
  
  const filteredLevels = levels.filter(level => level.stageId === selectedStage);
  const filteredSubjects = subjects.filter(subject => levels.find(l => l.id === subject.levelId)?.stageId === selectedStage);

  const onSubmit = async (data: SignupFormValues) => {
    if (!auth || !firestore) return;
    setIsLoading(true);
    try {
      // 1. Create user in Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // 2. Create user document in Firestore
      await setDoc(doc(firestore, "users", user.uid), {
        uid: user.uid,
        name: data.fullName,
        email: data.email,
        role: data.role,
        stageId: data.stage,
        levelId: data.level,
        subjectId: data.subject,
        teacherCode: data.teacherCode,
        avatar: `https://i.pravatar.cc/150?u=${user.uid}`
      });

      toast({
        title: "تم إنشاء الحساب بنجاح!",
        description: "سيتم توجيهك إلى لوحة التحكم.",
      });
      router.push('/dashboard');
    } catch (error: any) {
        console.error("Signup failed:", error);
        const description = error.code === 'auth/email-already-in-use'
            ? 'هذا البريد الإلكتروني مستخدم بالفعل.'
            : 'حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.';
        toast({
            title: "فشل إنشاء الحساب",
            description,
            variant: "destructive"
        })
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg">
        <Card>
          <CardHeader className="text-center">
            <div className='flex justify-center mb-4'>
             <Logo href="/"/>
            </div>
            <CardTitle className="text-2xl font-headline">إنشاء حساب جديد</CardTitle>
            <CardDescription>انضم إلى منصتنا وابدأ رحلتك التعليمية</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="full-name">الاسم الكامل</Label>
                      <FormControl>
                        <Input id="full-name" {...field} />
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
                        <Input id="email" type="email" {...field} />
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
                      <div className="relative">
                        <FormControl>
                          <Input id="password" type={showPassword ? 'text' : 'password'} {...field} />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute left-2 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                          onClick={() => setShowPassword((prev) => !prev)}
                        >
                          {showPassword ? <EyeOff /> : <Eye />}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <Label>أنا...</Label>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-3 gap-4"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="student" id="student" className="peer sr-only" />
                            </FormControl>
                             <Label
                                htmlFor="student"
                                className="flex w-full flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              >
                                تلميذ
                              </Label>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                                <RadioGroupItem value="teacher" id="teacher" className="peer sr-only" />
                            </FormControl>
                             <Label
                                htmlFor="teacher"
                                className="flex w-full flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              >
                                أستاذ
                              </Label>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="parent" id="parent" className="peer sr-only" />
                            </FormControl>
                            <Label
                                htmlFor="parent"
                                className="flex w-full flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              >
                                ولي أمر
                              </Label>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {(role === 'student' || role === 'teacher') && (
                   <FormField
                      control={form.control}
                      name="stage"
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
                              {stages.map(stage => (
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
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <Label>المستوى الدراسي</Label>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر المستوى" />
                              </Trigger>
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

                {role === 'teacher' && selectedStage && (
                   <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <Label>المادة المتخصصة</Label>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر المادة" />
                              </Trigger>
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

                {role === 'student' && (
                  <FormField
                  control={form.control}
                  name="teacherCode"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="teacher-code">رمز الأستاذ (اختياري)</Label>
                      <FormControl>
                        <Input id="teacher-code" placeholder="أدخل رمز الأستاذ للربط" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                )}

                <Button type="submit" className="w-full" variant="accent" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            جاري إنشاء الحساب...
                        </>
                    ) : (
                        'اشتراك'
                    )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="text-center text-sm">
            لديك حساب بالفعل؟{' '}
            <Link href="/login" className="underline text-primary">
              تسجيل الدخول
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
