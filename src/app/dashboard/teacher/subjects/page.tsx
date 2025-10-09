'use client';
import { useState } from 'react';
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
import { collection, doc, query, where, deleteDoc } from 'firebase/firestore';
import type { Lesson, User as UserType } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function TeacherSubjectsPage() {
    const firestore = useFirestore();
    const { user: authUser, isLoading: isAuthLoading } = useUser();
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();

    // Query for lessons authored by the current teacher
    const privateLessonsQuery = useMemoFirebase(() => {
        if (!firestore || !authUser) return null;
        return query(collection(firestore, 'lessons'), where('authorId', '==', authUser.uid), where('type', '==', 'private'));
    }, [firestore, authUser]);

    // Query for public lessons (available to everyone in the subject)
    const publicLessonsQuery = useMemoFirebase(() => {
        if (!firestore || !authUser) return null;
        // In a real app, you'd likely filter public lessons by the teacher's subject/stage
        return query(collection(firestore, 'lessons'), where('type', '==', 'public'));
    }, [firestore, authUser]);

    const { data: privateLessons, isLoading: arePrivateLessonsLoading, refetch: refetchPrivate } = useCollection<Lesson>(privateLessonsQuery);
    const { data: publicLessons, isLoading: arePublicLessonsLoading } = useCollection<Lesson>(publicLessonsQuery);
    
    const isLoading = isAuthLoading || arePrivateLessonsLoading || arePublicLessonsLoading;

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
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
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

            <div className="space-y-6">
                 <div>
                    <h3 className="text-xl font-bold mb-3">دروسك الخاصة</h3>
                    <div className="divide-y rounded-md border">
                        {privateLessons && privateLessons.length > 0 ? (
                           privateLessons.map(lesson => (
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
                           ))
                        ) : (
                            <p className="p-4 text-center text-muted-foreground">لم تقم بإضافة أي دروس خاصة بعد.</p>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-bold mb-3">الدروس العامة</h3>
                    <div className="divide-y rounded-md border">
                        {publicLessons && publicLessons.length > 0 ? (
                            publicLessons.map(lesson => (
                                <div key={lesson.id} className="flex items-center justify-between p-3">
                                <span className="font-medium">{lesson.title}</span>
                                 <Button asChild variant="outline" size="sm">
                                   <Link href={`/dashboard/teacher/lessons/${lesson.id}`}>
                                        <Eye className="ml-2 h-4 w-4" /> عرض
                                    </Link>
                                </Button>
                            </div>
                            ))
                        ) : (
                            <p className="p-4 text-center text-muted-foreground">لا توجد دروس عامة متاحة حاليًا.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
