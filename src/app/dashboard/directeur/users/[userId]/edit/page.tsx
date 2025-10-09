
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, arrayRemove, getDoc, deleteField, arrayUnion } from 'firebase/firestore';
import type { User as UserType, Role, Stage, Level, Subject } from '@/lib/types';

import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Save, Loader2, XCircle, Link as LinkIcon, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { getTeacherByCode } from '@/app/actions/teacher-actions';


// A small component to manage unlinking
function LinkedTeacherItem({ studentId, subjectId, teacherId, onUnlink }: { studentId: string, subjectId: string, teacherId: string, onUnlink: () => void }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [teacher, setTeacher] = useState<UserType | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlinking, setIsUnlinking] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!firestore) return;
      try {
        const teacherDoc = await getDoc(doc(firestore, 'users', teacherId));
        if (teacherDoc.exists()) setTeacher(teacherDoc.data() as UserType);

        const subjectDoc = await getDoc(doc(firestore, 'subjects', subjectId));
        if (subjectDoc.exists()) setSubject(subjectDoc.data() as Subject);
      } catch (error) {
        console.error("Error fetching linked data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [firestore, teacherId, subjectId]);
  
  const handleUnlink = async () => {
    if (!firestore) return;
    setIsUnlinking(true);
    try {
      // 1. Remove student from teacher's list
      const teacherRef = doc(firestore, 'users', teacherId);
      await updateDoc(teacherRef, {
        linkedStudentIds: arrayRemove(studentId)
      });
      // 2. Remove teacher from student's map
      const studentRef = doc(firestore, 'users', studentId);
      await updateDoc(studentRef, {
        [`linkedTeachers.${subjectId}`]: deleteField()
      });
      toast({ title: 'تم فك الارتباط', description: `تم فك ارتباط التلميذ من الأستاذ ${teacher?.name} لهذه المادة.` });
      onUnlink(); // Trigger a refetch on the parent component
    } catch (error) {
      console.error("Error unlinking:", error);
      toast({ title: "فشل فك الارتباط", variant: 'destructive' });
    } finally {
      setIsUnlinking(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }
  
  return (
     <div className="flex items-center justify-between p-2 rounded-md bg-muted">
      <div>
        <p className="font-semibold text-sm">{teacher?.name || 'أستاذ محذوف'}</p>
        <p className="text-xs text-muted-foreground">مادة: {subject?.name || 'مادة محذوفة'}</p>
      </div>
      <Button size="sm" variant="ghost" className="text-red-500" onClick={handleUnlink} disabled={isUnlinking}>
        {isUnlinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 ml-2" />}
        فك الارتباط
      </Button>
    </div>
  )
}


function LinkTeacherDialog({ student, allSubjects, onLink }: { student: UserType, allSubjects: Subject[], onLink: () => void }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [teacherCode, setTeacherCode] = useState('');
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{ teacherId: string, teacherName: string } | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  
  const availableSubjects = allSubjects.filter(
    (subject) =>
      subject.stageId === student.stageId &&
      !student.linkedTeachers?.[subject.id]
  );
  
  const resetVerification = () => {
    setVerificationResult(null);
    setVerificationError(null);
  }

  const resetAll = () => {
    resetVerification();
    setSelectedSubjectId('');
    setTeacherCode('');
    setIsLinking(false);
    setIsVerifying(false);
  }

  const handleVerifyCode = async () => {
    if (!selectedSubjectId || !teacherCode.trim()) return;
    setIsVerifying(true);
    resetVerification();

    const { teacherId, teacherName, errorCode, errorMessage } = await getTeacherByCode({ teacherCode: teacherCode.trim(), subjectId: selectedSubjectId });

    if (errorCode || !teacherId) {
      setVerificationError(errorMessage || 'حدث خطأ غير متوقع.');
    } else {
      setVerificationResult({ teacherId, teacherName: teacherName! });
    }
    
    setIsVerifying(false);
  }
  
  const handleLink = async () => {
    if (!firestore || !verificationResult) return;
    setIsLinking(true);
    try {
      const studentRef = doc(firestore, 'users', student.id);
      await updateDoc(studentRef, {
        [`linkedTeachers.${selectedSubjectId}`]: verificationResult.teacherId,
      });

      const teacherRef = doc(firestore, 'users', verificationResult.teacherId);
      await updateDoc(teacherRef, {
        linkedStudentIds: arrayUnion(student.id),
      });

      toast({ title: 'تم الربط بنجاح', description: `تم ربط التلميذ بالأستاذ ${verificationResult.teacherName}.` });
      setIsOpen(false);
      onLink();
    } catch (error) {
      toast({ title: 'فشل الربط', variant: 'destructive' });
      console.error("Linking failed:", error);
    } finally {
      setIsLinking(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      resetAll();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <LinkIcon className="ml-2 h-4 w-4" /> ربط بأستاذ
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ربط التلميذ بأستاذ</DialogTitle>
          <DialogDescription>اختر المادة وأدخل كود الأستاذ لإتمام عملية الربط.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="link-subject">المادة</Label>
            <Select value={selectedSubjectId} onValueChange={(value) => { setSelectedSubjectId(value); resetVerification(); }} disabled={!!verificationResult}>
              <SelectTrigger id="link-subject">
                <SelectValue placeholder="اختر المادة..." />
              </SelectTrigger>
              <SelectContent>
                {availableSubjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="link-code">كود الأستاذ</Label>
            <div className="flex items-center gap-2">
                <Input id="link-code" value={teacherCode} onChange={(e) => { setTeacherCode(e.target.value); resetVerification(); }} disabled={!selectedSubjectId || isVerifying || !!verificationResult} />
                <Button onClick={handleVerifyCode} disabled={isVerifying || !teacherCode.trim() || !selectedSubjectId || !!verificationResult}>
                  {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="ml-1 h-4 w-4" />}
                   تحقق
                </Button>
            </div>
          </div>
          {verificationError && (
              <div className="p-3 text-sm text-destructive-foreground bg-destructive rounded-md">{verificationError}</div>
          )}
          {verificationResult && (
             <div className="p-3 text-sm text-green-800 bg-green-100 rounded-md border border-green-200">
                تم العثور على الأستاذ: <span className="font-bold">{verificationResult.teacherName}</span>.
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="outline">إلغاء</Button></DialogClose>
          <Button onClick={handleLink} disabled={isLinking || !verificationResult}>
            {isLinking ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <LinkIcon className="ml-2 h-4 w-4" />}
             ربط
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function EditUserPage({ params }: { params: { userId: string } }) {
  const { userId } = params;
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  // --- Data Fetching ---
  const userRef = useMemoFirebase(() => firestore ? doc(firestore, 'users', userId) : null, [firestore, userId]);
  const stagesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'stages') : null, [firestore]);
  const levelsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'levels') : null, [firestore]);
  const subjectsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'subjects') : null, [firestore]);

  const { data: user, isLoading: isLoadingUser, refetch: refetchUser } = useDoc<UserType>(userRef);
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
  const filteredSubjects = subjects?.filter(s => s.stageId === stageId) || [];

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

  const linkedTeachersArray = user.role === 'student' && user.linkedTeachers ? Object.entries(user.linkedTeachers) : [];

  return (
    <div className="space-y-6">
      <PageHeader title="تعديل المستخدم" description={`أنت تقوم بتعديل بيانات ${user.name}`} />

      <div className="max-w-2xl mx-auto grid grid-cols-1 gap-6">
        <Card>
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

        {user.role === 'student' && (
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>الأساتذة المرتبطون</CardTitle>
                <CardDescription>إدارة ارتباط هذا التلميذ بالأساتذة.</CardDescription>
              </div>
              <LinkTeacherDialog student={user} allSubjects={subjects || []} onLink={refetchUser} />
            </CardHeader>
            <CardContent className="space-y-2">
              {linkedTeachersArray.length > 0 ? (
                linkedTeachersArray.map(([subjectId, teacherId]) => (
                  <LinkedTeacherItem
                    key={subjectId}
                    studentId={user.id}
                    subjectId={subjectId}
                    teacherId={teacherId}
                    onUnlink={refetchUser}
                  />
                ))
              ) : (
                <p className="text-center text-muted-foreground text-sm p-4">هذا التلميذ غير مرتبط بأي أستاذ.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
