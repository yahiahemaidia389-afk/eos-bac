import React, { useState } from 'react';
import { ViewType, StreamType, Task } from '../../types';
import { initialTasks } from '../../data/mockData';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  X,
  TrendingUp,
  Sparkles,
  Layers,
  Award,
} from 'lucide-react';

interface StudyPlannerPageProps {
  onNavigate: (view: ViewType, payload?: any) => void;
  currentStream: StreamType;
}

export const StudyPlannerPage: React.FC<StudyPlannerPageProps> = ({
  onNavigate,
  currentStream,
}) => {
  const { t, isRTL, language } = useLanguage();
  const isArabic = language === 'ar';

  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedDay, setSelectedDay] = useState<Task['day']>('Lun');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState(isArabic ? 'الرياضيات' : (language === 'en' ? 'Mathematics' : 'Mathématiques'));
  const [newType, setNewType] = useState<Task['type']>('cours');
  const [newTime, setNewTime] = useState('45 min');

  const days: { key: Task['day']; label: string; full: string }[] = isArabic
    ? [
        { key: 'Lun', label: 'إثن', full: 'الإثنين' },
        { key: 'Mar', label: 'ثلا', full: 'الثلاثاء' },
        { key: 'Mer', label: 'أرب', full: 'الأربعاء' },
        { key: 'Jeu', label: 'خمي', full: 'الخميس' },
        { key: 'Ven', label: 'جمع', full: 'الجمعة' },
        { key: 'Sam', label: 'سبت', full: 'السبت' },
        { key: 'Dim', label: 'أحد', full: 'الأحد' },
      ]
    : [
        { key: 'Lun', label: 'Lun', full: 'Lundi' },
        { key: 'Mar', label: 'Mar', full: 'Mardi' },
        { key: 'Mer', label: 'Mer', full: 'Mercredi' },
        { key: 'Jeu', label: 'Jeu', full: 'Jeudi' },
        { key: 'Ven', label: 'Ven', full: 'Vendredi' },
        { key: 'Sam', label: 'Sam', full: 'Samedi' },
        { key: 'Dim', label: 'Dim', full: 'Dimanche' },
      ];

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      subject: newSubject,
      type: newType,
      day: selectedDay,
      completed: false,
      timeEstimate: newTime,
    };

    setTasks((prev) => [...prev, newTask]);
    setNewTitle('');
    setIsAddModalOpen(false);
  };

  const dayTasks = tasks.filter((t) => t.day === selectedDay);
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const overallPercentage = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
            <span>{isArabic ? 'تنظيم دراسي دقيق للبكالوريا' : (language === 'en' ? 'Rigorous BAC Study Organization' : 'Organisation Rigoureuse BAC')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isArabic ? 'جدول المذاكرة' : (language === 'en' ? 'My Study Plan' : 'Mon planning')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-1 font-medium">
            {isArabic
              ? 'نظّم أسبوعك الدراسي وحقق أهداف المراجعة اليومية باستمرار.'
              : (language === 'en' ? 'Structure your week and reach your daily study goals consistently.' : 'Structure ta semaine et atteins tes objectifs de révision quotidienne.')}
          </p>
        </div>

        {/* Add Task Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="py-3 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isArabic ? '+ إضافة مهمة' : (language === 'en' ? '+ Add task' : '+ Ajouter une tâche')}</span>
        </button>
      </div>

      {/* Completion Percentage Banner */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 dark:from-[#0c1228] dark:via-[#090d1c] dark:to-[#070914] border border-blue-600/30 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl text-white">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-300 dark:text-emerald-400">
            <TrendingUp className="w-4 h-4 text-emerald-300 dark:text-emerald-400" />
            <span>{isArabic ? 'نسبة الإنجاز الأسبوعي' : (language === 'en' ? 'Weekly completion rate' : 'Taux de complétion hebdomadaire')}</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {overallPercentage}% {isArabic ? 'مكتمل' : (language === 'en' ? 'completed' : 'accompli')}
          </div>
          <p className="text-xs text-blue-100 dark:text-slate-300 font-medium">
            {isArabic
              ? `تم إنهاء ${completedTasksCount} من إجمالي ${totalTasksCount} مهمة بنجاح هذا الأسبوع`
              : (language === 'en' ? `${completedTasksCount} of ${totalTasksCount} tasks completed successfully this week` : `${completedTasksCount} sur ${totalTasksCount} tâches terminées avec succès cette semaine`)}
          </p>
        </div>

        <div className="w-full sm:w-64 space-y-2">
          <div className="w-full bg-black/20 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
          <div className="text-[11px] text-blue-100 dark:text-slate-300 flex justify-between font-mono font-medium">
            <span>{isArabic ? 'الهدف: 100%' : (language === 'en' ? 'Goal: 100%' : 'Objectif : 100%')}</span>
            <span>{completedTasksCount} {isArabic ? 'منجزة' : (language === 'en' ? 'completed' : 'terminées')}</span>
          </div>
        </div>
      </div>

      {/* CALENDAR DAYS STRIP (Lun, Mar, Mer, Jeu, Ven, Sam, Dim) */}
      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {days.map((day) => {
          const isSelected = selectedDay === day.key;
          const tasksForDay = tasks.filter((t) => t.day === day.key);
          const doneForDay = tasksForDay.filter((t) => t.completed).length;

          return (
            <button
              key={day.key}
              onClick={() => setSelectedDay(day.key)}
              className={`p-3 sm:p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-between min-h-[90px] cursor-pointer group ${
                isSelected
                  ? 'bg-blue-50 dark:bg-indigo-950/40 border-blue-600 dark:border-indigo-400 text-blue-700 dark:text-white shadow-md ring-1 ring-blue-600/30 dark:ring-indigo-400/50'
                  : 'bg-white dark:bg-[#131B2E] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
              }`}
            >
              <span className={`text-xs font-bold uppercase tracking-wider font-mono ${isSelected ? 'text-blue-700 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`}>
                {day.label}
              </span>

              <div className="my-1">
                <span
                  className={`text-sm sm:text-base font-extrabold ${
                    isSelected ? 'text-blue-900 dark:text-indigo-200' : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {tasksForDay.length}
                </span>
                <span className={`text-[10px] block -mt-1 font-medium ${isSelected ? 'text-blue-700 dark:text-indigo-300' : 'text-slate-400 dark:text-slate-500'}`}>
                  {isArabic ? 'مهام' : (language === 'en' ? 'tasks' : 'tâches')}
                </span>
              </div>

              {/* Day completion dot */}
              <div className="flex gap-1">
                {tasksForDay.length > 0 && doneForDay === tasksForDay.length ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                ) : tasksForDay.length > 0 ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* DAILY TASKS LIST */}
      <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 space-y-6 shadow-xs transition-colors">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {isArabic
                ? `المهام المقررة ليوم ${days.find((d) => d.key === selectedDay)?.full}`
                : `Tâches prévues pour ${days.find((d) => d.key === selectedDay)?.full}`}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              {isArabic
                ? 'حدّد المهام المكتملة لتحديث مؤشر التقدم اليومي فوراً.'
                : (language === 'en' ? 'Check each task as you complete it to update your progress.' : 'Coche chaque tâche dès que tu as terminé pour actualiser ta progression.')}
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-blue-700 dark:text-indigo-300 bg-blue-50 dark:bg-indigo-500/20 px-3 py-1 rounded-xl border border-blue-200 dark:border-indigo-500/30">
            {dayTasks.filter((t) => t.completed).length} / {dayTasks.length} {isArabic ? 'منجزة' : (language === 'en' ? 'completed' : 'terminées')}
          </span>
        </div>

        {/* Task Items */}
        <div className="space-y-3">
          {dayTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 group ${
                task.completed
                  ? 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/80 text-slate-400 dark:text-slate-500 opacity-80'
                  : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-indigo-500/50 text-slate-800 dark:text-slate-100 shadow-2xs'
              }`}
            >
              <div
                onClick={() => toggleTask(task.id)}
                role="button"
                tabIndex={0}
                className="flex items-center gap-3.5 flex-1 cursor-pointer"
              >
                <div className="text-blue-600 dark:text-indigo-400 shrink-0">
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-indigo-400 transition-colors" />
                  )}
                </div>

                <div>
                  <div
                    className={`text-sm font-semibold ${
                      task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {task.title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{task.subject}</span>
                    <span className="text-slate-400">•</span>
                    <span className="flex items-center gap-1 font-mono text-slate-600 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {task.timeEstimate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Task Type Badge & Delete button */}
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg ${
                    task.type === 'cours'
                      ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/40'
                      : task.type === 'exercices'
                      ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40'
                      : task.type === 'quiz'
                      ? 'bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/40'
                      : 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40'
                  }`}
                >
                  {task.type}
                </span>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title={isArabic ? 'حذف هذه المهمة' : (language === 'en' ? 'Delete this task' : 'Supprimer cette tâche')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {dayTasks.length === 0 && (
            <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium">
              {isArabic
                ? 'لا توجد مهام مضافة لهذا اليوم. يمكنك إضافة جلسة دراسة جديدة الآن!'
                : (language === 'en' ? 'No tasks scheduled for today. Take the opportunity to add a study session or review!' : 'Aucune tâche programmée pour ce jour. Profite-en pour ajouter une séance ou réviser !')}
            </div>
          )}
        </div>
      </div>

      {/* MODAL: AJOUTER UNE TÂCHE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isArabic ? 'إضافة مهمة إلى الجدول' : (language === 'en' ? 'Add task to schedule' : 'Ajouter une tâche au planning')}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isArabic ? 'عنوان المهمة' : (language === 'en' ? 'Task title' : 'Intitulé de la tâche')}
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={isArabic ? 'مثال: حل 5 تمارين في الهندسة الفضائية' : (language === 'en' ? 'E.g.: Solve 5 solid geometry exercises' : "Ex: Résoudre 5 exercices de géométrie dans l'espace")}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isArabic ? 'المادة' : (language === 'en' ? 'Subject' : 'Matière')}
                  </label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Mathématiques">{isArabic ? 'الرياضيات' : (language === 'en' ? 'Mathematics' : 'Mathématiques')}</option>
                    <option value="Physique-Chimie">{isArabic ? 'الفيزياء والكيمياء' : (language === 'en' ? 'Physics & Chemistry' : 'Physique-Chimie')}</option>
                    <option value="SVT">{isArabic ? 'علوم الطبيعة والحياة' : (language === 'en' ? 'Natural & Life Sciences' : 'SVT')}</option>
                    <option value="Philosophie">{isArabic ? 'الفلسفة' : (language === 'en' ? 'Philosophy' : 'Philosophie')}</option>
                    <option value="Arabe">{isArabic ? 'اللغة العربية' : (language === 'en' ? 'Arabic' : 'Arabe')}</option>
                    <option value="Français">{isArabic ? 'اللغة الفرنسية' : (language === 'en' ? 'French' : 'Français')}</option>
                    <option value="Anglais">{isArabic ? 'اللغة الإنجليزية' : (language === 'en' ? 'English' : 'Anglais')}</option>
                    <option value="Histoire-Géo">{isArabic ? 'التاريخ والجغرافيا' : (language === 'en' ? 'History & Geography' : 'Histoire-Géo')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isArabic ? 'النوع' : (language === 'en' ? 'Type' : 'Type')}
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as Task['type'])}
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="cours">{isArabic ? 'درس' : (language === 'en' ? 'Lessons' : 'Cours')}</option>
                    <option value="exercices">{isArabic ? 'تمارين' : (language === 'en' ? 'Exercises' : 'Exercices')}</option>
                    <option value="quiz">{isArabic ? 'اختبار سريع' : (language === 'en' ? 'Quiz' : 'Quiz')}</option>
                    <option value="revision">{isArabic ? 'مراجعة' : (language === 'en' ? 'Revision' : 'Révision')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isArabic ? 'اليوم' : (language === 'en' ? 'Day' : 'Jour')}
                  </label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value as Task['day'])}
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {days.map((d) => (
                      <option key={d.key} value={d.key}>
                        {d.full}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isArabic ? 'المدة المقدرة' : (language === 'en' ? 'Estimated duration' : 'Durée estimée')}
                  </label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="Ex: 45 min"
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  {isArabic ? 'إلغاء' : (language === 'en' ? 'Cancel' : 'Annuler')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                >
                  {isArabic ? 'حفظ' : (language === 'en' ? 'Save' : 'Enregistrer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
