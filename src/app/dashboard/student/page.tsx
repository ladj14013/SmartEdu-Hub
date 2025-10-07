import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Library, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Mock data
const student = {
    name: "مريم علي",
    level: "الصف الأول الإعدادي",
    stage: "المرحلة الإعدادية",
};

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="لوحة تحكم التلميذ"
        description={`مرحباً ${student.name}، استعد لرحلة تعلم ممتعة في ${student.level}.`}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col justify-center items-center text-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            <Link href="/dashboard/student/subjects" className="block w-full h-full p-6">
                <CardHeader>
                    <Library className="h-12 w-12 mx-auto mb-4" />
                    <CardTitle className="text-2xl">الوصول السريع</CardTitle>
                    <CardDescription className="text-primary-foreground/80">انتقل مباشرة إلى المواد الدراسية وابدأ التعلم.</CardDescription>
                </CardHeader>
            </Link>
        </Card>
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>الربط مع ولي الأمر</CardTitle>
                    <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>(قريباً) يمكنك من هنا ربط حسابك بحساب ولي أمرك لمتابعة تقدمك.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center h-24 bg-muted rounded-md text-muted-foreground">
                    <p>ميزة الربط مع ولي الأمر ستكون متاحة قريباً.</p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
