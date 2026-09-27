import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { BrandLogo } from '../common/BrandLogo';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { ViewType } from '../../types';

interface ResetPasswordPageProps {
  onNavigate: (view: ViewType) => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onNavigate }) => {
  const { updatePassword, setIsRecoveryMode } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const isArabic = language === 'ar';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!password) {
      setErrorMsg(
        isArabic
          ? 'يرجى إدخال كلمة المرور الجديدة.'
          : language === 'en'
          ? 'Please enter your new password.'
          : 'Veuillez saisir votre nouveau mot de passe.'
      );
      return;
    }

    if (password.length < 6) {
      setErrorMsg(
        isArabic
          ? 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.'
          : language === 'en'
          ? 'Password must be at least 6 characters.'
          : 'Le mot de passe doit comporter au moins 6 caractères.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(
        t.auth.passwordsDontMatch ||
          (isArabic
            ? 'كلمتا المرور غير متطابقتين.'
            : language === 'en'
            ? 'Passwords do not match.'
            : 'Les mots de passe ne correspondent pas.')
      );
      return;
    }

    setLoading(true);

    try {
      const res = await updatePassword(password);
      if (res.success) {
        setSuccess(true);
      } else {
        const msg = res.error || '';
        if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) {
          setErrorMsg(
            t.auth.invalidOrExpiredLink ||
              (isArabic
                ? 'رابط الاستعادة هذا غير صالح أو انتهت صلاحيته. يرجى تقديم طلب جديد.'
                : language === 'en'
                ? 'This recovery link is invalid or has expired. Please request a new one.'
                : 'Ce lien de récupération est invalide ou a expiré. Veuillez faire une nouvelle demande.')
          );
        } else {
          setErrorMsg(msg || 'Une erreur est survenue.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnToLogin = () => {
    setIsRecoveryMode(false);
    onNavigate('login');
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 lg:p-8"
    >
      <div className="w-full max-w-md bg-white dark:bg-[#131B2E] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xl p-6 sm:p-8 space-y-6 transition-all">
        {/* Header with Logo */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <BrandLogo size="lg" />
          </div>
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isArabic
              ? 'إعادة تعيين كلمة المرور'
              : language === 'en'
              ? 'Reset your password'
              : 'Réinitialiser votre mot de passe'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
            {isArabic
              ? 'أدخل كلمة مرور قوية وجديدة لحماية حسابك في منصة EOS BAC.'
              : language === 'en'
              ? 'Enter a secure new password for your EOS BAC account.'
              : 'Définissez un nouveau mot de passe sécurisé pour votre compte EOS BAC.'}
          </p>
        </div>

        {/* Success State */}
        {success ? (
          <div className="space-y-6 py-2">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">
                  {t.auth.passwordUpdatedSuccess ||
                    (isArabic
                      ? 'تم تحديث كلمة المرور بنجاح!'
                      : language === 'en'
                      ? 'Your password has been updated successfully!'
                      : 'Votre mot de passe a été mis à jour avec succès !')}
                </p>
                <p className="text-emerald-700/90 dark:text-emerald-300/80 text-xs">
                  {isArabic
                    ? 'يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.'
                    : language === 'en'
                    ? 'You can now sign in using your new credentials.'
                    : 'Vous pouvez désormais vous connecter avec votre nouveau mot de passe.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>
                {isArabic
                  ? 'الانتقال إلى لوحة التحكم'
                  : language === 'en'
                  ? 'Go to Dashboard'
                  : 'Accéder au tableau de bord'}
              </span>
              <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {t.auth.newPasswordLabel ||
                    (isArabic ? 'كلمة المرور الجديدة' : language === 'en' ? 'New password' : 'Nouveau mot de passe')}
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                  className={`w-full py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 transition-all ${
                    isRTL ? 'pr-3 pl-10' : 'pl-3 pr-10'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 cursor-pointer ${
                    isRTL ? 'left-2' : 'right-2'
                  }`}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                {isArabic
                  ? 'يجب أن لا تقل عن 6 أحرف.'
                  : language === 'en'
                  ? 'Must be at least 6 characters.'
                  : 'Au moins 6 caractères.'}
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {t.auth.confirmNewPasswordLabel ||
                    (isArabic
                      ? 'تأكيد كلمة المرور'
                      : language === 'en'
                      ? 'Confirm new password'
                      : 'Confirmer le mot de passe')}
                </span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                required
                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {isArabic ? 'جارٍ التحديث...' : language === 'en' ? 'Updating...' : 'Mise à jour...'}
                  </span>
                </>
              ) : (
                <>
                  <span>
                    {t.auth.updatePasswordBtn ||
                      (isArabic
                        ? 'تحديث كلمة المرور'
                        : language === 'en'
                        ? 'Update password'
                        : 'Mettre à jour le mot de passe')}
                  </span>
                  <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleReturnToLogin}
                className="text-xs text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                <span>
                  {t.auth.backToLogin ||
                    (isArabic ? 'العودة لتسجيل الدخول' : language === 'en' ? 'Back to login' : 'Retour à la connexion')}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
