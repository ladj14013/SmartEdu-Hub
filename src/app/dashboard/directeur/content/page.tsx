'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { PageHeader } from '@/components/common/page-header';
import { MoreHorizontal, Plus, Pencil, Trash2, ChevronsUpDown, Loader2, Save } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import type { Stage, Level, Subject } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function ContentManagementPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const [newStageName, setNewStageName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const stagesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'stages') : null, [firestore]);
  const levelsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'levels') : null, [firestore]);
  const subjectsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'subjects') : null, [firestore]);

  const { data: stages, isLoading: isLoadingStages } = useCollection<Stage>(stagesQuery);
  const { data: levels, isLoading: isLoadingLevels } = useCollection<Level>(levelsQuery);
  const { data: subjects, isLoading: isLoadingSubjects } = useCollection<Subject>(subjectsQuery);

  const isLoading = isLoadingStages || isLoadingLevels || isLoadingSubjects;

  const handleAddStage = async () => {
    if (!newStageName.trim() || !firestore) return;

    setIsSaving(true);
    try {
        const stagesCollection = collection(firestore, 'stages');
        await addDoc(stagesCollection, { name: newStageName });
        toast({
            title: "تمت الإضافة بنجاح",
            description: `تمت إضافة مرحلة "${newStageName}"`,
        });
        setNewStageName('');
        setIsDialogOpen(false);
    } catch (error) {
        console.error("Error adding stage: ", error);
        toast({
            title: "فشل في الإضافة",
            description: "حدث خطأ أثناء إضافة المرحلة الجديدة.",
            variant: "destructive",
        });
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة هيكل المحتوى"
        description="إدارة المراحل والمستويات والمواد الدراسية في المنصة."
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="accent">
              <Plus className="ml-2 h-4 w-4" /> أضف مرحلة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>إضافة مرحلة دراسية جديدة</DialogTitle>
              <DialogDescription>
                أدخل اسم المرحلة الجديدة. سيتم إضافتها إلى الهيكل التعليمي.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stage-name" className="text-right">
                  الاسم
                </Label>
                <Input
                  id="stage-name"
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  className="col-span-3"
                  placeholder="مثال: المرحلة الابتدائية"
                />
              </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">
                        إلغاء
                    </Button>
                </DialogClose>
              <Button type="button" onClick={handleAddStage} disabled={isSaving || !newStageName.trim()}>
                {isSaving ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="ml-2 h-4 w-4" />
                    حفظ
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="rounded-lg border">
        {isLoading ? (
            <div className="p-4 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        ) : (
        <Accordion type="multiple" className="w-full">
          {stages?.map((stage) => (
            <AccordionItem value={stage.id} key={stage.id}>
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-4">
                    <span className="font-medium text-lg">{stage.name}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-muted/50 p-4 space-y-4">
                <div className='flex justify-end'>
                    <Button size="sm" variant="outline"><Plus className="ml-2 h-4 w-4" />أضف مستوى</Button>
                </div>
                {levels
                  ?.filter((level) => level.stageId === stage.id)
                  .map((level) => (
                    <Collapsible key={level.id} className="rounded-md border bg-background px-4">
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-2">
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-9 p-0">
                                    <ChevronsUpDown className="h-4 w-4" />
                                    <span className="sr-only">Toggle</span>
                                </Button>
                            </CollapsibleTrigger>
                            <span className="font-semibold">{level.name}</span>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">فتح القائمة</span>
                                <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem><Pencil className="ml-2 h-4 w-4" />تعديل</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-500"><Trash2 className="ml-2 h-4 w-4" />حذف</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CollapsibleContent className="space-y-2 pb-4">
                        <div className='flex justify-end'>
                            <Button size="sm" variant="outline"><Plus className="ml-2 h-4 w-4" />أضف مادة</Button>
                        </div>
                        {subjects
                          ?.filter((subject) => subject.levelId === level.id)
                          .map((subject) => (
                            <div key={subject.id} className="flex items-center justify-between rounded-md border p-3 bg-white">
                                <Link href={`/dashboard/directeur/content/${stage.id}/${level.id}/${subject.id}`} className='hover:underline'>
                                    {subject.name}
                                </Link>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">فتح القائمة</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem><Pencil className="ml-2 h-4 w-4" />تعديل</DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-500"><Trash2 className="ml-2 h-4 w-4" />حذف</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                          ))}
                         {subjects?.filter(s => s.levelId === level.id).length === 0 && (
                            <p className="text-center text-xs text-muted-foreground py-2">لا توجد مواد مضافة لهذا المستوى.</p>
                         )}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                  {levels?.filter(l => l.stageId === stage.id).length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-4">لا توجد مستويات مضافة لهذه المرحلة.</p>
                  )}
              </AccordionContent>
            </AccordionItem>
          ))}
           {stages?.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                  لا توجد مراحل دراسية. ابدأ بإضافة مرحلة جديدة.
              </div>
           )}
        </Accordion>
        )}
      </div>
    </div>
  );
}
