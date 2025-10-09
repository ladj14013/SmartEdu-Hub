import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

// Helper component for consistent link styling
const PageLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <li className="mb-2">
    <Link href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
      {children}
    </Link>
  </li>
);

export default function PreviewLinksPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="روابط معاينة الصفحات"
        description="قائمة بجميع الصفحات المتاحة في التطبيق لمعاينتها."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>الصفحات الرئيسية</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              <PageLink href="/">الصفحة الرئيسية</PageLink>
              <PageLink href="/login">صفحة تسجيل الدخول</PageLink>
              <PageLink href="/signup">صفحة إنشاء حساب</PageLink>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>لوحة تحكم المدير</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              <PageLink href="/dashboard/directeur">الرئيسية</PageLink>
              <PageLink href="/dashboard/directeur/users">إدارة المستخدمين</PageLink>
              <PageLink href="/dashboard/directeur/users/new">إضافة مستخدم جديد</PageLink>
              <PageLink href="/dashboard/directeur/users/user-1/edit">تعديل مستخدم</PageLink>
              <PageLink href="/dashboard/directeur/content">إدارة هيكل المحتوى</PageLink>
              <PageLink href="/dashboard/directeur/content/stage-2/level-2-1/subj-2">محتوى المادة</PageLink>
              <PageLink href="/dashboard/directeur/content/stage-2/level-2-1/subj-2/lesson-1">تعديل درس</PageLink>
              <PageLink href="/dashboard/directeur/messages">صندوق الرسائل</PageLink>
              <PageLink href="/dashboard/directeur/github-guide">دليل GitHub</PageLink>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>لوحة تحكم مشرف المادة</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
                <PageLink href="/dashboard/supervisor_subject">الرئيسية</PageLink>
                <PageLink href="/dashboard/supervisor_subject/content">إدارة المحتوى العام</PageLink>
                <PageLink href="/dashboard/supervisor_subject/content/new">إضافة درس عام جديد</PageLink>
                <PageLink href="/dashboard/supervisor_subject/lessons/lesson-1">تعديل درس عام</PageLink>
                <PageLink href="/dashboard/supervisor_subject/teachers">قائمة الأساتذة</PageLink>
                <PageLink href="/dashboard/supervisor_subject/teachers/user-4">دروس الأستاذ</PageLink>
                <PageLink href="/dashboard/supervisor_subject/teachers/user-4/lessons/lesson-2">مراجعة درس</PageLink>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>لوحة تحكم المشرف العام</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
                <PageLink href="/dashboard/supervisor_general">الرئيسية</PageLink>
                <PageLink href="/dashboard/supervisor_general/supervisors">قائمة مشرفي المواد</PageLink>
                <PageLink href="/dashboard/supervisor_general/messages">الرسائل الموجهة</PageLink>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>لوحة تحكم الأستاذ</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
                <PageLink href="/dashboard/teacher">الرئيسية</PageLink>
                <PageLink href="/dashboard/teacher/subjects">إدارة الدروس</PageLink>
                <PageLink href="/dashboard/teacher/lessons/new">إضافة درس جديد</PageLink>
                <PageLink href="/dashboard/teacher/lessons/lesson-2">تعديل/عرض درس</PageLink>
                <PageLink href="/dashboard/teacher/students">قائمة الطلاب</PageLink>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>لوحة تحكم التلميذ</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
                <PageLink href="/dashboard/student">الرئيسية</PageLink>
                <PageLink href="/dashboard/student/subjects">المواد الدراسية</PageLink>
                <PageLink href="/dashboard/student/subjects/subj-2">صفحة المادة</PageLink>
                <PageLink href="/dashboard/student/lessons/lesson-1">صفحة الدرس</PageLink>
            </ul>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
