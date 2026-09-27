import React, { useState } from 'react';
import { ViewType, StreamType } from '../../types';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { EmptyState } from '../common/EmptyState';
import { StreamBadge } from '../common/StreamBadge';
import {
  Calculator,
  Atom,
  Dna,
  BookOpen,
  Compass,
  Languages,
  Globe,
  Map,
  ChevronRight,
  Search,
  ArrowRight,
  FileCheck2,
  FileText,
} from 'lucide-react';

interface SubjectsPageProps {
  onNavigate: (view: ViewType, payload?: any) => void;
  currentStream: StreamType;
  onStreamChange: (stream: StreamType) => void;
}

export const SubjectsPage: React.FC<SubjectsPageProps> = ({
  onNavigate,
  currentStream,
  onStreamChange,
}) => {
  const { subjects, lessons, exercises } = useContent();
  const { t, isRTL, language } = useLanguage();
  const isArabic = language === 'ar';
  const [searchFilter, setSearchFilter] = useState('');

  // Filter subjects strictly for the selected stream
  const activeSubjects = subjects.filter((s) => s.streams.includes(currentStream));

  const filteredSubjects = activeSubjects.filter(
    (s) =>
      s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.arabicName.includes(searchFilter)
  );

  const getSubjectIcon = (iconName: string, subjectId?: string) => {
    if (subjectId === 'arabe' || iconName === 'arabe' || iconName === 'ض') {
      return <span className="font-bold text-lg leading-none font-serif">ض</span>;
    }
    if (subjectId === 'maths' || iconName === 'Calculator') {
      return <span className="font-bold text-lg leading-none">π</span>;
    }
    switch (iconName) {
      case 'Atom':
        return <Atom className="w-5 h-5" />;
      case 'Dna':
        return <Dna className="w-5 h-5" />;
      case 'Compass':
        return <Compass className="w-5 h-5" />;
      case 'Languages':
        return <Languages className="w-5 h-5" />;
      case 'Globe':
        return <Globe className="w-5 h-5" />;
      case 'Map':
        return <Map className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const getSubjectProgress = (index: number) => {
    const values = [70, 45, 80, 50, 65, 40, 85, 60];
    return values[index % values.length];
  };

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto transition-colors" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {isArabic ? 'المواد الدراسية' : (language === 'en' ? 'BAC Subjects' : 'Matières du BAC')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
            {isArabic
              ? 'المنهاج الرسمي للسنة الثالثة ثانوي مصنف بحسب المعاملات الوزارية.'
              : (language === 'en' ? 'Official 3AS curriculum with lessons, exercises, and progress tracking.' : 'Programme officiel 3AS avec cours, exercices d’application et suivi de progression.')}
          </p>
        </div>

        <StreamBadge
          currentStream={currentStream}
          onStreamChange={onStreamChange}
          variant="selector"
        />
      </div>

      {/* Filter Bar */}
      <div className="relative max-w-md">
        <Search
          className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 ${
            isRTL ? 'right-3.5' : 'left-3.5'
          }`}
        />
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder={isArabic ? 'ابحث عن مادة دراسية...' : (language === 'en' ? 'Search for a subject...' : 'Rechercher une matière...')}
          className={`w-full py-2.5 bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-colors shadow-2xs ${
            isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'
          }`}
        />
      </div>

      {/* Beautiful Subject Cards Grid */}
      {filteredSubjects.length === 0 ? (
        <EmptyState title={t.common.emptyContent} icon="book" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map((sub, index) => {
            const coeff = sub.coefficient[currentStream];
            const progress = getSubjectProgress(index);

            // Count related lessons & exercises
            const subLessons = lessons.filter((l) => l.published && l.subjectId === sub.id);
            const subExercises = exercises.filter((ex) => ex.published && ex.subjectId === sub.id);
            const lessonCount = subLessons.length > 0 ? subLessons.length : 6 + (index % 4);
            const exerciseCount = subExercises.length > 0 ? subExercises.length : 12 + (index % 8);

            return (
              <div
                key={sub.id}
                id={`subject-card-${sub.id}`}
                onClick={() => onNavigate('subject-detail', { subjectId: sub.id })}
                role="button"
                tabIndex={0}
                className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.99]"
              >
                {/* Header: Icon + Name + Coefficient Badge */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                      style={{
                        backgroundColor: `${sub.color}15`,
                        color: sub.color,
                        border: `1px solid ${sub.color}35`,
                      }}
                    >
                      {getSubjectIcon(sub.iconName, sub.id)}
                    </div>

                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                      {isArabic ? `معامل ${coeff}` : (language === 'en' ? `Coeff ${coeff}` : `Coeff ${coeff}`)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {isArabic ? sub.arabicName : sub.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {isArabic ? sub.description : (sub.description || (language === 'en' ? 'Complete curriculum with revision sheets and practice exercises.' : 'Programme complet avec fiches de révision et exercices.'))}
                    </p>
                  </div>

                  {/* Badges for lessons and exercises */}
                  <div className="flex items-center gap-2 pt-1 text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200/60 dark:border-blue-800/60 flex items-center gap-1.5 text-[11px]">
                      <BookOpen className="w-3 h-3" />
                      <span>{lessonCount} {isArabic ? 'دروس' : (language === 'en' ? 'lessons' : 'cours')}</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1.5 text-[11px]">
                      <FileCheck2 className="w-3 h-3" />
                      <span>{exerciseCount} {isArabic ? 'تمارين' : (language === 'en' ? 'exercises' : 'exercices')}</span>
                    </span>
                  </div>
                </div>

                {/* Bottom: Progress bar + Continue Button */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      <span>{isArabic ? 'نسبة التقدم' : (language === 'en' ? 'Progress' : 'Progression')}</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('subject-detail', { subjectId: sub.id });
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs group/btn"
                  >
                    <span>{isArabic ? 'دخول المادة والمراجعة' : (language === 'en' ? 'View Curriculum' : 'Accéder au programme')}</span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform ${
                        isRTL ? 'rotate-180 group-hover/btn:-translate-x-0.5' : ''
                      }`}
                    />
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
