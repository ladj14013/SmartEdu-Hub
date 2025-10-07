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
import { stages, levels, subjects } from '@/lib/data';
import { MoreHorizontal, Plus, Pencil, Trash2, ChevronsUpDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import Link from 'next/link';

export default function ContentManagementPage() {
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
        <Accordion type="multiple" className="w-full">
          {stages.map((stage) => (
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
                  .filter((level) => level.stageId === stage.id)
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
                          .filter((subject) => subject.levelId === level.id)
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
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
