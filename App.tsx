
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from './components/Layout';
import { AdBanner } from './components/AdBanner';
import { AiChatbot } from './components/AiChatbot';
import { NotificationToast } from './components/NotificationToast';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Wallet } from './pages/Wallet';
import { Agents } from './pages/Agents';
import { AdminDashboard } from './pages/AdminDashboard';
import { Markets } from './pages/Markets';
import { SupportDashboard } from './pages/SupportDashboard';
import { Profile } from './pages/Profile';
import { mockStore } from './services/mockStore';
import { UserRole, Transaction, User, Notification } from './types';
import { ShieldCheck, Cpu } from 'lucide-react';

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewState, setViewState] = useState<'LOGIN' | 'REGISTER' | 'APP'>('LOGIN');
  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    // Artificial initialization to simulate kernel loading and crypto-handshake
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  const handleLoginSuccess = () => {
    const user = mockStore.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      setViewState('APP');
      
      // Automatic Role Routing
      if ([UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(user.role)) {
        setActiveTab('admin');
      } else if (user.role === UserRole.SUPPORT) {
        setActiveTab('support');
      } else {
        setActiveTab('dashboard');
      }
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-12 text-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          transition={{ duration: 0.8 }} 
          className="relative mb-12"
        >
            <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-[#10B981] to-[#5D5FEF] text-black flex items-center justify-center text-5xl shadow-[0_0_80px_rgba(16,185,129,0.3)]">
              <ShieldCheck strokeWidth={2.5} size={50} />
            </div>
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }} 
              className="absolute -inset-6 border border-[#10B981]/20 rounded-[3rem]" 
            />
        </motion.div>
        <h1 className="text-white font-black tracking-tighter text-4xl mb-2">PAYNA</h1>
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-3 text-[#10B981] text-[10px] font-black uppercase tracking-[0.5em]">
            <Cpu size={14} /> Synchronizing Neural Node
          </div>
          <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden relative">
            <motion.div 
              initial={{ left: '-100%' }} 
              animate={{ left: '100%' }} 
              transition={{ duration: 2, repeat: Infinity }} 
              className="absolute top-0 bottom-0 w-1/2 bg-[#10B981]" 
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!isLoggedIn || !currentUser ? (
        <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen relative">
          {viewState === 'REGISTER' ? (
            <Register 
              onRegisterSuccess={handleLoginSuccess} 
              onNavigateToLogin={() => setViewState('LOGIN')} 
            />
          ) : (
            <Login 
              onLoginSuccess={handleLoginSuccess} 
              onNavigateToRegister={() => setViewState('REGISTER')} 
            />
          )}
        </motion.div>
      ) : (
        <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#050505]">
          {currentUser.role === UserRole.SUPPORT ? (
            <SupportDashboard />
          ) : [UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(currentUser.role) ? (
            <AdminDashboard />
          ) : (
            <Layout activeTab={activeTab} onTabChange={setActiveTab} role={currentUser.role}>
              {activeTab === 'dashboard' && (
                <Dashboard 
                  user={currentUser} 
                  transactions={mockStore.getTransactions('USER')} 
                  onNavigate={setActiveTab} 
                />
              )}
              {activeTab === 'wallet' && (
                <Wallet 
                  user={currentUser} 
                  onAddTransaction={(tx) => mockStore.requestTransaction(tx)} 
                />
              )}
              {activeTab === 'agents' && <Agents agents={mockStore.getAgents()} />}
              {activeTab === 'markets' && <Markets />}
              {activeTab === 'profile' && (
                <Profile 
                  user={currentUser} 
                  onRefresh={() => setCurrentUser(mockStore.getCurrentUser())}
                />
              )}
            </Layout>
          )}
          <AiChatbot />
          <AdBanner />
          <NotificationToast notification={notification} onClose={() => setNotification(null)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
