
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, User as UserIcon, Briefcase, CheckCircle, ChevronRight, Loader2, Key, Users } from 'lucide-react';
import { mockStore } from '../services/mockStore';
import { UserRole } from '../types';

interface RegisterProps {
  onRegisterSuccess: () => void;
  onNavigateToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onNavigateToLogin }) => {
  const [step, setStep] = useState(0); // Step 0 is Role Selection
  const [isScanning, setIsScanning] = useState(false);
  const [walletStatus, setWalletStatus] = useState<'IDLE' | 'CHECKING' | 'AVAILABLE' | 'TAKEN'>('IDLE');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    walletNumber: '',
    nin: '',
    role: UserRole.USER as UserRole
  });

  const handleNext = () => setStep(s => s + 1);

  const checkWalletId = (num: string) => {
    setFormData({ ...formData, walletNumber: num });
    if (num.length === 6) {
      setWalletStatus('CHECKING');
      setTimeout(() => {
        const available = mockStore.isWalletNumberAvailable(num);
        setWalletStatus(available ? 'AVAILABLE' : 'TAKEN');
      }, 800);
    } else {
      setWalletStatus('IDLE');
    }
  };

  const startFaceEnrollment = async () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      mockStore.register(formData);
      setStep(5);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#10B981]/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-md w-full bg-[#0A0A0A]/80 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/5 shadow-2xl z-10">
        
        {step > 0 && (
          <div className="flex justify-between mb-10 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-[#10B981]' : 'bg-white/5'}`} />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="role" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10 text-center">
               <div>
                  <h2 className="text-3xl font-black tracking-tighter mb-2">Vault Identity</h2>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Select your operational role</p>
               </div>

               <div className="space-y-4">
                  <button 
                    onClick={() => setFormData({...formData, role: UserRole.USER})}
                    className={`w-full p-6 rounded-[2rem] border-2 text-left flex items-center gap-6 transition-all ${
                      formData.role === UserRole.USER ? 'border-[#10B981] bg-[#10B981]/5' : 'border-white/5 bg-white/5'
                    }`}
                  >
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${formData.role === UserRole.USER ? 'bg-[#10B981] text-black' : 'bg-white/5 text-[#10B981]'}`}>
                        <Users size={24} />
                     </div>
                     <div className="flex-1">
                        <p className="font-black text-sm uppercase">Customer</p>
                        <p className="text-[9px] text-white/30 font-bold uppercase mt-1">Book services & pay globally</p>
                     </div>
                     {formData.role === UserRole.USER && <CheckCircle className="text-[#10B981]" size={20} />}
                  </button>

                  <button 
                    onClick={() => setFormData({...formData, role: UserRole.AGENT})}
                    className={`w-full p-6 rounded-[2rem] border-2 text-left flex items-center gap-6 transition-all ${
                      formData.role === UserRole.AGENT ? 'border-[#10B981] bg-[#10B981]/5' : 'border-white/5 bg-white/5'
                    }`}
                  >
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${formData.role === UserRole.AGENT ? 'bg-[#10B981] text-black' : 'bg-white/5 text-[#10B981]'}`}>
                        <Briefcase size={24} />
                     </div>
                     <div className="flex-1">
                        <p className="font-black text-sm uppercase">Agent / Service</p>
                        <p className="text-[9px] text-white/30 font-bold uppercase mt-1">Earn by providing services</p>
                     </div>
                     {formData.role === UserRole.AGENT && <CheckCircle className="text-[#10B981]" size={20} />}
                  </button>
               </div>

               <button onClick={handleNext} className="w-full bg-[#10B981] text-black p-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-[#10B981]/20">
                 Continue Registration
               </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <h2 className="text-3xl font-black tracking-tighter mb-2 text-white">Identity Core</h2>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Setup login credentials</p>
              </div>
              <div className="space-y-4">
                <input 
                  className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-[#10B981] transition-all" 
                  placeholder="Legal Name" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
                <input 
                  className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-[#10B981] transition-all" 
                  placeholder="Corporate Email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
                <input 
                  type="password"
                  className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-[#10B981] transition-all" 
                  placeholder="Master Key (Password)" 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <button onClick={handleNext} disabled={!formData.name || !formData.email} className="w-full bg-[#10B981] text-black p-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50">
                Next <ChevronRight size={18} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 text-center">
              <div>
                <h2 className="text-3xl font-black tracking-tighter mb-2">Claim ID</h2>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Choose your 6-digit node identifier</p>
              </div>
              
              <div className="relative">
                <input 
                  type="text" 
                  maxLength={6}
                  value={formData.walletNumber}
                  onChange={e => checkWalletId(e.target.value)}
                  className="w-full bg-transparent text-center text-6xl font-black tracking-[0.5rem] outline-none border-b-2 border-white/10 focus:border-[#10B981] pb-6 transition-all placeholder:text-white/5" 
                  placeholder="000000"
                />
                
                <div className="mt-6 flex items-center justify-center gap-2">
                  {walletStatus === 'CHECKING' && <Loader2 size={14} className="animate-spin text-[#10B981]" />}
                  {walletStatus === 'AVAILABLE' && <span className="text-[10px] font-black uppercase text-[#10B981]">✅ Available</span>}
                  {walletStatus === 'TAKEN' && <span className="text-[10px] font-black uppercase text-red-500">❌ Taken</span>}
                </div>
              </div>

              <button 
                onClick={handleNext} 
                disabled={walletStatus !== 'AVAILABLE'} 
                className="w-full bg-[#10B981] text-black p-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-[#10B981]/20 disabled:opacity-50"
              >
                Claim Identity
              </button>
            </motion.div>
          )}

          {step === 4 && (formData.role === UserRole.AGENT ? (
            <motion.div key="s4-agent" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-10">
               <h2 className="text-3xl font-black tracking-tighter uppercase">Biometric Link</h2>
               <div className="w-48 h-48 mx-auto border-2 border-dashed border-[#10B981]/30 rounded-full flex items-center justify-center">
                  <Key size={64} className="text-[#10B981] animate-pulse" />
               </div>
               <button onClick={startFaceEnrollment} className="w-full bg-[#10B981] text-black p-5 rounded-2xl font-black uppercase">Sign with Biometric</button>
            </motion.div>
          ) : (
            <motion.div key="s4-user" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-10">
              <h2 className="text-3xl font-black tracking-tighter uppercase">Vault Lock</h2>
              <div className="w-48 h-48 mx-auto bg-white/5 rounded-full flex items-center justify-center">
                <CheckCircle size={64} className="text-[#10B981]" />
              </div>
              <button onClick={startFaceEnrollment} className="w-full bg-[#10B981] text-black p-5 rounded-2xl font-black uppercase">Initialize Lock</button>
            </motion.div>
          ))}

          {step === 5 && (
            <motion.div key="final" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8">
              <ShieldCheck className="mx-auto text-[#10B981]" size={64} />
              <h2 className="text-4xl font-black tracking-tighter">Sync Complete</h2>
              <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-left">
                 <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">Node Identifer</p>
                 <p className="text-2xl font-black text-[#10B981] tracking-[0.3rem]">{formData.walletNumber}</p>
              </div>
              <button onClick={onRegisterSuccess} className="w-full bg-white text-black p-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl">Enter Node</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
