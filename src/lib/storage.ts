import { UserProfile, MealRecord, DailyLog, MeasurementRecord, ChatMessage } from '../types';

const PROFILE_KEY = 'abba_profile_v1';
const MEALS_KEY = 'abba_meals_v1';
const DAILY_LOGS_KEY = 'abba_daily_logs_v1';
const MEASUREMENTS_KEY = 'abba_measurements_v1';
const CHAT_KEY = 'abba_chat_v1';

export const DEFAULT_PROFILE: UserProfile = {
  name: 'אבי',
  age: 51,
  gender: 'גבר',
  heightCm: 173,
  startDate: '2026-09-15',
  startWeight: 96.15,
  targetWeightMin: 80,
  targetWeightMax: 85,
  startBodyFat: 33.7,
  targetBodyFatMin: 16,
  targetBodyFatMax: 20,
  startMuscleMass: 59,
  targetCalories: 2000,
  targetProtein: 140,
  targetWaterMl: 2500,
  fastWindowHours: 16,
  eatingWindowDefaultStart: '12:00',
  eatingWindowDefaultEnd: '20:00',
  walkingGoalMinutes: 60,
  strengthWorkoutsPerWeek: 3,
  scaleModel: 'Smarter UNIQUE BODY SCALE BMI (Unique Health)',
};

export const INITIAL_MEASUREMENTS: MeasurementRecord[] = [
  {
    id: 'm-1',
    date: '2026-09-15',
    weight: 96.15,
    bodyFat: 33.7,
    muscleMass: 59.0,
    waistCm: 104,
    source: 'scale_import',
    notes: 'מדידת בסיס התחלתית',
  },
  {
    id: 'm-2',
    date: '2026-09-22',
    weight: 95.3,
    bodyFat: 33.1,
    muscleMass: 59.0,
    waistCm: 103,
    source: 'scale_import',
    notes: 'סיום שבוע ראשון בניקוי',
  },
  {
    id: 'm-3',
    date: '2026-09-29',
    weight: 94.6,
    bodyFat: 32.5,
    muscleMass: 59.1,
    waistCm: 101.5,
    source: 'scale_import',
    notes: 'התקדמות יציבה, שמירה מלאה על שריר',
  },
  {
    id: 'm-4',
    date: '2026-10-06',
    weight: 93.9,
    bodyFat: 31.9,
    muscleMass: 59.1,
    waistCm: 100,
    source: 'scale_import',
    notes: 'ירקות מנקים ושילוב הליכות קבוע',
  },
  {
    id: 'm-5',
    date: '2026-10-12',
    weight: 93.4,
    bodyFat: 31.2,
    muscleMass: 59.2,
    waistCm: 99,
    source: 'scale_import',
    notes: 'שקילה עדכנית - ירידה כוללת של 2.75 ק״ג!',
  },
];

export const INITIAL_MEALS: MealRecord[] = [
  {
    id: 'meal-today-1',
    date: '2026-10-12',
    time: '12:30',
    mealType: 'lunch',
    status: 'EATEN',
    title: 'חזה עוף צלוי עם קינואה וסלט עשיר',
    items: [
      {
        id: 'item-1',
        name: 'חזה עוף צלוי',
        amount: 200,
        unit: 'גרם',
        calories: 280,
        protein: 48,
        carbs: 0,
        fat: 6,
        isCleanPlan: true,
        isEstimate: true,
      },
      {
        id: 'item-2',
        name: 'קינואה מבושלת',
        amount: 5,
        unit: 'כפות',
        calories: 140,
        protein: 5,
        carbs: 25,
        fat: 2,
        isCleanPlan: true,
        isEstimate: true,
      },
      {
        id: 'item-3',
        name: 'סלט ירקות מנקים עם כף טחינה',
        amount: 1,
        unit: 'קערה',
        calories: 120,
        protein: 3,
        carbs: 8,
        fat: 8,
        isCleanPlan: true,
        isEstimate: true,
      },
    ],
    totalCalories: 540,
    totalProtein: 56,
    totalCarbs: 33,
    totalFat: 16,
    notes: 'פתיחת חלון אכילה בזמן - ארוחה משביעה ועשירה בחלבון',
  },
  {
    id: 'meal-today-2',
    date: '2026-10-12',
    time: '16:15',
    mealType: 'snack',
    status: 'EATEN',
    title: 'שייק חלבון עם מים וגרגרי יער',
    items: [
      {
        id: 'item-4',
        name: 'אבקת חלבון איכותית',
        amount: 1,
        unit: 'סקופ',
        calories: 130,
        protein: 26,
        carbs: 2,
        fat: 1.5,
        isCleanPlan: true,
        isEstimate: true,
      },
      {
        id: 'item-5',
        name: 'גרגרי יער וזרעי צ׳יה',
        amount: 50,
        unit: 'גרם',
        calories: 70,
        protein: 2,
        carbs: 8,
        fat: 3,
        isCleanPlan: true,
        isEstimate: true,
      },
    ],
    totalCalories: 200,
    totalProtein: 28,
    totalCarbs: 10,
    totalFat: 4.5,
    notes: 'חלבון לאחר ההליכה המהירה',
  },
  {
    id: 'meal-today-3',
    date: '2026-10-12',
    time: '19:30',
    mealType: 'dinner',
    status: 'PLANNED',
    title: 'פילה סלמון בתנור, ירקות ירוקים מנקים ועדשים',
    items: [
      {
        id: 'item-6',
        name: 'פילה סלמון אפוי',
        amount: 200,
        unit: 'גרם',
        calories: 380,
        protein: 40,
        carbs: 0,
        fat: 22,
        isCleanPlan: true,
        isEstimate: true,
      },
      {
        id: 'item-7',
        name: 'עדשים כתומות / שחורות מבושלות',
        amount: 4,
        unit: 'כפות',
        calories: 120,
        protein: 8,
        carbs: 20,
        fat: 1,
        isCleanPlan: true,
        isEstimate: true,
      },
      {
        id: 'item-8',
        name: 'ברוקולי, שעועית ירוקה וקישוא מאודים',
        amount: 1,
        unit: 'צלחת גדולה',
        calories: 80,
        protein: 5,
        carbs: 12,
        fat: 1,
        isCleanPlan: true,
        isEstimate: true,
      },
    ],
    totalCalories: 580,
    totalProtein: 53,
    totalCarbs: 32,
    totalFat: 24,
    notes: 'מתוכננת להערב לקראת סגירת חלון האכילה ב-20:00',
  },
];

