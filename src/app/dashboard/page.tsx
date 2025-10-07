'use client';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useEffect } from 'react';
import { users } from '@/lib/data';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

// In a real app, you would fetch user metadata from Firestore
// based on the auth user's UID.
const getRoleFromUser = (firebaseUser: import('firebase/auth').User | null) => {
    if (!firebaseUser) return null;
    const mockUser = users.find(u => u.email.toLowerCase() === firebaseUser.email?.toLowerCase());
    return mockUser?.role || 'student'; // Default to student
}

export default function DashboardRedirectPage() {
    const router = useRouter();
    const { user, isLoading } = useUser();

    useEffect(() => {
        if (!isLoading && !user) {
            // If loading is finished and there's no user, redirect to login
            router.replace('/login');
        } else if (user) {
            // If there is a user, determine their role and redirect
            const role = getRoleFromUser(user);
            if (role) {
                router.replace(`/dashboard/${role}`);
            }
        }
    }, [user, isLoading, router]);

    // Show a loading state while checking auth
    if (isLoading || user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">جاري التوجيه...</p>
            </div>
        );
    }
    
    // Fallback for when user is not logged in after loading
    return (
         <div className="flex flex-col items-center justify-center min-h-screen">
            <p className="text-muted-foreground">الرجاء تسجيل الدخول للمتابعة.</p>
            <Link href="/login" className="mt-4 text-primary hover:underline">
                الانتقال إلى صفحة تسجيل الدخول
            </Link>
        </div>
    );
}
