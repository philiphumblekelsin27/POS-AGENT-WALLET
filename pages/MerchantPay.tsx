
import React, { useState, useRef, useEffect } from 'react';
import { Transaction } from '../types';

interface MerchantPayProps {
  onPayment: (amount: number, merchantId: string) => void;
}

export const MerchantPay: React.FC<MerchantPayProps> = ({ onPayment }) => {
  const [merchantId, setMerchantId] = useState('');
  const [amount, setAmount] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const startScanner = async () => {
    setIsScanning(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Unable to access camera. Please check permissions.");
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => stopScanner();
  }, []);

  const handleSubmit = () => {
    if (merchantId && amount) {
        onPayment(parseFloat(amount), merchantId);
    }
  };

  return (
    <div className="p-6 pb-24 h-full overflow-y-auto no-scrollbar">
      <h2 className="text-2xl font-bold mb-6 text-[#1A1A1A]">Pay Merchant</h2>
      
      <div className="bg-gray-900 text-white rounded-2xl mb-8 relative overflow-hidden aspect-video flex items-center justify-center border-2 border-dashed border-gray-700">
        {!isScanning ? (
          <div className="relative z-10 text-center p-6">
              <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <span className="text-3xl">📷</span>
              </div>
              <p className="font-bold mb-1">Scan QR Code</p>
              <p className="text-xs text-gray-400 mb-4">Align code within frame to pay instantly</p>
              <button 
                onClick={startScanner}
                className="bg-[#D4AF37] text-[#1A1A1A] px-6 py-2 rounded-lg font-black text-xs uppercase shadow-lg active:scale-95 transition-all"
              >
                Start Camera
              </button>
              {cameraError && <p className="text-red-400 text-[10px] mt-2 font-bold">{cameraError}</p>}
          </div>
        ) : (
          <div className="relative w-full h-full">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            {/* Scanner Overlay */}
            <div className="absolute inset-0 border-[40px] border-black/50 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-[#D4AF37] relative">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-[#D4AF37] animate-[scan_2s_linear_infinite]"></div>
                </div>
            </div>
            <button 
              onClick={stopScanner}
              className="absolute bottom-4 right-4 bg-red-600 text-white p-2 rounded-full shadow-lg"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="h-px bg-gray-200 flex-1"></div>
        <span className="text-xs text-gray-400 font-bold uppercase">Or Enter Manually</span>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      <div className="space-y-4">
        <div>
           <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Merchant ID / Wallet</label>
           <input 
              type="text" 
              value={merchantId}
              onChange={(e) => setMerchantId(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] font-mono text-sm"
              placeholder="0000-00-0000"
           />
        </div>

        <div>
           <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Amount (₦)</label>
           <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] font-bold text-lg"
              placeholder="0.00"
           />
        </div>

        <button 
           onClick={handleSubmit}
           disabled={!amount || !merchantId}
           className="w-full bg-[#1A1A1A] text-[#D4AF37] py-4 rounded-xl font-bold shadow-lg disabled:opacity-50 mt-4 active:scale-[0.98] transition-all"
        >
           Pay Now
        </button>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
};
