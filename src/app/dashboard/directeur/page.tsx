
'use client';

import { useMemo, useState } from 'react';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, BookCopy, GraduationCap, UserCheck, Users, Loader2, Save, Tv } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { User, Lesson, Subject } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const StatCard = ({ title, value, icon: Icon, isLoading }: { title: string, value: number, icon: React.ElementType, isLoading: boolean }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className="h-8 w-1/2" />
      ) : (
        <div className="text-2xl font-bold">{value}</div>
      )}
    </CardContent>
  </Card>
);

function AnnouncementBannerControl() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const bannerSettingsRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'announcement_banner') : null, [firestore]);
  const { data: bannerSettings, isLoading, refetch } = useDoc(bannerSettingsRef);

  const [text, setText] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (bannerSettings) {
      setText(bannerSettings.text || '');
      setIsActive(bannerSettings.isActive || false);
    }
  }, [bannerSettings]);

  const handleSave = async () => {
    if (!bannerSettingsRef) return;
    setIsSaving(true);
    try {
      await updateDoc(bannerSettingsRef, { text, isActive });
      toast({ title: 'تم الحفظ', description: 'تم تحديث إعدادات شريط الإعلانات.' });
      refetch();
    } catch (e) {
      toast({ title: 'خطأ', description: 'فشل حفظ الإعدادات.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
     <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Tv className="h-6 w-6 text-primary" />
          <CardTitle>شريط الإعلانات المتحرك</CardTitle>
        </div>
        <CardDescription>تحكم في الشريط الذي يظهر في أعلى الصفحة الرئيسية.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-24" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className='space-y-0.5'>
                    <Label htmlFor="banner-active" className="font-medium">تفعيل الشريط</Label>
                    <p className="text-xs text-muted-foreground">
                        هل تريد عرض الشريط في الصفحة الرئيسية؟
                    </p>
                </div>
                <Switch
                    id="banner-active"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-text">نص الإعلان</Label>
              <Textarea
                id="banner-text"
                placeholder="اكتب رسالتك هنا..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={!isActive}
              />
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
              حفظ الإعدادات
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}


export default function DirecteurDashboard() {
  const firestore = useFirestore();

  const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const lessonsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'lessons') : null, [firestore]);
  const subjectsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'subjects') : null, [firestore]);

  const { data: usersData, isLoading: isLoadingUsers } = useCollection<User>(usersQuery);
  const { data: lessonsData, isLoading: isLoadingLessons } = useCollection<Lesson>(lessonsQuery);
  const { data: subjectsData, isLoading: isLoadingSubjects } = useCollection<Subject>(subjectsQuery);

  const stats = useMemo(() => {
    if (!usersData) {
      return { students: 0, teachers: 0 };
    }
    const students = usersData.filter(u => u.role === 'student').length;
    const teachers = usersData.filter(u => u.role === 'teacher').length;
    return { students, teachers };
  }, [usersData]);

  const totalLessons = lessonsData?.length ?? 0;
  const totalSubjects = subjectsData?.length ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="لوحة تحكم المدير"
        description="مرحباً بعودتك، إليك نظرة عامة على المنصة."
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="إجمالي الطلاب" value={stats.students} icon={Users} isLoading={isLoadingUsers} />
        <StatCard title="إجمالي المعلمين" value={stats.teachers} icon={UserCheck} isLoading={isLoadingUsers} />
        <StatCard title="إجمالي المواد" value={totalSubjects} icon={GraduationCap} isLoading={isLoadingSubjects} />
        <StatCard title="إجمالي الدروس" value={totalLessons} icon={BookCopy} isLoading={isLoadingLessons} />
      </div>

       <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                <CardTitle>نشاط المستخدمين</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                    <BarChart className="mx-auto h-12 w-12" />
                    <p>مخطط بياني لنشاط المستخدمين (عنصر نائب)</p>
                </div>
                </CardContent>
            </Card>
            <AnnouncementBannerControl />
        </div>
    </div>
  );
}
