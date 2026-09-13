import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User as UserIcon, 
  ShieldCheck, 
  LogOut, 
  CheckCircle2, 
  Key, 
  Sparkles, 
  History, 
  Star, 
  BarChart2, 
  Volume2, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { loginUser, registerUser, setAuthToken, setStoredUser } from '../services/api';

export default function AuthPage({ user, onAuthSuccess, onLogout, onNavigateTab }) {
  const [activeMode, setActiveMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const data = await loginUser({ email: email.trim(), password });
      if (data && data.token) {
        setAuthToken(data.token);
        setStoredUser(data.user);
        onAuthSuccess(data.user);
        setSuccessMsg('Successfully signed in! Welcome back.');
      } else {
        throw new Error('Authentication response did not contain a valid session token.');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const data = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (data && data.token) {
        setAuthToken(data.token);
        setStoredUser(data.user);
        onAuthSuccess(data.user);
        setSuccessMsg('Account created successfully! Welcome to Text-to-Speech.');
      } else {
        throw new Error('Account created but login failed. Please sign in manually.');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Email may already be registered.');
    } finally {
      setLoading(false);
    }
  };


  const executeLogout = () => {
    onLogout();
    setShowLogoutConfirm(false);
    setSuccessMsg('You have been logged out successfully.');
    setEmail('');
    setPassword('');
  };

  // -------------------------------------------------------------
  // VIEW 1: USER IS ALREADY LOGGED IN (PROFILE & ACCOUNT DASHBOARD)
  // -------------------------------------------------------------
  if (user) {
    const isAdmin = user.role === 'ROLE_ADMIN';

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-sky-500/20">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
                  {isAdmin ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>ADMINISTRATOR</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
                      STANDARD USER
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 flex items-center space-x-1.5 mt-1">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{user.email}</span>
                </p>
              </div>
            </div>

            {/* Logout Trigger Button */}
            <div>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 font-semibold text-sm flex items-center space-x-2 transition-all shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Account Details Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <span className="text-xs text-slate-400 font-semibold uppercase">Account Status</span>
              <div className="flex items-center space-x-1.5 mt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-bold text-slate-800">Active & Verified</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <span className="text-xs text-slate-400 font-semibold uppercase">Security Mode</span>
              <div className="flex items-center space-x-1.5 mt-1">
                <Key className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-bold text-slate-800">Stateless JWT Auth</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <span className="text-xs text-slate-400 font-semibold uppercase">Access Level</span>
              <div className="flex items-center space-x-1.5 mt-1">
                <ShieldCheck className="w-4 h-4 text-sky-500" />
                <span className="text-sm font-bold text-slate-800">
                  {isAdmin ? 'Full System & Analytics' : 'Standard TTS Studio'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Dashboard */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
            Quick Navigation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onNavigateTab('synth')}
              className="p-4 rounded-xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50/50 text-left flex items-center space-x-3 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900">Text Synthesizer</p>
                <p className="text-xs text-slate-500">Create new natural voice speech</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('history')}
              className="p-4 rounded-xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50/50 text-left flex items-center space-x-3 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <History className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900">Speech History</p>
                <p className="text-xs text-slate-500">Replay & re-download past speech</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('favorites')}
              className="p-4 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 text-left flex items-center space-x-3 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900">Favorites Library</p>
                <p className="text-xs text-slate-500">Quick access to saved voices</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('user-analytics')}
              className="p-4 rounded-xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50/50 text-left flex items-center space-x-3 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900">My Analytics</p>
                <p className="text-xs text-slate-500">View personal generation statistics</p>
              </div>
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => onNavigateTab('admin')}
                className="p-4 rounded-xl border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-left flex items-center space-x-3 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900">Admin Console</p>
                  <p className="text-xs text-slate-500">Platform metrics & user management</p>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-100 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
                <LogOut className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h4 className="text-lg font-bold text-slate-900">Confirm Sign Out</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to log out of <strong>{user.email}</strong>? You can sign back in at any time.
                </p>
              </div>
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-semibold text-sm text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeLogout}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md"
                >
                  Yes, Log Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: USER IS NOT LOGGED IN (DEDICATED LOGIN / REGISTER PAGE)
  // -------------------------------------------------------------
  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-sky-500/20">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {activeMode === 'login' ? 'Sign In to Your Account' : 'Create Your TTS Account'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          {activeMode === 'login'
            ? 'Sign in to access personalized speech history, bookmark favorite voices, and unlock admin metrics.'
            : 'Join to save your speech generations, manage your favorite voices, and extract text from documents.'}
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => {
            setActiveMode('login');
            setError('');
          }}
          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeMode === 'login'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveMode('register');
            setError('');
          }}
          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeMode === 'register'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Create Account (Register)
        </button>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Form Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        {activeMode === 'login' ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <span>Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-60 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Password (min. 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-60 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <UserIcon className="w-4 h-4" />
                  <span>Register & Create Account</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
