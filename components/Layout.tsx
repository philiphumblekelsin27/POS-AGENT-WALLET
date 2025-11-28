
import React from 'react';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  role: UserRole;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, role }) => {
  const isAdmin = role === UserRole.ADMIN;
  
  // Base navigation for everyone
  const navItems = [
    { id: 'dashboard', icon: '🏠', label: 'Home' },
    { id: 'wallet', icon: '💳', label: 'Wallet' },
    { id: 'agents', icon: '🗺️', label: 'Agents' }, 
  ];

  // Only add Admin tab if user is explicitly an ADMIN
  if (isAdmin) {
    navItems.push({ id: 'admin', icon: '⚡', label: 'Admin' });
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-20 md:pb-0">
      <main className="flex-1 max-w-md w-full mx-auto bg-white min-h-screen shadow-xl relative">
        {children}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 max-w-md mx-auto">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                activeTab === item.id ? 'text-black' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
