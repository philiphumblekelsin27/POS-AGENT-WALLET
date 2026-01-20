
import React from 'react';
import { UserRole } from '../types';
import { Home, Wallet, Map as Book, BarChart2 as Markets, User as Profile, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  role: UserRole;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, role }) => {
  const isAdmin = role === UserRole.ADMIN;
  
  const navItems = [
    { id: 'dashboard', icon: <Home size={22} />, label: 'Home' },
    { id: 'wallet', icon: <Wallet size={22} />, label: 'Wallet' },
    { id: 'agents', icon: <Book size={22} />, label: 'Book' }, 
    { id: 'markets', icon: <Markets size={22} />, label: 'Markets' },
    { id: 'profile', icon: <Profile size={22} />, label: 'Profile' },
  ];

  const handleTabClick = (id: string) => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
    onTabChange(id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] pb-24 md:pb-0">
      <main className="flex-1 max-w-md w-full mx-auto bg-[#050505] min-h-screen relative overflow-x-hidden">
        {children}
      </main>

      {/* Admin Quick Entry */}
      {isAdmin && activeTab !== 'admin' && (
        <button 
          onClick={() => onTabChange('admin')}
          className="fixed bottom-24 right-4 z-50 w-12 h-12 bg-[#00F2EA] text-black rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
        >
          <Shield size={24} />
        </button>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#050505]/80 backdrop-blur-2xl border-t border-white/5 z-50 max-w-md mx-auto px-6 h-20">
        <div className="flex justify-between items-center h-full">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`relative flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === item.id ? 'text-[#00F2EA]' : 'text-white/30 hover:text-white/50'
              }`}
            >
              {activeTab === item.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -top-4 w-1 h-1 bg-[#00F2EA] rounded-full shadow-[0_0_10px_#00F2EA]"
                />
              )}
              <div className={`transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'scale-100'}`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
