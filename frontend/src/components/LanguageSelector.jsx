import React from 'react';
import { Globe } from 'lucide-react';

export default function LanguageSelector({
  languages = [],
  selectedLanguage,
  onChange,
  disabled = false,
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor="tts-language-select" className="block text-sm font-semibold text-slate-800">
        Language:
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Globe className="w-4 h-4" />
        </div>
        <select
          id="tts-language-select"
          value={selectedLanguage}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || languages.length === 0}
          className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 shadow-sm appearance-none cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name} {lang.nativeName && lang.nativeName !== lang.name ? `(${lang.nativeName})` : ''}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
