import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  User, 
  Plus, 
  CheckCircle2, 
  Flame, 
  Dumbbell, 
  Clock, 
  RefreshCw 
} from 'lucide-react';
import { ChatMessage, UserProfile, MealRecord, DailyLog } from '../types';

interface CoachTabProps {
  profile: UserProfile;
  meals: MealRecord[];
  dailyLog: DailyLog;
  currentDateStr: string;
  chatMessages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onAddSuggestedMeal: (action: any) => void;
  isLoading: boolean;
}

export const CoachTab: React.FC<CoachTabProps> = ({
  profile,
  meals,
  dailyLog,
  currentDateStr,
  chatMessages,
  onSendMessage,
  onAddSuggestedMeal,
  isLoading,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const msg = inputText.trim();
    setInputText('');
    await onSendMessage(msg);
  };

  const handleQuickQuestion = async (q: string) => {
    if (isLoading) return;
    await onSendMessage(q);
  };

  // Quick prompt suggestions
  const quickQuestions = [
    'מה כדאי לי לאכול עכשיו?',
    'תכנן לי ארוחת ערב עשירה בחלבון',
    'כמה חלבון עוד חסר לי היום?',
    'מה יקרה אם אוכל עכשיו שתי פרוסות פיצה?',
    'מה עשיתי טוב היום?',
    'איך התקדמתי בשבוע האחרון?',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-125px)] max-w-4xl mx-auto px-4 pb-16">
      {/* Coach Info Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 mb-3 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-600/20">
            <Sparkles className="w-5 h-5 text-purple-200" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>המאמן האישי של אבי</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                AI מחובר לנתונים
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              מכיר את מסלול הניקוי, צריכת היום, חלון האכילה ויעדי המשקל
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <span className="tabular-nums font-semibold text-slate-300">
            יעד 80–85 ק״ג · 59 ק״ג שריר
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pl-1">
        {chatMessages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-none shadow-md shadow-emerald-600/10'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1 text-[10px] opacity-75">
                  <span className="font-semibold">{isUser ? 'אבי' : 'המאמן האישי'}</span>
                  <span className="tabular-nums">{msg.timestamp}</span>
                </div>

                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Actionable Coach Card if an action is attached */}
                {msg.action && msg.action.type === 'SUGGEST_MEAL' && (
                  <div className="mt-3.5 p-3 rounded-xl bg-slate-950/80 border border-purple-500/30 text-xs space-y-2.5">
                    <div className="flex items-center justify-between text-purple-300 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        הצעה לפעולה: {msg.action.title || 'ארוחה מוצעת'}
                      </span>
                      <span className="tabular-nums text-amber-300">
                        {msg.action.totalCalories} קק"ל · {msg.action.totalProtein}g חלבון
                      </span>
                    </div>

                    {msg.action.items && (
                      <div className="space-y-1 text-slate-300 text-[11px]">
                        {msg.action.items.map((it: any, i: number) => (
                          <div key={i} className="flex justify-between">
                            <span>• {it.name} ({it.amount} {it.unit})</span>
                            <span className="tabular-nums text-slate-400">{it.protein}g חלבון</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => onAddSuggestedMeal(msg.action)}
                      className="w-full mt-2 py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-600/20"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>הוסף לתכנון הארוחות שלי להיום</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-end gap-2 text-xs text-slate-400">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
              <span>המאמן חושב ומחשב ערכים...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chips */}
      <div className="pt-2 pb-2 overflow-x-auto no-scrollbar shrink-0">
        <div className="flex items-center gap-1.5 min-w-max">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickQuestion(q)}
              className="text-[11px] bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl px-3 py-1.5 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 shrink-0 bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-lg"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="שאל את המאמן או בקש תכנון (למשל: תכנן לי ארוחת ערב עם דג)..."
          disabled={isLoading}
          className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
        />

        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-md shadow-purple-600/20 shrink-0"
          title="שלח למאמן"
        >
          <Send className="w-4 h-4 rotate-180" />
        </button>
      </form>
    </div>
  );
};
