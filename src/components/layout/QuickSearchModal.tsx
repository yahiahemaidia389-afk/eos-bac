import React, { useState, useEffect, useRef } from 'react';
import { ViewType, StreamType } from '../../types';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  Search,
  X,
  BookOpen,
  FileCheck2,
  HelpCircle,
  CalendarDays,
  Sparkles,
  ArrowRight,
  Calculator,
  Atom,
  Dna,
  LayoutDashboard,
} from 'lucide-react';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ViewType, payload?: any) => void;
  currentStream: StreamType;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  currentStream,
}) => {
  const { subjects, chapters, bacExams } = useContent();
  const { language, isRTL, t, getLocalizedText } = useLanguage();
  const isArabic = language === 'ar';
  const isEn = language === 'en';
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const normalizedQuery = query.toLowerCase().trim();

  const quickNavigations: { title: string; view: ViewType; icon: React.ElementType }[] = [
    { title: t.nav.dashboard, view: 'dashboard', icon: LayoutDashboard },
    { title: t.nav.subjects, view: 'subjects', icon: BookOpen },
    { title: t.nav.bac, view: 'bac-exams', icon: FileCheck2 },
    { title: t.nav.quiz, view: 'quiz', icon: HelpCircle },
    { title: t.nav.planner, view: 'planner', icon: CalendarDays },
    { title: t.nav.ai, view: 'ai-assistant', icon: Sparkles },
    { title: isArabic ? 'إدارة المنصة (CMS)' : (isEn ? 'Admin Panel (CMS)' : 'Espace Admin (Gestion)'), view: 'admin', icon: BookOpen },
  ];

  const filteredSubjects = subjects
    .filter((s) => s.streams.includes(currentStream))
    .filter((s) =>
      s.name.toLowerCase().includes(normalizedQuery) ||
      s.arabicName.includes(normalizedQuery)
    );

  const filteredExams = bacExams.filter((e) =>
    e.title.toLowerCase().includes(normalizedQuery) ||
    e.year.toString().includes(normalizedQuery)
  );

  const filteredChapters = chapters.filter((c) =>
    c.title.toLowerCase().includes(normalizedQuery) ||
    c.number.includes(normalizedQuery)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-150" dir={isRTL ? 'rtl' : 'ltr'}>
      <div
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-slate-200 dark:border-slate-800 px-4 py-3 bg-slate-50 dark:bg-[#0B0F19]">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400 me-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isArabic ? 'بحث عن مادة، وحدة، موضوع بكالوريا...' : (isEn ? 'Search for a subject, chapter, BAC past exam...' : 'Rechercher une matière, un chapitre, un sujet BAC...')}
            className="w-full bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-0"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="ms-2 px-2 py-1 text-xs rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            {isArabic ? 'خروج' : (isEn ? 'Esc' : 'Échap')}
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 text-xs">
          {/* Quick Navigations */}
          {query.trim() === '' && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 mb-2">
                {isArabic ? 'اختصارات سريعة' : (isEn ? 'Quick Shortcuts' : 'Raccourcis rapides')}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {quickNavigations.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.view}
                      onClick={() => {
                        onNavigate(item.view);
                        onClose();
                      }}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700/50 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white flex items-center gap-2.5 transition-all text-start cursor-pointer"
                    >
                      <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span className="truncate font-medium">{item.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Subjects results */}
          {filteredSubjects.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 mb-1.5">
                {isArabic ? 'المواد الدراسية' : (isEn ? 'Subjects' : 'Matières')} ({currentStream === 'sciences_experimentales' ? (isArabic ? 'علوم تجريبية' : (isEn ? 'Exp. Sci.' : 'Sciences Exp.')) : (isArabic ? 'رياضيات' : (isEn ? 'Math' : 'Maths'))})
              </div>
              <div className="space-y-1">
                {filteredSubjects.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      onNavigate('subject-detail', { subjectId: sub.id });
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-start transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: `${sub.color}20`, color: sub.color }}
                      >
                        {isArabic ? sub.arabicName.slice(0, 2) : sub.name.slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {isArabic ? sub.arabicName : getLocalizedText(sub.name)}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {isArabic ? `معامل : ${sub.coefficient[currentStream]}` : `Coeff : ${sub.coefficient[currentStream]}`} • {isArabic ? sub.name : sub.arabicName}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      <span>{isArabic ? 'فتح' : (isEn ? 'Open' : 'Ouvrir')}</span>
                      <ArrowRight className={`w-3 h-3 ${isRTL ? 'rotate-180' : ''}`} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chapters */}
          {filteredChapters.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 mb-1.5">
                {isArabic ? 'الوحدات والدروس' : (isEn ? 'Chapters' : 'Chapitres')}
              </div>
              <div className="space-y-1">
                {filteredChapters.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => {
                      onNavigate('subject-detail', { subjectId: ch.subjectId });
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-start transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40">
                        {ch.number}
                      </span>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
                        {ch.title}
                      </span>
                    </div>
                    <ArrowRight className={`w-3.5 h-3.5 text-slate-400 ${isRTL ? 'rotate-180' : ''}`} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* BAC Exams results */}
          {filteredExams.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 mb-1.5">
                {isArabic ? 'حوليات ومواضيع البكالوريا' : (isEn ? 'BAC Past Exams' : 'Annales & Sujets BAC')}
              </div>
              <div className="space-y-1">
                {filteredExams.map((exam) => (
                  <button
                    key={exam.id}
                    onClick={() => {
                      onNavigate('bac-exams');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-start transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileCheck2 className="w-4 h-4 text-emerald-500" />
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
                        {exam.title} ({exam.year})
                      </div>
                    </div>
                    <span className="text-xs text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                      {isArabic ? 'عرض ←' : (isEn ? 'View →' : 'Consulter →')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.trim() !== '' &&
            filteredSubjects.length === 0 &&
            filteredChapters.length === 0 &&
            filteredExams.length === 0 && (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                <p>{isArabic ? `لم يتم العثور على أي نتائج لـ "${query}".` : (isEn ? `No results found for "${query}".` : `Aucun résultat trouvé pour "${query}".`)}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {isArabic ? 'جرب البحث باسم مادة أو مصطلح آخر (مثل: الرياضيات، بكالوريا 2025...)' : (isEn ? 'Try another keyword (e.g., Mathematics, BAC 2025, Derivatives...)' : 'Essaie un autre terme (ex: Mathématiques, BAC 2025, Dérivées...)')}
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

