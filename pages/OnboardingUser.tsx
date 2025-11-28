

import React, { useState } from 'react';
import { mockStore } from '../services/mockStore';

interface OnboardingUserProps {
  userId: string;
  onComplete: () => void;
}

export const OnboardingUser: React.FC<OnboardingUserProps> = ({ userId, onComplete }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    dob: '',
    address: '',
    gender: 'Male',
    nin: '',
    bvn: '',
    idCard: null as File | null,
    bio: '',
    interests: [] as string[]
  });

  const interestsList = ['Technology', 'Finance', 'Shopping', 'Travel', 'Food'];

  const handleInterestToggle = (interest: string) => {
    setData(prev => {
        if (prev.interests.includes(interest)) {
            return { ...prev, interests: prev.interests.filter(i => i !== interest) };
        }
        return { ...prev, interests: [...prev.interests, interest] };
    });
  };

  const handleSubmit = () => {
    mockStore.completeOnboarding(userId, {
        bio: data.bio,
        interests: data.interests,
        kycData: {
            dob: data.dob,
            address: data.address,
            gender: data.gender,
            nin: data.nin,
            bvn: data.bvn,
            idFrontUrl: data.idCard ? URL.createObjectURL(data.idCard) : undefined
        }
    });
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 bg-blue-600 text-white">
                <h2 className="text-xl font-bold">Finish Your Profile</h2>
                <p className="text-blue-100 text-sm">Tell us a bit about yourself.</p>
            </div>

            <div className="p-6 space-y-6">
                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in">
                        <h3 className="font-bold text-gray-900">Basic Info</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                            <input type="date" className="w-full p-3 border border-gray-300 rounded-xl" onChange={(e) => setData({...data, dob: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                            <select className="w-full p-3 border border-gray-300 rounded-xl" onChange={(e) => setData({...data, gender: e.target.value})}>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Residential Address</label>
                            <textarea className="w-full p-3 border border-gray-300 rounded-xl" rows={2} onChange={(e) => setData({...data, address: e.target.value})} />
                        </div>
                        <button onClick={() => setStep(2)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Next: Identity</button>
                    </div>
                )}
                
                {step === 2 && (
                    <div className="space-y-4 animate-in fade-in">
                        <h3 className="font-bold text-gray-900">Identity (KYC)</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">NIN (11 Digits)</label>
                            <input type="text" className="w-full p-3 border border-gray-300 rounded-xl" placeholder="Optional" onChange={(e) => setData({...data, nin: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">BVN (11 Digits)</label>
                            <input type="text" className="w-full p-3 border border-gray-300 rounded-xl" placeholder="Optional" onChange={(e) => setData({...data, bvn: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Upload ID (Optional)</label>
                            <input type="file" className="w-full text-sm" onChange={(e) => setData({...data, idCard: e.target.files?.[0] || null})} />
                        </div>
                        <button onClick={() => setStep(3)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Next: Preferences</button>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4 animate-in fade-in">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
                            <div className="flex flex-wrap gap-2">
                                {interestsList.map(int => (
                                    <button 
                                        key={int}
                                        onClick={() => handleInterestToggle(int)}
                                        className={`px-3 py-1 rounded-full text-sm border ${
                                            data.interests.includes(int) ? 'bg-blue-100 border-blue-600 text-blue-700' : 'border-gray-300 text-gray-600'
                                        }`}
                                    >
                                        {int}
                                    </button>
                                ))}
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Short Bio (Optional)</label>
                            <textarea className="w-full p-3 border border-gray-300 rounded-xl" rows={2} onChange={(e) => setData({...data, bio: e.target.value})} />
                        </div>
                        <button onClick={handleSubmit} className="w-full bg-black text-white py-3 rounded-xl font-bold">Complete Setup</button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};