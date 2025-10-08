'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Loader2, Send } from 'lucide-react';

export function ContactDialog() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore) return;

    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const content = formData.get('content') as string;

    try {
      await addDoc(collection(firestore, 'messages'), {
        senderName: name,
        senderEmail: email,
        authorId: user?.uid || null, // Add user ID if logged in
        subject: subject,
        content: content,
        timestamp: serverTimestamp(),
        isRead: false,
      });

      toast({
        title: 'تم إرسال الرسالة',
        description: 'شكراً لتواصلك معنا. سنقوم بالرد في أقرب وقت ممكن.',
      });
      setIsOpen(false); // Close dialog on success
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'فشل إرسال الرسالة',
        description: 'حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          اتصل بنا
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>اتصل بنا</DialogTitle>
          <DialogDescription>
            أرسل رسالة إلى الإدارة. املأ النموذج أدناه وسنعاود الاتصال بك.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} id="contact-form">
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">الموضوع</Label>
              <Input id="subject" name="subject" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">الرسالة</Label>
              <Textarea id="content" name="content" required />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline">إلغاء</Button>
            </DialogClose>
            <Button type="submit" variant="accent" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Send className="ml-2 h-4 w-4" />
                  إرسال الرسالة
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
