
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Transaction, TransactionType, TransactionStatus, MultiCurrencyWallet, WalletStatus, WealthInsight } from '../types';
import { mockStore } from '../services/mockStore';
import { analyzeReceipt, AnalysisResult } from '../services/aiService';
import { Modal } from '../components/Modal';
import { SlideToConfirm } from '../components/SlideToConfirm';
// Fixed: Added Wallet as WalletIcon to the lucide-react imports
import { ArrowUpRight, ArrowDownLeft, Repeat, Camera, History, PieChart, Shield, Info, ChevronDown, Wallet as WalletIcon } from 'lucide-react';

interface WalletProps {
  user: User;
  onAddTransaction: (tx: Transaction) => void;
  initialTab?: 'topup' | 'withdraw' | 'transfer' | 'swap';
  onRefresh?: () => void;
}

export const Wallet: React.FC<WalletProps> = ({ user, onAddTransaction, initialTab, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'topup' | 'withdraw' | 'transfer' | 'swap'>(initialTab || 'topup');
  const [activeWallet, setActiveWallet] = useState<MultiCurrencyWallet>(user.wallets.find(w => w.currency === user.preferredCurrency) || user.wallets[0]);
  const [targetCurrency, setTargetCurrency] = useState<string>('NGN');
  const [amount, setAmount] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [recipientName, setRecipientName] = useState<string | null>(null);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<AnalysisResult | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wealthInsights: WealthInsight[] = [
    { category: 'Transport', percentage: 12, trend: 'UP', message: "You spent 12% more on Transport this month than last month." },
    { category: 'Savings', percentage: 5, trend: 'DOWN', message: "Your currency swaps saved you ₦4,200 in fees this week." }
  ];

  useEffect(() => {
    setHistory(mockStore.getTransactions('USER'));
  }, [user.wallets]);

  useEffect(() => {
    if (recipientAccount.length >= 10) {
      const foundUser = mockStore.getUserByAccountNumber(recipientAccount);
      setRecipientName(foundUser ? foundUser.name : null);
    } else {
      setRecipientName(null);
    }
  }, [recipientAccount]);

  const handleConfirmAction = () => {
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      userId: user.id,
      type: activeTab === 'topup' ? TransactionType.DEPOSIT : activeTab === 'withdraw' ? TransactionType.WITHDRAWAL : TransactionType.TRANSFER,
      amount: parseFloat(amount),
      currency: activeWallet.currency,
      toCurrency: activeTab === 'transfer' ? targetCurrency : undefined,
      date: new Date().toISOString(),
      status: TransactionStatus.COMPLETED,
      description: activeTab === 'topup' ? `Wallet Top Up (${activeWallet.currency})` : activeTab === 'withdraw' ? 'Bank Payout' : `Node Transfer to ${recipientName || recipientAccount}`,
      recipientId: recipientAccount,
      referenceNumber: scanResult?.referenceNumber || `REF-${Date.now()}`
    };

    onAddTransaction(newTx);
    setAmount('');
    setRecipientAccount('');
    setRecipientName(null);
    setShowConfirm(false);
    if (onRefresh) onRefresh();
  };

  const exchangeRate = mockStore.getExchangeRate(activeWallet.currency, targetCurrency);
  const totalToPay = parseFloat(amount) || 0;

  return (
    <div className="p-6 pb-32 text-white bg-[#050505] min-h-screen overflow-x-hidden">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black tracking-tight">Vault</h2>
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#00F2EA]">
          <Shield size={20} />
        </div>
      </div>

      {/* Phase 9 Wealth Insights */}
      <section className="mb-10 p-5 rounded-[2rem] bg-gradient-to-br from-indigo-900/40 to-emerald-900/40 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <PieChart size={80} />
        </div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 bg-[#00F2EA] rounded-full animate-ping" />
          <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-[#00F2EA]">Wealth Intelligence</h3>
        </div>
        <p className="text-xs font-medium leading-relaxed opacity-80">{wealthInsights[0].message}</p>
      </section>

      {/* Wallet Operations Grid */}
      <section className="grid grid-cols-2 gap-4 mb-10">
        {[
          { id: 'topup', icon: <ArrowDownLeft />, label: 'Add Cash', color: 'bg-emerald-500/10 text-emerald-400' },
          { id: 'withdraw', icon: <ArrowUpRight />, label: 'Payout', color: 'bg-indigo-500/10 text-indigo-400' },
          { id: 'transfer', icon: <Repeat />, label: 'Send Node', color: 'bg-purple-500/10 text-purple-400' },
          { id: 'swap', icon: <PieChart />, label: 'Swap', color: 'bg-orange-500/10 text-orange-400' },
        ].map(op => (
          <button 
            key={op.id}
            onClick={() => setActiveTab(op.id as any)}
            className={`p-5 rounded-3xl border transition-all flex flex-col gap-3 ${
              activeTab === op.id ? 'bg-white/10 border-[#00F2EA] shadow-[0_0_20px_rgba(0,242,234,0.1)]' : 'bg-white/5 border-white/5'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${op.color}`}>{op.icon}</div>
            <span className="text-[10px] font-black uppercase tracking-widest">{op.label}</span>
          </button>
        ))}
      </section>

      <div className="space-y-6">
        <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5">
          <div className="flex justify-between items-center mb-6">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Transfer Amount</label>
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
              <span className="text-[10px] font-bold text-white/50">{activeWallet.currency}</span>
              <ChevronDown size={12} className="text-white/30" />
            </div>
          </div>
          <input 
            type="number" 
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
            className="w-full bg-transparent text-5xl font-black text-center outline-none focus:text-[#00F2EA] transition-all placeholder:text-white/5" 
            placeholder="0.00" 
          />
        </div>

        {activeTab === 'transfer' && (
          <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 space-y-4">
             <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Recipient Node ID</label>
             <input 
               type="text" 
               value={recipientAccount} 
               onChange={e => setRecipientAccount(e.target.value)}
               placeholder="XXXX-XX-XXXX"
               className="w-full bg-transparent text-xl font-mono tracking-tighter outline-none"
             />
             {recipientName && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                 <Shield className="text-emerald-400" size={16} />
                 <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Verified Target: {recipientName}</p>
               </motion.div>
             )}
          </div>
        )}

        <button 
          onClick={() => setShowConfirm(true)}
          disabled={!amount || (activeTab === 'transfer' && !recipientName)}
          className="w-full py-5 bg-[#00F2EA] text-black rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-[#00F2EA]/20 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
        >
          Review Operation
        </button>
      </div>

      {/* Transaction History Categorized (Phase 9) */}
      <section className="mt-12 space-y-6">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Synchronization Feed</h3>
          <History size={16} className="text-white/20" />
        </div>
        <div className="space-y-8">
          {['Today', 'Yesterday'].map(day => (
            <div key={day} className="space-y-4">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 ml-2">{day}</p>
              {history.slice(0, 3).map(tx => (
                <div key={tx.id} className="p-5 rounded-[2rem] bg-white/[0.02] border border-white/5 flex justify-between items-center group hover:bg-white/[0.04] transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 text-white/30 group-hover:text-[#00F2EA] transition-colors">
                      <WalletIcon size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight">{tx.description}</p>
                      <p className="text-[9px] text-white/20 font-bold mt-1 uppercase tracking-widest">{tx.status} • {tx.currency}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${tx.type === TransactionType.DEPOSIT ? 'text-[#00F2EA]' : 'text-white'}`}>
                      {tx.type === TransactionType.DEPOSIT ? '+' : '-'} {tx.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Phase 7 Secure Confirmation */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Operation">
        <div className="space-y-8 bg-[#0F172A] p-6 -m-4">
          <div className="text-center space-y-2">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Total Transaction</p>
            <h2 className="text-4xl font-black text-[#00F2EA]">{activeWallet.currency} {totalToPay.toLocaleString()}</h2>
            {activeWallet.currency !== 'NGN' && (
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">~ ₦{(totalToPay * mockStore.getExchangeRate(activeWallet.currency, 'NGN')).toLocaleString()}</p>
            )}
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3">
             <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/40">
               <span>Platform Fee</span>
               <span>0.00 %</span>
             </div>
             <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-[#00F2EA]">
               <span>Vault Shield</span>
               <span>Active</span>
             </div>
          </div>

          <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20 flex gap-3 items-start">
             <Info className="text-indigo-400 shrink-0" size={14} />
             <p className="text-[9px] font-medium text-indigo-200/60 leading-relaxed uppercase tracking-widest">Funds will be synchronized across nodes immediately. Ensure recipient ID is correct.</p>
          </div>

          <SlideToConfirm onConfirm={handleConfirmAction} label="Slide to Synchronize" successLabel="Syncing Nodes..." />
          <button onClick={() => setShowConfirm(false)} className="w-full text-[10px] font-black uppercase tracking-widest text-white/30 py-2">Abort Operation</button>
        </div>
      </Modal>
    </div>
  );
};
