import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, ShieldCheck, Database, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { apiAuth, getSupabaseStatus, getUserTeamMap } from '../../lib/supabase';

export default function LoginView({ onLoginSuccess, onOpenSupabaseModal }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const supabaseStatus = getSupabaseStatus();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (isSignUp) {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Password and Confirm Password do not match.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const res = await apiAuth.signUp(email, password, fullName);
        setSuccessMsg('Account created successfully! Default role: USER. Redirecting...');
        setTimeout(() => {
          onLoginSuccess({
            id: res.user?.id || Date.now().toString(),
            user_id: res.user?.id || Date.now().toString(),
            email,
            full_name: fullName,
            role: 'user', // ALWAYS created as User
            team_id: null,
            team_name: null,
            user_metadata: { full_name: fullName, role: 'user' }
          });
        }, 1000);
      } else {
        const res = await apiAuth.signIn(email, password);
        const isAdmin = email.toLowerCase().includes('admin');
        const userId = res.profile?.user_id || res.user?.id || (isAdmin ? '00000000-0000-0000-0000-000000000000' : '11111111-1111-1111-1111-111111111111');
        const userEmail = res.profile?.email || res.user?.email || email;
        const teamInfo = getUserTeamMap(userId, userEmail);

        const loggedInUser = {
          id: res.profile?.id || res.user?.id || (isAdmin ? '00000000-0000-0000-0000-000000000000' : '11111111-1111-1111-1111-111111111111'),
          user_id: userId,
          email: userEmail,
          full_name: res.profile?.full_name || res.user?.user_metadata?.full_name || (isAdmin ? 'System Admin' : 'John Doe'),
          role: res.profile?.role || (isAdmin ? 'admin' : 'user'),
          team_id: res.profile?.team_id || teamInfo.team_id,
          team_name: res.profile?.team_name || teamInfo.team_name,
          job_title: res.profile?.job_title || (isAdmin ? 'System Administrator' : 'Product Designer'),
          user_metadata: { full_name: res.profile?.full_name || 'User', role: res.profile?.role || (isAdmin ? 'admin' : 'user') }
        };
        onLoginSuccess(loggedInUser);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
    setIsSignUp(false);
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await apiAuth.signIn(quickEmail, quickPassword);
      const isAdmin = quickEmail.toLowerCase().includes('admin');
      const userId = res.profile?.user_id || res.user?.id || (isAdmin ? '00000000-0000-0000-0000-000000000000' : '11111111-1111-1111-1111-111111111111');
      const userEmail = res.profile?.email || res.user?.email || quickEmail;
      const teamInfo = getUserTeamMap(userId, userEmail);

      onLoginSuccess({
        id: res.profile?.id || res.user?.id || (isAdmin ? '00000000-0000-0000-0000-000000000000' : '11111111-1111-1111-1111-111111111111'),
        user_id: userId,
        email: userEmail,
        full_name: res.profile?.full_name || res.user?.user_metadata?.full_name || (isAdmin ? 'System Admin' : 'John Doe'),
        role: res.profile?.role || (isAdmin ? 'admin' : 'user'),
        team_id: res.profile?.team_id || teamInfo.team_id,
        team_name: res.profile?.team_name || teamInfo.team_name,
        job_title: res.profile?.job_title || (isAdmin ? 'System Administrator' : 'Product Designer')
      });
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col justify-center items-center p-4 font-sans text-gray-900">
      {/* Container */}
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-black text-white font-black text-xl shadow-md">
            L
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">LOGO Dashboard</h1>
          <p className="text-xs text-gray-500 font-medium">
            {isSignUp ? 'Register new User account (Role: USER)' : 'Sign in to access your CRM workspace'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-xl space-y-6">
          
          {/* Sign In / Sign Up Subnav Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => { setIsSignUp(false); setErrorMsg(''); setSuccessMsg(''); setEmail('admin@gmail.com'); setPassword('admin123'); }}
              className={`flex-1 py-2 rounded-lg transition-all text-center ${
                !isSignUp ? 'bg-white text-black shadow-2xs' : 'text-gray-500 hover:text-black'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsSignUp(true); setErrorMsg(''); setSuccessMsg(''); setEmail(''); setPassword(''); setConfirmPassword(''); }}
              className={`flex-1 py-2 rounded-lg transition-all text-center ${
                isSignUp ? 'bg-white text-black shadow-2xs' : 'text-gray-500 hover:text-black'
              }`}
            >
              Register (User)
            </button>
          </div>

          {/* Status Alert Messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {isSignUp && (
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Connor"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black font-semibold text-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-bold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="admin@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black font-semibold text-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-gray-700">Password</label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black font-semibold text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-gray-400 hover:text-black"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block font-bold text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black font-semibold text-xs"
                  />
                </div>
              </div>
            )}

            {!isSignUp && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 accent-black rounded"
                  />
                  <span>Keep me signed in for this browser session</span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-xs text-xs"
            >
              {loading ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <span>{isSignUp ? 'Register New User' : 'Sign In to Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-gray-200 w-full" />
            <span className="bg-white px-3 text-[10px] uppercase tracking-wider font-bold text-gray-400 absolute">
              PRE-CONFIGURED ACCOUNTS
            </span>
          </div>

          {/* Role Access Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLogin('admin@gmail.com', 'admin123')}
              disabled={loading}
              className="py-2.5 bg-black hover:bg-gray-800 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Account</span>
            </button>

            <button
              onClick={() => handleQuickLogin('john.d@company.com', 'password123')}
              disabled={loading}
              className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 border border-gray-200"
            >
              <User className="w-3.5 h-3.5 text-gray-600" />
              <span>User Account</span>
            </button>
          </div>
        </div>

        {/* Footer Database Indicator */}
        <div className="text-center">
          <button
            onClick={onOpenSupabaseModal}
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-black transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {supabaseStatus.isConfigured ? 'Supabase Auth & RLS Connected' : 'Supabase is not configured'}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
