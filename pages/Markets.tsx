
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MarketData, RealTimeEvent } from '../types';
import { mockStore } from '../services/mockStore';
import { Sparkline } from '../components/Sparkline';
import { Search, TrendingUp, TrendingDown, Info, ArrowRightLeft } from 'lucide-react';

export const Markets: React.FC = () => {
  const [markets, setMarkets] = useState<MarketData[]>(mockStore.getMarketData());
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsubscribe = mockStore.subscribe((event: RealTimeEvent) => {
        if (event.type === 'MARKET_UPDATE') setMarkets(event.payload);
    });
    return () => unsubscribe();
  }, []);

  const filtered = markets.filter(m => m.currency.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 pb-32 text-white bg-[#050505] min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black tracking-tight">Markets</h2>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-[8px] font-black uppercase tracking-widest">Network Live</span>
        </div>
      </div>

      <div className="relative mb-10">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20">
          <Search size={18} />
        </div>
        <input 
          type="text" 
          placeholder="Search Assets (e.g. NGN, BTC)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-xs font-bold outline-none focus:border-[#00F2EA] transition-all"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="p-5 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20">
          <div className="flex items-center gap-2 mb-2 text-white/30 font-black uppercase text-[8px] tracking-widest">
            <TrendingUp size={10} /> Highest Growth
          </div>
          <p className="text-xl font-black text-white">{filtered[0]?.currency || '...'}</p>
          <span className="text-[10px] font-bold text-indigo-400">+4.2%</span>
        </div>
        <div className="p-5 rounded-[2rem] bg-[#00F2EA]/10 border border-[#00F2EA]/20">
          <div className="flex items-center gap-2 mb-2 text-white/30 font-black uppercase text-[8px] tracking-widest">
            <ArrowRightLeft size={10} /> Active Swaps
          </div>
          <p className="text-xl font-black text-white">2.4k</p>
          <span className="text-[10px] font-bold text-[#00F2EA]">24h volume</span>
        </div>
      </div>

      {/* Market Watch List (Binance Style) */}
      <section className="space-y-4">
        <div className="grid grid-cols-3 px-4 text-[8px] font-black uppercase tracking-[0.2em] text-white/20">
          <span>Asset / Node</span>
          <span className="text-center">Rate (NGN)</span>
          <span className="text-right">Trend</span>
        </div>

        <div className="space-y-3">
          {filtered.map((m, idx) => (
            <motion.div 
              key={m.currency}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-5 rounded-[2rem] bg-white/[0.02] border border-white/5 grid grid-cols-3 items-center group hover:bg-white/[0.05] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xs font-black text-white/40">
                  {m.currency.substring(0, 2)}
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-tight">{m.currency}</h4>
                  <p className="text-[8px] text-white/20 font-bold uppercase tracking-widest">Oracle Node</p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs font-black">₦ {m.price.toLocaleString()}</p>
                <div className="flex items-center justify-center gap-2 text-[8px] text-white/20 font-bold mt-1">
                  <span>B: {(m.price * 1.01).toFixed(0)}</span>
                  <span>S: {(m.price * 0.99).toFixed(0)}</span>
                </div>
              </div>

              <div className="text-right space-y-2">
                <p className={`text-xs font-black ${m.trend === 'UP' ? 'text-[#00F2EA]' : 'text-red-500'}`}>
                  {m.trend === 'UP' ? '+' : '-'}{Math.abs(m.change24h)}%
                </p>
                <div className="flex justify-end">
                  <Sparkline data={[10, 15, 8, 20, 25, 30]} color={m.trend === 'UP' ? '#00F2EA' : '#EF4444'} width={60} height={15} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="mt-12 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 flex gap-4 items-center opacity-40">
        <Info className="text-[#00F2EA] shrink-0" size={20} />
        <p className="text-[9px] font-medium leading-relaxed uppercase tracking-widest">Rates are synchronized via decentralized oracle nodes every 10 seconds. Always verify external rates before swapping larger assets.</p>
      </div>
    </div>
  );
};
