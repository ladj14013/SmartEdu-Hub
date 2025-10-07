'use client';

import { PageHeader } from '@/components/common/page-header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Message } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function GeneralSupervisorMessagesPage() {
  const firestore = useFirestore();

  const messagesQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'messages'), where('forwardedTo', '==', 'supervisor_general')) : null,
    [firestore]
  );
  const { data: forwardedMessages, isLoading } = useCollection<Message>(messagesQuery);

  return (
    <div className="space-y-6">
      <PageHeader
        title="الرسائل الموجهة"
        description="عرض الرسائل التي تم توجيهها من المدير للمتابعة."
      />

      <div className="rounded-lg border">
        <Accordion type="multiple" className="w-full">
          {isLoading && <div className="p-8 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /></div>}

          {!isLoading && forwardedMessages?.map((message) => (
            <AccordionItem value={message.id} key={message.id}>
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-4 w-full">
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
                    <span>المرسل الأصلي: {message.senderName}</span> | <span>{message.senderEmail}</span>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
          {!isLoading && forwardedMessages?.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
                لا توجد رسائل موجهة إليك حالياً.
            </div>
          )}
        </Accordion>
      </div>
    </div>
  );
}
