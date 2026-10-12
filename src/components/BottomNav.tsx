import React from 'react';
import { Calendar, TrendingUp, MessageSquare } from 'lucide-react';

export type TabType = 'my-day' | 'progress' | 'coach';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  coachUnreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  coachUnreadCount = 0,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-md border-t border-slate-800/80 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-3 h-16 items-center px-4">
        {/* Tab 1: My Day */}
        <button
          onClick={() => onChangeTab('my-day')}
          className={`flex flex-col items-center justify-center py-1 transition-colors relative min-h-[44px] ${
            activeTab === 'my-day'
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar
            className={`w-5 h-5 transition-transform ${
              activeTab === 'my-day' ? 'scale-110 text-emerald-400' : ''
            }`}
          />
          <span className="text-[11px] mt-1 tracking-tight">היום שלי</span>
          {activeTab === 'my-day' && (
            <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
          )}
        </button>

        {/* Tab 2: My Progress */}
        <button
          onClick={() => onChangeTab('progress')}
          className={`flex flex-col items-center justify-center py-1 transition-colors relative min-h-[44px] ${
            activeTab === 'progress'
              ? 'text-teal-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp
            className={`w-5 h-5 transition-transform ${
              activeTab === 'progress' ? 'scale-110 text-teal-400' : ''
            }`}
          />
          <span className="text-[11px] mt-1 tracking-tight">ההתקדמות שלי</span>
          {activeTab === 'progress' && (
            <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-teal-400" />
          )}
        </button>

        {/* Tab 3: My Coach */}
        <button
          onClick={() => onChangeTab('coach')}
          className={`flex flex-col items-center justify-center py-1 transition-colors relative min-h-[44px] ${
            activeTab === 'coach'
              ? 'text-purple-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <MessageSquare
              className={`w-5 h-5 transition-transform ${
                activeTab === 'coach' ? 'scale-110 text-purple-400' : ''
              }`}
            />
            {coachUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-purple-500 ring-2 ring-slate-950" />
            )}
          </div>
          <span className="text-[11px] mt-1 tracking-tight">המאמן שלי</span>
          {activeTab === 'coach' && (
            <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-purple-400" />
          )}
        </button>
      </div>
    </nav>
  );
};
