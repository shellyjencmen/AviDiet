import React from 'react';
import { ChevronRight, ChevronLeft, Settings, Flame, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  currentDateStr: string;
  onDateChange: (dateStr: string) => void;
  onOpenSettings: () => void;
  isWindowOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentDateStr,
  onDateChange,
  onOpenSettings,
  isWindowOpen,
}) => {
  // Date navigation helpers
  const handlePrevDay = () => {
    const d = new Date(currentDateStr);
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().slice(0, 10));
  };

  const handleNextDay = () => {
    const d = new Date(currentDateStr);
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().slice(0, 10));
  };

  const handleToday = () => {
    onDateChange('2026-10-12');
  };

  // Format date nicely in Hebrew
  const formattedDate = React.useMemo(() => {
    try {
      const date = new Date(currentDateStr);
      const isToday = currentDateStr === '2026-10-12';
      const formatted = date.toLocaleDateString('he-IL', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
      });
      return isToday ? `היום, ${formatted}` : formatted;
    } catch {
      return currentDateStr;
    }
  }, [currentDateStr]);

  return (
    <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Zone: 1 clean line wordmark */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-sm shadow-emerald-500/20 text-white font-bold text-sm">
            אח
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5 leading-none">
              אבא חטוב AI
            </h1>
            <span className="text-[11px] text-slate-400 font-normal">
              המאמן של אבי · מסלול ניקוי
            </span>
          </div>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl px-1.5 py-1 text-xs">
          <button
            onClick={handlePrevDay}
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
            title="יום קודם"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleToday}
            className="px-2 py-1 font-medium text-slate-200 hover:text-emerald-400 transition-colors whitespace-nowrap"
          >
            {formattedDate}
          </button>

          <button
            onClick={handleNextDay}
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
            title="יום הבא"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Window status indicator & Settings */}
        <div className="flex items-center gap-2">
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
              isWindowOpen
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isWindowOpen ? 'bg-amber-400' : 'bg-indigo-400'
              }`}
            />
            <span>{isWindowOpen ? 'חלון אכילה פתוח' : 'צום פעיל'}</span>
          </div>

          <button
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="הגדרות ופרופיל"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
