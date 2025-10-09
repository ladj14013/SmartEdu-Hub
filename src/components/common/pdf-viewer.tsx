'use client';
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ChevronLeft,
  ChevronRight,
  Printer,
  ZoomIn,
  ZoomOut,
  Maximize,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

// Set worker to load from CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  file: string;
}

export function PdfViewer({ file }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const { toast } = useToast();

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  function onDocumentLoadError(error: Error) {
    console.error('Failed to load PDF:', error);
    toast({
      title: "فشل تحميل المستند",
      description: "حدث خطأ أثناء تحميل ملف الـ PDF. قد يكون الرابط غير صحيح.",
      variant: 'destructive',
    });
  }

  function goToPrevPage() {
    setPageNumber((prevPageNumber) => Math.max(prevPageNumber - 1, 1));
  }

  function goToNextPage() {
    setPageNumber((prevPageNumber) => Math.min(prevPageNumber + 1, numPages || 1));
  }

  function handlePrint() {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = file;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        toast({
            title: "فشل الطباعة",
            description: "لا يمكن طباعة هذا الملف بسبب قيود المتصفح. حاول فتحه في نافذة جديدة.",
            variant: 'destructive',
        });
      }
    };
  }

  const LoadingSkeleton = () => (
    <div className='flex justify-center items-center h-[500px] bg-muted/50 rounded-lg'>
        <Skeleton className='h-full w-full' />
    </div>
  )


  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between gap-2 p-2 bg-muted rounded-md border">
        <div className="flex items-center gap-2">
            <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            aria-label="Previous Page"
            >
            <ChevronRight className="h-5 w-5" />
            </Button>
            <span className="text-sm font-medium">
            صفحة {pageNumber} من {numPages || '...'}
            </span>
            <Button
            variant="ghost"
            size="icon"
            onClick={goToNextPage}
            disabled={pageNumber >= (numPages || 0)}
            aria-label="Next Page"
            >
            <ChevronLeft className="h-5 w-5" />
            </Button>
        </div>

        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setScale(s => s - 0.1)} aria-label="Zoom Out">
                <ZoomOut className="h-5 w-5" />
            </Button>
             <Button variant="ghost" size="icon" onClick={() => setScale(s => s + 0.1)} aria-label="Zoom In">
                <ZoomIn className="h-5 w-5" />
            </Button>
             <Button variant="ghost" size="icon" onClick={handlePrint} aria-label="Print">
                <Printer className="h-5 w-5" />
            </Button>
        </div>
      </div>
      <div className="overflow-auto max-h-[70vh] rounded-lg border">
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<LoadingSkeleton />}
          error={<div className='flex justify-center items-center h-[500px] bg-destructive/10 text-destructive rounded-lg'>فشل تحميل الملف.</div>}
          className="flex justify-center"
          // This options object helps with CORS issues for some PDFs
          options={{
             cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
             cMapPacked: true,
          }}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            loading={<LoadingSkeleton />}
            className="[&>canvas]:max-w-full [&>canvas]:h-auto"
          />
        </Document>
      </div>
    </div>
  );
}