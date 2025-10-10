'use client';
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
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// MOCK DATA
const mockTeachers = [
    { id: 'user-4', name: 'أ. أحمد محمود', email: 'ahmed.mahmoud@example.com', avatar: 'https://i.pravatar.cc/150?u=user-4' },
    { id: 'user-5', name: 'أ. فاطمة الزهراء', email: 'fatima.zahra@example.com', avatar: 'https://i.pravatar.cc/150?u=user-5' },
];

export default function TeachersListPage() {
  const isLoading = false; // Mock loading state

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
                <TableHead>الإجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({length: 3}).map((_, i) => (
                <TableRow key={i}>
                    <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-5 w-24" /></div></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-9 w-24" /></TableCell>
                </TableRow>
              ))}
              {!isLoading && mockTeachers.map(teacher => {
                return (
                    <TableRow key={teacher.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={teacher.avatar} alt={teacher.name} />
                                    <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{teacher.name}</span>
                            </div>
                        </TableCell>
                        <TableCell>{teacher.email}</TableCell>
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
              {!isLoading && mockTeachers.length === 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
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
