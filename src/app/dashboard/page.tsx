'use client';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { doc } from 'firebase/firestore';
import type { User as UserType } from '@/lib/types';


export default function DashboardRedirectPage() {
    const router = useRouter();
    const { user, isLoading: isAuthLoading } = useUser();
    const firestore = useFirestore();

    const userRef = useMemoFirebase(
      () => (firestore && user ? doc(firestore, 'users', user.uid) : null),
      [firestore, user]
    );
    const { data: userData, isLoading: isUserDataLoading } = useDoc<UserType>(userRef);

    const isLoading = isAuthLoading || isUserDataLoading;

    useEffect(() => {
        if (!isAuthLoading && !user) {
            // If auth loading is finished and there's no user, redirect to login
            router.replace('/login');
        } else if (user && userData) {
            // If there is a user and we have their data, redirect
            const role = userData.role;
            if (role) {
                router.replace(`/dashboard/${role}`);
            }
        }
    }, [user, userData, isAuthLoading, router]);

    // Show a loading state while checking auth and fetching user data
    if (isLoading || (user && !userData)) {
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
