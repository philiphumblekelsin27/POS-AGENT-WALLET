
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, UserRole, UserStatus, VerificationStatus } from '../types';
import { Shield, Users, Activity, MessageSquare, Trash2, Edit3, ChevronRight, Search, Zap, Key, DollarSign, Database, Clock, RefreshCw } from 'lucide-react';
import { mockStore } from '../services/mockStore';
import { Modal } from '../components/Modal';
import { Odometer } from '../components/Odometer';

export const AdminDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'OVERVIEW' | 'USERS' | 'STAFF' | 'LOGS'>('OVERVIEW');
  const [users, setUsers] = useState<User[]>(mockStore.getAllUsers());
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [liquidity, setLiquidity] = useState<any>(mockStore.calculateSystemLiquidity());
  const admin = mockStore.getCurrentUser();

  const isSuper = admin?.role === UserRole.SUPER_ADMIN;

  useEffect(() => {
    const interval = setInterval(() => {
      setLiquidity(mockStore.calculateSystemLiquidity());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleChange = (uid: string, role: UserRole) => {
    if (!isSuper) return alert("Authorization Denied. God-Mode Rank Required.");
    mockStore.updateUserRole(admin!.id, uid, role);
    setUsers(mockStore.getAllUsers());
  };

  const handleOverrideBalance = (uid: string) => {
    const amount = prompt("Enter new balance for this node (NGN):");
    if (amount !== null && !isNaN(parseFloat(amount))) {
       mockStore.manuallyAdjustBalance(admin!.id, uid, parseFloat(amount));
       setUsers(mockStore.getAllUsers());
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.walletNumber.includes(search)
  );

  const staffUsers = mockStore.getStaffDirectory();
  const logs = mockStore.getSystemLogs();

  return (
    <div className="flex min-h-screen bg-[#050505] text-white overflow-hidden font-inter">
      {/* Sidebar Command Rail */}
      <aside className="w-80 bg-[#0A0A0A] p-10 border-r border-white/5 flex flex-col shrink-0">
        <div className="flex items-center gap-4 mb-14">
           <div className="w-12 h-12 bg-[#10B981] text-black rounded-2xl flex items-center justify-center font-black text-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] rotate-3 group cursor-pointer hover:rotate-0 transition-transform">P</div>
           <h2 className="text-2xl font-black tracking-tighter text-[#10B981]">PAYNA KERNEL</h2>
        </div>
        
        <nav className="space-y-3 flex-1">
          {[
            { id: 'OVERVIEW', icon: <Activity size={18} />, label: 'Neural Overview' },
            { id: 'USERS', icon: <Users size={18} />, label: 'Global Nodes' },
            { id: 'STAFF', icon: <Key size={18} />, label: 'Staff Hierarchy' },
            { id: 'LOGS', icon: <Database size={18} />, label: 'System Logs' },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveView(item.id as any)}
              className={`w-full flex items-center gap-4 p-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                activeView === item.id ? 'bg-[#10B981] text-black shadow-lg shadow-[#10B981]/20' : 'text-white/30 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-10 border-t border-white/5">
           <div className="flex items-center gap-4 p-5 bg-white/5 rounded-[2rem] border border-white/5">
              <img src={admin?.avatarUrl} className="w-12 h-12 rounded-2xl border border-white/10" />
              <div className="min-w-0">
                 <p className="text-[10px] font-black truncate uppercase text-white">{admin?.name}</p>
                 <p className="text-[8px] font-bold text-[#10B981] uppercase tracking-[0.2em] mt-1">{admin?.role}</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Primary Ops Desk */}
      <main className="flex-1 p-16 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          {activeView === 'OVERVIEW' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
               {/* God-Mode Liquidity Dashboard */}
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                  <div className="bg-[#0A0A0A] p-12 rounded-[3.5rem] border border-[#10B981]/20 shadow-[0_0_100px_rgba(16,185,129,0.05)] relative overflow-hidden group">
                    <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-[#10B981]/10 rounded-full blur-[80px] group-hover:scale-110 transition-transform" />
                    <div className="flex justify-between items-start mb-6">
                       <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em]">Aggregated System Liquidity</p>
                       <RefreshCw size={16} className="text-[#10B981] animate-spin-slow opacity-30" />
                    </div>
                    <Odometer value={liquidity.totalLiquidityNGN} prefix="₦ " className="text-7xl font-black tracking-tighter text-white" />
                    
                    <div className="mt-12 flex gap-4 flex-wrap">
                       {Object.entries(liquidity.breakdown).map(([curr, data]: any) => (
                         <div key={curr} className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl">
                            <p className="text-[9px] font-black uppercase text-white/30 tracking-widest">{curr} RESERVES</p>
                            <p className="text-sm font-black text-white mt-1">{data.totalHoldings.toLocaleString()}</p>
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-[#0A0A0A] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl hover:border-[#10B981]/30 transition-all">
                      <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Total Nodes</p>
                      <h3 className="text-5xl font-black tracking-tighter">{users.length}</h3>
                      <div className="mt-6 flex items-center gap-2">
                         <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse" />
                         <p className="text-[8px] font-black uppercase text-[#10B981] tracking-widest">Active Synchronization</p>
                      </div>
                    </div>
                    <div className="bg-[#0A0A0A] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl hover:border-yellow-500/30 transition-all">
                      <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Escrow Locked</p>
                      <h3 className="text-5xl font-black tracking-tighter text-yellow-500">
                        {mockStore.getTransactions('ALL').filter(t => t.status === 'IN_ESCROW').length}
                      </h3>
                      <button className="text-[9px] font-black text-yellow-500 mt-6 uppercase underline tracking-widest">Awaiting Payout</button>
                    </div>
                  </div>
               </div>

               {/* Recent Telemetry Stream */}
               <div className="bg-[#0A0A0A] rounded-[3.5rem] p-12 border border-white/5 shadow-2xl">
                  <div className="flex justify-between items-center mb-10 px-2">
                    <h4 className="text-2xl font-black tracking-tighter uppercase">Kernel Telemetry</h4>
                    <button className="text-[10px] font-black text-[#10B981] uppercase tracking-widest px-5 py-2.5 border border-[#10B981]/20 rounded-xl hover:bg-[#10B981] hover:text-black transition-all">Download Audit</button>
                  </div>
                  <div className="space-y-4">
                     {logs.slice(0, 8).map(log => (
                        <div key={log.id} className="flex justify-between items-center p-6 bg-white/[0.02] border border-white/5 rounded-[2.5rem] group hover:bg-white/[0.04] transition-all">
                           <div className="flex items-center gap-6">
                              <div className="w-14 h-14 bg-[#10B981]/10 rounded-2xl flex items-center justify-center text-[#10B981] group-hover:scale-110 transition-transform">
                                 <Zap size={22} />
                              </div>
                              <div>
                                 <p className="text-sm font-black uppercase tracking-tight text-white">{log.event}</p>
                                 <p className="text-[10px] text-white/20 font-bold tracking-widest uppercase mt-1">Initiator: {log.user}</p>
                              </div>
                           </div>
                           <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </motion.div>
          )}

          {activeView === 'USERS' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                <div className="flex justify-between items-center">
                   <h2 className="text-4xl font-black tracking-tighter uppercase">Global Node Index</h2>
                   <div className="relative w-80">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                      <input 
                        className="w-full bg-[#0A0A0A] border border-white/10 p-4 pl-12 rounded-2xl text-xs outline-none focus:border-[#10B981]" 
                        placeholder="Search Node ID / Name..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                      />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                   {filteredUsers.map(u => (
                      <div key={u.id} className="bg-[#0A0A0A] p-8 rounded-[3rem] border border-white/5 space-y-6 hover:border-[#10B981]/20 transition-all group">
                         <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                               <img src={u.avatarUrl} className="w-14 h-14 rounded-2xl border border-white/10" />
                               <div>
                                  <h4 className="font-black text-sm uppercase text-white">{u.name}</h4>
                                  <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Node ID: {u.walletNumber}</p>
                               </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                               u.role === UserRole.SUPER_ADMIN ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20' : 'bg-white/5 text-white/30 border-white/10'
                            }`}>
                               {u.role}
                            </span>
                         </div>
                         
                         <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                            <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Node Liquidity</p>
                            <p className="text-xl font-black text-[#10B981]">₦{u.balance.toLocaleString()}</p>
                         </div>

                         <div className="grid grid-cols-2 gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOverrideBalance(u.id)} className="p-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#10B981] hover:text-black transition-all">Override</button>
                            <button onClick={() => setEditingUser(u)} className="p-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Kernel Edit</button>
                         </div>
                      </div>
                   ))}
                </div>
             </motion.div>
          )}

          {activeView === 'LOGS' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                <h2 className="text-4xl font-black tracking-tighter uppercase">Raw Kernel Log Stream</h2>
                <div className="bg-[#0A0A0A] p-10 rounded-[3rem] border border-white/5 font-mono text-[11px] h-[70vh] overflow-y-auto no-scrollbar space-y-4">
                   {logs.map((log) => (
                     <div key={log.id} className="flex gap-6 border-l-2 border-[#10B981]/10 pl-8 py-2 hover:bg-white/[0.02] transition-colors rounded-r-xl">
                        <span className="text-[#10B981] shrink-0 font-black">[{new Date(log.timestamp).toISOString()}]</span>
                        <span className="text-white/30 uppercase font-black shrink-0">[{log.user}]</span>
                        <span className="text-white/80">{log.event}</span>
                     </div>
                   ))}
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Manual Override Engine */}
      {editingUser && (
        <Modal isOpen={true} onClose={() => setEditingUser(null)} title="Manual Node Override">
           <div className="space-y-10 p-4">
              <div className="flex items-center gap-6 p-6 bg-white/5 rounded-[2rem] border border-white/10">
                 <img src={editingUser.avatarUrl} className="w-16 h-16 rounded-2xl" />
                 <div>
                    <p className="text-[9px] font-black uppercase text-white/30 tracking-widest mb-1">Target Identity</p>
                    <p className="text-xl font-black tracking-tighter uppercase text-[#10B981]">{editingUser.name}</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase text-white/30 tracking-widest ml-1">Rank Elevation</label>
                 <div className="grid grid-cols-2 gap-3">
                    {Object.values(UserRole).map(role => (
                       <button 
                         key={role}
                         onClick={() => handleRoleChange(editingUser.id, role as UserRole)}
                         className={`p-4 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
                            editingUser.role === role ? 'bg-[#10B981] text-black border-[#10B981]' : 'bg-white/5 border-white/10 text-white/40'
                         }`}
                       >
                          {role}
                       </button>
                    ))}
                 </div>
              </div>

              <button 
                onClick={() => setEditingUser(null)}
                className="w-full bg-white text-black p-6 rounded-2xl font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
              >
                Seal Override Changes
              </button>
           </div>
        </Modal>
      )}
    </div>
  );
};
