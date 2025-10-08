'use client';
import { useState } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Pencil, Trash2, Eye, Loader2 } from 'lucide-react';
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

export default function TeacherSubjectsPage() {
    const firestore = useFirestore();
    const { user: authUser, isLoading: isAuthLoading } = useUser();
    const [selectedLevelId, setSelectedLevelId] = useState<string | 'all'>('all');

    // --- Data Fetching ---
    const teacherRef = useMemoFirebase(() => (firestore && authUser) ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
    const { data: teacher, isLoading: isTeacherLoading } = useDoc<UserType>(teacherRef);

    const subjectRef = useMemoFirebase(() => (firestore && teacher?.subjectId) ? doc(firestore, 'subjects', teacher.subjectId) : null, [firestore, teacher?.subjectId]);
    const { data: subject, isLoading: isSubjectLoading } = useDoc<Subject>(subjectRef);

    const levelsQuery = useMemoFirebase(() => {
        if (!firestore || !teacher?.stageId) return null;
        return query(collection(firestore, 'levels'), where('stageId', '==', teacher.stageId));
    }, [firestore, teacher?.stageId]);
    const { data: levels, isLoading: areLevelsLoading } = useCollection<Level>(levelsQuery);
    
    const allLessonsQuery = useMemoFirebase(() => {
        if (!firestore || !teacher?.subjectId) return null;
        return query(collection(firestore, 'lessons'), where('subjectId', '==', teacher.subjectId));
    }, [firestore, teacher?.subjectId]);
    const { data: allLessons, isLoading: areAllLessonsLoading } = useCollection<Lesson>(allLessonsQuery);

    const isLoading = isAuthLoading || isTeacherLoading || isSubjectLoading || areLevelsLoading || areAllLessonsLoading;

    const filterLessonsByLevel = (lessons: Lesson[] | undefined) => {
        if (!lessons) return [];
        if (selectedLevelId === 'all') return lessons;
        return lessons.filter(l => l.levelId === selectedLevelId);
    }
    
    const privateLessons = filterLessonsByLevel(allLessons?.filter(l => l.authorId === authUser?.uid && l.type === 'private'));
    const publicLessons = filterLessonsByLevel(allLessons?.filter(l => l.type === 'public'));
    
    const selectedLevelName = selectedLevelId !== 'all' ? levels?.find(l => l.id === selectedLevelId)?.name : null;

    if (isLoading) {
      return (
        <div className="space-y-6">
          <PageHeader title={<Skeleton className="h-8 w-72" />} description="جاري تحميل الدروس..." />
          <div className="flex justify-end">
            <Skeleton className="h-10 w-56" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
          </div>
        </div>
      );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={`إدارة دروس مادة: ${subject?.name || ''}`}
                description="إدارة دروسك الخاصة والاطلاع على الدروس العامة المتاحة."
            />
            
            <div className="flex justify-end">
                <Select value={selectedLevelId} onValueChange={setSelectedLevelId}>
                    <SelectTrigger className="w-full md:w-[220px]">
                        <SelectValue placeholder="اختر المستوى الدراسي" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">كل المستويات</SelectItem>
                        {levels?.map(level => (
                            <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Private Lessons */}
                <Card>
                    <CardHeader className="flex-row items-start justify-between">
                        <div>
                            <CardTitle>دروسك الخاصة</CardTitle>
                            <CardDescription>
                                {selectedLevelName ? `الدروس الخاصة بالمستوى: ${selectedLevelName}` : 'هذه الدروس تظهر لتلاميذك فقط.'}
                            </CardDescription>
                        </div>
                        <Button variant="accent" size="sm" asChild>
                           <Link href="/dashboard/teacher/lessons/new">
                             <Plus className="ml-2 h-4 w-4" /> أضف درس خاص
                           </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y rounded-md border">
                            {privateLessons?.map((lesson) => (
                                <div key={lesson.id} className="flex items-center justify-between p-3">
                                    <span className="font-medium">{lesson.title}</span>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/dashboard/teacher/lessons/${lesson.id}`} className="flex items-center w-full">
                                                    <Pencil className="ml-2 h-4 w-4" />تعديل
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-500"><Trash2 className="ml-2 h-4 w-4" />حذف</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ))}
                            {privateLessons?.length === 0 && <p className="text-center p-4 text-muted-foreground">
                                {selectedLevelId === 'all' ? 'لم تقم بإضافة دروس خاصة بعد.' : 'لا توجد دروس خاصة في هذا المستوى.'}
                            </p>}
                        </div>
                    </CardContent>
                </Card>

                {/* Public Lessons */}
                <Card>
                    <CardHeader>
                        <CardTitle>الدروس العامة</CardTitle>
                        <CardDescription>
                             {selectedLevelName ? `الدروس العامة بالمستوى: ${selectedLevelName}` : 'محتوى متاح من المشرفين يمكنك استخدامه.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y rounded-md border">
                            {publicLessons?.map((lesson) => (
                                <div key={lesson.id} className="flex items-center justify-between p-3">
                                    <span className="font-medium">{lesson.title}</span>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/dashboard/teacher/lessons/${lesson.id}`}>
                                            <Eye className="ml-2 h-4 w-4" /> عرض
                                        </Link>
                                    </Button>
                                </div>
                            ))}
                            {publicLessons?.length === 0 && <p className="text-center p-4 text-muted-foreground">
                                {selectedLevelId === 'all' ? 'لا توجد دروس عامة متاحة حالياً.' : 'لا توجد دروس عامة في هذا المستوى.'}
                            </p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
