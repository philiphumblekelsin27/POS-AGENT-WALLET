
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockStore } from '../services/mockStore';
import { Fingerprint, ShieldCheck, XCircle, ArrowRight, Loader2, Lock, Eye, EyeOff, Key } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
  onNavigateToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'IDENTIFY' | 'CREDENTIALS' | 'BIOMETRIC' | 'PIN'>('IDENTIFY');

  useEffect(() => {
    // Check if there is an existing session
    const activeUser = mockStore.getCurrentUser();
    if (activeUser && activeUser.pin) {
      setEmail(activeUser.email);
      setMode('PIN');
    }
  }, []);

  const handleIdentify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setError('Identify your node');
    
    const users = mockStore.getAllUsers();
    const target = users.find(u => u.email === email);
    
    if (target) {
      if (['SUPER_ADMIN', 'ADMIN', 'SUPPORT'].includes(target.role)) {
         setMode('CREDENTIALS');
      } else if (target.pin) {
         setMode('PIN');
      } else {
         setMode('BIOMETRIC');
      }
    } else {
       setError('Node profile not found. Please register.');
    }
  };

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) return;
    setLoading(true);
    const activeUser = mockStore.getAllUsers().find(u => u.email === email);
    if (activeUser) {
      const result = await mockStore.loginWithPin(activeUser.id, pin);
      if (result.success) {
        onLoginSuccess();
      } else {
        setError(result.message);
        setLoading(false);
      }
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await mockStore.login(email, password);
    if (result.success) {
      onLoginSuccess();
    } else {
      setError(result.message || 'Sync Error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E11] flex flex-col items-center justify-center p-8 text-white relative">
      <div className="z-10 w-full max-w-sm flex flex-col items-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-12 text-center">
          <div className="w-20 h-20 bg-[#3DF2C4] text-black rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <ShieldCheck size={44} strokeWidth={2.5} />
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-1 uppercase">PAYNA</h1>
          <p className="text-[10px] text-[#3DF2C4] font-black uppercase tracking-[0.4em]">Fintech Node</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex items-center gap-3 mb-6">
              <XCircle size={18} />
              <p className="text-[10px] font-black uppercase tracking-tight">{error}</p>
            </motion.div>
          )}

          {mode === 'IDENTIFY' && (
            <motion.form key="id" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleIdentify} className="w-full space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Node Identifier</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-[#3DF2C4] transition-all" placeholder="email@payna.app" />
              </div>
              <button className="w-full bg-[#3DF2C4] text-black font-black p-5 rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest">
                Verify Identity <ArrowRight size={18} />
              </button>
              <p className="text-center text-[10px] text-white/20 font-black uppercase tracking-widest">
                New node? <button type="button" onClick={onNavigateToRegister} className="text-[#3DF2C4]">Create Vault</button>
              </p>
            </motion.form>
          )}

          {mode === 'PIN' && (
            <motion.form key="pin" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onSubmit={handlePinLogin} className="w-full space-y-8 flex flex-col items-center">
              <div className="text-center mb-4">
                <h3 className="text-xl font-black uppercase tracking-tighter">Welcome Back</h3>
                <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mt-1">{email}</p>
              </div>
              <div className="flex gap-4 mb-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all ${pin.length >= i ? 'bg-[#3DF2C4] border-[#3DF2C4] shadow-[0_0_10px_#3DF2C4]' : 'border-white/10'}`} />
                ))}
              </div>
              <input 
                autoFocus
                type="password" 
                maxLength={4}
                value={pin}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  setPin(val);
                  if (val.length === 4) {
                    const activeUser = mockStore.getAllUsers().find(u => u.email === email);
                    if (activeUser) mockStore.loginWithPin(activeUser.id, val).then(r => r.success && onLoginSuccess());
                  }
                }}
                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none text-center text-4xl tracking-[0.8em] font-black"
                placeholder="••••"
              />
              <button type="button" onClick={() => setMode('CREDENTIALS')} className="text-[10px] font-black uppercase text-white/20 tracking-widest hover:text-white">Use Password Instead</button>
            </motion.form>
          )}

          {mode === 'CREDENTIALS' && (
            <motion.form key="pass" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handlePasswordLogin} className="w-full space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Secure Key</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-[#3DF2C4] pr-14" 
                    placeholder="••••••••" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button disabled={loading} className="w-full bg-[#3DF2C4] text-black font-black p-5 rounded-2xl uppercase tracking-widest flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : 'Enter Vault'}
              </button>
              <button type="button" onClick={() => setMode('IDENTIFY')} className="w-full text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Switch Node</button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
