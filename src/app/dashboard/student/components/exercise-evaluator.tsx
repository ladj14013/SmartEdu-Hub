'use client';

import { useState } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { evaluateStudentAnswers, type EvaluateStudentAnswersOutput } from '@/ai/flows/evaluate-student-answers';
import type { Lesson, StudentLessonProgress } from '@/lib/types';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Loader2, Repeat, Trophy, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const schema = z.object({
  answers: z.array(z.object({ value: z.string().min(1, 'الرجاء إدخال إجابة.') })),
});

type FormValues = z.infer<typeof schema>;

interface ExerciseEvaluatorProps {
  lesson: Lesson;
}

export function ExerciseEvaluator({ lesson }: ExerciseEvaluatorProps) {
  const [evaluationResult, setEvaluationResult] = useState<EvaluateStudentAnswersOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user: authUser } = useUser();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      answers: lesson.exercises?.map(() => ({ value: '' })) || [],
    },
  });
  
  const { fields } = useFieldArray({
    control: form.control,
    name: 'answers',
  });

  const saveProgress = async (score: number) => {
    if (!firestore || !authUser) return;
    try {
      const progressRef = doc(firestore, `users/${authUser.uid}/lessonProgress`, lesson.id);
      const progressData: StudentLessonProgress = {
        studentId: authUser.uid,
        lessonId: lesson.id,
        completionDate: new Date().toISOString(),
        score: score,
      };
      await setDoc(progressRef, progressData, { merge: true });
    } catch (error) {
      console.error("Failed to save lesson progress:", error);
      toast({
        title: "فشل حفظ التقدم",
        description: "حدث خطأ أثناء حفظ نتيجتك. يمكنك إعادة المحاولة لاحقًا.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setEvaluationResult(null);
    try {
      const result = await evaluateStudentAnswers({
        lessonContent: lesson.content,
        questions: lesson.exercises.map(ex => ex.question),
        studentAnswers: data.answers.map(a => a.value),
        modelAnswers: lesson.exercises.map(ex => ex.modelAnswer),
      });
      setEvaluationResult(result);
      
      const totalScore = result.detailedFeedback.reduce((sum, fb) => sum + fb.score, 0);
      const averageScore = result.detailedFeedback.length > 0 ? Math.round((totalScore / result.detailedFeedback.length) * 10) : 0;
      await saveProgress(averageScore);

    } catch (error) {
        console.error("Evaluation failed:", error);
        toast({
            title: "حدث خطأ",
            description: "فشل تقييم الإجابات. الرجاء المحاولة مرة أخرى.",
            variant: "destructive"
        })
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setEvaluationResult(null);
    form.reset();
  };

  if (!lesson.exercises || lesson.exercises.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>التمارين</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-center text-muted-foreground">لا توجد تمارين في هذا الدرس.</p>
            </CardContent>
        </Card>
    );
  }

  if (evaluationResult) {
    const totalScore = evaluationResult.detailedFeedback.reduce((sum, fb) => sum + fb.score, 0);
    const averageScore = evaluationResult.detailedFeedback.length > 0 ? Math.round((totalScore / result.detailedFeedback.length) * 10) : 0;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>نتائج التقييم</CardTitle>
          <CardDescription>هذه هي ملاحظات الذكاء الاصطناعي على إجاباتك. تم حفظ نتيجتك.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">النتيجة الإجمالية</p>
            <p className="text-4xl font-bold text-primary">{averageScore}%</p>
            <Progress value={averageScore} aria-label={`النتيجة: ${averageScore}%`} />
          </div>
          <div className="p-3 bg-muted/50 rounded-md">
            <p className="font-semibold text-sm">ملاحظة عامة:</p>
            <p className="text-sm text-muted-foreground">{evaluationResult.overallFeedback}</p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {evaluationResult.detailedFeedback.map((fb, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Trophy className={`h-4 w-4 ${fb.score > 7 ? 'text-amber-500' : 'text-muted-foreground'}`} />
                    <span>السؤال {index + 1}: <span className='font-bold'>{Math.round(fb.score * 10)}%</span></span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 p-4">
                    <p className="text-sm"><span className="font-semibold">سؤال:</span> {fb.question}</p>
                    {lesson.exercises[index].pdfUrl && (
                        <Button asChild variant="secondary" size="sm" className='w-full'>
                            <Link href={lesson.exercises[index].pdfUrl!} target="_blank" rel="noopener noreferrer">
                                <FileText className="ml-2 h-4 w-4" />
                                فتح ملف التمرين (PDF)
                            </Link>
                        </Button>
                    )}
                    <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded-md space-y-1">
                        <p className="font-semibold text-sm text-blue-800">إجابتك:</p>
                        <p className="text-sm text-blue-700">{fb.studentAnswer}</p>
                    </div>
                    <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded-md space-y-1">
                        <p className="font-semibold text-sm text-green-800">الإجابة النموذجية:</p>
                        <p className="text-sm text-green-700">{fb.modelAnswer}</p>
                    </div>
                    <div className="p-3 bg-orange-50 border-l-4 border-orange-400 rounded-md space-y-1">
                        <p className="font-semibold text-sm text-orange-800">ملاحظات الذكاء الاصطناعي:</p>
                        <p className="text-sm text-orange-700">{fb.feedback}</p>
                    </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <Button onClick={handleRetry} className="w-full" variant="outline">
            <Repeat className="ml-2 h-4 w-4" /> حاول مرة أخرى
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>التمارين التفاعلية</CardTitle>
        <CardDescription>أجب على الأسئلة للحصول على تقييم فوري.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {fields.map((field, index) => (
              <FormField
                key={field.id}
                control={form.control}
                name={`answers.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <Label>
                      <span className="font-bold">السؤال {index + 1}: </span>
                      {lesson.exercises[index].question}
                    </Label>
                    {lesson.exercises[index].pdfUrl && (
                        <Button asChild variant="secondary" size="sm" className='w-full my-2'>
                            <Link href={lesson.exercises[index].pdfUrl!} target="_blank" rel="noopener noreferrer">
                                <FileText className="ml-2 h-4 w-4" />
                                عرض ملف التمرين المرفق (PDF)
                            </Link>
                        </Button>
                    )}
                    <FormControl>
                      <Textarea placeholder="اكتب إجابتك هنا..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button type="submit" className="w-full" variant="accent" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري التقييم...
                </>
              ) : (
                'تقييم الإجابات'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
