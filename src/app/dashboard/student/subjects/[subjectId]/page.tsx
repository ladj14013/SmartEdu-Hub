
'use client';
import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, Wand2, Loader2, Link2 } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, query, where, arrayUnion, updateDoc } from 'firebase/firestore';
import type { Subject, Lesson, User as UserType, Level, Stage } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getTeacherByCode } from '@/app/actions/teacher-actions';


function TeacherLinkCard({ student, onLinkSuccess }: { student: UserType | null, onLinkSuccess: () => void }) {
    const [teacherCode, setTeacherCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLinking, setIsLinking] = useState(false);
    const [verificationResult, setVerificationResult] = useState<{ success: boolean; message: string; teacherId?: string, teacherName?: string } | null>(null);
    const { toast } = useToast();
    const firestore = useFirestore();

    const handleVerify = async () => {
        if (!teacherCode || !student?.subjectId) return;
        setIsLoading(true);
        setVerificationResult(null);

        try {
            const result = await getTeacherByCode({ teacherCode, subjectId: student.subjectId });
            if (result.success) {
                setVerificationResult({ success: true, message: `تم العثور على الأستاذ: ${result.teacherName}`, teacherId: result.teacherId, teacherName: result.teacherName });
            } else {
                setVerificationResult({ success: false, message: result.error || 'فشل التحقق.' });
            }
        } catch (error) {
            console.error(error);
            setVerificationResult({ success: false, message: 'حدث خطأ أثناء التحقق. الرجاء المحاولة مرة أخرى.' });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleLink = async () => {
        if (!firestore || !student?.id || !verificationResult?.teacherId) return;
        setIsLinking(true);

        try {
            const studentRef = doc(firestore, 'users', student.id);
            // Use a specific field for linked teachers to avoid overwriting the whole map
            // The key is the subjectId and the value is the teacherId
            const updatePayload = {
              [`linkedTeachers.${student.subjectId}`]: verificationResult.teacherId
            };

            await updateDoc(studentRef, updatePayload);

            toast({
                title: "تم الربط بنجاح!",
                description: `لقد تم ربطك بالأستاذ ${verificationResult.teacherName} في هذه المادة.`,
            });
            onLinkSuccess(); // Trigger refetch in parent component
            setVerificationResult(null); // Reset the card
            setTeacherCode('');
        } catch (error) {
            console.error("Linking failed:", error);
            toast({
                title: "فشل الربط",
                description: "حدث خطأ أثناء محاولة الربط. الرجاء المحاولة لاحقاً.",
                variant: "destructive"
            });
        } finally {
            setIsLinking(false);
        }
    };

    // Check if the student is already linked for this specific subject
    if (student?.linkedTeachers && student.linkedTeachers[student.subjectId]) {
        return null; // Don't show the card if already linked
    }


    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Link2 className="h-6 w-6 text-primary" />
                    <CardTitle>الارتباط مع أستاذ المادة</CardTitle>
                </div>
                <CardDescription>
                    أدخل الكود الذي حصلت عليه من أستاذك للوصول إلى دروسه الخاصة وتمارينه.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                    <Input 
                        placeholder="أدخل كود الأستاذ هنا..." 
                        value={teacherCode}
                        onChange={(e) => setTeacherCode(e.target.value)}
                        className="font-mono text-center tracking-widest"
                        disabled={!!(verificationResult?.success) || isLinking}
                    />
                    <Button onClick={handleVerify} disabled={isLoading || !teacherCode || !!(verificationResult?.success)} className="w-full sm:w-auto">
                        {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 />}
                        تحقق
                    </Button>
                </div>
                {verificationResult && !verificationResult.success && (
                    <div className={`text-sm font-medium p-2 rounded-md text-center bg-red-100 text-red-800`}>
                        {verificationResult.message}
                    </div>
                )}
                 {verificationResult && verificationResult.success && (
                    <div className={`text-sm font-medium p-2 rounded-md text-center bg-green-100 text-green-800`}>
                       {verificationResult.message}
                    </div>
                )}
            </CardContent>
            {verificationResult?.success && (
                 <CardContent>
                    <Button onClick={handleLink} className="w-full" variant="accent" disabled={isLinking}>
                        {isLinking ? <Loader2 className="animate-spin ml-2" /> : null}
                        تأكيد الربط مع الأستاذ
                    </Button>
                 </CardContent>
            )}
        </Card>
    );
}


export default function SubjectPage() {
  const params = useParams();
  const subjectId = Array.isArray(params.subjectId) ? params.subjectId[0] : params.subjectId;
  const firestore = useFirestore();
  const { user: authUser, isLoading: isAuthLoading } = useUser();
  
  // --- Data Fetching ---
  const subjectRef = useMemoFirebase(() => firestore && subjectId ? doc(firestore, 'subjects', subjectId) : null, [firestore, subjectId]);
  const studentRef = useMemoFirebase(() => (firestore && authUser) ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  
  const { data: subject, isLoading: isSubjectLoading } = useDoc<Subject>(subjectRef);
  const { data: student, isLoading: isStudentLoading, refetch: refetchStudent } = useDoc<UserType>(studentRef);

  const levelRef = useMemoFirebase(() => (firestore && student?.levelId) ? doc(firestore, 'levels', student.levelId) : null, [firestore, student?.levelId]);
  const { data: level, isLoading: isLevelLoading } = useDoc<Level>(levelRef);

  const stageRef = useMemoFirebase(() => (firestore && student?.stageId) ? doc(firestore, 'stages', student.stageId) : null, [firestore, student?.stageId]);
  const { data: stage, isLoading: isStageLoading } = useDoc<Stage>(stageRef);

  // Fetch public lessons for the student's level in this subject
  const publicLessonsQuery = useMemoFirebase(() => {
    if (!firestore || !student?.levelId || !subjectId) return null;
    return query(
        collection(firestore, 'lessons'), 
        where('subjectId', '==', subjectId),
        where('levelId', '==', student.levelId),
        where('type', '==', 'public')
    );
  }, [firestore, subjectId, student?.levelId]);
  const { data: publicLessons, isLoading: arePublicLessonsLoading } = useCollection<Lesson>(publicLessonsQuery);
  
  // Determine the teacher ID for this subject from the student's linked teachers
  const linkedTeacherId = student?.linkedTeachers?.[subjectId];

  // Fetch private lessons from the linked teacher for this subject
  const privateLessonsQuery = useMemoFirebase(() => {
    if (!firestore || !linkedTeacherId || !student?.levelId) return null;
    return query(
        collection(firestore, 'lessons'),
        where('subjectId', '==', subjectId),
        where('levelId', '==', student.levelId),
        where('authorId', '==', linkedTeacherId),
        where('type', '==', 'private')
    );
  }, [firestore, subjectId, student?.levelId, linkedTeacherId]);
  const { data: privateLessons, isLoading: arePrivateLessonsLoading } = useCollection<Lesson>(privateLessonsQuery);

  const allLessons = useMemo(() => {
    const lessonsMap = new Map<string, Lesson>();
    (publicLessons || []).forEach(lesson => lessonsMap.set(lesson.id, lesson));
    (privateLessons || []).forEach(lesson => lessonsMap.set(lesson.id, lesson));
    return Array.from(lessonsMap.values());
  }, [publicLessons, privateLessons]);

  const isLoading = isSubjectLoading || isAuthLoading || isStudentLoading || arePublicLessonsLoading || arePrivateLessonsLoading || isLevelLoading || isStageLoading;

  if (isLoading) {
    return (
        <div className="space-y-6">
            <PageHeader title={<Skeleton className="h-8 w-48" />} description="جاري تحميل تفاصيل المادة...">
                 <Skeleton className="h-10 w-32" />
            </PageHeader>
            <Skeleton className="h-48 w-full" />
        </div>
    )
  }

  if (!subject) {
    return <div>المادة غير موجودة.</div>;
  }
  
  const title = `مادة: ${subject.name || ''}`;
  const description = `${level?.name || ''} - ${stage?.name || ''}`;


  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
      >
        <Button variant="outline" asChild>
          <Link href="/dashboard/student/subjects">
            <ArrowRight className="ml-2 h-4 w-4" /> العودة للمواد
          </Link>
        </Button>
      </PageHeader>

      <TeacherLinkCard student={{...student, subjectId}} onLinkSuccess={refetchStudent} />
      
    </div>
  );
}
