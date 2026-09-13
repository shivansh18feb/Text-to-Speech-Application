import React from 'react';
import { Volume2, Activity, User, LogOut, ShieldCheck, Sparkles, FileText, History, Star, BarChart2, Lock } from 'lucide-react';

export default function Header({ backendStatus, activeTab, onTabChange, user, onLogout }) {
  const isAdmin = user && user.role === 'ROLE_ADMIN';

  const tabs = [
    { id: 'synth', label: 'Synthesizer', icon: Volume2 },
    { id: 'files', label: 'File to Speech', icon: FileText },
    { id: 'ai', label: 'AI Optimizer', icon: Sparkles },
    { id: 'history', label: 'History', icon: History },
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'user-analytics', label: 'My Analytics', icon: BarChart2 },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Console', icon: ShieldCheck }] : []),
    { id: 'auth', label: 'My Account', icon: User },
  ];

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-3">
        {/* Top row: Brand & User Controls */}
        <div className="flex items-center justify-between">
          <div 
            onClick={() => {
              if (user) onTabChange('synth');
            }}
            className={`flex items-center space-x-3 ${user ? 'cursor-pointer' : ''}`}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Volume2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
                TEXT TO SPEECH
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                Enterprise Natural Voice Synthesizer
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Backend Status */}
            {backendStatus === 'UP' ? (
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 mr-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Backend Active
              </span>
            ) : backendStatus === 'CHECKING' ? (
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <Activity className="w-3 h-3 mr-1 animate-spin" />
                Connecting...
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <span className="w-2 h-2 mr-1.5 rounded-full bg-rose-500"></span>
                Offline
              </span>
            )}

            {/* User Profile or Login Indicator */}
            {user ? (
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5">
                <button
                  type="button"
                  onClick={() => onTabChange('auth')}
                  className="flex items-center space-x-2 text-left hover:opacity-80 transition-opacity"
                  title="View Account Profile"
                >
                  <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-xs font-bold text-slate-800 leading-none">{user.name}</p>
                    <p className="text-[10px] text-slate-400 leading-none mt-0.5">{user.email}</p>
                  </div>
                </button>
                {isAdmin && (
                  <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded">
                    ADMIN
                  </span>
                )}
                <button
                  type="button"
                  onClick={onLogout}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-slate-200/60 transition-colors ml-1"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Authentication Required</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs (Only visible when user is logged in) */}
        {user && (
          <nav className="flex space-x-1 sm:space-x-2 mt-3 pt-2 border-t border-slate-100 overflow-x-auto pb-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
