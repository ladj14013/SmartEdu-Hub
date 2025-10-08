export type Role = 'directeur' | 'supervisor_general' | 'supervisor_subject' | 'teacher' | 'student' | 'parent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  stageId?: string;
  levelId?: string;
  subjectId?: string;
  teacherCode?: string;
  linkedTeacherId?: string;
  linkedStudentIds?: string[];
  avatar: string;
}

export interface Stage {
  id: string;
  name:string;
  order: number;
}

export interface Level {
  id: string;
  name: string;
  stageId: string;
  order: number;
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  levelId: string;
}

export interface Exercise {
  id: string;
  question: string;
  modelAnswer: string;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  subjectId: string;
  levelId: string;
  authorId: string;
  type: 'public' | 'private';
  isLocked: boolean;
  exercises: Exercise[];
}

export interface Message {
  id: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  forwardedTo?: 'supervisor_general';
}

export interface SupervisorNote {
  id: string;
  lessonId: string;
  authorId: string;
  content: string;
  timestamp: any;
}
