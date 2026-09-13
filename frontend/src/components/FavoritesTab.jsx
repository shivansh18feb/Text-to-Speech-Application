import React, { useState, useEffect } from 'react';
import { Star, Play, Trash2, Heart, ShieldAlert } from 'lucide-react';
import { getFavorites, removeFavorite } from '../services/api';

export default function FavoritesTab({ user, onSelectVoice, onPlayAudio, onOpenAuth }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getFavorites();
      setFavorites(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load favorites.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      await removeFavorite(id);
      setFavorites((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error('Remove favorite error:', err);
    }
  };

  if (!user) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
        <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto">
          <Star className="w-6 h-6 fill-current" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Sign in to View Favorites</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Save your most frequently used voices and favorite speech audio files to your personal profile.
        </p>
        <button
          type="button"
          onClick={onOpenAuth}
          className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Star className="w-5 h-5 text-amber-500 fill-current" />
            <span>Saved Favorites</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Quick access to your preferred voices and starred speech generations.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-400 text-xs">Loading favorites...</div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-12 text-slate-400 space-y-2">
          <Heart className="w-10 h-10 mx-auto text-slate-200" />
          <p className="text-sm font-medium text-slate-600">No favorites saved yet.</p>
          <p className="text-xs">Star any voice or history generation to access it instantly here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {favorites.map((fav) => {
            let meta = {};
            try {
              if (fav.metadataJson) meta = JSON.parse(fav.metadataJson);
            } catch (e) {}

            return (
              <div
                key={fav.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-amber-300 transition-all flex items-start justify-between gap-3 shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                      {fav.targetType}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800">{fav.title}</h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    Reference: <span className="font-mono text-slate-700">{fav.referenceId}</span>
                  </p>
                  {meta.language && (
                    <p className="text-xs text-slate-400">
                      Language: {meta.language}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  {fav.targetType === 'VOICE' && onSelectVoice && (
                    <button
                      type="button"
                      onClick={() => onSelectVoice(fav.referenceId, meta.language)}
                      className="px-2.5 py-1 bg-sky-50 text-sky-600 hover:bg-sky-100 rounded-lg text-xs font-semibold"
                    >
                      Use
                    </button>
                  )}
                  {fav.targetType === 'SPEECH' && meta.audioUrl && onPlayAudio && (
                    <button
                      type="button"
                      onClick={() => onPlayAudio(meta.audioUrl)}
                      className="p-1.5 bg-sky-50 text-sky-600 hover:bg-sky-100 rounded-lg"
                      title="Play Audio"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(fav.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remove"
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
