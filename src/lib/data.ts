import type { Stage, Level, Subject, User, Lesson, Message, SupervisorNote } from './types';

// These arrays are now used for initial structure and fallbacks,
// but the primary data source should be Firestore.

export const stages: Stage[] = [
  { id: 'stage-1', name: 'المرحلة الابتدائية' },
  { id: 'stage-2', name: 'المرحلة الإعدادية' },
  { id: 'stage-3', name: 'المرحلة الثانوية' },
];

export const levels: Level[] = [
  { id: 'level-1-1', name: 'الصف الأول الابتدائي', stageId: 'stage-1' },
  { id: 'level-1-2', name: 'الصف الثاني الابتدائي', stageId: 'stage-1' },
  { id: 'level-2-1', name: 'الصف الأول الإعدادي', stageId: 'stage-2' },
  { id: 'level-2-2', name: 'الصف الثاني الإعدادي', stageId: 'stage-2' },
  { id: 'level-3-1', name: 'الصف الأول الثانوي', stageId: 'stage-3' },
  { id: 'level-3-2', name: 'الصف الثاني الثانوي', stageId: 'stage-3' },
];

export const subjects: Subject[] = [
  { id: 'subj-1', name: 'اللغة العربية', description: 'قواعد اللغة العربية وآدابها.', levelId: 'level-2-1' },
  { id: 'subj-2', name: 'الرياضيات', description: 'الجبر والهندسة وحساب المثلثات.', levelId: 'level-2-1' },
  { id: 'subj-3', name: 'العلوم', description: 'مبادئ الفيزياء والكيمياء والأحياء.', levelId: 'level-2-1' },
  { id: 'subj-4', name: 'التاريخ', description: 'تاريخ الحضارات القديمة والحديثة.', levelId: 'level-3-1' },
  { id: 'subj-5', name: 'الفيزياء', description: 'ميكانيكا وكهرباء.', levelId: 'level-3-1' },
];

// This user data is now a fallback. The app should prioritize Firestore.
export const users: User[] = [
  { id: 'user-1', name: 'أحمد عبد العزيز', email: 'admin@sep.app', role: 'directeur', avatar: 'https://i.pravatar.cc/150?u=user-1' },
  { id: 'user-2', name: 'فاطمة الزهراء', email: 'supervisor.gen@example.com', role: 'supervisor_general', avatar: 'https://i.pravatar.cc/150?u=user-2' },
  { id: 'user-3', name: 'يوسف محمود', email: 'supervisor.math@example.com', role: 'supervisor_subject', subjectId: 'subj-2', stageId: 'stage-2', avatar: 'https://i.pravatar.cc/150?u=user-3' },
  { id: 'user-4', name: 'خالد إبراهيم', email: 'teacher.math@example.com', role: 'teacher', subjectId: 'subj-2', stageId: 'stage-2', teacherCode: 'KHALED123', avatar: 'https://i.pravatar.cc/150?u=user-4' },
  { id: 'user-5', name: 'مريم علي', email: 'student1@example.com', role: 'student', stageId: 'stage-2', levelId: 'level-2-1', linkedTeacherId: 'user-4', avatar: 'https://i.pravatar.cc/150?u=user-5' },
  { id: 'user-6', name: 'علي حسن', email: 'student2@example.com', role: 'student', stageId: 'stage-2', levelId: 'level-2-1', avatar: 'https://i.pravatar.cc/150?u=user-6' },
  { id: 'user-7', name: 'سارة محمد', email: 'parent1@example.com', role: 'parent', avatar: 'https://i.pravatar.cc/150?u=user-7' },
];

export const lessons: Lesson[] = [
  {
    id: 'lesson-1',
    title: 'مقدمة في الجبر',
    content: 'هذا الدرس يغطي أساسيات الجبر، بما في ذلك المتغيرات والمعادلات البسيطة. سنتعلم كيفية حل المعادلات ذات المتغير الواحد.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    subjectId: 'subj-2',
    authorId: 'user-3', // Supervisor
    type: 'public',
    isLocked: false,
    exercises: [
      { id: 'ex-1-1', question: 'ما هو حل المعادلة: 2x + 5 = 15؟', modelAnswer: 'x = 5' },
      { id: 'ex-1-2', question: 'بسط التعبير التالي: 3(a + 2b) - 2a.', modelAnswer: 'a + 6b' },
    ],
  },
  {
    id: 'lesson-2',
    title: 'تطبيقات على النظريات الهندسية',
    content: 'في هذا الدرس، سنستكشف تطبيقات عملية للنظريات الهندسية الأساسية مثل نظرية فيثاغورس.',
    subjectId: 'subj-2',
    authorId: 'user-4', // Teacher
    type: 'private',
    isLocked: false,
    exercises: [
      { id: 'ex-2-1', question: 'مثلث قائم الزاوية، طول أحد ضلعي القائمة 3 سم والآخر 4 سم. ما هو طول الوتر؟', modelAnswer: '5 سم' },
    ],
  },
  {
    id: 'lesson-3',
    title: 'التحليل إلى عوامل',
    content: 'درس متقدم عن طرق التحليل إلى عوامل.',
    subjectId: 'subj-2',
    authorId: 'user-4', // Teacher
    type: 'private',
    isLocked: true,
    exercises: [],
  },
];

export const messages: Message[] = [
    {
        id: 'msg-1',
        subject: 'استفسار بخصوص خطط الأسعار',
        senderName: 'أولياء الأمور',
        senderEmail: 'parent.group@email.com',
        content: 'نود الاستفسار عن إمكانية توفير خصومات للمجموعات من أولياء الأمور.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isRead: false,
    },
    {
        id: 'msg-2',
        subject: 'مشكلة فنية في رفع المحتوى',
        senderName: 'أستاذ محمد',
        senderEmail: 'teacher.mohamed@email.com',
        content: 'أواجه صعوبة في رفع فيديو لدرس العلوم للصف الأول الإعدادي. أرجو المساعدة.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        isRead: true,
    },
    {
        id: 'msg-3',
        subject: 'اقتراح إضافة ميزة جديدة',
        senderName: 'مشرف اللغة الإنجليزية',
        senderEmail: 'supervisor.en@email.com',
        content: 'أقترح إضافة قسم للمصطلحات اللغوية في كل درس لتسهيل المذاكرة على الطلاب.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        isRead: true,
        forwardedTo: 'supervisor_general',
    }
];

export const supervisorNotes: SupervisorNote[] = [
    {
        id: 'note-1',
        lessonId: 'lesson-2',
        authorId: 'user-3',
        content: 'محتوى الدرس ممتاز ولكن يحتاج إلى المزيد من الأمثلة التوضيحية في قسم التطبيقات.',
        timestamp: new Date().toISOString(),
    }
];

// Helper functions to get data from the mock arrays.
// These should be phased out in favor of Firestore queries.
export const getSubjectById = (id: string) => subjects.find(s => s.id === id);
export const getLevelById = (id: string) => levels.find(l => l.id === id);
export const getStageById = (id: string) => stages.find(s => s.id === id);
export const getLessonsBySubject = (subjectId: string) => lessons.filter(l => l.subjectId === subjectId);
export const getLessonById = (id:string) => lessons.find(l => l.id === id);
export const getUserById = (id: string) => users.find(u => u.id === id);
export const getTeachersBySubjectAndStage = (subjectId: string, stageId: string) => 
    users.filter(u => u.role === 'teacher' && u.subjectId === subjectId && u.stageId === stageId);
