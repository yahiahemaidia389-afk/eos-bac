import React, { useState, useEffect } from 'react';
import { StreamType, UserAccount } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  X,
  Check,
  ArrowRight,
  ShieldCheck,
  Mail,
  Lock,
  User,
  AlertCircle,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserAccount) => void;
  initialMode?: 'login' | 'signup';
  defaultStream?: StreamType;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
  defaultStream = 'sciences_experimentales',
}) => {
  const { login, signup, resetPassword, loginWithGoogle } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const isArabic = language === 'ar';

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedStream, setSelectedStream] = useState<StreamType>(defaultStream);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleNotice, setGoogleNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
      setSuccessMsg(null);
      setGoogleNotice(null);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFullName('');
      setShowPassword(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setGoogleNotice(null);
    setLoading(true);

    try {
      if (mode === 'forgot') {
        if (!email.trim()) {
          setErrorMsg(isArabic ? 'يرجى إدخال البريد الإلكتروني.' : (language === 'en' ? 'Please enter your email address.' : 'Veuillez renseigner votre email.'));
          setLoading(false);
          return;
        }
        const res = await resetPassword(email.trim());
        if (res.success) {
          setSuccessMsg(t.auth.resetEmailSent);
        } else {
          setErrorMsg(res.error || t.auth.invalidCredentials);
        }
        setLoading(false);
        return;
      }

      if (mode === 'signup') {
        if (!fullName.trim()) {
          setErrorMsg(isArabic ? 'يرجى إدخال الاسم الكامل.' : (language === 'en' ? 'Please enter your full name.' : 'Veuillez renseigner votre nom complet.'));
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setErrorMsg(t.auth.passwordsDontMatch);
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg(isArabic ? 'كلمة المرور يجب أن لا تقل عن 6 أحرف.' : (language === 'en' ? 'Password must be at least 6 characters.' : 'Le mot de passe doit contenir au moins 6 caractères.'));
          setLoading(false);
          return;
        }

        const result = await signup({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          stream: selectedStream,
          language,
        });

        if (!result.success) {
          setErrorMsg(result.error || t.auth.invalidCredentials);
          setLoading(false);
          return;
        }

        if (result.requiresVerification) {
          setSuccessMsg(
            t.auth.verificationRequiredDesc ||
              (isArabic
                ? 'تم إرسال رسالة تأكيد إلى بريدك الإلكتروني. يرجى الضغط على الرابط لتفعيل حسابك.'
                : language === 'en'
                ? 'A confirmation email has been sent. Please click the link to activate your account.'
                : 'Un email de confirmation vous a été envoyé. Veuillez cliquer sur le lien pour valider votre compte.')
          );
          setLoading(false);
          return;
        }

        if (result.user) {
          onSuccess(result.user);
        }
      } else {
        // Login mode
        if (!email.trim() || !password) {
          setErrorMsg(isArabic ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور.' : (language === 'en' ? 'Please enter your email and password.' : 'Veuillez renseigner votre email et mot de passe.'));
          setLoading(false);
          return;
        }

        const result = await login(email.trim(), password);
        if (!result.success) {
          setErrorMsg(result.error || t.auth.invalidCredentials);
          setLoading(false);
          return;
        }

        if (result.user) {
          onSuccess(result.user);
        }
      }

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setGoogleNotice(null);
    setGoogleLoading(true);

    try {
      const res = await loginWithGoogle();
      if (!res.success && res.error) {
        setGoogleNotice(res.error);
        setErrorMsg(res.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message || (isArabic ? 'فشل تسجيل الدخول عبر Google' : (language === 'en' ? 'Google sign-in failed' : 'Erreur lors de la connexion Google')));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div
      id="auth-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 my-8 transition-colors">
        {/* Close Button */}
        <button
          id="auth-modal-close"
          type="button"
          onClick={onClose}
          className={`absolute top-4 ${
            isRTL ? 'left-4' : 'right-4'
          } p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer`}
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand & Header */}
        <div className="mb-5">
          <BrandLogo size="sm" showTagline={false} />
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-3.5">
            {mode === 'forgot'
              ? t.auth.forgotPassword
              : mode === 'signup'
              ? t.auth.signupTitle
              : t.auth.loginTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {mode === 'forgot'
              ? t.auth.forgotPasswordSubtitle
              : mode === 'signup'
              ? t.auth.signupSubtitle
              : t.auth.loginSubtitle}
          </p>
        </div>

        {/* Tab switch (only in login or signup mode) */}
        {mode !== 'forgot' ? (
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 mb-5">
            <button
              id="auth-tab-login"
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
                setGoogleNotice(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white dark:bg-[#131B2E] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t.nav.login}
            </button>

            <button
              id="auth-tab-signup"
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
                setGoogleNotice(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white dark:bg-[#131B2E] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t.nav.signup}
            </button>
          </div>
        ) : (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
              <span>{t.auth.backToLogin}</span>
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google Configuration Notice Helper */}
        {googleNotice && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs space-y-1">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>{googleNotice}</span>
            </div>
            <div className="text-[10px] text-amber-800/80 dark:text-amber-300/80">
              {t.auth.googleConfigHelp}
            </div>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* REGISTER: Full Name */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.auth.fullName}
              </label>
              <div className="relative">
                <User
                  className={`w-4 h-4 text-slate-400 dark:text-slate-500 absolute top-3 ${
                    isRTL ? 'right-3' : 'left-3'
                  }`}
                />
                <input
                  id="auth-input-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.auth.fullNamePlaceholder}
                  className={`w-full py-2.5 text-xs sm:text-sm rounded-xl bg-[#F8FAFC] dark:bg-slate-900/80 border border-[#E2E8F0] dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all ${
                    isRTL ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'
                  }`}
                  required
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t.auth.email}
            </label>
            <div className="relative">
              <Mail
                className={`w-4 h-4 text-slate-400 dark:text-slate-500 absolute top-3 ${
                  isRTL ? 'right-3' : 'left-3'
                }`}
              />
              <input
                id="auth-input-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.auth.emailPlaceholder}
                className={`w-full py-2.5 text-xs sm:text-sm rounded-xl bg-[#F8FAFC] dark:bg-slate-900/80 border border-[#E2E8F0] dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all ${
                  isRTL ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'
                }`}
                required
              />
            </div>
          </div>

          {/* Password (for login and signup) */}
          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t.auth.password}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    {t.auth.forgotPassword}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock
                  className={`w-4 h-4 text-slate-400 dark:text-slate-500 absolute top-3 ${
                    isRTL ? 'right-3' : 'left-3'
                  }`}
                />
                <input
                  id="auth-input-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.auth.passwordPlaceholder}
                  className={`w-full py-2.5 text-xs sm:text-sm rounded-xl bg-[#F8FAFC] dark:bg-slate-900/80 border border-[#E2E8F0] dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all ${
                    isRTL ? 'pr-9 pl-10 text-right' : 'pl-9 pr-10 text-left'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-2.5 ${
                    isRTL ? 'left-3' : 'right-3'
                  } text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer`}
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* REGISTER: Confirm Password */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.auth.confirmPassword}
              </label>
              <div className="relative">
                <Lock
                  className={`w-4 h-4 text-slate-400 dark:text-slate-500 absolute top-3 ${
                    isRTL ? 'right-3' : 'left-3'
                  }`}
                />
                <input
                  id="auth-input-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.auth.confirmPassword}
                  className={`w-full py-2.5 text-xs sm:text-sm rounded-xl bg-[#F8FAFC] dark:bg-slate-900/80 border border-[#E2E8F0] dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all ${
                    isRTL ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'
                  }`}
                  required
                />
              </div>
            </div>
          )}

          {/* REGISTER: BAC Stream Selector */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.auth.chooseStream}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="signup-stream-sci"
                  onClick={() => setSelectedStream('sciences_experimentales')}
                  className={`p-2.5 rounded-xl border ${
                    isRTL ? 'text-right' : 'text-left'
                  } transition-all cursor-pointer ${
                    selectedStream === 'sciences_experimentales'
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/50 border-emerald-500 text-emerald-950 dark:text-emerald-300 ring-1 ring-emerald-500/20 shadow-2xs'
                      : 'bg-[#F8FAFC] dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">🔬</span>
                    {selectedStream === 'sciences_experimentales' && (
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                  <div className="text-xs font-bold mt-1 text-slate-900 dark:text-white">
                    {t.common.streamSciShort}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">SVT • Maths • Physique</div>
                </button>

                <button
                  type="button"
                  id="signup-stream-math"
                  onClick={() => setSelectedStream('mathematiques')}
                  className={`p-2.5 rounded-xl border ${
                    isRTL ? 'text-right' : 'text-left'
                  } transition-all cursor-pointer ${
                    selectedStream === 'mathematiques'
                      ? 'bg-blue-50/70 dark:bg-blue-950/50 border-blue-600 dark:border-blue-500 text-blue-950 dark:text-blue-300 ring-1 ring-blue-600/20 shadow-2xs'
                      : 'bg-[#F8FAFC] dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">📐</span>
                    {selectedStream === 'mathematiques' && (
                      <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div className="text-xs font-bold mt-1 text-slate-900 dark:text-white">
                    {t.common.streamMathShort}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Maths coeff 7</div>
                </button>
              </div>

              {/* Security info banner: role is strictly student */}
              <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>{t.auth.adminNotice}</span>
              </div>
            </div>
          )}

          {/* Primary Submit Button */}
          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'forgot'
                    ? t.auth.resetPasswordBtn
                    : mode === 'signup'
                    ? t.auth.signupBtn
                    : t.auth.loginBtn}
                </span>
                <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>
        </form>

        {/* OR / Google (Only in login or signup mode) */}
        {mode !== 'forgot' && (
          <>
            {/* Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative px-3 bg-white dark:bg-[#131B2E] text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {t.auth.orDivider}
              </div>
            </div>

            {/* Continue with Google */}
            <button
              id="google-login-btn"
              type="button"
              disabled={googleLoading}
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-400 active:scale-[0.99] text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-60"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{t.auth.continueWithGoogle}</span>
            </button>

            {/* Switch Link between Login & Register */}
            <div className="mt-4 text-center">
              {mode === 'login' ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.auth.switchSignupPrompt}{' '}
                  <button
                    type="button"
                    id="switch-to-signup-link"
                    onClick={() => {
                      setMode('signup');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      setGoogleNotice(null);
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold hover:underline cursor-pointer"
                  >
                    {t.auth.switchSignupLink}
                  </button>
                </p>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.auth.switchLoginPrompt}{' '}
                  <button
                    type="button"
                    id="switch-to-login-link"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      setGoogleNotice(null);
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold hover:underline cursor-pointer"
                  >
                    {t.auth.switchLoginLink}
                  </button>
                </p>
              )}
            </div>
          </>
        )}

        {/* Academic & Security Reassurance Footer */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 text-center">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            {isArabic
              ? 'منصة تعليمية آمنة ومجانية 100% • مطابقة للبرنامج الرسمي للبكالوريا'
              : (language === 'en' ? '100% Secure • Compliant with official BAC curriculum' : 'Plateforme 100% sécurisée • Conforme au programme officiel du BAC')}
          </span>
        </div>
      </div>
    </div>
  );
};
