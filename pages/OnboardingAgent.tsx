
import React, { useState, useRef } from 'react';
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
    basePrice: 1000,
    
    // POS specific
    posShopAddress: '',
    posCashCapacity: 0,
    
    // Driver specific
    vehicleMake: '',
    vehicleModel: '',
    plateNumber: '',
    licenseNumber: '',
    
    nin: '',
    bvn: '',
    
    // Files URLs
    idCardUrl: null as string | null,
    selfieUrl: null as string | null,
    proofOfAddressUrl: null as string | null,
  });

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const startCamera = async (target: string) => {
    setCameraTarget(target);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: target === 'selfieUrl' ? 'user' : 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Unable to access camera.");
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const url = canvasRef.current.toDataURL('image/jpeg');
        handleInputChange(cameraTarget, url);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const getSubcategories = (cat: AgentCategory) => {
      switch(cat) {
          case AgentCategory.POS: return ['Withdrawal', 'Deposit', 'Bill Payment', 'Crypto'];
          case AgentCategory.DRIVER: return ['Taxi', 'Delivery', 'Interstate', 'Trucking'];
          case AgentCategory.HOTEL: return ['Standard Room', 'Suite', 'Short Stay'];
          default: return ['Standard Service', 'Express', 'Premium'];
      }
  };

  const handleSubmit = () => {
    const agentData: any = {
        businessName: formData.businessName,
        category: formData.category,
        subcategories: formData.subcategories,
        description: formData.description,
        workingHours: formData.workingHours,
        basePrice: formData.basePrice,
        kycData: {
            nin: formData.nin,
            bvn: formData.bvn,
            idFrontUrl: formData.idCardUrl || undefined,
            selfieUrl: formData.selfieUrl || undefined,
            proofOfAddressUrl: formData.proofOfAddressUrl || undefined
        },
        services: formData.subcategories
    };
    
    if (formData.category === AgentCategory.DRIVER) {
        agentData.driverDetails = {
            vehicleMake: formData.vehicleMake,
            vehicleModel: formData.vehicleModel,
            plateNumber: formData.plateNumber,
            licenseNumber: formData.licenseNumber,
        };
    } else if (formData.category === AgentCategory.POS) {
        agentData.posDetails = {
            shopAddress: formData.posShopAddress,
            cashCapacity: formData.posCashCapacity
        };
    }

    mockStore.completeOnboarding(userId, agentData);
    onComplete();
  };

  const DocUpload = ({ label, target, value }: { label: string, target: string, value: string | null }) => (
    <div className="space-y-2">
      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">{label}</label>
      <div className="flex items-center gap-3">
        {value ? (
          <img src={value} className="w-12 h-12 rounded border object-cover" />
        ) : (
          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xl">📄</div>
        )}
        <button 
          onClick={() => startCamera(target)}
          className="flex-1 py-2 border-2 border-dashed border-gray-300 rounded-lg text-[10px] font-bold text-gray-500 hover:border-black hover:text-black transition-all"
        >
          {value ? 'Retake Photo' : 'Capture Document'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAF7] p-6 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-[#1A1A1A] text-white p-6">
                <div className="flex justify-between items-center mb-1">
                    <h2 className="text-xl font-bold">Agent Onboarding</h2>
                    <span className="text-[10px] bg-white/20 px-2 py-1 rounded font-black">STEP {step}/4</span>
                </div>
                <p className="text-gray-400 text-xs">Verify your business to start earning.</p>
            </div>

            <div className="p-6">
                {isCameraActive ? (
                   <div className="space-y-4 animate-in zoom-in-95">
                      <div className="relative aspect-video bg-black rounded-xl overflow-hidden border-2 border-[#D4AF37]">
                          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                          <div className="absolute inset-0 border-2 border-white/20 m-6 rounded-lg pointer-events-none"></div>
                      </div>
                      <div className="flex gap-2">
                          <button onClick={stopCamera} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm">Cancel</button>
                          <button onClick={capturePhoto} className="flex-2 py-3 bg-[#1A1A1A] text-[#D4AF37] rounded-xl font-bold text-sm">Snap Photo</button>
                      </div>
                      <canvas ref={canvasRef} className="hidden" />
                  </div>
                ) : (
                  <>
                    {step === 1 && (
                      <div className="space-y-4 animate-in fade-in">
                          <h3 className="font-bold text-gray-900 text-lg">Business Basics</h3>
                          <div>
                              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">Business Name</label>
                              <input type="text" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white outline-none" 
                                value={formData.businessName} onChange={(e) => handleInputChange('businessName', e.target.value)} />
                          </div>
                          <div>
                              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">Business Phone</label>
                              <input type="tel" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white outline-none" 
                                value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
                          </div>
                          <div>
                              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">Availability</label>
                              <input type="text" placeholder="Mon-Fri 8am-8pm" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none" 
                                value={formData.workingHours} onChange={(e) => handleInputChange('workingHours', e.target.value)} />
                          </div>
                          <button onClick={() => setStep(2)} className="w-full bg-[#1A1A1A] text-[#D4AF37] py-4 rounded-xl font-bold mt-4 shadow-lg active:scale-95 transition-all">Next: Categories</button>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-4 animate-in fade-in">
                          <h3 className="font-bold text-gray-900 text-lg">Service Selection</h3>
                          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto no-scrollbar">
                              {categories.map(cat => (
                                  <button 
                                    key={cat} 
                                    onClick={() => handleInputChange('category', cat)}
                                    className={`p-3 rounded-xl border-2 text-left text-[10px] font-black uppercase transition-all ${formData.category === cat ? 'bg-[#1A1A1A] text-[#D4AF37] border-[#1A1A1A] shadow-md' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                                  >
                                      {cat}
                                  </button>
                              ))}
                          </div>
                          
                          <div className="mt-4">
                              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Services ({formData.category})</label>
                              <div className="flex flex-wrap gap-2 mb-4">
                                  {getSubcategories(formData.category).map(sub => (
                                      <button 
                                        key={sub}
                                        onClick={() => handleSubcategoryToggle(sub)}
                                        className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase border-2 transition-all ${formData.subcategories.includes(sub) ? 'bg-blue-100 border-blue-600 text-blue-800' : 'border-gray-200 text-gray-500'}`}
                                      >
                                          {sub}
                                      </button>
                                  ))}
                              </div>
                              
                              <div>
                                 <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">Base Price (₦)</label>
                                 <input type="number" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none font-bold" 
                                    value={formData.basePrice} onChange={(e) => handleInputChange('basePrice', parseInt(e.target.value))} />
                              </div>
                          </div>
                           <button onClick={() => setStep(3)} className="w-full bg-[#1A1A1A] text-[#D4AF37] py-4 rounded-xl font-bold mt-4 shadow-lg active:scale-95 transition-all">Next: Details</button>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-4 animate-in fade-in">
                          <h3 className="font-bold text-gray-900 text-lg">{formData.category} Details</h3>
                          
                          {formData.category === AgentCategory.POS && (
                              <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">Shop Address</label>
                                    <input type="text" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none" 
                                        value={formData.posShopAddress} onChange={(e) => handleInputChange('posShopAddress', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">Cash Capacity (₦)</label>
                                    <input type="number" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none" 
                                        value={formData.posCashCapacity} onChange={(e) => handleInputChange('posCashCapacity', parseInt(e.target.value))} />
                                </div>
                              </div>
                          )}

                          {formData.category === AgentCategory.DRIVER && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">Make</label>
                                        <input type="text" placeholder="Toyota" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none" 
                                            value={formData.vehicleMake} onChange={(e) => handleInputChange('vehicleMake', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">Model</label>
                                        <input type="text" placeholder="Corolla" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none" 
                                            value={formData.vehicleModel} onChange={(e) => handleInputChange('vehicleModel', e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">Plate Number</label>
                                        <input type="text" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none uppercase" 
                                            value={formData.plateNumber} onChange={(e) => handleInputChange('plateNumber', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">License No.</label>
                                        <input type="text" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none" 
                                            value={formData.licenseNumber} onChange={(e) => handleInputChange('licenseNumber', e.target.value)} />
                                    </div>
                                </div>
                              </div>
                          )}

                          <div>
                              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">Business Bio</label>
                              <textarea className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none" rows={3}
                                value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} />
                          </div>
                          
                           <button onClick={() => setStep(4)} className="w-full bg-[#1A1A1A] text-[#D4AF37] py-4 rounded-xl font-bold mt-4 shadow-lg active:scale-95 transition-all">Next: Documents</button>
                      </div>
                    )}

                    {step === 4 && (
                      <div className="space-y-4 animate-in fade-in">
                          <h3 className="font-bold text-gray-900 text-lg">Verification</h3>
                          
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">NIN</label>
                                  <input type="text" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none font-mono" placeholder="11 digits"
                                     value={formData.nin} onChange={(e) => handleInputChange('nin', e.target.value)} />
                              </div>
                              <div>
                                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">BVN</label>
                                  <input type="text" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none font-mono" placeholder="11 digits"
                                     value={formData.bvn} onChange={(e) => handleInputChange('bvn', e.target.value)} />
                              </div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                              <DocUpload label="Government ID (Front)" target="idCardUrl" value={formData.idCardUrl} />
                              <DocUpload label="Proof of Address" target="proofOfAddressUrl" value={formData.proofOfAddressUrl} />
                              <DocUpload label="Owner Selfie" target="selfieUrl" value={formData.selfieUrl} />
                          </div>
                          
                          <button onClick={handleSubmit} className="w-full bg-[#009688] text-white py-4 rounded-xl font-bold mt-4 shadow-lg hover:brightness-110 active:scale-95 transition-all">Submit Application</button>
                      </div>
                    )}
                  </>
                )}
            </div>
            
            {!isCameraActive && step > 1 && (
                <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
                    <button onClick={() => setStep(step - 1)} className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors">← Back to previous step</button>
                </div>
            )}
        </div>
        <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
