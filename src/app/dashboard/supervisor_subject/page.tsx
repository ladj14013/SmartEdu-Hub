import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookCopy, Users, GraduationCap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Mock data
const supervisor = {
    name: "يوسف محمود",
    subject: "الرياضيات",
    stage: "المرحلة الإعدادية",
};

export default function SupervisorSubjectDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="لوحة تحكم مشرف المادة"
        description={`مرحباً ${supervisor.name}، أنت تشرف على مادة ${supervisor.subject} ل${supervisor.stage}.`}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:bg-muted/50 transition-colors">
            <Link href="/dashboard/supervisor_subject/content">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>إدارة المحتوى العام</CardTitle>
                        <ArrowLeft className="h-5 w-5 text-primary" />
                    </div>
                    <CardDescription>إضافة وتعديل الدروس العامة للمادة التي تشرف عليها.</CardDescription>
                </CardHeader>
            </Link>
        </Card>
        <Card className="hover:bg-muted/50 transition-colors">
            <Link href="/dashboard/supervisor_subject/teachers">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>متابعة الأساتذة</CardTitle>
                        <ArrowLeft className="h-5 w-5 text-primary" />
                    </div>
                    <CardDescription>عرض دروس الأساتذة وتقديم ملاحظات تربوية.</CardDescription>
                </CardHeader>
            </Link>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأساتذة</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">في المادة والمرحلة الخاصة بك</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التلاميذ</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">215</div>
             <p className="text-xs text-muted-foreground">المسجلين في المادة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الدروس العامة</CardTitle>
            <BookCopy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">درساً قمت بإنشائه</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
