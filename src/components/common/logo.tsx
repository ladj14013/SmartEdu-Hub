import { GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className, href = '/' }: { className?: string, href?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 text-primary", className)}>
      <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8" />
      <span className="font-bold text-lg sm:text-xl font-headline">SmartEdu Hub</span>
    </Link>
  );
}
