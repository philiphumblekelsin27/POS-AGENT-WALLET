
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Transaction, AgentCategory, UserRole, TransactionStatus, AIInsight, MarketData, TransactionType } from '../types';
import { mockStore } from '../services/mockStore';
import { getGlobalAIInsights } from '../services/aiService';
import { Odometer } from '../components/Odometer';
import { EscrowTracker } from '../components/EscrowTracker';
import { ReferralCard } from '../components/ReferralCard';
import { Sparkline } from '../components/Sparkline';
import { 
  Eye, EyeOff, TrendingUp, ChevronRight, Zap, 
  Smartphone, Car, Scissors, Hotel, ShoppingBag, 
  ShieldCheck, CreditCard, Sparkles, Lock, Briefcase, Star, Users, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';

interface DashboardProps {
  user: User;
  transactions: Transaction[];
  onNavigate: (page: string, params?: any) => void;
  onRefresh?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, transactions, onNavigate, onRefresh }) => {
  const isAgent = user.role === UserRole.AGENT;
  const [showPortfolio, setShowPortfolio] = useState(true);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [markets] = useState<MarketData[]>(mockStore.getMarketData());

  const activeEscrows = transactions.filter(t => t.status === TransactionStatus.IN_ESCROW && t.userId === user.id);
  const securedPayments = transactions.filter(t => t.status === TransactionStatus.IN_ESCROW && t.recipientId === user.id);

  useEffect(() => {
    const fetchInsights = async () => {
      if (transactions.length > 0) {
        const insights = await getGlobalAIInsights(user, transactions);
        setAiInsights(insights);
      }
    };
    fetchInsights();
  }, [transactions.length, user.id]);

  const handleRelease = (id: string) => {
    mockStore.releaseEscrow(id);
    if (onRefresh) onRefresh();
  };

  const netWorth = mockStore.calculateTotalNetWorth(user.id);

  const serviceGrid = [
    { icon: <Smartphone />, label: 'POS Cash', cat: AgentCategory.POS },
    { icon: <Car />, label: 'Ride', cat: AgentCategory.DRIVER },
    { icon: <Hotel />, label: 'Stay', cat: AgentCategory.HOTEL },
    { icon: <Scissors />, label: 'Barber', cat: AgentCategory.BARBER },
  ];

  return (
    <div className="p-6 space-y-8 pb-32 max-w-md mx-auto">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
            <motion.div whileTap={{ scale: 0.9 }} onClick={() => onNavigate('profile')} className="relative cursor-pointer">
                <img src={user.avatarUrl} alt="Avatar" className="w-12 h-12 rounded-2xl border border-white/10 object-cover" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#10B981] border-2 border-[#050505] rounded-full"></span>
            </motion.div>
            <div>
                <h1 className="text-sm font-medium text-white/40 uppercase tracking-[0.2em] text-[9px]">
                  {isAgent ? 'Node Workstation' : 'Vault Access'}
                </h1>
                <p className="text-xl font-black tracking-tight flex items-center gap-2 uppercase">
                  {user.name.split(' ')[0]}
                  <Sparkles size={14} className="text-[#10B981]" />
                </p>
            </div>
        </div>
        {isAgent && (
           <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5 text-yellow-400 font-black text-sm">
                 <Star size={14} fill="currentColor" /> {user.rating}
              </div>
              <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">{user.reviewCount} Reviews</p>
           </div>
        )}
      </header>

      {/* Hero Financial Stats */}
      <section className={`relative overflow-hidden rounded-[2.5rem] p-8 border border-white/5 shadow-2xl ${isAgent ? 'bg-gradient-to-br from-[#10B981]/20 to-[#0A0A0A]' : 'bg-[#0A0A0A]'}`}>
          <div className="relative z-10">
              <div className="flex justify-between items-center mb-2">
                <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em]">
                  {isAgent ? 'Total Business Earnings' : 'Current Liquidity'}
                </p>
                <button onClick={() => setShowPortfolio(!showPortfolio)} className="text-white/30 hover:text-white transition-colors">
                    {showPortfolio ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
              <div className="flex flex-col gap-1">
                <AnimatePresence mode="wait">
                  {showPortfolio ? (
                    <Odometer key="bal" value={isAgent ? user.totalEarned : user.balance} prefix="₦" className="text-5xl font-black tracking-tighter" />
                  ) : (
                    <motion.span key="hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-5xl font-black tracking-tighter">••••••••</motion.span>
                  )}
                </AnimatePresence>
                
                {isAgent ? (
                  <div className="mt-8 grid grid-cols-2 gap-4">
                     <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Total Spent</p>
                        <p className="text-sm font-black text-white">₦{user.totalSpent.toLocaleString()}</p>
                     </div>
                     <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Active Status</p>
                        <p className="text-sm font-black text-[#10B981]">ONLINE</p>
                     </div>
                  </div>
                ) : (
                  <div className="mt-6 flex gap-3">
                     <button onClick={() => onNavigate('wallet', { initialTab: 'topup' })} className="flex-1 bg-[#10B981] text-black h-14 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-[#10B981]/20 active:scale-95 transition-all">
                        <ArrowDownLeft size={16} strokeWidth={3} /> Add
                     </button>
                     <button onClick={() => onNavigate('wallet', { initialTab: 'transfer' })} className="flex-1 bg-white/5 border border-white/10 h-14 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">
                        <ArrowUpRight size={16} strokeWidth={3} /> Send
                     </button>
                  </div>
                )}
              </div>
          </div>
      </section>

      {/* Escrow Synchronization Engine */}
      {activeEscrows.length > 0 && (
        <section className="space-y-4">
           <div className="flex items-center gap-3 ml-1">
              <Lock className="text-[#10B981]" size={14} />
              <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Synchronized Escrows</h3>
           </div>
           <div className="space-y-4">
              {activeEscrows.map(tx => (
                <EscrowTracker 
                  key={tx.id} 
                  transaction={tx} 
                  onRelease={handleRelease} 
                  onDispute={(id) => onNavigate('support', { ticketId: id })} 
                />
              ))}
           </div>
        </section>
      )}

      {/* Conditional: Agent Workstation View */}
      {isAgent && securedPayments.length > 0 && (
        <section className="bg-gradient-to-br from-[#10B981]/10 to-transparent p-6 rounded-[2.5rem] border border-[#10B981]/20 space-y-6">
            <div className="flex items-center gap-3">
               <ShieldCheck className="text-[#10B981]" size={16} />
               <h3 className="text-[10px] font-black text-[#10B981] uppercase tracking-[0.2em]">Incoming Secure Synchronizations</h3>
            </div>
            {securedPayments.map(tx => (
              <div key={tx.id} className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5">
                 <div>
                    <p className="text-[10px] font-black uppercase text-white tracking-tight">Secured Payment: {tx.serviceType}</p>
                    <p className="text-[8px] text-white/30 font-bold uppercase mt-1">Ref: {tx.referenceNumber}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-xs font-black text-[#10B981]">{tx.currency} {tx.amount.toLocaleString()}</p>
                    <p className="text-[8px] text-white/20 font-bold uppercase">LOCKED</p>
                 </div>
              </div>
            ))}
        </section>
      )}

      {/* Main Service Discovery Grid */}
      {!isAgent && (
        <section className="space-y-6">
            <div className="flex justify-between items-center ml-1">
               <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Professional Services</h3>
               <button onClick={() => onNavigate('agents')} className="text-[9px] font-black text-[#10B981] uppercase tracking-widest hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-4 gap-4">
                {serviceGrid.map((s, idx) => (
                    <motion.button 
                      key={idx}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onNavigate('agents', { category: s.cat })}
                      className="flex flex-col items-center gap-3 group"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-[#0A0A0A] border border-white/5 flex items-center justify-center transition-all group-hover:bg-[#10B981] group-hover:text-black group-hover:border-none shadow-xl">
                          {s.icon}
                        </div>
                        <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.1em] text-center group-hover:text-white transition-colors">{s.label}</span>
                    </motion.button>
                ))}
            </div>
        </section>
      )}

      {/* Growth & Rewards */}
      <ReferralCard user={user} />

      {/* Market Oracle Pulse */}
      <section className="bg-[#0A0A0A] rounded-[2.5rem] p-8 border border-white/5">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Market Oracle</h3>
          <div className="flex items-center gap-1.5 text-[#10B981] text-[8px] font-black uppercase">
             <div className="w-1 h-1 bg-[#10B981] rounded-full animate-pulse" /> Live Feed
          </div>
        </div>
        <div className="space-y-6">
          {markets.map(m => (
            <div key={m.currency} className="flex justify-between items-center group cursor-pointer" onClick={() => onNavigate('markets')}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-[10px] font-black text-white/40 border border-white/5 group-hover:text-[#10B981] transition-colors">{m.currency.substring(0, 2)}</div>
                <div>
                   <p className="text-xs font-black uppercase tracking-tight">{m.currency} / NGN</p>
                   <p className="text-[8px] font-bold text-white/20 uppercase">DECENTRALIZED NODE</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xs font-black ${m.trend === 'UP' ? 'text-[#10B981]' : 'text-red-500'}`}>
                  {m.trend === 'UP' ? '+' : '-'}{Math.abs(m.change24h)}%
                </p>
                <div className="mt-1">
                   <Sparkline data={[20, 15, 25, 22, 30, 28, 35]} color={m.trend === 'UP' ? '#10B981' : '#EF4444'} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
