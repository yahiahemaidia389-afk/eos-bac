import React, { useState } from 'react';
import { ViewType, StreamType, ChatMessage } from '../../types';
import { sampleChatMessages } from '../../data/mockData';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  Send,
  Bot,
  User,
  PlusCircle,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Copy,
  Check,
  RotateCcw,
  Compass,
  ArrowRight,
  Trophy,
  Clock,
  LayoutDashboard,
  FileCheck2,
} from 'lucide-react';

// ==============================================================================
// AI FEATURE FLAG (Temporarily disabled pending specialized BAC redevelopment)
// ==============================================================================
// Set to false to show the Coming Soon announcement and prevent requests to Gemini.
// All chat code, state hooks, and handlers remain 100% preserved.
const AI_ENABLED = false;

interface AiAssistantPageProps {
  onNavigate: (view: ViewType, payload?: any) => void;
  currentStream: StreamType;
}

export const AiAssistantPage: React.FC<AiAssistantPageProps> = ({
  onNavigate,
  currentStream,
}) => {
  const { t, isRTL, language } = useLanguage();
  const { currentUser } = useAuth();
  const isArabic = language === 'ar';

  const [messages, setMessages] = useState<ChatMessage[]>(sampleChatMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<
    'conversation' | 'explication' | 'exercices' | 'resume' | 'conseils'
  >('conversation');

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const abortControllerRef = React.useRef<AbortController | null>(null);

  const handleSendMessage = async (textToSend?: string) => {
    // Strict safety lock: prevent any request when AI is disabled
    if (!AI_ENABLED) return;

    const text = (textToSend || inputValue).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const aiMsgId = `ai-${Date.now()}`;
    const initialAiMsg: ChatMessage = {
      id: aiMsgId,
      sender: 'ai',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg, initialAiMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6),
          currentStream,
          language,
          mode: activeMode,
          studentProfile: currentUser ? {
            fullName: currentUser.full_name,
            dream: currentUser.dream,
            goal: currentUser.goal,
            targetScore: currentUser.target_score,
            studyFocus: currentUser.study_focus,
          } : undefined,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        let errMessage = isArabic ? 'حدث خطأ أثناء معالجة الطلب.' : (language === 'en' ? 'An error occurred while communicating with the server.' : 'Une erreur est survenue lors de la communication avec le serveur.');
        try {
          const errData = await response.json();
          if (errData.error) errMessage = errData.error;
        } catch {}
        throw new Error(errMessage);
      }

      if (!response.body) {
        throw new Error('Streaming response body is unavailable.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const payload = trimmed.replace(/^data:\s*/, '');
          if (payload === '[DONE]') break;

          try {
            const parsed = JSON.parse(payload);
            if (parsed.text) {
              accumulatedText += parsed.text;
              setMessages((prev) =>
                prev.map((m) => (m.id === aiMsgId ? { ...m, text: accumulatedText } : m))
              );
            }
          } catch {}
        }
      }

      // If finished with empty text, provide fallback
      if (!accumulatedText.trim()) {
        const fallbackText = isArabic
          ? 'تم استلام سؤالك. راجع المفاهيم الأساسية للدرس ونظم خطوات البرهان لضمان العلامة الكاملة.'
          : (language === 'en' ? 'Your question was received. Make sure to structure your calculation steps clearly for the BAC.' : 'Ta question a été prise en compte. Veille à bien structurer tes étapes de calcul pour le BAC.');
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, text: fallbackText } : m))
        );
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      const errorNotice = err?.message || (isArabic ? 'تعذر الاتصال بالمساعد الذكي.' : (language === 'en' ? 'Unable to contact AI assistant.' : 'Impossible de contacter l’assistant IA.'));
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? {
                ...m,
                text: isArabic
                  ? `عذرًا: ${errorNotice}\n\nيرجى إعادة المحاولة أو التحقق من الاتصال بالإنترنت.`
                  : `Désolé : ${errorNotice}\n\nVeuillez réessayer ou vérifier votre connexion internet.`,
              }
            : m
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleModeClick = (mode: typeof activeMode, defaultPrompt: string) => {
    setActiveMode(mode);
    handleSendMessage(defaultPrompt);
  };

  const handleNewConversation = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text: isArabic
          ? "تم بدء محادثة جديدة. ما هو المفهوم أو التمرين أو المسألة التي تريد مناقشتها والتدرب عليها؟"
          : (language === 'en' ? "New assistance session started. What concept or problem would you like to discuss?" : "Nouvelle session d'assistance démarrée. Quelle notion, exercice ou démonstration du BAC souhaites-tu travailler ensemble ?"),
        suggestions: [
          isArabic ? "اشرح لي مبرهنة القيم المتوسطة" : (language === 'en' ? "Explain the Intermediate Value Theorem" : "Explique-moi le Théorème des Valeurs Intermédiaires"),
          isArabic ? "كيفية حل معادلة تفاضلية في الفيزياء؟" : (language === 'en' ? "How to solve a differential equation in Physics?" : "Comment résoudre une équation différentielle en Physique ?"),
          isArabic ? "نصائح وإرشادات لمنهجية الإجابة" : (language === 'en' ? "Tips and guidance for answering methodology" : "Conseils pour rédiger l'épreuve de Philosophie")
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="space-y-6 pb-16" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isArabic ? 'المساعد الذكي للبكالوريا' : (language === 'en' ? 'AI Assistant' : 'Assistant IA')}
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white uppercase tracking-wider">
              Beta
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
            {isArabic
              ? 'مساعدك الشخصي للفهم والتحليل وليس الحفظ السطحي فقط'
              : (language === 'en' ? 'Your assistant to understand, not just memorize.' : 'Ton assistant pour comprendre, pas seulement mémoriser.')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            {isArabic ? 'مخصص لشعبة:' : (language === 'en' ? 'Calibrated for:' : 'Calibré sur :')}{' '}
            <span className="text-blue-600 dark:text-blue-400 font-bold">
              {currentStream === 'sciences_experimentales'
                ? (isArabic ? 'علوم تجريبية' : (language === 'en' ? 'Experimental Sciences' : 'Sciences Expérimentales'))
                : (isArabic ? 'رياضيات' : (language === 'en' ? 'Mathematics' : 'Mathématiques'))}
            </span>
          </span>
        </div>
      </div>

      {/* 1. Coming Soon Notification Screen (Active when AI is temporarily disabled) */}
      {!AI_ENABLED && (
        <div className="rounded-3xl p-6 sm:p-10 lg:p-12 bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors text-center relative overflow-hidden">
          {/* Ambient decorative glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-blue-500/10 dark:from-indigo-500/15 dark:via-purple-500/15 dark:to-blue-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-2xl mx-auto space-y-6">
            {/* Status Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold tracking-wide">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {isArabic
                  ? 'قريبًا — ميزة قيد التطوير والتخصيص'
                  : language === 'en'
                  ? 'Coming Soon — Specialized Feature in Development'
                  : 'Bientôt disponible — En cours de développement'}
              </span>
            </div>

            {/* Main Headline & Description */}
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {isArabic
                  ? 'مساعد EOS BAC AI سيكون متاحًا قريبًا'
                  : language === 'en'
                  ? 'EOS BAC AI will be available soon'
                  : 'EOS BAC AI sera bientôt disponible'}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto">
                {isArabic
                  ? 'مساعد الذكاء الاصطناعي قيد التطوير حاليًا وسيكون متاحًا قريبًا لمرافقتكم بشروحات منهجية وتدريبات مخصصة للبكالوريا الجزائرية.'
                  : language === 'en'
                  ? 'Our AI assistant is currently being prepared. It will be available soon to assist you with curriculum-calibrated explanations and exam methods.'
                  : 'Notre assistant IA est actuellement en préparation. Il sera bientôt disponible pour vous accompagner avec des explications méthodologiques conformes au programme algérien.'}
              </p>
            </div>

            {/* 3 Pillars / Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left" dir={isRTL ? 'rtl' : 'ltr'}>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {isArabic ? 'منهجية دقيقة للبكالوريا' : language === 'en' ? 'BAC DZ Methodology' : 'Méthodologie BAC DZ'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {isArabic
                    ? 'توجيه خطوة بخطوة وفق السلم والتصحيح الرسمي المعتمد وزارياً.'
                    : language === 'en'
                    ? 'Step-by-step guidance aligned with the official national grading scale.'
                    : 'Guidage pas à pas selon les exigences du barème officiel.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {isArabic ? 'حلول نموذجية وتوضيحات' : language === 'en' ? 'Step-by-Step Solving' : 'Résolution Structurée'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {isArabic
                    ? 'المساعدة في تفكيك مسائل الرياضيات والفيزياء دون حرق الحل المباشر.'
                    : language === 'en'
                    ? 'Breaking down math and science exercises without spoiling answers.'
                    : 'Aide à la décomposition des énoncés sans donner la réponse brute.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {isArabic ? 'توافق تام مع المنهاج 3AS' : language === 'en' ? 'Official Curriculum' : 'Programme Officiel 3AS'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {isArabic
                    ? 'مُعاير خصيصًا لشعبتي العلوم التجريبية والرياضيات دورة 2026.'
                    : language === 'en'
                    ? 'Calibrated for Experimental Sciences and Mathematics streams.'
                    : 'Spécialement calibré sur les filières Sciences Expérimentales et Mathématiques.'}
                </p>
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>
                  {isArabic
                    ? 'العودة للوحة التحكم'
                    : language === 'en'
                    ? 'Back to Dashboard'
                    : 'Retour au tableau de bord'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('subjects')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-[0.98] text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border border-slate-200/80 dark:border-slate-700/60"
              >
                <BookOpen className="w-4 h-4" />
                <span>
                  {isArabic
                    ? 'تصفح المواد والدروس'
                    : language === 'en'
                    ? 'Browse Lessons'
                    : 'Explorer les cours'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('bac-exams')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-[0.98] text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border border-slate-200/80 dark:border-slate-700/60"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>
                  {isArabic
                    ? 'حوليات ومواضيع البكالوريا'
                    : language === 'en'
                    ? 'Past BAC Exams'
                    : 'Annales & Sujets BAC'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Two-Column AI Workspace (Preserved for future activation) */}
      {AI_ENABLED && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        
        {/* SIDEBAR: Topics & Modes */}
        <div className="lg:col-span-4 rounded-3xl p-5 bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-xs h-fit space-y-4 transition-colors">
          <button
            onClick={handleNewConversation}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isArabic ? 'محادثة جديدة' : (language === 'en' ? 'New conversation' : 'Nouvelle conversation')}</span>
          </button>

          <div className="space-y-1 text-xs">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-3 py-1 uppercase tracking-wider">
              {isArabic ? 'أنماط المساعدة' : (language === 'en' ? "Assistance modes" : "Modes d'apprentissage")}
            </div>

            <button
              onClick={() => handleModeClick('explication', isArabic ? "اشرح لي طريقة الاشتقاق بشكل مبسط ومفهوم." : (language === 'en' ? "Explain differentiation method step by step." : "Explique-moi la méthode de dérivation d'une manière simple et intuitive."))}
              className={`w-full p-3 rounded-xl text-left flex items-center gap-3 transition-colors cursor-pointer ${
                activeMode === 'explication'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/30 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <Lightbulb className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">{isArabic ? 'شرح المفاهيم' : (language === 'en' ? 'Explanations' : 'Explications')}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {isArabic ? 'استيعاب المعنى الهندسي والتطبيقي للنظريات' : (language === 'en' ? 'Understand the intuitive meaning of theorems' : 'Comprendre le sens intuitif des théorèmes')}
                </div>
              </div>
            </button>

            <button
              onClick={() => handleModeClick('exercices', isArabic ? "ساعدني في حل تمرين نموذجي حول المتتاليات العددية." : (language === 'en' ? "Help me solve a typical BAC exercise on geometric sequences." : "Aide-moi à résoudre un exercice type BAC sur les suites géométriques."))}
              className={`w-full p-3 rounded-xl text-left flex items-center gap-3 transition-colors cursor-pointer ${
                activeMode === 'exercices'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/30 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">{isArabic ? 'حل التمارين خطوة بخطوة' : (language === 'en' ? "Step-by-step exercise solving" : "Résolution d'exercices")}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {isArabic ? 'توجيه منهجي تدريجي دون حرق الحل' : (language === 'en' ? 'Step-by-step guidance without spoiling the solution' : 'Guider pas à pas sans donner la réponse brute')}
                </div>
              </div>
            </button>

            <button
              onClick={() => handleModeClick('resume', isArabic ? "لخص لي أهم قوانين درس الكهرباء RC و RL." : (language === 'en' ? "Give me a condensed summary of RC and RL electrical circuits." : "Fais-moi un résumé condensé du cours d'électrocinétique (RC et RL)."))}
              className={`w-full p-3 rounded-xl text-left flex items-center gap-3 transition-colors cursor-pointer ${
                activeMode === 'resume'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/30 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <BookOpen className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">{isArabic ? 'ملخصات الدروس' : (language === 'en' ? 'Lesson summary' : 'Résumé de cours')}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {isArabic ? 'بطاقات مراجعة سريعة والقوانين الأساسية' : (language === 'en' ? 'Quick revision sheets and core formulas' : 'Fiches de révision express et formules clés')}
                </div>
              </div>
            </button>

            <button
              onClick={() => handleModeClick('conseils', isArabic ? "ما هي أهم النصائح لإدارة الوقت في الامتحان؟" : (language === 'en' ? "What are the best tips for managing time during BAC exams?" : "Quels sont les meilleurs conseils pour gérer son temps lors des épreuves du BAC ?"))}
              className={`w-full p-3 rounded-xl text-left flex items-center gap-3 transition-colors cursor-pointer ${
                activeMode === 'conseils'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/30 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <Compass className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">{isArabic ? 'نصائح وتوجيهات' : (language === 'en' ? 'Tips & Advice' : 'Conseils')}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {isArabic ? 'منهجية ورقة الإجابة والتحكم في التوتر' : (language === 'en' ? "Exam answering methodology and stress management" : "Méthodologie d'épreuve et gestion du stress")}
                </div>
              </div>
            </button>
          </div>

          {/* Assistant Note */}
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
            <div className="text-indigo-800 dark:text-indigo-300 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{isArabic ? 'ضمان بيداغوجي' : (language === 'en' ? 'Educational Assurance' : 'Garantie Pédagogique')}</span>
            </div>
            <p className="leading-relaxed">
              {isArabic
                ? 'يعتمد المساعد طريقة سقراط التفاعلية: يطرح أسئلة توجيهية لتمكينك من استنتاج الحل بنفسك وترسيخه في الذاكرة.'
                : "L'IA EOS BAC applique la méthode socratique : elle t'amène à déduire la solution pour consolider ta mémoire à long terme."}
            </p>
          </div>

          {/* Student Goal Personalization Card */}
          {(currentUser?.dream || currentUser?.goal || currentUser?.target_score) && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border border-purple-200/80 dark:border-purple-800/40 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
              <div className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{isArabic ? 'تخصيص المساعد لأهدافك' : (language === 'en' ? 'Personalized Assistant' : 'Assistant Personnalisé')}</span>
              </div>
              <div className="text-slate-600 dark:text-slate-300 leading-snug">
                {currentUser?.dream && <span className="font-semibold text-purple-900 dark:text-purple-200">✨ {currentUser.dream}</span>}
                {currentUser?.target_score && (
                  <span className="ml-1 font-mono text-blue-600 dark:text-blue-400 font-bold">({currentUser.target_score}/20)</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* CHAT INTERFACE */}
        <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between overflow-hidden transition-colors">
          
          {/* Chat Messages Log */}
          <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto max-h-[580px]">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 text-left ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      isUser
                        ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-xs'
                        : 'bg-indigo-50 dark:bg-[#131B2E] border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-3 relative group ${
                      isUser
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {!msg.text && isTyping && !isUser ? (
                      <div className="flex items-center gap-1.5 py-1 text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                        <span className="text-[11px] font-medium ms-1">
                          {isArabic ? 'جاري التحليل والصياغة...' : (language === 'en' ? 'Educational analysis in progress...' : 'Analyse pédagogique en cours...')}
                        </span>
                      </div>
                    ) : (
                      <div className="leading-relaxed whitespace-pre-wrap font-sans">
                        {msg.text}
                        {isTyping && !isUser && msg.id === messages[messages.length - 1]?.id && (
                          <span className="inline-block w-1.5 h-3.5 bg-indigo-600 dark:bg-indigo-400 ms-1 animate-pulse align-middle" />
                        )}
                      </div>
                    )}

                    {/* Formula snippet if provided */}
                    {msg.formula && (
                      <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#050814] border border-indigo-200 dark:border-indigo-500/30 font-mono text-indigo-700 dark:text-cyan-300 text-xs sm:text-sm overflow-x-auto">
                        {msg.formula}
                      </div>
                    )}

                    {/* Bullet Points */}
                    {msg.points && msg.points.length > 0 && (
                      <div className="space-y-1.5 pt-1 border-t border-slate-200 dark:border-slate-700/60">
                        {msg.points.map((pt: string, idx: number) => (
                          <div key={idx} className="text-slate-700 dark:text-slate-300 text-xs flex items-start gap-2">
                            <span className="text-indigo-500 dark:text-indigo-400 shrink-0 font-bold">•</span>
                            <span dangerouslySetInnerHTML={{ __html: pt.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 dark:text-white font-semibold">$1</strong>') }} />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Copy action & Timestamp */}
                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 dark:text-slate-400">
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copié</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copier</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Suggested follow-up chips */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 space-y-1.5">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          {isArabic ? 'أسئلة مقترحة:' : (language === 'en' ? 'Suggested questions:' : 'Questions suggérées :')}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggestions.map((sug: string, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => handleSendMessage(sug)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-500/25 text-[11px] text-indigo-700 dark:text-indigo-300 text-left transition-colors cursor-pointer"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-[#131B2E] border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 font-medium">
                    {isArabic ? 'المساعد يجهز الإجابة...' : (language === 'en' ? "Assistant is preparing the answer..." : "L'assistant prépare sa réponse pédagogique...")}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-50/70 dark:bg-[#080d1a] border-t border-slate-200 dark:border-slate-800 transition-colors">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isArabic ? 'اطرح سؤالك حول البرنامج أو التمارين...' : (language === 'en' ? "Ask your question about the curriculum (e.g., How to differentiate ln(x)?)..." : "Pose ta question sur le programme (ex: Comment dériver ln(x) ?)...")}
                className="flex-1 py-3 px-4 text-xs sm:text-sm rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />

              <button
                type="submit"
                disabled={!inputValue.trim()}
                className={`p-3 rounded-2xl text-white transition-all ${
                  inputValue.trim()
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md shadow-indigo-600/20 hover:opacity-90 cursor-pointer'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                }`}
              >
                <Send className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            </form>

            <div className="mt-2 text-[10px] text-center text-slate-500 dark:text-slate-400">
              {isArabic
                ? 'يعتمد المساعد بدقة على المناهج الوزارية والكتب المدرسية الرسمية 2026/2027.'
                : (language === 'en' ? "The assistant strictly relies on official ministerial curricula and 2026/2027 textbooks." : "L'IA EOS BAC s'appuie strictement sur les manuels scolaires et les arrêtés ministériels 2026/2027.")}
            </div>
          </div>

        </div>

      </div>
      )}
    </div>
  );
};
