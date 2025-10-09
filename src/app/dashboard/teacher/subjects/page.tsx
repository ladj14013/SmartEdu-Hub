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
import { MoreHorizontal, Plus, Pencil, Trash2, Eye, Loader2, Book, User } from 'lucide-react';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from 'next/link';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, query, where, deleteDoc } from 'firebase/firestore';
import type { Lesson, Level, User as UserType, Subject } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function TeacherSubjectsPage() {
    const firestore = useFirestore();
    const { user: authUser, isLoading: isAuthLoading } = useUser();
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();

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
    const { data: allLessons, isLoading: areAllLessonsLoading, refetch: refetchLessons } = useCollection<Lesson>(allLessonsQuery);

    const isLoading = isAuthLoading || isTeacherLoading || isSubjectLoading || areLevelsLoading || areAllLessonsLoading;

    const handleDelete = async (lessonId: string) => {
        if (!firestore) return;
        setIsDeleting(true);
        try {
            await deleteDoc(doc(firestore, 'lessons', lessonId));
            toast({
                title: "تم الحذف بنجاح",
                description: "تم حذف الدرس بنجاح.",
            });
            refetchLessons();
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
          <PageHeader title={<Skeleton className="h-8 w-72" />} description="جاري تحميل الدروس...">
             <Skeleton className="h-10 w-36" />
          </PageHeader>
          <div className="space-y-4">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </div>
      );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={`إدارة دروس مادة: ${subject?.name || ''}`}
                description="إدارة دروسك الخاصة والاطلاع على الدروس العامة المتاحة حسب كل مستوى."
            >
                 <Button variant="accent" size="sm" asChild>
                   <Link href="/dashboard/teacher/lessons/new">
                     <Plus className="ml-2 h-4 w-4" /> أضف درس خاص
                   </Link>
                </Button>
            </PageHeader>

            <Accordion type="multiple" className="w-full space-y-4" defaultValue={levels?.map(l => l.id)}>
                {levels?.map(level => {
                    const levelLessons = allLessons?.filter(l => l.levelId === level.id) || [];
                    const privateLessons = levelLessons.filter(l => l.authorId === authUser?.uid && l.type === 'private');
                    const publicLessons = levelLessons.filter(l => l.type === 'public');

                    return (
                        <AccordionItem value={level.id} key={level.id} className="border rounded-lg bg-card">
                            <AccordionTrigger className="p-4 hover:no-underline">
                                <span className="font-bold text-lg">{level.name}</span>
                            </AccordionTrigger>
                            <AccordionContent className="p-4 pt-0">
                                {levelLessons.length === 0 ? (
                                    <p className="text-center text-muted-foreground p-4">لا توجد دروس في هذا المستوى بعد.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Private Lessons */}
                                        {privateLessons.length > 0 && (
                                            <div>
                                                <h4 className="font-semibold mb-2 flex items-center gap-2"><User className="h-4 w-4" /> دروسك الخاصة</h4>
                                                <div className="divide-y rounded-md border">
                                                    {privateLessons.map(lesson => (
                                                        <div key={lesson.id} className="flex items-center justify-between p-3 hover:bg-muted/50">
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
                                                                            <AlertDialogHeader><AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle><AlertDialogDescription>هذا الإجراء سيحذف الدرس "{lesson.title}" بشكل دائم.</AlertDialogDescription></AlertDialogHeader>
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
                                            </div>
                                        )}

                                        {/* Public Lessons */}
                                        {publicLessons.length > 0 && (
                                            <div>
                                                 <h4 className="font-semibold mb-2 flex items-center gap-2"><Book className="h-4 w-4" /> الدروس العامة</h4>
                                                 <div className="divide-y rounded-md border">
                                                    {publicLessons.map(lesson => (
                                                        <div key={lesson.id} className="flex items-center justify-between p-3 hover:bg-muted/50">
                                                            <span className="font-medium">{lesson.title}</span>
                                                            <Button asChild variant="outline" size="sm">
                                                                <Link href={`/dashboard/teacher/lessons/${lesson.id}`}>
                                                                    <Eye className="ml-2 h-4 w-4" /> عرض
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    ))}
                                                 </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    )
                })}
            </Accordion>
        </div>
    );
}
