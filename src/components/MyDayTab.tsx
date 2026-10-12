import React from 'react';
import { 
  Plus, 
  Check, 
  Clock, 
  Flame, 
  Droplets, 
  Dumbbell, 
  Footprints, 
  Sparkles, 
  Copy, 
  Edit3, 
  Trash2,
  ChevronDown,
  Info,
  CheckCircle2,
  AlertCircle,
  Camera
} from 'lucide-react';
import { MealRecord, DailyLog, UserProfile, MealStatus } from '../types';

interface MyDayTabProps {
  currentDateStr: string;
  profile: UserProfile;
  meals: MealRecord[];
  dailyLog: DailyLog;
  onUpdateDailyLog: (updates: Partial<DailyLog>) => void;
  onOpenMealModal: (defaultStatus: MealStatus, editMeal?: MealRecord) => void;
  onConfirmPlannedMeal: (mealId: string) => void;
  onDeleteMeal: (mealId: string) => void;
  onDuplicateFromYesterday: () => void;
  onAskCoachQuestion: (q: string) => void;
}

export const MyDayTab: React.FC<MyDayTabProps> = ({
  currentDateStr,
  profile,
  meals,
  dailyLog,
  onUpdateDailyLog,
  onOpenMealModal,
  onConfirmPlannedMeal,
  onDeleteMeal,
  onDuplicateFromYesterday,
  onAskCoachQuestion,
}) => {
  // Filter meals for the selected date
  const dayMeals = meals.filter((m) => m.date === currentDateStr);

  // Separate eaten meals from planned meals
  const eatenMeals = dayMeals.filter((m) => m.status === 'EATEN' || m.status === 'MODIFIED');
  const plannedMeals = dayMeals.filter((m) => m.status === 'PLANNED');

  // Actual consumed totals (ONLY eaten meals count!)
  const actualCalories = eatenMeals.reduce((sum, m) => sum + m.totalCalories, 0);
  const actualProtein = eatenMeals.reduce((sum, m) => sum + m.totalProtein, 0);
  const actualCarbs = eatenMeals.reduce((sum, m) => sum + m.totalCarbs, 0);
  const actualFat = eatenMeals.reduce((sum, m) => sum + m.totalFat, 0);

  // Projected totals (if all planned meals are also eaten)
  const plannedCalories = plannedMeals.reduce((sum, m) => sum + m.totalCalories, 0);
  const plannedProtein = plannedMeals.reduce((sum, m) => sum + m.totalProtein, 0);
  const projectedCalories = actualCalories + plannedCalories;
  const projectedProtein = actualProtein + plannedProtein;

  // Remaining to target
  const remainingCalories = Math.max(0, profile.targetCalories - actualCalories);
  const remainingProtein = Math.max(0, profile.targetProtein - actualProtein);

  // Time-based greeting for Avi
  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'בוקר טוב, אבי!';
    if (hour < 17) return 'צהריים טובים, אבי!';
    if (hour < 21) return 'ערב טוב, אבי!';
    return 'לילה טוב, אבי!';
  }, []);

  // Quick hydration touch handlers
  const handleAddWater = (amountMl: number) => {
    const newTotal = Math.max(0, (dailyLog.waterMl || 0) + amountMl);
    onUpdateDailyLog({ waterMl: newTotal });
  };

  // Fasting window toggle
  const handleToggleWindow = () => {
    const nextState = !dailyLog.isWindowOpen;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if (nextState) {
      onUpdateDailyLog({ isWindowOpen: true, windowOpenTime: timeStr });
    } else {
      onUpdateDailyLog({ isWindowOpen: false, windowCloseTime: timeStr });
    }
  };

  // Coach's daily focal recommendation
  const focalRecommendation = React.useMemo(() => {
    if (remainingProtein > 40) {
      return {
        title: 'מה הדבר החשוב ביותר לעשות היום?',
        text: `אבי, נותרו עוד ${remainingProtein} גרם חלבון להשלמת היעד היומי (${profile.targetProtein} גרם). שלב בארוחת הערב מקור חלבון איכותי (כמו סלמון 200 גרם או חזה עוף) לצד ירקות מנקים, להבטחת שימור מסת השריר (59 ק"ג).`,
        actionQuestion: 'תכנן לי ארוחת ערב עשירה בחלבון',
      };
    }
    if ((dailyLog.waterMl || 0) < profile.targetWaterMl - 800) {
      return {
        title: 'פוקוס נוזלים והתאוששות',
        text: `שתית עד כה ${((dailyLog.waterMl || 0) / 1000).toFixed(1)} ליטר מים. שתיית מים מרובה היא מרכיב ליבה במסלול הניקוי לפינוי רעלים ולתחושת שובע. הוסף כוס מים עכשיו!`,
        actionQuestion: 'כמה מים כדאי לי לשתות היום?',
      };
    }
    if (!dailyLog.walkingMinutes || dailyLog.walkingMinutes < 45) {
      return {
        title: 'זמן לתנועה אירובית',
        text: `הליכה מהירה של 50–60 דקות היום תתמוך בחילוף החומרים ובשריפת השומן תוך התאוששות מיטבית.`,
        actionQuestion: 'איך לשלב את ההליכה היום?',
      };
    }
    return {
      title: 'המשך יציב ומדויק',
      text: `עמידה נהדרת ביעדי היום! אתה בגרעון קלורי מתון ותומך, עם מספיק חלבון וירקות מנקים. סגור את חלון האכילה ברוגע.`,
      actionQuestion: 'מה עשיתי טוב היום?',
    };
  }, [remainingProtein, profile.targetProtein, profile.targetWaterMl, dailyLog]);

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto px-4 pt-4">
      {/* Top Greeting & Fasting Status Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">{greeting}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            מסלול הניקוי · יעד 80–85 ק"ג · שימור שריר 59 ק"ג
          </p>
        </div>

        {/* Fasting Window Action Card */}
        <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800/80 rounded-xl px-3.5 py-2">
          <Clock className={`w-4 h-4 ${dailyLog.isWindowOpen ? 'text-amber-400' : 'text-indigo-400'}`} />
          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-medium">חלון 16/8</div>
            <div className="text-xs font-bold text-slate-200">
              {dailyLog.isWindowOpen ? 'חלון אכילה פתוח' : 'במצב צום'}
            </div>
          </div>
          <button
            onClick={handleToggleWindow}
            className={`mr-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              dailyLog.isWindowOpen
                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
                : 'bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30'
            }`}
          >
            {dailyLog.isWindowOpen ? 'סגור חלון (התחל צום)' : 'פתח חלון אכילה'}
          </button>
        </div>
      </div>

      {/* 3 Metric Cards: Calories, Protein, Water */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Metric 1: Calories */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              קלוריות בפועל
            </span>
            <span className="tabular-nums text-slate-400">
              יעד: {profile.targetCalories}
            </span>
          </div>

          <div className="my-3 flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-bold text-amber-300 tabular-nums">
                {actualCalories.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                נותרו עוד <span className="text-slate-200 font-semibold tabular-nums">{remainingCalories}</span> קק"ל
              </div>
            </div>

            {/* Circular / Progress Ring representation */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray={125.6}
                  strokeDashoffset={Math.max(
                    0,
                    125.6 - (125.6 * Math.min(100, (actualCalories / profile.targetCalories) * 100)) / 100
                  )}
                  className="text-amber-400 transition-all duration-500"
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-slate-300 tabular-nums">
                {Math.round((actualCalories / profile.targetCalories) * 100)}%
              </span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-800/80 flex justify-between">
            <span>צפוי עם תכנון:</span>
            <span className="font-medium text-slate-300 tabular-nums">{projectedCalories} קק"ל</span>
          </div>
        </div>

        {/* Metric 2: Protein */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4 text-purple-400" />
              חלבון יומי
            </span>
            <span className="tabular-nums text-slate-400">
              יעד: {profile.targetProtein}g
            </span>
          </div>

          <div className="my-3 flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-300 tabular-nums">
                {actualProtein}g
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                נותרו עוד <span className="text-slate-200 font-semibold tabular-nums">{remainingProtein}g</span>
              </div>
            </div>

            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray={125.6}
                  strokeDashoffset={Math.max(
                    0,
                    125.6 - (125.6 * Math.min(100, (actualProtein / profile.targetProtein) * 100)) / 100
                  )}
                  className="text-purple-400 transition-all duration-500"
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-slate-300 tabular-nums">
                {Math.round((actualProtein / profile.targetProtein) * 100)}%
              </span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-800/80 flex justify-between">
            <span>צפוי עם תכנון:</span>
            <span className="font-medium text-slate-300 tabular-nums">{projectedProtein}g חלבון</span>
          </div>
        </div>

        {/* Metric 3: Water */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-cyan-400" />
              שתיית מים
            </span>
            <span className="tabular-nums text-slate-400">
              יעד: {(profile.targetWaterMl / 1000).toFixed(1)}L
            </span>
          </div>

          <div className="my-2 flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-bold text-cyan-300 tabular-nums">
                {((dailyLog.waterMl || 0) / 1000).toFixed(2)}L
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {Math.round(((dailyLog.waterMl || 0) / profile.targetWaterMl) * 100)}% מהיעד היומי
              </div>
            </div>

            {/* Quick add water buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleAddWater(250)}
                className="px-2.5 py-1.5 bg-cyan-950 border border-cyan-800/60 hover:bg-cyan-900/60 text-cyan-300 rounded-lg text-xs font-semibold transition-colors"
                title="הוסף כוס מים (250 מ״ל)"
              >
                +250ml
              </button>
              <button
                onClick={() => handleAddWater(500)}
                className="px-2.5 py-1.5 bg-cyan-950 border border-cyan-800/60 hover:bg-cyan-900/60 text-cyan-300 rounded-lg text-xs font-semibold transition-colors"
                title="הוסף חצי ליטר (500 מ״ל)"
              >
                +500ml
              </button>
            </div>
          </div>

          {/* Hydration progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-cyan-400 h-1.5 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, ((dailyLog.waterMl || 0) / profile.targetWaterMl) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Central Focal Card: What is the most important thing to do today? */}
      <div className="bg-gradient-to-l from-slate-900 to-indigo-950/40 border border-indigo-900/40 rounded-2xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0 text-purple-300 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
              {focalRecommendation.title}
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed">
              {focalRecommendation.text}
            </p>

            {focalRecommendation.actionQuestion && (
              <button
                onClick={() => onAskCoachQuestion(focalRecommendation.actionQuestion)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-purple-300 hover:text-purple-200 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 px-3 py-1.5 rounded-lg transition-colors"
              >
                <span>התייעץ עם המאמן: "{focalRecommendation.actionQuestion}"</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Meals Section: Planning vs Actual Execution */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>ציר הארוחות להיום</span>
              <span className="text-xs font-normal text-slate-400">
                ({dayMeals.length} ארוחות רשומות)
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              הבחנה ברורה: ארוחה מתוכננת אינה נספרת בצריכה עד לאישור ביצוע
            </p>
          </div>

          {/* Action triggers */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenMealModal('PLANNED')}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors border border-slate-700/60"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>תכנן ארוחה</span>
            </button>

            <button
              onClick={() => onOpenMealModal('EATEN')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-600/20"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>דווח מה אכלתי (AI / צילום)</span>
            </button>
          </div>
        </div>

        {/* Planning & Actual Summary Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-emerald-300">נאכל בפועל:</span>
            <span className="tabular-nums font-bold text-white">{actualCalories} קק"ל</span>
            <span className="text-slate-600">·</span>
            <span className="tabular-nums font-bold text-purple-300">{actualProtein}g חלבון</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="font-semibold text-amber-300">תחזית עם התכנון:</span>
            <span className="tabular-nums font-bold text-slate-200">{projectedCalories} קק"ל</span>
            <span className="text-slate-600">·</span>
            <span className="tabular-nums font-bold text-purple-300">{projectedProtein}g חלבון</span>
          </div>
        </div>

        {/* Empty state or Meals timeline list */}
        {dayMeals.length === 0 ? (
          <div className="text-center py-8 px-4 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
            <Flame className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300 mb-1">
              טרם הוזנו ארוחות ליום זה
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              תכנן מראש את ארוחות היום או דווח ישירות באמצעות הקלדה חופשית ו-AI.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => onOpenMealModal('PLANNED')}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl transition-colors"
              >
                תכנן ארוחת ערב
              </button>
              <button
                onClick={onDuplicateFromYesterday}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                שכפל מאתמול
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {dayMeals
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((meal) => {
                const isPlanned = meal.status === 'PLANNED';
                const isEaten = meal.status === 'EATEN' || meal.status === 'MODIFIED';

                return (
                  <div
                    key={meal.id}
                    className={`bg-slate-900 border rounded-2xl p-4 transition-all ${
                      isPlanned
                        ? 'border-amber-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20'
                        : 'border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono tabular-nums text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                            {meal.time}
                          </span>

                          {/* Status Badge */}
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-md font-medium border ${
                              isPlanned
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                : meal.status === 'MODIFIED'
                                ? 'bg-teal-500/10 text-teal-300 border-teal-500/30'
                                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            }`}
                          >
                            {isPlanned
                              ? 'מתוכננת (טרם נאכלה)'
                              : meal.status === 'MODIFIED'
                              ? 'נאכלה בשינוי'
                              : 'נאכלה בפועל'}
                          </span>

                          <span className="text-xs text-slate-500">
                            {meal.mealType === 'breakfast'
                              ? 'ארוחת בוקר'
                              : meal.mealType === 'lunch'
                              ? 'ארוחת צהריים'
                              : meal.mealType === 'dinner'
                              ? 'ארוחת ערב'
                              : 'ארוחת ביניים'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-1.5">
                          {meal.imageUrl && (
                            <img
                              src={meal.imageUrl}
                              alt={meal.title}
                              className="w-10 h-10 object-cover rounded-lg border border-slate-700 shrink-0"
                            />
                          )}
                          <h4 className="text-sm font-bold text-white">{meal.title}</h4>
                        </div>

                        {/* Ingredients list */}
                        <div className="space-y-1 mb-2">
                          {meal.items.map((item) => (
                            <div
                              key={item.id}
                              className="text-xs text-slate-300 flex items-center justify-between gap-2"
                            >
                              <span className="flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-slate-600" />
                                <span>{item.name}</span>
                                <span className="text-slate-500">
                                  ({item.amount} {item.unit})
                                </span>
                              </span>
                              <div className="flex items-center gap-2 text-[11px] tabular-nums text-slate-400">
                                <span className="text-amber-400/90">{item.calories} קק"ל</span>
                                <span>·</span>
                                <span className="text-purple-400/90">{item.protein}g חלבון</span>
                                {item.isCleanPlan && (
                                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1 rounded">
                                    ניקוי
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {meal.notes && (
                          <p className="text-xs text-slate-400 italic bg-slate-950/50 p-2 rounded-lg border border-slate-800/60 mt-1">
                            {meal.notes}
                          </p>
                        )}
                      </div>

                      {/* Right macro totals badge */}
                      <div className="text-left shrink-0 bg-slate-950/80 border border-slate-800/80 p-2.5 rounded-xl">
                        <div className="text-sm font-bold text-amber-300 tabular-nums">
                          {meal.totalCalories} קק"ל
                        </div>
                        <div className="text-xs font-semibold text-purple-300 tabular-nums">
                          {meal.totalProtein}g חלבון
                        </div>
                        <div className="text-[10px] text-slate-500 tabular-nums mt-0.5">
                          {meal.totalCarbs}g פח' · {meal.totalFat}g שומן
                        </div>
                      </div>
                    </div>

                    {/* Meal card actions */}
                    <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800/80">
                      {isPlanned ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onConfirmPlannedMeal(meal.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm shadow-emerald-600/20"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>אכלתי עכשיו (אישור מהיר)</span>
                          </button>
                          <button
                            onClick={() => onOpenMealModal('MODIFIED', meal)}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                          >
                            אכלתי בשינוי כמויות
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            נכלל בסיכום היומי
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onOpenMealModal(meal.status, meal)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                          title="ערוך ארוחה"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteMeal(meal.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                          title="מחק ארוחה"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Activity & Workout Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Footprints className="w-4 h-4 text-emerald-400" />
          פעילות גופנית והליכות
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Walking Log */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Footprints className="w-3.5 h-3.5 text-teal-400" />
                הליכה מהירה
              </span>
              <span className="text-slate-500">יעד: 60 דק'</span>
            </div>

            <div className="flex items-center gap-3">
              <div>
                <label className="text-[10px] text-slate-500 block">דקות</label>
                <input
                  type="number"
                  value={dailyLog.walkingMinutes || ''}
                  placeholder="0"
                  onChange={(e) => onUpdateDailyLog({ walkingMinutes: Number(e.target.value) })}
                  className="w-20 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-center text-sm font-bold text-teal-300 tabular-nums focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block">קילומטרים</label>
                <input
                  type="number"
                  step="0.1"
                  value={dailyLog.walkingKm || ''}
                  placeholder="0.0"
                  onChange={(e) => onUpdateDailyLog({ walkingKm: Number(e.target.value) })}
                  className="w-20 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-center text-sm font-bold text-teal-300 tabular-nums focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="text-xs text-slate-400 pt-3">
                {dailyLog.walkingMinutes >= 50 ? 'יעד הליכה הושג!' : 'הליכה קבועה מנקה ומחטבת'}
              </div>
            </div>
          </div>

          {/* Strength Workout Toggle */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-purple-400" />
                אימון כוח
              </span>
              <span className="text-slate-500">יעד: 2–3 בשבוע</span>
            </div>

            <label className="flex items-center gap-2.5 my-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dailyLog.strengthWorkout}
                onChange={(e) => onUpdateDailyLog({ strengthWorkout: e.target.checked })}
                className="w-4 h-4 rounded border-slate-700 text-purple-600 focus:ring-0 bg-slate-900"
              />
              <span className="text-xs text-slate-200 font-medium">
                ביצעתי אימון כוח היום (משקולות / מאמנת)
              </span>
            </label>

            <input
              type="text"
              value={dailyLog.workoutNotes || ''}
              placeholder="הערות על האימון (תרגילים, משקלים)..."
              onChange={(e) => onUpdateDailyLog({ workoutNotes: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* End of day motivating recap */}
      <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 text-center">
        <p className="text-xs text-slate-400">
          "הצלחה בתהליך החיטוב של אבא חטוב נבנית מעקביות יומית רגועה — לא משלמות חד-פעמית."
        </p>
      </div>
    </div>
  );
};
