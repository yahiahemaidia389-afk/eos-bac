import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Subject,
  Chapter,
  Lesson,
  Exercise,
  Summary,
  BacExam,
  QuizItem,
  Task,
  StreamType,
  UserProfile,
} from '../types';

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'maths',
    name: 'Mathématiques',
    arabicName: 'الرياضيات',
    streams: ['sciences_experimentales', 'mathematiques'],
    coefficient: {
      sciences_experimentales: 5,
      mathematiques: 7,
    },
    iconName: 'Calculator',
    color: '#6366f1',
    description: 'Analyse, fonctions, suites numériques, géométrie et probabilités.',
  },
  {
    id: 'physique',
    name: 'Physique-Chimie',
    arabicName: 'العلوم الفيزيائية',
    streams: ['sciences_experimentales', 'mathematiques'],
    coefficient: {
      sciences_experimentales: 6,
      mathematiques: 6,
    },
    iconName: 'Atom',
    color: '#3b82f6',
    description: 'Mécanique, électricité, transformations chimiques et nucléaire.',
  },
  {
    id: 'svt',
    name: 'SVT',
    arabicName: 'علوم الطبيعة والحياة',
    streams: ['sciences_experimentales'],
    coefficient: {
      sciences_experimentales: 6,
      mathematiques: 0,
    },
    iconName: 'Dna',
    color: '#10b981',
    description: 'Immunologie, communication nerveuse, synthèse des protéines et génétique.',
  },
  {
    id: 'philo',
    name: 'Philosophie',
    arabicName: 'الفلسفة',
    streams: ['sciences_experimentales', 'mathematiques'],
    coefficient: {
      sciences_experimentales: 2,
      mathematiques: 2,
    },
    iconName: 'Compass',
    color: '#ec4899',
    description: 'Épistémologie scientifique, logique, vérité, morale et société.',
  },
  {
    id: 'arabe',
    name: 'Arabe',
    arabicName: 'اللغة العربية وآدابها',
    streams: ['sciences_experimentales', 'mathematiques'],
    coefficient: {
      sciences_experimentales: 3,
      mathematiques: 3,
    },
    iconName: 'arabe',
    color: '#f59e0b',
    description: 'Poésie engagée, prose littéraire, analyse de textes et rhétorique.',
  },
  {
    id: 'francais',
    name: 'Français',
    arabicName: 'اللغة الفرنسية',
    streams: ['sciences_experimentales', 'mathematiques'],
    coefficient: {
      sciences_experimentales: 2,
      mathematiques: 2,
    },
    iconName: 'Languages',
    color: '#06b6d4',
    description: 'Texte d’histoire, texte argumentatif, compte-rendu objectif et critique.',
  },
  {
    id: 'anglais',
    name: 'Anglais',
    arabicName: 'اللغة الإنجليزية',
    streams: ['sciences_experimentales', 'mathematiques'],
    coefficient: {
      sciences_experimentales: 2,
      mathematiques: 2,
    },
    iconName: 'Globe',
    color: '#8b5cf6',
    description: 'Grammaire, vocabulaire thématique, compréhension écrite et expression.',
  },
  {
    id: 'histoire-geo',
    name: 'Histoire-Géographie',
    arabicName: 'التاريخ والجغرافيا',
    streams: ['sciences_experimentales', 'mathematiques'],
    coefficient: {
      sciences_experimentales: 2,
      mathematiques: 2,
    },
    iconName: 'Map',
    color: '#eab308',
    description: 'Guerre Froide, Révolution Algérienne 1954-1962 et géographie mondiale.',
  },
  {
    id: 'islamique',
    name: 'Éducation Islamique',
    arabicName: 'العلوم الإسلامية',
    streams: ['sciences_experimentales', 'mathematiques'],
    coefficient: {
      sciences_experimentales: 2,
      mathematiques: 2,
    },
    iconName: 'BookOpen',
    color: '#14b8a6',
    description: 'Sources de législation, valeurs coraniques et éthique personnelle.',
  },
];

