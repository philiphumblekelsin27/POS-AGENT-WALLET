
import React, { useState, useMemo } from 'react';
import { Agent, AgentCategory, VerificationStatus, User } from '../types';
import { AgentMap } from '../components/AgentMap';
import { FilterBar, FilterState } from '../components/FilterBar';
import { mockStore } from '../services/mockStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Phone, MessageSquare, ShieldCheck, ChevronUp, MapPin, Clock, Info, SearchX } from 'lucide-react';

interface AgentsProps {
  agents: Agent[];
}

export const Agents: React.FC<AgentsProps> = ({ agents }) => {
  const [view, setView] = useState<'grid' | 'map'>('grid');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    category: 'ALL',
    minRating: 0,
    minPrice: 0,
    maxPrice: 0,
    verifiedOnly: false,
    searchQuery: '',
    sortBy: 'online-first'
  });

  const filteredAgents = useMemo(() => {
    let result = [...agents];

    // Search query (name or business name)
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(a => 
        a.businessName.toLowerCase().includes(query)
      );
    }

    // Category
    if (filters.category !== 'ALL') {
      result = result.filter(a => a.category === filters.category);
    }

    // Rating
    if (filters.minRating > 0) {
      result = result.filter(a => a.rating >= filters.minRating);
    }

    // Verification
    if (filters.verifiedOnly) {
      result = result.filter(a => a.verificationStatus === VerificationStatus.VERIFIED);
    }

    // Price Range
    if (filters.minPrice > 0) {
      result = result.filter(a => a.basePrice >= filters.minPrice);
    }
    if (filters.maxPrice > 0) {
      result = result.filter(a => a.basePrice <= filters.maxPrice);
    }

    // Sorting
    result.sort((a, b) => {
      if (filters.sortBy === 'price-low') return a.basePrice - b.basePrice;
      if (filters.sortBy === 'rating-high') return b.rating - a.rating;
      if (filters.sortBy === 'online-first') {
        if (a.isOnline === b.isOnline) return b.rating - a.rating;
        return a.isOnline ? -1 : 1;
      }
      return 0;
    });

    return result;
  }, [agents, filters]);

  const handleContact = (type: 'tel' | 'wa', agent: Agent) => {
    const val = agent.phone || '+2348000000000';
    const url = type === 'tel' ? `tel:${val}` : `https://wa.me/${val.replace(/\D/g, '')}`;
    window.open(url, '_blank');
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col overflow-hidden">
      <div className="p-6 pb-2 flex justify-between items-center z-10">
        <h2 className="text-3xl font-black tracking-tighter uppercase">Discovery</h2>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
          <button 
            onClick={() => setView('grid')} 
            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'grid' ? 'bg-[#10B981] text-black shadow-lg shadow-[#10B981]/20' : 'text-white/30'}`}
          >
            Grid
          </button>
          <button 
            onClick={() => setView('map')} 
            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'map' ? 'bg-[#10B981] text-black shadow-lg shadow-[#10B981]/20' : 'text-white/30'}`}
          >
            Map
          </button>
        </div>
      </div>

      <div className="px-6 py-4 space-y-4">
         <FilterBar filters={filters} onFilterChange={setFilters} />
      </div>

      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          {view === 'grid' ? (
            <motion.div 
              key="grid"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6 space-y-6 overflow-y-auto h-full no-scrollbar pb-32"
            >
              {filteredAgents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/20">
                  <SearchX size={64} strokeWidth={1} />
                  <p className="mt-4 text-[10px] font-black uppercase tracking-widest">No nodes found matching filters</p>
                  <button 
                    onClick={() => setFilters({
                      category: 'ALL',
                      minRating: 0,
                      minPrice: 0,
                      maxPrice: 0,
                      verifiedOnly: false,
                      searchQuery: '',
                      sortBy: 'online-first'
                    })}
                    className="mt-6 text-[#10B981] text-[10px] font-black uppercase tracking-widest underline"
                  >
                    Reset Operational Parameters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredAgents.map(agent => (
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
                          <span className="text-[8px] text-white/20 font-black uppercase tracking-widest">{agent.category}</span>
                        </div>
                      </div>
                      <ChevronUp size={16} className="text-white/10 group-hover:text-white transition-colors rotate-90" />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-0"
            >
               <AgentMap agents={filteredAgents} onSelectAgent={setSelectedAgent} />
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
