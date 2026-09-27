import React, { useState, useMemo } from 'react';
import { ViewType, StreamType, UserProfile, Subject } from '../../types';
import { useContent } from '../../context/ContentContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  BookOpen,
  FileCheck2,
  FileText,
  BookmarkCheck,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  Plus,
  CheckCircle2,
  Circle,
  ChevronRight,
  TrendingUp,
  Brain,
  Atom,
  Leaf,
  Globe,
  Languages,
  X,
  Trash2,
  Flame,
  HelpCircle,
  PlayCircle,
  Target,
  Trophy,
  Compass,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (view: ViewType, payload?: any) => void;
  profile: UserProfile;
  currentStream: StreamType;
  onStreamChange: (stream: StreamType) => void;
}

interface StudyTask {
  id: string;
  title: string;
  subject: string;
  time: string;
  completed: boolean;
}

interface RecentActivity {
  id: string;
  title: string;
  detail: string;
  timeAgo: string;
  iconType: 'quiz' | 'lesson' | 'profile' | 'summary';
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  profile,
  currentStream,
  onStreamChange,
}) => {
  const { subjects, lessons, exercises, summaries, bacExams } = useContent();
  const { currentUser } = useAuth();
  const { isRTL, language } = useLanguage();
  const isArabic = language === 'ar';

  const isSci = currentStream === 'sciences_experimentales';

  // Real user name (not hardcoded)
  const realName =
    currentUser?.full_name ||
    profile.name ||
    (isArabic ? 'تلميذ البكالوريا' : (language === 'en' ? 'Student' : 'Étudiant'));

  // Dynamic BAC Countdown Calculation (Targeting Algerian BAC June 2027)
  const [bacTargetYear] = useState(2027);
  const daysRemaining = useMemo(() => {
    const bacDate = new Date(bacTargetYear, 5, 7); // June 7th of target year
    const now = new Date();
    const diffTime = bacDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [bacTargetYear]);

  // Overall student progress calculation
  const totalLessons = lessons.filter((l) => l.published).length;
  const completedLessons = lessons.filter((l) => l.published && l.isCompleted).length;
  const progressPercentage =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : profile.overallProgress || 68;

  // Study tasks state with local storage persistence
  const [tasks, setTasks] = useState<StudyTask[]>(() => {
    try {
      const saved = localStorage.getItem('eosbac_user_tasks') || localStorage.getItem('bacnext_user_tasks');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: '1',
        title: isArabic ? 'إنهاء دراسة الدوال الأسية' : (language === 'en' ? 'Finish studying Exponential Functions' : 'Finir le chapitre Fonctions exponentielles'),
        subject: isArabic ? 'رياضيات' : (language === 'en' ? 'Mathematics' : 'Mathématiques'),
        time: '45 min',
        completed: true,
      },
      {
        id: '2',
        title: isArabic ? 'حل تمارين المتابعة الزمنية' : (language === 'en' ? 'Solve 3 exercises on chemical kinetics' : 'Résoudre 3 exercices de cinétique chimique'),
        subject: isArabic ? 'فيزياء' : (language === 'en' ? 'Physics & Chemistry' : 'Physique-Chimie'),
        time: '1h 15',
        completed: false,
      },
      {
        id: '3',
        title: isArabic ? 'إجراء اختبار تقييمي' : (language === 'en' ? 'Quick assessment quiz' : 'Quiz d’évaluation rapide'),
        subject: isArabic ? 'احتمالات' : (language === 'en' ? 'Probability' : 'Probabilités'),
        time: '20 min',
        completed: false,
      },
      {
        id: '4',
        title: isArabic ? 'مراجعة ملخص المناعة' : (language === 'en' ? 'Immunology summary sheet' : 'Fiche de synthèse Immunologie'),
        subject: isArabic ? 'علوم طبيعية' : (language === 'en' ? 'Natural & Life Sciences' : 'SVT'),
        time: '30 min',
        completed: false,
      },
    ];
  });

  const saveTasks = (newTasks: StudyTask[]) => {
    setTasks(newTasks);
    try {
      const serialized = JSON.stringify(newTasks);
      localStorage.setItem('eosbac_user_tasks', serialized);
      localStorage.setItem('bacnext_user_tasks', serialized);
    } catch {}
  };

  const toggleTask = (taskId: string) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
    saveTasks(updated);
  };

  const deleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    saveTasks(updated);
  };

  // Add Task Modal State
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState(isArabic ? 'رياضيات' : (language === 'en' ? 'Mathematics' : 'Mathématiques'));
  const [newTaskTime, setNewTaskTime] = useState('45 min');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: StudyTask = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      subject: newTaskSubject,
      time: newTaskTime,
      completed: false,
    };
    saveTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setIsAddTaskModalOpen(false);
  };

  // The 4 Core Educational Categories ("Mon apprentissage")
  const coreCategories = [
    {
      id: 'lessons' as ViewType,
      title: isArabic ? 'الدروس' : (language === 'en' ? 'Full Lessons' : 'Cours complets'),
      subtitle: isArabic ? 'شرح مفصل ومفاهيم واضحة للمنهاج' : (language === 'en' ? 'Step-by-step official curriculum' : 'Programme officiel pas à pas'),
      icon: BookOpen,
      iconColor: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200/80 dark:border-blue-800/60',
    },
    {
      id: 'exercises' as ViewType,
      title: isArabic ? 'بنك التمارين' : (language === 'en' ? 'Solved Exercises' : 'Exercices corrigés'),
      subtitle: isArabic ? 'تمارين متدرجة مع سلم التنقيط' : (language === 'en' ? 'Guided practice with grading scale' : 'Entraînement guidé avec solutions'),
      icon: FileCheck2,
      iconColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800/60',
    },
    {
      id: 'summaries' as ViewType,
      title: isArabic ? 'الملخصات المركزة' : (language === 'en' ? 'Revision Summaries' : 'Fiches de révision'),
      subtitle: isArabic ? 'جداول وقوانين المراجعة الذكية' : (language === 'en' ? 'Formulas, definitions and key benchmarks' : 'Formules, définitions et repères clés'),
      icon: FileText,
      iconColor: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200/80 dark:border-purple-800/60',
    },
    {
      id: 'bac-exams' as ViewType,
      title: isArabic ? 'حوليات البكالوريا' : (language === 'en' ? 'BAC Past Papers' : 'Annales du BAC'),
      subtitle: isArabic ? 'مواضيع وحلول رسمية بالـ PDF' : (language === 'en' ? 'Official PDF exams and grading scales' : 'Sujets et barèmes ministériels'),
      icon: BookmarkCheck,
      iconColor: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-800/60',
    },
  ];

  // Subject icon helper matching the clean educational style
  const renderSubjectIcon = (subjectId: string) => {
    switch (subjectId) {
      case 'maths':
        return (
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg border border-blue-200/70 dark:border-blue-800/60">
            <span>π</span>
          </div>
        );
      case 'physique':
        return (
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200/70 dark:border-purple-800/60">
            <Atom className="w-5 h-5" />
          </div>
        );
      case 'svt':
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/70 dark:border-emerald-800/60">
            <Leaf className="w-5 h-5" />
          </div>
        );
      case 'francais':
        return (
          <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center border border-pink-200/70 dark:border-pink-800/60">
            <BookOpen className="w-5 h-5" />
          </div>
        );
      case 'anglais':
        return (
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200/70 dark:border-sky-800/60">
            <Languages className="w-5 h-5" />
          </div>
        );
      case 'philo':
        return (
          <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-200/70 dark:border-orange-800/60">
            <Brain className="w-5 h-5" />
          </div>
        );
      case 'histoire_geo':
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/70 dark:border-amber-800/60">
            <Globe className="w-5 h-5" />
          </div>
        );
      case 'arabe':
        return (
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold text-lg border border-teal-200/70 dark:border-teal-800/60">
            <span>ض</span>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-700">
            <BookOpen className="w-5 h-5" />
          </div>
        );
    }
  };

  // Filter subjects strictly according to the user's BAC stream
  const streamSubjects = useMemo(() => {
    return subjects.filter((s) => s.streams.includes(currentStream));
  }, [subjects, currentStream]);

  // First unfinished lesson for "Continue Learning" banner
  const nextLesson = useMemo(() => {
    const streamSubIds = new Set(streamSubjects.map((s) => s.id));
    const activeLessons = lessons.filter((l) => l.published && streamSubIds.has(l.subjectId));
    return activeLessons.find((l) => !l.isCompleted) || activeLessons[0];
  }, [lessons, streamSubjects]);

  const nextLessonSubject = streamSubjects.find((s) => s.id === nextLesson?.subjectId);

  return (
    <div className="space-y-7 max-w-6xl mx-auto transition-colors pb-12" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* =========================================================================
          1. HEADER & GREETING
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-bold">
            <Flame className="w-3.5 h-3.5 fill-blue-500/20" />
            <span>
              {isSci
                ? (isArabic ? 'شعبة العلوم التجريبية' : (language === 'en' ? 'Experimental Sciences Stream' : 'Filière Sciences Expérimentales'))
                : (isArabic ? 'شعبة الرياضيات' : (language === 'en' ? 'Mathematics Stream' : 'Filière Mathématiques'))}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isArabic ? `مرحبًا، ${realName}` : (language === 'en' ? `Hello, ${realName}` : `Bonjour, ${realName}`)} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
            {isArabic
              ? 'واصل المراجعة اليومية بخطى ثابتة نحو النجاح في البكالوريا بتفوق.'
              : (language === 'en' ? 'Your workspace to methodically prepare for the Baccalaureate.' : 'Ton espace de travail pour réviser méthodiquement le Baccalauréat.')}
          </p>
        </div>

        {/* Stream switcher pill */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-bold self-start sm:self-center">
          <button
            onClick={() => onStreamChange('sciences_experimentales')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              isSci
                ? 'bg-white dark:bg-[#131B2E] text-blue-700 dark:text-blue-400 shadow-2xs font-extrabold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {isArabic ? '🔬 علوم تجريبية' : (language === 'en' ? '🔬 Experimental Sciences' : '🔬 Sciences Exp.')}
          </button>
          <button
            onClick={() => onStreamChange('mathematiques')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              !isSci
                ? 'bg-white dark:bg-[#131B2E] text-purple-700 dark:text-purple-400 shadow-2xs font-extrabold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {isArabic ? '📐 رياضيات' : (language === 'en' ? '📐 Mathematics' : '📐 Maths')}
          </button>
        </div>
      </div>

      {/* =========================================================================
          STUDENT PERSONAL GOAL & ASPIRATIONS CARD
         ========================================================================= */}
      {(currentUser?.dream || currentUser?.goal || profile.dream || profile.goal) ? (
        <div
          id="student-personal-goal-card"
          className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 dark:from-[#0c1427] dark:via-[#161a3d] dark:to-[#0f172a] text-white border border-blue-500/30 dark:border-blue-900/60 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shrink-0">
              <Trophy className="w-6 h-6 fill-amber-300" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-[11px] font-extrabold uppercase tracking-wider border border-blue-400/20">
                  {isArabic ? 'هدفي في البكالوريا' : (language === 'en' ? 'My BAC Challenge' : 'Mon Défi BAC')}
                </span>
                {(currentUser?.target_score || profile.targetScore) && (
                  <span className="text-xs font-mono font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                    {isArabic
                      ? `المعدل المستهدف: ${currentUser?.target_score || profile.targetScore}/20`
                      : `Cible : ${currentUser?.target_score || profile.targetScore}/20`}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm sm:text-base font-extrabold text-white">
                {(currentUser?.dream || profile.dream) && (
                  <span className="flex items-center gap-1.5 text-purple-200">
                    <span>✨</span>
                    <span>{currentUser?.dream || profile.dream}</span>
                  </span>
                )}
                {(currentUser?.dream || profile.dream) && (currentUser?.goal || profile.goal) && (
                  <span className="text-slate-400">•</span>
                )}
                {(currentUser?.goal || profile.goal) && (
                  <span className="text-emerald-300 font-semibold text-xs sm:text-sm">
                    {currentUser?.goal || profile.goal}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('profile')}
            className="self-end md:self-center px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <span>{isArabic ? 'تعديل طموحي' : (language === 'en' ? 'Edit my goal' : 'Modifier mon objectif')}</span>
            <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
          </button>
        </div>
      ) : (
        <div
          id="student-set-goal-prompt"
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-slate-900/80 dark:to-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {isArabic ? 'حدد حلمك وهدفك في البكالوريا' : (language === 'en' ? 'Define your dream and BAC target' : 'Définis ton rêve et ton objectif BAC')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {isArabic
                  ? 'خصص تجربتك واجعل المساعد الذكي يوجهك نحو تخصص أحلامك.'
                  : (language === 'en' ? 'Personalize your experience and receive AI advice oriented toward your future.' : 'Personnalise ton expérience et reçois des conseils de l’IA orientés vers ton avenir.')}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('profile')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <span>{isArabic ? 'تحديد الهدف الآن' : (language === 'en' ? 'Set my goal now' : 'Définir mon objectif')}</span>
            <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}

      {/* =========================================================================
          2. CONTINUE LEARNING HERO BANNER
         ========================================================================= */}
      {nextLesson && (
        <div
          id="continue-learning-hero"
          className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 dark:from-[#0f172a] dark:via-[#1e1b4b] dark:to-[#0f172a] border border-blue-600/30 dark:border-slate-800 shadow-sm text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all"
        >
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-100 text-[11px] font-extrabold uppercase tracking-wider border border-blue-400/20">
                {isArabic ? 'تابع المراجعة الآن' : (language === 'en' ? 'Resume studying' : 'Reprendre la révision')}
              </span>
              <span className="text-xs text-blue-200 font-medium">
                • {isArabic ? nextLessonSubject?.arabicName : nextLessonSubject?.name}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white truncate">
              {nextLesson.title}
            </h2>

            <p className="text-xs sm:text-sm text-blue-100/80 font-medium line-clamp-1">
              {nextLesson.chapter ? `${nextLesson.chapter} • ` : ''}
              {nextLesson.estimatedMinutes
                ? `${nextLesson.estimatedMinutes} ${isArabic ? 'دقيقة قراءة' : (language === 'en' ? 'min read' : 'min de lecture')}`
                : isArabic
                ? 'درس منظم وفق المنهاج الوزاري'
                : (language === 'en' ? 'Official 3AS curriculum' : 'Programme officiel 3AS')}
            </p>
          </div>

          <button
            onClick={() => onNavigate('lesson', { lessonId: nextLesson.id })}
            className="w-full md:w-auto px-5 py-3 rounded-xl bg-white text-blue-900 hover:bg-blue-50 active:scale-95 font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
          >
            <PlayCircle className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{isArabic ? 'متابعة الدرس' : (language === 'en' ? 'Continue lesson' : 'Continuer le cours')}</span>
            <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}

      {/* =========================================================================
          3. ROW: PROGRESS CARD + BAC COUNTDOWN CARD
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {/* Large Progress Card (2/3 width on desktop) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-center gap-6 justify-between transition-colors">
          {/* Left: Circular Progress Indicator */}
          <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-600 dark:text-blue-500"
                strokeDasharray={`${progressPercentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                {progressPercentage}%
              </span>
            </div>
          </div>

          {/* Center: Title + Progress Bar + Subtitle */}
          <div className="flex-1 w-full space-y-2 text-center sm:text-start">
            <div className="flex items-center justify-center sm:justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isArabic ? 'مستوى الإنجاز العام' : (language === 'en' ? 'Overall progress' : 'Progression globale')}
              </h2>
              <span className="hidden sm:inline-block text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono">
                {completedLessons}/{totalLessons > 0 ? totalLessons : 48}{' '}
                {isArabic ? 'درس مكتمل' : (language === 'en' ? 'lessons' : 'cours')}
              </span>
            </div>

            {/* Smooth progress bar */}
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-700"
                style={{ width: `${Math.max(5, progressPercentage)}%` }}
              />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {isArabic
                ? 'الحفاظ على وتيرة دراسة منتظمة يرفع فرص نيل شهادة البكالوريا بتفوق.'
                : (language === 'en' ? 'Daily consistency ensures complete mastery of the curriculum.' : 'Une régularité quotidienne garantit la maîtrise complète du programme.')}
            </p>
          </div>

          {/* Right: Browse Lessons Button */}
          <button
            onClick={() => onNavigate('lessons')}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer"
          >
            <span>{isArabic ? 'تصفح الدروس' : (language === 'en' ? 'View lessons' : 'Voir les cours')}</span>
            <ChevronRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* BAC Countdown Card (1/3 width on desktop) */}
        <div
          onClick={() => onNavigate('planner')}
          role="button"
          tabIndex={0}
          className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-blue-300 dark:hover:border-blue-500/50 transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  BAC {bacTargetYear}
                </span>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {isArabic ? 'الامتحان الوطني الرسمي' : (language === 'en' ? 'Official National Exam' : 'Examen officiel')}
                </div>
              </div>
            </div>
            <ChevronRight
              className={`w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-transform ${
                isRTL ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'
              }`}
            />
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                {daysRemaining}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                {isArabic ? 'يوم متبقي' : (language === 'en' ? 'days remaining' : 'jours restants')}
              </span>
            </div>
            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
              {isArabic ? 'دورة جوان' : (language === 'en' ? 'June Session' : 'Session Juin')}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. "MON APPRENTISSAGE" (4 Core Educational Categories)
         ========================================================================= */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {isArabic ? 'محاور التعلم' : (language === 'en' ? 'My Learning' : 'Mon apprentissage')}
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {isArabic ? 'وصول مباشر وسريع' : (language === 'en' ? 'Quick Access' : 'Accès direct')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {coreCategories.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                id={`learning-card-${item.id}`}
                onClick={() => onNavigate(item.id)}
                role="button"
                tabIndex={0}
                className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group text-start active:scale-[0.99]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${item.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <ArrowRight
                      className={`w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-transform ${
                        isRTL ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'
                      }`}
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          5. "MES MATIÈRES" (Subject Cards strictly filtered by Stream)
         ========================================================================= */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {isArabic ? 'المواد الدراسية' : (language === 'en' ? 'My Subjects' : 'Mes matières')}
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              ({isSci ? (isArabic ? 'علوم تجريبية' : (language === 'en' ? 'Experimental Sciences' : 'Sciences Exp.')) : (isArabic ? 'رياضيات' : (language === 'en' ? 'Mathematics' : 'Maths'))})
            </span>
          </div>

          <button
            onClick={() => onNavigate('subjects')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{isArabic ? 'عرض كل المواد' : (language === 'en' ? 'View all subjects' : 'Voir tout')}</span>
            <ChevronRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {streamSubjects.map((sub, idx) => {
            const coeff = sub.coefficient[currentStream];
            const sampleProgress = [75, 45, 80, 50, 65, 30, 90][idx % 7];

            return (
              <div
                key={sub.id}
                id={`subject-card-${sub.id}`}
                onClick={() => onNavigate('subject-detail', { subjectId: sub.id })}
                role="button"
                tabIndex={0}
                className="p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.99]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    {renderSubjectIcon(sub.id)}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                      {isArabic ? `معامل ${coeff}` : (language === 'en' ? `Coeff ${coeff}` : `Coeff ${coeff}`)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {isArabic ? sub.arabicName : sub.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {isArabic ? sub.description : (sub.description || (language === 'en' ? 'Official 3AS curriculum' : 'Programme officiel 3AS'))}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-1 max-w-[120px]">
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
                        style={{ width: `${sampleProgress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 font-mono">
                      {sampleProgress}%
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                    {isArabic ? 'دخول' : (language === 'en' ? 'Open' : 'Ouvrir')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          6. ROW: TODAY'S STUDY TASKS CHECKLIST + QUICK TOOLS
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Today's Tasks Interactive Checklist (2/3 width) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isArabic ? 'أهداف المراجعة لليوم' : (language === 'en' ? "Today's revision goals" : "Objectifs d'aujourd'hui")}
              </h2>
            </div>
            <button
              onClick={() => setIsAddTaskModalOpen(true)}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isArabic ? 'إضافة مهمة' : (language === 'en' ? 'Add task' : 'Ajouter une tâche')}</span>
            </button>
          </div>

          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  task.completed
                    ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-75'
                    : 'bg-white dark:bg-[#151F36] border-slate-200/80 dark:border-slate-700/80 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="shrink-0 cursor-pointer focus:outline-none"
                    aria-label={task.completed ? 'Marquer non fait' : 'Marquer fait'}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 hover:text-blue-500" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-xs sm:text-sm font-semibold truncate ${
                        task.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {task.title}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="font-bold text-blue-600 dark:text-blue-400">{task.subject}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.time}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1 text-slate-300 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400 transition-colors cursor-pointer shrink-0"
                  title={isArabic ? 'حذف المهمة' : (language === 'en' ? 'Delete' : 'Supprimer')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tools & Study Assistant (1/3 width) */}
        <div className="space-y-4">
          {/* AI Mentor Card */}
          <div
            onClick={() => onNavigate('ai-assistant')}
            role="button"
            tabIndex={0}
            className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-blue-50/70 dark:from-[#141d33] dark:to-[#17203b] border border-indigo-200/80 dark:border-indigo-900/60 shadow-2xs hover:border-indigo-400 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/90 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
                    {isArabic ? 'مساعد EOS BAC AI' : (language === 'en' ? 'EOS BAC AI Assistant' : 'Assistant EOS BAC AI')}
                  </h3>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                {isArabic ? 'قريبًا' : (language === 'en' ? 'Soon' : 'Bientôt')}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {isArabic
                ? 'مساعد الذكاء الاصطناعي قيد التطوير حاليًا وسيكون متاحًا قريبًا لمرافقتكم بشروحات منهجية وتدريبات.'
                : (language === 'en' ? 'Our AI assistant is currently being prepared. It will be available soon.' : 'Notre assistant IA est actuellement en préparation. Il sera bientôt disponible.')}
            </p>
            <div className="mt-3 flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline">
              <span>{isArabic ? 'معاينة الميزة' : (language === 'en' ? 'Learn more' : 'En savoir plus')}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
            </div>
          </div>

          {/* Interactive Quiz Shortcut Card */}
          <div
            onClick={() => onNavigate('quiz')}
            role="button"
            tabIndex={0}
            className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-blue-400 dark:hover:border-blue-500/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isArabic ? 'اختبار تقييمي سريع' : (language === 'en' ? 'Quick Evaluation Quiz' : 'Quiz & QCM express')}
                </h3>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                  {isArabic ? '5 دقائق' : (language === 'en' ? '5 minutes' : '5 minutes')}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isArabic
                ? 'ثبّت مكتسباتك واكتشف الثغرات قبل امتحانات الفصل.'
                : (language === 'en' ? 'Test your knowledge and check your mastery of key concepts.' : 'Teste tes connaissances et vérifie ta maîtrise des concepts clés.')}
            </p>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isArabic ? 'إضافة هدف دراسي جديد' : (language === 'en' ? 'Add study goal' : 'Ajouter un objectif de révision')}
              </h3>
              <button
                onClick={() => setIsAddTaskModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isArabic ? 'عنوان الهدف' : (language === 'en' ? 'Task title' : 'Intitulé de la tâche')}
                </label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder={isArabic ? 'مثلاً: حل تمرين الدوال الأسية...' : (language === 'en' ? 'E.g.: Solve 2 sequence exercises...' : 'Ex: Résoudre 2 exercices de suites...')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isArabic ? 'المادة' : (language === 'en' ? 'Subject' : 'Matière')}
                  </label>
                  <select
                    value={newTaskSubject}
                    onChange={(e) => setNewTaskSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 outline-none"
                  >
                    {streamSubjects.map((s) => (
                      <option key={s.id} value={isArabic ? s.arabicName : s.name}>
                        {isArabic ? s.arabicName : s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isArabic ? 'المدة التقديرية' : (language === 'en' ? 'Estimated duration' : 'Durée estimée')}
                  </label>
                  <input
                    type="text"
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(e.target.value)}
                    placeholder="45 min"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 outline-none"
                  >
                  </input>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {isArabic ? 'إلغاء' : (language === 'en' ? 'Cancel' : 'Annuler')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs"
                >
                  {isArabic ? 'حفظ المهمة' : (language === 'en' ? 'Save' : 'Enregistrer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
