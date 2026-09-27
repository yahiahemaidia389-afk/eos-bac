import React, { useState } from 'react';
import { ViewType, StreamType, Lesson } from '../../types';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { EmptyState } from '../common/EmptyState';
import {
  BookOpen,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  Filter,
  Check,
  Sparkles,
} from 'lucide-react';

interface LessonsPageProps {
  onNavigate: (view: ViewType, payload?: any) => void;
  currentStream: StreamType;
}

export const LessonsPage: React.FC<LessonsPageProps> = ({
  onNavigate,
  currentStream,
}) => {
  const { subjects, lessons, toggleLessonCompleted } = useContent();
  const { t, isRTL, language } = useLanguage();
  const isArabic = language === 'ar';

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'uncompleted'>('all');

  // Filter subjects for the active stream
  const activeSubjects = subjects.filter((s) => s.streams.includes(currentStream));

  // Filter published lessons matching stream subjects
  const streamSubjectIds = new Set(activeSubjects.map((s) => s.id));
  const streamLessons = lessons.filter(
    (l) => l.published && streamSubjectIds.has(l.subjectId)
  );

  const filteredLessons = streamLessons.filter((lesson) => {
    if (selectedSubjectId !== 'all' && lesson.subjectId !== selectedSubjectId) {
      return false;
    }
    if (statusFilter === 'completed' && !lesson.isCompleted) return false;
    if (statusFilter === 'uncompleted' && lesson.isCompleted) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = lesson.title.toLowerCase().includes(q);
      const matchChapter = lesson.chapter?.toLowerCase().includes(q);
      if (!matchTitle && !matchChapter) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {isArabic ? 'الدروس' : (language === 'en' ? 'Lessons' : 'Cours')}
            </h1>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {isArabic
              ? 'دروس منظمة حسب المواد والوحدات التعليمية مع متابعة الإنجاز.'
              : (language === 'en' ? 'All lessons organized by subject and chapter with completion tracking.' : 'Tous les cours organisés par matière et chapitre avec suivi de complétion.')}
          </p>
        </div>

        {/* Stream indicator */}
        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 self-start sm:self-center">
          {currentStream === 'sciences_experimentales'
            ? (isArabic ? '🔬 علوم تجريبية' : (language === 'en' ? '🔬 Experimental Sciences' : '🔬 Sciences Exp.'))
            : (isArabic ? '📐 رياضيات' : (language === 'en' ? '📐 Mathematics' : '📐 Maths'))}
        </div>
      </div>

      {/* Filters bar */}
      <div className="space-y-3 bg-white dark:bg-[#131B2E] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        {/* Search input */}
        <div className="relative">
          <Search className={`w-4 h-4 text-slate-400 dark:text-slate-500 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3.5' : 'left-3.5'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isArabic ? 'ابحث عن درس أو وحدة...' : (language === 'en' ? 'Search for a lesson or chapter...' : 'Rechercher un cours ou un chapitre...')}
            className={`w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
              isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'
            }`}
          />
        </div>

        {/* Subject Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedSubjectId('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 cursor-pointer ${
              selectedSubjectId === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {isArabic ? 'جميع المواد' : (language === 'en' ? 'All subjects' : 'Toutes les matières')}
          </button>
          {activeSubjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubjectId(sub.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 cursor-pointer ${
                selectedSubjectId === sub.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {isArabic ? sub.arabicName : sub.name}
            </button>
          ))}
        </div>

        {/* Status filter toggles */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-400 dark:text-slate-500 font-medium">{isArabic ? 'الحالة:' : (language === 'en' ? 'Status:' : 'Statut :')}</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              statusFilter === 'all' ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {isArabic ? 'الكل' : (language === 'en' ? 'All' : 'Tous')}
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              statusFilter === 'completed' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {isArabic ? 'مكتمل' : (language === 'en' ? 'Completed' : 'Terminés')}
          </button>
          <button
            onClick={() => setStatusFilter('uncompleted')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              statusFilter === 'uncompleted' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {isArabic ? 'غير مكتمل' : (language === 'en' ? 'To do' : 'À faire')}
          </button>
        </div>
      </div>

      {/* Lesson List */}
      {filteredLessons.length === 0 ? (
        <EmptyState
          title={isArabic ? 'لا توجد دروس مطابقة' : (language === 'en' ? 'No lessons found' : 'Aucun cours trouvé')}
          description={isArabic ? 'جرب تغيير معايير البحث أو اختيار مادة أخرى.' : (language === 'en' ? 'Try adjusting your search filters.' : 'Essaie de modifier tes filtres ou ta recherche.')}
          icon="book"
        />
      ) : (
        <div className="space-y-3">
          {filteredLessons.map((lesson) => {
            const subject = subjects.find((s) => s.id === lesson.subjectId);
            const subjectName = subject ? (isArabic ? subject.arabicName : subject.name) : '';

            return (
              <div
                key={lesson.id}
                id={`lesson-card-${lesson.id}`}
                className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  {/* Quick Toggle Completion Checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLessonCompleted(lesson.id);
                    }}
                    title={lesson.isCompleted ? (isArabic ? 'تحديد كغير مكتمل' : (language === 'en' ? 'Mark incomplete' : 'Marquer non terminé')) : (isArabic ? 'تحديد كمكتمل' : (language === 'en' ? 'Mark completed' : 'Marquer terminé'))}
                    className={`mt-1 w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                      lesson.isCompleted
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 text-transparent'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                        {subjectName}
                      </span>
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

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => onNavigate('lesson', { lessonId: lesson.id })}
                    className="py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{isArabic ? 'قراءة الدرس' : (language === 'en' ? 'Read lesson' : 'Lire le cours')}</span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
