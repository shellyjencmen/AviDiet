import React, { useState, useEffect, useCallback } from 'react';
import { 
  UserProfile, 
  MealRecord, 
  DailyLog, 
  MeasurementRecord, 
  ChatMessage, 
  MealStatus 
} from './types';
import { 
  loadProfile, 
  saveProfile, 
  loadMeals, 
  saveMeals, 
  loadDailyLogs, 
  saveDailyLogs, 
  getDailyLogForDate, 
  loadMeasurements, 
  saveMeasurements, 
  loadChat, 
  saveChat, 
  exportAllDataToCSV, 
  resetStorageToDefaults 
} from './lib/storage';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { MyDayTab } from './components/MyDayTab';
import { ProgressTab } from './components/ProgressTab';
import { CoachTab } from './components/CoachTab';
import { MealModal } from './components/MealModal';
import { MeasurementModal } from './components/MeasurementModal';
import { ProfileModal } from './components/ProfileModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('my-day');
  const [currentDateStr, setCurrentDateStr] = useState<string>('2026-10-12');

  // Core persistent states
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [meals, setMeals] = useState<MealRecord[]>(loadMeals);
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLog>>(loadDailyLogs);
  const [measurements, setMeasurements] = useState<MeasurementRecord[]>(loadMeasurements);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(loadChat);

  // Modals state
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [mealModalDefaultStatus, setMealModalDefaultStatus] = useState<MealStatus>('EATEN');
  const [editingMeal, setEditingMeal] = useState<MealRecord | null>(null);

  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCoachLoading, setIsCoachLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show transient toast
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Today's daily log
  const currentDailyLog = dailyLogs[currentDateStr] || {
    date: currentDateStr,
    waterMl: 0,
    isWindowOpen: false,
    windowOpenTime: '12:00',
    windowCloseTime: '20:00',
    walkingMinutes: 0,
    walkingKm: 0,
    strengthWorkout: false,
  };

  // Update daily log
  const handleUpdateDailyLog = useCallback(
    (updates: Partial<DailyLog>) => {
      setDailyLogs((prev) => {
        const existing = prev[currentDateStr] || {
          date: currentDateStr,
          waterMl: 0,
          isWindowOpen: false,
          windowOpenTime: '12:00',
          windowCloseTime: '20:00',
          walkingMinutes: 0,
          walkingKm: 0,
          strengthWorkout: false,
        };
        const updated = { ...existing, ...updates };
        const next = { ...prev, [currentDateStr]: updated };
        saveDailyLogs(next);
        return next;
      });
    },
    [currentDateStr]
  );

  // Save meal (Create or Update)
  const handleSaveMeal = useCallback(
    (meal: MealRecord) => {
      setMeals((prev) => {
        const exists = prev.some((m) => m.id === meal.id);
        const updated = exists
          ? prev.map((m) => (m.id === meal.id ? meal : m))
          : [...prev, meal];
        saveMeals(updated);
        return updated;
      });
      showToast(meal.status === 'PLANNED' ? 'הארוחה נוספה לתכנון' : 'הארוחה נרשמה בהצלחה!');
    },
    [showToast]
  );

  // Confirm planned meal (converts to EATEN with 1 click)
  const handleConfirmPlannedMeal = useCallback(
    (mealId: string) => {
      setMeals((prev) => {
        const updated = prev.map((m) =>
          m.id === mealId ? { ...m, status: 'EATEN' as MealStatus } : m
        );
        saveMeals(updated);
        return updated;
      });
      showToast('הארוחה אושרה ונכללה בצריכה בפועל!');
    },
    [showToast]
  );

  // Delete meal
  const handleDeleteMeal = useCallback(
    (mealId: string) => {
      setMeals((prev) => {
        const updated = prev.filter((m) => m.id !== mealId);
        saveMeals(updated);
        return updated;
      });
      showToast('הארוחה נמחקה');
    },
    [showToast]
  );

  // Duplicate meals from yesterday
  const handleDuplicateFromYesterday = useCallback(() => {
    const curr = new Date(currentDateStr);
    curr.setDate(curr.getDate() - 1);
    const yesterdayStr = curr.toISOString().slice(0, 10);
    const yesterdayMeals = meals.filter((m) => m.date === yesterdayStr);

    if (yesterdayMeals.length === 0) {
      showToast('לא נמצאו ארוחות מאתמול לשכפול');
      return;
    }

    const duplicated: MealRecord[] = yesterdayMeals.map((m, idx) => ({
      ...m,
      id: `meal-dup-${Date.now()}-${idx}`,
      date: currentDateStr,
      status: 'PLANNED',
      notes: `שוכפל מאתמול (${yesterdayStr})`,
    }));

    setMeals((prev) => {
      const next = [...prev, ...duplicated];
      saveMeals(next);
      return next;
    });
    showToast(`${duplicated.length} ארוחות שוכפלו מאתמול בהצלחה כמתוכננות!`);
  }, [currentDateStr, meals, showToast]);

  // Open meal modal helper
  const handleOpenMealModal = useCallback(
    (defaultStatus: MealStatus, editMeal?: MealRecord) => {
      setMealModalDefaultStatus(defaultStatus);
      setEditingMeal(editMeal || null);
      setIsMealModalOpen(true);
    },
    []
  );

  // Save new measurement
  const handleSaveMeasurement = useCallback(
    (record: MeasurementRecord) => {
      setMeasurements((prev) => {
        const updated = [...prev, record];
        saveMeasurements(updated);
        return updated;
      });
      showToast(`שקילה חדשה (${record.weight} ק״ג) נשמרה בהצלחה!`);
    },
    [showToast]
  );

  // Save profile updates
  const handleSaveProfile = useCallback(
    (newProfile: UserProfile) => {
      setProfile(newProfile);
      saveProfile(newProfile);
      showToast('פרופיל ויעדים עודכנו בהצלחה!');
    },
    [showToast]
  );

  // Send message to Coach
  const handleSendMessage = useCallback(
    async (text: string) => {
      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        text,
        timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
      };

      const updatedChat = [...chatMessages, userMsg];
      setChatMessages(updatedChat);
      saveChat(updatedChat);
      setIsCoachLoading(true);

      try {
        // Calculate today's context
        const dayMeals = meals.filter((m) => m.date === currentDateStr);
        const eaten = dayMeals.filter((m) => m.status === 'EATEN' || m.status === 'MODIFIED');
        const planned = dayMeals.filter((m) => m.status === 'PLANNED');

        const eatenCalories = eaten.reduce((sum, m) => sum + m.totalCalories, 0);
        const eatenProtein = eaten.reduce((sum, m) => sum + m.totalProtein, 0);
        const projectedCalories = eatenCalories + planned.reduce((sum, m) => sum + m.totalCalories, 0);

        const latestWeight = measurements[measurements.length - 1]?.weight || profile.startWeight;

        const context = {
          currentWeight: latestWeight,
          targetCalories: profile.targetCalories,
          targetProtein: profile.targetProtein,
          eatenCalories,
          eatenProtein,
          projectedCalories,
          waterMl: currentDailyLog.waterMl,
          targetWaterMl: profile.targetWaterMl,
          eatingWindowOpen: currentDailyLog.isWindowOpen,
          eatenMealsSummary: eaten.map((m) => `${m.title} (${m.totalProtein}g חלבון, ${m.totalCalories} קק"ל)`),
          plannedMealsSummary: planned.map((m) => `${m.title} (${m.totalProtein}g חלבון, ${m.totalCalories} קק"ל)`),
        };

        const res = await fetch('/api/coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: updatedChat.map((c) => ({ role: c.role, text: c.text })),
            context,
          }),
        });

        if (!res.ok) throw new Error('שגיאה בתקשורת עם המאמן');

        const data = await res.json();
        const modelMsg: ChatMessage = {
          id: `msg-${Date.now()}-ai`,
          role: 'model',
          text: data.reply || 'אבי, אני כאן כדי לעזור לך להתקדם בעקביות!',
          timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
          action: data.action || undefined,
        };

        const finalChat = [...updatedChat, modelMsg];
        setChatMessages(finalChat);
        saveChat(finalChat);
      } catch (err: any) {
        console.error(err);
        const errorMsg: ChatMessage = {
          id: `msg-${Date.now()}-err`,
          role: 'model',
          text: 'אבי, הייתה בעיית תקשורת קלה. נסה שוב או בדוק את הנתונים שלך.',
          timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
        };
        const finalChat = [...updatedChat, errorMsg];
        setChatMessages(finalChat);
        saveChat(finalChat);
      } finally {
        setIsCoachLoading(false);
      }
    },
    [chatMessages, meals, currentDateStr, measurements, profile, currentDailyLog]
  );

  // Add suggested meal from Coach to planning
  const handleAddSuggestedMeal = useCallback(
    (action: any) => {
      if (!action) return;

      const newPlannedMeal: MealRecord = {
        id: `meal-coach-${Date.now()}`,
        date: currentDateStr,
        time: '19:30',
        mealType: action.mealType || 'dinner',
        status: 'PLANNED',
        title: action.title || 'ארוחה מוצעת מהמאמן',
        items: (action.items || []).map((it: any, idx: number) => ({
          id: `item-c-${Date.now()}-${idx}`,
          name: it.name,
          amount: it.amount || 1,
          unit: it.unit || 'מנה',
          calories: it.calories || 0,
          protein: it.protein || 0,
          carbs: it.carbs || 0,
          fat: it.fat || 0,
          isCleanPlan: it.isCleanPlan !== false,
          isEstimate: true,
        })),
        totalCalories: action.totalCalories || 0,
        totalProtein: action.totalProtein || 0,
        totalCarbs: 25,
        totalFat: 15,
        notes: 'הוצע על ידי מאמן ה-AI בהתאם ליעד החלבון ומסלול הניקוי',
      };

      setMeals((prev) => {
        const updated = [...prev, newPlannedMeal];
        saveMeals(updated);
        return updated;
      });

      showToast('הארוחה נוספה לתכנון היום ב-19:30! עבור ל"היום שלי" לצפייה.');
    },
    [currentDateStr, showToast]
  );

  // Trigger coach question from anywhere
  const handleAskCoachQuestion = useCallback(
    (q: string) => {
      setActiveTab('coach');
      handleSendMessage(q);
    },
    [handleSendMessage]
  );

  // Reset defaults
  const handleResetDefaults = useCallback(() => {
    resetStorageToDefaults();
    setProfile(loadProfile());
    setMeals(loadMeals());
    setDailyLogs(loadDailyLogs());
    setMeasurements(loadMeasurements());
    setChatMessages(loadChat());
    showToast('הנתונים אופסו בהצלחה לברירות המחדל של אבי.');
  }, [showToast]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Header with date and window status */}
      <Header
        currentDateStr={currentDateStr}
        onDateChange={setCurrentDateStr}
        onOpenSettings={() => setIsProfileModalOpen(true)}
        isWindowOpen={currentDailyLog.isWindowOpen}
      />

      {/* Main Tab View */}
      <main className="flex-1 w-full max-w-4xl mx-auto">
        {activeTab === 'my-day' && (
          <MyDayTab
            currentDateStr={currentDateStr}
            profile={profile}
            meals={meals}
            dailyLog={currentDailyLog}
            onUpdateDailyLog={handleUpdateDailyLog}
            onOpenMealModal={handleOpenMealModal}
            onConfirmPlannedMeal={handleConfirmPlannedMeal}
            onDeleteMeal={handleDeleteMeal}
            onDuplicateFromYesterday={handleDuplicateFromYesterday}
            onAskCoachQuestion={handleAskCoachQuestion}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressTab
            profile={profile}
            measurements={measurements}
            dailyLogs={dailyLogs}
            meals={meals}
            onOpenMeasurementModal={() => setIsMeasurementModalOpen(true)}
            onExportCSV={exportAllDataToCSV}
          />
        )}

        {activeTab === 'coach' && (
          <CoachTab
            profile={profile}
            meals={meals}
            dailyLog={currentDailyLog}
            currentDateStr={currentDateStr}
            chatMessages={chatMessages}
            onSendMessage={handleSendMessage}
            onAddSuggestedMeal={handleAddSuggestedMeal}
            isLoading={isCoachLoading}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Meal Entry / Edit Modal */}
      <MealModal
        isOpen={isMealModalOpen}
        onClose={() => setIsMealModalOpen(false)}
        onSaveMeal={handleSaveMeal}
        initialMeal={editingMeal}
        defaultDate={currentDateStr}
        defaultStatus={mealModalDefaultStatus}
      />

      {/* Measurement Modal */}
      <MeasurementModal
        isOpen={isMeasurementModalOpen}
        onClose={() => setIsMeasurementModalOpen(false)}
        onSave={handleSaveMeasurement}
        defaultDate={currentDateStr}
        latestWeight={measurements[measurements.length - 1]?.weight || 93.4}
      />

      {/* Profile & Settings Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
        onExportCSV={exportAllDataToCSV}
        onResetDefaults={handleResetDefaults}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
