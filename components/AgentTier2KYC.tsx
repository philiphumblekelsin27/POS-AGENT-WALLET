
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Camera, CheckCircle, Shield } from 'lucide-react';

interface AgentTier2KYCProps {
  onComplete: () => void;
}

export const AgentTier2KYC: React.FC<AgentTier2KYCProps> = ({ onComplete }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onComplete();
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8 p-6 bg-[#0A0A0A] rounded-[2.5rem] border border-white/5"
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-[#10B981]/10 text-[#10B981] rounded-2xl flex items-center justify-center">
          <Shield size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black tracking-tighter uppercase text-white">Business Audit</h2>
          <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Upgrade to Tier 2 Node Access</p>
        </div>
      </div>

      <p className="text-xs font-bold text-white/60 leading-relaxed uppercase tracking-widest">To unlock professional escrow limits, we must verify your physical business terminal or operational headquarters.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Terminal Physical Address</label>
          <div className="relative">
            <input 
              required
              className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-xs outline-none focus:border-[#10B981] transition-all pl-12" 
              placeholder="Street, City, Operational Zone" 
            />
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Terminal Visual Proof</label>
          <div className="border-2 border-dashed border-white/10 p-12 rounded-[2rem] flex flex-col items-center justify-center gap-4 group hover:border-[#10B981]/30 transition-all cursor-pointer">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 group-hover:text-[#10B981] transition-colors">
              <Camera size={24} />
            </div>
            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Capture Shop / Operational Hub Photo</p>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-[#10B981] text-black p-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-[#10B981]/20 active:scale-95 transition-all"
        >
          {loading ? 'Submitting Node Audit...' : 'Submit for Verification'}
        </button>
      </form>
    </motion.div>
  );
};
