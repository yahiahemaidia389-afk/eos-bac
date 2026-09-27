import React from 'react';
import { BookOpen, FolderX, Sparkles, PlusCircle, FileCheck2, FileText } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  arabicTitle?: string;
  description?: string;
  icon?: 'book' | 'folder' | 'sparkles' | 'exercise' | 'document';
  onAdminAction?: () => void;
  adminActionLabel?: string;
  showAdminAction?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle,
  arabicTitle,
  description,
  icon = 'book',
  onAdminAction,
  adminActionLabel,
  showAdminAction = false,
}) => {
  const { t, isRTL, language } = useLanguage();

  const displayTitle =
    title ||
    (language === 'ar' && arabicTitle ? arabicTitle : t.common.emptyContent);

  const displayDescription =
    description ||
    subtitle ||
    (language === 'ar'
      ? 'سيتم إضافة الموارد قريبًا من قِبل المشرفين التربويين.'
      : language === 'en'
      ? 'Content will be published shortly by the academic administration.'
      : 'Le contenu sera bientôt mis en ligne par l’administration pédagogique.');

  return (
    <div
      className="rounded-3xl p-8 sm:p-12 bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 text-center max-w-lg mx-auto my-6 space-y-4 shadow-xs transition-colors"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center mx-auto">
        {icon === 'book' && <BookOpen className="w-7 h-7 text-blue-600 dark:text-blue-400" />}
        {icon === 'folder' && <FolderX className="w-7 h-7 text-slate-500 dark:text-slate-400" />}
        {icon === 'sparkles' && <Sparkles className="w-7 h-7 text-amber-500 dark:text-amber-400" />}
        {icon === 'exercise' && <FileCheck2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />}
        {icon === 'document' && <FileText className="w-7 h-7 text-purple-600 dark:text-purple-400" />}
      </div>

      {/* Main message */}
      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          {displayTitle}
        </h3>
        {arabicTitle && language !== 'ar' && (
          <p className="text-sm font-arabic text-blue-600 dark:text-blue-400">{arabicTitle}</p>
        )}
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed pt-1">
          {displayDescription}
        </p>
      </div>

      {/* Optional action button */}
      {showAdminAction && onAdminAction && (
        <div className="pt-2">
          <button
            onClick={onAdminAction}
            className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{adminActionLabel || (language === 'ar' ? 'إضافة محتوى جديد' : (language === 'en' ? 'Add content' : 'Ajouter du contenu'))}</span>
          </button>
        </div>
      )}
    </div>
  );
};
