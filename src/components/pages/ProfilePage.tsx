import React, { useState, useRef } from 'react';
import { ViewType, StreamType, UserProfile } from '../../types';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { uploadAvatarImage } from '../../lib/storage';
import {
  Shield,
  ShieldCheck,
  Mail,
  GraduationCap,
  ChevronRight,
  Edit3,
  Save,
  X,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Flame,
  Globe,
  User as UserIcon,
  Camera,
  Upload,
  Target,
  Compass,
  Trophy,
} from 'lucide-react';
import { StreamBadge } from '../common/StreamBadge';
import { Language } from '../../i18n/types';

interface ProfilePageProps {
  onNavigate: (view: ViewType, payload?: any) => void;
  profile: UserProfile;
  currentStream: StreamType;
  onStreamChange: (stream: StreamType) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onNavigate,
  profile,
  currentStream,
  onStreamChange,
}) => {
  const { subjects } = useContent();
  const { currentUser, isAdmin, updateCurrentUserProfile, logout } = useAuth();
  const { t, isRTL, language, setLanguage } = useLanguage();
  const isArabic = language === 'ar';

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Avatar Upload States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Handle Avatar Selection and Immediate Upload to Supabase Storage
  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setNotification({
        type: 'error',
        message: isArabic
          ? 'يرجى اختيار ملف صورة صالح (PNG, JPG, WebP).'
          : (language === 'en' ? 'Please select a valid image file (PNG, JPG, WebP).' : 'Veuillez sélectionner un fichier image valide (PNG, JPG, WebP).'),
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setNotification({
        type: 'error',
        message: isArabic
          ? 'حجم الصورة يجب ألا يتجاوز 5 ميغابايت.'
          : (language === 'en' ? 'Image size must not exceed 5 MB.' : 'L’image ne doit pas dépasser 5 Mo.'),
      });
      return;
    }

    // 1. Immediate visual preview
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setNotification(null);
    setIsUploadingAvatar(true);

    try {
      // 2. Upload using Supabase Storage under the user's isolated folder
      const targetUserId = currentUser?.id || 'guest-user';
      const uploadRes = await uploadAvatarImage(targetUserId, file);

      if (!uploadRes.success || !uploadRes.url) {
        setNotification({
          type: 'error',
          message:
            uploadRes.error ||
            (isArabic ? 'فشل تحميل الصورة.' : (language === 'en' ? 'Failed to upload photo.' : 'Échec du téléversement de la photo.')),
        });
        setAvatarPreview(null);
        setIsUploadingAvatar(false);
        return;
      }

      const newAvatarUrl = uploadRes.url;
      setFormData((prev) => ({ ...prev, avatarUrl: newAvatarUrl }));

      // 3. Persist to Supabase Database & localStorage immediately
      const saveRes = await updateCurrentUserProfile({ avatarUrl: newAvatarUrl });
      if (saveRes.success) {
        setNotification({
          type: 'success',
          message: isArabic
            ? 'تم تحديث الصورة الشخصية وحفظها بنجاح!'
            : (language === 'en' ? 'Profile picture updated and saved successfully!' : 'Photo de profil mise à jour et enregistrée avec succès !'),
        });
      } else {
        setNotification({
          type: 'error',
          message:
            saveRes.error ||
            (isArabic ? 'فشل حفظ الصورة في الملف الشخصي.' : (language === 'en' ? 'Failed to save profile picture.' : 'Erreur lors de la sauvegarde du profil.')),
        });
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message:
          err.message ||
          (isArabic ? 'حدث خطأ أثناء تحميل الصورة.' : (language === 'en' ? 'An error occurred while uploading image.' : 'Une erreur est survenue lors du téléversement.')),
      });
      setAvatarPreview(null);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Form Field States
  const [formData, setFormData] = useState({
    fullName: currentUser?.full_name || profile.name || '',
    stream: currentStream || 'sciences_experimentales',
    language: (currentUser?.language || language) as Language,
    avatarUrl: currentUser?.avatar_url || profile.avatar || '',
    dream: currentUser?.dream || profile.dream || '',
    goal: currentUser?.goal || profile.goal || '',
    targetScore: currentUser?.target_score || profile.targetScore || '17',
    studyFocus: currentUser?.study_focus || profile.studyFocus || '',
  });

  const activeSubjects = subjects.filter((s) => s.streams.includes(currentStream));
  const isGoogleUser =
    currentUser?.id?.startsWith('usr-google-') ||
    currentUser?.avatar_url?.includes('google') ||
    currentUser?.avatar_url?.includes('lh3.google');

  // Handle Edit Start
  const handleStartEdit = () => {
    setFormData({
      fullName: currentUser?.full_name || profile.name || '',
      stream: currentStream || 'sciences_experimentales',
      language: (currentUser?.language || language) as Language,
      avatarUrl: currentUser?.avatar_url || profile.avatar || '',
      dream: currentUser?.dream || profile.dream || '',
      goal: currentUser?.goal || profile.goal || '',
      targetScore: currentUser?.target_score || profile.targetScore || '17',
      studyFocus: currentUser?.study_focus || profile.studyFocus || '',
    });
    setNotification(null);
    setIsEditing(true);
  };

  // Handle Cancel Edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setNotification(null);
  };

  // Handle Save Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setNotification({
        type: 'error',
        message: isArabic
          ? 'يرجى إدخال الاسم الكامل.'
          : (language === 'en' ? 'Please enter your full name.' : 'Veuillez saisir votre nom complet.'),
      });
      return;
    }

    setIsSaving(true);
    setNotification(null);

    try {
      // 1. Call context update which handles Supabase & local storage
      const result = await updateCurrentUserProfile({
        fullName: formData.fullName.trim(),
        stream: formData.stream,
        language: formData.language,
        avatarUrl: formData.avatarUrl.trim() || undefined,
        dream: formData.dream.trim() || undefined,
        goal: formData.goal.trim() || undefined,
        targetScore: formData.targetScore.trim() || undefined,
        studyFocus: formData.studyFocus.trim() || undefined,
      });

      if (!result.success) {
        setNotification({
          type: 'error',
          message:
            result.error ||
            (isArabic
              ? 'فشل حفظ التعديلات. يرجى المحاولة لاحقًا.'
              : (language === 'en' ? 'Failed to save changes. Please try again later.' : 'Échec de l’enregistrement des modifications.')),
        });
        setIsSaving(false);
        return;
      }

      // 2. Synchronize Stream across the whole app
      if (formData.stream !== currentStream) {
        onStreamChange(formData.stream);
      }

      // 3. Synchronize Language across the whole app if changed
      if (formData.language !== language) {
        setLanguage(formData.language);
      }

      setNotification({
        type: 'success',
        message: t.profile.profileUpdatedSuccess || (isArabic ? 'تم تحديث الملف الشخصي بنجاح' : (language === 'en' ? 'Profile updated successfully' : 'Profil mis à jour avec succès')),
      });
      setIsEditing(false);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || (isArabic ? 'حدث خطأ غير متوقع.' : (language === 'en' ? 'An unexpected error occurred.' : 'Une erreur inattendue est survenue.')),
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      onNavigate('landing');
    } catch (err) {
      console.error('Logout error:', err);
      onNavigate('landing');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const currentAvatar =
    (isEditing ? formData.avatarUrl : currentUser?.avatar_url) ||
    profile.avatar ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
      currentUser?.full_name || 'student'
    )}`;

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Toast Notification Banner */}
      {notification && (
        <div
          id="profile-notification-banner"
          className={`p-4 rounded-2xl border flex items-center gap-3 transition-all duration-300 ${
            notification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <p className="text-sm font-semibold flex-1">{notification.message}</p>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hidden File Input for Avatar Upload */}
      <input
        ref={fileInputRef}
        id="avatar-file-input"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleAvatarFileSelect}
      />

      {/* Main Profile Card */}
      <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start sm:items-center gap-5">
            <div className="flex flex-col items-center">
              <div className="relative group">
                <img
                  src={currentAvatar}
                  alt={currentUser?.full_name || profile.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700 shadow-xs bg-slate-50 dark:bg-slate-800"
                />

                {/* Interactive Clickable Overlay on the Avatar */}
                <button
                  id="change-avatar-overlay-btn"
                  type="button"
                  title={isArabic ? 'تغيير الصورة الشخصية' : (language === 'en' ? 'Change profile picture' : 'Changer la photo de profil')}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  ) : (
                    <>
                      <Camera className="w-6 h-6 text-white drop-shadow" />
                      <span className="text-[10px] font-bold mt-1 tracking-tight text-white drop-shadow">
                        {isArabic ? 'تغيير' : (language === 'en' ? 'Change' : 'Changer')}
                      </span>
                    </>
                  )}
                </button>

                {isGoogleUser && (
                  <div
                    title="Compte Google vérifié"
                    className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-1 shadow-xs border border-slate-200 dark:border-slate-700 pointer-events-none"
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  </div>
                )}
              </div>

              {/* Explicit Upload Trigger Button under the Avatar */}
              <button
                id="upload-avatar-trigger-btn"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isUploadingAvatar ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{isArabic ? 'جاري التحميل...' : (language === 'en' ? 'Uploading...' : 'Téléversement...')}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'تغيير الصورة' : (language === 'en' ? 'Change photo' : 'Changer photo')}</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  {currentUser?.full_name || profile.name}
                </h1>

                {/* Role Badge - Strictly Read-Only */}
                {isAdmin ? (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300 font-bold flex items-center gap-1">
                    <Shield className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    {isArabic ? 'مشرف المنصة' : (language === 'en' ? 'Administrator' : 'Administrateur')}
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-700 text-blue-900 dark:text-blue-300 font-bold flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    {isArabic ? 'تلميذ بكالوريا' : (language === 'en' ? 'Student' : 'Étudiant')}
                  </span>
                )}
              </div>

              {/* Email - Strictly Read-Only */}
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser?.email || 'compte@eosbac.dz'}</span>
              </p>

              <div className="pt-1.5 flex items-center gap-2 flex-wrap">
                <StreamBadge
                  currentStream={currentStream}
                  onStreamChange={onStreamChange}
                />
                <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {language === 'ar' ? 'العربية' : language === 'en' ? 'English' : 'Français'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Edit Profile & Logout */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
            {!isEditing ? (
              <>
                <button
                  id="profile-edit-btn"
                  onClick={handleStartEdit}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{t.profile.editProfile || (isArabic ? 'تعديل الملف الشخصي' : (language === 'en' ? 'Edit profile' : 'Modifier le profil'))}</span>
                </button>

                <button
                  id="profile-logout-btn"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isLoggingOut ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                  <span>{t.profile.logout || (isArabic ? 'تسجيل الخروج' : (language === 'en' ? 'Sign out' : 'Se déconnecter'))}</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="profile-cancel-btn"
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>{t.profile.cancel || (isArabic ? 'إلغاء' : (language === 'en' ? 'Cancel' : 'Annuler'))}</span>
                </button>

                <button
                  id="profile-save-btn"
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{t.profile.saveChanges || (isArabic ? 'حفظ التغييرات' : (language === 'en' ? 'Save changes' : 'Enregistrer les modifications'))}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Edit Form or Account Info Body */}
        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name (Editable) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{t.profile.fullName || (isArabic ? 'الاسم الكامل' : (language === 'en' ? 'Full Name' : 'Nom complet'))}</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  id="edit-fullname-input"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder={isArabic ? 'مثال: أمين بلقاسم' : (language === 'en' ? 'E.g.: Amine Belkacem' : 'Ex: Amine Belkacem')}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#162032] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  required
                />
              </div>

              {/* Email (Read-Only) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{t.profile.email || (isArabic ? 'البريد الإلكتروني' : (language === 'en' ? 'Email' : 'Email'))}</span>
                  </span>
                  <span className="text-[10px] font-normal lowercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                    {isArabic ? 'غير قابل للتعديل' : (language === 'en' ? 'read only' : 'lecture seule')}
                  </span>
                </label>
                <input
                  type="text"
                  value={currentUser?.email || 'compte@eosbac.dz'}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed"
                />
              </div>

              {/* Academic Stream (Editable) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{t.profile.stream || (isArabic ? 'الشعبة الدراسية' : (language === 'en' ? 'Academic Stream' : 'Filière académique'))}</span>
                </label>
                <select
                  id="edit-stream-select"
                  value={formData.stream}
                  onChange={(e) => setFormData({ ...formData, stream: e.target.value as StreamType })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#162032] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
                >
                  <option value="sciences_experimentales">
                    {isArabic ? 'علوم تجريبية (Sciences Expérimentales)' : (language === 'en' ? 'Experimental Sciences' : 'Sciences Expérimentales')}
                  </option>
                  <option value="mathematiques">
                    {isArabic ? 'رياضيات (Mathématiques)' : (language === 'en' ? 'Mathematics' : 'Mathématiques')}
                  </option>
                </select>
              </div>

              {/* Language Preference (Editable) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{t.profile.languagePreference || (isArabic ? 'لغة الواجهة' : (language === 'en' ? 'Interface Language' : 'Langue de l’interface'))}</span>
                </label>
                <select
                  id="edit-language-select"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value as Language })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#162032] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
                >
                  <option value="fr">Français (LTR)</option>
                  <option value="ar">العربية (RTL)</option>
                  <option value="en">English (LTR)</option>
                </select>
              </div>

              {/* Student Dream (Editable) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>{isArabic ? 'حلمي المستقبلي (المهنة أو التخصص)' : (language === 'en' ? 'My Dream / Target Career' : 'Mon Rêve / Métier visé')}</span>
                </label>
                <input
                  id="edit-dream-input"
                  type="text"
                  value={formData.dream}
                  onChange={(e) => setFormData({ ...formData, dream: e.target.value })}
                  placeholder={isArabic ? 'مثال: أن أصبح طبيباً، مهندس ذكاء اصطناعي...' : (language === 'en' ? 'E.g.: Become a doctor, AI engineer...' : 'Ex: Devenir médecin, ingénieur en IA...')}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#162032] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                />
              </div>

              {/* Student Goal (Editable) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{isArabic ? 'هدفي مع EOS BAC' : (language === 'en' ? 'My BAC Goal' : 'Mon Objectif BAC')}</span>
                </label>
                <input
                  id="edit-goal-input"
                  type="text"
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  placeholder={isArabic ? 'مثال: نيل البكالوريا بتقدير ممتاز...' : (language === 'en' ? 'E.g.: Pass BAC with honors...' : 'Ex: Décrocher le BAC avec mention Très Bien...')}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#162032] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                />
              </div>

              {/* Target BAC Score (Editable) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{isArabic ? 'المعدل المستهدف في البكالوريا' : (language === 'en' ? 'Target BAC grade (out of 20)' : 'Note cible au BAC (sur 20)')}</span>
                </label>
                <input
                  id="edit-target-score-input"
                  type="text"
                  value={formData.targetScore}
                  onChange={(e) => setFormData({ ...formData, targetScore: e.target.value })}
                  placeholder="Ex: 18.00"
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#162032] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-mono"
                />
              </div>

              {/* Priority Study Focus (Editable) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isArabic ? 'المادة ذات الأولوية للتركيز' : (language === 'en' ? 'Priority revision subject' : 'Matière prioritaire de révision')}</span>
                </label>
                <input
                  id="edit-study-focus-input"
                  type="text"
                  value={formData.studyFocus}
                  onChange={(e) => setFormData({ ...formData, studyFocus: e.target.value })}
                  placeholder={isArabic ? 'مثال: الرياضيات، الفيزياء...' : (language === 'en' ? 'E.g.: Mathematics, Physics...' : 'Ex: Mathématiques, SVT, Physique...')}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#162032] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>

              {/* Avatar Selection & Upload (Editable) */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{t.profile.avatarHelp || (isArabic ? 'الصورة الشخصية' : (language === 'en' ? 'Profile Picture & Avatar' : 'Photo de profil & Avatar'))}</span>
                </label>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    id="edit-avatar-upload-btn"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
                  >
                    {isUploadingAvatar ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{isArabic ? 'جاري التحميل...' : (language === 'en' ? 'Uploading...' : 'Téléversement...')}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>{isArabic ? 'اختيار صورة من جهازك' : (language === 'en' ? 'Choose a photo from your device' : 'Choisir une photo depuis l’appareil')}</span>
                      </>
                    )}
                  </button>

                  <div className="flex-1">
                    <input
                      id="edit-avatar-input"
                      type="url"
                      value={formData.avatarUrl}
                      onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                      placeholder="https://... ou téléversez ci-contre"
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#162032] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Role Protection Notice */}
              <div className="md:col-span-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  {isArabic
                    ? 'الأمان والصلاحيات: دور الحساب محمي بقواعد الأمان (RLS) ولا يمكن ترقية الحساب إلا عبر الإدارة.'
                    : 'Sécurité : Votre rôle est vérifié et protégé au niveau de la base de données. Seuls les administrateurs peuvent modifier les privilèges.'}
                </span>
              </div>
            </div>

            {/* Bottom Actions in Form */}
            <div className="pt-2 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold cursor-pointer transition-colors"
              >
                {t.profile.cancel || (isArabic ? 'إلغاء' : (language === 'en' ? 'Cancel' : 'Annuler'))}
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-60"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{t.profile.saveChanges || (isArabic ? 'حفظ التغييرات' : (language === 'en' ? 'Save changes' : 'Enregistrer les modifications'))}</span>
              </button>
            </div>
          </form>
        ) : (
          /* View Mode Metrics */
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">
                {isArabic ? 'التقدم الإجمالي' : (language === 'en' ? 'Progress' : 'Progression')}
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
                {profile.overallProgress}%
              </div>
              <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                {isArabic ? 'البرنامج السنوي' : (language === 'en' ? 'Annual Curriculum' : 'Programme')}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-center">
              <div className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{isArabic ? 'المواظبة' : (language === 'en' ? 'Streak' : 'Série')}</span>
              </div>
              <div className="text-2xl font-extrabold text-amber-900 dark:text-amber-300 font-mono mt-0.5">
                {profile.streakDays} {isArabic ? 'يوم' : (language === 'en' ? 'd' : 'j')}
              </div>
              <div className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold mt-0.5">
                {isArabic ? 'أيام متتالية' : (language === 'en' ? 'Consecutive days' : 'Consécutifs')}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">
                {isArabic ? 'المواد النشطة' : (language === 'en' ? 'Subjects' : 'Matières')}
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
                {activeSubjects.length}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                {isArabic ? 'معاملات رسمية' : (language === 'en' ? 'Official coefficients' : 'Officielles')}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">
                {isArabic ? 'اللغة الحالية' : (language === 'en' ? 'Current Language' : 'Langue')}
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 uppercase font-mono mt-0.5">
                {language}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                {language === 'ar' ? 'العربية' : language === 'en' ? 'English' : 'Français'}
              </div>
            </div>

            {/* Student Personal Goals & Aspirations Showcase Card */}
            <div className="col-span-2 sm:col-span-4 p-5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-purple-50/60 dark:from-slate-900/90 dark:via-blue-950/40 dark:to-purple-950/30 border border-blue-200/80 dark:border-blue-900/50 text-start space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Trophy className="w-4 h-4 text-amber-300 fill-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {isArabic ? 'مشروعي وطموحي في البكالوريا' : (language === 'en' ? 'My BAC Ambition & Project' : 'Mon Ambition & Projet BAC')}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isArabic ? 'أهدافك الشخصية تقود تحضيرك اليومي' : (language === 'en' ? 'Your personal goals guide your daily preparation' : 'Tes objectifs guident ta préparation au quotidien')}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'تعديل الهدف' : (language === 'en' ? 'Edit' : 'Modifier')}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* Dream */}
                <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
                  <div className="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400 flex items-center gap-1">
                    <Compass className="w-3 h-3" />
                    <span>{isArabic ? 'الحلم المستقبلي' : (language === 'en' ? 'Dream / Career' : 'Rêve / Métier')}</span>
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-1 truncate">
                    {currentUser?.dream || profile.dream || (isArabic ? 'غير محدد بعد' : (language === 'en' ? 'To be defined' : 'À définir'))}
                  </div>
                </div>

                {/* Goal */}
                <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
                  <div className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    <span>{isArabic ? 'الهدف الأكاديمي' : (language === 'en' ? 'BAC Goal' : 'Objectif BAC')}</span>
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-1 truncate">
                    {currentUser?.goal || profile.goal || (isArabic ? 'نيل البكالوريا بتفوق' : (language === 'en' ? 'Academic Excellence' : 'Excellence'))}
                  </div>
                </div>

                {/* Target Score */}
                <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
                  <div className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    <span>{isArabic ? 'المعدل المستهدف' : (language === 'en' ? 'Target grade' : 'Note visée')}</span>
                  </div>
                  <div className="text-sm font-extrabold text-blue-600 dark:text-blue-400 font-mono mt-1">
                    {currentUser?.target_score || profile.targetScore || '17'}/20
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Admin Panel Link - Strictly visible and accessible only by authorized admins */}
      {isAdmin && (
        <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {isArabic ? 'لوحة إدارة المحتوى التعليمي' : (language === 'en' ? 'Administration & CMS Space' : 'Espace Administration & Gestion')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isArabic
                  ? 'إدارة الدروس والتمارين والملخصات والمستخدمين.'
                  : (language === 'en' ? 'Management of lessons, exercises, summaries, and user moderation.' : 'Gestion des cours, exercices, résumés et modération des utilisateurs.')}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('admin')}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs self-start sm:self-auto transition-colors cursor-pointer"
          >
            {isArabic ? 'فتح لوحة الإدارة ←' : (language === 'en' ? 'Open Admin Panel →' : 'Ouvrir l’administration →')}
          </button>
        </div>
      )}

      {/* Subjects & Coefficients Overview */}
      <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {isArabic ? 'المواد والمعاملات الرسمية' : (language === 'en' ? 'Subjects & Official Coefficients' : 'Matières & Coefficients Officiels')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {currentStream === 'sciences_experimentales'
                ? isArabic
                  ? 'شعبة العلوم التجريبية'
                  : 'Filière : Sciences Expérimentales'
                : isArabic
                ? 'شعبة الرياضيات'
                : 'Filière : Mathématiques'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('lessons')}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
          >
            {isArabic ? 'تصفح الدروس ←' : (language === 'en' ? 'View lessons →' : 'Voir les cours →')}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activeSubjects.map((sub) => (
            <div
              key={sub.id}
              onClick={() => onNavigate('subject-detail', { subjectId: sub.id })}
              role="button"
              tabIndex={0}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 cursor-pointer flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs"
                  style={{ color: sub.color }}
                >
                  {sub.name.slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {isArabic ? sub.arabicName : sub.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isArabic
                      ? `المعامل : ${sub.coefficient[currentStream]}`
                      : `Coeff : ${sub.coefficient[currentStream]}`}
                  </div>
                </div>
              </div>

              <ChevronRight
                className={`w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors ${
                  isRTL ? 'rotate-180' : ''
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
