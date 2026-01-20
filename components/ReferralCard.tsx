
import React from 'react';
import { motion } from 'framer-motion';
import { Copy, Gift, Share2, Sparkles } from 'lucide-react';

interface ReferralCardProps {
  user: any;
}

export const ReferralCard: React.FC<ReferralCardProps> = ({ user }) => {
  const referralLink = `https://payna.app/join?ref=${user.referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    // You could trigger a toast here
  };

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#10B981] to-[#0A0A0A] p-8 border border-white/10 shadow-2xl group">
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
        <Gift size={100} />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-black font-black uppercase text-[10px] tracking-[0.2em]">
               <Sparkles size={12} /> Referral Rewards
            </div>
            <h4 className="text-2xl font-black text-white tracking-tighter">Refer & Earn</h4>
          </div>
          <div className="bg-black text-[#10B981] text-[8px] font-black px-3 py-1.5 rounded-full tracking-widest uppercase border border-[#10B981]/20">VIP Node</div>
        </div>

        <p className="text-xs font-bold text-white/60 mb-8 max-w-[220px]">Earn 0.1% commission on every transaction your referred agents process.</p>

        <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl flex justify-between items-center border border-white/5">
          <code className="text-[#10B981] font-black tracking-[0.2em] text-sm">{user.referralCode}</code>
          <button 
            onClick={copyToClipboard}
            className="flex items-center gap-2 bg-[#10B981] text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all"
          >
            <Copy size={12} /> Copy Link
          </button>
        </div>
      </div>
    </div>
  );
};