const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'Réviser les théorèmes de Mathématiques',
    subject: 'Mathématiques',
    day: 'Lun',
    completed: true,
    timeEstimate: '45 min',
  },
  {
    id: 't-2',
    title: 'Faire des fiches en Physique-Chimie',
    subject: 'Physique-Chimie',
    day: 'Mar',
    completed: false,
    timeEstimate: '1h',
  },
  {
    id: 't-3',
    title: 'Lecture du cours de Philosophie',
    subject: 'Philosophie',
    day: 'Mer',
    completed: false,
    timeEstimate: '30 min',
  },
];

interface ContentContextType {
  subjects: Subject[];
  chapters: Chapter[];
  lessons: Lesson[];
  exercises: Exercise[];
  bacExams: BacExam[];
  quizzes: QuizItem[];
  tasks: Task[];
  userProfile: UserProfile;
  currentStream: StreamType;
  role: 'student' | 'admin';
  setRole: (role: 'student' | 'admin') => void;
  setCurrentStream: (stream: StreamType) => void;
  
  // Chapter CRUD
  addChapter: (chapter: Omit<Chapter, 'id'>) => void;
  updateChapter: (id: string, chapter: Partial<Chapter>) => void;
  deleteChapter: (id: string) => void;
  togglePublishChapter: (id: string) => void;

  // Lesson CRUD
  addLesson: (lesson: Omit<Lesson, 'id' | 'createdAt'>) => void;
  updateLesson: (id: string, lesson: Partial<Lesson>) => void;
  deleteLesson: (id: string) => void;
  togglePublishLesson: (id: string) => void;
  toggleLessonCompleted: (id: string) => void;

