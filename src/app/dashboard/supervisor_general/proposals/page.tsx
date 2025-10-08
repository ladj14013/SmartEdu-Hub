
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { addDoc, collection, doc, query, where, serverTimestamp, orderBy } from 'firebase/firestore';
import type { Stage, User as UserType, StructureProposal } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, PlusCircle, Send } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';


const proposalSchema = z.object({
  stageId: z.string({ required_error: "الرجاء اختيار المرحلة الدراسية." }),
  name: z.string().min(2, "اسم المادة قصير جدًا."),
  description: z.string().min(10, "وصف المادة قصير جدًا."),
});

type ProposalFormValues = z.infer<typeof proposalSchema>;

export default function ProposalsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user: authUser, isLoading: isAuthLoading } = useUser();

  // --- Data Fetching ---
  const currentUserRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const stagesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'stages') : null, [firestore]);
  const proposalsQuery = useMemoFirebase(() => authUser ? query(collection(firestore, 'proposals'), where('proposerId', '==', authUser.uid), orderBy('createdAt', 'desc')) : null, [firestore, authUser]);
  
  const { data: currentUser, isLoading: isUserLoading } = useDoc<UserType>(currentUserRef);
  const { data: stages, isLoading: areStagesLoading } = useCollection<Stage>(stagesQuery);
  const { data: proposals, isLoading: areProposalsLoading } = useCollection<StructureProposal>(proposalsQuery);
  
  const isLoading = isAuthLoading || isUserLoading || areStagesLoading;

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
  });

  const onSubmit = async (data: ProposalFormValues) => {
    if (!firestore || !currentUser) {
      toast({ title: 'خطأ', description: 'المستخدم غير معروف.', variant: 'destructive' });
      return;
    }
    const selectedStage = stages?.find(s => s.id === data.stageId);
    if (!selectedStage) {
      toast({ title: 'خطأ', description: 'المرحلة المختارة غير صالحة.', variant: 'destructive' });
      return;
    }

    form.control.disabled = true;
    try {
      await addDoc(collection(firestore, 'proposals'), {
        proposerId: currentUser.id,
        proposerName: currentUser.name,
        type: 'add_subject',
        status: 'pending',
        details: {
          stageId: data.stageId,
          stageName: selectedStage.name,
          name: data.name,
          description: data.description,
        },
        createdAt: serverTimestamp(),
      });
      toast({ title: 'تم إرسال الاقتراح بنجاح', description: 'سيقوم المدير بمراجعته قريبًا.' });
      form.reset({ name: '', description: '', stageId: '' });
    } catch (error) {
      console.error("Failed to submit proposal:", error);
      toast({ title: 'فشل إرسال الاقتراح', variant: 'destructive' });
    } finally {
      form.control.disabled = false;
    }
  };
  
  const statusMap: Record<StructureProposal['status'], { text: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { text: "قيد المراجعة", variant: "outline" },
    approved: { text: "تمت الموافقة", variant: "default" },
    rejected: { text: "مرفوض", variant: "destructive" },
  };

  return (
    <div className="space-y-6">
      <PageHeader title="اقتراح تعديلات على الهيكل" description="اقترح إضافة مواد جديدة ليتم مراجعتها من قبل المدير." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>اقتراح إضافة مادة جديدة</CardTitle>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="stageId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المرحلة الدراسية</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={areStagesLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={areStagesLoading ? "تحميل المراحل..." : "اختر المرحلة"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {stages?.map(stage => <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم المادة المقترحة</FormLabel>
                        <FormControl><Input placeholder="مثال: علوم الحاسوب" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وصف المادة</FormLabel>
                        <FormControl><Textarea placeholder="وصف موجز للمادة وأهدافها..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" variant="accent" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 ml-2 animate-spin" /> : <Send className="h-4 w-4 ml-2" />}
                    إرسال الاقتراح
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>سجل الاقتراحات</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاقتراح</TableHead>
                    <TableHead>المرحلة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {areProposalsLoading && Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    </TableRow>
                  ))}
                  {!areProposalsLoading && proposals?.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{`إضافة مادة: ${p.details.name}`}</TableCell>
                      <TableCell>{p.details.stageName}</TableCell>
                      <TableCell><Badge variant={statusMap[p.status].variant}>{statusMap[p.status].text}</Badge></TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {p.createdAt?.toDate().toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {!areProposalsLoading && proposals?.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  <PlusCircle className="mx-auto h-12 w-12" />
                  <p className="mt-4">لم تقم بتقديم أي اقتراحات بعد.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
