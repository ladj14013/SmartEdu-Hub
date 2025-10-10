
'use client';
import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, User, CheckCircle, Lock, PlayCircle, Loader2, XCircle, Search } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, query, where, updateDoc, arrayUnion, arrayRemove, deleteField, getDocs } from 'firebase/firestore';
import type { Subject, Lesson, User as UserType } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';
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
import { getTeacherByCode } from '@/app/actions/teacher-actions';


export default function SubjectPage() {
  const params = useParams();
  const subjectId = Array.isArray(params.subjectId) ? params.subjectId[0] : params.subjectId;
  const firestore = useFirestore();
  const { user: authUser, isLoading: isAuthLoading } = useUser();
  const { toast } = useToast();
  
  // State for the linking process
  const [teacherCode, setTeacherCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{ teacherId: string, teacherName: string } | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // State to hold teacher name after linking, to avoid re-fetching
  const [linkedTeacherName, setLinkedTeacherName] = useState<string | null>(null);

  // State for unlinking
  const [isUnlinking, setIsUnlinking] = useState(false);
  
  // --- Data Fetching ---
  const subjectRef = useMemoFirebase(() => firestore && subjectId ? doc(firestore, 'subjects', subjectId) : null, [firestore, subjectId]);
  const studentRef = useMemoFirebase(() => (firestore && authUser) ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  
  const { data: subject, isLoading: isSubjectLoading } = useDoc<Subject>(subjectRef);
  const { data: student, isLoading: isStudentLoading, refetch: refetchStudent } = useDoc<UserType>(studentRef);

  const linkedTeacherId = student?.linkedTeachers?.[subjectId as string];
  
  const teacherRef = useMemoFirebase(() => (firestore && linkedTeacherId) ? doc(firestore, 'users', linkedTeacherId) : null, [firestore, linkedTeacherId]);
  const { data: linkedTeacher, isLoading: isTeacherLoading } = useDoc<UserType>(teacherRef);

  // Set the teacher's name from the document if it's already linked on page load
  useEffect(() => {
    if (linkedTeacher) {
      setLinkedTeacherName(linkedTeacher.name);
    }
  }, [linkedTeacher]);


  const lessonsQuery = useMemoFirebase(() => {
    if (!firestore || !student || !subjectId) return null;
    return query(collection(firestore, 'lessons'), where('subjectId', '==', subjectId));
  }, [firestore, subjectId, student]);

  const { data: allLessons, isLoading: areLessonsLoading } = useCollection<Lesson>(lessonsQuery);
  
  const lessons = allLessons?.filter(l => 
      (l.type === 'public' && l.levelId === student?.levelId) || 
      (l.type === 'private' && l.authorId === linkedTeacherId && l.levelId === student?.levelId)
  );

  const isLoading = isSubjectLoading || isAuthLoading || isStudentLoading || areLessonsLoading || (linkedTeacherId && isTeacherLoading);

  const resetVerification = () => {
    setVerificationResult(null);
    setVerificationError(null);
  }

  const handleVerifyCode = async () => {
    if (!teacherCode.trim() || !subjectId) return;
    setIsVerifying(true);
    resetVerification();
    
    const { teacherId, teacherName, errorCode, errorMessage } = await getTeacherByCode({ teacherCode: teacherCode.trim(), subjectId: subjectId as string });
    
    if (errorCode || !teacherId) {
        setVerificationError(errorMessage || 'حدث خطأ غير متوقع.');
    } else {
        setVerificationResult({ teacherId, teacherName: teacherName! });
    }
    
    setIsVerifying(false);
  }
  
  const handleLinkTeacher = async () => {
    if (!firestore || !student || !verificationResult) return;
    setIsLinking(true);
    try {
        // Add teacher to student's linkedTeachers map
        const studentDocRef = doc(firestore, 'users', student.id);
        await updateDoc(studentDocRef, {
            [`linkedTeachers.${subjectId}`]: verificationResult.teacherId
        });

        // Add student to teacher's linkedStudentIds array
        const teacherDocRef = doc(firestore, 'users', verificationResult.teacherId);
        await updateDoc(teacherDocRef, {
          linkedStudentIds: arrayUnion(student.id)
        });

        toast({ title: 'تم الربط بنجاح', description: `لقد تم ربطك مع الأستاذ ${verificationResult.teacherName} في هذه المادة.` });
        
        // Use the verified name directly instead of re-fetching
        setLinkedTeacherName(verificationResult.teacherName);

        setTeacherCode('');
        resetVerification();
        refetchStudent();

    } catch (error) {
        console.error("Failed to link teacher:", error);
        toast({ title: 'فشل الربط', description: 'حدث خطأ أثناء محاولة الربط مع الأستاذ.', variant: 'destructive' });
    } finally {
        setIsLinking(false);
    }
  }

  const handleUnlinkTeacher = async () => {
    if (!firestore || !student || !subjectId || !linkedTeacherId) return;
    setIsUnlinking(true);

    try {
      // 1. Remove teacher from student's linkedTeachers map
      const studentDocRef = doc(firestore, 'users', student.id);
      await updateDoc(studentDocRef, {
        [`linkedTeachers.${subjectId}`]: deleteField()
      });

      // 2. Remove student from teacher's linkedStudentIds array
      const teacherDocRef = doc(firestore, 'users', linkedTeacherId);
      await updateDoc(teacherDocRef, {
        linkedStudentIds: arrayRemove(student.id)
      });

      toast({ title: 'تم إلغاء الارتباط بنجاح', description: `لم تعد مرتبطًا بالأستاذ في هذه المادة.` });
      setLinkedTeacherName(null); // Clear the stored name
      refetchStudent();
    } catch (error) {
      console.error("Failed to unlink teacher:", error);
      toast({ title: 'فشل إلغاء الارتباط', description: 'حدث خطأ أثناء محاولة إلغاء الارتباط.', variant: 'destructive' });
    } finally {
      setIsUnlinking(false);
    }
  };


  if (isLoading && !linkedTeacherName) { // Also check for linkedTeacherName
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
            <div className="flex items-center justify-between p-4 bg-green-50 border-r-4 border-green-500 rounded-md">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <p className="font-semibold">
                    أنت مرتبط مع الأستاذ: {isTeacherLoading && !linkedTeacherName ? <Loader2 className="inline-block h-4 w-4 animate-spin" /> : <span className="text-primary">{linkedTeacherName || 'أستاذ غير معروف'}</span>}
                </p>
              </div>
               <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={isUnlinking}>
                        {isUnlinking ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <XCircle className="ml-2 h-4 w-4" />}
                        إلغاء الارتباط
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>هل أنت متأكد من إلغاء الارتباط؟</AlertDialogTitle>
                      <AlertDialogDescription>
                        لن تتمكن من الوصول إلى الدروس الخاصة بهذا الأستاذ بعد الآن. يمكنك الارتباط به مرة أخرى في أي وقت.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>تراجع</AlertDialogCancel>
                      <AlertDialogAction onClick={handleUnlinkTeacher}>نعم، قم بالإلغاء</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Input placeholder="أدخل كود الأستاذ" className="flex-1" value={teacherCode} onChange={(e) => { setTeacherCode(e.target.value); resetVerification(); }} disabled={isVerifying || isLinking} />
                <Button onClick={handleVerifyCode} disabled={isVerifying || !teacherCode.trim() || !!verificationResult}>
                  {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="ml-2 h-4 w-4" />}
                  تحقق من الكود
                </Button>
              </div>

              {verificationError && (
                 <div className="p-3 text-sm text-destructive-foreground bg-destructive rounded-md">{verificationError}</div>
              )}

              {verificationResult && (
                <div className="space-y-3">
                    <div className="p-3 text-sm text-green-800 bg-green-100 rounded-md border border-green-200">
                        تم العثور على الأستاذ: <span className="font-bold">{verificationResult.teacherName}</span>. هل تريد تأكيد الربط؟
                    </div>
                    <Button onClick={handleLinkTeacher} disabled={isLinking} className='w-full'>
                         {isLinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <User className="ml-2 h-4 w-4" />}
                         نعم، تأكيد الربط
                    </Button>
                </div>
              )}
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
             {(areLessonsLoading || isStudentLoading) ? 
                <div className="p-8 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /></div> :
                lessons?.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                      لا توجد دروس في هذه المادة لمستواك الدراسي حتى الآن.
                  </div>
              )
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
