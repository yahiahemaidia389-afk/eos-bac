export type StreamType = 'sciences_experimentales' | 'mathematiques';
export type UserRole = 'student' | 'admin';

export type ViewType = 
  | 'landing' 
  | 'login'
  | 'reset-password'
  | 'dashboard' 
  | 'subjects' 
  | 'subject-detail' 
  | 'lessons'
  | 'lesson' 
  | 'exercises'
  | 'summaries'
  | 'bac-exams' 
  | 'quiz' 
  | 'planner' 
  | 'ai-assistant' 
  | 'profile'
  | 'admin'
  | 'admin-users';

export type AdminTabType = 
  | 'dashboard' 
  | 'subjects' 
  | 'chapters' 
  | 'lessons' 
  | 'exercises' 
  | 'summaries'
  | 'bac-exams' 
  | 'quizzes'
  | 'users'
  | 'settings';

export interface UserAccount {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  stream: StreamType;
  language: 'fr' | 'en' | 'ar';
  avatar_url?: string;
  dream?: string;
  goal?: string;
  target_score?: string;
  study_focus?: string;
  onboarding_completed?: boolean;
  email_verified?: boolean;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  arabicName: string;
  streams: StreamType[];
  coefficient: Record<StreamType, number>;
  iconName: string;
  color: string;
  description: string;
  chaptersCount?: number;
  lessonsCount?: number;
  progress?: number;
}

export interface Chapter {
  id: string;
  subjectId: string;
  number: string;
  title: string;
  description?: string;
  duration?: string;
  lessonsCount?: number;
  progress?: number;
  status?: 'completed' | 'in_progress' | 'locked' | string;
  published?: boolean;
}

export interface Lesson {
  id: string;
  chapterId: string;
  subjectId: string;
  title: string;
  description?: string;
  chapter?: string;
  duration?: string;
  estimatedMinutes?: number;
  content?: string;
  videoDuration?: string;
  videoUrl?: string;
  pdfUrl?: string;
  contentText?: string;
  thumbnailUrl?: string;
  code?: string;
  formula?: string;
  formulaExplanation?: string;
  summary?: string | string[];
  keyPoints?: string[];
  exercisesCount?: number;
  isCompleted?: boolean;
  resources?: Array<{
    id: string;
    title: string;
    type: string;
    size: string;
    downloads: number;
  }>;
  published?: boolean;
  createdAt?: string;
}

export interface Exercise {
  id: string;
  chapterId: string;
  subjectId: string;
  title: string;
  description?: string;
  chapter?: string;
  difficulty?: 'Facile' | 'Moyen' | 'Difficile' | 'easy' | 'medium' | 'hard' | string;
  pdfUrl?: string;
  correctionUrl?: string;
  solution?: string;
  hasSolution?: boolean;
  isCompleted?: boolean;
  published: boolean;
  createdAt: string;
}

export interface Summary {
  id: string;
  title: string;
  arabicTitle?: string;
  subjectId: string;
  chapterId?: string;
  chapter?: string;
  stream: StreamType;
  description?: string;
  content?: string;
  formulas?: string[];
  keyPoints?: string[];
  pdfUrl?: string;
  pageCount?: number;
  published: boolean;
  createdAt: string;
}

export interface BacExam {
  id: string;
  title: string;
  year: number;
  subjectId?: string;
  subject?: string;
  stream: StreamType;
  session: 'Principale' | 'Rattrapage';
  pdfUrl?: string;
  correctionUrl?: string;
  pageCount?: number;
  downloads?: number;
  hasCorrection?: boolean;
  difficulty?: 'Moyen' | 'Difficile' | 'Facile' | string;
  published?: boolean;
  createdAt?: string;
}

export interface QuizItem {
  id: string;
  subjectId?: string;
  chapterId?: string;
  title?: string;
  topic?: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  formula?: string;
  published?: boolean;
  createdAt?: string;
}

export type QuizQuestion = QuizItem;

export interface Task {
  id: string;
  title: string;
  subject: string;
  day: 'Lun' | 'Mar' | 'Mer' | 'Jeu' | 'Ven' | 'Sam' | 'Dim';
  completed: boolean;
  timeEstimate?: string;
  type?: 'cours' | 'exercices' | 'quiz' | 'revision' | string;
}

export interface UserProfile {
  id?: string;
  name: string;
  email?: string;
  role: UserRole;
  language?: 'fr' | 'en' | 'ar';
  overallProgress: number;
  streakDays: number;
  daysToBac: number;
  currentStream: StreamType;
  avatar?: string;
  dream?: string;
  goal?: string;
  targetScore?: string;
  studyFocus?: string;
  onboardingCompleted?: boolean;
  level?: number;
  currentXp?: number;
  nextLevelXp?: number;
  badges?: Array<{
    id: string;
    name: string;
    icon: string;
    description: string;
    unlocked: boolean;
    unlockedDate?: string;
  }>;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'ai';
  text: string;
  timestamp: string;
  sources?: string[];
  points?: string[];
  suggestions?: string[];
  formula?: string;
}