  // Exercise CRUD
  addExercise: (exercise: Omit<Exercise, 'id' | 'createdAt'>) => void;
  updateExercise: (id: string, exercise: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;
  togglePublishExercise: (id: string) => void;
  toggleExerciseCompleted: (id: string) => void;

  // Summary CRUD
  summaries: Summary[];
  addSummary: (summary: Omit<Summary, 'id' | 'createdAt'>) => void;
  updateSummary: (id: string, summary: Partial<Summary>) => void;
  deleteSummary: (id: string) => void;
  togglePublishSummary: (id: string) => void;

  // BAC Exam CRUD
  addBacExam: (exam: Omit<BacExam, 'id' | 'createdAt'>) => void;
  updateBacExam: (id: string, exam: Partial<BacExam>) => void;
  deleteBacExam: (id: string) => void;
  togglePublishBacExam: (id: string) => void;

  // Quiz CRUD
  addQuiz: (quiz: Omit<QuizItem, 'id' | 'createdAt'>) => void;
  updateQuiz: (id: string, quiz: Partial<QuizItem>) => void;
  deleteQuiz: (id: string) => void;
  togglePublishQuiz: (id: string) => void;

  // Task CRUD
  addTask: (task: Omit<Task, 'id'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStream, setCurrentStream] = useState<StreamType>(() => {
    const saved = localStorage.getItem('eosbac_stream') || localStorage.getItem('bacnext_stream');
    return (saved as StreamType) || 'sciences_experimentales';
  });

  const [role, setRole] = useState<'student' | 'admin'>(() => {
    const saved = localStorage.getItem('eosbac_role') || localStorage.getItem('bacnext_role');
    return (saved as 'student' | 'admin') || 'student';
  });

  const [subjects] = useState<Subject[]>(INITIAL_SUBJECTS);

  // Chapters: starts empty so student sees clean empty state
  const [chapters, setChapters] = useState<Chapter[]>(() => {
    const saved = localStorage.getItem('eosbac_chapters') || localStorage.getItem('bacnext_chapters');
    return saved ? JSON.parse(saved) : [];
  });

  // Lessons: starts empty so student sees clean empty state
  const [lessons, setLessons] = useState<Lesson[]>(() => {
    const saved = localStorage.getItem('eosbac_lessons') || localStorage.getItem('bacnext_lessons');
    return saved ? JSON.parse(saved) : [];
  });

  // Exercises: starts empty so student sees clean empty state
  const [exercises, setExercises] = useState<Exercise[]>(() => {
    const saved = localStorage.getItem('eosbac_exercises') || localStorage.getItem('bacnext_exercises');
    return saved ? JSON.parse(saved) : [];
  });

  // Summaries: starts empty so student sees clean empty state
  const [summaries, setSummaries] = useState<Summary[]>(() => {
    const saved = localStorage.getItem('eosbac_summaries') || localStorage.getItem('bacnext_summaries');
    return saved ? JSON.parse(saved) : [];
  });

  // BAC Exams: starts empty so student sees clean empty state
  const [bacExams, setBacExams] = useState<BacExam[]>(() => {
    const saved = localStorage.getItem('eosbac_bacExams') || localStorage.getItem('bacnext_bacExams');
    return saved ? JSON.parse(saved) : [];
  });

  // Quizzes: starts empty so student sees clean empty state
  const [quizzes, setQuizzes] = useState<QuizItem[]>(() => {
    const saved = localStorage.getItem('eosbac_quizzes') || localStorage.getItem('bacnext_quizzes');
    return saved ? JSON.parse(saved) : [];
  });

  // Tasks
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('eosbac_tasks') || localStorage.getItem('bacnext_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  // User profile
  const userProfile: UserProfile = {
    name: 'Yaya',
    role,
    overallProgress: 68,
    streakDays: 7,
    daysToBac: 268,
    currentStream,
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('eosbac_stream', currentStream);
    localStorage.setItem('bacnext_stream', currentStream);
  }, [currentStream]);

  useEffect(() => {
    localStorage.setItem('eosbac_role', role);
    localStorage.setItem('bacnext_role', role);
  }, [role]);

  useEffect(() => {
    const val = JSON.stringify(chapters);
    localStorage.setItem('eosbac_chapters', val);
    localStorage.setItem('bacnext_chapters', val);
  }, [chapters]);

  useEffect(() => {
    const val = JSON.stringify(lessons);
    localStorage.setItem('eosbac_lessons', val);
    localStorage.setItem('bacnext_lessons', val);
  }, [lessons]);

  useEffect(() => {
    const val = JSON.stringify(exercises);
    localStorage.setItem('eosbac_exercises', val);
    localStorage.setItem('bacnext_exercises', val);
  }, [exercises]);

  useEffect(() => {
    const val = JSON.stringify(summaries);
    localStorage.setItem('eosbac_summaries', val);
    localStorage.setItem('bacnext_summaries', val);
  }, [summaries]);

  useEffect(() => {
    const val = JSON.stringify(bacExams);
    localStorage.setItem('eosbac_bacExams', val);
    localStorage.setItem('bacnext_bacExams', val);
  }, [bacExams]);

  useEffect(() => {
    const val = JSON.stringify(quizzes);
    localStorage.setItem('eosbac_quizzes', val);
    localStorage.setItem('bacnext_quizzes', val);
  }, [quizzes]);

  useEffect(() => {
    const val = JSON.stringify(tasks);
    localStorage.setItem('eosbac_tasks', val);
    localStorage.setItem('bacnext_tasks', val);
  }, [tasks]);

  // Chapter CRUD
  const addChapter = (data: Omit<Chapter, 'id'>) => {
    const newChap: Chapter = { ...data, id: `chap-${Date.now()}` };
    setChapters((prev) => [...prev, newChap]);
  };

  const updateChapter = (id: string, data: Partial<Chapter>) => {
    setChapters((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  };

  const deleteChapter = (id: string) => {
    setChapters((prev) => prev.filter((c) => c.id !== id));
    setLessons((prev) => prev.filter((l) => l.chapterId !== id));
  };

  const togglePublishChapter = (id: string) => {
    setChapters((prev) => prev.map((c) => (c.id === id ? { ...c, published: !c.published } : c)));
  };

  // Lesson CRUD
  const addLesson = (data: Omit<Lesson, 'id' | 'createdAt'>) => {
    const newLesson: Lesson = {
      ...data,
      id: `lesson-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('fr-DZ'),
    };
    setLessons((prev) => [...prev, newLesson]);
  };

  const updateLesson = (id: string, data: Partial<Lesson>) => {
    setLessons((prev) => prev.map((l) => (l.id === id ? { ...l, ...data } : l)));
  };

  const deleteLesson = (id: string) => {
    setLessons((prev) => prev.filter((l) => l.id !== id));
  };

  const togglePublishLesson = (id: string) => {
    setLessons((prev) => prev.map((l) => (l.id === id ? { ...l, published: !l.published } : l)));
  };

  const toggleLessonCompleted = (id: string) => {
    setLessons((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isCompleted: !l.isCompleted } : l))
    );
  };

  // Exercise CRUD
  const addExercise = (data: Omit<Exercise, 'id' | 'createdAt'>) => {
    const newEx: Exercise = {
      ...data,
      id: `ex-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('fr-DZ'),
    };
    setExercises((prev) => [...prev, newEx]);
  };

  const updateExercise = (id: string, data: Partial<Exercise>) => {
    setExercises((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
  };

  const deleteExercise = (id: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== id));
  };

  const togglePublishExercise = (id: string) => {
    setExercises((prev) => prev.map((e) => (e.id === id ? { ...e, published: !e.published } : e)));
  };

  const toggleExerciseCompleted = (id: string) => {
    setExercises((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isCompleted: !e.isCompleted } : e))
    );
  };

  // Summary CRUD
  const addSummary = (data: Omit<Summary, 'id' | 'createdAt'>) => {
    const newSummary: Summary = {
      ...data,
      id: `sum-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('fr-DZ'),
    };
    setSummaries((prev) => [...prev, newSummary]);
  };

  const updateSummary = (id: string, data: Partial<Summary>) => {
    setSummaries((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  };

  const deleteSummary = (id: string) => {
    setSummaries((prev) => prev.filter((s) => s.id !== id));
  };

  const togglePublishSummary = (id: string) => {
    setSummaries((prev) => prev.map((s) => (s.id === id ? { ...s, published: !s.published } : s)));
  };

  // BAC Exam CRUD
  const addBacExam = (data: Omit<BacExam, 'id' | 'createdAt'>) => {
    const newExam: BacExam = {
      ...data,
      id: `bac-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('fr-DZ'),
    };
    setBacExams((prev) => [...prev, newExam]);
  };

  const updateBacExam = (id: string, data: Partial<BacExam>) => {
    setBacExams((prev) => prev.map((b) => (b.id === id ? { ...b, ...data } : b)));
  };

  const deleteBacExam = (id: string) => {
    setBacExams((prev) => prev.filter((b) => b.id !== id));
  };

  const togglePublishBacExam = (id: string) => {
    setBacExams((prev) => prev.map((b) => (b.id === id ? { ...b, published: !b.published } : b)));
  };

  // Quiz CRUD
  const addQuiz = (data: Omit<QuizItem, 'id' | 'createdAt'>) => {
    const newQuiz: QuizItem = {
      ...data,
      id: `quiz-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('fr-DZ'),
    };
    setQuizzes((prev) => [...prev, newQuiz]);
  };

  const updateQuiz = (id: string, data: Partial<QuizItem>) => {
    setQuizzes((prev) => prev.map((q) => (q.id === id ? { ...q, ...data } : q)));
  };

  const deleteQuiz = (id: string) => {
    setQuizzes((prev) => prev.filter((q) => q.id !== id));
  };

  const togglePublishQuiz = (id: string) => {
    setQuizzes((prev) => prev.map((q) => (q.id === id ? { ...q, published: !q.published } : q)));
  };

  // Task CRUD
  const addTask = (data: Omit<Task, 'id'>) => {
    const newTask: Task = { ...data, id: `task-${Date.now()}` };
    setTasks((prev) => [...prev, newTask]);
  };

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ContentContext.Provider
      value={{
        subjects,
        chapters,
        lessons,
        exercises,
        bacExams,
        quizzes,
        tasks,
        userProfile,
        currentStream,
        role,
        setRole,
        setCurrentStream,
        addChapter,
        updateChapter,
        deleteChapter,
        togglePublishChapter,
        addLesson,
        updateLesson,
        deleteLesson,
        togglePublishLesson,
        toggleLessonCompleted,
        addExercise,
        updateExercise,
        deleteExercise,
        togglePublishExercise,
        toggleExerciseCompleted,
        summaries,
        addSummary,
        updateSummary,
        deleteSummary,
        togglePublishSummary,
        addBacExam,
        updateBacExam,
        deleteBacExam,
        togglePublishBacExam,
        addQuiz,
        updateQuiz,
        deleteQuiz,
        togglePublishQuiz,
        addTask,
        toggleTask,
        deleteTask,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = (): ContentContextType => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
