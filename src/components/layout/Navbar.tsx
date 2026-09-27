import React, { useState, useRef, useEffect } from 'react';
import { ViewType, StreamType, UserProfile } from '../../types';
import { BrandLogo } from '../common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Language } from '../../i18n/types';
import {
  Search,
  Moon,
  Sun,
  Bell,
  ChevronDown,
  User as UserIcon,
  LogOut,
  Shield,
  Layers,
  Sparkles,
  Check,
  Globe,
  LogIn,
  Users,
} from 'lucide-react';

interface NavbarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType, payload?: any) => void;
  currentStream: StreamType;
  onStreamChange: (stream: StreamType) => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onOpenSearch: () => void;
  profile?: UserProfile;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  currentStream,
  onStreamChange,
  onOpenAuth,
  onOpenSearch,
  profile,
}) => {
  const { currentUser, isAdmin, logout } = useAuth();
  const { language, setLanguage, isRTL, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const isArabic = language === 'ar';

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);
  const [showNotificationsToast, setShowNotificationsToast] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const realName =
    currentUser?.full_name ||
    profile?.name ||
    (isArabic ? 'تلميذ البكالوريا' : (language === 'en' ? 'Student' : 'Étudiant'));

  const avatarUrl =
    currentUser?.avatar_url ||
    profile?.avatar ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
      currentUser?.full_name || 'student'
    )}`;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages: { code: Language; label: string; flag: string; nativeName: string }[] = [
    { code: 'ar', label: 'العربية', flag: '🇩🇿', nativeName: 'العربية' },
    { code: 'fr', label: 'Français', flag: '🇫🇷', nativeName: 'Français' },
    { code: 'en', label: 'English', flag: '🇬🇧', nativeName: 'English' },
  ];

  return (
    <header
      className="sticky top-0 z-20 h-16 w-full bg-white/95 dark:bg-[#131B2E]/95 backdrop-blur-md border-b border-[#E2E8F0] dark:border-slate-800/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 transition-colors"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Left side: Mobile Brand Logo + Large Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        {/* Mobile-only Logo */}
        <div className="md:hidden shrink-0">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center focus:outline-none"
            aria-label="EOS BAC"
          >
            <BrandLogo size="sm" showTagline={false} />
          </button>
        </div>

        {/* Large Search Bar */}
        <div
          onClick={onOpenSearch}
          role="button"
          tabIndex={0}
          className="relative w-full max-w-md flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#F1F5F9] dark:bg-[#1A243B] hover:bg-[#E8EFF6] dark:hover:bg-[#202D4A] border border-slate-200/70 dark:border-slate-700/80 cursor-pointer transition-all text-slate-500 dark:text-slate-300 group shadow-2xs"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shrink-0" />
          <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 select-none">
            {isArabic ? 'بحث عن درس، تمرين، موضوع بكالوريا...' : (language === 'en' ? 'Search for a lesson, exercise, BAC past exam...' : 'Rechercher un cours, exercice, sujet du BAC...')}
          </span>
          <span className="hidden sm:inline-block ms-auto text-[10px] font-bold text-slate-400 dark:text-slate-400 bg-white dark:bg-[#131B2E] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            ⌘K
          </span>
        </div>
      </div>

      {/* Right side: Language Selector + Theme Toggle + Notifications + User Avatar */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Language Switcher with Globe Icon */}
        <div className="relative" ref={langMenuRef}>
          <button
            id="header-language-switcher-btn"
            type="button"
            onClick={() => setIsLangMenuOpen((prev) => !prev)}
            aria-label="Changer de langue / Select language / تغيير اللغة"
            aria-expanded={isLangMenuOpen}
            className="h-9 px-2.5 sm:px-3 rounded-full bg-[#F1F5F9] dark:bg-[#1A243B] hover:bg-slate-200/70 dark:hover:bg-[#202D4A] border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-2xs"
            title="Changer de langue / Change language / تغيير اللغة"
          >
            <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="font-bold text-[11px] sm:text-xs">
              {language === 'ar' ? 'العربية' : language === 'fr' ? 'Français' : 'English'}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                isLangMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isLangMenuOpen && (
            <div
              id="header-language-dropdown"
              className={`absolute ${
                isRTL ? 'left-0' : 'right-0'
              } mt-2 w-44 rounded-2xl bg-white dark:bg-[#182238] border border-slate-200 dark:border-slate-700/80 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150`}
            >
              <div className="text-[10px] uppercase font-bold text-slate-400 px-2.5 py-1 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-750 mb-1">
                <Globe className="w-3 h-3 text-blue-500" />
                <span>{isArabic ? 'اختر اللغة' : language === 'en' ? 'Select language' : 'Choisir la langue'}</span>
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
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#202D4A]'
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

        {/* Theme Toggle - Visible in header on desktop & mobile with smooth animation */}
        <button
          id="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={isDark ? (t.theme.lightMode || 'Mode clair') : (t.theme.darkMode || 'Mode sombre')}
          className="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-amber-400 hover:text-slate-900 dark:hover:text-amber-300 bg-[#F1F5F9] dark:bg-[#1A243B] hover:bg-slate-200/70 dark:hover:bg-[#22304E] border border-slate-200/80 dark:border-slate-700/80 transition-all duration-200 active:scale-95 cursor-pointer shadow-2xs group"
          title={isDark ? (t.theme.lightMode || (isArabic ? 'الوضع النهاري' : (language === 'en' ? 'Light mode' : 'Mode clair'))) : (t.theme.darkMode || (isArabic ? 'الوضع الليلي' : (language === 'en' ? 'Dark mode' : 'Mode sombre')))}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform duration-500 rotate-0 group-hover:rotate-90" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 transition-transform duration-500 -rotate-12 group-hover:rotate-0" />
          )}
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            id="notifications-btn"
            onClick={() => {
              setHasNotifications(false);
              setShowNotificationsToast(true);
              setTimeout(() => setShowNotificationsToast(false), 3500);
            }}
            aria-label="Notifications"
            className="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-[#F1F5F9] dark:bg-[#1A243B] hover:bg-slate-200/70 dark:hover:bg-[#202D4A] border border-slate-200/80 dark:border-slate-700/80 transition-colors cursor-pointer shadow-2xs"
          >
            <Bell className="w-4 h-4" />
            {hasNotifications && (
              <span className="absolute top-2 end-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#131B2E]" />
            )}
          </button>

          {/* Toast Notification popup */}
          {showNotificationsToast && (
            <div
              className={`absolute top-11 end-0 w-72 p-3.5 rounded-2xl bg-white dark:bg-[#182238] border border-[#E2E8F0] dark:border-slate-700 shadow-xl text-xs space-y-1.5 z-50 animate-in fade-in slide-in-from-top-2`}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{isArabic ? 'إشعارات منصة EOS BAC' : (language === 'en' ? 'EOS BAC Notifications' : 'Notifications EOS BAC')}</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {isArabic
                  ? 'تم تحديث برنامج التحضير لبكالوريا 2027. واصل المراجعة بانتظام!'
                  : (language === 'en' ? 'The BAC revision schedule is ready. Keep up your efforts!' : 'Le programme de révision du BAC 2027 est prêt. Continue tes efforts !')}
              </p>
            </div>
          )}
        </div>

        {/* User Authentication: Direct Login Button when logged out, Avatar Menu when logged in */}
        {!currentUser ? (
          <button
            id="header-login-btn"
            type="button"
            onClick={() => onOpenAuth('login')}
            className="min-h-[36px] px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5 shrink-0" />
            <span>{isArabic ? 'تسجيل الدخول' : (language === 'en' ? 'Sign in' : 'Connexion')}</span>
          </button>
        ) : (
          <div className="relative" ref={userMenuRef}>
            <button
              id="header-user-menu-btn"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-[#F1F5F9] dark:hover:bg-[#1A243B] border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors focus:outline-none cursor-pointer"
            >
              <img
                src={avatarUrl}
                alt={realName}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0"
              />
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 transition-transform ${
                  isUserMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div
                className={`absolute top-11 end-0 w-60 rounded-2xl bg-white dark:bg-[#182238] border border-slate-200 dark:border-slate-700 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 space-y-1 text-xs`}
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                {/* Profile summary */}
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700/80">
                  <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{realName}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {currentUser?.email || (isArabic ? 'حساب تلميذ مجاني' : (language === 'en' ? 'Student account' : 'Compte étudiant'))}
                  </div>
                </div>

                {/* Stream switch option in menu */}
                <div className="px-3 py-2 bg-slate-50 dark:bg-[#141C2E] rounded-xl my-1 border border-transparent dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider">
                    {isArabic ? 'شعبتك الحالية' : (language === 'en' ? 'Current stream' : 'Filière actuelle')}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                      {currentStream === 'sciences_experimentales'
                        ? (isArabic ? '🔬 علوم تجريبية' : (language === 'en' ? '🔬 Experimental Sciences' : '🔬 Sciences Exp.'))
                        : (isArabic ? '📐 رياضيات' : (language === 'en' ? '📐 Mathematics' : '📐 Mathématiques'))}
                    </span>
                    <button
                      onClick={() => {
                        onStreamChange(
                          currentStream === 'sciences_experimentales'
                            ? 'mathematiques'
                            : 'sciences_experimentales'
                        );
                        setIsUserMenuOpen(false);
                      }}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      {isArabic ? 'تغيير' : (language === 'en' ? 'Change' : 'Changer')}
                    </button>
                  </div>
                </div>

                {/* Navigation links */}
                <button
                  id="menu-profile-btn"
                  onClick={() => {
                    onNavigate('profile');
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#202D4A] transition-colors cursor-pointer"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>{t.profile.title || (isArabic ? 'الملف الشخصي' : (language === 'en' ? 'My profile' : 'Mon profil'))}</span>
                </button>

                {isAdmin && (
                  <>
                    <button
                      onClick={() => {
                        onNavigate('admin', { tab: 'lessons' });
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-900 dark:text-amber-200 bg-amber-50/80 dark:bg-amber-950/40 hover:bg-amber-100/80 dark:hover:bg-amber-900/50 transition-colors font-semibold cursor-pointer"
                    >
                      <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>{isArabic ? 'إدارة المحتوى (CMS)' : (language === 'en' ? 'Administration (CMS)' : 'Administration (CMS)')}</span>
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('admin-users');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-900 dark:text-amber-200 bg-amber-50/80 dark:bg-amber-950/40 hover:bg-amber-100/80 dark:hover:bg-amber-900/50 transition-colors font-semibold cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>{isArabic ? 'المستخدمون' : (language === 'en' ? 'Users' : 'Utilisateurs')}</span>
                    </button>
                  </>
                )}

                {/* Logout button */}
                <div className="pt-1 border-t border-slate-100 dark:border-slate-700/80">
                  <button
                    id="menu-logout-btn"
                    onClick={async () => {
                      await logout();
                      setIsUserMenuOpen(false);
                      onNavigate('landing');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors font-semibold cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t.profile.logout || (isArabic ? 'تسجيل الخروج' : (language === 'en' ? 'Sign out' : 'Se déconnecter'))}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
