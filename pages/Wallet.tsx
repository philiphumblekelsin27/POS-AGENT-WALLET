
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Transaction, TransactionType, TransactionStatus, AdminBankAccount } from '../types';
import { mockStore } from '../services/mockStore';
import { PinModal } from '../components/PinModal';
import { ArrowUpRight, ArrowDownLeft, Shield, Info, ChevronDown, Wallet as WalletIcon, Copy, CheckCircle, User as UserIcon, Loader2, XCircle, DollarSign } from 'lucide-react';

export const Wallet: React.FC<{ user: User, onRefresh?: () => void }> = ({ user, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'topup' | 'transfer'>('transfer');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [recipientAcc, setRecipientAcc] = useState('');
  const [recipientName, setRecipientName] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [refNumber, setRefNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  
  const adminBanks = mockStore.getAdminBanks();

  useEffect(() => {
    setHistory(mockStore.getTransactions('USER'));
  }, []);

  useEffect(() => {
    const lookupRecipient = async () => {
      const cleanAcc = recipientAcc.replace(/\D/g, '');
      if (cleanAcc.length === 10) {
        setIsVerifying(true);
        await new Promise(r => setTimeout(r, 600));
        const foundUser = mockStore.getUserByAccountNumber(cleanAcc);
        setRecipientName(foundUser ? foundUser.name : 'ACCOUNT_NOT_FOUND');
        setIsVerifying(false);
      } else {
        setRecipientName(null);
      }
    };
    lookupRecipient();
  }, [recipientAcc]);

  const handleTransferClick = () => {
    if (recipientName === 'ACCOUNT_NOT_FOUND' || !recipientName) return;
    setIsPinModalOpen(true);
  };

  const handlePinConfirm = (pin: string) => {
    setIsPinModalOpen(false);
    if (!mockStore.verifyPin(user.id, pin)) {
      alert("Neural Pin Rejected: Access Denied");
      return;
    }
    
    setLoading(true);
    try {
      mockStore.executeInternalTransfer(user.id, recipientAcc, parseFloat(amount), currency);
      setAmount('');
      setRecipientAcc('');
      setRecipientName(null);
      alert(`${currency} Transfer Successful.`);
      onRefresh?.();
      setHistory(mockStore.getTransactions('USER'));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 pb-32 bg-[#0B0E11] min-h-screen text-[#E6EAF0] font-inter">
      <PinModal isOpen={isPinModalOpen} onClose={() => setIsPinModalOpen(false)} onConfirm={handlePinConfirm} title="CONFIRM TRANSFER" />
      
      <header className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase">Vault</h2>
          <p className="text-[10px] font-black text-[#A3ACB9] uppercase tracking-widest mt-1">ID: {user.accountNumber}</p>
        </div>
        <div className="w-12 h-12 bg-[#3DF2C4]/10 rounded-2xl flex items-center justify-center text-[#3DF2C4]">
          <Shield size={24} />
        </div>
      </header>

      {/* Multi-Currency Balance Display */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar mb-10 pb-4">
        {user.wallets.map(w => (
          <div key={w.id} className="min-w-[280px] bg-[#141821] p-8 rounded-[3rem] border border-white/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-5"><DollarSign size={60} /></div>
             <p className="text-[#A3ACB9] text-[9px] font-black uppercase tracking-widest mb-2">{w.currency} Balance</p>
             <h2 className="text-4xl font-black tracking-tighter">{w.currency === 'NGN' ? '₦' : w.currency === 'USD' ? '$' : w.currency} {w.balance.toLocaleString()}</h2>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mb-8">
        <button onClick={() => setActiveTab('transfer')} className={`flex-1 p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'transfer' ? 'bg-[#3DF2C4] text-black shadow-lg' : 'bg-white/5 text-white/30'}`}>Send</button>
        <button onClick={() => setActiveTab('topup')} className={`flex-1 p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'topup' ? 'bg-[#3DF2C4] text-black shadow-lg' : 'bg-white/5 text-white/30'}`}>Top Up</button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'transfer' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="p2p" className="space-y-6">
            <div className="bg-[#141821] p-8 rounded-[2.5rem] border border-white/5 space-y-6">
              <div className="flex gap-2 mb-4">
                {['NGN', 'USD', 'GBP'].map(curr => (
                  <button key={curr} onClick={() => setCurrency(curr)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${currency === curr ? 'bg-[#3DF2C4] text-black' : 'bg-white/5 text-white/20'}`}>{curr}</button>
                ))}
              </div>
              
              <div className="relative">
                <input className="w-full bg-transparent border-b border-white/10 p-4 text-2xl font-black tracking-tight outline-none focus:border-[#3DF2C4]" placeholder="10 Digits" maxLength={10} value={recipientAcc} onChange={e => setRecipientAcc(e.target.value)} />
                <div className="min-h-[24px] mt-2">
                  {recipientName && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-[9px] font-black uppercase tracking-widest ${recipientName === 'ACCOUNT_NOT_FOUND' ? 'text-red-500' : 'text-[#3DF2C4]'}`}>
                      {recipientName === 'ACCOUNT_NOT_FOUND' ? 'Node Not Found' : `Identity: ${recipientName}`}
                    </motion.p>
                  )}
                </div>
              </div>
              
              <input type="number" className="w-full bg-transparent border-b border-white/10 p-4 text-4xl font-black tracking-tighter outline-none focus:border-[#3DF2C4]" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
              
              <button onClick={handleTransferClick} disabled={loading || !amount || !recipientAcc || recipientName === 'ACCOUNT_NOT_FOUND' || !recipientName} className="w-full bg-[#3DF2C4] text-black h-16 rounded-2xl font-black uppercase tracking-widest shadow-xl disabled:opacity-20 active:scale-95 transition-all">
                Execute {currency} Transfer
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="fund" className="space-y-6">
            <div className="bg-[#141821] p-8 rounded-[2.5rem] border border-white/5 space-y-6">
              <div className="space-y-4 max-h-64 overflow-y-auto no-scrollbar">
                {adminBanks.map(bank => (
                  <div key={bank.id} className="p-6 bg-white/[0.02] rounded-2xl border border-white/5 space-y-2">
                    <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">{bank.bankName}</p>
                    <p className="text-sm font-black text-white uppercase">{bank.accountName}</p>
                    <p className="text-2xl font-black text-[#3DF2C4] tracking-widest">{bank.accountNumber}</p>
                  </div>
                ))}
              </div>
              <input type="number" className="w-full bg-white/5 p-5 rounded-2xl border border-white/5 outline-none focus:border-[#3DF2C4]" placeholder="Deposit Amount (₦)" value={amount} onChange={e => setAmount(e.target.value)} />
              <input className="w-full bg-white/5 p-5 rounded-2xl border border-white/5 outline-none focus:border-[#3DF2C4]" placeholder="Session Reference" value={refNumber} onChange={e => setRefNumber(e.target.value)} />
              <button onClick={() => alert("Verification Logged.")} className="w-full bg-[#3DF2C4] text-black h-16 rounded-2xl font-black uppercase tracking-widest shadow-xl">Submit Evidence</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
