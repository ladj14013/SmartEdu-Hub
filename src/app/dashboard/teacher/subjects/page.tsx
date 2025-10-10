
'use client';
import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Pencil, Trash2, Eye, Loader2 } from 'lucide-react';
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
import Link from 'next/link';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, query, where, deleteDoc, orderBy } from 'firebase/firestore';
import type { Lesson, User as UserType, Level } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

// Helper function to group lessons by level
const groupLessonsByLevel = (lessons: Lesson[] | null, levels: Level[] | null) => {
    if (!lessons || !levels) return [];
    
    // Create a map of levels with an empty lessons array
    const levelMap = new Map(levels.map(level => [level.id, { ...level, lessons: [] as Lesson[] }]));

    // Populate the lessons array for each level
    lessons.forEach(lesson => {
        if (levelMap.has(lesson.levelId)) {
            levelMap.get(lesson.levelId)?.lessons.push(lesson);
        }
    });

    // Return an array of levels that actually have lessons, preserving original level order
    return Array.from(levelMap.values()).filter(level => level.lessons.length > 0);
};


export default function TeacherSubjectsPage() {
    const firestore = useFirestore();
    const { user: authUser, isLoading: isAuthLoading } = useUser();
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();
    
    const teacherRef = useMemoFirebase(() => (firestore && authUser) ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
    const { data: teacher, isLoading: isTeacherLoading } = useDoc<UserType>(teacherRef);

    // Get levels for the teacher's stage
    const levelsQuery = useMemoFirebase(() => {
      if (!firestore || !teacher?.stageId) return null;
      return query(collection(firestore, 'levels'), where('stageId', '==', teacher.stageId), orderBy('order'));
    }, [firestore, teacher?.stageId]);
    const { data: levels, isLoading: areLevelsLoading } = useCollection<Level>(levelsQuery);

    // Query for lessons authored by the current teacher
    const privateLessonsQuery = useMemoFirebase(() => {
        if (!firestore || !authUser) return null;
        return query(collection(firestore, 'lessons'), where('authorId', '==', authUser.uid), where('type', '==', 'private'));
    }, [firestore, authUser]);

    // Query for public lessons available for the teacher's subject
    const publicLessonsQuery = useMemoFirebase(() => {
        if (!firestore || !teacher?.subjectId) return null;
        return query(
            collection(firestore, 'lessons'), 
            where('type', '==', 'public'),
            where('subjectId', '==', teacher.subjectId)
        );
    }, [firestore, teacher]);

    const { data: privateLessons, isLoading: arePrivateLessonsLoading, refetch: refetchPrivate } = useCollection<Lesson>(privateLessonsQuery);
    const { data: publicLessons, isLoading: arePublicLessonsLoading } = useCollection<Lesson>(publicLessonsQuery);
    
    const isLoading = isAuthLoading || isTeacherLoading || arePrivateLessonsLoading || arePublicLessonsLoading || areLevelsLoading;

    // Group lessons by level
    const groupedPrivateLessons = useMemo(() => groupLessonsByLevel(privateLessons, levels), [privateLessons, levels]);
    const groupedPublicLessons = useMemo(() => groupLessonsByLevel(publicLessons, levels), [publicLessons, levels]);


    const handleDelete = async (lessonId: string) => {
        if (!firestore) return;
        setIsDeleting(true);
        try {
            await deleteDoc(doc(firestore, 'lessons', lessonId));
            toast({
                title: "تم الحذف بنجاح",
                description: "تم حذف الدرس بنجاح.",
            });
            refetchPrivate();
        } catch (error) {
            console.error("Error deleting lesson:", error);
            toast({
                title: "فشل الحذف",
                description: "حدث خطأ أثناء حذف الدرس.",
                variant: "destructive"
            });
        } finally {
            setIsDeleting(false);
        }
    };
    
    if (isLoading) {
      return (
        <div className="space-y-6">
          <PageHeader title="إدارة الدروس" description="جاري تحميل الدروس...">
             <Skeleton className="h-10 w-36" />
          </PageHeader>
          <div className="space-y-8">
            <div>
              <Skeleton className="h-7 w-48 mb-3" />
              <Card><CardContent className="p-0"><div className="divide-y"><Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-full" /></div></CardContent></Card>
            </div>
            <div>
              <Skeleton className="h-7 w-48 mb-3" />
              <Card><CardContent className="p-0"><div className="divide-y"><Skeleton className="h-14 w-full" /></div></CardContent></Card>
            </div>
          </div>
        </div>
      );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="إدارة الدروس"
                description="إدارة دروسك الخاصة والاطلاع على الدروس العامة المتاحة."
            >
                 <Button variant="accent" size="sm" asChild>
                   <Link href="/dashboard/teacher/lessons/new">
                     <Plus className="ml-2 h-4 w-4" /> أضف درس خاص
                   </Link>
                </Button>
            </PageHeader>

            <div className="space-y-8">
                 <div>
                    <h3 className="text-xl font-bold mb-3">دروسك الخاصة</h3>
                    {groupedPrivateLessons.length > 0 ? (
                        groupedPrivateLessons.map(level => (
                            <div key={level.id} className="mb-6">
                                <h4 className="font-semibold text-lg mb-2 text-muted-foreground">{level.name}</h4>
                                <Card>
                                  <CardContent className="p-0">
                                    <div className="divide-y">
                                        {level.lessons.map(lesson => (
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
                                                  <AlertDialog>
                                                      <AlertDialogTrigger asChild>
                                                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500">
                                                              <Trash2 className="ml-2 h-4 w-4" />حذف
                                                          </DropdownMenuItem>
                                                      </AlertDialogTrigger>
                                                      <AlertDialogContent>
                                                          <AlertDialogHeader>
                                                          <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                                                          <AlertDialogDescription>
                                                              هذا الإجراء سيحذف الدرس "{lesson.title}" بشكل دائم.
                                                          </AlertDialogDescription>
                                                          </AlertDialogHeader>
                                                          <AlertDialogFooter>
                                                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                                          <AlertDialogAction onClick={() => handleDelete(lesson.id)} disabled={isDeleting}>
                                                              {isDeleting ? 'جاري الحذف...' : 'نعم، حذف'}
                                                          </AlertDialogAction>
                                                          </AlertDialogFooter>
                                                      </AlertDialogContent>
                                                  </AlertDialog>
                                                  </DropdownMenuContent>
                                              </DropdownMenu>
                                          </div>
                                        ))}
                                    </div>
                                  </CardContent>
                                </Card>
                            </div>
                        ))
                    ) : (
                        <Card>
                          <CardContent className="p-4 text-center text-muted-foreground">
                            لم تقم بإضافة أي دروس خاصة بعد.
                          </CardContent>
                        </Card>
                    )}
                </div>

                <div>
                    <h3 className="text-xl font-bold mb-3">الدروس العامة</h3>
                     {groupedPublicLessons.length > 0 ? (
                        groupedPublicLessons.map(level => (
                             <div key={level.id} className="mb-6">
                                <h4 className="font-semibold text-lg mb-2 text-muted-foreground">{level.name}</h4>
                                <Card>
                                  <CardContent className="p-0">
                                      <div className="divide-y">
                                          {level.lessons.map(lesson => (
                                              <div key={lesson.id} className="flex items-center justify-between p-3">
                                              <span className="font-medium">{lesson.title}</span>
                                              <Button asChild variant="outline" size="sm">
                                                  <Link href={`/dashboard/teacher/lessons/${lesson.id}`}>
                                                      <Eye className="ml-2 h-4 w-4" /> عرض
                                                  </Link>
                                              </Button>
                                          </div>
                                          ))}
                                      </div>
                                  </CardContent>
                                </Card>
                            </div>
                        ))
                    ) : (
                         <Card>
                          <CardContent className="p-4 text-center text-muted-foreground">
                            لا توجد دروس عامة متاحة حاليًا لهذا المستوى.
                          </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
