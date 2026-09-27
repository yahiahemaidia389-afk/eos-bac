import React, { useState } from 'react';
import { ViewType, StreamType, Exercise } from '../../types';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { EmptyState } from '../common/EmptyState';
import {
  FileCheck2,
  Search,
  CheckCircle2,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Sparkles,
  HelpCircle,
  Eye,
} from 'lucide-react';

interface ExercisesPageProps {
  onNavigate: (view: ViewType, payload?: any) => void;
  currentStream: StreamType;
}

export const ExercisesPage: React.FC<ExercisesPageProps> = ({
  onNavigate,
  currentStream,
}) => {
  const { subjects, exercises, toggleExerciseCompleted } = useContent();
  const { t, isRTL, language } = useLanguage();
  const isArabic = language === 'ar';

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [solutionFilter, setSolutionFilter] = useState<'all' | 'with_solution'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

  // Active subjects for current stream
  const activeSubjects = subjects.filter((s) => s.streams.includes(currentStream));
  const streamSubjectIds = new Set(activeSubjects.map((s) => s.id));

  const streamExercises = exercises.filter(
    (ex) => ex.published && streamSubjectIds.has(ex.subjectId)
  );

  const filteredExercises = streamExercises.filter((ex) => {
    if (selectedSubjectId !== 'all' && ex.subjectId !== selectedSubjectId) return false;
    if (difficultyFilter !== 'all' && ex.difficulty !== difficultyFilter) return false;
    if (solutionFilter === 'with_solution' && !ex.hasSolution) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = ex.title.toLowerCase().includes(q);
      const matchDesc = ex.description?.toLowerCase().includes(q) || false;
      const matchChapter = ex.chapter?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchDesc && !matchChapter) return false;
    }
    return true;
  });

  const getDifficultyBadge = (diff?: string) => {
    const d = diff?.toLowerCase();
    if (d === 'easy' || d === 'facile') {
      return (
        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          {isArabic ? 'سهل' : (language === 'en' ? 'Easy' : 'Facile')}
        </span>
      );
    }
    if (d === 'hard' || d === 'difficile') {
      return (
        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          {isArabic ? 'صعب' : (language === 'en' ? 'Hard' : 'Difficile')}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
        {isArabic ? 'متوسط' : (language === 'en' ? 'Medium' : 'Moyen')}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {isArabic ? 'التمارين' : (language === 'en' ? 'Exercises' : 'Exercices')}
            </h1>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {isArabic
              ? 'تمارين تطبيقية متدرجة الصعوبة مع حلول نموذجية للمراجعة الفعالة.'
              : (language === 'en' ? 'Practice exercises ranked by difficulty with detailed model solutions.' : 'Exercices d’application classés par difficulté avec corrigés détaillés.')}
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 self-start sm:self-center">
          {currentStream === 'sciences_experimentales'
            ? (isArabic ? '🔬 علوم تجريبية' : (language === 'en' ? '🔬 Experimental Sciences' : '🔬 Sciences Exp.'))
            : (isArabic ? '📐 رياضيات' : (language === 'en' ? '📐 Mathematics' : '📐 Maths'))}
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3 bg-white dark:bg-[#131B2E] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        {/* Search */}
        <div className="relative">
          <Search className={`w-4 h-4 text-slate-400 dark:text-slate-500 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3.5' : 'left-3.5'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isArabic ? 'ابحث في التمارين والمفاهيم...' : (language === 'en' ? 'Search for an exercise...' : 'Rechercher un exercice...')}
            className={`w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
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
                ? 'bg-emerald-600 text-white shadow-xs'
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
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {isArabic ? sub.arabicName : sub.name}
            </button>
          ))}
        </div>

        {/* Difficulty & Solution toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 dark:text-slate-500 font-medium">{isArabic ? 'الصعوبة:' : (language === 'en' ? 'Difficulty:' : 'Difficulté :')}</span>
            {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  difficultyFilter === diff
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {diff === 'all'
                  ? (isArabic ? 'الكل' : (language === 'en' ? 'All' : 'Tous'))
                  : diff === 'easy'
                  ? (isArabic ? 'سهل' : (language === 'en' ? 'Easy' : 'Facile'))
                  : diff === 'medium'
                  ? (isArabic ? 'متوسط' : (language === 'en' ? 'Medium' : 'Moyen'))
                  : (isArabic ? 'صعب' : (language === 'en' ? 'Hard' : 'Difficile'))}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSolutionFilter((prev) => (prev === 'all' ? 'with_solution' : 'all'))}
              className={`px-3 py-1 rounded-lg font-semibold border transition-all cursor-pointer ${
                solutionFilter === 'with_solution'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {isArabic ? 'مع الحل فقط' : (language === 'en' ? 'With solution only' : 'Avec corrigé uniquement')}
            </button>
          </div>
        </div>
      </div>

      {/* Exercises list */}
      {filteredExercises.length === 0 ? (
        <EmptyState
          title={isArabic ? 'لا توجد تمارين مطابقة' : (language === 'en' ? 'No exercises found' : 'Aucun exercice trouvé')}
          description={isArabic ? 'جرب ضبط معايير الفلترة أو اختيار مادة أخرى.' : (language === 'en' ? 'Adjust your filters to find exercises.' : 'Modifie tes critères de recherche pour trouver des exercices.')}
          icon="exercise"
        />
      ) : (
        <div className="space-y-3">
          {filteredExercises.map((ex) => {
            const subject = subjects.find((s) => s.id === ex.subjectId);
            const subjectName = subject ? (isArabic ? subject.arabicName : subject.name) : '';
            const isExpanded = expandedExerciseId === ex.id;

            return (
              <div
                key={ex.id}
                id={`exercise-card-${ex.id}`}
                className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-500/40 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Toggle Completed button */}
                    <button
                      onClick={() => toggleExerciseCompleted(ex.id)}
                      title={ex.isCompleted ? (isArabic ? 'تحديد كغير محلول' : (language === 'en' ? 'Mark unresolved' : 'Marquer non résolu')) : (isArabic ? 'تحديد كمحلول' : (language === 'en' ? 'Mark resolved' : 'Marquer résolu'))}
                      className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                        ex.isCompleted
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 text-transparent'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {subjectName}
                        </span>
                        {getDifficultyBadge(ex.difficulty)}
                        {ex.hasSolution ? (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {isArabic ? 'مرفق بالحل' : (language === 'en' ? 'With solution' : 'Avec corrigé')}
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            {isArabic ? 'بدون حل' : (language === 'en' ? 'Without solution' : 'Sans corrigé')}
                          </span>
                        )}
                        {ex.isCompleted && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{isArabic ? 'تم الحل' : (language === 'en' ? 'Resolved' : 'Résolu')}</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {ex.title}
                      </h3>

                      {ex.chapter && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {ex.chapter}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => setExpandedExerciseId(isExpanded ? null : ex.id)}
                      className={`py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isExpanded
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{isExpanded ? (isArabic ? 'إخفاء التمرين' : (language === 'en' ? 'Hide' : 'Masquer')) : (isArabic ? 'عرض التمرين والحل' : (language === 'en' ? 'View exercise and solution' : 'Voir l’exercice'))}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded exercise details & Solution */}
                {isExpanded && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in duration-200">
                    {/* Problem statement */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                        {isArabic ? 'نص التمرين' : (language === 'en' ? 'Exercise problem statement' : 'Énoncé de l’exercice')}
                      </div>
                      <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-mono sm:font-sans">
                        {ex.description || (isArabic ? 'نص التمرين النموذجي المقترح في هذا الفصل.' : (language === 'en' ? 'Detailed problem statement for this chapter.' : 'Énoncé détaillé du problème.'))}
                      </div>
                    </div>

                    {/* Solution block if available */}
                    {ex.hasSolution && ex.solution && (
                      <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                        <div className="text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300 tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{isArabic ? 'الحل النموذجي والتنقيط' : (language === 'en' ? 'Model Solution & Scale' : 'Corrigé type & Barème')}</span>
                        </div>
                        <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-mono sm:font-sans">
                          {ex.solution}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
