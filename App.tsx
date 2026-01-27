
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
import { Tasks } from './pages/Tasks';
import { AdminDashboard } from './pages/AdminDashboard';
import { Markets } from './pages/Markets';
import { SupportDashboard } from './pages/SupportDashboard';
import { Profile } from './pages/Profile';
import { OnboardingUser } from './pages/OnboardingUser';
import { OnboardingAgent } from './pages/OnboardingAgent';
import { OnboardingStaff } from './pages/OnboardingStaff';
import { mockStore } from './services/mockStore';
import { UserRole, User, Notification, UserStatus } from './types';
import { ShieldCheck, Cpu } from 'lucide-react';

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewState, setViewState] = useState<'LOGIN' | 'REGISTER' | 'APP'>('LOGIN');
  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    // Neural Initialization Sequence
    const timer = setTimeout(() => {
      setIsInitializing(false);
      const user = mockStore.getCurrentUser();
      if (user) {
        setCurrentUser({...user});
        setIsLoggedIn(true);
        setViewState('APP');
        handleRoleRouting(user);
      }
    }, 2400);

    // Subscribe to Real-time Kernel Stream
    const unsub = mockStore.subscribe((ev) => {
       if (ev.type === 'TRANSACTION_NEW') {
          setNotification({ 
            id: `notif_${Date.now()}`, 
            message: 'Inbound Sync: Node Transaction Completed.', 
            type: 'LIVE', 
            timestamp: new Date().toISOString() 
          });
       }
       if (ev.type === 'SYSTEM_NOTIFICATION') {
          setNotification(ev.payload);
       }
       if (ev.type === 'USER_UPDATE') {
          const freshUser = mockStore.getCurrentUser();
          if (freshUser && freshUser.id === ev.payload.id) {
             setCurrentUser({...ev.payload});
          }
       }
    });

    return () => { clearTimeout(timer); unsub(); };
  }, []);

  const handleRoleRouting = (user: User) => {
    if ([UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(user.role)) setActiveTab('admin');
    else if (user.role === UserRole.SUPPORT) setActiveTab('support');
    else setActiveTab('dashboard');
  };

  const handleLoginSuccess = () => {
    const user = mockStore.getCurrentUser();
    if (user) {
      setCurrentUser({...user});
      setIsLoggedIn(true);
      setViewState('APP');
      handleRoleRouting(user);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-12 text-center overflow-hidden">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative mb-14">
            <div className="w-28 h-28 rounded-[3.5rem] bg-[#3DF2C4] text-black flex items-center justify-center text-6xl shadow-[0_0_50px_rgba(61,242,196,0.2)]">
              <ShieldCheck size={56} strokeWidth={2.5} />
            </div>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} className="absolute -inset-10 border border-[#3DF2C4]/10 rounded-[5rem]" />
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -inset-16 border border-[#3DF2C4]/5 rounded-[6rem]" />
        </motion.div>
        <h1 className="text-white font-black tracking-tighter text-6xl mb-4 italic">PAYNA</h1>
        <div className="flex items-center gap-4 text-[#3DF2C4] text-[11px] font-black uppercase tracking-[0.8em] opacity-60">
          <Cpu size={16} className="animate-pulse" /> Neural Core Boot
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <NotificationToast notification={notification} onClose={() => setNotification(null)} />
      
      {!isLoggedIn || !currentUser ? (
        <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen">
          {viewState === 'REGISTER' ? (
            <Register onRegisterSuccess={handleLoginSuccess} onNavigateToLogin={() => setViewState('LOGIN')} />
          ) : (
            <Login onLoginSuccess={handleLoginSuccess} onNavigateToRegister={() => setViewState('REGISTER')} />
          )}
        </motion.div>
      ) : (
        <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#050505]">
          {currentUser.status === UserStatus.PENDING_SETUP ? (
            [UserRole.SUPPORT, UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(currentUser.role) ? (
              <OnboardingStaff userId={currentUser.id} onComplete={() => setCurrentUser({...mockStore.getCurrentUser()!})} />
            ) : currentUser.role === UserRole.AGENT ? (
              <OnboardingAgent userId={currentUser.id} onComplete={() => setCurrentUser({...mockStore.getCurrentUser()!})} />
            ) : (
              <OnboardingUser userId={currentUser.id} onComplete={() => setCurrentUser({...mockStore.getCurrentUser()!})} />
            )
          ) : (
            <>
              {currentUser.role === UserRole.SUPPORT ? (
                <SupportDashboard />
              ) : [UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(currentUser.role) ? (
                <AdminDashboard />
              ) : (
                <Layout activeTab={activeTab} onTabChange={setActiveTab} role={currentUser.role}>
                  {activeTab === 'dashboard' && <Dashboard user={currentUser} transactions={mockStore.getTransactions('USER')} onNavigate={setActiveTab} />}
                  {activeTab === 'wallet' && <Wallet user={currentUser} onRefresh={() => setCurrentUser({...mockStore.getCurrentUser()!})} />}
                  {activeTab === 'tasks' && <Tasks user={currentUser} />}
                  {activeTab === 'agents' && <Agents agents={mockStore.getAgents()} />}
                  {activeTab === 'profile' && <Profile user={currentUser} onRefresh={() => setCurrentUser({...mockStore.getCurrentUser()!})} />}
                </Layout>
              )}
            </>
          )}
          <AiChatbot />
          <AdBanner />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
