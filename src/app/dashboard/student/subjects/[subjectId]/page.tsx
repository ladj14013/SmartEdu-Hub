'use client';
import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, User, CheckCircle, Lock, PlayCircle, Loader2, Link2Off } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, query, where, updateDoc, getDocs, arrayRemove } from 'firebase/firestore';
import type { Subject, Lesson, User as UserType } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';
import { getTeacherByCode } from '@/app/actions/teacher-actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


export default function SubjectPage() {
  const params = useParams();
  const subjectId = Array.isArray(params.subjectId) ? params.subjectId[0] : params.subjectId;
  const firestore = useFirestore();
  const { user: authUser, isLoading: isAuthLoading } = useUser();
  const { toast } = useToast();
  
  const [isLinking, setIsLinking] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [teacherCode, setTeacherCode] = useState('');
  const [linkedTeacherName, setLinkedTeacherName] = useState<string | null>(null);
  const [isFetchingTeacherName, setIsFetchingTeacherName] = useState(false);
  
  // --- Data Fetching ---
  const subjectRef = useMemoFirebase(() => firestore && subjectId ? doc(firestore, 'subjects', subjectId) : null, [firestore, subjectId]);
  const studentRef = useMemoFirebase(() => (firestore && authUser) ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  
  const { data: subject, isLoading: isSubjectLoading } = useDoc<Subject>(subjectRef);
  const { data: student, isLoading: isStudentLoading, refetch: refetchStudent } = useDoc<UserType>(studentRef);

  const linkedTeacherId = student?.linkedTeachers?.[subjectId as string];
  
  // Effect to fetch teacher name if already linked on page load
  useEffect(() => {
    const fetchName = async () => {
      if (linkedTeacherId) {
        setIsFetchingTeacherName(true);
        try {
          const result = await getTeacherByCode({ teacherId: linkedTeacherId });
          if (result && result.teacherName) {
            setLinkedTeacherName(result.teacherName);
          } else {
            setLinkedTeacherName('أستاذ غير معروف'); // Fallback
          }
        } catch (error) {
            console.error("Failed to fetch teacher name:", error);
            setLinkedTeacherName('أستاذ غير معروف');
        } finally {
            setIsFetchingTeacherName(false);
        }
      } else {
        setLinkedTeacherName(null);
      }
    };
    fetchName();
  }, [linkedTeacherId]);


  const lessonsQuery = useMemoFirebase(() => {
    if (!firestore || !student || !subjectId) return null;
    return query(collection(firestore, 'lessons'), where('subjectId', '==', subjectId));
  }, [firestore, subjectId, student]);

  const { data: allLessons, isLoading: areLessonsLoading } = useCollection<Lesson>(lessonsQuery);
  
  const lessons = allLessons?.filter(l => 
      (l.type === 'public' && l.levelId === student?.levelId) || 
      (l.type === 'private' && l.authorId === linkedTeacherId && l.levelId === student?.levelId)
  );

  const isLoading = isSubjectLoading || isAuthLoading || isStudentLoading || areLessonsLoading;
  
  const handleLinkTeacher = async () => {
    if (!firestore || !student || !teacherCode.trim() || !subjectId) return;
    setIsLinking(true);
    try {
        const result = await getTeacherByCode({ teacherCode: teacherCode.trim(), subjectId: subjectId as string });
        
        if (result.error || !result.teacherId) {
            toast({ title: 'الكود غير صحيح', description: result.error || 'لم يتم العثور على أستاذ بهذا الكود لهذه المادة.', variant: 'destructive' });
            setIsLinking(false);
            return;
        }
        
        // Add teacher to student's linkedTeachers map
        const studentDocRef = doc(firestore, 'users', student.id);
        await updateDoc(studentDocRef, {
            [`linkedTeachers.${subjectId}`]: result.teacherId
        });

        // Add student to teacher's linkedStudentIds array
        const teacherDocRef = doc(firestore, 'users', result.teacherId);
        await updateDoc(teacherDocRef, {
          linkedStudentIds: arrayUnion(student.id)
        });


        toast({ title: 'تم الربط بنجاح', description: `لقد تم ربطك مع الأستاذ ${result.teacherName} في هذه المادة.` });
        setLinkedTeacherName(result.teacherName!); // Set name directly after linking
        refetchStudent();

    } catch (error) {
        console.error("Failed to link teacher:", error);
        toast({ title: 'فشل الربط', description: 'حدث خطأ أثناء محاولة الربط مع الأستاذ.', variant: 'destructive' });
    } finally {
        setIsLinking(false);
    }
  }

  const handleUnlinkTeacher = async () => {
    if (!firestore || !student || !linkedTeacherId || !subjectId) return;
    setIsUnlinking(true);

    try {
        const studentDocRef = doc(firestore, 'users', student.id);
        const teacherDocRef = doc(firestore, 'users', linkedTeacherId);

        // Remove studentId from teacher's linkedStudentIds array
        await updateDoc(teacherDocRef, {
            linkedStudentIds: arrayRemove(student.id)
        });

        // Remove teacherId from student's linkedTeachers map
        await updateDoc(studentDocRef, {
            [`linkedTeachers.${subjectId}`]: deleteField()
        });

        toast({ title: 'تم إلغاء الارتباط بنجاح', description: 'لم تعد مرتبطاً بهذا الأستاذ في هذه المادة.' });
        setLinkedTeacherName(null);
        refetchStudent();
    } catch (error) {
        console.error("Failed to unlink teacher:", error);
        toast({ title: 'فشل إلغاء الارتباط', description: 'حدث خطأ أثناء محاولة إلغاء الارتباط.', variant: 'destructive' });
    } finally {
        setIsUnlinking(false);
    }
  };


  if (isLoading) {
    return (
        <div className="space-y-6">
            <PageHeader title={<Skeleton className="h-8 w-48" />} description="جاري تحميل تفاصيل المادة...">
                 <Skeleton className="h-10 w-32" />
            </PageHeader>
            <Card><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
            <Card><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
        </div>
    )
  }

  if (!subject) {
    return <div>المادة غير موجودة.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`مادة: ${subject.name}`}
        description={subject.description || 'وصف المادة'}
      >
        <Button variant="outline" asChild>
          <Link href="/dashboard/student/subjects">
            <ArrowRight className="ml-2 h-4 w-4" /> العودة للمواد
          </Link>
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>الربط مع أستاذ المادة</CardTitle>
          <CardDescription>أدخل كود الأستاذ الخاص بهذه المادة للوصول إلى دروسه الخاصة.</CardDescription>
        </CardHeader>
        <CardContent>
          {linkedTeacherId ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-green-50 border-r-4 border-green-500 rounded-md">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold">
                      أنت مرتبط مع الأستاذ: {isFetchingTeacherName ? <Loader2 className="inline-block h-4 w-4 animate-spin" /> : <span className="text-primary">{linkedTeacherName}</span>}
                  </p>
                  <p className="text-sm text-muted-foreground">يمكنك الآن الوصول إلى الدروس الخاصة بهذا الأستاذ.</p>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={isUnlinking}>
                        {isUnlinking ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Link2Off className="ml-2 h-4 w-4" />}
                        إلغاء الارتباط
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                    <AlertDialogDescription>
                        سيؤدي هذا الإجراء إلى إلغاء ارتباطك بالأستاذ في هذه المادة. ستفقد الوصول إلى دروسه الخاصة. يمكنك الارتباط به مرة أخرى لاحقًا باستخدام كوده.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction onClick={handleUnlinkTeacher} disabled={isUnlinking}>
                        {isUnlinking ? 'جاري الإلغاء...' : 'تأكيد'}
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input placeholder="أدخل كود الأستاذ" className="flex-1" value={teacherCode} onChange={(e) => setTeacherCode(e.target.value)} disabled={isLinking} />
              <Button variant="accent" onClick={handleLinkTeacher} disabled={isLinking || !teacherCode.trim()}>
                {isLinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <User className="ml-2 h-4 w-4" />}
                 ربط الحساب
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle>قائمة الدروس</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {lessons?.map((lesson) => {
              const isCompleted = false; // Mock status
              const isAvailable = !lesson.isLocked;
              const lessonStatus = isCompleted ? 'completed' : (isAvailable ? 'available' : 'locked');
              
              const statusMap = {
                  completed: { icon: CheckCircle, text: 'مكتمل', color: 'text-green-500' },
                  available: { icon: PlayCircle, text: 'متاح', color: 'text-primary' },
                  locked: { icon: Lock, text: 'مقفل', color: 'text-muted-foreground' }
              }
              const { icon: Icon, text, color } = statusMap[lessonStatus];
              
              const Wrapper = isAvailable ? Link : 'div';

              return (
              <Wrapper key={lesson.id} href={isAvailable ? `/dashboard/student/lessons/${lesson.id}` : '#'} className={`flex items-center justify-between p-4 ${isAvailable ? 'hover:bg-muted/50 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}>
                <div className="flex items-center gap-4">
                    <span className="font-medium">{lesson.title}</span>
                </div>
                <Badge variant="outline" className={`gap-2 ${color}`}>
                    <Icon className="h-4 w-4" />
                    {text}
                </Badge>
              </Wrapper>
            )})}
             {lessons?.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                    لا توجد دروس في هذه المادة لمستواك الدراسي حتى الآن.
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
