import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BrainCircuit,
  Contact,
  LayoutDashboard,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MainNav } from '@/components/common/main-nav';
import { Footer } from '@/components/common/footer';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-background');
  const studentImage = PlaceHolderImages.find(p => p.id === 'student-role');
  const teacherImage = PlaceHolderImages.find(p => p.id === 'teacher-role');
  const parentImage = PlaceHolderImages.find(p => p.id === 'parent-role');


  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <section id="hero" className="relative w-full py-24 md:py-32 lg:py-48">
          {heroImage && 
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover object-center"
              data-ai-hint={heroImage.imageHint}
            />
          }
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/20" />
          <div className="container relative z-10 mx-auto px-4 text-center text-primary-foreground">
            <div className="mx-auto max-w-3xl">
              <h1 className="mb-4 font-headline text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
                Smart Education: منصة تعليمية ذكية
              </h1>
              <p className="mb-8 text-lg text-gray-200 md:text-xl">
                جسر تفاعلي يربط بين جميع أطراف المنظومة التعليمية لتوفير بيئة
                تعليمية ذكية، شفافة، وفعالة.
              </p>
              <form className="mx-auto max-w-md">
                <div className="flex items-center gap-2">
                  <Input
                    type="email"
                    placeholder="البريد الإلكتروني"
                    className="flex-1 text-foreground"
                    aria-label="البريد الإلكتروني للتسجيل السريع"
                  />
                  <Button type="submit" size="lg" variant="accent">
                    ابدأ الآن <ArrowRight className="mr-2 h-5 w-5" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <section id="features" className="w-full bg-background py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center font-headline text-3xl font-bold text-foreground">
              الميزات الرئيسية
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-accent">
                    <BrainCircuit className="h-6 w-6" />
                  </div>
                  <CardTitle>التقييم بالذكاء الاصطناعي</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    تقييم فوري للتمارين مع ملاحظات دقيقة لمساعدة التلاميذ على
                    التحسن المستمر.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-accent">
                    <LayoutDashboard className="h-6 w-6" />
                  </div>
                  <CardTitle>لوحات تحكم مخصصة</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    أدوات قوية للإدارة، المشرفين، والأساتذة لمتابعة الأداء
                    وإدارة المحتوى.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-accent">
                    <Users className="h-6 w-6" />
                  </div>
                  <CardTitle>تفاعل بين المستخدمين</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    نظام متكامل يربط التلاميذ بأساتذتهم وأولياء أمورهم لتعزيز
                    التواصل.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="roles" className="w-full py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center font-headline text-3xl font-bold text-foreground">
              مصممة لكل فرد في المنظومة التعليمية
            </h2>
            <Tabs defaultValue="student" className="w-full">
              <TabsList className="mx-auto mb-8 grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="student">الطالب</TabsTrigger>
                <TabsTrigger value="teacher">المعلم</TabsTrigger>
                <TabsTrigger value="parent">ولي الأمر</TabsTrigger>
              </TabsList>
              <TabsContent value="student">
                <Card className="overflow-hidden">
                  <div className="grid grid-cols-1 items-center md:grid-cols-2">
                    {studentImage && (
                       <div className="relative h-64 w-full md:h-full">
                         <Image
                          src={studentImage.imageUrl}
                          alt={studentImage.description}
                          layout="fill"
                          objectFit="cover"
                          data-ai-hint={studentImage.imageHint}
                        />
                       </div>
                    )}
                    <div className="p-8">
                      <h3 className="mb-4 font-headline text-2xl font-semibold">
                        للتلميذ
                      </h3>
                      <p className="text-muted-foreground">
                        تصفح المواد الدراسية، حل التمارين التفاعلية واحصل على
                        تقييم فوري. اربط حسابك مع أستاذك وتابع تقدمك بسهولة.
                      </p>
                    </div>
                  </div>
                </Card>
              </TabsContent>
              <TabsContent value="teacher">
                <Card className="overflow-hidden">
                  <div className="grid grid-cols-1 items-center md:grid-cols-2">
                    {teacherImage && (
                      <div className="relative h-64 w-full md:h-full">
                        <Image
                          src={teacherImage.imageUrl}
                          alt={teacherImage.description}
                          layout="fill"
                          objectFit="cover"
                          data-ai-hint={teacherImage.imageHint}
                        />
                      </div>
                    )}
                    <div className="p-8">
                      <h3 className="mb-4 font-headline text-2xl font-semibold">
                        للأستاذ
                      </h3>
                      <p className="text-muted-foreground">
                        أنشئ دروسك وتمارينك الخاصة، اطلع على المحتوى العام،
                        وشارك كودك الفريد مع تلاميذك لمتابعتهم عن كثب.
                      </p>
                    </div>
                  </div>
                </Card>
              </TabsContent>
              <TabsContent value="parent">
                <Card className="overflow-hidden">
                  <div className="grid grid-cols-1 items-center md:grid-cols-2">
                     {parentImage && (
                      <div className="relative h-64 w-full md:h-full">
                        <Image
                          src={parentImage.imageUrl}
                          alt={parentImage.description}
                          layout="fill"
                          objectFit="cover"
                          data-ai-hint={parentImage.imageHint}
                        />
                      </div>
                    )}
                    <div className="p-8">
                      <h3 className="mb-4 font-headline text-2xl font-semibold">
                        لولي الأمر
                      </h3>
                      <p className="text-muted-foreground">
                        (قريباً) تابع التقدم الدراسي لأبنائك، اطلع على النتائج،
                        واستلم إشعارات بإنجازاتهم لتكون جزءًا من رحلتهم
                        التعليمية.
                      </p>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <section id="pricing" className="w-full bg-background py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center font-headline text-3xl font-bold text-foreground">
              خطط أسعار مرنة
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>التلميذ</CardTitle>
                  <CardDescription>خطة فردية للتعلم</CardDescription>
                  <p className="pt-4 font-headline text-4xl font-bold">
                    $5<span className="text-sm font-normal text-muted-foreground">/شهر</span>
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center">
                      <ArrowRight className="ml-2 h-4 w-4 text-accent" /> وصول كامل
                      للدروس
                    </li>
                    <li className="flex items-center">
                      <ArrowRight className="ml-2 h-4 w-4 text-accent" /> تقييم AI
                      غير محدود
                    </li>
                  </ul>
                  <Button asChild className="mt-6 w-full" variant="accent">
                    <Link href="/signup">ابدأ الآن</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-accent ring-2 ring-accent">
                 <CardHeader>
                  <CardTitle>الأستاذ</CardTitle>
                  <CardDescription>أدوات لإدارة الفصول</CardDescription>
                  <p className="pt-4 font-headline text-4xl font-bold">
                    $20<span className="text-sm font-normal text-muted-foreground">/شهر</span>
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                     <li className="flex items-center">
                      <ArrowRight className="ml-2 h-4 w-4 text-accent" /> إنشاء
                      دروس خاصة
                    </li>
                     <li className="flex items-center">
                      <ArrowRight className="ml-2 h-4 w-4 text-accent" /> متابعة
                      حتى 100 تلميذ
                    </li>
                     <li className="flex items-center">
                      <ArrowRight className="ml-2 h-4 w-4 text-accent" /> تقارير
                      أداء
                    </li>
                  </ul>
                  <Button asChild className="mt-6 w-full" variant="accent">
                    <Link href="/signup">ابدأ الآن</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>المدرسة</CardTitle>
                  <CardDescription>حل متكامل للمؤسسة</CardDescription>
                    <div className="pt-4">
                      <Contact className="h-10 w-10 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    باقة مخصصة تشمل جميع الأدوار والصلاحيات مع دعم فني متكامل.
                  </p>
                  <Button className="mt-6 w-full" variant="accent">
                    اتصل بالمبيعات
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="cta" className="w-full py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-4 font-headline text-3xl font-bold text-foreground">
              جاهز لتطوير تجربة التعليم؟
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
              انضم إلى آلاف المستخدمين الذين يستفيدون من Smart Education لتحقيق
              أفضل النتائج.
            </p>
            <Button asChild size="lg" variant="accent">
              <Link href="/signup">انضم مجانًا</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
