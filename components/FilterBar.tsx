
import React from 'react';
import { motion } from 'framer-motion';
import { Star, ShieldCheck, Banknote, LayoutGrid } from 'lucide-react';

interface FilterBarProps {
  onFilterChange: (filters: any) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ onFilterChange }) => {
  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-6 px-1">
      <div className="relative shrink-0">
        <select className="appearance-none bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest px-10 py-3.5 rounded-2xl outline-none focus:border-[#10B981] transition-all">
          <option>All Services</option>
          <option>Barber</option>
          <option>POS Agent</option>
          <option>Driver</option>
        </select>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
          <LayoutGrid size={14} />
        </div>
      </div>

      <button className="flex items-center gap-2 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3.5 rounded-2xl whitespace-nowrap hover:bg-[#10B981]/10 hover:border-[#10B981]/30 transition-all">
        <Star size={14} className="text-yellow-400" /> 4.5+ Rating
      </button>

      <button className="flex items-center gap-2 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3.5 rounded-2xl whitespace-nowrap hover:bg-[#10B981]/10 hover:border-[#10B981]/30 transition-all">
        <Banknote size={14} className="text-[#10B981]" /> Lowest Price
      </button>

      <button className="flex items-center gap-2 bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-[10px] font-black uppercase tracking-widest px-6 py-3.5 rounded-2xl whitespace-nowrap">
        <ShieldCheck size={14} /> Verified Only
      </button>
    </div>
  );
};
