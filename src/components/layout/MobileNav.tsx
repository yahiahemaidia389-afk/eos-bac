import React from 'react';
import { ViewType } from '../../types';
import { Home, BookOpen, FileCheck2, BookmarkCheck, User, Sparkles } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface MobileNavProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, onNavigate }) => {
  const { t, isRTL, language } = useLanguage();
  const isArabic = language === 'ar';

  const navTabs: { id: ViewType; label: string; icon: React.ElementType; matchViews?: ViewType[] }[] = [
    {
      id: 'dashboard',
      label: isArabic ? 'الرئيسية' : (language === 'en' ? 'Home' : 'Accueil'),
      icon: Home,
    },
    {
      id: 'subjects',
      label: isArabic ? 'المواد' : (language === 'en' ? 'Subjects' : 'Matières'),
      icon: BookOpen,
      matchViews: ['subjects', 'subject-detail', 'lessons', 'lesson'],
    },
    {
      id: 'exercises',
      label: isArabic ? 'التمارين' : (language === 'en' ? 'Exercises' : 'Exercices'),
      icon: FileCheck2,
      matchViews: ['exercises'],
    },
    {
      id: 'bac-exams',
      label: isArabic ? 'البكالوريا' : (language === 'en' ? 'BAC' : 'BAC'),
      icon: BookmarkCheck,
      matchViews: ['bac-exams'],
    },
    {
      id: 'profile',
      label: isArabic ? 'حسابي' : (language === 'en' ? 'Profile' : 'Profil'),
      icon: User,
      matchViews: ['profile'],
    },
  ];

  return (
    <nav
      id="mobile-bottom-navbar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 px-1 py-1.5 shadow-lg transition-colors pb-safe"
      dir={isRTL ? 'rtl' : 'ltr'}
      aria-label="Navigation mobile"
    >
      <div className="flex items-center justify-around">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            currentView === tab.id ||
            (tab.matchViews && tab.matchViews.includes(currentView));

          return (
            <button
              key={tab.id}
              id={`mobile-nav-${tab.id}`}
              onClick={() => onNavigate(tab.id)}
              className={`min-h-[48px] min-w-[56px] flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer relative ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 scale-105'
                    : 'bg-transparent'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'stroke-[2.5] text-blue-600 dark:text-blue-400' : 'stroke-[1.75]'
                  }`}
                />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 font-medium leading-none truncate max-w-[60px]">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
