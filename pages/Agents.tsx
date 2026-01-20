
import React, { useState } from 'react';
import { Agent, AgentCategory, VerificationStatus, User } from '../types';
import { AgentMap } from '../components/AgentMap';
import { FilterBar } from '../components/FilterBar';
import { mockStore } from '../services/mockStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Phone, MessageSquare, ShieldCheck, ChevronUp, MapPin, Clock, Info } from 'lucide-react';

interface AgentsProps {
  agents: Agent[];
}

export const Agents: React.FC<AgentsProps> = ({ agents }) => {
  const [view, setView] = useState<'grid' | 'map'>('grid');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  
  const handleContact = (type: 'tel' | 'wa', agent: Agent) => {
    const val = agent.phone || '+2348000000000';
    const url = type === 'tel' ? `tel:${val}` : `https://wa.me/${val.replace(/\D/g, '')}`;
    window.open(url, '_blank');
  };

  const categories = [
    { id: AgentCategory.POS, label: 'POS Agents' },
    { id: AgentCategory.DRIVER, label: 'Verified Drivers' },
    { id: AgentCategory.BARBER, label: 'Lifestyle Services' },
  ];

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col overflow-hidden">
      <div className="p-6 pb-2 flex justify-between items-center z-10">
        <h2 className="text-3xl font-black tracking-tighter uppercase">Discovery</h2>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
          <button onClick={() => setView('grid')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'grid' ? 'bg-[#10B981] text-black shadow-lg shadow-[#10B981]/20' : 'text-white/30'}`}>Grid</button>
          <button onClick={() => setView('map')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'map' ? 'bg-[#10B981] text-black shadow-lg shadow-[#10B981]/20' : 'text-white/30'}`}>Map</button>
        </div>
      </div>

      <div className="px-6 py-2">
         <FilterBar onFilterChange={() => {}} />
      </div>

      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          {view === 'grid' ? (
            <motion.div 
              key="grid"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6 space-y-10 overflow-y-auto h-full no-scrollbar pb-32"
            >
              {categories.map(cat => (
                <div key={cat.id} className="space-y-4">
                  <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] ml-1">{cat.label}</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {agents.filter(a => a.category === cat.id).map(agent => (
                      <motion.div 
                        key={agent.id}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => setSelectedAgent(agent)}
                        className="p-6 rounded-[2.5rem] bg-[#0A0A0A] border border-white/5 flex items-center gap-5 cursor-pointer group hover:border-[#10B981]/30 transition-all"
                      >
                        <div className="relative shrink-0">
                           <img src={agent.avatarUrl} className="w-16 h-16 rounded-2xl object-cover border border-white/10" />
                           {agent.isOnline && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#10B981] border-4 border-[#0A0A0A] rounded-full"></span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-black text-xs uppercase tracking-tight truncate">{agent.businessName}</h4>
                            {agent.verificationStatus === VerificationStatus.VERIFIED && <ShieldCheck size={14} className="text-[#10B981]" />}
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-yellow-500 uppercase flex items-center gap-1">
                              <Star size={10} fill="currentColor" /> {agent.rating}
                            </span>
                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">₦{agent.basePrice?.toLocaleString()}</span>
                          </div>
                        </div>
                        <ChevronUp size={16} className="text-white/10 group-hover:text-white transition-colors rotate-90" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-0"
            >
               <AgentMap agents={agents} onSelectAgent={setSelectedAgent} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedAgent && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[60] bg-[#0A0A0A] rounded-t-[3.5rem] border-t border-white/10 shadow-2xl max-w-md mx-auto"
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-4 mb-8" />
            <div className="p-8 space-y-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <img src={selectedAgent.avatarUrl} className="w-20 h-20 rounded-[2rem] object-cover border-2 border-[#10B981]/20 shadow-xl" />
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#10B981] text-black rounded-full flex items-center justify-center border-4 border-[#0A0A0A]">
                      <ShieldCheck size={16} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">{selectedAgent.businessName}</h3>
                    <p className="text-[10px] font-black text-[#10B981] uppercase tracking-[0.2em] mt-1">{selectedAgent.category} SPECIALIST</p>
                  </div>
                </div>
                <button onClick={() => setSelectedAgent(null)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 border border-white/5">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.03] p-5 rounded-[1.5rem] border border-white/5">
                  <div className="flex items-center gap-2 mb-2 text-white/30 font-black uppercase text-[8px] tracking-widest">
                    <Star size={12} className="text-yellow-400" /> Client Rating
                  </div>
                  <p className="text-sm font-black text-white">{selectedAgent.rating} / 5.0</p>
                </div>
                <div className="bg-white/[0.03] p-5 rounded-[1.5rem] border border-white/5">
                  <div className="flex items-center gap-2 mb-2 text-[#10B981]/40 font-black uppercase text-[8px] tracking-widest">
                    <Clock size={12} /> Status
                  </div>
                  <p className={`text-sm font-black ${selectedAgent.isOnline ? 'text-[#10B981]' : 'text-red-500'}`}>{selectedAgent.isOnline ? 'AVAILABLE' : 'OFFLINE'}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => handleContact('wa', selectedAgent)}
                  className="flex-1 h-16 bg-white/[0.03] border border-white/5 text-white/60 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                >
                  <MessageSquare size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Message</span>
                </button>
                <button 
                  onClick={() => handleContact('tel', selectedAgent)}
                  className="flex-1 h-16 bg-white/[0.03] border border-white/5 text-white/60 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                >
                  <Phone size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Voice</span>
                </button>
              </div>

              <button className="w-full h-16 bg-[#10B981] text-black rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-[#10B981]/20 active:scale-95 transition-all">
                Synchronize Secure Payout
              </button>
              <div className="pb-4" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
