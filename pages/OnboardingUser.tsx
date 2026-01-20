
import React, { useState, useRef } from 'react';
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
    idCardUrl: null as string | null,
    selfieUrl: null as string | null,
    bio: '',
    interests: [] as string[]
  });
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraType, setCameraType] = useState<'id' | 'selfie'>('id');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const interestsList = ['Technology', 'Finance', 'Shopping', 'Travel', 'Food'];

  const handleInterestToggle = (interest: string) => {
    setData(prev => {
        if (prev.interests.includes(interest)) {
            return { ...prev, interests: prev.interests.filter(i => i !== interest) };
        }
        return { ...prev, interests: [...prev.interests, interest] };
    });
  };

  const startCamera = async (type: 'id' | 'selfie') => {
    setCameraType(type);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: type === 'id' ? 'environment' : 'user' } 
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
        if (cameraType === 'id') setData({ ...data, idCardUrl: url });
        else setData({ ...data, selfieUrl: url });
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
            idFrontUrl: data.idCardUrl || undefined,
            selfieUrl: data.selfieUrl || undefined
        }
    });
    onComplete();
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] p-6 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="p-6 bg-[#1A1A1A] text-white">
                <h2 className="text-xl font-bold">Finish Your Profile</h2>
                <p className="text-gray-400 text-sm">Tell us a bit about yourself.</p>
            </div>

            <div className="p-6 space-y-6">
                {isCameraActive ? (
                  <div className="space-y-4 animate-in zoom-in-95">
                      <div className="relative aspect-square bg-black rounded-xl overflow-hidden border-2 border-[#D4AF37]">
                          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                          <div className="absolute inset-0 border-2 border-[#D4AF37]/30 rounded-lg m-8 pointer-events-none"></div>
                      </div>
                      <div className="flex gap-2">
                          <button onClick={stopCamera} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm">Cancel</button>
                          <button onClick={capturePhoto} className="flex-2 py-3 bg-[#1A1A1A] text-[#D4AF37] rounded-xl font-bold text-sm">Capture Photo</button>
                      </div>
                      <canvas ref={canvasRef} className="hidden" />
                  </div>
                ) : (
                  <>
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in">
                            <h3 className="font-bold text-gray-900 text-lg">Basic Info</h3>
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">Date of Birth</label>
                                <input type="date" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white outline-none" onChange={(e) => setData({...data, dob: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">Gender</label>
                                <select className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none" onChange={(e) => setData({...data, gender: e.target.value})}>
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">Residential Address</label>
                                <textarea className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none" rows={2} onChange={(e) => setData({...data, address: e.target.value})} />
                            </div>
                            <button onClick={() => setStep(2)} className="w-full bg-[#1A1A1A] text-[#D4AF37] py-3 rounded-xl font-bold mt-4 shadow-lg">Next: Identity</button>
                        </div>
                    )}
                    
                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in">
                            <h3 className="font-bold text-gray-900 text-lg">Identity Verification</h3>
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">NIN (11 Digits)</label>
                                <input type="text" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none" placeholder="12345678901" onChange={(e) => setData({...data, nin: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">ID Card (Front)</label>
                                <div className="mt-1 flex items-center gap-3">
                                  {data.idCardUrl ? (
                                    <img src={data.idCardUrl} className="w-16 h-16 rounded-lg object-cover border" />
                                  ) : (
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xl">🪪</div>
                                  )}
                                  <button 
                                    onClick={() => startCamera('id')}
                                    className="flex-1 py-3 border-2 border-dashed border-gray-300 rounded-xl text-xs font-bold text-gray-500 hover:border-black hover:text-black transition-colors"
                                  >
                                    {data.idCardUrl ? 'Retake Photo' : 'Open Camera'}
                                  </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">Live Selfie</label>
                                <div className="mt-1 flex items-center gap-3">
                                  {data.selfieUrl ? (
                                    <img src={data.selfieUrl} className="w-16 h-16 rounded-lg object-cover border" />
                                  ) : (
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xl">🤳</div>
                                  )}
                                  <button 
                                    onClick={() => startCamera('selfie')}
                                    className="flex-1 py-3 border-2 border-dashed border-gray-300 rounded-xl text-xs font-bold text-gray-500 hover:border-black hover:text-black transition-colors"
                                  >
                                    {data.selfieUrl ? 'Retake Selfie' : 'Take Selfie'}
                                  </button>
                                </div>
                            </div>
                            <button onClick={() => setStep(3)} className="w-full bg-[#1A1A1A] text-[#D4AF37] py-3 rounded-xl font-bold mt-4 shadow-lg">Next: Preferences</button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in">
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Interests</label>
                                <div className="flex flex-wrap gap-2">
                                    {interestsList.map(int => (
                                        <button 
                                            key={int}
                                            onClick={() => handleInterestToggle(int)}
                                            className={`px-4 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
                                                data.interests.includes(int) ? 'bg-[#1A1A1A] border-[#1A1A1A] text-[#D4AF37]' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                            }`}
                                        >
                                            {int}
                                        </button>
                                    ))}
                                </div>
                            </div>
                             <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">Short Bio (Optional)</label>
                                <textarea className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none" rows={2} onChange={(e) => setData({...data, bio: e.target.value})} />
                            </div>
                            <button onClick={handleSubmit} className="w-full bg-[#009688] text-white py-4 rounded-xl font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all">Complete Setup</button>
                        </div>
                    )}
                  </>
                )}
            </div>
        </div>
    </div>
  );
};
