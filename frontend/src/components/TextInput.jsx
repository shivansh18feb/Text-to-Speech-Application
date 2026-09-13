import React from 'react';
import { Trash2, Sparkles } from 'lucide-react';

export default function TextInput({
  text,
  onChange,
  onClear,
  maxLength = 1000,
  disabled = false,
  onSampleSelect,
}) {
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const isNearLimit = charCount > maxLength * 0.9;
  const isOverLimit = charCount > maxLength;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="tts-text-input" className="block text-sm font-semibold text-slate-800">
          Enter your text:
        </label>
        <div className="flex items-center space-x-2">
          {onSampleSelect && (
            <button
              type="button"
              onClick={() => onSampleSelect()}
              disabled={disabled}
              className="inline-flex items-center text-xs font-medium text-sky-600 hover:text-sky-700 disabled:opacity-50"
              title="Insert sample text"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Try sample
            </button>
          )}
          {text.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              disabled={disabled}
              className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-rose-600 disabled:opacity-50"
              title="Clear text"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <textarea
          id="tts-text-input"
          rows={5}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Type or paste the text you want converted to speech here..."
          className={`w-full p-3.5 text-sm sm:text-base rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all resize-y shadow-sm ${
            isOverLimit
              ? 'border-rose-500 focus:ring-rose-200 text-rose-900'
              : isNearLimit
              ? 'border-amber-400 focus:ring-amber-200'
              : 'border-slate-300 focus:border-sky-500 focus:ring-sky-100'
          }`}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1">
        <div className="flex items-center space-x-4">
          <span>
            Characters:{' '}
            <strong className={isOverLimit ? 'text-rose-600 font-bold' : 'text-slate-700'}>
              {charCount}
            </strong>
          </span>
          <span>
            Words: <strong className="text-slate-700">{wordCount}</strong>
          </span>
        </div>
        <div className="text-right">
          <span>Maximum: </span>
          <strong className="text-slate-700">{maxLength}</strong>
        </div>
      </div>

      {isOverLimit && (
        <p className="text-xs text-rose-600 font-medium">
          Text exceeds the maximum limit of {maxLength} characters by {charCount - maxLength} characters.
        </p>
      )}
    </div>
  );
}
