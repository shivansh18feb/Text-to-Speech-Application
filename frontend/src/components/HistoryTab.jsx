import React, { useState, useEffect } from 'react';
import { History, Play, Pause, Download, Trash2, Clock, Volume2, Star } from 'lucide-react';
import { getHistory, deleteHistoryItem, clearHistory, addFavorite } from '../services/api';

export default function HistoryTab({ onPlayAudio, user }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeAudioUrl, setActiveAudioUrl] = useState(null);

  useEffect(() => {
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getHistory();
      setHistory(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load history.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteHistoryItem(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear your speech history?')) return;
    try {
      await clearHistory();
      setHistory([]);
    } catch (err) {
      console.error('Clear error:', err);
    }
  };

  const handleToggleFavorite = async (item) => {
    try {
      await addFavorite({
        targetType: 'SPEECH',
        referenceId: String(item.id),
        title: item.text.substring(0, 40) + '...',
        metadataJson: JSON.stringify({ audioUrl: item.audioUrl, voice: item.voice, language: item.language }),
      });
      alert('Saved to favorites!');
    } catch (err) {
      console.error('Fav error:', err);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <History className="w-5 h-5 text-sky-600" />
            <span>Speech Generation History</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review past generations, replay audio streams, or redownload saved MP3 files.
          </p>
        </div>
        {history.length > 0 && user && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center space-x-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-400 text-sm">
          Loading history entries...
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-12 text-slate-400 space-y-2">
          <History className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm font-medium text-slate-600">No speech generations yet.</p>
          <p className="text-xs">Generate speech in the synthesizer tab to see records here.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {history.map((item) => {
            const isPlayingThis = activeAudioUrl === item.audioUrl;
            return (
              <div key={item.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <p className="text-sm font-semibold text-slate-800 line-clamp-2">
                    "{item.text}"
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                      {item.language}
                    </span>
                    <span className="font-medium text-slate-600">{item.voice}</span>
                    <span>•</span>
                    <span>{item.characterCount} chars</span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-center flex-shrink-0">
                  {/* Play / Pause */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isPlayingThis) {
                        setActiveAudioUrl(null);
                      } else {
                        setActiveAudioUrl(item.audioUrl);
                        if (onPlayAudio) onPlayAudio(item.audioUrl, item);
                      }
                    }}
                    className="p-2 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
                    title="Play Audio"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>

                  {/* Download */}
                  <a
                    href={`${item.audioUrl}?download=true`}
                    download="speech_history.mp3"
                    className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                    title="Download MP3"
                  >
                    <Download className="w-4 h-4" />
                  </a>

                  {/* Favorite */}
                  {user && (
                    <button
                      type="button"
                      onClick={() => handleToggleFavorite(item)}
                      className="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                      title="Add to Favorites"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
