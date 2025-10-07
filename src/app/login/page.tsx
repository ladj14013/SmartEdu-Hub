import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/common/logo';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className='flex justify-center mb-4'>
             <Logo href="/"/>
            </div>
            <CardTitle className="text-2xl font-headline">مرحباً بعودتك</CardTitle>
            <CardDescription>أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى حسابك</CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">كلمة المرور</Label>
                    <Link
                      href="#"
                      className="mr-auto inline-block text-sm underline"
                    >
                      هل نسيت كلمة المرور؟
                    </Link>
                  </div>
                  <Input id="password" type="password" required />
                </div>
                <Button type="submit" className="w-full" variant="accent">
                  تسجيل الدخول
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="text-center text-sm">
             ليس لديك حساب؟{' '}
            <Link href="/signup" className="underline text-primary">
              اشتراك
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
