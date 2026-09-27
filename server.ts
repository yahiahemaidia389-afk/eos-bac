import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==============================================================================
// AI FEATURE FLAG (Temporarily disabled pending specialized BAC redevelopment)
// ==============================================================================
// Set to false by default to completely block Gemini calls and prevent consumption.
// All RAG knowledge, prompts, rate limiting, and services remain 100% preserved.
const AI_ENABLED = process.env.AI_ENABLED === 'true';

// Initialize Google GenAI SDK (Server-Side Only - preserved for future activation)
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = (AI_ENABLED && apiKey)
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// ==============================================================================
// 1. IN-MEMORY RATE LIMITER (Abuse Protection)
// ==============================================================================
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 40; // 40 requests per 10 minutes

function checkRateLimit(clientId: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const record = rateLimitMap.get(clientId) || { timestamps: [] };

  // Filter timestamps within current sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  if (record.timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldestTimestamp = record.timestamps[0];
    const retryAfterSeconds = Math.ceil((oldestTimestamp + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfterSeconds: Math.max(retryAfterSeconds, 1) };
  }

  record.timestamps.push(now);
  rateLimitMap.set(clientId, record);
  return { allowed: true, retryAfterSeconds: 0 };
}

// Periodically clean up stale rate limit entries every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
    if (record.timestamps.length === 0) {
      rateLimitMap.delete(key);
    }
  }
}, 15 * 60 * 1000);

// ==============================================================================
// 2. EDUCATIONAL CURRICULUM KNOWLEDGE BASE & RAG RETRIEVAL
// ==============================================================================
interface CurriculumTopic {
  subject: string;
  keywords: string[];
  contextFr: string;
  contextAr: string;
}

