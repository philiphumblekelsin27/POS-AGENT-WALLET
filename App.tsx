

import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { AdBanner } from './components/AdBanner';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { OnboardingUser } from './pages/OnboardingUser';
import { OnboardingAgent } from './pages/OnboardingAgent';
import { Dashboard } from './pages/Dashboard';
import { Wallet } from './pages/Wallet';
import { Agents } from './pages/Agents';
import { AdminDashboard } from './pages/AdminDashboard';
import { SupportDashboard } from './pages/SupportDashboard';
import { UserSupportChat } from './pages/UserSupportChat';
import { Loans } from './pages/Loans';
import { Upgrade } from './pages/Upgrade';
import { MerchantPay } from './pages/MerchantPay';
import { mockStore } from './services/mockStore';
import { UserRole, Transaction, TransactionStatus, LoanTier, TransactionType, UserStatus, User } from './types';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(mockStore.getCurrentUser());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewState, setViewState] = useState<'LOGIN' | 'REGISTER' | 'APP'>('LOGIN');
  
  const [walletInitialTab, setWalletInitialTab] = useState<'topup' | 'withdraw' | 'transfer'>('topup');

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [agents, setAgents] = useState(mockStore.getAgents());
  const [allUsers, setAllUsers] = useState<User[]>([]); 

  const refreshData = () => {
    const user = mockStore.getCurrentUser();
    setCurrentUser(user ? { ...user } : null);
    setTransactions([...mockStore.getTransactions()]);
    setAgents(mockStore.getAgents());
    setAllUsers(mockStore.getAllUsers()); 
  };

  useEffect(() => {
      if (isLoggedIn) refreshData();
  }, [isLoggedIn, activeTab]);

  useEffect(() => {
    if (activeTab === 'admin' && currentUser && currentUser.role !== UserRole.ADMIN) {
      setActiveTab('dashboard');
    }
  }, [activeTab, currentUser]);

  const handleLoginSuccess = () => {
    const user = mockStore.getCurrentUser();
    // Check if user exists before proceeding
    if (user) {
        if (user.role === UserRole.SUPPORT) {
            setIsLoggedIn(true);
            setViewState('APP');
            return;
        }
        
        setIsLoggedIn(true);
        setViewState('APP');
        if (user.role === UserRole.ADMIN) setActiveTab('admin');
        else setActiveTab('dashboard');
        refreshData();
    }
  };

  const handleLogout = () => {
      mockStore.logout();
      setIsLoggedIn(false);
      setViewState('LOGIN');
      setCurrentUser(null);
  };

  const handleNavigate = (page: string, params?: any) => {
      if (page === 'wallet' && params?.tab) {
          setWalletInitialTab(params.tab);
      } else {
          setWalletInitialTab('topup'); 
      }
      setActiveTab(page);
  };

  const handleAddTransaction = (tx: Transaction) => {
    const result = mockStore.requestTransaction(tx);
    if (result.success) {
        if (tx.status === TransactionStatus.COMPLETED) {
            alert("Transaction Successful!");
        } else {
            alert("Request Submitted Successfully.");
        }
        refreshData();
    } else {
        alert(result.message || "Transaction failed");
    }
  };

  const handleUpdateStatus = (id: string, status: TransactionStatus) => {
    mockStore.updateTransactionStatus(id, status);
    refreshData();
  };
  
  const handleRequestLoan = (amount: number, tier: LoanTier) => {
      if (!currentUser) return;
      const result = mockStore.requestLoan(currentUser.id, amount, tier);
      alert(result.message);
      refreshData();
  };

  const handleUpgrade = () => {
      if (!currentUser) return;
      mockStore.upgradeUserTier(currentUser.id);
      alert("Upgrade request approved! Limits increased.");
      refreshData();
  };

  const handleMerchantPay = (amount: number, merchantId: string) => {
      if (!currentUser) return;
      const tx: Transaction = {
          id: `pay_${Date.now()}`,
          userId: currentUser.id,
          type: TransactionType.PAYMENT,
          amount,
          date: new Date().toISOString(),
          status: TransactionStatus.COMPLETED,
          description: `Payment to ${merchantId}`
      };
      const result = mockStore.requestTransaction(tx);
      if (result.success) alert("Payment Successful");
      else alert(result.message);
      refreshData();
  };

  // --- Render Logic ---

  if (!isLoggedIn) {
      if (viewState === 'REGISTER') {
          return (
            <>
                <Register 
                    onRegisterSuccess={() => setViewState('LOGIN')} 
                    onNavigateToLogin={() => setViewState('LOGIN')} 
                />
                <AdBanner />
            </>
          );
      }
      return (
        <>
            <Login 
                onLoginSuccess={handleLoginSuccess} 
                onNavigateToRegister={() => setViewState('REGISTER')} 
            />
            <AdBanner />
        </>
      );
  }

  // SAFEGUARD: If logged in but user state is missing, show loader
  if (!currentUser) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      );
  }

  if (currentUser.role === UserRole.SUPPORT) {
      return <SupportDashboard onLogout={handleLogout} />;
  }

  if (activeTab === 'support-chat') {
      return <UserSupportChat user={currentUser} onBack={() => setActiveTab('dashboard')} />;
  }

  if (currentUser.status === UserStatus.PENDING_SETUP) {
      if (currentUser.role === UserRole.AGENT) {
          return <OnboardingAgent userId={currentUser.id} onComplete={() => refreshData()} />;
      }
      return <OnboardingUser userId={currentUser.id} onComplete={() => refreshData()} />;
  }

  if (currentUser.status === UserStatus.PENDING_APPROVAL) {
      return (
          <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-3xl mb-4">
                  ⏳
              </div>
              <h2 className="text-2xl font-bold mb-2">Verification Pending</h2>
              <p className="text-gray-500 max-w-xs mb-8">
                  Thanks for submitting your documents. An admin will review your agent application shortly.
              </p>
              <button onClick={handleLogout} className="text-gray-400 text-sm underline">Log Out</button>
          </div>
      );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
            <>
             <Dashboard 
                user={currentUser} 
                transactions={transactions} 
                onNavigate={handleNavigate}
                onRefresh={refreshData}
            />
            <div className="fixed bottom-20 left-4 z-40">
                <button 
                  onClick={() => setActiveTab('support-chat')}
                  className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center w-12 h-12"
                >
                  💬
                </button>
            </div>
            </>
        );
      case 'wallet':
        return <Wallet user={currentUser} onAddTransaction={handleAddTransaction} initialTab={walletInitialTab} />;
      case 'agents':
        return <Agents agents={agents} />;
      case 'loans':
        return <Loans user={currentUser} loans={mockStore.getLoans(currentUser.id)} onRequestLoan={handleRequestLoan} />;
      case 'upgrade':
        return <Upgrade user={currentUser} onUpgrade={handleUpgrade} />;
      case 'merchant':
        return <MerchantPay onPayment={handleMerchantPay} />;
      case 'admin':
        return currentUser.role === UserRole.ADMIN ? (
          <AdminDashboard 
            transactions={mockStore.getTransactions('ALL')} 
            users={allUsers} 
            onUpdateStatus={handleUpdateStatus} 
          />
        ) : null;
      default:
        return <Dashboard user={currentUser} transactions={transactions} onNavigate={handleNavigate} onRefresh={refreshData} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={(tab) => handleNavigate(tab)} role={currentUser.role}>
      {renderContent()}
      <AdBanner />
    </Layout>
  );
}

export default App;