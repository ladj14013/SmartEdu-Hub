
'use client';

import { PageHeader } from '@/components/common/page-header';
import {
  Accordion,
} from '@/components/ui/accordion';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function GeneralSupervisorMessagesPage() {
  // We will keep isLoading as false and messages as an empty array
  // to prevent any database calls and show the empty state.
  const [isLoading, setIsLoading] = useState(false);
  const forwardedMessages: any[] = [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="الرسائل الموجهة"
        description="عرض الرسائل التي تم توجيهها من المدير للمتابعة."
      />

      <div className="rounded-lg border">
        <Accordion type="multiple" className="w-full">
          {isLoading && <div className="p-8 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /></div>}

          {!isLoading && forwardedMessages.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
                لا توجد رسائل موجهة إليك حالياً.
            </div>
          )}
        </Accordion>
      </div>
    </div>
  );
}
