
import React from 'react';
import { motion } from 'framer-motion';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <motion.div
    initial={{ opacity: 0.3 }}
    animate={{ opacity: [0.3, 0.6, 0.3] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    className={`bg-white/5 rounded-2xl ${className}`}
  />
);

export const DashboardSkeleton = () => (
  <div className="p-6 space-y-8 max-w-md mx-auto">
    <div className="flex justify-between items-center">
      <div className="flex gap-4">
        <Skeleton className="w-12 h-12 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="w-20 h-2" />
          <Skeleton className="w-32 h-4" />
        </div>
      </div>
      <Skeleton className="w-10 h-10 rounded-full" />
    </div>
    <Skeleton className="w-full h-48 rounded-[2.5rem]" />
    <div className="grid grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => <Skeleton key={i} className="aspect-square rounded-2xl" />)}
    </div>
    <Skeleton className="w-full h-32 rounded-[2.5rem]" />
  </div>
);