const BAC_CURRICULUM_KNOWLEDGE: CurriculumTopic[] = [
  {
    subject: 'Mathématiques',
    keywords: ['dériv', 'tangente', 'variation', 'théorème', 'tvi', 'croissance', 'extremum', 'اشتقاق', 'مماس', 'تغيرات', 'قيم متوسطة'],
    contextFr: 'Chapitre Analyse / Dérivation : Préciser le domaine de dérivabilité D_f. Factoriser f\'(x) pour étudier le signe. Utiliser le Théorème des Valeurs Intermédiaires (TVI) pour l\'existence et l\'unicité des solutions d\'équations f(x) = k.',
    contextAr: 'محور التحليل / الاشتقاقية: تحديد مجال الاشتقاق أولاً، دراسة إشارة المشتقة بعد التبسيط والتحليل، وتطبيق مبرهنة القيم المتوسطة لإثبات وجود ووحدانية الحلول في المعادلات f(x) = k.',
  },
  {
    subject: 'Mathématiques',
    keywords: ['limite', 'asymptote', 'indétermination', 'gendarmes', 'croissances comparées', 'نهاية', 'مقاربة', 'حالة عدم تعيين', 'حصر'],
    contextFr: 'Chapitre Limites & Asymptotes : Levée des 4 formes indéterminées (0/0, ∞/∞, 0×∞, +∞-∞). Croissances comparées (lim e^x/x^n = +∞ en +∞). Interprétation géométrique : asymptote horizontale (y=b), verticale (x=a), ou oblique (y=ax+b).',
    contextAr: 'محور النهايات والمستقيمات المقاربة: إزالة حالات عدم التعيين الأربعة، التزايد المقارن للدوال الأسية واللوغاريتمية، التفسير الهندسي للنهايات (مستقيمات مقاربة أفقية، عمودية، ومائلة).',
  },
  {
    subject: 'Mathématiques',
    keywords: ['suite', 'récurrence', 'arithmétique', 'géométrique', 'convergence', 'متتالية', 'تراجع', 'حسابية', 'هندسية', 'تقارب'],
    contextFr: 'Chapitre Suites Numériques : Raisonnement par récurrence en 3 étapes (Initialisation, Hérédité, Conclusion). Suites arithmétiques (u_n = u_0 + n*r) et géométriques (v_n = v_0 * q^n). Théorème de convergence monotone.',
    contextAr: 'محور المتتاليات العددية: البرهان بالتراجع (التحقق، الوراثة، الاستنتاج)، المتتاليات الحسابية والهندسية وعبارة الحد العام والمجموع، دراسة الرتابة ومبرهنة التقارب.',
  },
  {
    subject: 'Mathématiques',
    keywords: ['complexe', 'module', 'argument', 'exponentielle', 'géométrie', 'مركب', 'طويلة', 'عمدة', 'شكل أسي'],
    contextFr: 'Chapitre Nombres Complexes (Terminale) : Forme algébrique z = x + iy, trigonométrique z = r(cos θ + i sin θ), exponentielle z = r e^(iθ). Interprétation géométrique des distances |z_B - z_A| = AB et angles arg((z_C - z_A)/(z_B - z_A)).',
    contextAr: 'محور الأعداد المركبة: الشكل الجبري، المثلثي، والأسي. التفسير الهندسي للأطوال والزوايا وتعيين طبيعة المثلثات والرباعيات والتحويلات النقطية.',
  },
  {
    subject: 'Physique-Chimie',
    keywords: ['cinétique', 'vitesse', 'suivi', 'temps de demi', 't1/2', 'catalyseur', 'حركية', 'سرعة التفاعل', 'زمن نصف التفاعل'],
    contextFr: 'Unité 1 : Suivi temporel d\'une transformation chimique. Facteurs cinétiques (température, concentration des réactifs, catalyseur). Temps de demi-réaction t_1/2 : instant où l\'avancement atteint la moitié de l\'avancement final x_f/2. Vitesse volumique de réaction v = (1/V) * (dx/dt).',
    contextAr: 'الوحدة الأولى: المتابعة الزمنية لتحول كيميائي. العوامل الحركية، زمن نصف التفاعل t1/2 كمعيار حركي أساسي، السرعة الحجمية للتفاعل وسرعة الاختفاء والتشكل.',
  },
  {
    subject: 'Physique-Chimie',
    keywords: ['nucléaire', 'radioactivité', 'décroissance', 'défaut de masse', 'énergie de liaison', 'نووي', 'نشاط إشعاعي', 'نقص كتلي', 'طاقة ربط'],
    contextFr: 'Unité 2 : Transformations nucléaires. Lois de conservation de Soddy (Z et A). Loi de décroissance radioactive N(t) = N_0 * e^(-λt). Constante de temps τ = 1/λ et t_1/2 = ln(2)/λ. Énergie de liaison E_l = Δm * c^2.',
    contextAr: 'الوحدة الثانية: التحولات النووية. قوانين الانحفاظ لسودي، قانون التناقص الإشعاعي، زمن نصف العمر، النقص الكتلي وطاقة الربط لكل نوية واستقرار الأنوية.',
  },
  {
    subject: 'Physique-Chimie',
    keywords: ['rc', 'rl', 'rlc', 'condensateur', 'bobine', 'circuit', 'كهرباء', 'مكثفة', 'وشيعة', 'دارة'],
    contextFr: 'Unité 3 : Phénomènes électriques (RC, RL). Équations différentielles en charge/décharge du condensateur (u_C + RC * du_C/dt = E). Constante de temps τ = RC pour RC, et τ = L/R pour RL. Énergie emmagasinée : E_e = 0.5 * C * u_C^2 et E_m = 0.5 * L * i^2.',
    contextAr: 'الوحدة الثالثة: الظواهر الكهربائية (RC و RL). المعادلات التفاضلية للتوتر والشحنة وشدة التيار، ثابت الزمن، الطاقة المخزنة في المكثفة والوشيعة.',
  },
  {
    subject: 'SVT',
    keywords: ['protéine', 'arn', 'traduction', 'transcription', 'immunité', 'anticorps', 'lymphocyte', 'بروتين', 'استنساخ', 'ترجمة', 'مناعة', 'أجسام مضادة'],
    contextFr: 'Sciences Naturelles : Synthèse des protéines (transcription nucléaire par l\'ARN polymérase + maturation + traduction cytoplasmique par les ribosomes). Immunologie : Réponse immunitaire humorale (LB transformés en plasmocytes sécrétant des anticorps spécifiques) et réponse cellulaire (LT8 différenciés en LTC détruisant les cellules cibles).',
    contextAr: 'علوم الطبيعة والحياة: آليات تركيب البروتين (الاستنساخ في النواة والترجمة في الهيولى). المناعة النوعية: الخلطية (الخلايا البلازمية والأجسام المضادة) والخلوية (الخلايا التائية السامة LTC). منهجية الإجابة المبنية على التحليل الدقيق والاستنتاج والتركيب.',
  },
  {
    subject: 'Mathématiques',
    keywords: ['probabilité', 'arbre', 'loi binomiale', 'variable aléatoire', 'combinaison', 'احتمال', 'شجرة الاحتمالات', 'متغير عشوائي', 'توفيق'],
    contextFr: 'Chapitre Probabilités & Dénombrement : Arbre pondéré (probabilités conditionnelles P(A∩B)=P(A)*P_A(B)). Formule des probabilités totales. Loi binomiale B(n,p) avec coefficients binomiaux (n k). Espérance E(X)=n*p et variance V(X)=n*p*(1-p).',
    contextAr: 'محور الاحتمالات والعد: الشجرة المرجحة والاحتمالات الشرطية ودستور الاحتمالات الكلية، المتغير العشوائي وقانون الاحتمال، قانون ثنائي الحدين B(n,p) وحساب الأمل والتباين.',
  },
  {
    subject: 'Physique-Chimie',
    keywords: ['newton', 'mécanique', 'satellite', 'kepler', 'chute libre', 'mouvement', 'ميكانيك', 'نيوتن', 'سقوط شاقولي', 'قمر اصطناعي', 'كبلر'],
    contextFr: 'Unité 5 : Mécanique classique (Lois de Newton). Deuxième loi : Σ F_ext = m * a. Mouvement des satellites et planètes (repère de Frenet, vitesse orbitale v = sqrt(G*M/r), 3e loi de Kepler T^2/r^3 = cte). Chute verticale avec frottement et vitesse limite.',
    contextAr: 'الوحدة الخامسة: الميكانيك وتطبيقات قوانين نيوتن (القانون الثاني مجموع القوى الخارجية يساوي الكتلة في التسارع). حركة الأقمار الاصطناعية والكواكب (معلم فريني، السرعة المدارية، قانون كبلر الثالث)، السقوط الشاقولي الحقيقي والسرعة الحدية.',
  },
  {
    subject: 'Physique-Chimie',
    keywords: ['acide', 'base', 'ph', 'dosage', 'titrage', 'ka', 'pka', 'حمض', 'أساس', 'معايرة', 'نقطة التكافؤ'],
    contextFr: 'Unité 4 : Équilibre acido-basique. Produit ionique de l\'eau Ke = 10^-14. Constante d\'acidité Ka et pKa = -log(Ka). pH = pKa + log([A-]/[HA]). Titrage pH-métrique et conductimétrique (point d\'équivalence E, méthode des tangentes parallèles).',
    contextAr: 'الوحدة الرابعة: التفاعلات حمض-أساس وحالة توازن جملة كيميائية. الجداء الشاردي للماء، ثابت الحموضة Ka و pKa، علاقة pH بالـ pKa، المعايرة البي إتش مترية والناقلية وتحديد نقطة التكافؤ بطريقة المماسات المتوازية.',
  },
  {
    subject: 'Philosophie',
    keywords: ['philo', 'philosophie', 'problématique', 'comparaison', 'dialectique', 'thèse', 'فلسفة', 'مقالة', 'إشكالية', 'جدلية', 'استقصاء بالوضع'],
    contextFr: 'Méthodologie de la Dissertation Philosophique (Bac Algérien) : 1) Méthode dialectique (Thèse, Antithèse, Synthèse). 2) Méthode comparative (Points de ressemblance, de différence, relation d\'interdépendance). 3) Démarche d\'investigation (Défense de la thèse). Structure : Introduction (problématique), Développement rigoureux avec philosophes de référence, Conclusion décisive.',
    contextAr: 'منهجية المقالة الفلسفية للبكالوريا: 1) الطريقة الجدلية (طرح المشكلة، محاولة حل المشكلة: الأطروحة ونقدها، نقيض الأطروحة ونقده، التركيب والتغليب، حل المشكلة). 2) طريقة الاستقصاء بالوضع (الدفاع عن الأطروحة). 3) طريقة المقارنة. تدعيم المقال بأقوال الفلاسفة والأمثلة الواقعية وتجنب الإنشاء الأدبي.',
  },
  {
    subject: 'Histoire-Géographie',
    keywords: ['histoire', 'géo', 'révolution', 'guerre froide', 'sommam', 'crise', 'تاريخ', 'جغرافيا', 'ثورة', 'حرب باردة', 'صومام', 'حركة عدم الانحياز'],
    contextFr: 'Histoire-Géo Bac : Histoire : Guerre Froide (endiguement, rideau de fer, coexistence pacifique), Révolution Algérienne 1954-1962 (Déclaration du 1er Novembre, Congrès de la Soummam 1956, négociations d\'Évian). Géographie : Économie des grandes puissances (USA, UE, Asie orientale), disparités Nord-Sud, hydrocarbures.',
    contextAr: 'التاريخ والجغرافيا: التاريخ: الحرب الباردة واستراتيجيات المعسكرين، حركة عدم الانحياز، الثورة التحريرية الجزائرية الكبرى (بيان أول نوفمبر، هجومات الشمال القسنطيني 1955، مؤتمر الصومام 1956، مفاوضات إيفيان واسترجاع السيادة الوطنية). الجغرافيا: مصادر القوة الاقتصادية الأمريكية والأوروبية والآسيوية، المبادلات والتنقلات العالمية، إشكالية التنمية وتفاوت الشمال والجنوب.',
  },
  {
    subject: 'Sciences Islamiques',
    keywords: ['islam', 'islamique', 'charia', 'ijma', 'qiyas', 'عقيدة', 'شريعة', 'إجماع', 'قياس', 'مصالح مرسلة', 'مقاصد'],
    contextFr: 'Sciences Islamiques : Les sources de la législation islamique (Le Coran, la Sunna, l\'Ijma\'/Consensus, le Qiyas/Analogie, et les Masalih Mursalah/Intérêts publics). Les finalités de la Charia (Protection de la religion, de la vie, de la raison, de la lignée et des biens). Éthique et valeurs.',
    contextAr: 'العلوم الإسلامية: مصادر التشريع الإسلامي التبعية (الإجماع، القياس، المصالح المرسلة). مقاصد الشريعة الإسلامية الضرورية الخمس (حفظ الدين، النفس، العقل، النسل، والمال)، أثر العقيدة الإسلامية على الفرد والمجتمع، والمنهج القرآني في تثبيت العقيدة وتثمين العقل.',
  },
];

