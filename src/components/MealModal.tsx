import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { MealRecord, MealItem, MealType, MealStatus } from '../types';

interface MealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMeal: (meal: MealRecord) => void;
  initialMeal?: MealRecord | null;
  defaultDate: string;
  defaultStatus?: MealStatus;
}

export const MealModal: React.FC<MealModalProps> = ({
  isOpen,
  onClose,
  onSaveMeal,
  initialMeal,
  defaultDate,
  defaultStatus = 'EATEN',
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
  const [naturalText, setNaturalText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Image upload state
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [status, setStatus] = useState<MealStatus>(defaultStatus);
  const [time, setTime] = useState('13:00');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<MealItem[]>([]);
  const [cleanEvaluation, setCleanEvaluation] = useState<string | null>(null);

  useEffect(() => {
    if (initialMeal) {
      setTitle(initialMeal.title);
      setMealType(initialMeal.mealType);
      setStatus(initialMeal.status);
      setTime(initialMeal.time);
      setNotes(initialMeal.notes || '');
      setItems(initialMeal.items);
      setImageBase64(initialMeal.imageUrl || null);
      setActiveTab('manual');
    } else {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      setTime(`${currentHours}:${currentMinutes}`);
      setStatus(defaultStatus);
      setTitle('');
      setNotes('');
      setNaturalText('');
      setItems([]);
      setImageBase64(null);
      setCleanEvaluation(null);
      setActiveTab('ai');
    }
  }, [initialMeal, defaultStatus, isOpen]);

  if (!isOpen) return null;

  // Handle image upload from file or camera
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImageBase64(result);
      if (!title) {
        setTitle('ארוחה מצולמת');
      }
    };
    reader.readAsDataURL(file);
  };

  // Totals calculated from items
  const totalCalories = items.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
  const totalProtein = items.reduce((sum, item) => sum + (Number(item.protein) || 0), 0);
  const totalCarbs = items.reduce((sum, item) => sum + (Number(item.carbs) || 0), 0);
  const totalFat = items.reduce((sum, item) => sum + (Number(item.fat) || 0), 0);

  // Parse natural language or image with Gemini API
  const handleParseWithAI = async () => {
    if (!naturalText.trim() && !imageBase64) return;
    setIsParsing(true);
    setParseError(null);

    try {
      const res = await fetch('/api/parse-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: naturalText.trim(), 
          mealType,
          imageBase64,
          imageMimeType
        }),
      });

      if (!res.ok) {
        throw new Error('שגיאה בניתוח הארוחה');
      }

      const data = await res.json();
      if (data.items && Array.isArray(data.items)) {
        const formattedItems: MealItem[] = data.items.map((item: any, idx: number) => ({
          id: `item-${Date.now()}-${idx}`,
          name: item.name || 'פריט מזון',
          amount: Number(item.amount) || 1,
          unit: item.unit || 'גרם',
          calories: Number(item.calories) || 0,
          protein: Number(item.protein) || 0,
          carbs: Number(item.carbs) || 0,
          fat: Number(item.fat) || 0,
          isCleanPlan: item.isCleanPlan !== false,
          isEstimate: item.isEstimate !== false,
          notes: item.notes || '',
        }));

        setItems(formattedItems);
        if (data.suggestedMealType) setMealType(data.suggestedMealType);
        if (!title) setTitle(naturalText.slice(0, 35) || 'ארוחה מצולמת');
        if (data.cleanEvaluation) setCleanEvaluation(data.cleanEvaluation);
        setActiveTab('manual');
      }
    } catch (err: any) {
      console.error(err);
      setParseError(err.message || 'לא ניתן היה לנתח את הארוחה. אנא נסה שוב או הזן ידנית.');
    } finally {
      setIsParsing(false);
    }
  };

  // Add empty item manually
  const handleAddItem = (preset?: Partial<MealItem>) => {
    const newItem: MealItem = {
      id: `item-${Date.now()}`,
      name: preset?.name || '',
      amount: preset?.amount || 100,
      unit: preset?.unit || 'גרם',
      calories: preset?.calories || 120,
      protein: preset?.protein || 10,
      carbs: preset?.carbs || 5,
      fat: preset?.fat || 2,
      isCleanPlan: preset?.isCleanPlan !== false,
      isEstimate: true,
      notes: preset?.notes || '',
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleUpdateItem = (id: string, updates: Partial<MealItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = () => {
    if (items.length === 0 && !title.trim() && !imageBase64) return;

    const mealRecord: MealRecord = {
      id: initialMeal?.id || `meal-${Date.now()}`,
      date: initialMeal?.date || defaultDate,
      time,
      mealType,
      status,
      title: title.trim() || (items[0]?.name ? `${items[0].name}...` : 'ארוחה ללא שם'),
      items,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      notes,
      imageUrl: imageBase64 || undefined,
    };

    onSaveMeal(mealRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              {initialMeal ? 'עריכת ארוחה' : status === 'PLANNED' ? 'תכנון ארוחה חדשה' : 'דיווח אכילה בפועל'}
            </h2>
            <p className="text-xs text-slate-400">
              {status === 'PLANNED' ? 'יופיע בתוכנית הצפויה ולא ישפיע על הנאכל בפועל' : 'יתעדכן מיידית בצריכת הקלוריות והחלבון היומית'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode switcher */}
        <div className="flex p-2 bg-slate-950/50 border-b border-slate-800 gap-1.5 px-4">
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-2 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'ai'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>דיווח מהיר: תמונה או שפה חופשית (AI)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'manual'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>פירוט רכיבים וכמויות</span>
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* AI / Image input tab */}
          {activeTab === 'ai' && (
            <div className="space-y-3">
              {/* Image upload / camera trigger */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                />

                {!imageBase64 ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 px-4 bg-slate-950/80 hover:bg-slate-950 border-2 border-dashed border-slate-700 hover:border-purple-500/60 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-300 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-bold text-white block">
                        📸 צלם או העלה תמונה של הצלחת או תווית המזון
                      </span>
                      <span className="text-[11px] text-slate-500">
                        ה-AI יזהה את המרכיבים, יעריך כמויות ויחשב ערכים תזונתיים
                      </span>
                    </div>
                  </button>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-purple-500/40 bg-slate-950 p-2 flex items-center gap-3">
                    <img
                      src={imageBase64}
                      alt="תמונת ארוחה"
                      className="w-20 h-20 object-cover rounded-xl shrink-0 border border-slate-800"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-purple-300 block mb-0.5">
                        תמונה נבחרה בהצלחה
                      </span>
                      <p className="text-[11px] text-slate-400">
                        ניתן להוסיף פירוט טקסטואלי או ללחוץ ישירות על "נתח תמונה באמצעות AI"
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setImageBase64(null)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="הסר תמונה"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Natural language description */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  תיאור טקסטואלי (אופציונלי אם צורפה תמונה):
                </label>
                <textarea
                  value={naturalText}
                  onChange={(e) => setNaturalText(e.target.value)}
                  rows={2}
                  placeholder="לדוגמה: אכלתי 200 גרם חזה עוף צלוי, 6 כפות קינואה מבושלת, סלט קצוץ עם כף טחינה גולמית..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isParsing || (!naturalText.trim() && !imageBase64)}
                  onClick={handleParseWithAI}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-600/20"
                >
                  <Sparkles className="w-4 h-4" />
                  {isParsing
                    ? 'ה-AI מנתח את התמונה והרכיבים...'
                    : imageBase64
                    ? 'נתח תמונת ארוחה וחלץ ערכים'
                    : 'נתח ארוחה וחלץ ערכים'}
                </button>
              </div>

              {parseError && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              {/* Clean Presets */}
              <div className="pt-1">
                <span className="text-[11px] text-slate-400 block mb-1.5">הצעות מהירות למסלול הניקוי:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '200 גרם חזה עוף עם קינואה וסלט',
                    '200 גרם סלמון בתנור עם עדשים וברוקולי',
                    'חביתה מ-2 ביצים עם סלט ירקות וטחינה',
                    'שייק חלבון עם מים וגרגרי יער',
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNaturalText(preset)}
                      className="text-[11px] bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 rounded-lg px-2.5 py-1 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Structured fields & items */}
          <div className="space-y-3">
            {cleanEvaluation && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">בדיקת מסלול הניקוי:</span>
                  <span>{cleanEvaluation}</span>
                </div>
              </div>
            )}

            {/* Title, Type, Status, Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">כותרת הארוחה</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="למשל: צהריים עשיר בחלבון"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">סוג ארוחה</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as MealType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="breakfast">ארוחת בוקר</option>
                  <option value="lunch">ארוחת צהריים</option>
                  <option value="dinner">ארוחת ערב</option>
                  <option value="snack">ארוחת ביניים / שייק</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">סטטוס ארוחה</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as MealStatus)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="EATEN">נאכלה (נכללת בצריכה בפועל)</option>
                  <option value="PLANNED">מתוכננת (רק בתחזית)</option>
                  <option value="MODIFIED">נאכלה בשינוי</option>
                  <option value="CANCELLED">בוטלה</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">שעה</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 text-center"
                />
              </div>
            </div>

            {/* Ingredients table / list */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-200">
                  רכיבי הארוחה ({items.length})
                </span>
                <button
                  type="button"
                  onClick={() => handleAddItem()}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  הוסף פריט
                </button>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-4 bg-slate-950/40 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
                  טרם נוספו רכיבים. העלה תמונה, הקלד ב-AI או לחץ על "הוסף פריט".
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                          placeholder="שם המאכל"
                          className="flex-1 bg-transparent border-b border-slate-800 py-1 text-slate-200 font-medium focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-slate-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500 block">כמות</label>
                          <input
                            type="number"
                            value={item.amount}
                            onChange={(e) => handleUpdateItem(item.id, { amount: Number(e.target.value) })}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-center text-slate-200 tabular-nums"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block">יחידה</label>
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => handleUpdateItem(item.id, { unit: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-center text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block">קלוריות</label>
                          <input
                            type="number"
                            value={item.calories}
                            onChange={(e) => handleUpdateItem(item.id, { calories: Number(e.target.value) })}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-center text-amber-300 font-semibold tabular-nums"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block">חלבון (g)</label>
                          <input
                            type="number"
                            value={item.protein}
                            onChange={(e) => handleUpdateItem(item.id, { protein: Number(e.target.value) })}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-center text-purple-300 font-semibold tabular-nums"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-900">
                        <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.isCleanPlan}
                            onChange={(e) => handleUpdateItem(item.id, { isCleanPlan: e.target.checked })}
                            className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                          />
                          <span>תואם ניקוי אבא חטוב</span>
                        </label>
                        <span className="text-[10px] text-slate-500">
                          {item.isEstimate ? 'אומדן משוער' : 'מדויק'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Totals Banner */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">סך הכל בארוחה זו:</span>
              <div className="flex items-center gap-3">
                <span className="text-amber-400 font-bold tabular-nums">
                  {totalCalories} קק"ל
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-purple-400 font-bold tabular-nums">
                  {totalProtein}g חלבון
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400 tabular-nums">
                  {totalCarbs}g פח'
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
          >
            ביטול
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={items.length === 0 && !title.trim() && !imageBase64}
            className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
          >
            {initialMeal ? 'שמור שינויים' : status === 'PLANNED' ? 'שמור כתכנון' : 'אשר ושמור דיווח'}
          </button>
        </div>
      </div>
    </div>
  );
};
