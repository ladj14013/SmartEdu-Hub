'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { PageHeader } from '@/components/common/page-header';
import { MoreHorizontal, Plus, Pencil, Trash2, ChevronsUpDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Stage, Level, Subject } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ContentManagementPage() {
  const firestore = useFirestore();

  const stagesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'stages') : null, [firestore]);
  const levelsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'levels') : null, [firestore]);
  const subjectsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'subjects') : null, [firestore]);

  const { data: stages, isLoading: isLoadingStages } = useCollection<Stage>(stagesQuery);
  const { data: levels, isLoading: isLoadingLevels } = useCollection<Level>(levelsQuery);
  const { data: subjects, isLoading: isLoadingSubjects } = useCollection<Subject>(subjectsQuery);

  const isLoading = isLoadingStages || isLoadingLevels || isLoadingSubjects;

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة هيكل المحتوى"
        description="إدارة المراحل والمستويات والمواد الدراسية في المنصة."
      >
        <Button variant="accent">
          <Plus className="ml-2 h-4 w-4" /> أضف مرحلة جديدة
        </Button>
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
