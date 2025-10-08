'use client';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { GraduationCap, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import type { Subject, Level, Stage, User as UserType } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentSubjectsPage() {
    const firestore = useFirestore();
    const { user: authUser, isLoading: isAuthLoading } = useUser();

    // Get current student data
    const studentRef = useMemoFirebase(() => (firestore && authUser) ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
    const { data: student, isLoading: isStudentLoading } = useDoc<UserType>(studentRef);

    // Get subjects for the student's stage
    const subjectsQuery = useMemoFirebase(() => {
        if (!firestore || !student?.stageId) return null;
        return query(collection(firestore, 'subjects'), where('stageId', '==', student.stageId));
    }, [firestore, student?.stageId]);
    const { data: availableSubjects, isLoading: areSubjectsLoading } = useCollection<Subject>(subjectsQuery);

    const isLoading = isAuthLoading || isStudentLoading || areSubjectsLoading;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="المواد الدراسية"
                    description="جاري تحميل المواد المتاحة لك..."
                />
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({length: 3}).map((_, i) => (
                        <Card key={i}>
                            <CardHeader><Skeleton className="h-6 w-32" /><Skeleton className="h-4 w-48 mt-2" /></CardHeader>
                            <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
                        </Card>
                    ))}
                 </div>
            </div>
        )
    }

  return (
    <div className="space-y-6">
      <PageHeader
        title="المواد الدراسية"
        description="تصفح المواد المتاحة لك وابدأ في استكشاف الدروس."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableSubjects?.map(subject => {
            return (
                <Card key={subject.id} className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className='space-y-1.5'>
                                <CardTitle>{subject.name}</CardTitle>
                                <CardDescription>{subject.description}</CardDescription>
                            </div>
                            <GraduationCap className="h-6 w-6 text-primary" />
                        </div>
                    </CardHeader>
                    <CardFooter className="mt-auto">
                        <Button asChild variant="accent" className="w-full">
                            <Link href={`/dashboard/student/subjects/${subject.id}`}>
                                عرض المادة <ArrowLeft className="mr-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            )
        })}
        {availableSubjects?.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground">
                لا توجد مواد دراسية متاحة لمرحلتك الدراسية حالياً.
            </p>
        )}
      </div>
    </div>
  );
}
