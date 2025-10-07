import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getTeachersBySubjectAndStage, getLessonsBySubject } from '@/lib/data';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TeachersListPage() {
  // Mock data for the supervisor
  const supervisorSubjectId = 'subj-2';
  const supervisorStageId = 'stage-2';
  
  const teachers = getTeachersBySubjectAndStage(supervisorSubjectId, supervisorStageId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="قائمة الأساتذة"
        description="عرض الأساتذة الذين يدرسون نفس المادة والمرحلة التي تشرف عليها."
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الأستاذ</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>عدد الدروس الخاصة</TableHead>
                <TableHead>الإجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map(teacher => {
                const privateLessonsCount = getLessonsBySubject(supervisorSubjectId)
                  .filter(l => l.authorId === teacher.id && l.type === 'private').length;
                return (
                    <TableRow key={teacher.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={teacher.avatar} alt={teacher.name} />
                                    <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{teacher.name}</span>
                            </div>
                        </TableCell>
                        <TableCell>{teacher.email}</TableCell>
                        <TableCell>{privateLessonsCount}</TableCell>
                        <TableCell>
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/dashboard/supervisor_subject/teachers/${teacher.id}`}>
                                    عرض الدروس
                                </Link>
                            </Button>
                        </TableCell>
                    </TableRow>
                )
              })}
              {teachers.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        لا يوجد أساتذة مطابقون لمعايير الإشراف الخاصة بك.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
