import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Volume2, HardDrive, Shield, Activity, Lock, RefreshCw, KeyRound, ShieldAlert } from 'lucide-react';
import { getSystemAnalytics, getAdminUsers, getAdminLimits, updateUserRole } from '../services/api';

export default function AdminAnalyticsTab({ user, onNavigateTab }) {
  const [analytics, setAnalytics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = user && user.role === 'ROLE_ADMIN';

  useEffect(() => {
    if (isAdmin) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user, isAdmin]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const stats = await getSystemAnalytics();
      setAnalytics(stats);

      const users = await getAdminUsers();
      setUsersList(users || []);

      const sysLimits = await getAdminLimits();
      setLimits(sysLimits);
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
      setError(err.message || 'Failed to load system metrics.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (targetUser) => {
    const newRole = targetUser.role === 'ROLE_ADMIN' ? 'ROLE_USER' : 'ROLE_ADMIN';
    if (!window.confirm(`Change role for ${targetUser.email} to ${newRole}?`)) return;
    try {
      await updateUserRole(targetUser.id, newRole);
      setUsersList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      alert(err.message || 'Could not update role.');
    }
  };

  // If user is not an administrator, display access restricted message
  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4 animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-900">Administrator Console Restricted</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            System-wide platform analytics and user administration controls are strictly reserved for accounts with administrator privileges.
          </p>
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => onNavigateTab('user-analytics')}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
          >
            View My Personal Analytics
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Admin Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900">System Admin Console</h2>
              <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded-full border border-indigo-200">
                Full Platform Scope
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Platform-wide usage metrics, server uptime, and user account management
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Platform Syntheses</span>
            <Volume2 className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {analytics?.totalGenerations ?? 0}
          </p>
          <p className="text-[11px] text-slate-400">All users combined</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Chars</span>
            <Activity className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {analytics?.totalCharactersConverted?.toLocaleString() ?? 0}
          </p>
          <p className="text-[11px] text-slate-400">Characters processed</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Registered Users</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {analytics?.totalUsers ?? 0}
          </p>
          <p className="text-[11px] text-slate-400">Database user accounts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Server Uptime</span>
            <HardDrive className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {Math.floor((analytics?.uptimeSeconds || 0) / 60)}m
          </p>
          <p className="text-[11px] text-slate-400">Continuous operation</p>
        </div>
      </div>

      {/* Language & Voice Popularity (System-Wide) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Languages */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-sky-600" />
            <span>Platform-Wide Popular Languages</span>
          </h3>
          {analytics?.popularLanguages && analytics.popularLanguages.length > 0 ? (
            <div className="space-y-3">
              {analytics.popularLanguages.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{item.language}</span>
                    <span>{item.count} syntheses</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-sky-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (item.count / (analytics.totalGenerations || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No language data recorded yet.</p>
          )}
        </div>

        {/* Popular Voices */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-indigo-600" />
            <span>Platform-Wide Popular Voices</span>
          </h3>
          {analytics?.popularVoices && analytics.popularVoices.length > 0 ? (
            <div className="space-y-3">
              {analytics.popularVoices.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{item.voice}</span>
                    <span>{item.count} uses</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (item.count / (analytics.totalGenerations || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No voice metrics recorded yet.</p>
          )}
        </div>
      </div>

      {/* Admin Section: System Limits & User Directory */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              System Policy Limits
            </h3>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-full">
            Admin Privileges Active
          </span>
        </div>

        {/* System Limits Grid */}
        {limits && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 font-medium">Rate Limiting</span>
              <p className="text-sm font-bold text-slate-800">{limits.maxRequestsPerMinute} req / min / IP</p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 font-medium">Max Text Length</span>
              <p className="text-sm font-bold text-slate-800">{limits.maxCharsPerRequest} characters</p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 font-medium">File Upload Limit</span>
              <p className="text-sm font-bold text-slate-800">20 MB (PDF/DOCX/TXT)</p>
            </div>
          </div>
        )}

        {/* User Directory Table */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Users className="w-4 h-4 text-slate-500" />
              <span>User Directory & Permissions</span>
            </h4>
            <span className="text-xs text-slate-400">{usersList.length} total accounts</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3">User Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 font-semibold text-slate-800">{u.name}</td>
                    <td className="p-3 text-slate-500">{u.email}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'ROLE_ADMIN'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {u.role.replace('ROLE_', '')}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => handleToggleRole(u)}
                        className="text-xs font-semibold text-sky-600 hover:text-sky-800 underline"
                      >
                        {u.role === 'ROLE_ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
