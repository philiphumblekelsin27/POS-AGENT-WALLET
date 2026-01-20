
import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';

interface SlideToConfirmProps {
  onConfirm: () => void;
  label?: string;
  successLabel?: string;
}

export const SlideToConfirm: React.FC<SlideToConfirmProps> = ({ 
  onConfirm, 
  label = "Slide to Confirm Payment", 
  successLabel = "Processing..." 
}) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const controls = useAnimation();
  
  // Dynamic background color as user slides
  const background = useTransform(
    x,
    [0, 240],
    ["rgba(255, 255, 255, 0.05)", "rgba(0, 242, 234, 0.2)"]
  );

  const handleDragEnd = async () => {
    const containerWidth = containerRef.current?.offsetWidth || 0;
    const threshold = containerWidth * 0.75;

    if (x.get() > threshold) {
      setIsConfirmed(true);
      await controls.start({ x: containerWidth - 64 });
      if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(50);
      onConfirm();
    } else {
      controls.start({ x: 0 });
    }
  };

  return (
    <motion.div 
      ref={containerRef}
      style={{ background }}
      className="relative w-full h-16 rounded-2xl overflow-hidden border border-white/10 flex items-center p-1"
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
          {isConfirmed ? successLabel : label}
        </span>
      </div>

      {!isConfirmed && (
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 280 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          animate={controls}
          style={{ x }}
          className="z-10 w-14 h-14 bg-[#00F2EA] rounded-xl flex items-center justify-center text-black cursor-grab active:cursor-grabbing shadow-[0_0_20px_rgba(0,242,234,0.4)]"
        >
          <ChevronRight size={24} strokeWidth={3} />
        </motion.div>
      )}

      {isConfirmed && (
        <div className="z-10 w-14 h-14 bg-[#00F2EA] rounded-xl flex items-center justify-center text-black absolute right-1">
          <Check size={24} strokeWidth={3} className="animate-bounce" />
        </div>
      )}
    </motion.div>
  );
};
