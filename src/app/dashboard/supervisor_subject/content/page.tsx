import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Pencil, Trash2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { getLessonsBySubject, levels } from '@/lib/data';
import Link from 'next/link';

export default function ManagePublicContentPage() {
    // Mock: Supervisor's subjectId is 'subj-2'
    const publicLessons = getLessonsBySubject('subj-2').filter(l => l.type === 'public');
  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة المحتوى العام لمادة الرياضيات"
        description="إدارة الدروس العامة التي تظهر لجميع أساتذة وتلاميذ هذه المادة."
      >
        <Button variant="accent">
          <Plus className="ml-2 h-4 w-4" /> أضف درس عام
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
            <div className='flex flex-col md:flex-row gap-4 justify-between'>
                <CardTitle>قائمة الدروس العامة</CardTitle>
                <Select>
                    <SelectTrigger className="w-full md:w-[220px]">
                        <SelectValue placeholder="اختر المستوى الدراسي" />
                    </SelectTrigger>
                    <SelectContent>
                        {levels.filter(l => l.stageId === 'stage-2').map(level => (
                            <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </CardHeader>
        <CardContent>
        <div className="divide-y rounded-md border">
            {publicLessons.map((lesson) => (
              <div key={lesson.id} className="flex items-center justify-between p-4">
                <span className="font-medium">{lesson.title}</span>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">فتح القائمة</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                            <Link href="#" className="flex items-center">
                                <Pencil className="ml-2 h-4 w-4" />تعديل
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500">
                            <Trash2 className="ml-2 h-4 w-4" />حذف
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
             {publicLessons.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                    لم تقم بإضافة أي دروس عامة بعد.
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
