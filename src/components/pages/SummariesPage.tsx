import React, { useState } from 'react';
import { ViewType, StreamType, Summary } from '../../types';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { EmptyState } from '../common/EmptyState';
import {
  FileText,
  Search,
  Download,
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileCode,
  ExternalLink,
  Printer,
  Sparkles,
} from 'lucide-react';

interface SummariesPageProps {
  onNavigate: (view: ViewType, payload?: any) => void;
  currentStream: StreamType;
}

export const SummariesPage: React.FC<SummariesPageProps> = ({
  onNavigate,
  currentStream,
}) => {
  const { subjects, summaries } = useContent();
  const { t, isRTL, language } = useLanguage();
  const isArabic = language === 'ar';

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReadingSummary, setActiveReadingSummary] = useState<Summary | null>(null);

  // Filter subjects for current stream
  const activeSubjects = subjects.filter((s) => s.streams.includes(currentStream));
  const streamSubjectIds = new Set(activeSubjects.map((s) => s.id));

  const streamSummaries = summaries.filter(
    (s) => s.published && streamSubjectIds.has(s.subjectId)
  );

  const filteredSummaries = streamSummaries.filter((sum) => {
    if (selectedSubjectId !== 'all' && sum.subjectId !== selectedSubjectId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = sum.title.toLowerCase().includes(q);
      const matchChapter = sum.chapter?.toLowerCase().includes(q) || false;
      const matchContent = sum.content?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchChapter && !matchContent) return false;
    }
    return true;
  });

  const handlePrintOrDownload = (sum: Summary) => {
    if (sum.pdfUrl) {
      const link = document.createElement('a');
      link.href = sum.pdfUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
      return;
    }
    setActiveReadingSummary(sum);
    // Allow reading modal to render and user can trigger print directly
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {isArabic ? 'الملخصات' : (language === 'en' ? 'Summaries' : 'Résumés')}
            </h1>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {isArabic
              ? 'بطاقات مراجعة سريعة تجمع أهم القوانين والمفاهيم لكل مادة.'
              : (language === 'en' ? 'Condensed revision sheets with key formulas and essential points.' : 'Fiches de révision condensées avec formules indispensables et points clés.')}
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 self-start sm:self-center">
          {currentStream === 'sciences_experimentales'
            ? (isArabic ? '🔬 علوم تجريبية' : (language === 'en' ? '🔬 Experimental Sciences' : '🔬 Sciences Exp.'))
            : (isArabic ? '📐 رياضيات' : (language === 'en' ? '📐 Mathematics' : '📐 Maths'))}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="space-y-3 bg-white dark:bg-[#131B2E] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        {/* Search */}
        <div className="relative">
          <Search className={`w-4 h-4 text-slate-400 dark:text-slate-500 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3.5' : 'left-3.5'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isArabic ? 'ابحث في الملخصات والقوانين...' : (language === 'en' ? 'Search for a summary or formula...' : 'Rechercher un résumé ou une formule...')}
            className={`w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all ${
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
                ? 'bg-purple-600 text-white shadow-xs'
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
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {isArabic ? sub.arabicName : sub.name}
            </button>
          ))}
        </div>
      </div>

      {/* Summaries list */}
      {filteredSummaries.length === 0 ? (
        <EmptyState
          title={isArabic ? 'لا توجد ملخصات مطابقة' : (language === 'en' ? 'No summaries found' : 'Aucun résumé trouvé')}
          description={isArabic ? 'جرب البحث باسم قانون أو وحدة أخرى.' : (language === 'en' ? 'Try searching for another subject or formula.' : 'Essaie de rechercher une autre matière ou formule.')}
          icon="document"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSummaries.map((sum) => {
            const subject = subjects.find((s) => s.id === sum.subjectId);
            const subjectName = subject ? (isArabic ? subject.arabicName : subject.name) : '';

            return (
              <div
                key={sum.id}
                id={`summary-card-${sum.id}`}
                className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-purple-300 dark:hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      {subjectName}
                    </span>
                    {sum.chapter && (
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {sum.chapter}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {sum.title}
                  </h3>

                  {/* Highlights / Formulas preview */}
                  {sum.formulas && sum.formulas.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        {isArabic ? 'قوانين رئيسية' : (language === 'en' ? 'Key formulas' : 'Formules clés')}
                      </div>
                      <div className="flex flex-wrap gap-1.5 font-mono text-xs text-purple-700 dark:text-purple-300">
                        {sum.formulas.slice(0, 2).map((f, idx) => (
                          <span key={idx} className="bg-purple-50/80 dark:bg-purple-950/50 px-2 py-0.5 rounded-md border border-purple-100 dark:border-purple-800">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {sum.keyPoints && sum.keyPoints.length > 0 && (
                    <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                      {sum.keyPoints.slice(0, 2).map((kp, idx) => (
                        <li key={idx} className="truncate">{kp}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Bottom Actions: Read online & Download PDF */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveReadingSummary(sum)}
                    className="py-2 px-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'قراءة أونلاين' : (language === 'en' ? 'Read online' : 'Lire en ligne')}</span>
                  </button>

                  <button
                    onClick={() => handlePrintOrDownload(sum)}
                    className="py-2 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    title={isArabic ? 'تحميل أو طباعة الملخص' : (language === 'en' ? 'Download or print summary' : 'Télécharger ou imprimer')}
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>{isArabic ? 'تحميل PDF' : (language === 'en' ? 'PDF' : 'PDF')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reading Modal for Online Reading */}
      {activeReadingSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#131B2E] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  {isArabic ? 'ملخص شامل للمراجعة' : (language === 'en' ? 'Comprehensive revision summary' : 'Fiche de synthèse')}
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {activeReadingSummary.title}
                </h2>
                {activeReadingSummary.chapter && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{activeReadingSummary.chapter}</p>
                )}
              </div>
              <button
                onClick={() => setActiveReadingSummary(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
              {/* Key Formulas */}
              {activeReadingSummary.formulas && activeReadingSummary.formulas.length > 0 && (
                <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 space-y-2">
                  <div className="text-xs font-bold uppercase text-purple-900 dark:text-purple-200 tracking-wider">
                    {isArabic ? 'القوانين والمعادلات الأساسية' : (language === 'en' ? 'Essential Formulas' : 'Formules Essentielles')}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                    {activeReadingSummary.formulas.map((form, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-[#0B1120] border border-purple-100 dark:border-purple-900/60 text-purple-900 dark:text-purple-200 font-semibold">
                        {form}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Points */}
              {activeReadingSummary.keyPoints && activeReadingSummary.keyPoints.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    {isArabic ? 'النقاط التي يجب تذكرها:' : (language === 'en' ? 'Key points to remember:' : 'Points clés à retenir :')}
                  </h4>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-700 dark:text-slate-300">
                    {activeReadingSummary.keyPoints.map((pt, idx) => (
                      <li key={idx}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Full Content */}
              <div className="space-y-2 whitespace-pre-line border-t border-slate-100 dark:border-slate-800 pt-4 text-slate-700 dark:text-slate-300">
                {activeReadingSummary.content}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/70 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isArabic ? 'طباعة أو حفظ PDF' : (language === 'en' ? 'Print or PDF' : 'Imprimer ou PDF')}</span>
              </button>

              <button
                onClick={() => setActiveReadingSummary(null)}
                className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {isArabic ? 'إغلاق' : (language === 'en' ? 'Close' : 'Fermer')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
