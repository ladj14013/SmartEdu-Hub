import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from './logo';

export function MainNav() {
  return (
    <header className="absolute top-0 z-20 w-full bg-transparent p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Logo className="text-white" />
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link
            href="#features"
            className="text-gray-200 transition-colors hover:text-white"
          >
            الميزات
          </Link>
          <Link
            href="#roles"
            className="text-gray-200 transition-colors hover:text-white"
          >
            الأدوار
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild className="text-white hover:bg-white/10 hover:text-white">
            <Link href="/login">تسجيل الدخول</Link>
          </Button>
          <Button variant="accent" asChild>
            <Link href="/signup">إنشاء حساب</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
