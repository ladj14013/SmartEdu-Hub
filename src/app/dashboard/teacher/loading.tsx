'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeacherDashboardLoading() {
    return (
        <div className="space-y-6">
            <PageHeader
                title={<Skeleton className="h-8 w-48" />}
                description={<Skeleton className="h-4 w-72 mt-2" />}
            />
             <div className="grid gap-6 md:grid-cols-2">
                <Card><CardHeader><Skeleton className="h-6 w-32" /><Skeleton className="h-4 w-48 mt-2" /></CardHeader><CardContent><Skeleton className="h-12 w-full" /></CardContent></Card>
                <Card className="hover:bg-muted/50 transition-colors"><CardHeader><Skeleton className="h-6 w-32" /><Skeleton className="h-4 w-48 mt-2" /></CardHeader></Card>
             </div>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
             </div>
        </div>
    )
}