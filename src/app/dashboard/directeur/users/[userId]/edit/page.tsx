'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import type { User as UserType, Role, Stage, Level, Subject } from '@/lib/types';

import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function EditUserPage({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  // --- Data Fetching ---
  const userRef = useMemoFirebase(() => firestore ? doc(firestore, 'users', params.userId) : null, [firestore, params.userId]);
  const stagesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'stages') : null, [firestore]);
  const levelsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'levels') : null, [firestore]);
  const subjectsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'subjects') : null, [firestore]);

  const { data: user, isLoading: isLoadingUser } = useDoc<UserType>(userRef);
  const { data: stages, isLoading: isLoadingStages } = useCollection<Stage>(stagesQuery);
  const { data: levels, isLoading: isLoadingLevels } = useCollection<Level>(levelsQuery);
  const { data: subjects, isLoading: isLoadingSubjects } = useCollection<Subject>(subjectsQuery);
  
  const isLoading = isLoadingUser || isLoadingStages || isLoadingLevels || isLoadingSubjects;

  // --- Form State ---
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState<Role | ''>('');
  const [stageId, setStageId] = useState('');
  const [levelId, setLevelId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [teacherCode, setTeacherCode] = useState('');

  useEffect(() => {
    if (user) {
      setUserName(user.name || '');
      setUserRole(user.role || '');
      setStageId(user.stageId || '');
      setLevelId(user.levelId || '');
      setSubjectId(user.subjectId || '');
      setTeacherCode(user.teacherCode || '');
    }
  }, [user]);

  const handleUpdate = async () => {
    if (!userRef || !user) return;
    setIsUpdating(true);
    try {
        const updatedData: Partial<UserType> = {
            name: userName,
            role: userRole as Role,
            stageId: stageId || null,
            levelId: levelId || null,
            subjectId: subjectId || null,
            teacherCode: teacherCode || null,
        };
        await updateDoc(userRef, updatedData);
        toast({
            title: 'تم التحديث بنجاح',
            description: `تم تحديث بيانات المستخدم ${userName}.`
        });
        router.push('/dashboard/directeur/users');
    } catch(error) {
        console.error("Failed to update user:", error);
        toast({
            title: 'فشل التحديث',
            description: 'حدث خطأ أثناء تحديث بيانات المستخدم.',
            variant: 'destructive'
        });
    } finally {
        setIsUpdating(false);
    }
  };
  
  const filteredLevels = levels?.filter(l => l.stageId === stageId) || [];
  const filteredSubjects = subjects?.filter(s => levels?.find(l => l.id === s.levelId)?.stageId === stageId) || [];

  if (isLoading) {
    return (
        <div className="space-y-6">
            <PageHeader title="تعديل المستخدم" description="جاري تحميل بيانات المستخدم..." />
             <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-10 w-32" />
                </CardFooter>
             </Card>
        </div>
    )
  }

  if (!user) {
    return (
        <div className="space-y-6">
             <PageHeader title="خطأ" description="المستخدم الذي تبحث عنه غير موجود." />
             <div className="flex justify-center">
                <Button variant="outline" asChild>
                    <Link href="/dashboard/directeur/users">
                        <ArrowRight className="ml-2 h-4 w-4"/>
                        العودة إلى قائمة المستخدمين
                    </Link>
                </Button>
             </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="تعديل المستخدم" description={`أنت تقوم بتعديل بيانات ${user.name}`} />

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>تفاصيل المستخدم</CardTitle>
          <CardDescription>يمكنك تعديل بيانات المستخدم من هنا.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">الاسم الكامل</Label>
            <Input id="name" value={userName} onChange={(e) => setUserName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input id="email" value={user.email} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">الدور</Label>
            <Select value={userRole} onValueChange={(value) => setUserRole(value as Role)}>
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

          {(userRole === 'student' || userRole === 'teacher' || userRole === 'supervisor_subject') && (
            <div className="space-y-2">
              <Label htmlFor="stage">المرحلة الدراسية</Label>
              <Select value={stageId} onValueChange={setStageId}>
                <SelectTrigger id="stage">
                  <SelectValue placeholder="اختر المرحلة" />
                </SelectTrigger>
                <SelectContent>
                  {stages?.map(stage => <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {userRole === 'student' && stageId && (
            <div className="space-y-2">
              <Label htmlFor="level">المستوى الدراسي</Label>
              <Select value={levelId} onValueChange={setLevelId}>
                <SelectTrigger id="level">
                  <SelectValue placeholder="اختر المستوى" />
                </SelectTrigger>
                <SelectContent>
                  {filteredLevels.map(level => <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {(userRole === 'teacher' || userRole === 'supervisor_subject') && stageId && (
            <div className="space-y-2">
              <Label htmlFor="subject">المادة</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="اختر المادة" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubjects.map(subject => <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {userRole === 'teacher' && (
             <div className="space-y-2">
                <Label htmlFor="teacher-code">كود الأستاذ</Label>
                <Input id="teacher-code" value={teacherCode} onChange={(e) => setTeacherCode(e.target.value)} />
            </div>
          )}

        </CardContent>
        <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" asChild>
                <Link href="/dashboard/directeur/users">إلغاء</Link>
            </Button>
            <Button variant="accent" onClick={handleUpdate} disabled={isUpdating}>
                 {isUpdating ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="ml-2 h-4 w-4"/>
                      حفظ التغييرات
                    </>
                  )}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
