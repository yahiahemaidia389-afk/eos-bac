import React from 'react';
import { ViewType, StreamType, UserProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { BrandLogo } from '../common/BrandLogo';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  FileText,
  BookmarkCheck,
  HelpCircle,
  Calendar,
  Sparkles,
  User,
  Settings,
  ChevronRight,
  Shield,
  Layers,
  Flame,
  GraduationCap,
  Users,
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType, payload?: any) => void;
  currentStream: StreamType;
  onStreamChange: (stream: StreamType) => void;
  profile: UserProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  currentStream,
  onStreamChange,
  profile,
}) => {
  const { currentUser, isAdmin, users } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const isArabic = language === 'ar';
  const isSci = currentStream === 'sciences_experimentales';

  // Primary study navigation items
  const mainNavItems = [
    {
      id: 'dashboard' as ViewType,
      label: isArabic ? 'لوحة التحكم' : (language === 'en' ? 'Dashboard' : 'Tableau de bord'),
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'subjects' as ViewType,
      label: isArabic ? 'المواد الدراسية' : (language === 'en' ? 'Subjects' : 'Matières'),
      icon: BookOpen,
      matchViews: ['subjects', 'subject-detail', 'lessons', 'lesson'],
      badge: null,
    },
    {
      id: 'exercises' as ViewType,
      label: isArabic ? 'بنك التمارين' : (language === 'en' ? 'Exercises' : 'Exercices'),
      icon: FileCheck2,
      matchViews: ['exercises'],
      badge: isArabic ? 'محلولة' : (language === 'en' ? 'Solved' : 'Corrigés'),
    },
    {
      id: 'summaries' as ViewType,
      label: isArabic ? 'الملخصات المركزة' : (language === 'en' ? 'Lesson Summaries' : 'Résumés de cours'),
      icon: FileText,
      matchViews: ['summaries'],
      badge: null,
    },
    {
      id: 'bac-exams' as ViewType,
      label: isArabic ? 'حوليات البكالوريا' : (language === 'en' ? 'BAC Exams' : 'Annales BAC'),
      icon: BookmarkCheck,
      matchViews: ['bac-exams'],
      badge: 'PDF',
    },
  ];

  // Secondary tools & interactive practice
  const toolNavItems = [
    {
      id: 'quiz' as ViewType,
      label: isArabic ? 'الاختبارات التفاعلية' : (language === 'en' ? 'Quizzes & Tests' : 'Quiz & Évaluations'),
      icon: HelpCircle,
      matchViews: ['quiz'],
      badge: null,
    },
    {
      id: 'planner' as ViewType,
      label: isArabic ? 'مخطط المراجعة' : (language === 'en' ? 'Study Plan' : 'Planning d’étude'),
      icon: Calendar,
      matchViews: ['planner'],
      badge: null,
    },
    {
      id: 'ai-assistant' as ViewType,
      label: isArabic ? 'المساعد الذكي' : (language === 'en' ? 'BAC AI Assistant' : 'Assistant IA BAC'),
      icon: Sparkles,
      matchViews: ['ai-assistant'],
      highlight: true,
      badge: isArabic ? 'قريبًا' : (language === 'en' ? 'Soon' : 'Bientôt'),
    },
  ];

  const realName =
    currentUser?.full_name ||
    profile.name ||
    (isArabic ? 'تلميذ البكالوريا' : (language === 'en' ? 'BAC Student' : 'Étudiant BAC'));

  const avatarUrl =
    currentUser?.avatar_url ||
    profile.avatar ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
      currentUser?.full_name || 'student'
    )}`;

  return (
    <aside
      id="desktop-app-sidebar"
      className="w-[260px] h-full flex flex-col justify-between p-4 bg-white dark:bg-[#111827] border-e border-slate-200/80 dark:border-slate-800/90 select-none transition-colors"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Top Section */}
      <div className="space-y-5 overflow-y-auto scrollbar-none pr-1">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('dashboard')}
          className="cursor-pointer group px-2 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          role="button"
          tabIndex={0}
        >
          <BrandLogo size="md" showTagline={true} />
        </div>

        {/* Stream Selector Card */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between transition-colors shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center text-sm shrink-0">
              {isSci ? '🔬' : '📐'}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                {isArabic ? 'الشعبة الحالية' : (language === 'en' ? 'Current stream' : 'Filière actuelle')}
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {isSci
                  ? (isArabic ? 'علوم تجريبية' : (language === 'en' ? 'Experimental Sciences' : 'Sciences Exp.'))
                  : (isArabic ? 'رياضيات' : (language === 'en' ? 'Mathematics' : 'Mathématiques'))}
              </div>
            </div>
          </div>
          <button
            onClick={() =>
              onStreamChange(isSci ? 'mathematiques' : 'sciences_experimentales')
            }
            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline shrink-0 cursor-pointer px-1.5 py-0.5"
            title={isArabic ? 'تبديل الشعبة' : (language === 'en' ? 'Change stream' : 'Changer de filière')}
          >
            {isArabic ? 'تبديل' : (language === 'en' ? 'Change' : 'Changer')}
          </button>
        </div>

        {/* Main Navigation Group */}
        <div className="space-y-1">
          <div className="px-3 pb-1 text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
            {isArabic ? 'التعلم والمراجعة' : (language === 'en' ? 'Learning & Revision' : 'Apprentissage')}
          </div>
          <nav className="space-y-1" aria-label="Menu principal">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentView === item.id ||
                (item.matchViews && item.matchViews.includes(currentView));

              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200/70 dark:border-blue-800/60 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Secondary Tools Group */}
        <div className="space-y-1 pt-1">
          <div className="px-3 pb-1 text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
            {isArabic ? 'الأدوات التفاعلية' : (language === 'en' ? 'Tools & Practice' : 'Outils & Pratique')}
          </div>
          <nav className="space-y-1" aria-label="Outils">
            {toolNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentView === item.id ||
                (item.matchViews && item.matchViews.includes(currentView));

              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200/70 dark:border-blue-800/60 shadow-2xs'
                      : item.highlight
                      ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 border border-transparent'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : item.highlight
                          ? 'text-indigo-500'
                          : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded font-mono ${
                        item.highlight
                          ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                          : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Admin section if user is administrator */}
            {isAdmin && (
              <div className="pt-2 space-y-1">
                <div className="px-3 pb-1 text-[10px] font-bold tracking-wider uppercase text-amber-700 dark:text-amber-400 flex items-center justify-between">
                  <span>{isArabic ? 'إدارة المنصة' : (language === 'en' ? 'Administration' : 'Administration')}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-extrabold font-mono">
                    ADMIN
                  </span>
                </div>

                {/* CMS Contenu */}
                <button
                  id="sidebar-admin-link"
                  onClick={() => onNavigate('admin', { tab: 'lessons' })}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                    currentView === 'admin'
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-bold border border-amber-200/80 dark:border-amber-800/60 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="truncate">
                      {isArabic ? 'إدارة المحتوى (CMS)' : (language === 'en' ? 'Educational Content' : 'Contenu Pédagogique')}
                    </span>
                  </div>
                </button>

                {/* Users Management */}
                <button
                  id="sidebar-admin-users-link"
                  onClick={() => onNavigate('admin-users')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                    currentView === 'admin-users'
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-bold border border-amber-200/80 dark:border-amber-800/60 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Users className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="truncate">
                      {isArabic ? 'المستخدمون' : (language === 'en' ? 'Users' : 'Utilisateurs')}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100/80 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-mono">
                    {users.length}
                  </span>
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Bottom Section: Motivation Snippet + User Profile Card */}
      <div className="space-y-3 pt-3 border-t border-slate-200/70 dark:border-slate-800/80">
        {/* Quick Motivation Card */}
        <div
          onClick={() => onNavigate('planner')}
          role="button"
          tabIndex={0}
          className="p-3 rounded-xl bg-blue-50/60 dark:bg-slate-900/80 hover:bg-blue-50 dark:hover:bg-slate-800/90 border border-blue-100 dark:border-slate-800 cursor-pointer transition-all flex items-center justify-between text-blue-900 dark:text-blue-200 group shadow-2xs"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Flame className="w-3.5 h-3.5 fill-blue-500/20" />
            </div>
            <span className="text-[11px] font-bold truncate">
              {isArabic ? 'ثابر، البكالوريا بين يديك !' : (language === 'en' ? 'Aim for honors!' : 'Cap sur la mention !')}
            </span>
          </div>
          <ChevronRight
            className={`w-3.5 h-3.5 text-blue-400 group-hover:text-blue-600 transition-transform ${
              isRTL ? 'rotate-180 group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'
            }`}
          />
        </div>

        {/* User Compact Card */}
        <div
          onClick={() => onNavigate('profile')}
          role="button"
          tabIndex={0}
          className="p-2 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/70 border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700/80 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={avatarUrl}
              alt={realName}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0"
            />
            <div className="min-w-0 text-start">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {realName}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate">
                {isAdmin ? (isArabic ? 'مشرف المنصة' : (language === 'en' ? 'Admin' : 'Admin')) : (isArabic ? 'تلميذ 3 ثانوي' : (language === 'en' ? '3AS Student' : 'Élève 3AS'))}
              </div>
            </div>
          </div>
          <Settings className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors shrink-0" />
        </div>
      </div>
    </aside>
  );
};
