
import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform, animate } from 'framer-motion';

interface OdometerProps {
  value: number;
  precision?: number;
  prefix?: string;
  className?: string;
}

export const Odometer: React.FC<OdometerProps> = ({ value, precision = 2, prefix = '', className = '' }) => {
  const spring = useSpring(value, { stiffness: 40, damping: 15 });
  const display = useTransform(spring, (latest) => 
    latest.toLocaleString(undefined, { 
      minimumFractionDigits: precision, 
      maximumFractionDigits: precision 
    })
  );

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return (
    <div className={`flex items-baseline ${className}`}>
      {prefix && <span className="mr-1">{prefix}</span>}
      <motion.span>{display}</motion.span>
    </div>
  );
};
