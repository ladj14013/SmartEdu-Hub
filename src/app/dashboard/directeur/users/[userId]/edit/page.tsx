import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getUserById } from '@/lib/data';
import { ArrowRight, Save } from 'lucide-react';
import Link from 'next/link';

export default function EditUserPage({ params }: { params: { userId: string } }) {
  const user = getUserById(params.userId);

  if (!user) {
    return <div>المستخدم غير موجود.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="تعديل المستخدم" description={`أنت تقوم بتعديل بيانات ${user.name}`} />

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>تفاصيل المستخدم</CardTitle>
          <CardDescription>يمكنك تعديل اسم المستخدم ودوره من هنا.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">الاسم الكامل</Label>
            <Input id="name" defaultValue={user.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input id="email" defaultValue={user.email} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">الدور</Label>
            <Select defaultValue={user.role}>
              <SelectTrigger id="role">
                <SelectValue placeholder="اختر الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">تلميذ</SelectItem>
                <SelectItem value="teacher">أستاذ</SelectItem>
                <SelectItem value="supervisor_subject">مشرف مادة</SelectItem>
                <SelectItem value="supervisor_general">مشرف عام</SelectItem>
                <SelectItem value="directeur">مدير</SelectItem>
                <SelectItem value="parent">ولي أمر</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" asChild>
                <Link href="/dashboard/directeur/users">إلغاء</Link>
            </Button>
            <Button variant="accent">
                <Save className="ml-2 h-4 w-4"/>
                حفظ التغييرات
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
