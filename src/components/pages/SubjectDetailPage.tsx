import React, { useState } from 'react';
import { ViewType, StreamType } from '../../types';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { EmptyState } from '../common/EmptyState';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  FileCheck2,
  FileText,
  BookmarkCheck,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Download,
  Check,
} from 'lucide-react';

interface SubjectDetailPageProps {
  onNavigate: (view: ViewType, payload?: any) => void;
  subjectId?: string;
  currentStream: StreamType;
}

export const SubjectDetailPage: React.FC<SubjectDetailPageProps> = ({
  onNavigate,
  subjectId = 'maths',
  currentStream,
}) => {
  const { subjects, chapters, lessons, exercises, summaries, bacExams, toggleLessonCompleted, toggleExerciseCompleted } = useContent();
  const { t, isRTL, language } = useLanguage();
  const isArabic = language === 'ar';

  const [activeContentType, setActiveContentType] = useState<'lessons' | 'exercises' | 'summaries' | 'bac-exams'>('lessons');
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

  const subject = subjects.find((s) => s.id === subjectId) || subjects[0];
  const coeff = subject ? subject.coefficient[currentStream] : 5;

  // Filter content for this subject & stream
  const subjectLessons = lessons.filter(
    (l) => l.subjectId === (subject?.id || subjectId) && l.published
  );

  const subjectExercises = exercises.filter(
    (ex) => ex.subjectId === (subject?.id || subjectId) && ex.published
  );

  const subjectSummaries = summaries.filter(
    (sum) => sum.subjectId === (subject?.id || subjectId) && sum.published
  );

  const subjectBacExams = bacExams.filter(
    (exam) => exam.subjectId === (subject?.id || subjectId) && exam.stream === currentStream && exam.published
  );

  const streamName =
    currentStream === 'sciences_experimentales'
      ? (isArabic ? 'العلوم التجريبية' : (language === 'en' ? 'Experimental Sciences' : 'Sciences Expérimentales'))
      : (isArabic ? 'الرياضيات' : (language === 'en' ? 'Mathematics' : 'Mathématiques'));

  const subjectName = isArabic ? subject.arabicName : subject.name;

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Breadcrumbs: Stream -> Subject -> Content Type */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap" aria-label="Breadcrumb">
        <button
          onClick={() => onNavigate('dashboard')}
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          {isArabic ? 'الرئيسية' : (language === 'en' ? 'Home' : 'Accueil')}
        </button>
        <span>/</span>
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {streamName}
        </span>
        <span>/</span>
        <span className="font-bold text-slate-900 dark:text-white">
          {subjectName}
        </span>
      </nav>

      {/* Subject Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-colors">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {isArabic ? `معامل ${coeff}` : (language === 'en' ? `Coefficient ${coeff}` : `Coefficient ${coeff}`)}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {streamName}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {subjectName}
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-400">
            {isArabic
              ? 'تصفح الدروس والتمارين والملخصات ومواضيع البكالوريا الخاصة بهذه المادة.'
              : (language === 'en' ? 'Access lessons, exercises, summaries, and BAC past exams for this subject.' : 'Accède aux cours, exercices, résumés et sujets du BAC pour cette matière.')}
          </p>
        </div>

        {subjectLessons.length > 0 && (
          <div className="shrink-0">
            <button
              onClick={() => onNavigate('lesson', { lessonId: subjectLessons[0].id })}
              className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-sm shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>{isArabic ? 'ابدأ بالدرس الأول' : (language === 'en' ? 'Start the first lesson' : 'Commencer le 1er cours')}</span>
              <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}
      </div>

      {/* Content Type Tabs (Cours, Exercices, Résumés, Sujets BAC) */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 overflow-x-auto scrollbar-none transition-colors">
        <button
          onClick={() => setActiveContentType('lessons')}
          className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeContentType === 'lessons'
              ? 'bg-white dark:bg-[#131B2E] text-blue-700 dark:text-blue-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{isArabic ? 'الدروس' : (language === 'en' ? 'Lessons' : 'Cours')} ({subjectLessons.length})</span>
        </button>

        <button
          onClick={() => setActiveContentType('exercises')}
          className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeContentType === 'exercises'
              ? 'bg-white dark:bg-[#131B2E] text-emerald-700 dark:text-emerald-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>{isArabic ? 'التمارين' : (language === 'en' ? 'Exercises' : 'Exercices')} ({subjectExercises.length})</span>
        </button>

        <button
          onClick={() => setActiveContentType('summaries')}
          className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeContentType === 'summaries'
              ? 'bg-white dark:bg-[#131B2E] text-purple-700 dark:text-purple-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{isArabic ? 'الملخصات' : (language === 'en' ? 'Summaries' : 'Résumés')} ({subjectSummaries.length})</span>
        </button>

        <button
          onClick={() => setActiveContentType('bac-exams')}
          className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeContentType === 'bac-exams'
              ? 'bg-white dark:bg-[#131B2E] text-amber-700 dark:text-amber-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <BookmarkCheck className="w-4 h-4" />
          <span>{isArabic ? 'مواضيع البكالوريا' : (language === 'en' ? 'BAC Exams' : 'Sujets BAC')} ({subjectBacExams.length})</span>
        </button>
      </div>

      {/* Tab Content Section */}
      <div className="pt-2">
        {/* TAB 1: LESSONS */}
        {activeContentType === 'lessons' && (
          <div className="space-y-3">
            {subjectLessons.length === 0 ? (
              <EmptyState title={isArabic ? 'لا توجد دروس حالياً' : (language === 'en' ? 'No lessons available' : 'Aucun cours disponible')} icon="book" />
            ) : (
              subjectLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <button
                      onClick={() => toggleLessonCompleted(lesson.id)}
                      className={`mt-1 w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                        lesson.isCompleted
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 text-transparent'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {lesson.chapter && (
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {lesson.chapter}
                          </span>
                        )}
                        {lesson.isCompleted && (
                          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{isArabic ? 'مكتمل' : (language === 'en' ? 'Completed' : 'Terminé')}</span>
                          </span>
                        )}
                      </div>
                      <h3
                        onClick={() => onNavigate('lesson', { lessonId: lesson.id })}
                        className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer"
                      >
                        {lesson.title}
                      </h3>
                      {lesson.estimatedMinutes && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>{lesson.estimatedMinutes} {isArabic ? 'دقيقة قراءة' : (language === 'en' ? 'min read' : 'min de lecture')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('lesson', { lessonId: lesson.id })}
                    className="py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 self-end sm:self-center cursor-pointer"
                  >
                    <span>{isArabic ? 'فتح الدرس' : (language === 'en' ? 'Read' : 'Lire')}</span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: EXERCISES */}
        {activeContentType === 'exercises' && (
          <div className="space-y-3">
            {subjectExercises.length === 0 ? (
              <EmptyState title={isArabic ? 'لا توجد تمارين حالياً' : (language === 'en' ? 'No exercises available' : 'Aucun exercice disponible')} icon="exercise" />
            ) : (
              subjectExercises.map((ex) => {
                const isExpanded = expandedExerciseId === ex.id;
                return (
                  <div
                    key={ex.id}
                    className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          onClick={() => toggleExerciseCompleted(ex.id)}
                          className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                            ex.isCompleted
                              ? 'bg-emerald-500 text-white shadow-xs'
                              : 'border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 text-transparent'
                          }`}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {ex.difficulty === 'easy' ? (isArabic ? 'سهل' : (language === 'en' ? 'Easy' : 'Facile')) : ex.difficulty === 'medium' ? (isArabic ? 'متوسط' : (language === 'en' ? 'Medium' : 'Moyen')) : (isArabic ? 'صعب' : (language === 'en' ? 'Hard' : 'Difficile'))}
                            </span>
                            {ex.hasSolution && (
                              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                {isArabic ? 'مرفق بالحل' : (language === 'en' ? 'With solution' : 'Avec corrigé')}
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                            {ex.title}
                          </h3>
                        </div>
                      </div>

                      <button
                        onClick={() => setExpandedExerciseId(isExpanded ? null : ex.id)}
                        className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1 self-end sm:self-center cursor-pointer"
                      >
                        <span>{isExpanded ? (isArabic ? 'إخفاء' : (language === 'en' ? 'Hide' : 'Masquer')) : (isArabic ? 'عرض التمرين' : (language === 'en' ? 'View' : 'Voir'))}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line">
                          {ex.description}
                        </div>
                        {ex.hasSolution && ex.solution && (
                          <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line">
                            <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-1">
                              {isArabic ? 'الحل النموذجي:' : (language === 'en' ? 'Model solution:' : 'Corrigé type :')}
                            </div>
                            {ex.solution}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 3: SUMMARIES */}
        {activeContentType === 'summaries' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjectSummaries.length === 0 ? (
              <div className="col-span-2">
                <EmptyState title={isArabic ? 'لا توجد ملخصات حالياً' : (language === 'en' ? 'No summaries available' : 'Aucun résumé disponible')} icon="document" />
              </div>
            ) : (
              subjectSummaries.map((sum) => (
                <div
                  key={sum.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-purple-300 dark:hover:border-purple-600 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                      {sum.chapter || (isArabic ? 'ملخص وحدة' : (language === 'en' ? 'Unit summary' : 'Fiche'))}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {sum.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {sum.content}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
                    <button
                      onClick={() => onNavigate('summaries')}
                      className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 cursor-pointer"
                    >
                      {isArabic ? 'قراءة الملخص الكامل' : (language === 'en' ? 'Read full summary' : 'Consulter le résumé')}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: BAC EXAMS */}
        {activeContentType === 'bac-exams' && (
          <div className="space-y-3">
            {subjectBacExams.length === 0 ? (
              <EmptyState title={isArabic ? 'لا توجد مواضيع بكالوريا لهذه المادة حالياً' : (language === 'en' ? 'No BAC exams for this subject' : 'Aucun sujet BAC pour cette matière')} icon="document" />
            ) : (
              subjectBacExams.map((exam) => (
                <div
                  key={exam.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold">
                        BAC {exam.year}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {exam.session}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {exam.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigate('bac-exams')}
                      className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'عرض الموضوع والحل' : (language === 'en' ? 'Exam & Solution' : 'Sujet & Corrigé')}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
