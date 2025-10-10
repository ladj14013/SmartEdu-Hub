
'use client';
import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, Lock, PlayCircle, Loader2, Link2, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import type { Subject, Lesson, User as UserType } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';


// Mock function - in a real scenario this would be a server action
const verifyTeacherCode = async (code: string): Promise<{ success: boolean; teacherName?: string; error?: string }> => {
  if (code.toUpperCase() === 'ABC123XYZ') {
    return { success: true, teacherName: 'أ. أحمد محمود' };
  }
  return { success: false, error: 'الكود غير صحيح. الرجاء التأكد منه.' };
}

function TeacherLinkCard() {
    const [teacherCode, setTeacherCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [verificationResult, setVerificationResult] = useState<{success: boolean, message: string} | null>(null);
    const { toast } = useToast();

    const handleVerify = async () => {
        if (!teacherCode) return;
        setIsLoading(true);
        setVerificationResult(null);
        // This is a mock implementation
        const result = await verifyTeacherCode(teacherCode);
        if (result.success) {
            setVerificationResult({ success: true, message: `تم العثور على الأستاذ: ${result.teacherName}` });
        } else {
            setVerificationResult({ success: false, message: result.error || 'فشل التحقق.' });
        }
        setIsLoading(false);
    }
    
    const handleLink = () => {
        // Mock linking logic
        toast({
            title: "تم الربط بنجاح!",
            description: "لقد تم ربطك بالأستاذ. يمكنك الآن الوصول لدروسه الخاصة.",
        });
        // Here you would typically update the student's document in Firestore
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
                        disabled={!!(verificationResult?.success)}
                    />
                    <Button onClick={handleVerify} disabled={isLoading || !teacherCode || !!(verificationResult?.success)} className="w-full sm:w-auto">
                        {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 />}
                        تحقق
                    </Button>
                </div>
                {verificationResult && (
                    <div className={`text-sm font-medium p-2 rounded-md text-center ${verificationResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {verificationResult.message}
                    </div>
                )}
            </CardContent>
            {verificationResult?.success && (
                 <CardContent>
                    <Button onClick={handleLink} className="w-full" variant="accent">
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

  const lessonsQuery = useMemoFirebase(() => {
    if (!firestore || !student || !subjectId) return null;
    // Only fetch public lessons for the student's level
    return query(
        collection(firestore, 'lessons'), 
        where('subjectId', '==', subjectId),
        where('levelId', '==', student.levelId),
        where('type', '==', 'public')
    );
  }, [firestore, subjectId, student]);

  const { data: lessons, isLoading: areLessonsLoading } = useCollection<Lesson>(lessonsQuery);

  const isLoading = isSubjectLoading || isAuthLoading || isStudentLoading || areLessonsLoading;

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

      <TeacherLinkCard />
      
    </div>
  );
}
