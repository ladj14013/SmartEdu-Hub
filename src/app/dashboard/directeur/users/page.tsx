
'use client';

import React, { useMemo, useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, doc as firestoreDoc, query } from 'firebase/firestore';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Search, User, UserCog, GraduationCap, UserCheck, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { User as UserType, Role } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';


const roleMap: { [key in Role]?: { name: string; icon: React.ElementType } } = {
    directeur: { name: 'مدير', icon: UserCog },
    supervisor_general: { name: 'مشرف عام', icon: UserCog },
    supervisor_subject: { name: 'مشرف مادة', icon: UserCog },
    teacher: { name: 'أستاذ', icon: UserCheck },
    student: { name: 'تلميذ', icon: GraduationCap },
    parent: { name: 'ولي أمر', icon: User },
  };

export default function UsersPage() {
  const firestore = useFirestore();
  const { user: authUser, isLoading: isAuthLoading } = useUser();

  const currentUserRef = useMemoFirebase(
    () => (firestore && authUser ? firestoreDoc(firestore, 'users', authUser.uid) : null),
    [firestore, authUser]
  );
  const { data: currentUserData, isLoading: isCurrentUserLoading } = useDoc<UserType>(currentUserRef);
  
  const isDirector = currentUserData?.role === 'directeur';

  const usersQuery = useMemoFirebase(() => {
    // IMPORTANT: Only create the query if we've confirmed the user is a director
    if (firestore && isDirector) {
      return collection(firestore, 'users');
    }
    return null; // Return null if not a director, preventing the query from running
  }, [firestore, isDirector]);
  
  const { data: users, isLoading: areUsersLoading } = useCollection<UserType>(usersQuery);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  const isLoading = isAuthLoading || isCurrentUserLoading || (isDirector && areUsersLoading);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users
      .filter(user => {
        const nameMatch = user.name ?? '';
        const emailMatch = user.email ?? '';
        const matchesSearch = nameMatch.toLowerCase().includes(searchTerm.toLowerCase()) || 
                               emailMatch.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
      });
  }, [users, searchTerm, roleFilter]);

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
                    <Input 
                      placeholder="بحث بالاسم أو البريد الإلكتروني..." 
                      className="pr-10" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="فلترة حسب الدور" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        <SelectItem value="student">تلميذ</SelectItem>
                        <SelectItem value="teacher">أستاذ</SelectItem>
                        <SelectItem value="supervisor_subject">مشرف مادة</SelectItem>
                        <SelectItem value="supervisor_general">مشرف عام</SelectItem>
                        <SelectItem value="directeur">مدير</SelectItem>
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
              {isLoading && (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              )}
              {!isLoading && isDirector && filteredUsers.map(user => {
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
                            <DropdownMenuItem disabled>تغيير كلمة المرور</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500">حذف</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                )
              })}
               {!isLoading && (!isDirector || filteredUsers.length === 0) && (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        {isDirector ? 'لا توجد نتائج مطابقة لبحثك.' : 'غير مصرح لك بعرض المستخدمين.'}
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
