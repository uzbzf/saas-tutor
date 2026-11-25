import type { ProficiencyLevel } from "@/lib/usage";

export interface LevelInfo {
  id: ProficiencyLevel;
  labelRu: string;
  cefr: string;
  description: string;
  focus: string;
}

export const PROFICIENCY_LEVELS: LevelInfo[] = [
  {
    id: "BEGINNER",
    labelRu: "Начальный",
    cefr: "A1–A2",
    description: "Базовая лексика, простые фразы, Present/Past Simple и основы правописания.",
    focus: "Повседневное общение, базовые глаголы, простые предложения",
  },
  {
    id: "INTERMEDIATE",
    labelRu: "Средний",
    cefr: "B1–B2",
    description: "Свободный диалог, фразовые глаголы, все основные времена и структура текста.",
    focus: "Уверенная речь, идиомы, сложные времена и аргументация",
  },
  {
    id: "ADVANCED",
    labelRu: "Продвинутый",
    cefr: "C1",
    description: "Академический и деловой английский, тонкие оттенки смысла и стилистика.",
    focus: "Сложный синтаксис, инверсия, деловые переговоры",
  },
  {
    id: "EXPERT",
    labelRu: "Эксперт",
    cefr: "C2",
    description: "Уровень носителя: риторика, редкие идиомы, нюансы акцента и редактирование.",
    focus: "Риторическое мастерство, стилистическая точность, свободное владение",
  },
];

export interface LessonItem {
  slug: string;
  order: number;
  titleRu: string;
  titleEn: string;
  topic: string;
  descriptionRu: string;
  promptHint: string;
  isFree: boolean;
}

export const LESSONS: LessonItem[] = [
  {
    slug: "greetings-daily-routine",
    order: 1,
    titleRu: "Знакомство и распорядок дня",
    titleEn: "Greetings & Daily Routine",
    topic: "Базовая тема 1",
    descriptionRu: "Как представиться, рассказать о своём дне и задать простые вопросы собеседнику.",
    promptHint: "Practice introducing yourself and describing your morning routine.",
    isFree: true,
  },
  {
    slug: "travel-and-directions",
    order: 2,
    titleRu: "Путешествия и навигация",
    titleEn: "Travel & Directions",
    topic: "Базовая тема 2",
    descriptionRu: "Аэропорт, отель, как спросить дорогу и понять указания на улице.",
    promptHint: "Roleplay asking for directions to the nearest train station or hotel check-in.",
    isFree: true,
  },
  {
    slug: "food-and-ordering",
    order: 3,
    titleRu: "Еда и заказ в ресторане",
    titleEn: "Food & Ordering",
    topic: "Базовая тема 3",
    descriptionRu: "Вежливые просьбы, меню, аллергии и оплата счёта в кафе.",
    promptHint: "Order a meal at a cafe, ask about ingredients, and request the bill politely.",
    isFree: true,
  },
  {
    slug: "work-and-hobbies",
    order: 4,
    titleRu: "Работа, учёба и хобби",
    titleEn: "Work & Hobbies",
    topic: "Базовая тема 4",
    descriptionRu: "Рассказ о профессии, увлечениях и планах на выходные.",
    promptHint: "Talk about your job or studies and what you enjoy doing in your free time.",
    isFree: true,
  },
  {
    slug: "shopping-and-numbers",
    order: 5,
    titleRu: "Покупки, цены и числа",
    titleEn: "Shopping & Numbers",
    topic: "Базовая тема 5",
    descriptionRu: "Размеры, цвета, сравнение товаров и диалог на кассе.",
    promptHint: "Ask for a different size, compare prices, and complete a purchase.",
    isFree: true,
  },
  {
    slug: "business-negotiations",
    order: 6,
    titleRu: "Деловые переговоры и презентации",
    titleEn: "Business Negotiations",
    topic: "Pro-урок 6",
    descriptionRu: "Аргументация, деловая переписка и уверенные формулировки на встречах.",
    promptHint: "Lead a project status meeting and negotiate a deadline extension.",
    isFree: false,
  },
  {
    slug: "idioms-and-phrasal-verbs",
    order: 7,
    titleRu: "Идиомы и фразовые глаголы",
    titleEn: "Idioms & Phrasal Verbs",
    topic: "Pro-урок 7",
    descriptionRu: "Естественная речь носителей языка в реальных диалогах.",
    promptHint: "Use 5 natural phrasal verbs and idioms in a casual conversation.",
    isFree: false,
  },
];

export function getLevelInfo(level: string): LevelInfo {
  return (
    PROFICIENCY_LEVELS.find((l) => l.id === level) ?? PROFICIENCY_LEVELS[0]
  );
}
