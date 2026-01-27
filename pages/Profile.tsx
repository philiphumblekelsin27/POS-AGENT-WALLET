
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, UserRole } from '../types';
import { mockStore } from '../services/mockStore';
import { PinModal } from '../components/PinModal';
import { Shield, CreditCard, Lock, ChevronRight, Camera, LogOut, Upload, Loader2, Sparkles } from 'lucide-react';

export const Profile: React.FC<{ user: User, onRefresh?: () => void }> = ({ user, onRefresh }) => {
  const [activeSection, setActiveSection] = useState<'OVERVIEW' | 'SECURITY' | 'PIN'>('OVERVIEW');
  const [isEditing, setIsEditing] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    name: user.name,
    email: user.email,
    password: '',
    pin: ''
  });

  const handleUpdateUser = (pin?: string) => {
    if (activeSection === 'PIN' && !pin) {
      setIsPinModalOpen(true);
      return;
    }
    
    mockStore.updateUser(user.id, { ...formData, pin: pin });
    setIsEditing(false);
    setActiveSection('OVERVIEW');
    onRefresh?.();
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        mockStore.updateUser(user.id, { avatarUrl: base64String });
        setUploading(false);
        onRefresh?.();
        // Neural Ping
        alert("Node Profile Synced.");
      };
      reader.onerror = () => {
        setUploading(false);
        alert("Buffer Transfer Failure.");
      };
      reader.readAsDataURL(file);
    }
  };

  const renderOverview = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="flex flex-col items-center mt-12 relative">
        <div className="absolute top-[-40px] opacity-10 blur-3xl pointer-events-none">
          <Sparkles className="w-64 h-64 text-[#3DF2C4]" />
        </div>
        
        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange} 
          />
          <div className={`w-36 h-36 rounded-[3.5rem] overflow-hidden border-4 border-[#141821] shadow-2xl transition-all relative ${uploading ? 'opacity-50' : 'group-hover:scale-105'}`}>
            <img 
              src={user.avatarUrl} 
              className="w-full h-full object-cover" 
              alt="Node Avatar"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               {uploading ? <Loader2 className="animate-spin text-white" /> : <Upload className="text-white" size={32} />}
            </div>
          </div>
          <div className="absolute bottom-1 right-1 w-12 h-12 bg-[#3DF2C4] text-black rounded-2xl flex items-center justify-center border-4 border-[#0B0E11] shadow-xl group-hover:rotate-12 transition-transform">
            <Camera size={22} />
          </div>
        </div>
        
        <div className="text-center mt-8">
           <h2 className="text-3xl font-black tracking-tighter uppercase text-white">{user.name}</h2>
           <div className="flex items-center justify-center gap-3 mt-1">
              <p className="text-[10px] font-black text-[#A3ACB9] uppercase tracking-[0.4em]">{user.role} NODE</p>
              <div className="w-1.5 h-1.5 rounded-full bg-[#3DF2C4] shadow-[0_0_10px_#3DF2C4]" />
              <p className="text-[10px] font-black text-[#3DF2C4] uppercase tracking-[0.3em]">{user.walletNumber}</p>
           </div>
        </div>
      </div>

      <div className="bg-[#141821] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
        <ProfileMenuItem icon={<Lock size={20} />} label="Security Protocol" subLabel="Manage Hardware Keys" onClick={() => setActiveSection('SECURITY')} />
        <ProfileMenuItem icon={<Shield size={20} />} label="Action PIN" subLabel="Transaction Verification" onClick={() => setActiveSection('PIN')} />
        <ProfileMenuItem icon={<CreditCard size={20} />} label="Vault Nodes" subLabel="Multi-Currency Balances" onClick={() => {}} />
      </div>

      <div className="px-2">
        <button onClick={() => mockStore.logout()} className="w-full h-20 bg-red-500/5 text-red-500 border border-red-500/10 rounded-[2rem] flex items-center justify-center gap-4 font-black uppercase text-[10px] tracking-[0.4em] transition-all hover:bg-red-500/10 active:scale-95">
          <LogOut size={20} /> Terminate Connection
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-8 pb-32 max-w-md mx-auto min-h-screen bg-[#0B0E11] text-[#E6EAF0]">
      <PinModal isOpen={isPinModalOpen} onClose={() => setIsPinModalOpen(false)} onConfirm={handleUpdateUser} title="NODE ROTATION VERIFY" />
      
      <AnimatePresence mode="wait">
        {activeSection === 'OVERVIEW' ? renderOverview() : (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12 mt-10">
            <header className="flex justify-between items-center">
              <button onClick={() => {setActiveSection('OVERVIEW'); setIsEditing(false);}} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#A3ACB9] hover:text-white transition-colors">
                 ←
              </button>
              <h3 className="text-xl font-black uppercase tracking-tighter text-white">
                {activeSection === 'SECURITY' ? 'Kernel Key' : 'Action PIN'}
              </h3>
              <button 
                onClick={() => isEditing ? handleUpdateUser() : setIsEditing(true)} 
                className={`text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl transition-all ${isEditing ? 'bg-[#3DF2C4] text-black shadow-lg shadow-[#3DF2C4]/20' : 'bg-white/5 text-[#A3ACB9]'}`}
              >
                {isEditing ? 'Sync' : 'Modify'}
              </button>
            </header>

            <div className="space-y-8">
              {activeSection === 'SECURITY' ? (
                <div className="p-10 bg-[#141821] rounded-[3rem] border border-white/5 space-y-8 shadow-2xl">
                   <div className="space-y-3">
                     <p className="text-[10px] font-black text-[#3DF2C4] uppercase tracking-[0.4em] ml-2">Hardware Password</p>
                     <input disabled={!isEditing} type="password" placeholder="••••••••" className="w-full bg-[#0B0E11] p-6 rounded-[1.5rem] border border-white/5 outline-none focus:border-[#3DF2C4] text-xl tracking-widest disabled:opacity-50 transition-all" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                   </div>
                   <div className="p-6 bg-[#3DF2C4]/5 rounded-2xl border border-[#3DF2C4]/10">
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-relaxed">Secure your node with a complex cryptographic key. Never share this with unauthorized terminals.</p>
                   </div>
                </div>
              ) : (
                <div className="p-12 bg-[#141821] rounded-[3rem] border border-white/5 space-y-10 shadow-2xl text-center">
                   <div className="space-y-6">
                     <p className="text-[10px] font-black text-[#3DF2C4] uppercase tracking-[0.5em]">Induction PIN</p>
                     <input 
                       disabled={!isEditing} 
                       type="password" 
                       maxLength={4} 
                       className="w-full bg-[#0B0E11] p-8 rounded-[2rem] border border-white/5 outline-none focus:border-[#3DF2C4] text-center text-5xl tracking-[0.6em] font-black text-[#3DF2C4] disabled:opacity-30 transition-all" 
                       value={formData.pin} 
                       onChange={e => setFormData({...formData, pin: e.target.value.replace(/\D/g, '')})} 
                     />
                   </div>
                   <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">4-Digit numeric verification key</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProfileMenuItem = ({ icon, label, subLabel, onClick }: { icon: any, label: string, subLabel: string, onClick: () => void }) => (
  <button onClick={onClick} className="w-full p-8 flex items-center justify-between border-b border-white/5 last:border-b-0 hover:bg-white/[0.03] transition-colors group">
    <div className="flex items-center gap-6">
      <div className="w-14 h-14 rounded-2xl bg-[#0B0E11] border border-white/5 flex items-center justify-center text-[#A3ACB9] group-hover:text-[#3DF2C4] group-hover:border-[#3DF2C4]/20 transition-all">{icon}</div>
      <div className="text-left">
        <p className="text-sm font-black uppercase tracking-tight text-[#E6EAF0] group-hover:text-white transition-colors">{label}</p>
        <p className="text-[9px] text-[#A3ACB9] font-bold uppercase tracking-[0.2em] mt-1">{subLabel}</p>
      </div>
    </div>
    <ChevronRight size={20} className="text-white/10 group-hover:translate-x-1 group-hover:text-[#3DF2C4] transition-all" />
  </button>
);
