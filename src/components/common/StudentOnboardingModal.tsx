import React, { useState } from 'react';
import { StreamType } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Target,
  Compass,
  Trophy,
  GraduationCap,
  Heart,
  Stethoscope,
  Cpu,
  Plane,
  Building,
  Atom,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface StudentOnboardingModalProps {
  isOpen: boolean;
  defaultStream?: StreamType;
  onFinish?: () => void;
}

export const StudentOnboardingModal: React.FC<StudentOnboardingModalProps> = ({
  isOpen,
  defaultStream = 'sciences_experimentales',
  onFinish,
}) => {
  const { t, isRTL, language } = useLanguage();
  const { currentUser, completeStudentOnboarding } = useAuth();
  const isArabic = language === 'ar';

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedStream, setSelectedStream] = useState<StreamType>(
    currentUser?.stream || defaultStream
  );

  // Step 2: Dream
  const [selectedDream, setSelectedDream] = useState<string>(currentUser?.dream || '');
  const [customDream, setCustomDream] = useState<string>('');
  const [isCustomDream, setIsCustomDream] = useState<boolean>(false);

  // Step 3: Goal & Target Score
  const [selectedGoal, setSelectedGoal] = useState<string>(currentUser?.goal || '');
  const [customGoal, setCustomGoal] = useState<string>('');
  const [isCustomGoal, setIsCustomGoal] = useState<boolean>(false);
  const [targetScore, setTargetScore] = useState<string>(currentUser?.target_score || '17');
  const [studyFocus, setStudyFocus] = useState<string>(currentUser?.study_focus || '');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Preset Dreams with Icons & Translations
  const PRESET_DREAMS = [
    {
      id: 'doctor',
      label: t.onboarding.dreamDoctor,
      icon: Stethoscope,
      emoji: '🩺',
    },
    {
      id: 'engineer',
      label: t.onboarding.dreamEngineer,
      icon: Cpu,
      emoji: '🏗️',
    },
    {
      id: 'medicine',
      label: t.onboarding.dreamMedicine,
      icon: Heart,
      emoji: '🏥',
    },
    {
      id: 'cs',
      label: t.onboarding.dreamComputerScience,
      icon: Cpu,
      emoji: '💻',
    },
    {
      id: 'pilot',
      label: t.onboarding.dreamPilot,
      icon: Plane,
      emoji: '✈️',
    },
    {
      id: 'teacher',
      label: t.onboarding.dreamTeacher,
      icon: GraduationCap,
      emoji: '🎓',
    },
    {
      id: 'business',
      label: t.onboarding.dreamBusiness,
      icon: Building,
      emoji: '💼',
    },
    {
      id: 'researcher',
      label: t.onboarding.dreamResearcher,
      icon: Atom,
      emoji: '🔬',
    },
  ];

  // Preset Goals with Emojis & Translations
  const PRESET_GOALS = [
    {
      id: 'high_grade',
      label: t.onboarding.goalHighGrade,
      badge: 'Mention TB',
      emoji: '🏆',
      score: '17',
    },
    {
      id: '16_plus',
      label: t.onboarding.goal16Plus,
      badge: '16/20+',
      emoji: '🎯',
      score: '16',
    },
    {
      id: '17_plus',
      label: t.onboarding.goal17Plus,
      badge: '17/20+',
      emoji: '🌟',
      score: '17',
    },
    {
      id: '18_plus',
      label: t.onboarding.goal18Plus,
      badge: '18/20+',
      emoji: '🚀',
      score: '18',
    },
    {
      id: '19_plus',
      label: t.onboarding.goal19Plus,
      badge: '19/20+',
      emoji: '👑',
      score: '19',
    },
    {
      id: '20_target',
      label: t.onboarding.goal20,
      badge: '20/20',
      emoji: '💯',
      score: '20',
    },
    {
      id: 'weak_subjects',
      label: t.onboarding.goalWeakSubjects,
      badge: isArabic ? 'تدارك' : (language === 'en' ? 'Progress' : 'Progrès'),
      emoji: '📈',
      score: '15',
    },
    {
      id: 'consistent_prep',
      label: t.onboarding.goalConsistentPrep,
      badge: isArabic ? 'انضباط' : (language === 'en' ? 'Method' : 'Méthode'),
      emoji: '📅',
      score: '16',
    },
    {
      id: 'dream_uni',
      label: t.onboarding.goalDreamUni,
      badge: isArabic ? 'جامعة الأحلام' : (language === 'en' ? 'Academic Excellence' : 'Excellence'),
      emoji: '🏛️',
      score: '18',
    },
  ];

  // Resolve Final Chosen Dream
  const resolvedDream = isCustomDream
    ? customDream.trim() || (isArabic ? 'النجاح بتفوق' : (language === 'en' ? 'Academic Excellence' : 'Excellence académique'))
    : selectedDream || PRESET_DREAMS[0].label;

  // Resolve Final Chosen Goal
  const resolvedGoal = isCustomGoal
    ? customGoal.trim() || (isArabic ? 'نيل البكالوريا بتقدير ممتاز' : (language === 'en' ? 'Pass the BAC with honors' : 'Décrocher le BAC avec mention'))
    : selectedGoal || PRESET_GOALS[0].label;

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!selectedDream && !customDream.trim()) {
        setSelectedDream(PRESET_DREAMS[0].label);
      }
      setStep(3);
    } else if (step === 3) {
      if (!selectedGoal && !customGoal.trim()) {
        setSelectedGoal(PRESET_GOALS[0].label);
      }
      setStep(4);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as any);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      await completeStudentOnboarding({
        stream: selectedStream,
        dream: resolvedDream,
        goal: resolvedGoal,
        targetScore: targetScore || '17',
        studyFocus: studyFocus || (selectedStream === 'sciences_experimentales' ? 'SVT' : 'Mathématiques'),
      });
      if (onFinish) {
        onFinish();
      }
    } catch (err) {
      console.error('Failed to complete student onboarding:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="student-onboarding-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 my-auto animate-in zoom-in-95 duration-200 transition-colors">
        {/* Top Header: Brand & Step Dots */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <BrandLogo size="sm" showTagline={false} />

          {/* Stepper Dots (1 to 4) */}
          <div className="flex items-center gap-1.5" aria-label={`Étape ${step} sur 4`}>
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-7 bg-blue-600 dark:bg-blue-500'
                    : s < step
                    ? 'w-2.5 bg-emerald-500 dark:bg-emerald-400'
                    : 'w-2 bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* =====================================================================
            STEP 1: WELCOME & STREAM CONFIRMATION
           ===================================================================== */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isArabic ? 'مرحلة الانطلاق' : (language === 'en' ? 'Step 1 of 4' : 'Étape 1 sur 4')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t.onboarding.step1Welcome}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                {t.onboarding.step1Subtitle}
              </p>
            </div>

            {/* Stream Selection */}
            <div className="space-y-2.5 pt-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center">
                {t.onboarding.step1StreamTitle}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Sciences Expérimentales */}
                <button
                  type="button"
                  id="onboarding-stream-sci"
                  onClick={() => setSelectedStream('sciences_experimentales')}
                  className={`p-4 rounded-2xl border text-start transition-all cursor-pointer relative flex flex-col justify-between ${
                    selectedStream === 'sciences_experimentales'
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between w-full">
                    <span className="text-2xl">🔬</span>
                    {selectedStream === 'sciences_experimentales' ? (
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600" />
                    )}
                  </div>
                  <div className="mt-3">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {isArabic ? 'العلوم التجريبية' : (language === 'en' ? 'Experimental Sciences' : 'Sciences Expérimentales')}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {isArabic ? 'علوم طبيعية • رياضيات • فيزياء' : (language === 'en' ? 'Natural Sciences (coeff 6) • Math • Physics' : 'SVT (coeff 6) • Maths • Physique')}
                    </div>
                  </div>
                </button>

                {/* Mathématiques */}
                <button
                  type="button"
                  id="onboarding-stream-math"
                  onClick={() => setSelectedStream('mathematiques')}
                  className={`p-4 rounded-2xl border text-start transition-all cursor-pointer relative flex flex-col justify-between ${
                    selectedStream === 'mathematiques'
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 ring-2 ring-blue-600/20 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between w-full">
                    <span className="text-2xl">📐</span>
                    {selectedStream === 'mathematiques' ? (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600" />
                    )}
                  </div>
                  <div className="mt-3">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {isArabic ? 'الرياضيات' : (language === 'en' ? 'Mathematics' : 'Mathématiques')}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {isArabic ? 'رياضيات معامل 7 • فيزياء معامل 6' : (language === 'en' ? 'Math (coeff 7) • Physics (coeff 6)' : 'Maths (coeff 7) • Physique (coeff 6)')}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            STEP 2: STUDENT DREAM
           ===================================================================== */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in-50 duration-200">
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 text-xs font-bold">
                <Compass className="w-3.5 h-3.5" />
                <span>{isArabic ? 'بوصلة الطموح' : (language === 'en' ? 'Step 2 of 4' : 'Étape 2 sur 4')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t.onboarding.step2DreamTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                {t.onboarding.step2DreamSubtitle}
              </p>
            </div>

            {/* Grid of Preset Dreams */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {PRESET_DREAMS.map((item) => {
                const isSelected = !isCustomDream && (selectedDream === item.label || selectedDream === item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedDream(item.label);
                      setIsCustomDream(false);
                    }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-500 text-purple-900 dark:text-purple-100 font-bold ring-2 ring-purple-500/20 shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/70 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium'
                    }`}
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="text-xs leading-tight line-clamp-2">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Dream Input Option */}
            <div className="pt-1 space-y-2">
              <button
                type="button"
                onClick={() => setIsCustomDream(true)}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  isCustomDream
                    ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 ring-2 ring-purple-500/20'
                    : 'border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-400 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>✏️ {t.onboarding.customDreamOption}</span>
                {isCustomDream && <Check className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
              </button>

              {isCustomDream && (
                <input
                  type="text"
                  autoFocus
                  value={customDream}
                  onChange={(e) => setCustomDream(e.target.value)}
                  placeholder={t.onboarding.dreamPlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-purple-400 dark:border-purple-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xs"
                />
              )}
            </div>
          </div>
        )}

        {/* =====================================================================
            STEP 3: STUDENT GOAL & TARGET SCORE
           ===================================================================== */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in-50 duration-200">
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                <Target className="w-3.5 h-3.5" />
                <span>{isArabic ? 'تحديد الهدف' : (language === 'en' ? 'Step 3 of 4' : 'Étape 3 sur 4')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t.onboarding.step3GoalTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                {t.onboarding.step3GoalSubtitle}
              </p>
            </div>

            {/* Target BAC Score Quick Selector */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t.onboarding.targetScoreLabel}</span>
                </span>
                <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                  {targetScore}/20
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {['16', '17', '18', '19', '20'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setTargetScore(val)}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      targetScore === val
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {val}/20
                  </button>
                ))}
              </div>
            </div>

            {/* Preset Goals List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
              {PRESET_GOALS.map((item) => {
                const isSelected = !isCustomGoal && (selectedGoal === item.label || selectedGoal === item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedGoal(item.label);
                      setIsCustomGoal(false);
                      if (item.score) setTargetScore(item.score);
                    }}
                    className={`p-2.5 rounded-xl border text-start transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-950 dark:text-emerald-100 font-bold ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/70 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg shrink-0">{item.emoji}</span>
                      <span className="truncate leading-tight">{item.label}</span>
                    </div>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Goal Input */}
            <div className="pt-1 space-y-2">
              <button
                type="button"
                onClick={() => setIsCustomGoal(true)}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  isCustomGoal
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                    : 'border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-400 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>✏️ {t.onboarding.customGoalOption}</span>
                {isCustomGoal && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              </button>

              {isCustomGoal && (
                <input
                  type="text"
                  autoFocus
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder={t.onboarding.goalPlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-emerald-400 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                />
              )}
            </div>
          </div>
        )}

        {/* =====================================================================
            STEP 4: CONFIRMATION & MOTIVATIONAL SUMMARY
           ===================================================================== */}
        {step === 4 && (
          <div className="space-y-6 text-center animate-in fade-in-50 duration-200">
            {/* Trophy Emblem */}
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
              <Sparkles className="w-8 h-8 text-amber-300 fill-amber-300" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t.onboarding.step4ConfirmTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                {t.onboarding.step4ConfirmSubtitle}
              </p>
            </div>

            {/* Personalized Blueprint Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/60 dark:from-slate-900 dark:to-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 text-start space-y-3">
              <div className="flex items-center justify-between border-b border-blue-100 dark:border-slate-800 pb-2.5">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {isArabic ? 'شعبة البكالوريا' : (language === 'en' ? 'Stream' : 'Filière')}
                </span>
                <span className="text-xs font-extrabold text-blue-700 dark:text-blue-400">
                  {selectedStream === 'sciences_experimentales'
                    ? (isArabic ? '🔬 علوم تجريبية' : (language === 'en' ? '🔬 Experimental Sciences' : '🔬 Sciences Expérimentales'))
                    : (isArabic ? '📐 رياضيات' : (language === 'en' ? '📐 Mathematics' : '📐 Mathématiques'))}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-blue-100 dark:border-slate-800 pb-2.5">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {isArabic ? 'حلمك المستقبلي' : (language === 'en' ? 'Your Dream' : 'Ton Rêve')}
                </span>
                <span className="text-xs font-extrabold text-purple-700 dark:text-purple-300 max-w-[200px] truncate text-end">
                  {resolvedDream}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-blue-100 dark:border-slate-800 pb-2.5">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {isArabic ? 'هدفك في البكالوريا' : (language === 'en' ? 'Your Target' : 'Ton Objectif')}
                </span>
                <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 max-w-[200px] truncate text-end">
                  {resolvedGoal}
                </span>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {isArabic ? 'المعدل المستهدف' : (language === 'en' ? 'Target grade' : 'Note visée')}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-xs font-mono font-extrabold">
                  {targetScore}/20
                </span>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            BOTTOM NAVIGATION BUTTONS
           ===================================================================== */}
        <div className="flex items-center gap-3 pt-2">
          {step > 1 && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleBack}
              className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              <span>{t.onboarding.backBtn}</span>
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              id="onboarding-next-btn"
              onClick={handleNext}
              className="flex-1 py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>{t.onboarding.nextBtn}</span>
              <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          ) : (
            <button
              type="button"
              id="onboarding-submit-btn"
              disabled={isSubmitting}
              onClick={handleFinalSubmit}
              className="flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Flame className="w-4 h-4 fill-amber-300 text-amber-300" />
              <span>{isSubmitting ? (isArabic ? 'جاري الحفظ...' : (language === 'en' ? 'Saving...' : 'Enregistrement...')) : t.onboarding.step4CtaDashboard}</span>
              <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
