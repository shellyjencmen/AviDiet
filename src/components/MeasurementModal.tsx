import React, { useState } from 'react';
import { X, Scale, AlertCircle } from 'lucide-react';
import { MeasurementRecord } from '../types';

interface MeasurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: MeasurementRecord) => void;
  defaultDate: string;
  latestWeight?: number;
}

export const MeasurementModal: React.FC<MeasurementModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultDate,
  latestWeight = 93.4,
}) => {
  const [date, setDate] = useState(defaultDate);
  const [weight, setWeight] = useState(String(latestWeight));
  const [bodyFat, setBodyFat] = useState('31.2');
  const [muscleMass, setMuscleMass] = useState('59.2');
  const [waistCm, setWaistCm] = useState('99');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    const numWeight = parseFloat(weight);
    if (isNaN(numWeight) || numWeight <= 0) return;

    const record: MeasurementRecord = {
      id: `m-${Date.now()}`,
      date,
      weight: numWeight,
      bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
      muscleMass: muscleMass ? parseFloat(muscleMass) : undefined,
      waistCm: waistCm ? parseFloat(waistCm) : undefined,
      source: 'manual',
      notes: notes.trim() || undefined,
    };

    onSave(record);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">הזנת שקילה והרכב גוף</h2>
              <p className="text-xs text-slate-400">משקל Unique Health או מדידה ידנית</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">תאריך מדידה</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">משקל (ק״ג) *</label>
              <input
                type="number"
                step="0.05"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="93.4"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold tabular-nums text-center text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">אחוז שומן (%)</label>
              <input
                type="number"
                step="0.1"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                placeholder="31.2"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold tabular-nums text-center text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">מסת שריר (ק״ג)</label>
              <input
                type="number"
                step="0.1"
                value={muscleMass}
                onChange={(e) => setMuscleMass(e.target.value)}
                placeholder="59.2"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold tabular-nums text-center text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">היקף מותניים (ס״מ)</label>
              <input
                type="number"
                step="0.5"
                value={waistCm}
                onChange={(e) => setWaistCm(e.target.value)}
                placeholder="99"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold tabular-nums text-center text-sm focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">הערות על המדידה</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="שקילת בוקר בצום, אחרי הליכה..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span>
              מדדי אחוזי שומן ומסת שריר ממשקל חכם (Bio-Impedance) הם אומדנים שימושיים למעקב מגמה ולא ערכי מעבדה אבסולוטיים.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition-colors"
          >
            ביטול
          </button>
          <button
            onClick={handleSave}
            disabled={!weight}
            className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-teal-600/20"
          >
            שמור שקילה
          </button>
        </div>
      </div>
    </div>
  );
};
