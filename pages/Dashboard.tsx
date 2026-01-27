
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Transaction, AgentCategory, UserRole, TransactionStatus, MarketData, AIInsight, Agent } from '../types';
import { mockStore } from '../services/mockStore';
import { getGlobalAIInsights } from '../services/aiService';
import { Odometer } from '../components/Odometer';
import { EscrowTracker } from '../components/EscrowTracker';
import { DashboardSkeleton } from '../components/Skeleton';
import { 
  Eye, EyeOff, Sparkles, Smartphone, Car, Hotel, Scissors, 
  ArrowDownLeft, ArrowUpRight, Star, Lock, ShieldCheck, 
  TrendingUp, Users, Activity, Power, Settings, MapPin, Clock, 
  Zap, ArrowRight, History
} from 'lucide-react';

interface DashboardProps {
  user: User;
  transactions: Transaction[];
  onNavigate: (page: string, params?: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, transactions, onNavigate }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showPortfolio, setShowPortfolio] = useState(true);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const markets = mockStore.getMarketData();

  const agent = mockStore.getAgents().find(a => a.userId === user.id);
  const isAgent = user.role === UserRole.AGENT;

  useEffect(() => {
    const initDashboard = async () => {
      // Simulate Neural Sync with kernel
      await new Promise(r => setTimeout(r, 1200));
      setIsLoading(false);
      
      if (transactions.length > 0) {
        const insights = await getGlobalAIInsights(user, transactions);
        setAiInsights(insights);
      }
    };
    initDashboard();
  }, [user.id]);

  if (isLoading) return <DashboardSkeleton />;

  const activeEscrows = transactions.filter(t => t.status === TransactionStatus.IN_ESCROW);
  const recentTransactions = transactions.slice(0, 4);

  // --- SUB-COMPONENTS ---

  const AgentView = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Agent Performance Card */}
      <section className="bg-[#0A0A0A] rounded-[2.5rem] p-8 border border-[#10B981]/20 shadow-[0_20px_60px_rgba(16,185,129,0.05)] relative overflow-hidden group">
          <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-[#10B981]/5 rounded-full blur-[80px]" />
          
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full animate-pulse ${isOnline ? 'bg-[#10B981]' : 'bg-red-500'}`} />
              <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em]">
                {isOnline ? 'Terminal Online' : 'Terminal Idle'}
              </p>
            </div>
            <button 
              onClick={() => setIsOnline(!isOnline)}
              className={`w-14 h-8 rounded-full transition-all relative p-1 ${isOnline ? 'bg-[#10B981]' : 'bg-white/10'}`}
            >
              <motion.div animate={{ x: isOnline ? 24 : 0 }} className="w-6 h-6 bg-white rounded-full shadow-lg" />
            </button>
          </div>

          <div className="space-y-1">
             <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Today's Earnings</p>
             <Odometer value={user.totalEarned || 0} prefix="₦" className="text-5xl font-black tracking-tighter" />
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-3">
             <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                <p className="text-[8px] font-black uppercase text-white/20 mb-1">Success Rate</p>
                <p className="text-sm font-black text-[#10B981]">98.4%</p>
             </div>
             <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                <p className="text-[8px] font-black uppercase text-white/20 mb-1">Active Syncs</p>
                <p className="text-sm font-black text-white">{activeEscrows.length}</p>
             </div>
          </div>
      </section>

      {/* Quick Agent Actions */}
      <section className="grid grid-cols-4 gap-4">
          {[
            { icon: <MapPin />, label: 'Location', action: () => onNavigate('profile') },
            { icon: <Zap />, label: 'Instant', action: () => onNavigate('wallet') },
            { icon: <Activity />, label: 'Analytics', action: () => {} },
            { icon: <Settings />, label: 'Kernel', action: () => onNavigate('profile') },
          ].map((item, idx) => (
            <button key={idx} onClick={item.action} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-[#10B981] hover:text-black transition-all group">
                  {/* FIX: Cast to React.ReactElement<any> to resolve size property error */}
                  {React.cloneElement(item.icon as React.ReactElement<any>, { size: 20 })}
                </div>
                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
      </section>

      {/* Active Requests */}
      {activeEscrows.length > 0 && (
        <section className="space-y-4">
           <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Live Sync Requests</h3>
           {activeEscrows.map(tx => (
             <EscrowTracker 
              key={tx.id} 
              transaction={tx} 
              onRelease={(id) => mockStore.releaseEscrow(id)} 
              onDispute={() => onNavigate('support')} 
             />
           ))}
        </section>
      )}

      {/* Recent Activity */}
      <section className="bg-[#0A0A0A] rounded-[2.5rem] p-8 border border-white/5">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Service Feed</h3>
          <History size={14} className="text-white/20" />
        </div>
        <div className="space-y-4">
          {recentTransactions.map(tx => (
            <div key={tx.id} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-[#10B981]">
                    <Smartphone size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight">{tx.recipientName || 'Incoming Node'}</p>
                    <p className="text-[8px] text-white/20 font-bold uppercase">{new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
               </div>
               <p className="text-xs font-black text-[#10B981]">₦{tx.amount.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );

  const CustomerView = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Wallet Balance Card */}
      <section className="bg-[#0A0A0A] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-[#10B981]/5 rounded-full blur-[80px]" />
          <div className="flex justify-between items-center mb-2">
            <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em]">Liquidity Pool</p>
            <button onClick={() => setShowPortfolio(!showPortfolio)} className="text-white/30 hover:text-white transition-colors">
                {showPortfolio ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
          <AnimatePresence mode="wait">
            {showPortfolio ? (
              <Odometer key="bal" value={user.balance} prefix="₦" className="text-5xl font-black tracking-tighter" />
            ) : (
              <motion.span key="hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-5xl font-black tracking-tighter">••••••••</motion.span>
            )}
          </AnimatePresence>
          
          <div className="mt-10 flex gap-4">
             <button onClick={() => onNavigate('wallet')} className="flex-1 bg-[#10B981] text-black h-16 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-[#10B981]/20 active:scale-95 transition-all">
                <ArrowDownLeft size={18} strokeWidth={3} /> Add
             </button>
             <button onClick={() => onNavigate('wallet')} className="flex-1 bg-white/5 border border-white/10 h-16 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white/10 active:scale-95 transition-all">
                <ArrowUpRight size={18} strokeWidth={3} /> Send
             </button>
          </div>
      </section>

      {/* Booking Actions */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 ml-1">
          <Smartphone className="text-[#10B981]" size={14} />
          <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Neural Dispatch</h3>
        </div>
        <div className="grid grid-cols-4 gap-4">
            {[
              { icon: <Smartphone />, label: 'POS', cat: AgentCategory.POS },
              { icon: <Car />, label: 'Ride', cat: AgentCategory.DRIVER },
              { icon: <Hotel />, label: 'Stay', cat: AgentCategory.HOTEL },
              { icon: <Scissors />, label: 'Style', cat: AgentCategory.BARBER },
            ].map((s, idx) => (
                <button key={idx} onClick={() => onNavigate('agents')} className="flex flex-col items-center gap-3 group">
                    <div className="w-14 h-14 rounded-2xl bg-[#0A0A0A] border border-white/5 flex items-center justify-center group-hover:bg-[#10B981] group-hover:text-black transition-all group-active:scale-90">
                      {s.icon}
                    </div>
                    <span className="text-[8px] font-black text-white/30 uppercase tracking-widest group-hover:text-white transition-colors">{s.label}</span>
                </button>
            ))}
        </div>
      </section>

      {/* AI Insights & Escrow */}
      <AnimatePresence>
        {activeEscrows.length > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-4">
             <div className="flex items-center gap-3 ml-1">
                <Lock className="text-[#10B981]" size={14} />
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Vault Syncs</h3>
             </div>
             {activeEscrows.map(tx => (
               <EscrowTracker 
                key={tx.id} 
                transaction={tx} 
                onRelease={(id) => mockStore.releaseEscrow(id)} 
                onDispute={() => onNavigate('support')} 
               />
             ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Neural Market Feed */}
      <section className="bg-[#0A0A0A] rounded-[2.5rem] p-8 border border-white/5">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Market Oracle</h3>
          <TrendingUp size={14} className="text-[#10B981]" />
        </div>
        <div className="space-y-6">
          {markets.slice(0, 3).map(m => (
            <div key={m.currency} className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[10px] font-black text-white/40 uppercase tracking-tight">{m.currency.substring(0, 2)}</div>
                <div>
                   <p className="text-xs font-black uppercase tracking-tight">{m.currency} Index</p>
                   <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Oracle Verified</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black mb-0.5">₦{m.price.toLocaleString()}</p>
                <p className={`text-[9px] font-black ${m.trend === 'UP' ? 'text-[#10B981]' : 'text-red-500'}`}>
                  {m.trend === 'UP' ? '▲' : '▼'} {Math.abs(m.change24h)}%
                </p>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => onNavigate('markets')} className="w-full mt-8 pt-4 border-t border-white/5 text-[9px] font-black uppercase tracking-widest text-[#10B981] flex items-center justify-center gap-2">
           Full Market View <ArrowRight size={10} />
        </button>
      </section>
    </motion.div>
  );

  return (
    <div className="p-6 space-y-8 pb-32 max-w-md mx-auto">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
            <motion.div 
              whileTap={{ scale: 0.9 }} 
              onClick={() => onNavigate('profile')} 
              className="relative cursor-pointer group"
            >
                <img 
                  src={user.avatarUrl} 
                  className="w-14 h-14 rounded-[1.5rem] border border-white/10 object-cover shadow-2xl group-hover:border-[#10B981]/50 transition-all" 
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#10B981] border-4 border-[#050505] rounded-full"></span>
            </motion.div>
            <div>
                <h1 className="text-white/40 uppercase tracking-[0.3em] text-[10px] font-black mb-1">
                  {isAgent ? 'Terminal Node' : 'Client Node'}
                </h1>
                <p className="text-2xl font-black flex items-center gap-2 uppercase tracking-tighter">
                  {user.name.split(' ')[0]} <Sparkles size={16} className="text-[#10B981]" />
                </p>
            </div>
        </div>
        <div className="flex gap-2">
           <button onClick={() => onNavigate('support')} className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white/30 hover:text-white transition-all">
             <Activity size={18} />
           </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {isAgent ? <AgentView key="agent" /> : <CustomerView key="customer" />}
      </AnimatePresence>

      <footer className="text-center pb-8 opacity-20">
         <div className="flex items-center justify-center gap-2 mb-2">
            <ShieldCheck size={12} />
            <span className="text-[8px] font-black uppercase tracking-[0.4em]">Kernel Secured v2.0</span>
         </div>
      </footer>
    </div>
  );
};
