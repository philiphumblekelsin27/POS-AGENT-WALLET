
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockStore } from '../services/mockStore';
import { UserRole } from '../types';
import { Fingerprint, ShieldCheck, XCircle, ArrowRight, Loader2, Lock } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
  onNavigateToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'IDENTIFY' | 'BIOMETRIC' | 'PIN' | 'STAFF_KEY'>('IDENTIFY');
  const [isFaceIdEnrolled, setIsFaceIdEnrolled] = useState<boolean | null>(null);
  const [targetUser, setTargetUser] = useState<any>(null);

  useEffect(() => {
    if (email && email.includes('@')) {
      const user = mockStore.getAllUsers().find(u => u.email === email);
      if (user) {
        setTargetUser(user);
        setIsFaceIdEnrolled(mockStore.isFaceIdEnrolled(email));
      } else {
        setTargetUser(null);
        setIsFaceIdEnrolled(null);
      }
    }
  }, [email]);

  const handleIdentify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Enter credentials');
      return;
    }
    
    if (!targetUser) {
      setError('Node not found');
      return;
    }

    setError('');
    const isStaff = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPPORT].includes(targetUser.role);
    
    if (isStaff) {
      setMode('STAFF_KEY');
    } else {
      setMode(isFaceIdEnrolled ? 'BIOMETRIC' : 'PIN');
    }
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const result = mockStore.login(email, password);
      if (result.success) {
        onLoginSuccess();
      } else {
        setError('Invalid Security Key');
        setLoading(false);
      }
    }, 1200);
  };

  const handleBiometricLogin = async () => {
    setLoading(true);
    setError('');
    try {
      // Simulate WebAuthn handshake
      setTimeout(() => {
        const result = mockStore.verifyAuthentication(email, {});
        if (result.success) {
          onLoginSuccess();
        } else {
          setError("Scan Failed");
          setLoading(false);
        }
      }, 1500);
    } catch (err) {
      setMode('PIN');
      setLoading(false);
    }
  };

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 6) return;
    setLoading(true);
    const result = mockStore.loginWithPin(email, pin);
    if (result.success) {
      onLoginSuccess();
    } else {
      setError('Invalid PIN');
      setLoading(false);
    }
  };

  const renderIdentify = () => (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleIdentify}
      className="space-y-6 w-full"
    >
      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Identity Access</label>
        <div className="relative">
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full bg-[#111] border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-[#10B981] outline-none transition-all placeholder:text-gray-600 font-medium" 
            placeholder="node@payna.io"
          />
        </div>
      </div>
      <button 
        type="submit" 
        className="w-full bg-[#10B981] text-black font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        Verify Identity <ArrowRight size={18} />
      </button>
      <p className="text-center text-xs text-gray-500 font-medium">
        New node? <button type="button" onClick={onNavigateToRegister} className="text-[#10B981] font-bold">Register</button>
      </p>
    </motion.form>
  );

  const renderStaffKey = () => (
    <motion.form 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      onSubmit={handleStaffLogin}
      className="space-y-6 w-full"
    >
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 bg-[#10B981] text-black rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
          <Lock size={32} />
        </div>
        <p className="text-[10px] font-black text-[#10B981] uppercase tracking-[0.3em]">Staff Kernel Access</p>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">Kernel Password</label>
        <input 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)}
          className="w-full bg-[#111] border border-white/10 p-5 rounded-2xl outline-none focus:border-[#10B981] transition-all" 
          placeholder="••••••••"
        />
      </div>
      <button 
        disabled={loading}
        className="w-full bg-[#10B981] text-black p-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#10B981]/20"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : "Initialize Synchronization"}
      </button>
      <button type="button" onClick={() => setMode('IDENTIFY')} className="w-full text-xs text-gray-500 font-bold hover:text-white transition-colors">Abort</button>
    </motion.form>
  );

  const renderBiometric = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center space-y-10 w-full"
    >
      <div className="text-center">
        <h2 className="text-xl font-black mb-2 uppercase">Vault Secure Access</h2>
        <p className="text-[10px] text-gray-400 font-black tracking-widest uppercase">Node synchronization...</p>
      </div>

      <div className="relative flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} className="absolute w-48 h-48 border border-white/5 rounded-full" />
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="absolute w-32 h-32 bg-[#10B981]/10 rounded-full blur-2xl" />
        <button 
          onClick={handleBiometricLogin}
          disabled={loading}
          className="relative z-10 w-28 h-28 bg-[#10B981] text-black rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 size={40} className="animate-spin" /> : <Fingerprint size={48} strokeWidth={1.5} />}
        </button>
        <div className="absolute w-32 h-[2px] bg-[#10B981] shadow-[0_0_15px_#10B981] animate-scan-line pointer-events-none" />
      </div>

      <div className="space-y-4 w-full">
        <button onClick={() => setMode('PIN')} className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border border-white/5 rounded-2xl hover:bg-white/5 transition-all">
          PIN Fallback
        </button>
        <button onClick={() => setMode('IDENTIFY')} className="w-full text-xs text-gray-500 font-bold hover:text-white transition-colors">Switch Account</button>
      </div>
    </motion.div>
  );

  const renderPin = () => (
    <motion.form 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      onSubmit={handlePinLogin}
      className="space-y-8 w-full"
    >
      <div className="text-center">
        <h2 className="text-xl font-black mb-2 uppercase tracking-tight">Security PIN</h2>
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Enter node access code</p>
      </div>

      <div className="flex justify-center gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`w-10 h-14 rounded-xl border flex items-center justify-center text-xl font-black transition-all ${pin.length > i ? 'border-[#10B981] text-[#10B981] bg-[#10B981]/10' : 'border-white/10 bg-[#111]'}`}>
            {pin.length > i ? '•' : ''}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-[280px] mx-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '⌫'].map((k, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              if (k === 'C') setPin('');
              else if (k === '⌫') setPin(p => p.slice(0, -1));
              else if (pin.length < 6) setPin(p => p + k);
            }}
            className="h-14 w-full rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-lg font-bold hover:bg-white/10 active:scale-90 transition-all"
          >
            {k}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <button 
          type="submit"
          disabled={pin.length < 6 || loading}
          className="w-full bg-[#10B981] text-black font-black py-4 rounded-2xl shadow-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? 'Decrypting...' : 'Access Vault'}
        </button>
        <button type="button" onClick={() => setMode('IDENTIFY')} className="w-full text-xs text-gray-500 font-bold hover:text-white transition-colors">Cancel</button>
      </div>
    </motion.form>
  );

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-8 relative overflow-hidden text-white">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] aspect-square bg-[#10B981]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] aspect-square bg-[#5D5FEF]/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="z-10 w-full max-w-sm flex flex-col items-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2.5rem] bg-gradient-to-tr from-[#10B981] to-[#5D5FEF] text-black mb-6 shadow-[0_20px_50px_rgba(16,185,129,0.3)] rotate-12">
            <ShieldCheck size={44} strokeWidth={2.5} />
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-1">PAYNA</h1>
          <p className="text-[10px] text-[#10B981] font-black uppercase tracking-[0.4em]">Vault Core</p>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-2xl flex items-center gap-3 mb-6">
              <XCircle size={18} />
              <p className="text-[10px] font-black uppercase tracking-tight">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {mode === 'IDENTIFY' && renderIdentify()}
        {mode === 'STAFF_KEY' && renderStaffKey()}
        {mode === 'BIOMETRIC' && renderBiometric()}
        {mode === 'PIN' && renderPin()}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} className="absolute bottom-8 text-[8px] font-black uppercase tracking-[1em] text-white/50">
        Secure Synchronization Architecture v1.1
      </motion.div>
    </div>
  );
};
