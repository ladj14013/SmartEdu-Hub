'use client';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Presentation, Users, Clipboard, ClipboardCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Mock data
const teacher = {
    name: "خالد إبراهيم",
    subject: "الرياضيات",
    stage: "المرحلة الإعدادية",
    code: "KHALED123",
};

export default function TeacherDashboard() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(teacher.code);
    setCopied(true);
    toast({ title: "تم نسخ الكود بنجاح!" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="لوحة تحكم الأستاذ"
        description={`مرحباً ${teacher.name}، أنت تدرس مادة ${teacher.subject} ل${teacher.stage}.`}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>كود الربط مع التلاميذ</CardTitle>
                <CardDescription>شارك هذا الكود مع تلاميذك لربطهم بحسابك.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4 p-4 bg-muted rounded-b-lg">
                <p className="text-2xl font-mono font-bold text-primary">{teacher.code}</p>
                <Button onClick={handleCopy} variant="ghost" size="icon">
                    {copied ? <ClipboardCheck className="h-5 w-5 text-green-500" /> : <Clipboard className="h-5 w-5" />}
                    <span className="sr-only">نسخ الكود</span>
                </Button>
            </CardContent>
        </Card>
        <Card className="hover:bg-muted/50 transition-colors">
            <Link href="/dashboard/teacher/subjects">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>إدارة المحتوى</CardTitle>
                        <ArrowLeft className="h-5 w-5 text-primary" />
                    </div>
                    <CardDescription>إضافة وتعديل دروسك الخاصة والاطلاع على الدروس العامة.</CardDescription>
                </CardHeader>
            </Link>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عدد الطلاب</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">(عنصر نائب)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الدروس الخاصة</CardTitle>
            <Presentation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">دروس قمت بإنشائها</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط الأداء</CardTitle>
            <div className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82%</div>
            <p className="text-xs text-muted-foreground">(عنصر نائب)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
