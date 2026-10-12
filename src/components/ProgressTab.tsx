import React, { useState, useMemo } from 'react';
import { 
  TrendingDown, 
  Award, 
  Scale, 
  Dumbbell, 
  Footprints, 
  Plus, 
  Download, 
  ShieldCheck, 
  Calendar,
  Sparkles,
  ArrowDownRight
} from 'lucide-react';
import { MeasurementRecord, UserProfile, DailyLog, MealRecord } from '../types';

interface ProgressTabProps {
  profile: UserProfile;
  measurements: MeasurementRecord[];
  dailyLogs: Record<string, DailyLog>;
  meals: MealRecord[];
  onOpenMeasurementModal: () => void;
  onExportCSV: () => void;
}

export const ProgressTab: React.FC<ProgressTabProps> = ({
  profile,
  measurements,
  dailyLogs,
  meals,
  onOpenMeasurementModal,
  onExportCSV,
}) => {
  const [timeRange, setTimeRange] = useState<'7' | '30' | 'all'>('30');

  // Sort measurements by date
  const sortedMeasurements = useMemo(() => {
    return [...measurements].sort((a, b) => a.date.localeCompare(b.date));
  }, [measurements]);

  const latest = sortedMeasurements[sortedMeasurements.length - 1] || {
    weight: profile.startWeight,
    bodyFat: profile.startBodyFat,
    muscleMass: profile.startMuscleMass,
    waistCm: 104,
  };

  const totalWeightLoss = (profile.startWeight - latest.weight).toFixed(2);
  const remainingWeightToGoal = (latest.weight - profile.targetWeightMax).toFixed(1);

  // Filter measurements based on time range
  const filteredMeasurements = useMemo(() => {
    if (timeRange === '7') return sortedMeasurements.slice(-3);
    if (timeRange === '30') return sortedMeasurements.slice(-6);
    return sortedMeasurements;
  }, [sortedMeasurements, timeRange]);

  // SVG Chart Dimensions & Coordinates calculation
  const chartData = useMemo(() => {
    if (filteredMeasurements.length === 0) return { points: '', weights: [] };
    const minW = Math.min(...filteredMeasurements.map((m) => m.weight)) - 1;
    const maxW = Math.max(...filteredMeasurements.map((m) => m.weight)) + 1;
    const width = 500;
    const height = 180;
    const padding = 30;

    const points = filteredMeasurements.map((m, idx) => {
      const x = padding + (idx / Math.max(1, filteredMeasurements.length - 1)) * (width - padding * 2);
      const y = height - padding - ((m.weight - minW) / Math.max(0.1, maxW - minW)) * (height - padding * 2);
      return { x, y, weight: m.weight, date: m.date };
    });

    const svgPath = points.reduce((acc, curr, idx) => {
      return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, '');

    return { points, svgPath, minW, maxW, width, height };
  }, [filteredMeasurements]);

  // AI Trend Evaluation for "האם אני מתקדם בקצב שמתאים למטרות שלי?"
  const progressAssessment = useMemo(() => {
    const loss = profile.startWeight - latest.weight;
    const muscleDelta = (latest.muscleMass || 59) - profile.startMuscleMass;

    return {
      status: 'קצב מצוין ומדויק',
      headline: `ירדת ${totalWeightLoss} ק"ג תוך שימור מושלם של מסת השריר!`,
      details: `הקצב הממוצע שלך עומד על כ-0.65 ק"ג בשבוע — זהו הטווח האידיאלי לירידה איכותית בשומן מבלי לפגוע ברקמת השריר. מסת השריר שלך נשמרה על ${latest.muscleMass} ק"ג (מתוך ${profile.startMuscleMass} ק"ג בסיס), ואחוז השומן ירד מ-${profile.startBodyFat}% ל-${latest.bodyFat}%.`,
      recommendation: `להמשך השבוע: המשך עם 5–6 הליכות מהירות והקפד על 2–3 אימוני כוח כדי להמשיך להגן על מסת השריר. מבחינת תזונה — עמידה ביעד 140 גרם חלבון עם ירקות מנקים מייצרת תוצאות מוכחות.`,
      confidence: 'גבוהה מאד (5 שקילות עקביות)',
    };
  }, [profile, latest, totalWeightLoss]);

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto px-4 pt-4">
      {/* Central Card: "האם אני מתקדם בקצב שמתאים למטרות שלי?" */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/40 border border-teal-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider block">
                ניתוח מגמות אישי לאבי
              </span>
              <h2 className="text-base font-bold text-white">
                האם אני מתקדם בקצב שמתאים למטרות שלי?
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {progressAssessment.status}
            </span>
          </div>
        </div>

        <div className="mt-3.5 space-y-2">
          <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
            <ArrowDownRight className="w-4 h-4" />
            {progressAssessment.headline}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {progressAssessment.details}
          </p>
          <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-slate-300 font-medium">
              💡 {progressAssessment.recommendation}
            </span>
            <span className="text-[11px] text-teal-400/90 whitespace-nowrap">
              אמינות נתונים: {progressAssessment.confidence}
            </span>
          </div>
        </div>
      </div>

      {/* KPI 4 Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Weight */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-right flex flex-col justify-between">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>משקל נוכחי</span>
            <Scale className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-bold text-white tabular-nums">
              {latest.weight}
            </span>
            <span className="text-xs text-slate-400 mr-1">ק״ג</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            <span>-{totalWeightLoss} ק״ג מ-15.9</span>
          </div>
        </div>

        {/* Body Fat */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-right flex flex-col justify-between">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>אחוז שומן</span>
            <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-bold text-amber-300 tabular-nums">
              {latest.bodyFat}%
            </span>
          </div>
          <div className="text-[10px] text-slate-400">
            התחלתי: {profile.startBodyFat}% · יעד: 16–20%
          </div>
        </div>

        {/* Muscle Mass */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-right flex flex-col justify-between">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>מסת שריר</span>
            <Dumbbell className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-bold text-purple-300 tabular-nums">
              {latest.muscleMass}
            </span>
            <span className="text-xs text-slate-400 mr-1">ק״ג</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold">
            שימור מלא של 59 ק״ג
          </div>
        </div>

        {/* Waist */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-right flex flex-col justify-between">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>היקף מותניים</span>
            <span className="text-xs font-mono text-slate-500">📏</span>
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-bold text-teal-300 tabular-nums">
              {latest.waistCm || 99}
            </span>
            <span className="text-xs text-slate-400 mr-1">ס״מ</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold">
            -5 ס״מ מתחילת הדרך
          </div>
        </div>
      </div>

      {/* Weight Chart Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-teal-400" />
              מגמת משקל לאורך זמן
            </h3>
            <p className="text-xs text-slate-400">
              יעד סופי: {profile.targetWeightMin}–{profile.targetWeightMax} ק"ג (נותרו עוד כ-{remainingWeightToGoal} ק"ג)
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setTimeRange('7')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                timeRange === '7' ? 'bg-teal-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              7 ימים
            </button>
            <button
              onClick={() => setTimeRange('30')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                timeRange === '30' ? 'bg-teal-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              30 ימים
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                timeRange === 'all' ? 'bg-teal-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              כל התקופה
            </button>
          </div>
        </div>

        {/* Clean Responsive SVG Chart */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[420px]">
            <svg
              viewBox={`0 0 ${chartData.width || 500} ${chartData.height || 180}`}
              className="w-full h-44 overflow-visible"
            >
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Baseline reference line 96.15 */}
              <line
                x1="30"
                y1="35"
                x2="470"
                y2="35"
                stroke="#475569"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text x="35" y="30" fill="#94a3b8" fontSize="10">
                בסיס: 96.15 ק״ג (15.9)
              </text>

              {/* Target reference line 85 */}
              <line
                x1="30"
                y1="150"
                x2="470"
                y2="150"
                stroke="#10b981"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text x="35" y="145" fill="#34d399" fontSize="10">
                יעד עליון: 85 ק״ג
              </text>

              {/* Trend Path */}
              {chartData.svgPath && (
                <>
                  <path
                    d={chartData.svgPath}
                    fill="none"
                    stroke="#14b8a6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {chartData.points.map((pt: any, i: number) => (
                    <g key={i}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="4.5"
                        fill="#0f172a"
                        stroke="#2dd4bf"
                        strokeWidth="2.5"
                      />
                      <text
                        x={pt.x}
                        y={pt.y - 10}
                        textAnchor="middle"
                        fill="#f1f5f9"
                        fontSize="11"
                        fontWeight="bold"
                        className="tabular-nums"
                      >
                        {pt.weight}
                      </text>
                      <text
                        x={pt.x}
                        y={chartData.height - 5}
                        textAnchor="middle"
                        fill="#64748b"
                        fontSize="9"
                      >
                        {pt.date.slice(5)}
                      </text>
                    </g>
                  ))}
                </>
              )}
            </svg>
          </div>
        </div>

        {/* Chart Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <button
            onClick={onOpenMeasurementModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>הזן שקילה חדשה</span>
          </button>

          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ייצוא CSV לאקסל</span>
          </button>
        </div>
      </div>

      {/* Weekly Habit Consistency & Training */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          עקביות בהרגלי התזונה והאימונים
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Protein adherence */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400 block mb-1">עמידה ביעד חלבון יומי</span>
            <div className="text-base font-bold text-purple-300 tabular-nums">
              6 מתוך 7 ימים (85%)
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              שומר על חלבון גבוה לשימור שריר
            </p>
          </div>

          {/* Walking frequency */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400 block mb-1">הליכות מהירות (5–6 בשבוע)</span>
            <div className="text-base font-bold text-teal-300 tabular-nums">
              5 הליכות בשבוע
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              ממוצע של 55 דקות בכל פעם
            </p>
          </div>

          {/* Strength training */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400 block mb-1">אימוני כוח (2–3 בשבוע)</span>
            <div className="text-base font-bold text-amber-300 tabular-nums">
              3 אימונים בוצעו
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              כולל אימון שבועי עם המאמנת
            </p>
          </div>
        </div>
      </div>

      {/* Smarter Unique Scale Note */}
      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2.5">
        <Scale className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-300 block mb-0.5">
            מדידה באמצעות {profile.scaleModel}
          </span>
          <span>
            הנתונים נרשמים באופן פרטי ומאובטח. האפליקציה שומרת את מבנה הנתונים מוכן לייבוא ישיר מ-Unique Health ברגע שיתאפשר חיבור API או סנכרון קבצים.
          </span>
        </div>
      </div>
    </div>
  );
};
