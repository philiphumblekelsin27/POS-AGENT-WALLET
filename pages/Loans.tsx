
import React from 'react';
import { User, Loan, LoanTier } from '../types';

interface LoansProps {
  user: User;
  loans: Loan[];
  onRequestLoan: (amount: number, tier: LoanTier) => void;
}

export const Loans: React.FC<LoansProps> = ({ user, loans, onRequestLoan }) => {
  const activeLoan = loans.find(l => l.status === 'APPROVED' || l.status === 'PENDING');

  const tiers = [
    { id: LoanTier.BRONZE, name: 'Bronze Loan', limit: 50000, minKyc: 1, interest: '5%', color: 'bg-orange-100 text-orange-800' },
    { id: LoanTier.SILVER, name: 'Silver Loan', limit: 200000, minKyc: 2, interest: '4%', color: 'bg-gray-200 text-gray-800' },
    { id: LoanTier.GOLD, name: 'Gold Loan', limit: 1000000, minKyc: 3, interest: '3%', color: 'bg-yellow-100 text-yellow-800' },
  ];

  return (
    <div className="p-6 pb-24">
      <h2 className="text-2xl font-bold mb-2">Quick Loans</h2>
      <p className="text-gray-500 mb-6 text-sm">Instant funds for your business.</p>

      {/* Active Loan Status */}
      {activeLoan ? (
        <div className="bg-black text-white p-6 rounded-2xl shadow-xl mb-8">
           <div className="flex justify-between items-center mb-4">
             <span className="text-xs uppercase font-bold tracking-widest text-gray-400">Current Loan</span>
             <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-black bg-white`}>
               {activeLoan.status}
             </span>
           </div>
           <h3 className="text-3xl font-bold mb-1">₦{activeLoan.totalRepayment.toLocaleString()}</h3>
           <p className="text-xs text-gray-400 mb-4">Total to Repay (Due {new Date(activeLoan.dueDate).toLocaleDateString()})</p>
           
           <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
             <div className="h-full bg-blue-500 w-1/4"></div>
           </div>
           <p className="text-right text-[10px] mt-1 text-gray-500">25% Repaid</p>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-8">
          <p className="text-blue-800 text-sm font-medium">You have no active loans. Choose a tier below to apply.</p>
        </div>
      )}

      <h3 className="font-bold text-lg mb-4">Available Plans</h3>
      <div className="space-y-4">
        {tiers.map((tier) => {
          const isLocked = user.kycLevel < tier.minKyc;
          return (
            <div key={tier.id} className={`p-4 rounded-xl border ${isLocked ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-gray-200 shadow-sm'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-1 rounded text-xs font-bold ${tier.color}`}>{tier.name}</span>
                {isLocked && <span className="text-xs text-red-500 font-medium">🔒 Requires Tier {tier.minKyc}</span>}
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">Up to ₦{tier.limit.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mb-4">Interest rate: {tier.interest} • 30 Day Term</p>
              
              <button
                onClick={() => onRequestLoan(tier.limit, tier.id)}
                disabled={isLocked || !!activeLoan}
                className={`w-full py-3 rounded-lg text-sm font-bold transition-colors ${
                  isLocked || activeLoan 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-black text-white hover:bg-gray-800 shadow-md'
                }`}
              >
                {activeLoan ? 'Loan Active' : isLocked ? 'Upgrade Tier to Unlock' : 'Apply Now'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
