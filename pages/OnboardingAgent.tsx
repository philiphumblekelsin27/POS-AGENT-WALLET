

import React, { useState } from 'react';
import { mockStore } from '../services/mockStore';
import { AgentCategory } from '../types';

interface OnboardingAgentProps {
  userId: string;
  onComplete: () => void;
}

export const OnboardingAgent: React.FC<OnboardingAgentProps> = ({ userId, onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    phone: '',
    category: AgentCategory.POS,
    subcategories: [] as string[],
    description: '',
    workingHours: '9AM - 5PM',
    
    // POS specific
    posShopAddress: '',
    posCashCapacity: 0,
    
    // Driver specific
    vehicleMake: '',
    vehicleModel: '',
    plateNumber: '',
    licenseNumber: '',
    
    // Hotel specific
    hotelAmenities: '',
    
    nin: '',
    bvn: '',
    
    // Files
    idCard: null as File | null,
    selfie: null as File | null,
    proofOfAddress: null as File | null,
    businessReg: null as File | null
  });

  const categories = Object.values(AgentCategory);
  
  const handleInputChange = (field: string, value: any) => {
      setFormData({...formData, [field]: value});
  };

  const handleSubcategoryToggle = (sub: string) => {
      const current = formData.subcategories;
      if (current.includes(sub)) {
          handleInputChange('subcategories', current.filter(s => s !== sub));
      } else {
          handleInputChange('subcategories', [...current, sub]);
      }
  };

  const getSubcategories = (cat: AgentCategory) => {
      switch(cat) {
          case AgentCategory.POS: return ['Withdrawal', 'Deposit', 'Bill Payment', 'Crypto'];
          case AgentCategory.DRIVER: return ['Taxi', 'Delivery', 'Interstate', 'Trucking'];
          case AgentCategory.HOTEL: return ['Standard Room', 'Suite', 'Short Stay'];
          case AgentCategory.HAIRDRESSER: return ['Barber', 'Stylist', 'Braids', 'Home Service'];
          case AgentCategory.CLEANER: return ['Deep Clean', 'Standard', 'Laundry'];
          default: return ['Standard Service'];
      }
  };

  const handleSubmit = () => {
    // Construct the specialized agent object
    const agentData: any = {
        businessName: formData.businessName,
        category: formData.category,
        subcategories: formData.subcategories,
        description: formData.description,
        workingHours: formData.workingHours,
        kycData: {
            nin: formData.nin,
            bvn: formData.bvn,
            idFrontUrl: formData.idCard ? URL.createObjectURL(formData.idCard) : undefined,
            selfieUrl: formData.selfie ? URL.createObjectURL(formData.selfie) : undefined,
            proofOfAddressUrl: formData.proofOfAddress ? URL.createObjectURL(formData.proofOfAddress) : undefined
        },
        services: formData.subcategories // Legacy support
    };
    
    if (formData.category === AgentCategory.DRIVER) {
        agentData.driverDetails = {
            vehicleMake: formData.vehicleMake,
            vehicleModel: formData.vehicleModel,
            plateNumber: formData.plateNumber,
            licenseNumber: formData.licenseNumber,
            color: 'Unknown'
        };
    } else if (formData.category === AgentCategory.POS) {
        agentData.posDetails = {
            shopAddress: formData.posShopAddress,
            cashCapacity: formData.posCashCapacity
        };
    } else if (formData.category === AgentCategory.HOTEL) {
        agentData.hotelDetails = {
            amenities: formData.hotelAmenities.split(','),
            checkInTime: '12:00',
            checkOutTime: '11:00',
            roomRate: 5000
        };
    }

    mockStore.completeOnboarding(userId, agentData);
    onComplete();
  };

  // --- RENDER STEPS ---

  const renderStep1_BasicInfo = () => (
      <div className="space-y-4 animate-in fade-in">
          <h3 className="font-bold text-gray-900 text-lg">Business Basics</h3>
          <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Business Name / Display Name</label>
              <input type="text" className="w-full p-3 border border-gray-300 rounded-xl" 
                value={formData.businessName} onChange={(e) => handleInputChange('businessName', e.target.value)} />
          </div>
          <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Business Phone</label>
              <input type="tel" className="w-full p-3 border border-gray-300 rounded-xl" 
                value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
          </div>
          <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Working Hours</label>
              <input type="text" placeholder="e.g. Mon-Fri 9am-6pm" className="w-full p-3 border border-gray-300 rounded-xl" 
                value={formData.workingHours} onChange={(e) => handleInputChange('workingHours', e.target.value)} />
          </div>
          <button onClick={() => setStep(2)} className="w-full bg-black text-white py-3 rounded-xl font-bold mt-4">Next: Service Type</button>
      </div>
  );

  const renderStep2_Category = () => (
      <div className="space-y-4 animate-in fade-in">
          <h3 className="font-bold text-gray-900 text-lg">Select Service Category</h3>
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {categories.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => handleInputChange('category', cat)}
                    className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${formData.category === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 hover:border-blue-300'}`}
                  >
                      {cat}
                  </button>
              ))}
          </div>
          
          <div className="mt-4">
              <label className="block text-xs font-bold text-gray-700 mb-2">Select Services ({formData.category})</label>
              <div className="flex flex-wrap gap-2">
                  {getSubcategories(formData.category).map(sub => (
                      <button 
                        key={sub}
                        onClick={() => handleSubcategoryToggle(sub)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${formData.subcategories.includes(sub) ? 'bg-blue-100 border-blue-600 text-blue-800' : 'border-gray-300 text-gray-500'}`}
                      >
                          {sub}
                      </button>
                  ))}
              </div>
          </div>
           <button onClick={() => setStep(3)} className="w-full bg-black text-white py-3 rounded-xl font-bold mt-4">Next: Details</button>
      </div>
  );

  const renderStep3_DynamicDetails = () => (
      <div className="space-y-4 animate-in fade-in">
          <h3 className="font-bold text-gray-900 text-lg">{formData.category} Details</h3>
          
          {/* POS SPECIFIC */}
          {formData.category === AgentCategory.POS && (
              <>
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Shop Address</label>
                    <input type="text" className="w-full p-3 border border-gray-300 rounded-xl" 
                        value={formData.posShopAddress} onChange={(e) => handleInputChange('posShopAddress', e.target.value)} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Cash Capacity Estimate (₦)</label>
                    <input type="number" className="w-full p-3 border border-gray-300 rounded-xl" 
                        value={formData.posCashCapacity} onChange={(e) => handleInputChange('posCashCapacity', parseInt(e.target.value))} />
                </div>
              </>
          )}

          {/* DRIVER SPECIFIC */}
          {formData.category === AgentCategory.DRIVER && (
              <>
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Vehicle Make</label>
                    <input type="text" placeholder="Toyota" className="w-full p-3 border border-gray-300 rounded-xl" 
                        value={formData.vehicleMake} onChange={(e) => handleInputChange('vehicleMake', e.target.value)} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Vehicle Model</label>
                    <input type="text" placeholder="Camry" className="w-full p-3 border border-gray-300 rounded-xl" 
                        value={formData.vehicleModel} onChange={(e) => handleInputChange('vehicleModel', e.target.value)} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Plate Number</label>
                    <input type="text" className="w-full p-3 border border-gray-300 rounded-xl" 
                        value={formData.plateNumber} onChange={(e) => handleInputChange('plateNumber', e.target.value)} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Drivers License No.</label>
                    <input type="text" className="w-full p-3 border border-gray-300 rounded-xl" 
                        value={formData.licenseNumber} onChange={(e) => handleInputChange('licenseNumber', e.target.value)} />
                </div>
              </>
          )}

          {/* GENERIC DESC */}
          <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Short Bio / Description</label>
              <textarea className="w-full p-3 border border-gray-300 rounded-xl" rows={3}
                value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} />
          </div>
          
           <button onClick={() => setStep(4)} className="w-full bg-black text-white py-3 rounded-xl font-bold mt-4">Next: Documents</button>
      </div>
  );

  const renderStep4_Documents = () => (
      <div className="space-y-4 animate-in fade-in">
          <h3 className="font-bold text-gray-900 text-lg">Verification Documents</h3>
          
          <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">NIN (National ID Number)</label>
              <input type="text" className="w-full p-3 border border-gray-300 rounded-xl" placeholder="11 digits"
                 value={formData.nin} onChange={(e) => handleInputChange('nin', e.target.value)} />
          </div>
          <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">BVN (Bank Verification Number)</label>
              <input type="text" className="w-full p-3 border border-gray-300 rounded-xl" placeholder="11 digits"
                 value={formData.bvn} onChange={(e) => handleInputChange('bvn', e.target.value)} />
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <p className="text-xs font-bold text-blue-800 mb-2">Required Uploads</p>
              
              <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white p-2 rounded border">
                      <span className="text-xs text-gray-600">ID Card (Front)</span>
                      <input type="file" className="text-xs w-24" onChange={(e) => handleInputChange('idCard', e.target.files?.[0])} />
                  </div>
                  <div className="flex items-center justify-between bg-white p-2 rounded border">
                      <span className="text-xs text-gray-600">Proof of Address</span>
                      <input type="file" className="text-xs w-24" onChange={(e) => handleInputChange('proofOfAddress', e.target.files?.[0])} />
                  </div>
                  <div className="flex items-center justify-between bg-white p-2 rounded border">
                      <span className="text-xs text-gray-600">Selfie with ID</span>
                      <input type="file" className="text-xs w-24" onChange={(e) => handleInputChange('selfie', e.target.files?.[0])} />
                  </div>
              </div>
          </div>
          
          <button onClick={handleSubmit} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold mt-4 shadow-lg">Submit Application</button>
      </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-black text-white p-6">
                <div className="flex justify-between items-center mb-1">
                    <h2 className="text-xl font-bold">Agent Application</h2>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded">Step {step}/4</span>
                </div>
                <p className="text-gray-400 text-xs">Join our network of professionals.</p>
            </div>

            <div className="p-6">
                {step === 1 && renderStep1_BasicInfo()}
                {step === 2 && renderStep2_Category()}
                {step === 3 && renderStep3_DynamicDetails()}
                {step === 4 && renderStep4_Documents()}
            </div>
            
            {step > 1 && (
                <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
                    <button onClick={() => setStep(step - 1)} className="text-xs font-bold text-gray-500 hover:text-black">Back to previous step</button>
                </div>
            )}
        </div>
    </div>
  );
};