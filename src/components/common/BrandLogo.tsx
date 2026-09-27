import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  lightMode?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
}) => {
  const { t } = useLanguage();

  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  }[size];

  const svgDimensions = {
    sm: 'w-4 h-4',
    md: 'w-4.5 h-4.5',
    lg: 'w-5.5 h-5.5',
  }[size];

  const textDimensions = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Refined modern emblem: Graduation cap + Forward movement */}
      <div
        className={`${iconDimensions} rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/25 shrink-0`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={svgDimensions}
        >
          {/* Top layer */}
          <path
            d="M16 4L28 10L16 16L4 10L16 4Z"
            fill="currentColor"
            fillOpacity="0.95"
          />
          {/* Middle layer */}
          <path
            d="M28 15L16 21L4 15M28 20L16 26L4 20"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-extrabold tracking-tight text-slate-900 dark:text-white ${textDimensions}`}>
            EOS <span className="text-blue-600 dark:text-blue-400">BAC</span>
          </span>
          <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/80 px-1.5 py-0.5 rounded-full font-mono">
            DZ
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-tight mt-1">
            {t.common.tagline}
          </span>
        )}
      </div>
    </div>
  );
};
