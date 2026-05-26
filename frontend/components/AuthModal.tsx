// ============================================================================
// 🔐 AUTH MODAL - Login / Sign Up with Glassmorphism Design
// Matches the existing wine + amber/rose design system perfectly.
// ============================================================================

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { apiRequest, setToken } from '../services/apiClient';
import type { User as UserType } from '../types';

interface AuthModalProps {
  onAuthSuccess: (user: UserType, token: string) => void;
}

type AuthTab = 'login' | 'signup';

const AuthModal: React.FC<AuthModalProps> = ({ onAuthSuccess }) => {
  const [tab, setTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetFields = useCallback(() => {
    setEmail('');
    setUsername('');
    setPassword('');
    setError(null);
    setShowPassword(false);
  }, []);

  const switchTab = useCallback(
    (newTab: AuthTab) => {
      if (newTab !== tab) {
        resetFields();
        setTab(newTab);
      }
    },
    [tab, resetFields],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (tab === 'login') {
        const data = await apiRequest<{
          access_token: string;
          user: UserType;
        }>('/auth/login', {
          method: 'POST',
          body: { email, password },
        });
        setToken(data.access_token);
        onAuthSuccess(data.user, data.access_token);
      } else {
        const data = await apiRequest<{
          access_token: string;
          user: UserType;
        }>('/auth/signup', {
          method: 'POST',
          body: { email, username, password },
        });
        setToken(data.access_token);
        onAuthSuccess(data.user, data.access_token);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <AnimatePresence>
      <motion.div
        key="auth-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center"
        style={{ background: 'rgba(10, 5, 8, 0.85)', backdropFilter: 'blur(12px)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 24 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          className="relative w-[92vw] max-w-md mx-auto"
        >
          {/* Card */}
          <div
            className="liquid-glass rounded-3xl overflow-hidden border border-white/10"
            style={{
              boxShadow:
                '0 60px 120px rgba(0,0,0,0.8), 0 0 60px rgba(255,154,60,0.12), inset 0 1px 1px rgba(255,255,255,0.12)',
            }}
          >
            {/* Top glow accent */}
            <div
              className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-40 rounded-full pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle, rgba(255,154,60,0.25) 0%, transparent 70%)',
                filter: 'blur(40px)',
              }}
            />

            <div className="relative px-8 pt-10 pb-8 sm:px-10 sm:pt-12 sm:pb-10">
              {/* Branding */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative mb-3">
                  <div className="absolute -inset-3 bg-amber-glow/20 rounded-full blur-xl animate-pulse-slow" />
                  <div className="relative w-14 h-14 rounded-full liquid-glass border border-white/20 p-2 flex items-center justify-center shadow-inner overflow-hidden">
                    <Sparkles className="w-7 h-7 text-amber-glow animate-float" />
                  </div>
                </div>
                <h1 className="text-2xl font-black tracking-[0.14em] bg-gradient-to-r from-amber-light to-rose-glow bg-clip-text text-transparent uppercase">
                  TECHBOY AI
                </h1>
                <p className="text-[11px] text-white/50 mt-1 tracking-widest uppercase font-semibold">
                  Neural Gateway
                </p>
              </div>

              {/* Tab Switcher */}
              <div className="flex gap-1 p-1 mb-6 rounded-full bg-white/5 border border-white/10">
                {(['login', 'signup'] as AuthTab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => switchTab(t)}
                    className={`
                      no-lift flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300
                      ${
                        tab === t
                          ? 'bg-gradient-to-r from-amber-glow to-rose-glow text-white shadow-lg shadow-rose-glow/20'
                          : 'text-white/50 hover:text-white/80'
                      }
                    `}
                  >
                    {t === 'login' ? 'Log In' : 'Sign Up'}
                  </button>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="relative group">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-amber-glow transition-colors"
                  />
                  <input
                    id="auth-email"
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 outline-none focus:border-amber-glow/50 focus:bg-white/[0.07] transition-all duration-300"
                  />
                </div>

                {/* Username (sign up only) */}
                <AnimatePresence>
                  {tab === 'signup' && (
                    <motion.div
                      key="username-field"
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.25 }}
                      className="relative group overflow-hidden"
                    >
                      <User
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-amber-glow transition-colors"
                      />
                      <input
                        id="auth-username"
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required={tab === 'signup'}
                        autoComplete="username"
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 outline-none focus:border-amber-glow/50 focus:bg-white/[0.07] transition-all duration-300"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Password */}
                <div className="relative group">
                  <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-amber-glow transition-colors"
                  />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                    className="w-full pl-11 pr-11 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 outline-none focus:border-amber-glow/50 focus:bg-white/[0.07] transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="no-lift absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/30 hover:text-white/60 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      key="auth-error"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-glow/10 border border-rose-glow/25 text-rose-light text-xs"
                    >
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-rose-glow" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="jelly-btn w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : tab === 'login' ? (
                    'Enter Neural Link'
                  ) : (
                    'Initialize Account'
                  )}
                </button>
              </form>

              {/* Footer */}
              <p className="text-center text-[10px] text-white/25 mt-6 tracking-wider">
                Secured by TECHBOY AI Neural Infrastructure
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;
