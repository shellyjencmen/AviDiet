export type MealStatus = 'PLANNED' | 'EATEN' | 'MODIFIED' | 'CANCELLED';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  isCleanPlan: boolean; // Clean eating compliant (no added sugar, no flour, complex carbs/quinoa, etc.)
  isEstimate: boolean;
  notes?: string;
}

export interface MealRecord {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  mealType: MealType;
  status: MealStatus;
  title: string;
  items: MealItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  notes?: string;
  originalPlannedMealId?: string;
  imageUrl?: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  waterMl: number;
  isWindowOpen: boolean;
  windowOpenTime?: string; // HH:mm
  windowCloseTime?: string; // HH:mm
  walkingMinutes: number;
  walkingKm: number;
  strengthWorkout: boolean;
  workoutNotes?: string;
}

export interface MeasurementRecord {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // kg
  bodyFat?: number; // %
  muscleMass?: number; // kg
  waistCm?: number;
  source: 'manual' | 'scale_import';
  notes?: string;
}

export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  heightCm: number;
  startDate: string; // 2026-09-15
  startWeight: number; // 96.15 kg
  targetWeightMin: number; // 80 kg
  targetWeightMax: number; // 85 kg
  startBodyFat: number; // 33.7%
  targetBodyFatMin: number; // 16%
  targetBodyFatMax: number; // 20%
  startMuscleMass: number; // 59 kg
  targetCalories: number; // 2000 kcal
  targetProtein: number; // 140 g
  targetWaterMl: number; // 2500 ml
  fastWindowHours: number; // 16 (16/8)
  eatingWindowDefaultStart: string; // '12:00'
  eatingWindowDefaultEnd: string; // '20:00'
  walkingGoalMinutes: number; // 60 min
  strengthWorkoutsPerWeek: number; // 3
  scaleModel: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  action?: {
    type: 'SUGGEST_MEAL' | 'UPDATE_MEAL';
    mealType?: MealType;
    title?: string;
    items?: MealItem[];
    totalCalories?: number;
    totalProtein?: number;
  };
}
