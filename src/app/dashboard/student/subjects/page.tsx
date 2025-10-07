import { PageHeader } from '@/components/common/page-header';
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { subjects, levels, stages } from '@/lib/data';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function StudentSubjectsPage() {
    // Mock student level
    const studentLevelId = 'level-2-1';
    const availableSubjects = subjects.filter(s => s.levelId === studentLevelId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="المواد الدراسية"
        description="تصفح المواد المتاحة لك وابدأ في استكشاف الدروس."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableSubjects.map(subject => {
            const level = levels.find(l => l.id === subject.levelId);
            const stage = stages.find(s => s.id === level?.stageId);
            return (
                <Card key={subject.id} className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className='space-y-1.5'>
                                <CardTitle>{subject.name}</CardTitle>
                                <CardDescription>{subject.description}</CardDescription>
                            </div>
                            <GraduationCap className="h-6 w-6 text-primary" />
                        </div>
                    </CardHeader>
                    <CardFooter className="mt-auto">
                        <Button asChild variant="accent" className="w-full">
                            <Link href={`/dashboard/student/subjects/${subject.id}`}>
                                عرض المادة <ArrowLeft className="mr-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            )
        })}
        {availableSubjects.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground">
                لا توجد مواد دراسية متاحة لمستواك حالياً.
            </p>
        )}
      </div>
    </div>
  );
}