function retrieveCurriculumContext(query: string, lang: string): string {
  const lowerQuery = query.toLowerCase();
  const matched = BAC_CURRICULUM_KNOWLEDGE.filter((item) =>
    item.keywords.some((kw) => lowerQuery.includes(kw.toLowerCase()))
  );

  if (matched.length === 0) {
    return lang === 'ar'
      ? 'منهاج البكالوريا الجزائري الرسمي للشعب العلمية والرياضية (دورة 2026/2027).'
      : 'Programme officiel du Baccalauréat Algérien - Terminale Sciences Expérimentales & Mathématiques (Session 2026/2027).';
  }

  return matched
    .slice(0, 2)
    .map((m) => (lang === 'ar' ? `[مادة ${m.subject}]: ${m.contextAr}` : `[Matière ${m.subject}]: ${m.contextFr}`))
    .join('\n');
}

// ==============================================================================
// 3. SERVER SETUP & ROUTES
// ==============================================================================
export async function createServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '1mb' }));

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'EOS BAC Fullstack Server',
      aiEnabled: AI_ENABLED,
      aiConfigured: Boolean(apiKey) && AI_ENABLED,
      timestamp: new Date().toISOString(),
    });
  });

  // AI Assistant Chat Route (Streaming SSE with RAG)
  app.post('/api/ai/chat', async (req: Request, res: Response) => {
    // 0. Strict Gatekeeper: Block all requests when AI feature is disabled
    // Prevents any Gemini invocation via DevTools, Postman, curl, or custom requests
    if (!AI_ENABLED) {
      res.status(503).json({
        success: false,
        error: 'AI temporarily unavailable',
        message: 'Notre assistant IA est actuellement en préparation. Il sera bientôt disponible.',
        message_fr: 'Notre assistant IA est actuellement en préparation. Il sera bientôt disponible.',
        message_en: 'Our AI assistant is currently being prepared. It will be available soon.',
        message_ar: 'مساعد الذكاء الاصطناعي قيد التطوير حاليًا وسيكون متاحًا قريبًا.',
      });
      return;
    }

    // 1. Rate limiting by IP or user identifier
    const clientIdentifier =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      req.body.userId ||
      'anonymous';

    const rateLimit = checkRateLimit(clientIdentifier);
    if (!rateLimit.allowed) {
      res.status(429).json({
        error: `Limite de requêtes atteinte pour l'assistant IA. Veuillez patienter ${rateLimit.retryAfterSeconds} secondes avant de poser une nouvelle question.`,
        retryAfter: rateLimit.retryAfterSeconds,
      });
      return;
    }

    const { message, history, currentStream, language, mode, studentProfile } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Le message ne peut pas être vide.' });
      return;
    }

    const cleanMessage = message.trim().slice(0, 2000);
    const lang = language === 'ar' ? 'ar' : language === 'en' ? 'en' : 'fr';
    const streamName =
      currentStream === 'sciences_experimentales'
        ? 'Sciences Expérimentales (علوم تجريبية)'
        : 'Mathématiques (رياضيات)';

    // Retrieve targeted curriculum RAG context
    const retrievedContext = retrieveCurriculumContext(cleanMessage, lang);

    // Build mode-specific pedagogical directive
    let modeDirective = '';
    if (mode === 'explication') {
      modeDirective = `\nORIENTATION DU MODE EXPLICATION :\nDécompose le concept avec pédagogie, énonce le théorème ou la règle formelle avec ses conditions de validité précises, puis illustre avec un exemple type BAC.`;
    } else if (mode === 'exercices') {
      modeDirective = `\nORIENTATION DU MODE EXERCICES :\nFormule un énoncé d'exercice type BAC structuré en questions progressives. Fournis un premier indice pour démarrer et encourage l'élève à chercher avant de détailler la solution et les points du barème.`;
    } else if (mode === 'resume') {
      modeDirective = `\nORIENTATION DU MODE RÉSUMÉ :\nPrésente une fiche de synthèse percutante : 1) Définitions et théorèmes fondamentaux, 2) Formules clés à retenir par cœur, 3) Pièges récurrents signalés par les correcteurs du BAC.`;
    } else if (mode === 'conseils') {
      modeDirective = `\nORIENTATION DU MODE CONSEILS :\nConseille l'élève sur le planning de révision, la répartition du temps durant l'épreuve officielle (3h30 ou 4h30), les méthodes de mémorisation active et la gestion du stress.`;
    }

    // Student Personalization (Dream, Goal, Target Score)
    let studentPersonalization = '';
    if (studentProfile && typeof studentProfile === 'object') {
      const pItems: string[] = [];
      if (studentProfile.fullName) pItems.push(`Nom de l'élève : ${studentProfile.fullName}`);
      if (studentProfile.dream) pItems.push(`Rêve / Métier visé : ${studentProfile.dream}`);
      if (studentProfile.goal) pItems.push(`Objectif BAC : ${studentProfile.goal}`);
      if (studentProfile.targetScore) pItems.push(`Note cible visée au BAC : ${studentProfile.targetScore}/20`);
      if (studentProfile.studyFocus) pItems.push(`Matière prioritaire : ${studentProfile.studyFocus}`);

      if (pItems.length > 0) {
        studentPersonalization = `\n\nPROFIL ET ASPIRATIONS DE L'ÉLÈVE :\n${pItems.join('\n')}\nUtilise ces informations pour adapter ton encouragement, faire des analogies inspirantes avec son rêve ou sa future carrière (ex: médecine, ingénierie, recherche), et le soutenir avec exigence et bienveillance pour atteindre sa note cible.`;
      }
    }

    // Build system instruction
    const systemInstruction = `Tu es l'assistant pédagogique officiel d'EOS BAC (المساعد البيداغوجي الذكي لمنصة EOS BAC), conçu spécialement pour accompagner les élèves algériens préparant le Baccalauréat Algérien en filière ${streamName}.

DIRECTIVES PÉDAGOGIQUES :
1. Méthode socratique et progressive : guide l'élève pas à pas vers la déduction de la solution, sans donner immédiatement la réponse brute sauf s'il s'agit d'une définition ou s'il le demande expressément.
2. Rigueur conforme au barème officiel algérien : insiste sur les justifications formelles exigées par les correcteurs (domaines de définition/dérivabilité, hypothèses du TVI, unités physiques internationales SI, lois de conservation de Soddy, démarche scientifique constat-interprétation-déduction en SVT).
3. Structure de réponse claire :
   - Explication concise et intuitive.
   - Formule ou règle clé (si applicable, formulée clairement).
   - Exemple d'application ou question de vérification.
   - Astuce BAC ciblée.
4. Langue : Réponds prioritairement dans la langue de la question (${lang === 'ar' ? 'Arabe classique' : lang === 'en' ? 'Anglais' : 'Français'}). Si l'élève utilise la Darija algérienne, comprends-la parfaitement et réponds de manière bienveillante et accessible.
5. Intégrité et absence d'hallucinations : Ne fabrique jamais de dates d'examen ou d'arrêtés ministériels non vérifiés. Si une information dépend des instructions officielles de l'année non disponibles dans le contexte, indique-le honnêtement.
${modeDirective}${studentPersonalization}

CONTEXTE PÉDAGOGIQUE OFFICIEL BAC :
${retrievedContext}

MODE COURANT : ${mode || 'conversation'}`;

    // Prepare conversation messages (bounded history to control tokens & costs)
    const recentHistory = Array.isArray(history) ? history.slice(-6) : [];
    const contents: any[] = [];

    for (const h of recentHistory) {
      if (h.sender === 'user' && h.text) {
        contents.push({ role: 'user', parts: [{ text: h.text.slice(0, 1000) }] });
      } else if (h.sender === 'ai' && h.text) {
        contents.push({ role: 'model', parts: [{ text: h.text.slice(0, 1500) }] });
      }
    }

    contents.push({ role: 'user', parts: [{ text: cleanMessage }] });

    // Set headers for Server-Sent Events (SSE) streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // If Gemini API is available, stream real model output with auto-fallback
    if (ai) {
      const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
      let streamedAnyChunk = false;

      for (const modelName of candidateModels) {
        try {
          const stream = await ai.models.generateContentStream({
            model: modelName,
            contents,
            config: {
              systemInstruction,
              temperature: 0.7,
              topP: 0.95,
            },
          });

          for await (const chunk of stream) {
            const textChunk = chunk.text;
            if (textChunk) {
              streamedAnyChunk = true;
              res.write(`data: ${JSON.stringify({ text: textChunk })}\n\n`);
            }
          }

          if (streamedAnyChunk) {
            res.write('data: [DONE]\n\n');
            res.end();
            return;
          }
        } catch (modelErr: any) {
          console.warn(`[EOS BAC AI] Model ${modelName} notice:`, modelErr?.message || modelErr);
          // If we already sent chunks to the client, we cannot switch model mid-stream
          if (streamedAnyChunk) {
            res.write('data: [DONE]\n\n');
            res.end();
            return;
          }
          // Continue to next candidate model in fallback chain
        }
      }

      // If all candidate models failed, send structured curriculum guidance
      const fallbackText =
        lang === 'ar'
          ? `نعتذر، حدث ضغط مؤقت في الاتصال بالمساعد الذكي. فيما يخص سؤالك حول المنهج:\n\n• احرص دائمًا على كتابة الخطوات المنطقية وقوانين الحساب بدقة.\n• راجع الملخصات الرسمية المتوفرة في قسم "الملخصات" بالمنصة.`
          : `Un incident de connexion temporaire s'est produit. Concernant ta question pour le BAC :\n\n• Veille à toujours expliciter tes théorèmes et tes unités de mesure.\n• N'hésite pas à consulter les fiches synthèses dans la section "Résumés" de la plateforme.`;

      res.write(`data: ${JSON.stringify({ text: fallbackText })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    // Graceful offline fallback if GEMINI_API_KEY is not configured
    const simulatedResponse =
      lang === 'ar'
        ? `في إطار تحضيرك لشهادة البكالوريا لشعبة ${streamName} :\n\n### الشرح البيداغوجي\nلتناول هذا المفهوم، تذكر دائمًا القاعدة الأساسية وطريقة التفسير المعتمدة وزارياً.\n\n### نصيحة BAC\nاحرص على تنظيم ورقة الإجابة وتأطير النتائج النهائية بالوحدات الدولية لضمان النقطة الكاملة في سلم التنقيط.`
        : `Dans le cadre de ta préparation au BAC en filière ${streamName} :\n\n### Démarche Pédagogique\nPour traiter cette question avec rigueur, commence par identifier les données du problème et pose les théorèmes applicables.\n\n### Astuce BAC\nEncadre toujours tes résultats finaux et veille aux unités dans le Système International pour sécuriser tous les points du barème.`;

    // Stream the simulated response chunk by chunk
    const words = simulatedResponse.split(' ');
    for (let i = 0; i < words.length; i += 3) {
      const part = words.slice(i, i + 3).join(' ') + ' ';
      res.write(`data: ${JSON.stringify({ text: part })}\n\n`);
      await new Promise((r) => setTimeout(r, 40));
    }
    res.write('data: [DONE]\n\n');
    res.end();
  });

  // In development, mount Vite dev server middlewares
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve built static assets from dist
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[EOS BAC] Fullstack Server running on http://0.0.0.0:${PORT} (Production: ${isProduction})`);
  });

  return app;
}

// Start server when executed directly
createServer().catch((err) => {
  console.error('[EOS BAC] Failed to start server:', err);
  process.exit(1);
});
