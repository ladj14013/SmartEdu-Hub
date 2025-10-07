'use client';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import Link from 'next/link';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import type { Lesson, Level, User as UserType, Subject } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ManagePublicContentPage() {
    const firestore = useFirestore();
    const { user: authUser, isLoading: isAuthLoading } = useUser();

    // Get supervisor data to find their subject and stage
    const supervisorRef = useMemoFirebase(() => (firestore && authUser) ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
    const { data: supervisor, isLoading: isSupervisorLoading } = useDoc<UserType>(supervisorRef);

    // Get subject name
    const subjectRef = useMemoFirebase(() => (firestore && supervisor?.subjectId) ? doc(firestore, 'subjects', supervisor.subjectId) : null, [firestore, supervisor?.subjectId]);
    const { data: subject, isLoading: isSubjectLoading } = useDoc<Subject>(subjectRef);
    
    // Get levels for the supervisor's stage
    const levelsQuery = useMemoFirebase(() => {
        if (!firestore || !supervisor?.stageId) return null;
        return query(collection(firestore, 'levels'), where('stageId', '==', supervisor.stageId));
    }, [firestore, supervisor?.stageId]);
    const { data: levels, isLoading: areLevelsLoading } = useCollection<Level>(levelsQuery);
    
    // Get public lessons for the supervisor's subject
    const lessonsQuery = useMemoFirebase(() => {
        if (!firestore || !supervisor?.subjectId) return null;
        return query(collection(firestore, 'lessons'), where('subjectId', '==', supervisor.subjectId), where('type', '==', 'public'));
    }, [firestore, supervisor?.subjectId]);
    const { data: publicLessons, isLoading: areLessonsLoading } = useCollection<Lesson>(lessonsQuery);
    
    const isLoading = isAuthLoading || isSupervisorLoading || isSubjectLoading || areLevelsLoading || areLessonsLoading;

    if (isLoading) {
      return (
        <div className="space-y-6">
          <PageHeader
            title={<Skeleton className="h-8 w-72" />}
            description={<Skeleton className="h-4 w-96 mt-2" />}
          >
            <Skeleton className="h-10 w-32" />
          </PageHeader>
          <Card>
            <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
            <CardContent><div className="divide-y rounded-md border"><Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-full" /></div></CardContent>
          </Card>
        </div>
      )
    }


  return (
    <div className="space-y-6">
      <PageHeader
        title={`إدارة المحتوى العام لمادة ${subject?.name || ''}`}
        description="إدارة الدروس العامة التي تظهر لجميع أساتذة وتلاميذ هذه المادة."
      >
        <Button variant="accent">
          <Plus className="ml-2 h-4 w-4" /> أضف درس عام
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
            <div className='flex flex-col md:flex-row gap-4 justify-between'>
                <CardTitle>قائمة الدروس العامة</CardTitle>
                <Select>
                    <SelectTrigger className="w-full md:w-[220px]">
                        <SelectValue placeholder="اختر المستوى الدراسي" />
                    </SelectTrigger>
                    <SelectContent>
                        {levels?.map(level => (
                            <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </CardHeader>
        <CardContent>
        <div className="divide-y rounded-md border">
            {publicLessons?.map((lesson) => (
              <div key={lesson.id} className="flex items-center justify-between p-4">
                <span className="font-medium">{lesson.title}</span>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">فتح القائمة</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                            <Link href="#" className="flex items-center w-full">
                                <Pencil className="ml-2 h-4 w-4" />تعديل
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500"><Trash2 className="ml-2 h-4 w-4" />حذف</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
             {publicLessons?.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                    لم تقم بإضافة أي دروس عامة بعد.
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
