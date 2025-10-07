'use client';

import { useState } from 'react';
import Link from 'next/link';
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
import type { Role } from '@/lib/types';

export default function SignupPage() {
  const [role, setRole] = useState<Role>('student');
  const [selectedStage, setSelectedStage] = useState<string>('');
  
  const filteredLevels = levels.filter(level => level.stageId === selectedStage);
  const filteredSubjects = subjects.filter(subject => levels.find(l => l.id === subject.levelId)?.stageId === selectedStage);

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
            <form>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="full-name">الاسم الكامل</Label>
                  <Input id="full-name" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input id="email" type="email" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Input id="password" type="password" required />
                </div>
                <div className="grid gap-2">
                  <Label>أنا...</Label>
                  <RadioGroup
                    defaultValue="student"
                    className="grid grid-cols-3 gap-4"
                    onValueChange={(value: Role) => setRole(value)}
                  >
                    <div>
                      <RadioGroupItem value="student" id="student" className="peer sr-only" />
                      <Label
                        htmlFor="student"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        تلميذ
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="teacher" id="teacher" className="peer sr-only" />
                      <Label
                        htmlFor="teacher"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        أستاذ
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="parent" id="parent" className="peer sr-only" />
                      <Label
                        htmlFor="parent"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        ولي أمر
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {(role === 'student' || role === 'teacher') && (
                  <div className="grid gap-2">
                    <Label htmlFor="stage">المرحلة الدراسية</Label>
                    <Select onValueChange={setSelectedStage}>
                      <SelectTrigger id="stage">
                        <SelectValue placeholder="اختر المرحلة" />
                      </SelectTrigger>
                      <SelectContent>
                        {stages.map(stage => (
                          <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {role === 'student' && selectedStage && (
                  <div className="grid gap-2">
                    <Label htmlFor="level">المستوى الدراسي</Label>
                    <Select>
                      <SelectTrigger id="level">
                        <SelectValue placeholder="اختر المستوى" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredLevels.map(level => (
                          <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {role === 'teacher' && selectedStage && (
                  <div className="grid gap-2">
                    <Label htmlFor="subject">المادة المتخصصة</Label>
                    <Select>
                      <SelectTrigger id="subject">
                        <SelectValue placeholder="اختر المادة" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredSubjects.map(subject => (
                          <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {role === 'student' && (
                  <div className="grid gap-2">
                    <Label htmlFor="teacher-code">رمز الأستاذ (اختياري)</Label>
                    <Input id="teacher-code" placeholder="أدخل رمز الأستاذ للربط" />
                  </div>
                )}

                <Button type="submit" className="w-full" variant="accent">
                  اشتراك
                </Button>
              </div>
            </form>
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
