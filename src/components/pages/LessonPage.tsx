import React from 'react';
import { ViewType, StreamType } from '../../types';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { EmptyState } from '../common/EmptyState';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  FileText,
  Video,
  Download,
  ExternalLink,
  CheckCircle2,
  Clock,
  Check,
  Share2,
} from 'lucide-react';

interface LessonPageProps {
  onNavigate: (view: ViewType, payload?: any) => void;
  currentStream: StreamType;
  lessonId?: string;
}

export const LessonPage: React.FC<LessonPageProps> = ({
  onNavigate,
  currentStream,
  lessonId,
}) => {
  const { lessons, subjects, role, toggleLessonCompleted } = useContent();
  const { t, isRTL, language } = useLanguage();
  const isArabic = language === 'ar';

  const publishedLessons = lessons.filter((l) => l.published);
  const currentLesson = lessonId
    ? publishedLessons.find((l) => l.id === lessonId) || publishedLessons[0]
    : publishedLessons[0];

  const currentSubject = currentLesson
    ? subjects.find((s) => s.id === currentLesson.subjectId)
    : null;

  if (!currentLesson) {
    return (
      <div className="space-y-6 pb-16 max-w-4xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <button
          onClick={() => onNavigate('lessons')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          <span>{isArabic ? 'العودة إلى الدروس' : (language === 'en' ? 'Back to lessons' : 'Retour aux cours')}</span>
        </button>

        <EmptyState
          title={isArabic ? 'لا توجد دروس متوفرة حالياً' : (language === 'en' ? 'No lessons available currently' : 'Aucun cours disponible pour le moment')}
          description={isArabic ? 'سيتم نشر الدروس قريباً.' : (language === 'en' ? 'Lessons will be published soon.' : 'Les cours seront publiés prochainement.')}
          icon="book"
          showAdminAction={role === 'admin'}
          onAdminAction={() => onNavigate('admin')}
          adminActionLabel="Ajouter un cours (Admin)"
        />
      </div>
    );
  }

  const subjectName = currentSubject ? (isArabic ? currentSubject.arabicName : currentSubject.name) : '';

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top breadcrumb & navigation bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('lessons')}
            className="p-2 rounded-xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            title={isArabic ? 'رجوع' : (language === 'en' ? 'Back' : 'Retour')}
          >
            <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-blue-600 dark:text-blue-400">{subjectName}</span>
              {currentLesson.chapter && (
                <>
                  <span>•</span>
                  <span>{currentLesson.chapter}</span>
                </>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {currentLesson.title}
            </h1>
          </div>
        </div>

        {/* Completion button */}
        <button
          onClick={() => toggleLessonCompleted(currentLesson.id)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all self-start sm:self-auto shadow-xs cursor-pointer ${
            currentLesson.isCompleted
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold'
              : 'bg-white dark:bg-[#131B2E] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <CheckCircle2 className={`w-4 h-4 ${currentLesson.isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
          <span>
            {currentLesson.isCompleted
              ? (isArabic ? 'مكتمل بنجاح' : (language === 'en' ? 'Completed lesson' : 'Cours terminé'))
              : (isArabic ? 'تحديد كمكتمل' : (language === 'en' ? 'Mark as completed' : 'Marquer comme terminé'))}
          </span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* Video player if videoUrl is present */}
          {currentLesson.videoUrl && (
            <div className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 aspect-video flex items-center justify-center relative shadow-md">
              <iframe
                src={currentLesson.videoUrl}
                title={currentLesson.title}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          )}

          {/* Lesson Content Card */}
          <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  {isArabic ? 'محتوى الدرس' : (language === 'en' ? 'Lesson content' : 'Contenu du cours')}
                </h2>
              </div>
              {currentLesson.estimatedMinutes && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{currentLesson.estimatedMinutes} {isArabic ? 'دقيقة' : (language === 'en' ? 'min' : 'min')}</span>
                </div>
              )}
            </div>

            {currentLesson.description && (
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {currentLesson.description}
              </p>
            )}

            {currentLesson.contentText && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-mono whitespace-pre-wrap leading-relaxed mt-4">
                {currentLesson.contentText}
              </div>
            )}

            {currentLesson.content && (
              <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line pt-2">
                {currentLesson.content}
              </div>
            )}
          </div>
        </div>

        {/* Resources & Next Step Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-3xl p-6 bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{isArabic ? 'ملفات ومستندات' : (language === 'en' ? 'Associated documents' : 'Documents associés')}</span>
            </h3>

            {currentLesson.pdfUrl ? (
              <a
                href={currentLesson.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-semibold flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>{isArabic ? 'تحميل الدرس (PDF)' : (language === 'en' ? 'Lesson Notes (PDF)' : 'Support de cours (PDF)')}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <div className="p-4 text-center rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-xs">
                {isArabic ? 'لا توجد ملفات مرفقة إضافية.' : (language === 'en' ? 'No attached documents.' : 'Aucun document attaché.')}
              </div>
            )}
          </div>

          {/* Quick link to practice */}
          <div className="rounded-3xl p-6 bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
            <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
              {isArabic ? 'تطبيق عملي' : (language === 'en' ? 'Practice' : 'Entraînement')}
            </h4>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
              {isArabic
                ? 'طبق ما تعلمته الآن بحل تمارين تطبيقية متدرجة في هذا الفصل.'
                : (language === 'en' ? 'Consolidate your learning by practicing exercises on this chapter.' : 'Consolide tes acquis en faisant des exercices sur ce chapitre.')}
            </p>
            <button
              onClick={() => onNavigate('exercises')}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>{isArabic ? 'الذهاب إلى التمارين' : (language === 'en' ? 'Go to exercises' : 'Voir les exercices')}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
