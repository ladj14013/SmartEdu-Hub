// In a real app, this page would perform a server-side redirection
// based on the logged-in user's role. For this mock-up, we'll
// just provide links to simulate this behavior.

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardRedirectPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">صفحة تحويل لوحة التحكم</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p>في التطبيق الحقيقي، سيتم تحويلك تلقائيًا بناءً على دورك.</p>
                    <p>للتجربة، اختر دورًا للانتقال إلى لوحة التحكم الخاصة به:</p>
                    <div className="flex flex-col gap-2">
                        <Link href="/dashboard/directeur" className="text-primary hover:underline">المدير (Directeur)</Link>
                        <Link href="/dashboard/supervisor_subject" className="text-primary hover:underline">مشرف المادة (Subject Supervisor)</Link>
                        <Link href="/dashboard/supervisor_general" className="text-primary hover:underline">المشرف العام (General Supervisor)</Link>
                        <Link href="/dashboard/teacher" className="text-primary hover:underline">الأستاذ (Teacher)</Link>
                        <Link href="/dashboard/student" className="text-primary hover:underline">التلميذ (Student)</Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
