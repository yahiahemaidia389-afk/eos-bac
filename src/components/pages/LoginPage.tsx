import React, { useState, useEffect } from 'react';
import { ViewType, StreamType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Check,
  GraduationCap,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  User,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

interface LoginPageProps {
  onNavigate: (view: ViewType) => void;
  initialMode?: 'login' | 'signup';
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigate,
  initialMode = 'login',
}) => {
  const { login, signup, resetPassword, resendVerificationEmail, loginWithGoogle } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const isArabic = language === 'ar';

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedStream, setSelectedStream] = useState<StreamType>('sciences_experimentales');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [googleNotice, setGoogleNotice] = useState<string | null>(null);
  const [verificationSentEmail, setVerificationSentEmail] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // Cooldown countdown effect
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResendVerification = async () => {
    if (!verificationSentEmail || resendCooldown > 0) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await resendVerificationEmail(verificationSentEmail);
      if (res.success) {
        setSuccessMsg(
          t.auth.verificationResentSuccess ||
            (isArabic
              ? 'تمت إعادة إرسال رسالة التأكيد بنجاح.'
              : language === 'en'
              ? 'A new confirmation email has been sent.'
              : 'Un nouvel email de confirmation vous a été envoyé.')
        );
        setResendCooldown(30);
      } else {
        setErrorMsg(res.error || 'Erreur lors du renvoi.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors du renvoi.');
    } finally {
      setLoading(false);
    }
  };

  // Google button label
  const googleButtonLabel =
    language === 'ar'
      ? 'المتابعة باستخدام Google'
      : language === 'en'
      ? 'Continue with Google'
      : 'Continuer avec Google';

  // Call official Supabase Google OAuth
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setGoogleNotice(null);

    // Forgot password flow
    if (mode === 'forgot') {
      if (!email.trim()) {
        setErrorMsg(isArabic ? 'يرجى إدخال عنوان البريد الإلكتروني.' : (language === 'en' ? 'Please enter your email address.' : 'Veuillez saisir votre adresse email.'));
        return;
      }
      setLoading(true);
      try {
        const res = await resetPassword(email.trim());
        if (res.success) {
          setSuccessMsg(t.auth.resetEmailSent);
        } else {
          setErrorMsg(res.error || t.auth.invalidCredentials);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Une erreur est survenue.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Login or Signup
    if (!email.trim() || !password) {
      setErrorMsg(
        isArabic
          ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور.'
          : (language === 'en' ? 'Please enter your email and password.' : 'Veuillez renseigner votre email et mot de passe.')
      );
      return;
    }

    setLoading(true);

    try {
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
          language: language as any,
        });

        if (!result.success) {
          setErrorMsg(result.error || t.auth.invalidCredentials);
          setLoading(false);
          return;
        }

        if (result.requiresVerification) {
          setVerificationSentEmail(email.trim());
          setResendCooldown(30);
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

        onNavigate(result.user?.role === 'admin' ? 'admin' : 'dashboard');
      } else {
        const result = await login(email.trim(), password);
        if (!result.success) {
          setErrorMsg(result.error || t.auth.invalidCredentials);
          setLoading(false);
          return;
        }

        onNavigate(result.user?.role === 'admin' ? 'admin' : 'dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8"
    >
      <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">
        {/* Top Header: Brand Logo + Back Navigation */}
        <div className="flex items-center justify-between">
          <BrandLogo size="sm" />
          <button
            id="back-to-landing-btn"
            type="button"
            onClick={() => onNavigate('landing')}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isRTL ? (
              <>
                <span>العودة للرئيسية</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Home' : 'Accueil'}</span>
              </>
            )}
          </button>
        </div>

        {/* Title and Subtitle */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {mode === 'forgot'
              ? t.auth.forgotPassword
              : mode === 'signup'
              ? t.auth.signupTitle
              : t.auth.loginTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {mode === 'forgot'
              ? t.auth.forgotPasswordSubtitle
              : mode === 'signup'
              ? t.auth.signupSubtitle
              : t.auth.loginSubtitle}
          </p>
        </div>

        {/* Mode Selector Tabs (only shown for login / signup) */}
        {mode !== 'forgot' ? (
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <button
              id="tab-login"
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
                setGoogleNotice(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white dark:bg-[#162032] text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.nav.login}
            </button>
            <button
              id="tab-signup"
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
                setGoogleNotice(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white dark:bg-[#162032] text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.nav.signup}
            </button>
          </div>
        ) : (
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
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google Configuration Notice Helper */}
        {googleNotice && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs space-y-1">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>{googleNotice}</span>
            </div>
            <div className="text-[10px] text-amber-800/80 dark:text-amber-300/80">
              {t.auth.googleConfigHelp}
            </div>
          </div>
        )}

        {/* Email Verification Action Card */}
        {verificationSentEmail && (
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-950 dark:text-blue-200 space-y-3">
            <div className="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-400">
              <Mail className="w-4 h-4" />
              <span>
                {t.auth.verificationRequiredTitle ||
                  (isArabic
                    ? 'تأكيد البريد الإلكتروني مطلوب'
                    : language === 'en'
                    ? 'Email verification required'
                    : 'Vérification email requise')}
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {isArabic
                ? `لقد أرسلنا رابط تفعيل إلى ${verificationSentEmail}. يرجى النقر على الرابط لتأكيد حسابك.`
                : language === 'en'
                ? `We sent a verification link to ${verificationSentEmail}. Please click the link to activate your account.`
                : `Nous avons envoyé un lien de confirmation à ${verificationSentEmail}. Cliquez dessus pour activer votre compte.`}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={loading || resendCooldown > 0}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold transition-colors cursor-pointer text-xs"
              >
                {resendCooldown > 0
                  ? `${t.auth.cooldownWait || (isArabic ? 'يرجى الانتظار' : (language === 'en' ? 'Please wait' : 'Patientez'))} (${resendCooldown}s)`
                  : t.auth.resendVerificationBtn ||
                    (isArabic
                      ? 'إعادة إرسال الرابط'
                      : language === 'en'
                      ? 'Resend link'
                      : "Renvoyer l'email")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setVerificationSentEmail(null);
                  setMode('login');
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs"
              >
                {t.auth.backToLogin ||
                  (isArabic ? 'العودة لتسجيل الدخول' : language === 'en' ? 'Back to login' : 'Retour à la connexion')}
              </button>
            </div>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sign up: Full name */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.auth.fullName}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute start-3.5 top-3" />
                <input
                  id="signup-name-input"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.auth.fullNamePlaceholder}
                  className="w-full ps-10 pe-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#162032] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t.auth.email}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute start-3.5 top-3" />
              <input
                id="login-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@domaine.com"
                className="w-full ps-10 pe-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#162032] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Password field (only in login or signup mode) */}
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
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    {t.auth.forgotPassword}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute start-3.5 top-3" />
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full ps-10 pe-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#162032] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Sign up: Confirm Password & Stream */}
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.auth.confirmPassword}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute start-3.5 top-3" />
                  <input
                    id="signup-confirm-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full ps-10 pe-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#162032] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.auth.chooseStream}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStream('sciences_experimentales')}
                    className={`p-2.5 rounded-xl border text-start transition-all cursor-pointer ${
                      selectedStream === 'sciences_experimentales'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-1 ring-blue-600'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-[#162032]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">🔬</span>
                      {selectedStream === 'sciences_experimentales' && (
                        <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div className="text-xs font-bold mt-1 text-slate-900 dark:text-slate-100">
                      {t.common.streamSciShort}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedStream('mathematiques')}
                    className={`p-2.5 rounded-xl border text-start transition-all cursor-pointer ${
                      selectedStream === 'mathematiques'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-1 ring-blue-600'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-[#162032]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">📐</span>
                      {selectedStream === 'mathematiques' && (
                        <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div className="text-xs font-bold mt-1 text-slate-900 dark:text-slate-100">
                      {t.common.streamMathShort}
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Primary Submit Button */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-sm font-bold shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
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

        {/* OR / Google Divider (only shown in login / signup mode) */}
        {mode !== 'forgot' && (
          <>
            <div className="relative my-3 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative px-3 bg-white dark:bg-[#111827] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {t.auth.orDivider}
              </div>
            </div>

            {/* Google Login Button */}
            <button
              id="google-login-btn"
              type="button"
              disabled={googleLoading}
              onClick={handleGoogleSignIn}
              className="w-full py-3 px-4 rounded-xl bg-white dark:bg-[#162032] hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 active:scale-[0.99] text-slate-700 dark:text-slate-200 font-bold text-sm shadow-xs flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-60"
            >
              {googleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                  <span>{googleButtonLabel}</span>
                </>
              )}
            </button>

            {/* Registration Link / Login Link Switch */}
            <div className="text-center pt-2">
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
                    className="text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
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
                    className="text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
                  >
                    {t.auth.switchLoginLink}
                  </button>
                </p>
              )}
            </div>
          </>
        )}

        {/* Intentional Bottom Assurance Section: Academic & Security Certification */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100/80 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-200">
                {isArabic
                  ? 'تحضير رسمي معتمد للبكالوريا 2026'
                  : (language === 'en' ? 'Certified preparation for BAC 2026' : 'Préparation certifiée au BAC 2026')}
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                {isArabic
                  ? 'منصة آمنة ومجانية 100%، متوافقة بدقة مع المنهاج الرسمي لوزارة التربية الوطنية.'
                  : (language === 'en' ? '100% free and secure platform, compliant with official Ministry curriculum.' : 'Plateforme 100% gratuite et sécurisée, conforme au programme officiel du Ministère.')}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>
              {isArabic
                ? 'حماية مشفرة للبيانات والجلسات'
                : (language === 'en' ? 'Encrypted connection and secured data' : 'Connexion chiffrée et données sécurisées')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
