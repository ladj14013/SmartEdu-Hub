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
import { MoreHorizontal, Plus, Pencil, Trash2, ChevronsUpDown, Loader2, Save, ArrowUp, ArrowDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, addDoc, doc, query, orderBy, writeBatch, updateDoc } from 'firebase/firestore';
import type { Stage, Level, Subject } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

// Component for adding a new level
function AddLevelDialog({ stageId, onLevelAdded }: { stageId: string, onLevelAdded: () => void }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [newLevelName, setNewLevelName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleAddLevel = async () => {
        if (!newLevelName.trim() || !firestore) return;
        setIsSaving(true);
        try {
            const levelsCollection = collection(firestore, 'levels');
            await addDoc(levelsCollection, { 
                name: newLevelName,
                stageId: stageId
            });
            toast({
                title: "تمت الإضافة بنجاح",
                description: `تمت إضافة مستوى "${newLevelName}"`,
            });
            setNewLevelName('');
            setIsOpen(false);
            onLevelAdded(); // To potentially refetch or update UI
        } catch (error) {
            console.error("Error adding level: ", error);
            toast({
                title: "فشل في الإضافة",
                description: "حدث خطأ أثناء إضافة المستوى الجديد.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline"><Plus className="ml-2 h-4 w-4" />أضف مستوى</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>إضافة مستوى جديد</DialogTitle>
                    <DialogDescription>
                        أدخل اسم المستوى الجديد. سيتم إضافته إلى المرحلة الحالية.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="level-name" className="text-right">
                            الاسم
                        </Label>
                        <Input
                            id="level-name"
                            value={newLevelName}
                            onChange={(e) => setNewLevelName(e.target.value)}
                            className="col-span-3"
                            placeholder="مثال: الصف الأول"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">إلغاء</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleAddLevel} disabled={isSaving || !newLevelName.trim()}>
                        {isSaving ? <><Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري الحفظ...</> : <><Save className="ml-2 h-4 w-4" /> حفظ</>}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Component for editing a stage
function EditStageDialog({ stage, onStageUpdated }: { stage: Stage, onStageUpdated: () => void }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [stageName, setStageName] = useState(stage.name);
    const [isSaving, setIsSaving] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleUpdateStage = async () => {
        if (!stageName.trim() || !firestore) return;
        setIsSaving(true);
        try {
            const stageRef = doc(firestore, 'stages', stage.id);
            await updateDoc(stageRef, { name: stageName });
            toast({
                title: "تم التحديث بنجاح",
                description: `تم تحديث اسم المرحلة إلى "${stageName}"`,
            });
            setIsOpen(false);
            onStageUpdated();
        } catch (error) {
            console.error("Error updating stage: ", error);
            toast({
                title: "فشل التحديث",
                description: "حدث خطأ أثناء تحديث المرحلة.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                 <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Pencil className="ml-2 h-4 w-4" /> تعديل
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>تعديل المرحلة الدراسية</DialogTitle>
                    <DialogDescription>
                        أدخل الاسم الجديد للمرحلة.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="stage-name-edit" className="text-right">
                            الاسم
                        </Label>
                        <Input
                            id="stage-name-edit"
                            value={stageName}
                            onChange={(e) => setStageName(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">إلغاء</Button></DialogClose>
                    <Button type="button" onClick={handleUpdateStage} disabled={isSaving || !stageName.trim()}>
                        {isSaving ? <><Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري الحفظ...</> : <><Save className="ml-2 h-4 w-4" /> حفظ التغييرات</>}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function ContentManagementPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const [newStageName, setNewStageName] = useState('');
  const [isSavingStage, setIsSavingStage] = useState(false);
  const [isStageDialogOpen, setIsStageDialogOpen] = useState(false);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const stagesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'stages'), orderBy('order')) : null, [firestore, updateTrigger]);
  const levelsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'levels') : null, [firestore, updateTrigger]);
  const subjectsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'subjects') : null, [firestore, updateTrigger]);

  const { data: stages, isLoading: isLoadingStages } = useCollection<Stage>(stagesQuery);
  const { data: levels, isLoading: isLoadingLevels } = useCollection<Level>(levelsQuery);
  const { data: subjects, isLoading: isLoadingSubjects } = useCollection<Subject>(subjectsQuery);

  const isLoading = isLoadingStages || isLoadingLevels || isLoadingSubjects;

  const refreshData = () => setUpdateTrigger(prev => prev + 1);

  const handleAddStage = async () => {
    if (!newStageName.trim() || !firestore || !stages) return;

    setIsSavingStage(true);
    try {
        const stagesCollection = collection(firestore, 'stages');
        const newOrder = (stages.length > 0) ? Math.max(...stages.map(s => s.order)) + 1 : 0;
        await addDoc(stagesCollection, { name: newStageName, order: newOrder });
        toast({
            title: "تمت الإضافة بنجاح",
            description: `تمت إضافة مرحلة "${newStageName}"`,
        });
        setNewStageName('');
        setIsStageDialogOpen(false);
        refreshData();
    } catch (error) {
        console.error("Error adding stage: ", error);
        toast({
            title: "فشل في الإضافة",
            description: "حدث خطأ أثناء إضافة المرحلة الجديدة.",
            variant: "destructive",
        });
    } finally {
        setIsSavingStage(false);
    }
  };

  const handleMoveStage = async (index: number, direction: 'up' | 'down') => {
    if (!stages || !firestore) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= stages.length) return;

    const batch = writeBatch(firestore);
    
    const stageToMove = stages[index];
    const otherStage = stages[newIndex];
    
    // Swap orders
    const stageToMoveRef = doc(firestore, 'stages', stageToMove.id);
    batch.update(stageToMoveRef, { order: otherStage.order });
    
    const otherStageRef = doc(firestore, 'stages', otherStage.id);
    batch.update(otherStageRef, { order: stageToMove.order });

    try {
      await batch.commit();
      refreshData();
    } catch (error) {
      console.error("Error reordering stages: ", error);
      toast({
        title: "فشل تغيير الترتيب",
        description: "حدث خطأ أثناء محاولة تغيير ترتيب المراحل.",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة هيكل المحتوى"
        description="إدارة المراحل والمستويات والمواد الدراسية في المنصة."
      >
        <Dialog open={isStageDialogOpen} onOpenChange={setIsStageDialogOpen}>
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
              <Button type="button" onClick={handleAddStage} disabled={isSavingStage || !newStageName.trim()}>
                {isSavingStage ? (
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
        {isLoading && !stages ? ( // Show skeleton only on initial load
            <div className="p-4 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        ) : (
        <Accordion type="multiple" className="w-full">
          {stages?.map((stage, index) => (
            <AccordionItem value={stage.id} key={stage.id}>
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-4 flex-1">
                    <span className="font-medium text-lg">{stage.name}</span>
                </div>
                 <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => {e.stopPropagation(); handleMoveStage(index, 'up')}} disabled={index === 0}>
                        <ArrowUp className="h-4 w-4" />
                    </Button>
                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => {e.stopPropagation(); handleMoveStage(index, 'down')}} disabled={index === stages.length - 1}>
                        <ArrowDown className="h-4 w-4" />
                    </Button>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                                <span className="sr-only">فتح القائمة</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                           <EditStageDialog stage={stage} onStageUpdated={refreshData} />
                           <DropdownMenuItem className="text-red-500"><Trash2 className="ml-2 h-4 w-4" />حذف</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-muted/50 p-4 space-y-4">
                <div className='flex justify-end'>
                    <AddLevelDialog stageId={stage.id} onLevelAdded={refreshData} />
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