export const INITIAL_DAILY_LOG: DailyLog = {
  date: '2026-10-12',
  waterMl: 1750,
  isWindowOpen: true,
  windowOpenTime: '12:00',
  windowCloseTime: '20:00',
  walkingMinutes: 55,
  walkingKm: 5.2,
  strengthWorkout: true,
  workoutNotes: 'אימון חזה וגב + שעה הליכה מהירה בפארק',
};

export const INITIAL_CHAT: ChatMessage[] = [
  {
    id: 'c-1',
    role: 'model',
    text: `היי אבי, שמח לפגוש אותך! 
אני המאמן התזונתי האישי שלך למסלול הניקוי של "אבא חטוב". אני מכיר את היעדים שלך (ירידה מ-96.15 ק"ג לעבר 80–85 ק"ג תוך שימור מלא של 59 ק"ג שריר).
נכון לעכשיו אכלת היום 84 גרם חלבון מתוך יעד של 140 גרם. ארוחת הערב המתוכננת שלך ב-19:30 תביא אותך בדיוק ליעד!
במה תרצה שנעסוק עכשיו?`,
    timestamp: '16:45',
  },
];

// Profile storage
export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load profile from localStorage:', e);
  }
  return DEFAULT_PROFILE;
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile to localStorage:', e);
  }
}

