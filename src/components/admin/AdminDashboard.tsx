import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { StreamType, Lesson, Exercise, Summary, BacExam } from '../../types';
import { AdminUsersTab } from './AdminUsersTab';
import {
  BookOpen,
  FileCheck2,
  FileText,
  BookmarkCheck,
  Users,
  ShieldAlert,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
  ArrowLeft,
  Shield,
  Search,
} from 'lucide-react';

export type AdminTab = 'lessons' | 'exercises' | 'summaries' | 'bac' | 'users';

interface AdminDashboardProps {
  onBackToStudent: () => void;
  initialTab?: AdminTab;
  onTabChange?: (tab: AdminTab) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToStudent,
  initialTab = 'lessons',
  onTabChange,
}) => {
  const { isAdmin, users } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const isArabic = language === 'ar';

  const {
    subjects,
    lessons,
    exercises,
    summaries,
    bacExams,
    addLesson,
    deleteLesson,
    togglePublishLesson,
    addExercise,
    deleteExercise,
    togglePublishExercise,
    addSummary,
    deleteSummary,
    togglePublishSummary,
    addBacExam,
    deleteBacExam,
    togglePublishBacExam,
  } = useContent();

  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);

  React.useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabSwitch = (tab: AdminTab) => {
    setActiveTab(tab);
    if (tab === 'users') {
      try {
        window.history.replaceState(null, '', '/admin/users');
      } catch {}
    } else {
      try {
        window.history.replaceState(null, '', '/admin');
      } catch {}
    }
    onTabChange?.(tab);
  };
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [isAddSummaryOpen, setIsAddSummaryOpen] = useState(false);
  const [isAddBacOpen, setIsAddBacOpen] = useState(false);

  // Lesson Form state
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonSubjectId, setLessonSubjectId] = useState(subjects[0]?.id || 'maths');
  const [lessonChapter, setLessonChapter] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonDuration, setLessonDuration] = useState(15);

  // Exercise Form state
  const [exTitle, setExTitle] = useState('');
  const [exSubjectId, setExSubjectId] = useState(subjects[0]?.id || 'maths');
  const [exChapter, setExChapter] = useState('');
  const [exDifficulty, setExDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [exDesc, setExDesc] = useState('');
  const [exSolution, setExSolution] = useState('');

  // Summary Form state
  const [sumTitle, setSumTitle] = useState('');
  const [sumSubjectId, setSumSubjectId] = useState(subjects[0]?.id || 'maths');
  const [sumChapter, setSumChapter] = useState('');
  const [sumContent, setSumContent] = useState('');
  const [sumFormulas, setSumFormulas] = useState('');
  const [sumKeyPoints, setSumKeyPoints] = useState('');

  // BAC Form state
  const [bacTitle, setBacTitle] = useState('');
  const [bacYear, setBacYear] = useState<number>(2025);
  const [bacSubjectId, setBacSubjectId] = useState(subjects[0]?.id || 'maths');
  const [bacStream, setBacStream] = useState<StreamType>('sciences_experimentales');
  const [bacSession, setBacSession] = useState<'Principale' | 'Rattrapage'>('Principale');

  // Strict Admin Guard
  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{t.auth.accessDeniedStudent}</h2>
        <p className="text-xs text-slate-500 max-w-md">{t.auth.adminNotice}</p>
        <button
          onClick={onBackToStudent}
          className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
        >
          {t.admin.backToStudent}
        </button>
      </div>
    );
  }

  // Submit handlers
  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim()) return;
    addLesson({
      title: lessonTitle.trim(),
      subjectId: lessonSubjectId,
      chapterId: lessonChapter.trim() || 'default',
      chapter: lessonChapter.trim() || undefined,
      content: lessonContent.trim() || undefined,
      estimatedMinutes: lessonDuration,
      published: true,
    });
    setLessonTitle('');
    setLessonChapter('');
    setLessonContent('');
    setIsAddLessonOpen(false);
  };

  const handleSaveExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exTitle.trim()) return;
    addExercise({
      title: exTitle.trim(),
      subjectId: exSubjectId,
      chapterId: exChapter.trim() || 'default',
      chapter: exChapter.trim() || undefined,
      difficulty: exDifficulty,
      description: exDesc.trim(),
      solution: exSolution.trim() || undefined,
      hasSolution: Boolean(exSolution.trim()),
      published: true,
    });
    setExTitle('');
    setExChapter('');
    setExDesc('');
    setExSolution('');
    setIsAddExerciseOpen(false);
  };

  const handleSaveSummary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sumTitle.trim()) return;
    addSummary({
      title: sumTitle.trim(),
      subjectId: sumSubjectId,
      stream: 'sciences_experimentales',
      chapter: sumChapter.trim() || undefined,
      content: sumContent.trim(),
      formulas: sumFormulas.split('\n').map((f) => f.trim()).filter(Boolean),
      keyPoints: sumKeyPoints.split('\n').map((k) => k.trim()).filter(Boolean),
      published: true,
    });
    setSumTitle('');
    setSumChapter('');
    setSumContent('');
    setSumFormulas('');
    setSumKeyPoints('');
    setIsAddSummaryOpen(false);
  };

  const handleSaveBac = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bacTitle.trim()) return;
    addBacExam({
      title: bacTitle.trim(),
      year: Number(bacYear),
      subjectId: bacSubjectId,
      stream: bacStream,
      session: bacSession,
      published: true,
    });
    setBacTitle('');
    setIsAddBacOpen(false);
  };

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto transition-colors" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40 text-xs font-bold flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{isArabic ? 'لوحة تحكم المشرف' : (language === 'en' ? 'Admin Space (CMS)' : 'Espace Administration (CMS)')}</span>
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {isArabic ? 'إدارة المحتوى التعليمي' : (language === 'en' ? 'Educational Content Management' : 'Gestion du Contenu Pédagogique')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isArabic ? 'إضافة وتعديل وحذف ونشر الدروس والتمارين والملخصات ومواضيع البكالوريا.' : (language === 'en' ? 'Complete control over educational resources for scientific streams.' : 'Contrôle complet des ressources pédagogiques pour les filières scientifiques.')}
          </p>
        </div>

        <button
          onClick={onBackToStudent}
          className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors self-start sm:self-center cursor-pointer"
        >
          <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          <span>{isArabic ? 'العودة إلى وضع التلميذ' : (language === 'en' ? 'Back to Student Mode' : 'Retour Espace Élève')}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => handleTabSwitch('lessons')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'lessons' ? 'bg-white dark:bg-[#131B2E] text-blue-700 dark:text-blue-400 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{isArabic ? 'الدروس' : (language === 'en' ? 'Lessons' : 'Cours')} ({lessons.length})</span>
        </button>

        <button
          onClick={() => handleTabSwitch('exercises')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'exercises' ? 'bg-white dark:bg-[#131B2E] text-emerald-700 dark:text-emerald-400 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>{isArabic ? 'التمارين' : (language === 'en' ? 'Exercises' : 'Exercices')} ({exercises.length})</span>
        </button>

        <button
          onClick={() => handleTabSwitch('summaries')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'summaries' ? 'bg-white dark:bg-[#131B2E] text-purple-700 dark:text-purple-400 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{isArabic ? 'الملخصات' : (language === 'en' ? 'Summaries' : 'Résumés')} ({summaries.length})</span>
        </button>

        <button
          onClick={() => handleTabSwitch('bac')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'bac' ? 'bg-white dark:bg-[#131B2E] text-amber-700 dark:text-amber-400 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookmarkCheck className="w-4 h-4" />
          <span>{isArabic ? 'مواضيع البكالوريا' : (language === 'en' ? 'BAC Exams' : 'Sujets BAC')} ({bacExams.length})</span>
        </button>

        <button
          onClick={() => handleTabSwitch('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'users' ? 'bg-white dark:bg-[#131B2E] text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{isArabic ? 'المستخدمون' : (language === 'en' ? 'Users' : 'Utilisateurs')} ({users.length})</span>
        </button>
      </div>

      {/* TAB 1: LESSONS MANAGEMENT */}
      {activeTab === 'lessons' && (
        <div className="bg-white dark:bg-[#131B2E] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isArabic ? 'قائمة الدروس' : (language === 'en' ? 'Lesson Management' : 'Gestion des Cours')}
            </h3>
            <button
              onClick={() => setIsAddLessonOpen(true)}
              className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isArabic ? 'إضافة درس جديد' : (language === 'en' ? 'New lesson' : 'Nouveau cours')}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold bg-slate-50 dark:bg-slate-900/60">
                  <th className="py-2.5 px-3 text-start">{isArabic ? 'العنوان' : (language === 'en' ? 'Title' : 'Titre')}</th>
                  <th className="py-2.5 px-3 text-start">{isArabic ? 'المادة' : (language === 'en' ? 'Subject' : 'Matière')}</th>
                  <th className="py-2.5 px-3 text-start">{isArabic ? 'الوحدة' : (language === 'en' ? 'Chapter' : 'Chapitre')}</th>
                  <th className="py-2.5 px-3 text-start">{isArabic ? 'الحالة' : (language === 'en' ? 'Status' : 'Statut')}</th>
                  <th className="py-2.5 px-3 text-end">{isArabic ? 'إجراءات' : (language === 'en' ? 'Actions' : 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {lessons.map((les) => {
                  const sub = subjects.find((s) => s.id === les.subjectId);
                  return (
                    <tr key={les.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{les.title}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{sub ? (isArabic ? sub.arabicName : sub.name) : '-'}</td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{les.chapter || '-'}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          les.published ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {les.published ? (isArabic ? 'منشور' : (language === 'en' ? 'Published' : 'Publié')) : (isArabic ? 'مسودة' : (language === 'en' ? 'Draft' : 'Brouillon'))}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-end space-x-2">
                        <button
                          onClick={() => togglePublishLesson(les.id)}
                          title={les.published ? 'Masquer' : 'Publier'}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
                        >
                          {les.published ? <EyeOff className="w-4 h-4 text-amber-600 dark:text-amber-400" /> : <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                        </button>
                        <button
                          onClick={() => deleteLesson(les.id)}
                          title="Supprimer"
                          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: EXERCISES MANAGEMENT */}
      {activeTab === 'exercises' && (
        <div className="bg-white dark:bg-[#131B2E] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isArabic ? 'قائمة التمارين' : (language === 'en' ? 'Exercise Management' : 'Gestion des Exercices')}
            </h3>
            <button
              onClick={() => setIsAddExerciseOpen(true)}
              className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isArabic ? 'إضافة تمرين جديد' : (language === 'en' ? 'New exercise' : 'Nouvel exercice')}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold bg-slate-50 dark:bg-slate-900/60">
                  <th className="py-2.5 px-3 text-start">{isArabic ? 'العنوان' : (language === 'en' ? 'Title' : 'Titre')}</th>
                  <th className="py-2.5 px-3 text-start">{isArabic ? 'المادة' : (language === 'en' ? 'Subject' : 'Matière')}</th>
                  <th className="py-2.5 px-3 text-start">{isArabic ? 'الصعوبة' : (language === 'en' ? 'Difficulty' : 'Difficulté')}</th>
                  <th className="py-2.5 px-3 text-start">{isArabic ? 'الحل' : (language === 'en' ? 'Solution' : 'Corrigé')}</th>
                  <th className="py-2.5 px-3 text-end">{isArabic ? 'إجراءات' : (language === 'en' ? 'Actions' : 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {exercises.map((ex) => {
                  const sub = subjects.find((s) => s.id === ex.subjectId);
                  return (
                    <tr key={ex.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{ex.title}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{sub ? (isArabic ? sub.arabicName : sub.name) : '-'}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {ex.difficulty}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          ex.hasSolution ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}>
                          {ex.hasSolution ? 'Disponible' : 'Sans'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-end space-x-2">
                        <button
                          onClick={() => togglePublishExercise(ex.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
                        >
                          {ex.published ? <EyeOff className="w-4 h-4 text-amber-600 dark:text-amber-400" /> : <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                        </button>
                        <button
                          onClick={() => deleteExercise(ex.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SUMMARIES MANAGEMENT */}
      {activeTab === 'summaries' && (
        <div className="bg-white dark:bg-[#131B2E] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isArabic ? 'قائمة الملخصات' : (language === 'en' ? 'Summary Management' : 'Gestion des Résumés')}
            </h3>
            <button
              onClick={() => setIsAddSummaryOpen(true)}
              className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isArabic ? 'إضافة ملخص جديد' : (language === 'en' ? 'New summary' : 'Nouveau résumé')}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold bg-slate-50 dark:bg-slate-900/60">
                  <th className="py-2.5 px-3 text-start">{isArabic ? 'العنوان' : (language === 'en' ? 'Title' : 'Titre')}</th>
                  <th className="py-2.5 px-3 text-start">{isArabic ? 'المادة' : (language === 'en' ? 'Subject' : 'Matière')}</th>
                  <th className="py-2.5 px-3 text-start">{isArabic ? 'الوحدة' : (language === 'en' ? 'Chapter' : 'Chapitre')}</th>
                  <th className="py-2.5 px-3 text-start">{isArabic ? 'الحالة' : (language === 'en' ? 'Status' : 'Statut')}</th>
                  <th className="py-2.5 px-3 text-end">{isArabic ? 'إجراءات' : (language === 'en' ? 'Actions' : 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {summaries.map((sum) => {
                  const sub = subjects.find((s) => s.id === sum.subjectId);
                  return (
                    <tr key={sum.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{sum.title}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{sub ? (isArabic ? sub.arabicName : sub.name) : '-'}</td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{sum.chapter || '-'}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          sum.published ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {sum.published ? (isArabic ? 'منشور' : (language === 'en' ? 'Published' : 'Publié')) : (isArabic ? 'مسودة' : (language === 'en' ? 'Draft' : 'Brouillon'))}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-end space-x-2">
                        <button
                          onClick={() => togglePublishSummary(sum.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
                        >
                          {sum.published ? <EyeOff className="w-4 h-4 text-amber-600 dark:text-amber-400" /> : <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                        </button>
                        <button
                          onClick={() => deleteSummary(sum.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: BAC SUBJECTS MANAGEMENT */}
      {activeTab === 'bac' && (
        <div className="bg-white dark:bg-[#131B2E] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isArabic ? 'مواضيع وحوليات البكالوريا' : (language === 'en' ? 'BAC Exams Management' : 'Gestion des Sujets du BAC')}
            </h3>
            <button
              onClick={() => setIsAddBacOpen(true)}
              className="py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isArabic ? 'إضافة موضوع جديد' : (language === 'en' ? 'New past exam' : 'Nouveau sujet BAC')}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold bg-slate-50 dark:bg-slate-900/60">
                  <th className="py-2.5 px-3 text-start">{isArabic ? 'السنة' : (language === 'en' ? 'Year' : 'Année')}</th>
                  <th className="py-2.5 px-3 text-start">{isArabic ? 'الموضوع' : (language === 'en' ? 'Title' : 'Titre')}</th>
                  <th className="py-2.5 px-3 text-start">{isArabic ? 'الشعبة' : (language === 'en' ? 'Stream' : 'Filière')}</th>
                  <th className="py-2.5 px-3 text-start">{isArabic ? 'المادة' : (language === 'en' ? 'Subject' : 'Matière')}</th>
                  <th className="py-2.5 px-3 text-end">{isArabic ? 'إجراءات' : (language === 'en' ? 'Actions' : 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {bacExams.map((bac) => {
                  const sub = subjects.find((s) => s.id === bac.subjectId);
                  return (
                    <tr key={bac.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">BAC {bac.year}</td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{bac.title}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {bac.stream === 'sciences_experimentales' ? 'Sciences Exp.' : 'Maths'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{sub ? (isArabic ? sub.arabicName : sub.name) : '-'}</td>
                      <td className="py-3 px-3 text-end space-x-2">
                        <button
                          onClick={() => togglePublishBacExam(bac.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
                        >
                          {bac.published ? <EyeOff className="w-4 h-4 text-amber-600 dark:text-amber-400" /> : <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                        </button>
                        <button
                          onClick={() => deleteBacExam(bac.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: USERS MANAGEMENT */}
      {activeTab === 'users' && <AdminUsersTab />}

      {/* MODAL: ADD LESSON */}
      {isAddLessonOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#131B2E] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isArabic ? 'إضافة درس جديد' : (language === 'en' ? 'New Lesson' : 'Nouveau Cours')}
              </h3>
              <button onClick={() => setIsAddLessonOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSaveLesson} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Titre du cours *</label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="ex: Les limites et la continuité"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Matière *</label>
                  <select
                    value={lessonSubjectId}
                    onChange={(e) => setLessonSubjectId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{isArabic ? s.arabicName : s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Chapitre / Unité</label>
                  <input
                    type="text"
                    value={lessonChapter}
                    onChange={(e) => setLessonChapter(e.target.value)}
                    placeholder="ex: Chapitre 1"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Contenu explicatif</label>
                <textarea
                  rows={4}
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  placeholder="Contenu du cours..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddLessonOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold cursor-pointer"
                >
                  {isArabic ? 'إلغاء' : (language === 'en' ? 'Cancel' : 'Annuler')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs cursor-pointer"
                >
                  {isArabic ? 'حفظ' : (language === 'en' ? 'Save' : 'Enregistrer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD EXERCISE */}
      {isAddExerciseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#131B2E] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isArabic ? 'إضافة تمرين جديد' : (language === 'en' ? 'New Exercise' : 'Nouvel Exercice')}
              </h3>
              <button onClick={() => setIsAddExerciseOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSaveExercise} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Titre de l'exercice *</label>
                <input
                  type="text"
                  required
                  value={exTitle}
                  onChange={(e) => setExTitle(e.target.value)}
                  placeholder="ex: Exercice sur la dérivation"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Matière</label>
                  <select
                    value={exSubjectId}
                    onChange={(e) => setExSubjectId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{isArabic ? s.arabicName : s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Difficulté</label>
                  <select
                    value={exDifficulty}
                    onChange={(e: any) => setExDifficulty(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none"
                  >
                    <option value="easy">Facile (سهل)</option>
                    <option value="medium">Moyen (متوسط)</option>
                    <option value="hard">Difficile (صعب)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Énoncé *</label>
                <textarea
                  rows={3}
                  required
                  value={exDesc}
                  onChange={(e) => setExDesc(e.target.value)}
                  placeholder="Énoncé du problème..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Corrigé type (optionnel)</label>
                <textarea
                  rows={3}
                  value={exSolution}
                  onChange={(e) => setExSolution(e.target.value)}
                  placeholder="Solution étape par étape..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddExerciseOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold cursor-pointer"
                >
                  {isArabic ? 'إلغاء' : (language === 'en' ? 'Cancel' : 'Annuler')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs cursor-pointer"
                >
                  {isArabic ? 'حفظ' : (language === 'en' ? 'Save' : 'Enregistrer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SUMMARY */}
      {isAddSummaryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#131B2E] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isArabic ? 'إضافة ملخص جديد' : (language === 'en' ? 'New Summary' : 'Nouveau Résumé')}
              </h3>
              <button onClick={() => setIsAddSummaryOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSaveSummary} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Titre de la fiche *</label>
                <input
                  type="text"
                  required
                  value={sumTitle}
                  onChange={(e) => setSumTitle(e.target.value)}
                  placeholder="ex: Fiche mémo : Fonctions exponentielles"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Matière</label>
                  <select
                    value={sumSubjectId}
                    onChange={(e) => setSumSubjectId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{isArabic ? s.arabicName : s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Chapitre</label>
                  <input
                    type="text"
                    value={sumChapter}
                    onChange={(e) => setSumChapter(e.target.value)}
                    placeholder="ex: Analyse"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Formules (une par ligne)</label>
                <textarea
                  rows={2}
                  value={sumFormulas}
                  onChange={(e) => setSumFormulas(e.target.value)}
                  placeholder="e^(a+b) = e^a * e^b..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Synthèse / Contenu *</label>
                <textarea
                  rows={3}
                  required
                  value={sumContent}
                  onChange={(e) => setSumContent(e.target.value)}
                  placeholder="Synthèse du cours..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSummaryOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold cursor-pointer"
                >
                  {isArabic ? 'إلغاء' : (language === 'en' ? 'Cancel' : 'Annuler')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-xs cursor-pointer"
                >
                  {isArabic ? 'حفظ' : (language === 'en' ? 'Save' : 'Enregistrer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD BAC SUBJECT */}
      {isAddBacOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#131B2E] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isArabic ? 'إضافة موضوع بكالوريا جديد' : (language === 'en' ? 'New BAC Exam' : 'Nouveau Sujet BAC')}
              </h3>
              <button onClick={() => setIsAddBacOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSaveBac} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Titre de l'épreuve *</label>
                <input
                  type="text"
                  required
                  value={bacTitle}
                  onChange={(e) => setBacTitle(e.target.value)}
                  placeholder="ex: BAC 2025 - Épreuve de Mathématiques (Sujet 1)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Année *</label>
                  <input
                    type="number"
                    required
                    min={2015}
                    max={2030}
                    value={bacYear}
                    onChange={(e) => setBacYear(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Matière</label>
                  <select
                    value={bacSubjectId}
                    onChange={(e) => setBacSubjectId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{isArabic ? s.arabicName : s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Filière</label>
                  <select
                    value={bacStream}
                    onChange={(e: any) => setBacStream(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none"
                  >
                    <option value="sciences_experimentales">Sciences Exp.</option>
                    <option value="mathematiques">Mathématiques</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddBacOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold cursor-pointer"
                >
                  {isArabic ? 'إلغاء' : (language === 'en' ? 'Cancel' : 'Annuler')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-xs cursor-pointer"
                >
                  {isArabic ? 'حفظ' : (language === 'en' ? 'Save' : 'Enregistrer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
