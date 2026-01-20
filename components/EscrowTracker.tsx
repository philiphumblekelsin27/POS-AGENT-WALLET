
import React from 'react';
import { motion } from 'framer-motion';
import { Transaction, TransactionStatus, AgentCategory } from '../types';
import { ShieldCheck, AlertTriangle, ChevronRight, Lock } from 'lucide-react';

interface EscrowTrackerProps {
  transaction: Transaction;
  onRelease: (id: string) => void;
  onDispute: (id: string) => void;
}

export const EscrowTracker: React.FC<EscrowTrackerProps> = ({ transaction, onRelease, onDispute }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0A0A0A] p-6 rounded-[2.5rem] border border-[#10B981]/20 shadow-[0_20px_60px_rgba(16,185,129,0.05)] relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Lock size={80} />
      </div>

      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#10B981]">PAYNA Escrow Secured</span>
        </div>
        <p className="text-sm font-black text-white">{transaction.currency} {transaction.amount.toLocaleString()}</p>
      </div>

      <div className="space-y-1 mb-8">
        <h4 className="text-lg font-black tracking-tight text-white uppercase">{transaction.serviceType} Syncing...</h4>
        <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Agent: {transaction.recipientName}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => onDispute(transaction.id)}
          className="py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all"
        >
          Dispute
        </button>
        <button 
          onClick={() => onRelease(transaction.id)}
          className="py-4 bg-[#10B981] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#10B981]/20 active:scale-95 transition-all"
        >
          Release Funds <ChevronRight size={14} strokeWidth={3} />
        </button>
      </div>

      <p className="text-[9px] text-center text-white/20 font-bold uppercase tracking-[0.15em] mt-4 italic">Funds held in platform vault until service confirmation.</p>
    </motion.div>
  );
};
