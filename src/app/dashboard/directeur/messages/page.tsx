import { PageHeader } from '@/components/common/page-header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { messages } from '@/lib/data';
import { Send } from 'lucide-react';

export default function MessagesPage() {
  const unforwardedMessages = messages.filter(m => !m.forwardedTo);

  return (
    <div className="space-y-6">
      <PageHeader
        title="صندوق الرسائل الواردة"
        description="عرض الرسائل الواردة من المستخدمين وتوجيهها."
      />

      <div className="rounded-lg border">
        <Accordion type="multiple" className="w-full">
          {unforwardedMessages.map((message) => (
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
                    <Button size="sm" variant="outline">
                        <Send className="ml-2 h-4 w-4" />
                        توجيه للمشرف العام
                    </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
          {unforwardedMessages.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
                لا توجد رسائل واردة حالياً.
            </div>
          )}
        </Accordion>
      </div>
    </div>
  );
}
