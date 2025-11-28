
import React, { useState, useEffect } from 'react';
import { User, Transaction, TransactionType, Agent, UserRole, ServiceRequest, ServiceRequestStatus, TransactionStatus } from '../types';
import { mockStore } from '../services/mockStore';
import { GoogleAd } from '../components/GoogleAd';
import { Modal } from '../components/Modal';

interface DashboardProps {
  user: User | Agent;
  transactions: Transaction[];
  onNavigate: (page: string, params?: any) => void;
  onRefresh?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, transactions, onNavigate, onRefresh }) => {
  const isAgent = user.role === UserRole.AGENT;
  const isMerchant = user.role === UserRole.MERCHANT;
  const [showBalance, setShowBalance] = useState(true);
  
  // Agent specific state
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [agentTab, setAgentTab] = useState<'REQUESTS' | 'JOBS' | 'PROFILE'>('REQUESTS');
  const [editProfileData, setEditProfileData] = useState<Partial<Agent>>({});
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // User Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userSettings, setUserSettings] = useState({ name: user.name, email: user.email, phone: user.phone || '', bio: user.bio || '' });

  useEffect(() => {
    if (isAgent) {
      setRequests(mockStore.getServiceRequests(user.id));
    }
  }, [user.id, isAgent, user.balance]); 

  const handleRequestAction = (reqId: string, status: ServiceRequestStatus) => {
    mockStore.respondToServiceRequest(reqId, status);
    setRequests(mockStore.getServiceRequests(user.id));
    if (onRefresh) onRefresh();
  };

  const handleCompleteJob = (reqId: string) => {
      mockStore.completeServiceRequest(reqId);
      setRequests(mockStore.getServiceRequests(user.id));
      alert("Job Completed! Commission added to wallet.");
      if (onRefresh) onRefresh();
  };

  const handleToggleOnline = () => {
      mockStore.toggleAgentOnlineStatus(user.id);
      if (onRefresh) onRefresh();
  };

  const handleSaveProfile = () => {
      mockStore.updateAgentProfile(user.id, editProfileData);
      setIsEditingProfile(false);
      if (onRefresh) onRefresh();
      alert("Profile updated successfully!");
  };

  const handleSaveUserSettings = () => {
      mockStore.updateUserProfile(user.id, userSettings);
      setIsSettingsOpen(false);
      if (onRefresh) onRefresh();
      alert("Account details updated.");
  };
  
  const handleDeleteAccount = () => {
      if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
          mockStore.deleteUser(user.id);
          alert("Account deleted.");
          window.location.reload(); 
      }
  };

  // Filter requests for tabs
  const pendingRequests = requests.filter(r => r.status === ServiceRequestStatus.PENDING);
  const activeJobs = requests.filter(r => r.status === ServiceRequestStatus.ACCEPTED);
  const completedJobs = requests.filter(r => r.status === ServiceRequestStatus.COMPLETED);
  const agentUser = user as Agent;

  return (
    <div className="p-6 space-y-6 pb-24">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-sm text-gray-500 font-medium">Welcome back,</h2>
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <div className="flex gap-2 mt-1">
             {isAgent && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold tracking-wide uppercase">Agent</span>}
             {isMerchant && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold tracking-wide uppercase">Merchant</span>}
             <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">Tier {user.kycLevel}</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
            <button onClick={() => setIsSettingsOpen(true)} className="relative group">
                <img src={user.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                <span className="absolute -bottom-1 -right-1 bg-gray-200 rounded-full p-0.5 text-[8px] border border-white">⚙️</span>
            </button>
            
            {isAgent && (
                <button 
                    onClick={handleToggleOnline}
                    className={`text-[10px] px-3 py-1 rounded-full font-bold transition-all shadow-sm ${
                        agentUser.isOnline 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}
                >
                    {agentUser.isOnline ? '● Online' : '○ Offline'}
                </button>
            )}
        </div>
      </header>

      {/* AGENT DASHBOARD VIEW */}
      {isAgent ? (
          <div className="space-y-6">
              {/* Agent Stats Card */}
              <div className="bg-[#003366] text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
                   <div className="relative z-10">
                       <p className="text-blue-200 text-sm font-medium mb-1">Total Earnings</p>
                       <h2 className="text-3xl font-bold mb-4">₦ {agentUser.balance.toLocaleString()}</h2>
                       
                       <div className="flex gap-4">
                           <div>
                               <p className="text-[10px] text-blue-300 uppercase tracking-wider">Commission</p>
                               <p className="font-bold text-lg">₦ {agentUser.totalCommission.toLocaleString()}</p>
                           </div>
                           <div>
                               <p className="text-[10px] text-blue-300 uppercase tracking-wider">Jobs Done</p>
                               <p className="font-bold text-lg">{agentUser.completedJobs}</p>
                           </div>
                           <div>
                               <p className="text-[10px] text-blue-300 uppercase tracking-wider">Rating</p>
                               <p className="font-bold text-lg text-[#FFC300]">⭐ {agentUser.rating}</p>
                           </div>
                       </div>
                   </div>
                   <button 
                        onClick={() => onNavigate('wallet', { tab: 'withdraw' })}
                        className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 p-2 rounded-lg text-xs font-bold backdrop-blur-sm transition-colors"
                   >
                       Withdraw
                   </button>
              </div>

              {/* Agent Tabs */}
              <div className="flex bg-gray-100 p-1 rounded-xl">
                  {['REQUESTS', 'JOBS', 'PROFILE'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setAgentTab(tab as any)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                            agentTab === tab ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                          {tab === 'REQUESTS' && pendingRequests.length > 0 ? `${tab} (${pendingRequests.length})` : tab}
                      </button>
                  ))}
              </div>

              {/* Requests Tab */}
              {agentTab === 'REQUESTS' && (
                  <div className="space-y-3 animate-in fade-in">
                      {pendingRequests.length === 0 && (
                          <div className="text-center py-8 text-gray-400">
                              <p>No new requests.</p>
                              <p className="text-xs">Stay online to receive jobs.</p>
                          </div>
                      )}
                      {pendingRequests.map(req => (
                          <div key={req.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                              <div className="flex justify-between items-start mb-2">
                                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold">{req.serviceType}</span>
                                  <span className="text-[10px] text-gray-400">{new Date(req.date).toLocaleTimeString()}</span>
                              </div>
                              <p className="font-bold text-gray-900 mb-4">{req.userName} is requesting service.</p>
                              <div className="flex gap-2">
                                  <button onClick={() => handleRequestAction(req.id, ServiceRequestStatus.REJECTED)} className="flex-1 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50">Decline</button>
                                  <button onClick={() => handleRequestAction(req.id, ServiceRequestStatus.ACCEPTED)} className="flex-1 py-2 bg-black text-white rounded-lg text-xs font-bold hover:bg-gray-800">Accept Job</button>
                              </div>
                          </div>
                      ))}
                  </div>
              )}

              {/* Jobs Tab */}
              {agentTab === 'JOBS' && (
                  <div className="space-y-3 animate-in fade-in">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Jobs</h3>
                      {activeJobs.length === 0 && <p className="text-xs text-gray-400 italic">No active jobs.</p>}
                      {activeJobs.map(job => (
                          <div key={job.id} className="bg-green-50 p-4 rounded-xl border border-green-100">
                              <p className="font-bold text-green-900 mb-2">Active: {job.serviceType}</p>
                              <p className="text-xs text-green-700 mb-4">Client: {job.userName}</p>
                              <button onClick={() => handleCompleteJob(job.id)} className="w-full py-3 bg-green-600 text-white rounded-lg font-bold text-sm shadow">Mark Completed</button>
                          </div>
                      ))}

                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-6">History</h3>
                      {completedJobs.slice(0, 5).map(job => (
                          <div key={job.id} className="bg-white p-3 rounded-xl border border-gray-100 flex justify-between opacity-75">
                              <div>
                                  <p className="font-bold text-sm">{job.serviceType}</p>
                                  <p className="text-[10px] text-gray-500">{new Date(job.date).toLocaleDateString()}</p>
                              </div>
                              <span className="text-xs font-bold text-green-600">Completed</span>
                          </div>
                      ))}
                  </div>
              )}

              {/* Profile Tab */}
              {agentTab === 'PROFILE' && (
                  <div className="space-y-4 animate-in fade-in">
                      {!isEditingProfile ? (
                          <div className="bg-white p-4 rounded-xl border border-gray-200">
                              <div className="flex justify-between items-start mb-4">
                                  <div>
                                      <h3 className="font-bold text-lg">{agentUser.businessName}</h3>
                                      <p className="text-sm text-gray-500">{agentUser.category}</p>
                                  </div>
                                  <button onClick={() => { setEditProfileData(agentUser); setIsEditingProfile(true); }} className="text-blue-600 text-xs font-bold">Edit</button>
                              </div>
                              <div className="space-y-2 text-sm text-gray-600">
                                  <p><strong>Hours:</strong> {agentUser.workingHours}</p>
                                  <p><strong>Bio:</strong> {agentUser.description}</p>
                                  <p><strong>Subcategories:</strong> {agentUser.subcategories.join(', ')}</p>
                              </div>
                          </div>
                      ) : (
                          <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                              <h3 className="font-bold text-sm">Edit Business Profile</h3>
                              <div>
                                  <label className="text-xs font-bold text-gray-500">Business Name</label>
                                  <input type="text" className="w-full border p-2 rounded text-sm" value={editProfileData.businessName || ''} onChange={e => setEditProfileData({...editProfileData, businessName: e.target.value})} />
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-gray-500">Working Hours</label>
                                  <input type="text" className="w-full border p-2 rounded text-sm" value={editProfileData.workingHours || ''} onChange={e => setEditProfileData({...editProfileData, workingHours: e.target.value})} />
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-gray-500">Description</label>
                                  <textarea className="w-full border p-2 rounded text-sm" rows={2} value={editProfileData.description || ''} onChange={e => setEditProfileData({...editProfileData, description: e.target.value})} />
                              </div>
                              <div className="flex gap-2 mt-2">
                                  <button onClick={() => setIsEditingProfile(false)} className="flex-1 py-2 bg-gray-100 text-gray-600 rounded font-bold text-xs">Cancel</button>
                                  <button onClick={handleSaveProfile} className="flex-1 py-2 bg-black text-white rounded font-bold text-xs">Save Changes</button>
                              </div>
                          </div>
                      )}
                  </div>
              )}
          </div>
      ) : (
      /* STANDARD USER DASHBOARD VIEW */
      <div className="space-y-6">
          {/* Wallet Card */}
          <div className="bg-[#003366] p-6 rounded-2xl shadow-xl text-white relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
              <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                      <div>
                          <p className="text-blue-200 text-sm font-medium mb-1">Total Balance</p>
                          <div className="flex items-baseline gap-2">
                              <h2 className="text-3xl font-bold tracking-tight">
                                  {showBalance ? `₦ ${user.balance.toLocaleString()}` : '••••••••'}
                              </h2>
                              <button 
                                onClick={() => setShowBalance(!showBalance)} 
                                className="text-blue-300 hover:text-white transition-colors"
                              >
                                  {showBalance ? '👁️' : '🙈'}
                              </button>
                          </div>
                      </div>
                      <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                          <span className="text-2xl">💳</span>
                      </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs text-blue-200">Wallet ID:</span>
                      <span className="font-mono text-sm bg-white/10 px-2 py-0.5 rounded text-white">{user.accountNumber}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-blue-200">
                     <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                     Live Updates
                  </div>
              </div>
              
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-blue-500/20 rounded-full blur-xl"></div>
          </div>

          <GoogleAd slotId="1234567890" />

          {/* Quick Actions Grid */}
          <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-4 gap-4">
                  {[
                      { icon: '💸', label: 'Transfer', action: () => onNavigate('wallet', { tab: 'transfer' }) },
                      { icon: '📥', label: 'Top Up', action: () => onNavigate('wallet', { tab: 'topup' }) },
                      { icon: '🏪', label: 'Agents', action: () => onNavigate('agents') },
                      { icon: '💰', label: 'Loans', action: () => onNavigate('loans') },
                      { icon: '🛍️', label: 'Pay', action: () => onNavigate('merchant') },
                      { icon: '⭐', label: 'Upgrade', action: () => onNavigate('upgrade') },
                      { icon: '⚙️', label: 'Settings', action: () => setIsSettingsOpen(true) },
                      { icon: '🆘', label: 'Support', action: () => onNavigate('support-chat') },
                  ].map((item) => (
                      <button 
                        key={item.label}
                        onClick={item.action}
                        className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 active:scale-95 transition-all"
                      >
                          <span className="text-xl mb-1 filter drop-shadow-sm">{item.icon}</span>
                          <span className="text-[10px] font-bold text-gray-700">{item.label}</span>
                      </button>
                  ))}
              </div>
          </div>

          {/* Recent Transactions */}
          <div>
              <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-gray-900">Recent Activity</h3>
                  <button onClick={() => onNavigate('wallet')} className="text-xs text-[#003366] font-bold hover:underline">See All</button>
              </div>
              <div className="space-y-3">
                  {transactions.slice(0, 5).map((tx) => (
                      <div 
                        key={tx.id} 
                        className={`bg-white p-4 rounded-xl border flex justify-between items-center transition-all ${
                            tx.status === TransactionStatus.PENDING 
                            ? 'border-l-4 border-l-[#FFC300] bg-yellow-50/30' 
                            : 'border-gray-100 shadow-sm'
                        }`}
                      >
                          <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                                  tx.type === TransactionType.DEPOSIT ? 'bg-green-100 text-green-700' : 
                                  tx.type === TransactionType.WITHDRAWAL ? 'bg-red-100 text-red-700' : 
                                  'bg-blue-100 text-blue-700'
                              }`}>
                                  {tx.type === TransactionType.DEPOSIT ? '↓' : tx.type === TransactionType.WITHDRAWAL ? '↑' : '↔'}
                              </div>
                              <div>
                                  <p className="font-bold text-sm text-gray-900">{tx.description}</p>
                                  <div className="flex items-center gap-2">
                                      <p className="text-[10px] text-gray-400">{new Date(tx.date).toLocaleDateString()}</p>
                                      {tx.status === TransactionStatus.PENDING && (
                                          <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 rounded font-bold flex items-center gap-1">
                                              <span>⏳</span> Pending
                                          </span>
                                      )}
                                      {tx.status === TransactionStatus.FAILED && (
                                          <span className="text-[10px] bg-red-100 text-red-800 px-1.5 rounded font-bold">Failed</span>
                                      )}
                                  </div>
                              </div>
                          </div>
                          <span className={`font-bold ${
                              tx.type === TransactionType.DEPOSIT ? 'text-green-600' : 'text-gray-900'
                          }`}>
                              {tx.type === TransactionType.DEPOSIT ? '+' : '-'}₦{tx.amount.toLocaleString()}
                          </span>
                      </div>
                  ))}
                  {transactions.length === 0 && (
                      <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                          <p className="text-gray-400 text-sm">No recent transactions.</p>
                      </div>
                  )}
              </div>
          </div>
      </div>
      )}

      {/* Settings Modal */}
      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Account Settings">
          <div className="space-y-4">
              <div className="text-center mb-6">
                  <img src={user.avatarUrl} className="w-20 h-20 rounded-full mx-auto mb-2 border-4 border-white shadow-md" alt="Profile" />
                  <p className="text-xs text-blue-600 font-bold">Change Avatar (Simulated)</p>
              </div>

              <div>
                  <label className="text-xs font-bold text-gray-500">Full Name</label>
                  <input type="text" className="w-full border border-gray-300 p-3 rounded-lg text-sm" 
                    value={userSettings.name} onChange={e => setUserSettings({...userSettings, name: e.target.value})} />
              </div>
              
              <div>
                  <label className="text-xs font-bold text-gray-500">Email Address</label>
                  <input type="email" className="w-full border border-gray-300 p-3 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed" 
                    value={userSettings.email} disabled />
              </div>

              <div>
                  <label className="text-xs font-bold text-gray-500">Phone Number</label>
                  <input type="tel" className="w-full border border-gray-300 p-3 rounded-lg text-sm" 
                    value={userSettings.phone} onChange={e => setUserSettings({...userSettings, phone: e.target.value})} />
              </div>

              <div>
                  <label className="text-xs font-bold text-gray-500">Bio / Description</label>
                  <textarea className="w-full border border-gray-300 p-3 rounded-lg text-sm" rows={2}
                    value={userSettings.bio} onChange={e => setUserSettings({...userSettings, bio: e.target.value})} />
              </div>

              <button onClick={handleSaveUserSettings} className="w-full bg-black text-white py-3 rounded-xl font-bold mt-2">
                  Save Changes
              </button>

              <div className="border-t pt-4 mt-4">
                  <h4 className="text-red-600 font-bold text-sm mb-2">Danger Zone</h4>
                  <button onClick={handleDeleteAccount} className="w-full border border-red-200 text-red-600 bg-red-50 py-3 rounded-xl font-bold hover:bg-red-100 transition-colors">
                      Delete Account
                  </button>
              </div>
          </div>
      </Modal>
    </div>
  );
};
