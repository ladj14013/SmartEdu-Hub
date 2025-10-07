import { PageHeader } from '@/components/common/page-header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { messages } from '@/lib/data';

export default function GeneralSupervisorMessagesPage() {
  const forwardedMessages = messages.filter(m => m.forwardedTo === 'supervisor_general');

  return (
    <div className="space-y-6">
      <PageHeader
        title="الرسائل الموجهة"
        description="عرض الرسائل التي تم توجيهها من المدير للمتابعة."
      />

      <div className="rounded-lg border">
        <Accordion type="multiple" className="w-full">
          {forwardedMessages.map((message) => (
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
          {forwardedMessages.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
                لا توجد رسائل موجهة إليك حالياً.
            </div>
          )}
        </Accordion>
      </div>
    </div>
  );
}
