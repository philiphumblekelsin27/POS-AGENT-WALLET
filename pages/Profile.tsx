
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, UserRole, Agent, AgentCategory, VerificationStatus } from '../types';
import { mockStore } from '../services/mockStore';
import { 
  User as UserIcon, Shield, CreditCard, Lock, Briefcase, 
  ChevronRight, Camera, Bell, Eye, EyeOff, LogOut, 
  Smartphone, MapPin, Clock, Star, CheckCircle, HelpCircle
} from 'lucide-react';

interface ProfileProps {
  user: User;
  onRefresh?: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onRefresh }) => {
  const [activeSection, setActiveSection] = useState<'OVERVIEW' | 'ACCOUNT' | 'SECURITY' | 'WALLET' | 'BUSINESS'>('OVERVIEW');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    name: user.name,
    displayName: user.displayName || '',
    email: user.email,
    phone: user.phone || '',
    bio: user.bio || '',
    preferredCurrency: user.preferredCurrency,
    privacyMode: user.privacyMode || false
  });

  const agentData = user.role === UserRole.AGENT ? mockStore.getAgents().find(a => a.userId === user.id) : null;
  const [agentForm, setAgentForm] = useState<Partial<Agent>>(agentData || {});

  const handleUpdateUser = () => {
    mockStore.updateUser(user.id, formData);
    setIsEditing(false);
    if (onRefresh) onRefresh();
  };

  const handleUpdateAgent = () => {
    if (agentData) {
      mockStore.updateAgent(agentData.id, agentForm);
      setIsEditing(false);
      if (onRefresh) onRefresh();
    }
  };

  const togglePrivacy = () => {
    const newVal = !formData.privacyMode;
    setFormData({ ...formData, privacyMode: newVal });
    mockStore.updateUser(user.id, { privacyMode: newVal });
  };

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative group flex justify-center">
        <div className="relative">
          <img 
            src={user.avatarUrl} 
            alt="Avatar" 
            className="w-32 h-32 rounded-[2.5rem] object-cover border-4 border-white/5 shadow-2xl transition-transform group-hover:scale-105" 
          />
          <button className="absolute bottom-0 right-0 w-10 h-10 bg-[#10B981] text-black rounded-2xl flex items-center justify-center shadow-lg border-4 border-[#050505] active:scale-90 transition-all">
            <Camera size={20} />
          </button>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-black tracking-tighter uppercase">{user.name}</h2>
        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mt-1">Node ID: {user.walletNumber}</p>
      </div>

      <div className="bg-[#0A0A0A] rounded-[2.5rem] border border-white/5 overflow-hidden">
        <ProfileMenuItem 
          icon={<UserIcon size={18} />} 
          label="Identity Access" 
          subLabel="Personal Info & Bio" 
          onClick={() => setActiveSection('ACCOUNT')} 
        />
        <ProfileMenuItem 
          icon={<Shield size={18} />} 
          label="Security Vault" 
          subLabel="FaceID & PIN Center" 
          onClick={() => setActiveSection('SECURITY')} 
        />
        <ProfileMenuItem 
          icon={<CreditCard size={18} />} 
          label="Financial Oracle" 
          subLabel="Currency & Limits" 
          onClick={() => setActiveSection('WALLET')} 
        />
        {user.role === UserRole.AGENT && (
          <ProfileMenuItem 
            icon={<Briefcase size={18} />} 
            label="Node Workstation" 
            subLabel="Business Operating Settings" 
            onClick={() => setActiveSection('BUSINESS')} 
          />
        )}
      </div>

      <div className="space-y-4">
        <button 
          onClick={() => mockStore.logout()}
          className="w-full h-16 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest hover:bg-red-500/20 active:scale-95 transition-all"
        >
          <LogOut size={18} /> Disconnect Node
        </button>
      </div>
    </div>
  );

  const renderAccount = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setActiveSection('OVERVIEW')} className="text-white/40 font-black text-[10px] uppercase tracking-widest">← Back</button>
        <h3 className="text-xl font-black uppercase tracking-tighter">Identity Access</h3>
        <button 
          onClick={() => isEditing ? handleUpdateUser() : setIsEditing(true)}
          className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border transition-all ${isEditing ? 'bg-[#10B981] text-black border-[#10B981]' : 'bg-white/5 border-white/10 text-white/60'}`}
        >
          {isEditing ? 'Save Sync' : 'Edit'}
        </button>
      </div>

      <div className="space-y-6">
        <SettingsField 
          label="Legal Name" 
          value={formData.name!} 
          onChange={(v) => setFormData({ ...formData, name: v })} 
          editable={isEditing} 
        />
        <SettingsField 
          label="Display Username" 
          value={formData.displayName!} 
          onChange={(v) => setFormData({ ...formData, displayName: v })} 
          editable={isEditing} 
        />
        <SettingsField 
          label="Node Email" 
          value={formData.email!} 
          onChange={(v) => setFormData({ ...formData, email: v })} 
          editable={isEditing} 
        />
        <SettingsField 
          label="Contact Phone" 
          value={formData.phone!} 
          onChange={(v) => setFormData({ ...formData, phone: v })} 
          editable={isEditing} 
        />
        <div className="space-y-2">
          <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Identity Bio</label>
          {isEditing ? (
            <textarea 
              value={formData.bio} 
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full bg-[#111] border border-white/10 p-5 rounded-2xl text-xs outline-none focus:border-[#10B981] transition-all min-h-[100px]"
            />
          ) : (
            <div className="p-5 bg-white/5 border border-white/5 rounded-2xl text-xs text-white/60 leading-relaxed italic">
              {formData.bio || "No bio established."}
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#10B981]/10 border border-[#10B981]/20 p-6 rounded-[2rem] flex items-center gap-4">
        <CheckCircle className="text-[#10B981]" size={24} />
        <div>
          <p className="text-xs font-black uppercase tracking-tight text-white">KYC Verified Tier {user.kycLevel}</p>
          <p className="text-[9px] text-[#10B981] font-bold uppercase tracking-widest">Full Node Access Active</p>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setActiveSection('OVERVIEW')} className="text-white/40 font-black text-[10px] uppercase tracking-widest">← Back</button>
        <h3 className="text-xl font-black uppercase tracking-tighter">Security Vault</h3>
        <div className="w-8" />
      </div>

      <div className="space-y-4">
        <SecurityActionItem 
          icon={<Smartphone />} 
          label="Biometric Enrollment" 
          status="Active" 
          onClick={() => {}} 
        />
        <SecurityActionItem 
          icon={<Lock />} 
          label="6-Digit Vault PIN" 
          status="Secured" 
          onClick={() => {}} 
        />
        <SecurityActionItem 
          icon={<Shield />} 
          label="Master Sync Key" 
          status="••••••••" 
          onClick={() => {}} 
        />
      </div>

      <div className="p-8 bg-[#0A0A0A] rounded-[2.5rem] border border-white/5 space-y-4">
        <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Active Synchronizations</h4>
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-[#10B981] rounded-full" />
             <p className="font-bold">iPhone 15 Pro (Current)</p>
          </div>
          <span className="text-[8px] font-black text-white/20">Lagos, NG</span>
        </div>
        <button className="w-full pt-4 text-[9px] font-black text-red-500 uppercase tracking-widest text-center border-t border-white/5">Flush All Node Sessions</button>
      </div>
    </div>
  );

  const renderWallet = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setActiveSection('OVERVIEW')} className="text-white/40 font-black text-[10px] uppercase tracking-widest">← Back</button>
        <h3 className="text-xl font-black uppercase tracking-tighter">Financial Oracle</h3>
        <div className="w-8" />
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center p-6 bg-white/5 border border-white/5 rounded-2xl">
          <div>
            <p className="text-xs font-black uppercase text-white">Privacy Mode</p>
            <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Hide balance on entry</p>
          </div>
          <button 
            onClick={togglePrivacy}
            className={`w-14 h-8 rounded-full transition-all relative p-1 ${formData.privacyMode ? 'bg-[#10B981]' : 'bg-white/10'}`}
          >
            <motion.div 
              animate={{ x: formData.privacyMode ? 24 : 0 }}
              className="w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center text-black"
            >
              {formData.privacyMode ? <EyeOff size={12} /> : <Eye size={12} />}
            </motion.div>
          </button>
        </div>

        <div className="space-y-2">
           <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Preferred Currency</label>
           <div className="grid grid-cols-3 gap-3">
              {['NGN', 'USD', 'BTC'].map(curr => (
                <button 
                  key={curr}
                  onClick={() => setFormData({ ...formData, preferredCurrency: curr })}
                  className={`p-4 rounded-xl border text-xs font-black uppercase transition-all ${formData.preferredCurrency === curr ? 'bg-[#10B981] text-black border-[#10B981]' : 'bg-white/5 border-white/10 text-white/40'}`}
                >
                  {curr}
                </button>
              ))}
           </div>
        </div>

        <div className="p-8 bg-gradient-to-br from-[#1E293B] to-[#0A0A0A] rounded-[2.5rem] border border-white/5 shadow-2xl space-y-6">
           <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Operational Limits</h4>
              <span className="text-[8px] font-black text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded">TIER {user.kycLevel}</span>
           </div>
           <div className="space-y-4">
              <div className="flex justify-between text-xs font-black uppercase tracking-tight">
                 <span className="text-white/40">Daily Sync Limit</span>
                 <span>₦{user.limits?.dailyLimit.toLocaleString()}</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                 <div className="w-1/3 h-full bg-[#10B981]" />
              </div>
              <p className="text-[9px] text-white/20 font-bold text-center">33% of daily synchronization limit used.</p>
           </div>
           <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Request Limit Elevation</button>
        </div>
      </div>
    </div>
  );

  const renderBusiness = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setActiveSection('OVERVIEW')} className="text-white/40 font-black text-[10px] uppercase tracking-widest">← Back</button>
        <h3 className="text-xl font-black uppercase tracking-tighter">Node Workstation</h3>
        <button 
          onClick={() => isEditing ? handleUpdateAgent() : setIsEditing(true)}
          className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border transition-all ${isEditing ? 'bg-[#10B981] text-black border-[#10B981]' : 'bg-white/5 border-white/10 text-white/60'}`}
        >
          {isEditing ? 'Seal Settings' : 'Modify'}
        </button>
      </div>

      {agentData ? (
        <div className="space-y-6">
          <div className="flex items-center gap-6 p-6 bg-white/5 border border-white/5 rounded-[2rem]">
             <img src={agentData.avatarUrl} className="w-16 h-16 rounded-2xl object-cover" />
             <div>
                <p className="text-xs font-black uppercase tracking-tight text-white">{agentData.businessName}</p>
                <div className="flex items-center gap-1.5 text-yellow-400 text-[10px] font-black mt-1">
                   <Star size={12} fill="currentColor" /> {agentData.rating}
                </div>
             </div>
          </div>

          <div className="flex justify-between items-center p-6 bg-white/5 border border-white/5 rounded-2xl">
            <div>
              <p className="text-xs font-black uppercase text-white">Discovery Status</p>
              <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Visible to nearby nodes</p>
            </div>
            <button 
              onClick={() => setAgentForm({ ...agentForm, isOnline: !agentForm.isOnline })}
              className={`w-14 h-8 rounded-full transition-all relative p-1 ${agentForm.isOnline ? 'bg-[#10B981]' : 'bg-white/10'}`}
            >
              <motion.div 
                animate={{ x: agentForm.isOnline ? 24 : 0 }}
                className="w-6 h-6 bg-white rounded-full shadow-lg"
              />
            </button>
          </div>

          <SettingsField 
            label="Business Terminal Name" 
            value={agentForm.businessName!} 
            onChange={(v) => setAgentForm({ ...agentForm, businessName: v })} 
            editable={isEditing} 
          />
          <SettingsField 
            label="Operating Pulse (Hours)" 
            value={agentForm.operatingHours!} 
            onChange={(v) => setAgentForm({ ...agentForm, operatingHours: v })} 
            editable={isEditing} 
          />
          <SettingsField 
            label="Base Synchronization Rate (₦)" 
            value={agentForm.basePrice!.toString()} 
            onChange={(v) => setAgentForm({ ...agentForm, basePrice: parseInt(v) || 0 })} 
            editable={isEditing} 
          />
          <SettingsField 
            label="Operational Radius (KM)" 
            value={agentForm.travelRadius!.toString()} 
            onChange={(v) => setAgentForm({ ...agentForm, travelRadius: parseInt(v) || 0 })} 
            editable={isEditing} 
          />

          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Terminal Description</label>
            {isEditing ? (
              <textarea 
                value={agentForm.description} 
                onChange={(e) => setAgentForm({ ...agentForm, description: e.target.value })}
                className="w-full bg-[#111] border border-white/10 p-5 rounded-2xl text-xs outline-none focus:border-[#10B981] transition-all min-h-[100px]"
              />
            ) : (
              <div className="p-5 bg-white/5 border border-white/5 rounded-2xl text-xs text-white/60 leading-relaxed italic">
                {agentForm.description || "No business description provided."}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-12 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10 text-center space-y-4">
           <HelpCircle size={48} className="mx-auto text-white/10" />
           <p className="text-xs font-black uppercase text-white/40">No Agent Node Detected</p>
           <button className="text-[10px] font-black text-[#10B981] uppercase tracking-widest underline">Initialize Professional Node</button>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 pb-32 max-w-md mx-auto min-h-screen">
      <AnimatePresence mode="wait">
        {activeSection === 'OVERVIEW' && renderOverview()}
        {activeSection === 'ACCOUNT' && renderAccount()}
        {activeSection === 'SECURITY' && renderSecurity()}
        {activeSection === 'WALLET' && renderWallet()}
        {activeSection === 'BUSINESS' && renderBusiness()}
      </AnimatePresence>
    </div>
  );
};

const ProfileMenuItem = ({ icon, label, subLabel, onClick }: { icon: any, label: string, subLabel: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="w-full p-6 flex items-center justify-between group hover:bg-white/[0.02] transition-all border-b border-white/5 last:border-b-0"
  >
    <div className="flex items-center gap-5">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/30 group-hover:text-[#10B981] group-hover:bg-[#10B981]/10 transition-all">
        {icon}
      </div>
      <div className="text-left">
        <p className="text-sm font-black uppercase tracking-tight text-white group-hover:text-[#10B981] transition-colors">{label}</p>
        <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-0.5">{subLabel}</p>
      </div>
    </div>
    <ChevronRight size={18} className="text-white/10 group-hover:text-[#10B981] transition-all group-hover:translate-x-1" />
  </button>
);

const SecurityActionItem = ({ icon, label, status, onClick }: { icon: any, label: string, status: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="w-full p-6 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-[#10B981]/5 hover:border-[#10B981]/20 transition-all"
  >
    <div className="flex items-center gap-4">
      <div className="text-white/20 group-hover:text-[#10B981] transition-colors">{icon}</div>
      <p className="text-xs font-black uppercase tracking-tight text-white/60 group-hover:text-white transition-colors">{label}</p>
    </div>
    <span className="text-[10px] font-black text-[#10B981] uppercase tracking-widest">{status}</span>
  </button>
);

const SettingsField = ({ label, value, onChange, editable }: { label: string, value: string, onChange: (v: string) => void, editable: boolean }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">{label}</label>
    {editable ? (
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#111] border border-white/10 p-5 rounded-2xl text-xs outline-none focus:border-[#10B981] transition-all font-medium text-white" 
      />
    ) : (
      <div className="w-full bg-white/[0.03] border border-white/5 p-5 rounded-2xl text-xs font-bold text-white/60">
        {value}
      </div>
    )}
  </div>
);
