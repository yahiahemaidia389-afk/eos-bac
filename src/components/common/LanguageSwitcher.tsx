import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Language } from '../../i18n/types';
import { Globe, Check, ChevronDown } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'segmented' | 'mobile';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'dropdown',
  className = '',
}) => {
  const { language, setLanguage, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: { code: Language; label: string; flag: string; nativeName: string }[] = [
    { code: 'fr', label: 'Français', flag: '🇫🇷', nativeName: 'Français' },
    { code: 'en', label: 'English', flag: '🇬🇧', nativeName: 'English' },
    { code: 'ar', label: 'العربية', flag: '🇩🇿', nativeName: 'العربية' },
  ];

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'segmented') {
    return (
      <div
        id="language-switcher-segmented"
        className={`inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 ${className}`}
      >
        {languages.map((item) => {
          const isActive = language === item.code;
          return (
            <button
              key={item.code}
              id={`lang-btn-${item.code}`}
              type="button"
              onClick={() => setLanguage(item.code)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-[#131B2E] text-blue-700 dark:text-blue-400 shadow-xs border border-slate-200/80 dark:border-slate-600'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{item.flag}</span>
              <span>{item.code === 'ar' ? 'العربية' : item.code.toUpperCase()}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'mobile') {
    return (
      <div id="language-switcher-mobile" className={`grid grid-cols-3 gap-2 ${className}`}>
        {languages.map((item) => {
          const isActive = language === item.code;
          return (
            <button
              key={item.code}
              id={`lang-mobile-btn-${item.code}`}
              type="button"
              onClick={() => setLanguage(item.code)}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300 shadow-xs'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <span className="text-lg">{item.flag}</span>
              <span>{item.nativeName}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Default compact dropdown
  return (
    <div
      ref={dropdownRef}
      id="language-switcher-dropdown"
      className={`relative inline-block text-left ${className}`}
    >
      <button
        id="lang-menu-trigger"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all text-xs font-semibold focus:outline-none cursor-pointer"
        title="Changer de langue / Change language / تغيير اللغة"
      >
        <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
        <span className="text-sm leading-none">{currentLangObj.flag}</span>
        <span className="font-semibold">{currentLangObj.nativeName}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          id="lang-menu-popover"
          className={`absolute ${
            isRTL ? 'left-0' : 'right-0'
          } mt-2 w-40 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-700 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150`}
        >
          <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400 px-2.5 py-1">
            {isRTL ? 'اختر اللغة' : language === 'en' ? 'Select language' : 'Choisir la langue'}
          </div>
          {languages.map((item) => {
            const isActive = language === item.code;
            return (
              <button
                key={item.code}
                id={`lang-select-${item.code}`}
                type="button"
                onClick={() => {
                  setLanguage(item.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{item.flag}</span>
                  <span>{item.nativeName}</span>
                </div>
                {isActive && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
