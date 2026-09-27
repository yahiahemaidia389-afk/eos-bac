import React, { useState } from 'react';
import { ViewType, StreamType, BacExam } from '../../types';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { EmptyState } from '../common/EmptyState';
import {
  BookmarkCheck,
  Search,
  Download,
  ExternalLink,
  CheckCircle2,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  X,
  Printer,
} from 'lucide-react';

interface BacExamsPageProps {
  onNavigate: (view: ViewType, payload?: any) => void;
  currentStream: StreamType;
}

export const BacExamsPage: React.FC<BacExamsPageProps> = ({
  onNavigate,
  currentStream,
}) => {
  const { bacExams, subjects, role } = useContent();
  const { t, isRTL, language } = useLanguage();
  const isArabic = language === 'ar';

  const [activeStream, setActiveStream] = useState<StreamType>(currentStream);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Collect available years dynamically
  const publishedExams = bacExams.filter((b) => b.published);
  const availableYears = Array.from(new Set(publishedExams.map((e) => e.year))).sort((a, b) => b - a);

  // Available subjects for the active stream
  const activeSubjects = subjects.filter((s) => s.streams.includes(activeStream));

  const filteredExams = publishedExams.filter((exam) => {
    // Stream filter
    if (exam.stream !== activeStream) return false;

    // Year filter
    if (selectedYear !== 'all' && exam.year.toString() !== selectedYear) return false;

    // Subject filter
    if (selectedSubjectId !== 'all' && exam.subjectId !== selectedSubjectId) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const sub = subjects.find((s) => s.id === exam.subjectId);
      const subName = sub ? (sub.name + ' ' + sub.arabicName).toLowerCase() : '';
      const matchTitle = exam.title.toLowerCase().includes(q);
      const matchYear = exam.year.toString().includes(q);
      if (!matchTitle && !subName.includes(q) && !matchYear) return false;
    }

    return true;
  });

  const [previewModal, setPreviewModal] = useState<{
    title: string;
    type: 'subject' | 'solution';
    url?: string;
  } | null>(null);

  const handleOpenPdf = (title: string, type: 'subject' | 'solution', url?: string) => {
    setPreviewModal({ title, type, url });
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {isArabic ? 'مواضيع البكالوريا' : (language === 'en' ? 'BAC Exams' : 'Sujets du BAC')}
            </h1>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {isArabic
              ? 'مواضيع الدورات السابقة مع مواضيع وحلول PDF رسمية وسلم تنقيط معتمد.'
              : (language === 'en' ? 'Official past exams with PDF subjects and solutions complying with ministerial grading scales.' : 'Annales officielles avec sujets et corrigés PDF conformes aux barèmes ministériels.')}
          </p>
        </div>

        {/* Stream Selector Pill */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold self-start sm:self-center">
          <button
            onClick={() => setActiveStream('sciences_experimentales')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeStream === 'sciences_experimentales'
                ? 'bg-white dark:bg-[#131B2E] text-blue-700 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {isArabic ? '🔬 علوم تجريبية' : (language === 'en' ? '🔬 Experimental Sciences' : '🔬 Sciences Exp.')}
          </button>
          <button
            onClick={() => setActiveStream('mathematiques')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeStream === 'mathematiques'
                ? 'bg-white dark:bg-[#131B2E] text-purple-700 dark:text-purple-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {isArabic ? '📐 رياضيات' : (language === 'en' ? '📐 Mathematics' : '📐 Maths')}
          </button>
        </div>
      </div>

      {/* Filter Options (Year, Subject, Search) */}
      <div className="space-y-3 bg-white dark:bg-[#131B2E] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        {/* Search */}
        <div className="relative">
          <Search className={`w-4 h-4 text-slate-400 dark:text-slate-500 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3.5' : 'left-3.5'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isArabic ? 'ابحث عن دورة أو مادة أو موضوع...' : (language === 'en' ? 'Search for a year, subject...' : 'Rechercher une année, une matière...')}
            className={`w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all ${
              isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'
            }`}
          />
        </div>

        {/* Year Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-slate-400 dark:text-slate-500 font-bold shrink-0 px-1">{isArabic ? 'السنة:' : (language === 'en' ? 'Year:' : 'Année :')}</span>
          <button
            onClick={() => setSelectedYear('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 cursor-pointer ${
              selectedYear === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {isArabic ? 'جميع السنوات' : (language === 'en' ? 'All years' : 'Toutes les années')}
          </button>
          {availableYears.map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr.toString())}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 cursor-pointer ${
                selectedYear === yr.toString()
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              BAC {yr}
            </button>
          ))}
        </div>

        {/* Subject Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="text-slate-400 dark:text-slate-500 font-bold shrink-0 px-1">{isArabic ? 'المادة:' : (language === 'en' ? 'Subject:' : 'Matière :')}</span>
          <button
            onClick={() => setSelectedSubjectId('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 cursor-pointer ${
              selectedSubjectId === 'all'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {isArabic ? 'جميع المواد' : (language === 'en' ? 'All subjects' : 'Toutes')}
          </button>
          {activeSubjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubjectId(sub.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 cursor-pointer ${
                selectedSubjectId === sub.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {isArabic ? sub.arabicName : sub.name}
            </button>
          ))}
        </div>
      </div>

      {/* Clear List of BAC Subjects */}
      {filteredExams.length === 0 ? (
        <EmptyState
          title={isArabic ? 'لا توجد مواضيع مطابقة' : (language === 'en' ? 'No exams found' : 'Aucun sujet trouvé')}
          description={isArabic ? 'جرب اختيار سنة أخرى أو تغيير الشعبة.' : (language === 'en' ? 'Try selecting another year or stream.' : 'Essaie de sélectionner une autre année ou une autre filière.')}
          icon="document"
        />
      ) : (
        <div className="space-y-3">
          {filteredExams.map((exam) => {
            const subject = subjects.find((s) => s.id === exam.subjectId);
            const subjectTitle = isArabic && subject ? subject.arabicName : (subject?.name || 'Matière');
            const streamLabel =
              exam.stream === 'sciences_experimentales'
                ? (isArabic ? 'علوم تجريبية' : (language === 'en' ? 'Experimental Sciences' : 'Sciences Exp.'))
                : (isArabic ? 'رياضيات' : (language === 'en' ? 'Mathematics' : 'Mathématiques'));

            return (
              <div
                key={exam.id}
                id={`bac-exam-card-${exam.id}`}
                className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-amber-300 dark:hover:border-amber-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Details (Year, Subject, Stream, Session) */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                      BAC {exam.year}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      {subjectTitle}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {streamLabel}
                    </span>
                    {exam.session && (
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                        • {exam.session}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {exam.title}
                  </h3>
                </div>

                {/* Right: Explicit Subject PDF & Solution PDF buttons */}
                <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                  {/* Subject PDF */}
                  <button
                    onClick={() => handleOpenPdf(exam.title, 'subject', exam.pdfUrl)}
                    className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    title={isArabic ? 'تحميل أو عرض موضوع الامتحان' : (language === 'en' ? 'View official exam' : 'Consulter le sujet officiel')}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'موضوع PDF' : (language === 'en' ? 'Exam PDF' : 'Sujet PDF')}</span>
                  </button>

                  {/* Solution PDF */}
                  <button
                    onClick={() => handleOpenPdf(exam.title, 'solution', exam.correctionUrl)}
                    className="py-2 px-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    title={isArabic ? 'تحميل أو عرض التصحيح النموذجي' : (language === 'en' ? 'View official solution' : 'Consulter le corrigé officiel')}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{isArabic ? 'الحل النموذجي' : (language === 'en' ? 'Solution PDF' : 'Corrigé PDF')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* In-App Document / PDF Preview Modal (Zero window.open, secure & accessible) */}
      {previewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden transition-colors">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                    {previewModal.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {previewModal.type === 'solution'
                      ? isArabic ? 'التصحيح النموذجي وسلم التنقيط المعتمد' : (language === 'en' ? 'Official Model Solution & Grading Scale' : 'Corrigé Type et Barème Officiel')
                      : isArabic ? 'الموضوع الرسمي لشهادة البكالوريا' : (language === 'en' ? 'Official Baccalaureate Exam' : 'Sujet Officiel du Baccalauréat')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              {previewModal.url && previewModal.url.startsWith('http') ? (
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-4/3 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                    <iframe
                      src={previewModal.url}
                      title={previewModal.title}
                      className="w-full h-full"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex justify-end">
                    <a
                      href={previewModal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>{isArabic ? 'تحميل الملف المباشر' : (language === 'en' ? 'Download document' : 'Télécharger le document')}</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{isArabic ? 'المرجع البيداغوجي:' : (language === 'en' ? 'Educational reference:' : 'Référence pédagogique :')}</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-200">BAC ALGÉRIE</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{isArabic ? 'الشعبة المعنية:' : (language === 'en' ? 'Stream:' : 'Filière :')}</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {activeStream === 'sciences_experimentales'
                          ? isArabic ? 'العلوم التجريبية' : (language === 'en' ? 'Experimental Sciences' : 'Sciences Expérimentales')
                          : isArabic ? 'الرياضيات' : (language === 'en' ? 'Mathematics' : 'Mathématiques')}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-amber-50/30 dark:bg-amber-950/20 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-amber-600 dark:text-amber-400 mx-auto" />
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      {isArabic ? 'المستند جاهز للمراجعة والطباعة' : (language === 'en' ? 'Official document ready for study and print' : 'Document officiel prêt à la révision')}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                      {isArabic
                        ? 'يتضمن هذا النموذج الأسئلة الكاملة مع إرشادات سلم التنقيط المعتمد من المفتشية العامة للبيداغوجيا.'
                        : (language === 'en' ? 'Includes complete problem statement and methodological guidelines conforming to official grading scale.' : 'Comprend l’énoncé complet et les consignes méthodologiques conformes au barème officiel de correction.')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => window.print()}
                className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>{isArabic ? 'طباعة' : (language === 'en' ? 'Print' : 'Imprimer')}</span>
              </button>

              <button
                onClick={() => setPreviewModal(null)}
                className="py-2.5 px-5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
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
