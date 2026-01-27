
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Delete, X, ShieldCheck } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => void;
  title?: string;
}

export const PinModal: React.FC<PinModalProps> = ({ isOpen, onClose, onConfirm, title = "VERIFY PIN" }) => {
  const [pin, setPin] = useState('');
  
  const handleInput = (val: string) => {
    if (pin.length < 4) setPin(p => p + val);
  };

  const handleDelete = () => setPin(p => p.slice(0, -1));

  useEffect(() => {
    if (pin.length === 4) {
      onConfirm(pin);
      setPin('');
    }
  }, [pin]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="bg-[#141821] w-full max-w-sm rounded-[3rem] border border-white/10 p-10 flex flex-col items-center"
      >
        <div className="w-16 h-16 bg-[#3DF2C4]/10 text-[#3DF2C4] rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(61,242,196,0.1)]">
          <Lock size={32} />
        </div>
        
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-2">{title}</h3>
        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-10 text-center px-4">Identify your secure node to complete sync</p>

        <div className="flex gap-4 mb-14">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${pin.length >= i ? 'bg-[#3DF2C4] border-[#3DF2C4] shadow-[0_0_15px_#3DF2C4]' : 'border-white/20'}`} />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button key={n} onClick={() => handleInput(n.toString())} className="h-16 rounded-2xl bg-white/5 border border-white/5 text-2xl font-black text-white hover:bg-[#3DF2C4] hover:text-black transition-all active:scale-90">
              {n}
            </button>
          ))}
          <button onClick={onClose} className="h-16 flex items-center justify-center text-white/30 hover:text-white"><X size={24} /></button>
          <button onClick={() => handleInput('0')} className="h-16 rounded-2xl bg-white/5 border border-white/5 text-2xl font-black text-white hover:bg-[#3DF2C4] hover:text-black transition-all active:scale-90">0</button>
          <button onClick={handleDelete} className="h-16 flex items-center justify-center text-white/30 hover:text-white"><Delete size={24} /></button>
        </div>
      </motion.div>
    </div>
  );
};
