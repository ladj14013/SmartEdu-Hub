'use client';
import { useState, useMemo, useEffect } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, Wand2, Loader2, Link2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import type { Subject, Lesson, User as UserType, Level, Stage } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getTeacherByCode } from '@/app/actions/teacher-actions';
import { linkStudentToTeacher } from '@/app/actions/student-actions';
import { Badge } from '@/components/ui/badge';

function TeacherLinkCard({ student, onLinkSuccess }: { student: UserType | null, onLinkSuccess: () => void }) {
    const [teacherCode, setTeacherCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isLinking, setIsLinking] = useState(false);
    const [verificationResult, setVerificationResult] = useState<{ teacherName: string; teacherId: string } | null>(null);
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const params = useParams();
    const subjectId = params.subjectId as string;
    const { toast } = useToast();

    const handleVerifyCode = async () => {
        if (!teacherCode.trim() || !subjectId) return;

        setIsVerifying(true);
        setVerificationError(null);
        setVerificationResult(null);

        try {
            const result = await getTeacherByCode({ teacherCode, subjectId });

            if (result.success && result.teacherName && result.teacherId) {
                setVerificationResult({ teacherName: result.teacherName, teacherId: result.teacherId });
            } else {
                setVerificationError(result.error || 'فشل التحقق من الكود.');
            }
        } catch (error) {
            console.error("Verification failed:", error);
            setVerificationError('حدث خطأ غير متوقع أثناء التحقق.');
        } finally {
            setIsVerifying(false);
        }
    };
    
    const handleLinkStudent = async () => {
        if (!student || !verificationResult) return;
        setIsLinking(true);
        try {
            const result = await linkStudentToTeacher(student.id, subjectId, verificationResult.teacherId);
            if (result.success) {
                toast({
                    title: 'تم الارتباط بنجاح',
                    description: `أصبحت الآن مرتبطاً بالأستاذ ${verificationResult.teacherName}`,
                });
                onLinkSuccess(); // This will trigger a refetch of student data
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            toast({
                title: 'فشل الارتباط',
                description: error.message || 'حدث خطأ غير متوقع.',
                variant: 'destructive',
            });
        } finally {
            setIsLinking(false);
        }
    };
    
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
                        disabled={isVerifying || !!verificationResult}
                    />
                    <Button onClick={handleVerifyCode} disabled={isVerifying || !teacherCode.trim() || !!verificationResult} className="w-full sm:w-auto">
                        {isVerifying ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Wand2 className="ml-2 h-4 w-4" />}
                        {isVerifying ? 'جاري التحقق...' : 'تحقق'}
                    </Button>
                </div>
                {verificationError && (
                    <p className="text-sm font-medium text-destructive">{verificationError}</p>
                )}
                 {verificationResult && (
                     <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-800 rounded-md space-y-3">
                        <p className="font-semibold">تم العثور على الأستاذ: {verificationResult.teacherName}</p>
                        <Button onClick={handleLinkStudent} disabled={isLinking} size="sm" className="w-full sm:w-auto">
                           {isLinking ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Link2 className="ml-2 h-4 w-4" />}
                           {isLinking ? 'جاري الارتباط...' : 'تأكيد الارتباط'}
                        </Button>
                     </div>
                 )}
            </CardContent>
        </Card>
    );
}

const LessonListCard = ({ title, description, lessons, isLoading }: { title: string, description: string, lessons: Lesson[] | null, isLoading: boolean }) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ) : (
                <div className="divide-y rounded-md border">
                    {lessons && lessons.length > 0 ? (
                        lessons.map(lesson => (
                            <Link
                                key={lesson.id}
                                href={`/dashboard/student/lessons/${lesson.id}`}
                                className="flex items-center justify-between p-4 hover:bg-muted/50"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="font-medium">{lesson.title}</span>
                                    {lesson.type === 'private' && <Badge>خاص</Badge>}
                                </div>
                                <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                            </Link>
                        ))
                    ) : (
                        <div className="p-8 text-center text-muted-foreground">
                            لا توجد دروس متاحة في هذا القسم حتى الآن.
                        </div>
                    )}
                </div>
            )}
        </CardContent>
    </Card>
);

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

  const linkedTeacherId = student?.linkedTeachers?.[subjectId];

  // Fetch teacher name if already linked
  const linkedTeacherRef = useMemoFirebase(() => (firestore && linkedTeacherId) ? doc(firestore, 'users', linkedTeacherId) : null, [firestore, linkedTeacherId]);
  const { data: linkedTeacher, isLoading: isLinkedTeacherLoading } = useDoc<UserType>(linkedTeacherRef);

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

  const handleLinkSuccess = () => {
    refetchStudent();
  };

  const isLoading = isSubjectLoading || isAuthLoading || isStudentLoading || arePublicLessonsLoading || arePrivateLessonsLoading || isLevelLoading || isStageLoading || isLinkedTeacherLoading;

  if (isLoading && !subject) {
    return (
        <div className="space-y-6">
            <PageHeader title={<Skeleton className="h-8 w-48" />} description={<Skeleton className="h-4 w-72 mt-1" />}>
                 <Skeleton className="h-10 w-32" />
            </PageHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
    )
  }

  if (!subject) {
    return <div>المادة غير موجودة.</div>;
  }
  
  const pageTitle = `مادة: ${subject.name || ''}`;
  const pageDescription = `${level?.name || ''} - ${stage?.name || ''}`;
  const teacherName = linkedTeacher?.name || 'فلان';


  return (
    <div className="space-y-6">
      <PageHeader
        title={pageTitle}
        description={pageDescription}
      >
        <Button variant="outline" asChild>
          <Link href="/dashboard/student/subjects">
            <ArrowRight className="ml-2 h-4 w-4" /> العودة للمواد
          </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <LessonListCard 
            title="الدروس العامة"
            description="محتوى عام مقدم من مشرفي المادة."
            lessons={publicLessons}
            isLoading={arePublicLessonsLoading}
        />

        <div>
            {linkedTeacherId ? (
                 <LessonListCard 
                    title={`الدروس الخاصة بالأستاذ`}
                    description={`محتوى خاص مقدم من الأستاذ: ${teacherName}`}
                    lessons={privateLessons}
                    isLoading={arePrivateLessonsLoading || isLinkedTeacherLoading}
                />
            ) : (
                 <TeacherLinkCard student={student} onLinkSuccess={handleLinkSuccess} />
            )}
        </div>
      </div>
      
    </div>
  );
}
