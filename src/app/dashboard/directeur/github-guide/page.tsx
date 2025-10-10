
'use client';

import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Clipboard, Download, Github, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const CodeBlock = ({ command }: { command: string }) => {
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const handleCopy = () => {
        navigator.clipboard.writeText(command);
        setCopied(true);
        toast({ title: 'تم نسخ الأمر بنجاح!' });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative font-mono text-sm bg-muted p-3 rounded-md text-left dir-ltr">
            <pre><code>{command}</code></pre>
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={handleCopy}
            >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
            </Button>
        </div>
    );
};

export default function GitHubGuidePage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="دليل GitHub"
                description="اتبع هذه الخطوات لتهيئة مستودع Git ورفع مشروعك أو سحبه من GitHub."
            />

             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>مشكلة المصادقة (Authentication Failed)</AlertTitle>
                <AlertDescription>
                    إذا واجهت خطأ `Authentication failed` عند محاولة الرفع، فهذا يعني أنك بحاجة إلى استخدام Personal Access Token (PAT) بدلاً من كلمة المرور. اتبع الخطوات في **الخطوة 5** أدناه لإنشاء واحد.
                </AlertDescription>
            </Alert>


            <Card>
                <CardHeader>
                    <CardTitle>الخطوة 1: تهيئة مستودع Git المحلي</CardTitle>
                    <CardDescription>
                        إذا لم تكن قد قمت بذلك بالفعل، قم بتهيئة مستودع Git في مجلد مشروعك.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CodeBlock command="git init" />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>الخطوة 2: إضافة جميع الملفات</CardTitle>
                    <CardDescription>
                        أضف جميع ملفات المشروع إلى منطقة التجهيز (staging area) استعدادًا لأول commit.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CodeBlock command="git add ." />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>الخطوة 3: عمل أول Commit</CardTitle>
                    <CardDescription>
                        احفظ التغييرات في مستودعك المحلي مع رسالة وصفية.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CodeBlock command='git commit -m "Initial commit"' />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>الخطوة 4: إنشاء مستودع جديد على GitHub</CardTitle>
                    <CardDescription>
                        اذهب إلى <a href="https://github.com/new" target="_blank" rel="noopener noreferrer" className="text-primary underline">صفحة إنشاء مستودع جديد على GitHub</a>.
                         أدخل اسمًا للمستودع، وتأكد من أنه "Public" أو "Private" حسب رغبتك، ثم اضغط على "Create repository".
                         <span className='font-bold'> لا تقم بتهيئة المستودع بملف README أو .gitignore أو license.</span>
                    </CardDescription>
                </CardHeader>
                 <CardContent className="flex justify-center">
                    <Github className="h-16 w-16 text-muted-foreground" />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>الخطوة 5: ربط المستودع وحل مشكلة المصادقة</CardTitle>
                    <CardDescription>
                        بعد إنشاء المستودع على GitHub، انسخ الأمر الذي يبدأ بـ `git remote add origin`. لحل مشكلة المصادقة، ستحتاج لإنشاء Personal Access Token (PAT).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className='font-bold'>أولاً: ربط المستودع</p>
                    <CodeBlock command="git remote add origin https://github.com/YourUsername/YourRepositoryName.git" />
                    <p className='font-bold pt-4'>ثانياً: إنشاء Personal Access Token (PAT)</p>
                     <ol className="list-decimal list-inside space-y-2 pr-4 text-sm text-muted-foreground">
                        <li>اذهب إلى <a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener noreferrer" className="text-primary underline">صفحة إنشاء Token جديد</a>.</li>
                        <li>أعطِ الـ Token اسمًا وصفيًا (مثلاً: "Firebase Studio Dev").</li>
                        <li>حدد تاريخ انتهاء صلاحية (موصى به).</li>
                        <li>في قسم "Repository access"، اختر الصلاحيات التي يحتاجها الـ Token. كحد أدنى، ستحتاج إلى تحديد صلاحية `repo` بالكامل.</li>
                        <li>انزل إلى الأسفل واضغط على "Generate token".</li>
                        <li>**مهم جداً:** انسخ الـ Token الذي سيظهر لك واحفظه في مكان آمن. لن تتمكن من رؤيته مرة أخرى!</li>
                    </ol>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>الخطوة 6: (اختياري ولكن موصى به) إعادة تسمية الفرع الرئيسي</CardTitle>
                    <CardDescription>
                       من الممارسات الجيدة تسمية الفرع الرئيسي `main`.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CodeBlock command="git branch -M main" />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>الخطوة 7: رفع الكود إلى GitHub</CardTitle>
                    <CardDescription>
                        أخيرًا، قم برفع الكود. سيطلب منك Git إدخال اسم المستخدم الخاص بك، ثم سيطلب كلمة المرور. **استخدم الـ Personal Access Token الذي أنشأته ككلمة مرور**.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CodeBlock command="git push -u origin main" />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                         <Download className="h-6 w-6 text-primary" />
                        <CardTitle>كيفية سحب (Clone) مشروع من GitHub</CardTitle>
                    </div>
                    <CardDescription>
                        إذا كنت تريد العمل على المشروع من جهاز كمبيوتر آخر، يمكنك نسخه (أو 'سحبه') من GitHub. اذهب إلى صفحة المستودع على GitHub، اضغط على زر 'Code' الأخضر، وانسخ الرابط (HTTPS URL).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CodeBlock command="git clone https://github.com/YourUsername/YourRepositoryName.git" />
                </CardContent>
            </Card>
        </div>
    );
}

    