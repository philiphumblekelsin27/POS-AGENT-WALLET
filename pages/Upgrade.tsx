
import React from 'react';
import { User } from '../types';

interface UpgradeProps {
  user: User;
  onUpgrade: () => void;
}

export const Upgrade: React.FC<UpgradeProps> = ({ user, onUpgrade }) => {
  const nextTier = user.kycLevel + 1;
  const isMaxLevel = user.kycLevel >= 3;

  return (
    <div className="p-6 pb-24">
       <h2 className="text-2xl font-bold mb-2">Account Limits</h2>
       <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8 text-center">
         <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">
           {user.kycLevel === 1 ? '🥉' : user.kycLevel === 2 ? '🥈' : '🥇'}
         </div>
         <h3 className="text-xl font-bold">Current: Tier {user.kycLevel}</h3>
         <p className="text-gray-500 text-sm mt-1">
           Daily Limit: ₦{(user.limits?.dailyLimit || 0).toLocaleString()}
         </p>
       </div>

       {!isMaxLevel && (
         <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-6 rounded-2xl text-white shadow-lg">
           <h3 className="text-xl font-bold mb-2">Upgrade to Tier {nextTier}</h3>
           <p className="text-blue-100 text-sm mb-6">Unlock higher limits, bigger loans, and merchant features.</p>
           
           <ul className="space-y-3 mb-8 text-sm">
             <li className="flex items-center gap-2">
               <span className="bg-white/20 p-1 rounded-full text-xs">✓</span> Daily Limit: ₦{nextTier === 2 ? '200,000' : '5,000,000'}
             </li>
             <li className="flex items-center gap-2">
               <span className="bg-white/20 p-1 rounded-full text-xs">✓</span> Loans up to: ₦{nextTier === 2 ? '200,000' : '1,000,000'}
             </li>
             <li className="flex items-center gap-2">
               <span className="bg-white/20 p-1 rounded-full text-xs">✓</span> Reduced Transfer Fees
             </li>
           </ul>

           <button 
             onClick={onUpgrade}
             className="w-full bg-white text-blue-900 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors"
           >
             Request Upgrade
           </button>
           <p className="text-[10px] text-center mt-2 opacity-70">Requires facial verification review.</p>
         </div>
       )}

       {isMaxLevel && (
         <div className="text-center p-8 bg-green-50 rounded-xl border border-green-100">
           <span className="text-4xl mb-4 block">🏆</span>
           <h3 className="font-bold text-green-800 mb-2">Maximum Level Reached</h3>
           <p className="text-green-700 text-sm">You are enjoying all the benefits of our premium tier.</p>
         </div>
       )}
    </div>
  );
};
