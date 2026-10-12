import React, { useState } from 'react';
import { X, User, Save, Download, RotateCcw, Shield, Check } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onExportCSV: () => void;
  onResetDefaults: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onExportCSV,
  onResetDefaults,
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field: keyof UserProfile, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">פרופיל אישי ויעדי תזונה</h2>
              <p className="text-xs text-slate-400">הגדרות עבור {profile.name} (בן {profile.age})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Baseline metrics (read-only reference) */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-1.5">
            <span className="font-semibold text-slate-300 block mb-1">
              נתוני בסיס היסטוריים (15.9.2026):
            </span>
            <div className="grid grid-cols-3 gap-2 text-slate-400 text-[11px] tabular-nums">
              <div>משקל התחלתי: <span className="text-slate-200 font-bold">{profile.startWeight} ק״ג</span></div>
              <div>שומן בסיס: <span className="text-slate-200 font-bold">{profile.startBodyFat}%</span></div>
              <div>מסת שריר בסיס: <span className="text-slate-200 font-bold">{profile.startMuscleMass} ק״ג</span></div>
            </div>
            <div className="text-[10px] text-slate-500 pt-1">
              גובה: {profile.heightCm} ס"מ · אמצעי מדידה: {profile.scaleModel}
            </div>
          </div>

          {/* Editable Targets */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-200 text-xs">יעדים יומיים מותאמים</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">יעד קלורי יומי (קק״ל)</label>
                <input
                  type="number"
                  value={formData.targetCalories}
                  onChange={(e) => handleChange('targetCalories', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold tabular-nums text-center"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">יעד חלבון יומי (גרם)</label>
                <input
                  type="number"
                  value={formData.targetProtein}
                  onChange={(e) => handleChange('targetProtein', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold tabular-nums text-center"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">יעד מים יומי (מ״ל)</label>
                <input
                  type="number"
                  step="100"
                  value={formData.targetWaterMl}
                  onChange={(e) => handleChange('targetWaterMl', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold tabular-nums text-center"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">שעות חלון צום</label>
                <input
                  type="number"
                  value={formData.fastWindowHours}
                  onChange={(e) => handleChange('fastWindowHours', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold tabular-nums text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-400 mb-1">יעד משקל מינימלי (ק״ג)</label>
                <input
                  type="number"
                  value={formData.targetWeightMin}
                  onChange={(e) => handleChange('targetWeightMin', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold tabular-nums text-center"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">יעד משקל מקסימלי (ק״ג)</label>
                <input
                  type="number"
                  value={formData.targetWeightMax}
                  onChange={(e) => handleChange('targetWeightMax', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold tabular-nums text-center"
                />
              </div>
            </div>
          </div>

          {/* Privacy & PHI notice */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300 block mb-0.5">
                אבטחה ופרטיות מידע
              </span>
              <span>
                האפליקציה פועלת במרחב פרטי ומיועדת לאבי בלבד. אין לשמור פרטים רפואיים מוגנים או תרופות. כל הנתונים נשמרים מקומית בדפדפן ובשרת הפנימי של האפליקציה.
              </span>
            </div>
          </div>

          {/* Actions: Export CSV & Reset */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <button
              type="button"
              onClick={onExportCSV}
              className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4 text-teal-400" />
              <span>ייצוא כל הנתונים לקובץ CSV (אקסל)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('האם לאפס את הנתונים לברירות המחדל של אבי?')) {
                  onResetDefaults();
                  onClose();
                }
              }}
              className="w-full py-2 px-3 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/30 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>איפוס נתונים לברירות המחדל</span>
            </button>
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>נשמר בהצלחה!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>שמור הגדרות פרופיל</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
