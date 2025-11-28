

import React, { useState, useEffect } from 'react';
import { User, Transaction, TransactionType, TransactionStatus, BankAccount } from '../types';
import { analyzeReceipt } from '../services/aiService';
import { mockStore } from '../services/mockStore';

interface WalletProps {
  user: User;
  onAddTransaction: (tx: Transaction) => void;
  initialTab?: 'topup' | 'withdraw' | 'transfer';
}

export const Wallet: React.FC<WalletProps> = ({ user, onAddTransaction, initialTab }) => {
  const [activeTab, setActiveTab] = useState<'topup' | 'withdraw' | 'transfer'>(initialTab || 'topup');
  const [amount, setAmount] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{amount: number, confidence: number} | null>(null);

  // Top Up State
  const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null);
  const [timer, setTimer] = useState<number | null>(null); // Time in seconds

  const settings = mockStore.getSystemSettings();
  const limits = user.limits || { dailyLimit: 0, dailyUsed: 0, weeklyLimit: 0, weeklyUsed: 0 };
  const dailyPercent = Math.min((limits.dailyUsed / limits.dailyLimit) * 100, 100);

  // Countdown Timer Logic
  useEffect(() => {
      let interval: any;
      if (timer !== null && timer > 0) {
          interval = setInterval(() => {
              setTimer(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
          }, 1000);
      } else if (timer === 0) {
          // Time expired
          setSelectedBank(null);
          setTimer(null);
      }
      return () => clearInterval(interval);
  }, [timer]);

  const handleStartTopUp = () => {
      if (settings.bankAccounts.length > 0) {
          // Randomly select a bank account
          const randomBank = settings.bankAccounts[Math.floor(Math.random() * settings.bankAccounts.length)];
          setSelectedBank(randomBank);
          setTimer(30 * 60); // 30 Minutes
      } else {
          alert("No bank accounts configured by admin.");
      }
  };

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      setIsProcessing(true);
      try {
        const result = await analyzeReceipt(selectedFile);
        setAnalysisResult({
          amount: result.suggestedAmount,
          confidence: result.confidence
        });
        setAmount(result.suggestedAmount.toString());
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSubmit = () => {
    if (!amount) return;
    
    let type = TransactionType.DEPOSIT;
    let description = 'Manual Deposit via Receipt';

    if (activeTab === 'withdraw') {
        type = TransactionType.WITHDRAWAL;
        description = 'Withdrawal Request';
    } else if (activeTab === 'transfer') {
        type = TransactionType.TRANSFER;
        description = `Transfer to ${recipientAccount}`;
    }

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      userId: user.id,
      type: type,
      amount: parseFloat(amount),
      date: new Date().toISOString(),
      status: TransactionStatus.PENDING,
      description: description,
      receiptUrl: file ? URL.createObjectURL(file) : undefined,
      aiConfidence: analysisResult?.confidence,
      aisuggestedAmount: analysisResult?.amount
    };

    onAddTransaction(newTx);
    
    // Clear form
    setAmount('');
    setRecipientAccount('');
    setFile(null);
    setAnalysisResult(null);
    if (activeTab === 'topup') {
        setTimer(null); // Stop timer
        setSelectedBank(null);
    }
  };

  return (
    <div className="p-6 pb-24 text-gray-900">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">My Wallet</h2>
        <div className="text-right">
            <span className="text-xs text-gray-500 block">Account: <span className="text-black font-mono">{user.accountNumber}</span></span>
        </div>
      </div>

      {/* KYC Progress */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-gray-500">Daily Limit Used</span>
            <span className="font-bold text-black">₦{(limits.dailyUsed / 1000).toFixed(0)}k / ₦{(limits.dailyLimit / 1000).toFixed(0)}k</span>
          </div>
          <div className="bg-gray-100 rounded-full h-2 overflow-hidden w-full relative">
            <div 
                className={`h-full ${dailyPercent > 80 ? 'bg-red-500' : 'bg-green-500'} transition-all duration-500`} 
                style={{ width: `${dailyPercent}%` }}
            ></div>
          </div>
      </div>

      <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex mb-6">
        {['topup', 'transfer', 'withdraw'].map((tab) => (
            <button 
            key={tab}
            onClick={() => {
                setActiveTab(tab as any);
                setAmount('');
                setRecipientAccount('');
                setFile(null);
            }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all capitalize ${
                activeTab === tab ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-black'
            }`}
            >
            {tab === 'topup' ? 'Top Up' : tab}
            </button>
        ))}
      </div>

      <div className="space-y-4">
        {activeTab === 'topup' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
             {!selectedBank ? (
                 <div className="text-center py-8">
                     <p className="text-gray-600 text-sm mb-4">Click to reveal a secure bank account for your deposit.</p>
                     <button 
                        onClick={handleStartTopUp}
                        className="bg-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-700"
                     >
                        Start Deposit Process
                     </button>
                 </div>
             ) : (
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl relative overflow-hidden">
                   {/* Timer Badge */}
                   <div className="absolute top-2 right-2 bg-red-100 text-red-600 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 animate-pulse">
                       <span>⏳</span> {formatTime(timer || 0)}
                   </div>

                   <h3 className="text-sm font-semibold text-blue-800 mb-4">Make Payment Here</h3>
                   <div className="space-y-2 text-sm text-blue-900">
                       <p className="flex justify-between border-b border-blue-100 pb-1">
                           <span className="text-blue-500">Bank Name:</span>
                           <span className="font-bold">{selectedBank.bankName}</span>
                       </p>
                       <p className="flex justify-between border-b border-blue-100 pb-1">
                           <span className="text-blue-500">Account Number:</span>
                           <span className="font-bold font-mono text-lg">{selectedBank.accountNumber}</span>
                       </p>
                       <p className="flex justify-between pb-1">
                           <span className="text-blue-500">Account Name:</span>
                           <span className="font-bold">{selectedBank.accountName}</span>
                       </p>
                   </div>
                   <p className="text-[10px] text-blue-600 mt-2 text-center bg-blue-100 p-1 rounded">
                       Account expires in {formatTime(timer || 0)}. Do not save this account number.
                   </p>
                </div>
             )}

             <div>
               <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-blue-500 transition-colors relative bg-gray-50">
                 <input 
                   type="file" 
                   accept="image/*"
                   onChange={handleFileChange}
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                 />
                 <span className="text-2xl mb-2">📸</span>
                 {file ? (
                   <span className="text-sm font-medium text-green-600">{file.name}</span>
                 ) : (
                   <span className="text-sm text-gray-500">Tap to upload receipt</span>
                 )}
               </div>
             </div>

             {isProcessing && (
               <div className="flex items-center gap-2 text-sm text-blue-600">
                 <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                 Analyzing receipt...
               </div>
             )}

             {analysisResult && (
                <div className="bg-green-50 border border-green-100 p-3 rounded-lg flex items-start gap-2">
                   <span className="text-lg">🤖</span>
                   <div>
                     <p className="text-xs font-bold text-green-800">AI Suggestion</p>
                     <p className="text-xs text-green-700">
                       We detected <strong>₦{analysisResult.amount.toLocaleString()}</strong> ({analysisResult.confidence}% confidence).
                     </p>
                   </div>
                </div>
             )}

             <div>
               <label className="block text-sm font-bold text-gray-900 mb-2">Amount</label>
               <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                  placeholder="0.00"
               />
             </div>

             <button 
               onClick={handleSubmit}
               disabled={!amount}
               className="w-full bg-black text-white py-4 rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
             >
               Confirm Top Up
             </button>
          </div>
        )}

        {activeTab === 'transfer' && (
           <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-500">Available Balance</p>
                <p className="text-2xl font-bold text-gray-900">₦ {user.balance.toLocaleString()}</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Recipient Wallet Number</label>
                <input 
                   type="text" 
                   value={recipientAccount}
                   onChange={(e) => setRecipientAccount(e.target.value)}
                   className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-mono text-gray-900"
                   placeholder="XXXX-XX-XXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Amount</label>
                <input 
                   type="number" 
                   value={amount}
                   onChange={(e) => setAmount(e.target.value)}
                   className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                   placeholder="0.00"
                />
              </div>

              <button 
                onClick={handleSubmit}
                disabled={!amount || !recipientAccount}
                className="w-full bg-black text-white py-4 rounded-xl font-bold shadow-lg disabled:opacity-50"
              >
                Send Money
              </button>
           </div>
        )}

        {activeTab === 'withdraw' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
               <p className="text-sm text-gray-500">Available to withdraw</p>
               <p className="text-2xl font-bold text-gray-900">₦ {user.balance.toLocaleString()}</p>
             </div>

             <div>
               <label className="block text-sm font-bold text-gray-900 mb-2">Amount</label>
               <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                  placeholder="0.00"
               />
             </div>

             <button 
               onClick={handleSubmit}
               disabled={!amount}
               className="w-full bg-black text-white py-4 rounded-xl font-bold shadow-lg disabled:opacity-50"
             >
               Request Withdrawal
             </button>
          </div>
        )}
      </div>
    </div>
  );
};
