import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Search, User, UserCog, GraduationCap, UserCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { users } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const roleMap: { [key: string]: { name: string; icon: React.ElementType } } = {
    directeur: { name: 'مدير', icon: UserCog },
    supervisor_general: { name: 'مشرف عام', icon: UserCog },
    supervisor_subject: { name: 'مشرف مادة', icon: UserCog },
    teacher: { name: 'أستاذ', icon: UserCheck },
    student: { name: 'تلميذ', icon: GraduationCap },
    parent: { name: 'ولي أمر', icon: User },
  };

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة المستخدمين"
        description="عرض وتعديل وحذف المستخدمين في المنصة."
      >
        <Button variant="accent" asChild>
            <Link href="/dashboard/directeur/users/new">
                <Plus className="ml-2 h-4 w-4" /> أضف مستخدم جديد
            </Link>
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
            <div className='flex flex-col md:flex-row gap-4 justify-between'>
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="بحث بالاسم أو البريد الإلكتروني..." className="pr-10" />
                </div>
                <Select>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="فلترة حسب الدور" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        <SelectItem value="student">تلميذ</SelectItem>
                        <SelectItem value="teacher">أستاذ</SelectItem>
                        <SelectItem value="supervisor_subject">مشرف مادة</SelectItem>
                        <SelectItem value="supervisor_general">مشرف عام</SelectItem>
                        <SelectItem value="parent">ولي أمر</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead>
                  <span className="sr-only">إجراءات</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => {
                const RoleIcon = roleMap[user.role]?.icon || User;
                return (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                            <Badge variant="outline" className='flex items-center gap-2 w-fit'>
                                <RoleIcon className="h-4 w-4" />
                                {roleMap[user.role]?.name || user.role}
                            </Badge>
                        </TableCell>
                        <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">فتح القائمة</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
                            <DropdownMenuItem asChild><Link href={`/dashboard/directeur/users/${user.id}/edit`}>تعديل</Link></DropdownMenuItem>
                            <DropdownMenuItem>تغيير كلمة المرور</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500">حذف</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
