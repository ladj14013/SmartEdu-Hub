
'use client';

import { PageHeader } from '@/components/common/page-header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

// Mock data to replace Firestore query
const mockMessages = [
  {
    id: 'msg1',
    subject: 'استفسار بخصوص مستوى التلميذ أحمد',
    content: 'السيد المدير،\n\nأود الاستفسار عن مستوى التلميذ أحمد في مادة الرياضيات. لقد لاحظت تراجعًا في درجاته الأخيرة.\n\nشكرًا لكم.',
    senderName: 'أ. خالد العامري',
    senderEmail: 'k.amri@example.com',
    timestamp: new Date(2024, 6, 20).toISOString(),
    isRead: true,
    forwardedTo: 'supervisor_general'
  },
  {
    id: 'msg2',
    subject: 'اقتراح لتفعيل ورش عمل إضافية',
    content: 'إلى من يهمه الأمر،\n\nنقترح إقامة ورش عمل إضافية للطلاب لتقوية مهاراتهم في البرمجة. يمكننا تخصيص يوم الخميس لذلك.\n\nمع خالص التقدير.',
    senderName: 'أ. سارة القحطاني',
    senderEmail: 's.qahtani@example.com',
    timestamp: new Date(2024, 6, 22).toISOString(),
    isRead: true,
    forwardedTo: 'supervisor_general'
  },
];


export default function GeneralSupervisorMessagesPage() {
  // Using mock data, so isLoading is always false.
  const [isLoading, setIsLoading] = useState(false);
  const forwardedMessages = mockMessages;

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
