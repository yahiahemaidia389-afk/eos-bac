import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

type SupportedLang = 'fr' | 'en' | 'ar';

function getInitialLanguage(): SupportedLang {
  try {
    const saved = localStorage.getItem('eos_language');
    if (saved === 'ar' || saved === 'en' || saved === 'fr') {
      return saved;
    }
  } catch {
    // fallback if localStorage is inaccessible
  }
  return 'fr';
}

const copy = {
  fr: {
    title: 'Une erreur inattendue est survenue',
    subtitle: 'L’application a rencontré un problème temporaire. Vous pouvez recharger la page pour reprendre vos révisions.',
    reload: 'Recharger l’application',
    home: 'Retour à l’accueil',
  },
  en: {
    title: 'Something went wrong',
    subtitle: 'An unexpected issue occurred. You can reload the page to continue your revision.',
    reload: 'Reload application',
    home: 'Go to home',
  },
  ar: {
    title: 'حدث خطأ غير متوقع',
    subtitle: 'واجه التطبيق مشكلة مؤقتة. يمكنك إعادة تحميل الصفحة لمواصلة مراجعتك بكل سهولة.',
    reload: 'إعادة تحميل التطبيق',
    home: 'العودة للرئيسية',
  },
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the technical error safely in console for developer debugging without exposing to students
    console.error('[BacNext ErrorBoundary caught an unhandled exception]:', error, errorInfo);
  }

  private handleReload = (): void => {
    try {
      window.location.reload();
    } catch {
      this.setState({ hasError: false, error: null });
    }
  };

  private handleGoHome = (): void => {
    try {
      window.location.href = '/';
    } catch {
      this.setState({ hasError: false, error: null });
    }
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const lang = getInitialLanguage();
      const isArabic = lang === 'ar';
      const text = copy[lang] || copy.fr;

      return (
        <div
          dir={isArabic ? 'rtl' : 'ltr'}
          className="min-h-screen w-full flex items-center justify-center p-4 bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-white transition-colors select-none"
        >
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none text-center relative overflow-hidden">
            {/* Ambient decorative top glow */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Header Brand */}
            <div className="flex justify-center mb-6">
              <BrandLogo size="md" />
            </div>

            {/* Warning Icon Badge */}
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <AlertTriangle className="w-7 h-7" />
            </div>

            {/* Error Message */}
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              {text.title}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6 max-w-sm mx-auto">
              {text.subtitle}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{text.reload}</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 active:scale-[0.98] text-slate-700 dark:text-slate-200 text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 border border-slate-200/80 dark:border-slate-700/60"
              >
                <Home className="w-4 h-4" />
                <span>{text.home}</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
