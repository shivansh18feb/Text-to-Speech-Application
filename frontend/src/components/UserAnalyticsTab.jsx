import React, { useState, useEffect } from 'react';
import { BarChart3, Volume2, Activity, Type, RefreshCw, Sparkles, ArrowRight, User } from 'lucide-react';
import { getUserAnalytics } from '../services/api';

export default function UserAnalyticsTab({ user, onNavigateTab }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserStats();
  }, [user]);

  const loadUserStats = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getUserAnalytics();
      setStats(data);
    } catch (err) {
      console.error('Failed to load user analytics:', err);
      setError(err.message || 'Could not retrieve your personal analytics.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900">My Speech Analytics</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                Personal
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Detailed breakdown of speech generations for <strong>{user?.name || user?.email}</strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadUserStats}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Generations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">My Generations</span>
            <Volume2 className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {stats?.totalGenerations ?? 0}
          </p>
          <p className="text-[11px] text-slate-400">Audio syntheses by you</p>
        </div>

        {/* Chars Converted */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Chars Converted</span>
            <Activity className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {stats?.totalCharactersConverted?.toLocaleString() ?? 0}
          </p>
          <p className="text-[11px] text-slate-400">Characters transformed</p>
        </div>

        {/* Words Synthesized */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Words Spoken</span>
            <Type className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {stats?.totalWordsConverted?.toLocaleString() ?? 0}
          </p>
          <p className="text-[11px] text-slate-400">Total words generated</p>
        </div>

        {/* Average Size */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg. Text Length</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {stats?.averageCharsPerGeneration ?? 0}
          </p>
          <p className="text-[11px] text-slate-400">Chars / generation</p>
        </div>
      </div>

      {/* Language & Voice Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Used Languages */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-sky-600" />
            <span>My Favorite Languages</span>
          </h3>
          {stats?.popularLanguages && stats.popularLanguages.length > 0 ? (
            <div className="space-y-3">
              {stats.popularLanguages.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{item.language}</span>
                    <span>{item.count} syntheses</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-sky-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (item.count / (stats.totalGenerations || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-slate-400 text-xs">
              No language data yet. Start generating speech to see your top languages.
            </div>
          )}
        </div>

        {/* Most Used Voices */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-indigo-600" />
            <span>My Top Voices</span>
          </h3>
          {stats?.popularVoices && stats.popularVoices.length > 0 ? (
            <div className="space-y-3">
              {stats.popularVoices.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{item.voice}</span>
                    <span>{item.count} uses</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (item.count / (stats.totalGenerations || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-slate-400 text-xs">
              No voice data yet. Try different voices to view your personal preferences.
            </div>
          )}
        </div>
      </div>

      {/* Quick Link Card */}
      <div className="bg-gradient-to-r from-sky-50 to-indigo-50 p-6 rounded-2xl border border-sky-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Want to convert more text?</h4>
          <p className="text-xs text-slate-600 mt-0.5">
            Create high-quality natural voice audio with our 10+ language synthesizer.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => onNavigateTab('history')}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            View History
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('synth')}
            className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <span>Go to Synthesizer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
