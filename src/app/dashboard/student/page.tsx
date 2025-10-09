'use client';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Library, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User as UserType, Level } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

// A separate component to fetch and display level information
function StudentLevelInfo({ levelId }: { levelId: string | undefined }) {
    const firestore = useFirestore();
    const levelRef = useMemoFirebase(() => (firestore && levelId) ? doc(firestore, 'levels', levelId) : null, [firestore, levelId]);
    const { data: level, isLoading } = useDoc<Level>(levelRef);

    if (isLoading) {
        // Return a span to avoid nesting a div inside a p, which causes hydration errors.
        return <span className="inline-block h-5 w-32 animate-pulse rounded-md bg-muted" />;
    }

    return <strong className="font-bold text-amber-500">{level?.name || ''}</strong>;
}


export default function StudentDashboard() {
  const { user: authUser, isLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  const studentRef = useMemoFirebase(() => (firestore && authUser) ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: student, isLoading: isStudentLoading } = useDoc<UserType>(studentRef);
  
  const isLoading = isAuthLoading || isStudentLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={<Skeleton className="h-8 w-48" />}
          description="جاري تحميل بياناتك..."
        />
        <div className="grid gap-6 md:grid-cols-2">
           <Skeleton className="h-48 w-full" />
           <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={
            <div className="flex items-center gap-3">
              <span>
                مرحباً بعودتك : <span className="font-bold text-amber-500">{student?.name || ''}</span>
              </span>
            </div>
        }
        description={
            student?.levelId ? (
              <>
                استعد لرحلة تعلم ممتعة في <StudentLevelInfo levelId={student.levelId} />
              </>
            ) : (
              'أكمل إعدادات ملفك الشخصي.'
            )
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col justify-center items-center text-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            <Link href="/dashboard/student/subjects" className="block w-full h-full p-6">
                <CardHeader>
                    <Library className="h-12 w-12 mx-auto mb-4" />
                    <CardTitle className="text-2xl">الوصول السريع</CardTitle>
                    <CardDescription className="text-primary-foreground/80">انتقل مباشرة إلى المواد الدراسية وابدأ التعلم.</CardDescription>
                </CardHeader>
            </Link>
        </Card>
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>الربط مع ولي الأمر</CardTitle>
                    <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>(قريباً) يمكنك من هنا ربط حسابك بحساب ولي أمرك لمتابعة تقدمك.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center h-24 bg-muted rounded-md text-muted-foreground">
                    <p>ميزة الربط مع ولي الأمر ستكون متاحة قريباً.</p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
