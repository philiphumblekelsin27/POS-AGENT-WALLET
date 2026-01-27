
import React from 'react';
import { motion } from 'framer-motion';
import { Star, ShieldCheck, Banknote, LayoutGrid, Search, X } from 'lucide-react';
import { AgentCategory } from '../types';

export interface FilterState {
  category: string;
  minRating: number;
  minPrice: number;
  maxPrice: number;
  verifiedOnly: boolean;
  searchQuery: string;
  sortBy: 'price-low' | 'rating-high' | 'online-first';
}

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange }) => {
  const updateFilter = (key: keyof FilterState, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const categories = Object.values(AgentCategory);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20">
          <Search size={18} />
        </div>
        <input 
          type="text" 
          placeholder="Search by agent name..."
          value={filters.searchQuery}
          onChange={e => updateFilter('searchQuery', e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-xs font-bold outline-none focus:border-[#10B981] transition-all"
        />
        {filters.searchQuery && (
          <button 
            onClick={() => updateFilter('searchQuery', '')}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {/* Category Selector */}
        <div className="relative shrink-0">
          <select 
            value={filters.category}
            onChange={e => updateFilter('category', e.target.value)}
            className="appearance-none bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest px-10 py-3.5 rounded-2xl outline-none focus:border-[#10B981] transition-all cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat} Agents</option>
            ))}
          </select>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none">
            <LayoutGrid size={14} />
          </div>
        </div>

        {/* Min Rating Filter */}
        <button 
          onClick={() => updateFilter('minRating', filters.minRating === 4.5 ? 0 : 4.5)}
          className={`flex items-center gap-2 border text-[10px] font-black uppercase tracking-widest px-6 py-3.5 rounded-2xl whitespace-nowrap transition-all ${
            filters.minRating >= 4.5 ? 'bg-yellow-400/10 border-yellow-400 text-yellow-400' : 'bg-white/5 border-white/10 text-white/30'
          }`}
        >
          <Star size={14} className={filters.minRating >= 4.5 ? 'fill-yellow-400' : ''} /> 4.5+ Rating
        </button>

        {/* Sort By Price Toggle (Simple Cycle) */}
        <button 
          onClick={() => updateFilter('sortBy', filters.sortBy === 'price-low' ? 'online-first' : 'price-low')}
          className={`flex items-center gap-2 border text-[10px] font-black uppercase tracking-widest px-6 py-3.5 rounded-2xl whitespace-nowrap transition-all ${
            filters.sortBy === 'price-low' ? 'bg-[#10B981]/10 border-[#10B981] text-[#10B981]' : 'bg-white/5 border-white/10 text-white/30'
          }`}
        >
          <Banknote size={14} /> Lowest Price
        </button>

        {/* Verified Toggle */}
        <button 
          onClick={() => updateFilter('verifiedOnly', !filters.verifiedOnly)}
          className={`flex items-center gap-2 border text-[10px] font-black uppercase tracking-widest px-6 py-3.5 rounded-2xl whitespace-nowrap transition-all ${
            filters.verifiedOnly ? 'bg-blue-400/10 border-blue-400 text-blue-400' : 'bg-white/5 border-white/10 text-white/30'
          }`}
        >
          <ShieldCheck size={14} /> Verified Only
        </button>
      </div>

      {/* Advanced Price Inputs */}
      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
        <span className="text-[9px] font-black uppercase text-white/20 tracking-widest">Price Range (₦)</span>
        <div className="flex items-center gap-2 flex-1">
          <input 
            type="number" 
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={e => updateFilter('minPrice', parseInt(e.target.value) || 0)}
            className="w-full bg-black/40 border border-white/10 p-2 rounded-xl text-[10px] text-white font-bold outline-none focus:border-[#10B981]"
          />
          <span className="text-white/20">-</span>
          <input 
            type="number" 
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={e => updateFilter('maxPrice', parseInt(e.target.value) || 0)}
            className="w-full bg-black/40 border border-white/10 p-2 rounded-xl text-[10px] text-white font-bold outline-none focus:border-[#10B981]"
          />
        </div>
      </div>
    </div>
  );
};
