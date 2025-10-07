import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart } from 'lucide-react';

const supervisor = { name: "فاطمة الزهراء" };

export default function SupervisorGeneralDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="لوحة تحكم المشرف العام"
        description={`مرحباً ${supervisor.name}، يمكنك من هنا متابعة المهام الموجهة إليك.`}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>تقرير الأداء العام (عنصر نائب)</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-48 text-muted-foreground">
            <div className="text-center">
              <BarChart className="mx-auto h-12 w-12" />
              <p>مساحة لعرض تقارير ومكونات خاصة بالمشرف العام مستقبلاً.</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>إحصائيات سريعة (عنصر نائب)</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-48 text-muted-foreground">
            <div className="text-center">
              <BarChart className="mx-auto h-12 w-12" />
              <p>مساحة لعرض تقارير ومكونات خاصة بالمشرف العام مستقبلاً.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
