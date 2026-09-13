import React, { useState } from 'react';
import { Sparkles, Wand2, Check, ArrowRight, Loader2, MessageSquareQuote, SpellCheck, RefreshCw, FileText } from 'lucide-react';
import { enhanceText } from '../services/api';

export default function AiToolsTab({ initialText = '', onApplyEnhancedText }) {
  const [inputText, setInputText] = useState(initialText);
  const [outputText, setOutputText] = useState('');
  const [selectedAction, setSelectedAction] = useState('conversational');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [providerBadge, setProviderBadge] = useState('');

  const actions = [
    { id: 'conversational', label: 'Conversational Speech', icon: MessageSquareQuote, desc: 'Optimizes cadence and phrases for natural spoken listening' },
    { id: 'grammar', label: 'Grammar & Punctuation', icon: SpellCheck, desc: 'Corrects capitalization, typos, and sentence structure' },
    { id: 'summarize', label: 'Smart Summarization', icon: FileText, desc: 'Distills long texts into core audible key takeaways' },
    { id: 'rewrite', label: 'Clarity Rewrite', icon: RefreshCw, desc: 'Eliminates repetitive filler words and cleans up phrasing' },
  ];

  const handleEnhance = async (actionId = selectedAction) => {
    if (!inputText.trim()) {
      setError('Please enter some text to enhance.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await enhanceText({ text: inputText.trim(), action: actionId });
      setOutputText(data.enhancedText || '');
      setProviderBadge(data.provider || 'AI Engine');
    } catch (err) {
      setError(err.message || 'AI Enhancement failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!outputText.trim()) return;
    onApplyEnhancedText(outputText.trim());
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span>AI Speech Text Optimizer</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Refine, correct, and optimize written text so that it sounds lively and natural when spoken aloud.
          </p>
        </div>
        {providerBadge && (
          <span className="text-[11px] font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
            {providerBadge}
          </span>
        )}
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      {/* Action Selector Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          const isSelected = selectedAction === act.id;
          return (
            <button
              key={act.id}
              type="button"
              onClick={() => {
                setSelectedAction(act.id);
                if (inputText.trim()) {
                  handleEnhance(act.id);
                }
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`} />
                <span className={`text-xs font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                  {act.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                {act.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Input / Output Editors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Source Text */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Original Text
          </label>
          <textarea
            rows={7}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste text to enhance here..."
            className="w-full p-3.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-white resize-y"
          />
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>{inputText.length} chars</span>
            <button
              type="button"
              onClick={() => handleEnhance()}
              disabled={loading || !inputText.trim()}
              className="inline-flex items-center space-x-1 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Enhancing...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Run {actions.find(a => a.id === selectedAction)?.label}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Enhanced Output */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-indigo-950 uppercase tracking-wider">
            Optimized Spoken Text
          </label>
          <textarea
            rows={7}
            value={outputText}
            onChange={(e) => setOutputText(e.target.value)}
            placeholder="Enhanced text will appear here and remains fully editable..."
            className="w-full p-3.5 text-sm rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-indigo-50/20 resize-y"
          />
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>{outputText.length} chars</span>
            {outputText && (
              <button
                type="button"
                onClick={handleApply}
                className="inline-flex items-center space-x-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                <span>Use in Speech Synthesizer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
