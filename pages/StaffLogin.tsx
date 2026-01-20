
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockStore } from '../services/mockStore';
import { Fingerprint, ShieldAlert, Key, Loader2, ArrowRight, Lock } from 'lucide-react';

interface StaffLoginProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

export const StaffLogin: React.FC<StaffLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [step, setStep] = useState<'CREDENTIALS' | 'BIOMETRIC'>('CREDENTIALS');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const user = mockStore.getAllUsers().find(u => u.email === email && u.password === password);
      if (user && ['ADMIN', 'SUPER_ADMIN', 'SUPPORT'].includes(user.role)) {
        setStep('BIOMETRIC');
        setError('');
      } else {
        setError('Unauthorized Staff Credentials');
      }
      setLoading(false);
    }, 1200);
  };

  const handleBiometric = async () => {
    setLoading(true);
    // Real WebAuthn simulation
    setTimeout(() => {
      const result = mockStore.login(email, password);
      if (result.success) onLoginSuccess();
      else setError('Biometric Verification Failed');
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8 text-white relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.05)_0%,_transparent_70%)] pointer-events-none" />
      
      <div className="max-w-sm w-full bg-[#0A0A0A] p-10 rounded-[2.5rem] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,1)] relative z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-[#10B981] text-black rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-black tracking-tighter uppercase">Staff Entrance</h2>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-2">Classified Node Access</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
             <ShieldAlert className="text-red-500" size={18} />
             <p className="text-[10px] font-black uppercase tracking-widest text-red-500">{error}</p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 'CREDENTIALS' ? (
            <motion.form key="creds" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleCredentials} className="space-y-4">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">Staff Identifier</label>
                 <input 
                   type="email" 
                   value={email} 
                   onChange={e => setEmail(e.target.value)}
                   className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-[#10B981] transition-all" 
                   placeholder="admin@payna.io"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">Kernel Key</label>
                 <input 
                   type="password" 
                   value={password} 
                   onChange={e => setPassword(e.target.value)}
                   className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-[#10B981] transition-all" 
                   placeholder="••••••••"
                 />
               </div>
               <button 
                 disabled={loading}
                 className="w-full bg-[#10B981] text-black p-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 mt-4 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#10B981]/20"
               >
                 {loading ? <Loader2 className="animate-spin" size={20} /> : <>Initialize Sync <ArrowRight size={18} /></>}
               </button>
            </motion.form>
          ) : (
            <motion.div key="bio" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 flex flex-col items-center">
               <div className="relative">
                 <div className="w-32 h-32 border-2 border-[#10B981]/20 rounded-full flex items-center justify-center">
                    <Fingerprint size={64} className="text-[#10B981] animate-pulse" />
                 </div>
                 <div className="absolute top-0 left-0 right-0 h-1 bg-[#10B981] shadow-[0_0_15px_#10B981] animate-scan-line" />
               </div>
               <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Second Factor</p>
                  <p className="text-xs font-bold text-white/80 uppercase">Awaiting Hardware FaceID...</p>
               </div>
               <button 
                 onClick={handleBiometric}
                 disabled={loading}
                 className="w-full bg-[#10B981] text-black p-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 shadow-xl shadow-[#10B981]/20"
               >
                 {loading ? <Loader2 className="animate-spin" size={20} /> : "Scan Biometric"}
               </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={onCancel} className="w-full mt-10 text-[10px] font-black uppercase text-white/20 tracking-widest hover:text-white transition-colors">Abort Access</button>
      </div>
    </div>
  );
};
