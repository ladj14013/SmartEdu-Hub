
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { BarChart, BookCopy, GraduationCap, UserCheck, Users, Loader2, Save, Megaphone } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { User, Lesson, Subject } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
    const { data: bannerSettings, isLoading: isLoadingSettings } = useDoc(bannerSettingsRef);

    const [isActive, setIsActive] = useState(false);
    const [text, setText] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (bannerSettings) {
            setIsActive(bannerSettings.isActive || false);
            setText(bannerSettings.text || '');
        }
    }, [bannerSettings]);

    const handleSave = async () => {
        if (!bannerSettingsRef) return;
        setIsSaving(true);
        try {
            await setDoc(bannerSettingsRef, { isActive, text });
            toast({
                title: "تم الحفظ بنجاح",
                description: "تم تحديث إعدادات شريط الإعلانات.",
            });
        } catch (error) {
            console.error("Error saving banner settings:", error);
            toast({
                title: "فشل الحفظ",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    }
    
    if (isLoadingSettings) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-24" />
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5" />
                    شريط الإعلانات المتحرك
                </CardTitle>
                <CardDescription>
                    تحكم في الشريط المتحرك الذي يظهر في أعلى الصفحة الرئيسية.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <Label htmlFor="banner-active">تفعيل الشريط</Label>
                        <p className="text-xs text-muted-foreground">
                            عند التفعيل، سيظهر الشريط لجميع زوار الموقع.
                        </p>
                    </div>
                    <Switch
                        id="banner-active"
                        checked={isActive}
                        onCheckedChange={setIsActive}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="banner-text">نص الشريط</Label>
                    <Textarea
                        id="banner-text"
                        placeholder="اكتب هنا الإعلان الذي تريد عرضه..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={!isActive}
                    />
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
                    حفظ الإعدادات
                </Button>
            </CardFooter>
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
            <AnnouncementBannerControl />
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
        </div>
    </div>
  );
}
