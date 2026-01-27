
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, UserRole, UserStatus, Transaction, MarketData, TransactionStatus, AdminBankAccount } from '../types';
import { Shield, Users, Activity, Plus, Trash2, Search, RefreshCw, X, Wallet, Globe, UserCheck, UserPlus, ShieldAlert, ShieldCheck, TrendingUp, DollarSign, Database, PlusCircle, Trash, Edit } from 'lucide-react';
import { mockStore } from '../services/mockStore';
import { Odometer } from '../components/Odometer';
import { Modal } from '../components/Modal';

export const AdminDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'OVERVIEW' | 'NODES' | 'VERIFICATION' | 'ORACLE' | 'BANKS'>('OVERVIEW');
  const [users, setUsers] = useState<User[]>(mockStore.getAllUsers());
  const [markets, setMarkets] = useState<MarketData[]>(mockStore.getMarketData());
  const [search, setSearch] = useState('');
  const [liquidity, setLiquidity] = useState<any>(mockStore.calculateSystemLiquidity());
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [newWorker, setNewWorker] = useState({ name: '', email: '', role: UserRole.SUPPORT });
  const [newBank, setNewBank] = useState({ bankName: '', accountName: '', accountNumber: '', currency: 'NGN' });
  const [bankAccounts, setBankAccounts] = useState<AdminBankAccount[]>(mockStore.getAdminBanks());
  
  const currentUser = mockStore.getCurrentUser();
  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;

  useEffect(() => {
    const unsub = mockStore.subscribe((ev) => {
      if (ev.type === 'MARKET_UPDATE') setMarkets([...ev.payload]);
      if (ev.type === 'USER_UPDATE') {
        setUsers(mockStore.getAllUsers());
        setLiquidity(mockStore.calculateSystemLiquidity());
      }
      if (ev.type === 'BANKS_UPDATE') {
        setBankAccounts([...ev.payload]);
      }
    });
    return () => unsub();
  }, []);

  const handleUpdateRate = (pair: string, current: number) => {
    const newVal = prompt(`Enter new Oracle rate for ${pair} (Current: ₦${current}):`);
    if (newVal !== null && !isNaN(parseFloat(newVal))) {
      mockStore.updateMarketRate(pair, parseFloat(newVal));
    }
  };

  const handleCreateWorker = () => {
    if (!newWorker.name || !newWorker.email) return;
    try {
      mockStore.createWorker(newWorker);
      setIsWorkerModalOpen(false);
      setNewWorker({ name: '', email: '', role: UserRole.SUPPORT });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddBank = () => {
    if (!newBank.bankName || !newBank.accountNumber) return;
    mockStore.addAdminBank(newBank);
    setIsBankModalOpen(false);
    setNewBank({ bankName: '', accountName: '', accountNumber: '', currency: 'NGN' });
  };

  const handleDeleteBank = (id: string) => {
    if (confirm("Terminate this Liquidity Pool node?")) {
      mockStore.removeAdminBank(id);
    }
  };

  const handleDeactivateNode = (email: string) => {
    if (confirm(`Terminate access for node ${email}?`)) {
      mockStore.deleteNode(email);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0B0E11] text-[#E6EAF0] overflow-hidden font-inter">
      <aside className="w-80 bg-[#141821] p-10 border-r border-white/5 flex flex-col shrink-0">
        <div className="flex items-center gap-4 mb-14">
           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-2xl ${isSuperAdmin ? 'bg-[#3DF2C4] text-black shadow-lg shadow-[#3DF2C4]/20' : 'bg-[#7C6CFF] text-white'}`}>
             {isSuperAdmin ? 'S' : 'A'}
           </div>
           <div>
              <h2 className="text-xl font-black tracking-tighter text-white uppercase">Payna</h2>
              <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">{isSuperAdmin ? 'God Node' : 'Admin Node'}</p>
           </div>
        </div>
        
        <nav className="space-y-2 flex-1">
          {[
            { id: 'OVERVIEW', icon: <Activity size={18} />, label: 'System Health' },
            { id: 'VERIFICATION', icon: <UserCheck size={18} />, label: 'Node Audits' },
            { id: 'NODES', icon: <Users size={18} />, label: 'Network Directory' },
            { id: 'ORACLE', icon: <TrendingUp size={18} />, label: 'Oracle Control' },
            { id: 'BANKS', icon: <Database size={18} />, label: 'Pool Management' },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveView(item.id as any)}
              className={`w-full flex items-center gap-4 p-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                activeView === item.id ? 'bg-[#3DF2C4] text-black' : 'text-[#A3ACB9] hover:bg-white/5'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        
        <button onClick={() => mockStore.logout()} className="mt-auto p-6 bg-white/[0.02] rounded-3xl border border-white/5 text-[9px] font-black uppercase text-red-500 hover:bg-red-500/10 text-left transition-colors">
           Disconnect Kernel
        </button>
      </aside>

      <main className="flex-1 p-16 overflow-y-auto no-scrollbar relative">
        <AnimatePresence mode="wait">
          {activeView === 'OVERVIEW' && (
            <motion.div key="health" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
               <div className="grid grid-cols-2 gap-8">
                  <div className="bg-[#1C2230] p-12 rounded-[3.5rem] border border-[#3DF2C4]/20 relative overflow-hidden group">
                    <p className="text-[#A3ACB9] text-[10px] font-black uppercase tracking-[0.4em] mb-4">Gross Locked Value</p>
                    <Odometer value={liquidity.totalLiquidityNGN} prefix="₦ " className="text-7xl font-black tracking-tighter text-white" />
                    <Globe className="absolute -bottom-10 -right-10 text-[#3DF2C4]/5 w-64 h-64" />
                  </div>
                  <div className="bg-[#1C2230] p-12 rounded-[3.5rem] border border-white/5 flex flex-col justify-center">
                    <p className="text-[#A3ACB9] text-[10px] font-black uppercase tracking-[0.4em] mb-6">Security Node Status</p>
                    <div className="grid grid-cols-3 gap-6">
                       <div className="text-center"><p className="text-4xl font-black text-white">{liquidity.totalNodes}</p><p className="text-[9px] font-black uppercase text-white/20 tracking-widest mt-1">Total</p></div>
                       <div className="text-center"><p className="text-4xl font-black text-[#3DF2C4]">{users.filter(u => u.status === UserStatus.ACTIVE).length}</p><p className="text-[9px] font-black uppercase text-white/20 tracking-widest mt-1">Active</p></div>
                       <div className="text-center"><p className="text-4xl font-black text-orange-500">{users.filter(u => u.status === UserStatus.PENDING_APPROVAL).length}</p><p className="text-[9px] font-black uppercase text-white/20 tracking-widest mt-1">Audit</p></div>
                    </div>
                  </div>
               </div>
            </motion.div>
          )}

          {activeView === 'ORACLE' && (
             <motion.div key="oracle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                <header>
                   <h2 className="text-5xl font-black tracking-tighter uppercase text-white">Market Oracle</h2>
                   <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-2">Neural Rate Induction Protocol</p>
                </header>
                
                <div className="grid grid-cols-1 gap-6">
                  {markets.map(m => (
                    <div key={m.currency} className="bg-[#1C2230] p-10 rounded-[3rem] border border-white/5 flex justify-between items-center group hover:border-[#3DF2C4]/30 transition-all">
                       <div className="flex items-center gap-8">
                          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-3xl font-black text-[#3DF2C4]">{m.currency.split('/')[0]}</div>
                          <div>
                             <h4 className="text-3xl font-black uppercase tracking-tight text-white">{m.currency} Index</h4>
                             <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">Synced @ {new Date(m.lastUpdated).toLocaleTimeString()}</p>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-12">
                          <div className="text-right">
                             <p className="text-4xl font-black text-white tracking-tighter">₦{m.price.toLocaleString()}</p>
                             <div className={`flex items-center justify-end gap-2 text-[10px] font-black uppercase tracking-widest mt-1 ${m.trend === 'UP' ? 'text-[#3DF2C4]' : 'text-red-500'}`}>
                                {m.trend === 'UP' ? '▲' : '▼'} {Math.abs(m.change24h).toFixed(2)}%
                             </div>
                          </div>
                          <button onClick={() => handleUpdateRate(m.currency, m.price)} className="w-16 h-16 bg-[#3DF2C4] text-black rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#3DF2C4]/20">
                             <RefreshCw size={24} />
                          </button>
                       </div>
                    </div>
                  ))}
                </div>
             </motion.div>
          )}

          {activeView === 'NODES' && (
            <motion.div key="nodes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
               <div className="flex justify-between items-center">
                  <h2 className="text-4xl font-black tracking-tighter uppercase text-white">Network Directory</h2>
                  <div className="flex gap-4">
                     <div className="relative w-96">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                        <input value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 p-6 pl-16 rounded-[2.5rem] outline-none text-sm font-black tracking-tight focus:border-[#3DF2C4]" placeholder="Identify node ID..." />
                     </div>
                     <button onClick={() => setIsWorkerModalOpen(true)} className="px-8 bg-[#3DF2C4] text-black rounded-[2rem] font-black uppercase text-[10px] flex items-center gap-2">
                        <PlusCircle size={18} /> Deploy Staff Node
                     </button>
                  </div>
               </div>
               <div className="grid grid-cols-1 gap-4">
                  {users.filter(u => u.status !== UserStatus.DEACTIVATED).filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.accountNumber.includes(search)).map(u => (
                    <div key={u.id} className="bg-[#1C2230] p-8 rounded-[3rem] border border-white/5 flex justify-between items-center group hover:border-[#3DF2C4]/20 transition-all">
                       <div className="flex items-center gap-6">
                          <img src={u.avatarUrl} className="w-16 h-16 rounded-2xl object-cover border border-white/5 shadow-lg" />
                          <div>
                            <p className="text-xl font-black uppercase tracking-tight text-white">{u.name}</p>
                            <div className="flex gap-4 mt-1">
                               <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">Node: {u.accountNumber}</span>
                               <span className={`text-[10px] font-black uppercase tracking-widest ${u.role === UserRole.SUPER_ADMIN ? 'text-[#3DF2C4]' : 'text-[#7C6CFF]'}`}>{u.role}</span>
                               <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">{u.status}</span>
                            </div>
                          </div>
                       </div>
                       <div className="flex items-center gap-8">
                          <div className="text-right">
                             <p className="text-3xl font-black text-white tracking-tighter">₦{u.balance.toLocaleString()}</p>
                             <p className="text-[9px] font-black text-white/20 uppercase mt-1 tracking-widest">Pooled Liquidity</p>
                          </div>
                          {u.id !== currentUser?.id && (
                            <button onClick={() => handleDeactivateNode(u.email)} className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                               <Trash2 size={18} />
                            </button>
                          )}
                       </div>
                    </div>
                  ))}
               </div>
            </motion.div>
          )}

          {activeView === 'BANKS' && (
            <motion.div key="banks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
               <header className="flex justify-between items-center">
                  <div>
                    <h2 className="text-5xl font-black tracking-tighter uppercase text-white">Pool Management</h2>
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-2">Hardware-Backed Liquidity Nodes</p>
                  </div>
                  <button onClick={() => setIsBankModalOpen(true)} className="px-8 h-14 bg-[#3DF2C4] text-black rounded-2xl font-black uppercase text-[10px] flex items-center gap-2">
                     <Plus size={18} /> Add Pool
                  </button>
               </header>
               <div className="grid grid-cols-1 gap-6">
                 {bankAccounts.map(bank => (
                   <div key={bank.id} className="bg-[#1C2230] p-10 rounded-[3rem] border border-white/5 flex justify-between items-center group hover:border-[#3DF2C4]/20 transition-all">
                      <div className="flex items-center gap-8">
                         <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white/40"><Wallet size={24} /></div>
                         <div>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">{bank.bankName}</p>
                            <h4 className="text-2xl font-black text-white uppercase">{bank.accountName}</h4>
                            <p className="text-3xl font-black text-[#3DF2C4] tracking-widest mt-1">{bank.accountNumber}</p>
                         </div>
                      </div>
                      <button onClick={() => handleDeleteBank(bank.id)} className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <Trash size={18} />
                      </button>
                   </div>
                 ))}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Deploy Worker Modal */}
      <Modal isOpen={isWorkerModalOpen} onClose={() => setIsWorkerModalOpen(false)} title="Deploy Worker Node">
         <div className="space-y-6 text-white p-2">
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-white/30 ml-2">Display Name</label>
               <input className="w-full bg-black/20 p-5 rounded-2xl border border-white/10 outline-none focus:border-[#3DF2C4]" placeholder="Worker Full Name" value={newWorker.name} onChange={e => setNewWorker({...newWorker, name: e.target.value})} />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-white/30 ml-2">Kernel Identifier (Email)</label>
               <input type="email" className="w-full bg-black/20 p-5 rounded-2xl border border-white/10 outline-none focus:border-[#3DF2C4]" placeholder="worker@payna.io" value={newWorker.email} onChange={e => setNewWorker({...newWorker, email: e.target.value})} />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-white/30 ml-2">Access Role</label>
               <select className="w-full bg-black/20 p-5 rounded-2xl border border-white/10 outline-none font-black uppercase text-xs" value={newWorker.role} onChange={e => setNewWorker({...newWorker, role: e.target.value as any})}>
                  <option value={UserRole.SUPPORT}>Support Agent</option>
                  <option value={UserRole.ADMIN}>Admin Node</option>
               </select>
            </div>
            <button onClick={handleCreateWorker} className="w-full bg-[#3DF2C4] text-black p-5 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
               Deploy Node
            </button>
         </div>
      </Modal>

      {/* Add Pool Modal */}
      <Modal isOpen={isBankModalOpen} onClose={() => setIsBankModalOpen(false)} title="Register Liquidity Pool">
         <div className="space-y-6 text-white p-2">
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-white/30 ml-2">Bank Name</label>
               <input className="w-full bg-black/20 p-5 rounded-2xl border border-white/10 outline-none focus:border-[#3DF2C4]" placeholder="e.g. Zenith Bank" value={newBank.bankName} onChange={e => setNewBank({...newBank, bankName: e.target.value})} />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-white/30 ml-2">Account Name</label>
               <input className="w-full bg-black/20 p-5 rounded-2xl border border-white/10 outline-none focus:border-[#3DF2C4]" placeholder="Account Holder" value={newBank.accountName} onChange={e => setNewBank({...newBank, accountName: e.target.value})} />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-white/30 ml-2">Account Number</label>
               <input className="w-full bg-black/20 p-5 rounded-2xl border border-white/10 outline-none focus:border-[#3DF2C4]" placeholder="10 Digits" value={newBank.accountNumber} onChange={e => setNewBank({...newBank, accountNumber: e.target.value})} />
            </div>
            <button onClick={handleAddBank} className="w-full bg-[#3DF2C4] text-black p-5 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
               Activate Pool Node
            </button>
         </div>
      </Modal>
    </div>
  );
};
