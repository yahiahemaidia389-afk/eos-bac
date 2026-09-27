import React, { useState } from 'react';
import { ViewType, StreamType } from '../../types';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { EmptyState } from '../common/EmptyState';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface QuizPageProps {
  onNavigate: (view: ViewType, payload?: any) => void;
  currentStream: StreamType;
}

export const QuizPage: React.FC<QuizPageProps> = ({ onNavigate }) => {
  const { quizzes, subjects, role } = useContent();
  const { t, isRTL, language } = useLanguage();
  const isArabic = language === 'ar';

  const publishedQuizzes = quizzes.filter((q) => q.published);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isValidated, setIsValidated] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (publishedQuizzes.length === 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-16" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isArabic ? 'الاختبارات والتمارين التفاعلية' : (language === 'en' ? 'Quiz & Practice' : 'Quiz & Entraînement')}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              {isArabic ? 'تقييم سريع للمكتسبات وتثبيت المفاهيم' : (language === 'en' ? "Quick skills test and concept reinforcement" : "Tests d'évaluation et validation des notions")}
            </p>
          </div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold cursor-pointer"
          >
            {isArabic ? 'خروج' : (language === 'en' ? 'Exit' : 'Quitter')}
          </button>
        </div>

        <EmptyState
          title="Aucun quiz disponible pour le moment."
          arabicTitle="لا يوجد محتوى حاليا"
          description="L'administrateur publiera prochainement les séries de QCM et quiz par chapitre."
          icon="book"
          showAdminAction={role === 'admin'}
          onAdminAction={() => onNavigate('admin')}
          adminActionLabel="Créer un Quiz (Espace Admin)"
        />
      </div>
    );
  }

  const currentQuestion = publishedQuizzes[currentQuestionIndex];
  const currentSubject = subjects.find((s) => s.id === currentQuestion.subjectId);
  const subjectName = isArabic && currentSubject?.arabicName ? currentSubject.arabicName : (currentSubject?.name || 'Matière');

  const handleSelectOption = (index: number) => {
    if (isValidated) return;
    setSelectedOption(index);
  };

  const handleValidate = () => {
    if (selectedOption === null) return;
    if (selectedOption === currentQuestion.correctIndex) {
      setScore((prev) => prev + 1);
    }
    setIsValidated(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex + 1 < publishedQuizzes.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsValidated(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsValidated(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-mono font-semibold">
            <span>{subjectName}</span>
            <span>•</span>
            <span>
              {isArabic
                ? `سؤال ${currentQuestionIndex + 1} من ${publishedQuizzes.length}`
                : (language === 'en' ? `Question ${currentQuestionIndex + 1} of ${publishedQuizzes.length}` : `Question ${currentQuestionIndex + 1}/${publishedQuizzes.length}`)}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
            {currentQuestion.title}
          </h1>
        </div>

        <button
          onClick={() => onNavigate('dashboard')}
          className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold transition-colors cursor-pointer"
        >
          {isArabic ? 'خروج' : (language === 'en' ? 'Exit' : 'Quitter')}
        </button>
      </div>

      {!isFinished ? (
        <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
          {/* Question text */}
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
            {currentQuestion.question}
          </div>

          {/* Options A, B, C, D */}
          <div className="space-y-3">
            {currentQuestion.options.map((opt: string, idx: number) => {
              const letter = String.fromCharCode(65 + idx); // A, B, C, D
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQuestion.correctIndex;

              let optionStyle =
                'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-slate-100/70 dark:hover:bg-slate-900';

              if (isSelected && !isValidated) {
                optionStyle = 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-950 dark:text-white ring-1 ring-indigo-500/30';
              } else if (isValidated) {
                if (isCorrect) {
                  optionStyle = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-200';
                } else if (isSelected && !isCorrect) {
                  optionStyle = 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-950 dark:text-rose-200';
                } else {
                  optionStyle = 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 text-slate-400 dark:text-slate-500 opacity-50';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isValidated}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${optionStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center justify-center font-mono text-slate-700 dark:text-slate-300">
                      {letter}
                    </span>
                    <span className="text-xs sm:text-sm font-medium">{opt}</span>
                  </div>

                  {isValidated && (
                    <div>
                      {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                      {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Instant Feedback Explanation */}
          {isValidated && currentQuestion.explanation && (
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 text-xs text-indigo-950 dark:text-indigo-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-indigo-800 dark:text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{isArabic ? 'الشرح والتوضيح:' : (language === 'en' ? 'Explanation:' : 'Explication :')}</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{currentQuestion.explanation}</p>
            </div>
          )}

          {/* Action button: Validate or Next */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
            {!isValidated ? (
              <button
                onClick={handleValidate}
                disabled={selectedOption === null}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {isArabic ? 'تأكيد الإجابة' : (language === 'en' ? 'Submit answer' : 'Valider la réponse')}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>
                  {currentQuestionIndex + 1 < publishedQuizzes.length
                    ? (isArabic ? 'السؤال التالي' : (language === 'en' ? 'Next question' : 'Question suivante'))
                    : (isArabic ? 'عرض النتائج' : (language === 'en' ? 'View results' : 'Voir les résultats'))}
                </span>
                <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Quiz Finished Screen */
        <div className="rounded-3xl p-8 bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 text-center space-y-6 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {isArabic ? 'اكتمل الاختبار!' : (language === 'en' ? 'Quiz completed!' : 'Quiz terminé !')}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
              {isArabic ? 'نتيجتك:' : (language === 'en' ? 'Your score:' : 'Ton score :')} <span className="font-mono text-slate-900 dark:text-white font-bold">{score} / {publishedQuizzes.length}</span>
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleRestart}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isArabic ? 'إعادة المحاولة' : (language === 'en' ? 'Try again' : 'Recommencer')}</span>
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              {isArabic ? 'العودة للوحة التحكم' : (language === 'en' ? 'Back to Dashboard' : 'Retour au tableau de bord')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
