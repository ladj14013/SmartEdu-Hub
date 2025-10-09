'use client';
import { useMemo } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Users } from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import type { User } from '@/lib/types';
import { doc } from 'firebase/firestore';

export default function SupervisorGeneralDashboard() {
  const firestore = useFirestore();
  const { user: authUser } = useUser();

  const supervisorRef = useMemoFirebase(() => (firestore && authUser) ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: supervisor } = useDoc<User>(supervisorRef);

  return (
    <div className="space-y-6">
      <PageHeader
        title="لوحة تحكم المشرف العام"
        description={`مرحباً ${supervisor?.name || '...'}، يمكنك من هنا متابعة أداء المنصة.`}
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مشرفو المواد</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">متابعة المشرفين</div>
             <p className="text-xs text-muted-foreground">عرض قائمة مشرفي المواد وأدائهم.</p>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>تقرير الأداء العام</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <BarChart className="mx-auto h-12 w-12" />
            <p>مساحة لعرض تقارير ومكونات خاصة بالمشرف العام مستقبلاً.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