// Meals storage
export function loadMeals(): MealRecord[] {
  try {
    const raw = localStorage.getItem(MEALS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load meals from localStorage:', e);
  }
  return INITIAL_MEALS;
}

export function saveMeals(meals: MealRecord[]): void {
  try {
    localStorage.setItem(MEALS_KEY, JSON.stringify(meals));
  } catch (e) {
    console.error('Failed to save meals to localStorage:', e);
  }
}

// Daily logs storage
export function loadDailyLogs(): Record<string, DailyLog> {
  try {
    const raw = localStorage.getItem(DAILY_LOGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load daily logs from localStorage:', e);
  }
  return { '2026-10-12': INITIAL_DAILY_LOG };
}

export function saveDailyLogs(logs: Record<string, DailyLog>): void {
  try {
    localStorage.setItem(DAILY_LOGS_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save daily logs to localStorage:', e);
  }
}

export function getDailyLogForDate(dateStr: string): DailyLog {
  const allLogs = loadDailyLogs();
  if (allLogs[dateStr]) {
    return allLogs[dateStr];
  }
  return {
    date: dateStr,
    waterMl: 0,
    isWindowOpen: false,
    windowOpenTime: '12:00',
    windowCloseTime: '20:00',
    walkingMinutes: 0,
    walkingKm: 0,
    strengthWorkout: false,
  };
}

// Measurements storage
export function loadMeasurements(): MeasurementRecord[] {
  try {
    const raw = localStorage.getItem(MEASUREMENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load measurements from localStorage:', e);
  }
  return INITIAL_MEASUREMENTS;
}

export function saveMeasurements(measurements: MeasurementRecord[]): void {
  try {
    localStorage.setItem(MEASUREMENTS_KEY, JSON.stringify(measurements));
  } catch (e) {
    console.error('Failed to save measurements to localStorage:', e);
  }
}

// Chat history storage
export function loadChat(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load chat from localStorage:', e);
  }
  return INITIAL_CHAT;
}

export function saveChat(chat: ChatMessage[]): void {
  try {
    localStorage.setItem(CHAT_KEY, JSON.stringify(chat));
  } catch (e) {
    console.error('Failed to save chat to localStorage:', e);
  }
}

// Export data to CSV
export function exportAllDataToCSV(): void {
  const profile = loadProfile();
  const meals = loadMeals();
  const measurements = loadMeasurements();
  const dailyLogs = loadDailyLogs();

  let csvContent = '\uFEFF'; // UTF-8 BOM for Hebrew Excel support

  // Section 1: Profile
  csvContent += 'פרופיל אישי - אבא חטוב AI\n';
  csvContent += `שם,${profile.name}\n`;
  csvContent += `גיל,${profile.age}\n`;
  csvContent += `גובה,${profile.heightCm} ס"מ\n`;
  csvContent += `משקל התחלתי,${profile.startWeight} ק"ג\n`;
  csvContent += `יעד משקל,${profile.targetWeightMin}-${profile.targetWeightMax} ק"ג\n`;
  csvContent += `אחוז שומן התחלתי,${profile.startBodyFat}%\n`;
  csvContent += `יעד אחוז שומן,${profile.targetBodyFatMin}-${profile.targetBodyFatMax}%\n`;
  csvContent += `מסת שריר בסיס,${profile.startMuscleMass} ק"ג\n`;
  csvContent += `יעד קלוריות,${profile.targetCalories} קק"ל\n`;
  csvContent += `יעד חלבון,${profile.targetProtein} גרם\n\n`;

  // Section 2: Measurements
  csvContent += 'מדידות שקילה והרכב גוף\n';
  csvContent += 'תאריך,משקל (ק"ג),אחוז שומן (%),מסת שריר (ק"ג),היקף מותניים (ס"מ),מקור,הערות\n';
  measurements.forEach((m) => {
    csvContent += `${m.date},${m.weight},${m.bodyFat || ''},${m.muscleMass || ''},${m.waistCm || ''},"${m.source}","${m.notes || ''}"\n`;
  });
  csvContent += '\n';

  // Section 3: Meals
  csvContent += 'יומן ארוחות (תכנון וביצוע בפועל)\n';
  csvContent += 'תאריך,שעה,סוג ארוחה,סטטוס,שם הארוחה,קלוריות,חלבון (גרם),פחמימות (גרם),שומן (גרם),הערות\n';
  meals.forEach((meal) => {
    const statusHeb =
      meal.status === 'EATEN'
        ? 'נאכלה'
        : meal.status === 'PLANNED'
        ? 'מתוכננת'
        : meal.status === 'MODIFIED'
        ? 'נאכלה בשינוי'
        : 'בוטלה';
    csvContent += `${meal.date},${meal.time},"${meal.mealType}","${statusHeb}","${meal.title.replace(/"/g, '""')}",${meal.totalCalories},${meal.totalProtein},${meal.totalCarbs},${meal.totalFat},"${(meal.notes || '').replace(/"/g, '""')}"\n`;
  });
  csvContent += '\n';

  // Section 4: Daily Logs
  csvContent += 'פעילות ומים יומית\n';
  csvContent += 'תאריך,מים (מ"ל),חלון אכילה פתוח,זמן הליכה (דקות),מרחק הליכה (ק"מ),אימון כוח,הערות\n';
  Object.values(dailyLogs).forEach((log) => {
    csvContent += `${log.date},${log.waterMl},${log.isWindowOpen ? 'כן' : 'לא'},${log.walkingMinutes},${log.walkingKm},${log.strengthWorkout ? 'כן' : 'לא'},"${(log.workoutNotes || '').replace(/"/g, '""')}"\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `abba_hatuv_avi_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Reset all to defaults
export function resetStorageToDefaults(): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(DEFAULT_PROFILE));
  localStorage.setItem(MEALS_KEY, JSON.stringify(INITIAL_MEALS));
  localStorage.setItem(MEASUREMENTS_KEY, JSON.stringify(INITIAL_MEASUREMENTS));
  localStorage.setItem(DAILY_LOGS_KEY, JSON.stringify({ '2026-10-12': INITIAL_DAILY_LOG }));
  localStorage.setItem(CHAT_KEY, JSON.stringify(INITIAL_CHAT));
}
