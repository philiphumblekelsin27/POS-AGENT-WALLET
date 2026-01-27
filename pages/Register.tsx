
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, User as UserIcon, Briefcase, CheckCircle, ChevronRight, Loader2, Key, Users, ArrowLeft, Phone, Eye, EyeOff, Lock, XCircle } from 'lucide-react';
import { mockStore } from '../services/mockStore';
import { UserRole } from '../types';

interface RegisterProps {
  onRegisterSuccess: () => void;
  onNavigateToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onNavigateToLogin }) => {
  const [step, setStep] = useState(0); 
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    pin: '',
    preferredCurrency: 'NGN',
    role: UserRole.USER as UserRole
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordStrength = useMemo(() => {
    const p = formData.password;
    if (!p) return null;
    if (p.length < 8) return { label: 'WEAK', color: 'text-red-500' };
    const hasNum = /\d/.test(p);
    const hasSpec = /[!@#$%^&*]/.test(p);
    if (hasNum && hasSpec) return { label: 'STRONG', color: 'text-[#3DF2C4]' };
    return { label: 'MODERATE', color: 'text-orange-500' };
  }, [formData.password]);

  const passwordMismatch = useMemo(() => {
    if (!formData.confirmPassword) return false;
    return formData.password !== formData.confirmPassword;
  }, [formData.password, formData.confirmPassword]);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleFinalize = async () => {
    if (formData.password !== formData.confirmPassword) return;
    if (formData.pin.length !== 4) return alert("Action PIN must be 4 digits");
    
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 2000));
      mockStore.register(formData);
      onRegisterSuccess();
    } catch (err: any) {
      alert(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E11] flex items-center justify-center p-6 text-white relative overflow-hidden font-inter">
      <div className="max-w-md w-full bg-[#141821] p-10 rounded-[3rem] border border-white/5 shadow-2xl z-10">
        
        {step > 0 && (
          <button onClick={handleBack} className="mb-8 text-white/40 hover:text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            <ArrowLeft size={16} /> Back
          </button>
        )}

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="role" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
               <div className="text-center">
                  <h2 className="text-3xl font-black tracking-tighter mb-2">VAULT ENTRY</h2>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Identify your operational role</p>
               </div>

               <div className="space-y-4">
                  <button 
                    onClick={() => setFormData({...formData, role: UserRole.USER})}
                    className={`w-full p-6 rounded-[2rem] border-2 text-left flex items-center gap-6 transition-all ${
                      formData.role === UserRole.USER ? 'border-[#3DF2C4] bg-[#3DF2C4]/5' : 'border-white/5 bg-white/5'
                    }`}
                  >
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${formData.role === UserRole.USER ? 'bg-[#3DF2C4] text-black' : 'bg-white/5 text-[#3DF2C4]'}`}>
                        <Users size={24} />
                     </div>
                     <div className="flex-1">
                        <p className="font-black text-sm uppercase">Customer Node</p>
                        <p className="text-[9px] text-white/30 font-bold uppercase mt-1">For P2P & Service Payments</p>
                     </div>
                  </button>

                  <button 
                    onClick={() => setFormData({...formData, role: UserRole.AGENT})}
                    className={`w-full p-6 rounded-[2rem] border-2 text-left flex items-center gap-6 transition-all ${
                      formData.role === UserRole.AGENT ? 'border-[#3DF2C4] bg-[#3DF2C4]/5' : 'border-white/5 bg-white/5'
                    }`}
                  >
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${formData.role === UserRole.AGENT ? 'bg-[#3DF2C4] text-black' : 'bg-white/5 text-[#3DF2C4]'}`}>
                        <Briefcase size={24} />
                     </div>
                     <div className="flex-1">
                        <p className="font-black text-sm uppercase">Agent Terminal</p>
                        <p className="text-[9px] text-white/30 font-bold uppercase mt-1">For Service Providers & Merchants</p>
                     </div>
                  </button>
               </div>

               <button onClick={handleNext} className="w-full bg-[#3DF2C4] text-black p-5 rounded-2xl font-black uppercase tracking-widest shadow-xl">
                 Continue Node Setup
               </button>
               <p className="text-center text-[10px] text-white/20 font-black uppercase tracking-widest">
                Already have a node? <button onClick={onNavigateToLogin} className="text-[#3DF2C4]">Enter Vault</button>
               </p>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="creds" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-black tracking-tighter mb-2">IDENTITY SYNC</h2>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Hardware ID & Profile</p>
              </div>
              <div className="space-y-4">
                <input className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-[#3DF2C4]" placeholder="Legal Identity Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input type="email" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-[#3DF2C4]" placeholder="Primary Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                <div className="relative">
                  <input type="tel" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-[#3DF2C4] pl-14" placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                </div>
              </div>
              <button onClick={handleNext} disabled={!formData.name || !formData.email || !formData.phone} className="w-full bg-[#3DF2C4] text-black p-5 rounded-2xl font-black uppercase tracking-widest disabled:opacity-50">Next Protocol</button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-black tracking-tighter mb-2">SECURITY KEYS</h2>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Neural Password & Action PIN</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Master Password</label>
                    {passwordStrength && <span className={`text-[8px] font-black uppercase ${passwordStrength.color}`}>{passwordStrength.label}</span>}
                  </div>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-[#3DF2C4] pr-14" 
                      placeholder="Min 8 Characters" 
                      value={formData.password} 
                      onChange={e => setFormData({...formData, password: e.target.value})} 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Confirm Password</label>
                  <div className="relative">
                    <input 
                      type="password" 
                      className={`w-full bg-white/5 border p-5 rounded-2xl outline-none transition-all ${passwordMismatch ? 'border-red-500' : 'border-white/10 focus:border-[#3DF2C4]'}`} 
                      placeholder="Re-enter Key" 
                      value={formData.confirmPassword} 
                      onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                    />
                    {passwordMismatch && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500">
                        <XCircle size={18} />
                      </div>
                    )}
                  </div>
                  {passwordMismatch && <p className="text-[8px] font-black uppercase text-red-500 ml-1">Error: Credentials do not match</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Action PIN (4 Digits)</label>
                    <Lock size={12} className="text-[#3DF2C4]" />
                  </div>
                  <input 
                    type="password" 
                    maxLength={4}
                    inputMode="numeric"
                    className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-[#3DF2C4] text-center text-4xl tracking-[0.8em] font-black" 
                    placeholder="••••" 
                    value={formData.pin} 
                    onChange={e => setFormData({...formData, pin: e.target.value.replace(/\D/g, '')})} 
                  />
                  <p className="text-[8px] text-center text-white/20 font-black uppercase mt-1 tracking-widest italic">Node entry masked for visual security</p>
                </div>
              </div>

              <button 
                onClick={handleFinalize} 
                disabled={loading || !formData.password || !formData.pin || passwordMismatch || formData.password.length < 8}
                className="w-full bg-[#3DF2C4] text-black p-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-20 transition-all"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Initialize Node <ChevronRight size={18} /></>}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
