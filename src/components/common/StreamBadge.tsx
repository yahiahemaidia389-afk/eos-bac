import React from 'react';
import { StreamType } from '../../types';
import { Check, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface StreamBadgeProps {
  currentStream: StreamType;
  onStreamChange: (stream: StreamType) => void;
  variant?: 'compact' | 'full' | 'selector';
  className?: string;
}

export const StreamBadge: React.FC<StreamBadgeProps> = ({
  currentStream,
  onStreamChange,
  variant = 'compact',
  className = '',
}) => {
  const { t, isRTL } = useLanguage();
  const isSci = currentStream === 'sciences_experimentales';

  if (variant === 'selector') {
    return (
      <div
        className={`inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 ${className}`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <button
          onClick={() => onStreamChange('sciences_experimentales')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            isSci
              ? 'bg-white dark:bg-[#131B2E] text-blue-700 dark:text-blue-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>🔬 {t.common.streamSciShort}</span>
          {isSci && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
        </button>
        <button
          onClick={() => onStreamChange('mathematiques')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            !isSci
              ? 'bg-white dark:bg-[#131B2E] text-purple-700 dark:text-purple-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>📐 {t.common.streamMathShort}</span>
          {!isSci && <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() =>
        onStreamChange(isSci ? 'mathematiques' : 'sciences_experimentales')
      }
      role="button"
      tabIndex={0}
      title={t.dashboard.switchStream}
      className={`group cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${isSci ? 'bg-blue-600' : 'bg-purple-600'}`} />
      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
        {isSci ? t.common.streamSciShort : t.common.streamMathShort}
      </span>
      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {t.dashboard.switchStream}
      </span>
    </div>
  );
};
