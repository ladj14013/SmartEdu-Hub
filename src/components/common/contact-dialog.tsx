'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export function ContactDialog() {
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Here you would typically handle form submission, e.g., send data to an API
    toast({
      title: 'تم إرسال الرسالة',
      description: 'شكراً لتواصلك معنا. سنقوم بالرد في أقرب وقت ممكن.',
    });
    // You might want to close the dialog here. This requires managing the open state.
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-sm text-muted-foreground hover:text-foreground">اتصل بنا</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>اتصل بنا</DialogTitle>
          <DialogDescription>
            أرسل رسالة إلى الإدارة. املأ النموذج أدناه وسنعاود الاتصال بك.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                الاسم
              </Label>
              <Input id="name" required className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                البريد الإلكتروني
              </Label>
              <Input id="email" type="email" required className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="message" className="text-right">
                الرسالة
              </Label>
              <Textarea id="message" required className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" variant="accent">إرسال الرسالة</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
