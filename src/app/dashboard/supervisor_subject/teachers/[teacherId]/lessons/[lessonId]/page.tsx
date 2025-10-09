
'use client';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useDoc, useFirestore, useMemoFirebase, useCollection, useUser } from '@/firebase';
import { doc, collection, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import type { Lesson, User as UserType, SupervisorNote } from '@/lib/types';
import { ArrowRight, Send, UserCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function ReviewLessonPage({ params }: { params: { teacherId: string, lessonId: string } }) {
  const { teacherId, lessonId } = params;
  const firestore = useFirestore();
  const { user: authUser } = useUser();
  const { toast } = useToast();

  const [noteContent, setNoteContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  // --- Data Fetching ---
  const lessonRef = useMemoFirebase(() => firestore ? doc(firestore, 'lessons', lessonId) : null, [firestore, lessonId]);
  const teacherRef = useMemoFirebase(() => firestore ? doc(firestore, 'users', teacherId) : null, [firestore, teacherId]);
  
  const notesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'supervisor_notes'), where('lessonId', '==', lessonId)) : null, [firestore, lessonId]);

  const { data: lesson, isLoading: isLessonLoading } = useDoc<Lesson>(lessonRef);
  const { data: teacher, isLoading: isTeacherLoading } = useDoc<UserType>(teacherRef);
  const { data: notes, isLoading: areNotesLoading } = useCollection<SupervisorNote>(notesQuery);

  // Removed the problematic authorsQuery. We'll handle author names differently.
  const isLoading = isLessonLoading || isTeacherLoading || areNotesLoading;

  const handleSendNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !authUser || !noteContent.trim()) return;
    setIsSending(true);
    try {
        await addDoc(collection(firestore, 'supervisor_notes'), {
            lessonId: lessonId,
            authorId: authUser.uid,
            authorName: authUser.displayName || 'مشرف', // Save the author name directly
            content: noteContent,
            timestamp: serverTimestamp()
        });
        setNoteContent('');
        toast({ title: "تم إرسال الملاحظة بنجاح!" });
    } catch (error) {
        console.error("Failed to send note:", error);
        toast({ title: "فشل إرسال الملاحظة", variant: "destructive" });
    } finally {
        setIsSending(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title={<Skeleton className="h-8 w-64" />} description={<Skeleton className="h-4 w-72 mt-2" />}>
          <Skeleton className="h-10 w-40" />
        </PageHeader>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card><CardHeader><CardTitle><Skeleton className="h-6 w-32" /></CardTitle></CardHeader><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
            <Card><CardHeader><CardTitle><Skeleton className="h-6 w-24" /></CardTitle></CardHeader><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Card><CardHeader><CardTitle><Skeleton className="h-6 w-32" /></CardTitle></CardHeader><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
            <Card><CardHeader><CardTitle><Skeleton className="h-6 w-24" /></CardTitle></CardHeader><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson || !teacher) {
    return <div>الدرس أو الأستاذ غير موجود.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="عرض محتوى الدرس"
        description={`مراجعة درس "${lesson.title}" للأستاذ ${teacher.name}`}
      >
        <Button variant="outline" asChild>
          <Link href={`/dashboard/supervisor_subject/teachers/${teacherId}`}>
            <ArrowRight className="ml-2 h-4 w-4" /> العودة لدروس الأستاذ
          </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            {/* Lesson Details */}
            <Card>
                <CardHeader>
                    <CardTitle>{lesson.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-wrap">{lesson.content}</p>
                    {lesson.videoUrl && (
                        <div className="mt-4">
                            <iframe
                                className="w-full aspect-video rounded-lg"
                                src={lesson.videoUrl.replace('watch?v=', 'embed/')}
                                title="YouTube video player"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    )}
                </CardContent>
            </Card>
            {/* Exercises */}
            <Card>
                <CardHeader><CardTitle>التمارين</CardTitle></CardHeader>
                <CardContent className='space-y-4'>
                    {lesson.exercises?.map((exercise, index) => (
                        <div key={exercise.id} className="p-4 border rounded-md bg-muted/30">
                            <p className="font-semibold">تمرين {index + 1}: {exercise.question}</p>
                            <p className="text-sm text-muted-foreground mt-1">الإجابة النموذجية: {exercise.modelAnswer}</p>
                        </div>
                    ))}
                    {(lesson.exercises?.length ?? 0) === 0 && <p className="text-muted-foreground">لا توجد تمارين في هذا الدرس.</p>}
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>ملاحظات المشرف</CardTitle>
                    <CardDescription>اترك ملاحظة خاصة للأستاذ على هذا الدرس.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={handleSendNote}>
                        <Textarea placeholder="اكتب ملاحظاتك هنا..." value={noteContent} onChange={(e) => setNoteContent(e.target.value)} disabled={isSending} />
                        <Button variant="accent" className="w-full" type="submit" disabled={isSending || !noteContent.trim()}>
                            {isSending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="ml-2 h-4 w-4" />}
                             إرسال الملاحظات
                        </Button>
                    </form>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>الملاحظات السابقة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {notes?.map(note => {
                        return (
                            <div key={note.id} className="flex gap-3">
                                <UserCircle className="h-5 w-5 text-muted-foreground mt-1" />
                                <div className='flex-1'>
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold text-sm">{note.authorName || 'مشرف'}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {note.timestamp ? new Date(note.timestamp.toDate()).toLocaleDateString('ar-EG') : ''}
                                        </p>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{note.content}</p>
                                </div>
                            </div>
                        )
                    })}
                    {notes?.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center">لا توجد ملاحظات سابقة.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
