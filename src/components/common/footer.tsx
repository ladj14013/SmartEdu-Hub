import Link from 'next/link';
import { ContactDialog } from './contact-dialog';

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full border-t border-border/50 bg-background">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          © {currentYear} Smart Education. جميع الحقوق محفوظة.
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/preview-links"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            معاينة الصفحات
          </Link>
          <Link
            href="#"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            سياسة الخصوصية
          </Link>
          <Link
            href="#"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            شروط الخدمة
          </Link>
          <ContactDialog />
        </div>
      </div>
    </footer>
  );
}
