'use client';
import { PageHeader } from '@/components/common/page-header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import type { Message } from '@/lib/types';
import { collection, doc, updateDoc, query } from 'firebase/firestore';
import { Send, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function MessagesPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [forwardingId, setForwardingId] = useState<string | null>(null);

  // Fetch all messages, filtering will happen on the client
  const messagesQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'messages')) : null,
    [firestore]
  );
  const { data: messages, isLoading } = useCollection<Message>(messagesQuery);
  
  // Filter messages on the client side to show only those not forwarded to the supervisor_general
  const unforwardedMessages = messages?.filter(m => m.forwardedTo !== 'supervisor_general');

  const handleForward = async (messageId: string) => {
    if (!firestore) return;
    setForwardingId(messageId);
    try {
      const messageRef = doc(firestore, 'messages', messageId);
      await updateDoc(messageRef, {
        forwardedTo: 'supervisor_general',
        isRead: true, // Mark as read when forwarded
      });
      toast({
        title: "تم توجيه الرسالة",
        description: "تم توجيه الرسالة بنجاح إلى المشرف العام.",
      });
    } catch (error) {
      console.error("Error forwarding message:", error);
      toast({
        title: "خطأ في التوجيه",
        description: "حدث خطأ أثناء محاولة توجيه الرسالة.",
        variant: "destructive"
      });
    } finally {
      setForwardingId(null);
    }
  };


  return (
    <div className="space-y-6">
      <PageHeader
        title="صندوق الرسائل الواردة"
        description="عرض الرسائل الواردة من المستخدمين وتوجيهها."
      />

      <div className="rounded-lg border">
        <Accordion type="multiple" className="w-full">
          {isLoading && <div className="p-8 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /></div>}

          {!isLoading && unforwardedMessages?.map((message) => (
            <AccordionItem value={message.id} key={message.id}>
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-4 w-full">
                  {!message.isRead && (
                    <Badge variant="accent">جديد</Badge>
                  )}
                  <span className="font-medium flex-1 text-right">{message.subject}</span>
                  <span className="text-sm text-muted-foreground hidden md:block">{message.senderName}</span>
                  <span className="text-sm text-muted-foreground text-left min-w-max">
                    {new Date(message.timestamp).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-muted/50 p-4 space-y-4">
                <p className='whitespace-pre-wrap'>{message.content}</p>
                <div className='text-xs text-muted-foreground'>
                    <span>المرسل: {message.senderName}</span> | <span>{message.senderEmail}</span>
                </div>
                <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleForward(message.id)}
                      disabled={forwardingId === message.id}
                    >
                      {forwardingId === message.id ? (
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="ml-2 h-4 w-4" />
                      )}
                        توجيه للمشرف العام
                    </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
          {!isLoading && unforwardedMessages?.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
                لا توجد رسائل واردة حالياً.
            </div>
          )}
        </Accordion>
      </div>
    </div>
  );
}
