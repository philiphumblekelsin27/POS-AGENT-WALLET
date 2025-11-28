
import React, { useState } from 'react';
import { Transaction } from '../types';

interface MerchantPayProps {
  onPayment: (amount: number, merchantId: string) => void;
}

export const MerchantPay: React.FC<MerchantPayProps> = ({ onPayment }) => {
  const [merchantId, setMerchantId] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = () => {
    if (merchantId && amount) {
        onPayment(parseFloat(amount), merchantId);
    }
  };

  return (
    <div className="p-6 pb-24">
      <h2 className="text-2xl font-bold mb-6">Pay Merchant</h2>
      
      <div className="bg-gray-900 text-white p-6 rounded-2xl mb-8 relative overflow-hidden">
        <div className="relative z-10 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <span className="text-3xl">📷</span>
            </div>
            <p className="font-bold mb-1">Scan QR Code</p>
            <p className="text-xs text-gray-400">Align code within frame to pay instantly</p>
        </div>
        {/* Decorative scanning line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50 animate-[scan_2s_ease-in-out_infinite]"></div>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="h-px bg-gray-200 flex-1"></div>
        <span className="text-xs text-gray-400 font-bold uppercase">Or Enter Manually</span>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      <div className="space-y-4">
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">Merchant ID / Wallet</label>
           <input 
              type="text" 
              value={merchantId}
              onChange={(e) => setMerchantId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-mono"
              placeholder="0000-00-0000"
           />
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₦)</label>
           <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="0.00"
           />
        </div>

        <button 
           onClick={handleSubmit}
           disabled={!amount || !merchantId}
           className="w-full bg-black text-white py-4 rounded-xl font-bold shadow-lg disabled:opacity-50 mt-4"
        >
           Pay Now
        </button>
      </div>
    </div>
  );
};
