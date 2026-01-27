
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { mockStore } from '../services/mockStore';
import { ShieldCheck, Lock, User, Key, CheckCircle } from 'lucide-react';

export const OnboardingStaff: React.FC<{ userId: string, onComplete: () => void }> = ({ userId, onComplete }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    password: '',
    pin: '',
    bio: '',
    phone: ''
  });

  const handleFinish = () => {
    if (data.password.length < 8 || data.pin.length !== 4) return alert("Keys must meet complexity standards");
    mockStore.completeOnboarding(userId, { ...data });
    onComplete();
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#141821] w-full max-w-md rounded-[3rem] border border-white/10 p-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-[#7C6CFF] text-white rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(124,108,255,0.3)]">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-black tracking-tighter uppercase text-white">Staff Induction</h2>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-2">Security Key Synchronization</p>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">New Neural Password</label>
              <input type="password" placeholder="Min 8 Characters" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-[#7C6CFF]" value={data.password} onChange={e => setData({...data, password: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">Secure Action PIN (4 Digits)</label>
              <input type="password" maxLength={4} placeholder="XXXX" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-[#7C6CFF] text-center text-2xl tracking-[1em]" value={data.pin} onChange={e => setData({...data, pin: e.target.value})} />
            </div>
            <button onClick={() => setStep(2)} disabled={!data.password || data.pin.length !== 4} className="w-full bg-[#7C6CFF] text-white p-5 rounded-2xl font-black uppercase tracking-widest mt-4">Next Protocol</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">Internal Profile Bio</label>
               <textarea className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-[#7C6CFF] min-h-[100px]" placeholder="Support specialization or admin expertise..." value={data.bio} onChange={e => setData({...data, bio: e.target.value})} />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">Direct Communication Node (Phone)</label>
               <input type="tel" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-[#7C6CFF]" value={data.phone} onChange={e => setData({...data, phone: e.target.value})} />
            </div>
            <button onClick={handleFinish} className="w-full bg-[#3DF2C4] text-black p-5 rounded-2xl font-black uppercase tracking-widest mt-4">Finalize Induction</button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
