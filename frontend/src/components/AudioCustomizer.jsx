import React from 'react';
import { Sliders, Gauge, Music, Sparkles } from 'lucide-react';

export default function AudioCustomizer({
  speed,
  onSpeedChange,
  pitch,
  onPitchChange,
  voiceStyle,
  onVoiceStyleChange,
  disabled = false,
}) {
  const styles = ['Standard', 'Cheerful', 'Professional', 'Storyteller'];

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Sliders className="w-4 h-4 text-sky-600" />
          <span>Voice & Audio Customization</span>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">Fine-tune synthesis</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Speaking Speed */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center space-x-1">
              <Gauge className="w-3.5 h-3.5 text-slate-500" />
              <span>Speed:</span>
            </span>
            <span className="text-sky-600 font-bold font-mono">{speed.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={speed}
            disabled={disabled}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600 disabled:opacity-50"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0.5x</span>
            <span>1.0x</span>
            <span>2.0x</span>
          </div>
        </div>

        {/* Pitch */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center space-x-1">
              <Music className="w-3.5 h-3.5 text-slate-500" />
              <span>Pitch:</span>
            </span>
            <span className="text-indigo-600 font-bold font-mono">{pitch.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={pitch}
            disabled={disabled}
            onChange={(e) => onPitchChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Low (0.5)</span>
            <span>Normal (1.0)</span>
            <span>High (1.5)</span>
          </div>
        </div>

        {/* Voice Style */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Voice Style:</span>
            </span>
          </div>
          <select
            value={voiceStyle}
            disabled={disabled}
            onChange={(e) => onVoiceStyleChange(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 shadow-sm cursor-pointer disabled:bg-slate-100"
          >
            {styles.map((s) => (
              <option key={s} value={s}>
                {s} Style
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
