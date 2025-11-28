

import { User, UserRole, Transaction, TransactionType, TransactionStatus, Agent, KycLimits, Loan, LoanStatus, LoanTier, ServiceRequest, ServiceRequestStatus, Ad, UserStatus, KycData, SystemSettings, ChatSession, ChatMessage, AuditLog, AgentCategory, VerificationStatus } from '../types';
import { generateAccountNumber } from '../utils/accountGenerator';
import { SecureStorage } from '../utils/storage';

// Constants
const CURRENT_USER_ID = 'user_123';

const KYC_TIERS: Record<number, { daily: number; weekly: number }> = {
  1: { daily: 50000, weekly: 200000 },
  2: { daily: 200000, weekly: 1000000 },
  3: { daily: 5000000, weekly: 20000000 },
};

const generateAgentNumber = (category: AgentCategory): string => {
    const prefixMap: Record<string, string> = {
        [AgentCategory.POS]: 'POS',
        [AgentCategory.DRIVER]: 'DRI',
        [AgentCategory.HOTEL]: 'HTL',
        [AgentCategory.DELIVERY]: 'DEL',
        [AgentCategory.HAIRDRESSER]: 'STY',
        [AgentCategory.MERCHANT]: 'MER',
        [AgentCategory.HEALTH]: 'MED',
        [AgentCategory.EDUCATION]: 'EDU'
    };
    const prefix = prefixMap[category] || 'GEN';
    const random = Math.floor(10000 + Math.random() * 90000);
    return `AN-${prefix}-${random}`;
};

// Initial Data (Fallback)
const DEFAULT_USERS: Record<string, User> = {
  [CURRENT_USER_ID]: {
    id: CURRENT_USER_ID,
    username: 'johndoe',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password',
    accountNumber: '8123-45-6789', 
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    balance: 15400.00,
    kycLevel: 2,
    avatarUrl: 'https://ui-avatars.com/api/?name=John+Doe&background=random',
    location: { lat: 6.5244, lng: 3.3792 },
    limits: { dailyLimit: 200000, weeklyLimit: 1000000, dailyUsed: 0, weeklyUsed: 0 },
    verificationStatus: VerificationStatus.VERIFIED,
    createdAt: new Date().toISOString()
  },
  'admin_1': {
    id: 'admin_1',
    username: 'admin',
    name: 'System Admin',
    email: 'admin@poswallet.com',
    password: 'password',
    accountNumber: '9000-00-0001',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    balance: 0,
    kycLevel: 3,
    limits: { dailyLimit: 999999999, weeklyLimit: 999999999, dailyUsed: 0, weeklyUsed: 0 },
    verificationStatus: VerificationStatus.VERIFIED,
    createdAt: new Date().toISOString()
  },
  'support_1': {
    id: 'support_1',
    username: 'support',
    name: 'Customer Service',
    email: 'help@poswallet.com',
    password: 'password',
    accountNumber: '9111-11-1111',
    role: UserRole.SUPPORT,
    status: UserStatus.ACTIVE,
    balance: 0,
    kycLevel: 3,
    limits: { dailyLimit: 0, weeklyLimit: 0, dailyUsed: 0, weeklyUsed: 0 },
    verificationStatus: VerificationStatus.VERIFIED,
    createdAt: new Date().toISOString()
  },
  'agent_1': {
    id: 'agent_1',
    username: 'sarahpos',
    name: 'Sarah POS',
    email: 'sarah@agent.com',
    password: 'password',
    accountNumber: '8155-27-0034',
    role: UserRole.AGENT,
    status: UserStatus.ACTIVE,
    balance: 50000,
    kycLevel: 2,
    avatarUrl: 'https://ui-avatars.com/api/?name=Sarah+POS&background=random',
    limits: { dailyLimit: 200000, weeklyLimit: 1000000, dailyUsed: 0, weeklyUsed: 0 },
    
    // Agent Fields
    agentNumber: 'AN-POS-1001',
    businessName: "Sarah's Quick Cash",
    category: AgentCategory.POS,
    subcategories: ['Withdrawal', 'Deposit'],
    description: "Reliable POS service in Ikeja.",
    rating: 4.8,
    ratingCount: 120,
    isOnline: true,
    services: ['Cash Withdrawal', 'Transfer', 'Bill Payment'],
    location: { lat: 6.5250, lng: 3.3795 },
    totalCommission: 12500,
    completedJobs: 45,
    workingHours: "8AM - 8PM",
    verificationStatus: VerificationStatus.VERIFIED,
    createdAt: new Date().toISOString(),
    posDetails: {
        shopAddress: "12 Market Street, Ikeja",
        cashCapacity: 500000
    }
  } as Agent
};

const DEFAULT_SETTINGS: SystemSettings = {
    bankAccounts: [
        { id: 'ba_1', bankName: 'GTBank', accountNumber: '0123456789', accountName: 'POS Wallet Inc' },
        { id: 'ba_2', bankName: 'Zenith Bank', accountNumber: '2233445566', accountName: 'POS Wallet Ops' }
    ],
    supportEmail: 'help@poswallet.com',
    supportPhone: '+234 800 000 0000'
};

class MockStore {
  private users: Record<string, User>;
  private transactions: Transaction[];
  private currentUser: User | null = null;
  private systemSettings: SystemSettings;
  private ads: Ad[];
  private loans: Loan[];
  private serviceRequests: ServiceRequest[];
  private chatSessions: Record<string, ChatSession>; // userId -> Session
  private auditLogs: AuditLog[];

  constructor() {
    // Load from Secure Storage or fallback to defaults
    this.users = SecureStorage.getItem('users', DEFAULT_USERS);
    this.transactions = SecureStorage.getItem('transactions', []);
    this.systemSettings = SecureStorage.getItem('settings', DEFAULT_SETTINGS);
    this.ads = SecureStorage.getItem('ads', [
        { id: '1', text: 'Get 50% off transfer fees today!', color: 'bg-blue-600', active: true },
        { id: '2', text: 'Apply for a Quick Loan - Instant Approval!', color: 'bg-purple-600', active: true },
        { id: '3', text: 'Become a verified agent and earn commissions.', color: 'bg-green-600', active: true }
    ]);
    this.loans = SecureStorage.getItem('loans', []);
    this.serviceRequests = SecureStorage.getItem('serviceRequests', []);
    this.chatSessions = SecureStorage.getItem('chatSessions', {});
    this.auditLogs = SecureStorage.getItem('auditLogs', []);
  }

  private save() {
      SecureStorage.setItem('users', this.users);
      SecureStorage.setItem('transactions', this.transactions);
      SecureStorage.setItem('settings', this.systemSettings);
      SecureStorage.setItem('ads', this.ads);
      SecureStorage.setItem('loans', this.loans);
      SecureStorage.setItem('serviceRequests', this.serviceRequests);
      SecureStorage.setItem('chatSessions', this.chatSessions);
      SecureStorage.setItem('auditLogs', this.auditLogs);
  }

  private logAdminAction(action: string, targetId: string, details: string) {
      if (!this.currentUser || this.currentUser.role !== UserRole.ADMIN) return;
      const log: AuditLog = {
          id: `log_${Date.now()}`,
          adminId: this.currentUser.id,
          action,
          targetId,
          details,
          timestamp: new Date().toISOString()
      };
      this.auditLogs.unshift(log);
      this.save();
  }

  getAuditLogs() {
      return this.auditLogs;
  }

  // --- Auth ---
  login(role: UserRole = UserRole.USER): User {
    const user = Object.values(this.users).find(u => u.role === role && u.status !== UserStatus.DELETED);
    if (user) {
      this.currentUser = user;
      return user;
    }
    throw new Error('User not found');
  }

  loginWithCredentials(email: string, password: string): { success: boolean; message?: string; user?: User } {
    const user = Object.values(this.users).find(u => u.email === email && u.password === password);
    if (user) {
        if (user.status === UserStatus.SUSPENDED) return { success: false, message: 'Account Suspended' };
        if (user.status === UserStatus.REJECTED) return { success: false, message: 'Account Rejected' };
        if (user.status === UserStatus.DELETED) return { success: false, message: 'Account Deleted' };
        this.currentUser = user;
        return { success: true, user };
    }
    return { success: false, message: 'Invalid credentials' };
  }

  loginWithFace(email: string): { success: boolean; message?: string; user?: User } {
      const user = Object.values(this.users).find(u => u.email === email);
      if (user) {
          if (user.status === UserStatus.SUSPENDED) return { success: false, message: 'Account Suspended' };
          if (user.status === UserStatus.DELETED) return { success: false, message: 'Account Deleted' };
          if (Math.random() > 0.1) {
              this.currentUser = user;
              return { success: true, user };
          }
          return { success: false, message: 'Face not recognized. Try again.' };
      }
      return { success: false, message: 'User not found' };
  }

  logout() {
    this.currentUser = null;
  }

  register(data: any): { success: boolean; message?: string } {
      const existing = Object.values(this.users).find(u => u.email === data.email || u.username === data.username);
      if (existing) return { success: false, message: 'Email or Username already taken' };

      const newUser: User = {
          id: `user_${Date.now()}`,
          ...data,
          balance: 0,
          kycLevel: 1,
          accountNumber: generateAccountNumber(data.phone),
          status: UserStatus.PENDING_SETUP,
          verificationStatus: VerificationStatus.UNVERIFIED,
          limits: { dailyLimit: 50000, weeklyLimit: 200000, dailyUsed: 0, weeklyUsed: 0 },
          avatarUrl: `https://ui-avatars.com/api/?name=${data.name}&background=random`,
          createdAt: new Date().toISOString()
      };
      
      this.users[newUser.id] = newUser;
      this.currentUser = newUser;
      this.save();
      return { success: true };
  }

  createStaffUser(data: { name: string, email: string, role: UserRole }): { success: boolean; message: string } {
      if (Object.values(this.users).find(u => u.email === data.email)) {
          return { success: false, message: 'Email already exists' };
      }
      
      const newStaff: User = {
          id: `staff_${Date.now()}`,
          name: data.name,
          email: data.email,
          username: data.email.split('@')[0],
          password: 'password123',
          role: data.role,
          accountNumber: generateAccountNumber(),
          status: UserStatus.ACTIVE,
          balance: 0,
          kycLevel: 3,
          limits: { dailyLimit: 0, weeklyLimit: 0, dailyUsed: 0, weeklyUsed: 0 },
          avatarUrl: `https://ui-avatars.com/api/?name=${data.name}&background=random`,
          createdAt: new Date().toISOString()
      };
      
      this.users[newStaff.id] = newStaff;
      this.save();
      return { success: true, message: `Staff account created. Default password: password123` };
  }

  completeOnboarding(userId: string, data: Partial<Agent>) {
      if (this.users[userId]) {
          // Merge existing user data with new onboarding data
          this.users[userId] = { ...this.users[userId], ...data };
          
          if (this.users[userId].role === UserRole.AGENT) {
              const agent = this.users[userId] as Agent;
              agent.status = UserStatus.PENDING_APPROVAL;
              agent.verificationStatus = VerificationStatus.PENDING;
              
              // Generate Agent Number based on category if not exists
              if (!agent.agentNumber) {
                  agent.agentNumber = generateAgentNumber(agent.category || AgentCategory.OTHER);
              }
              
              agent.totalCommission = 0;
              agent.completedJobs = 0;
              agent.rating = 5.0;
              agent.ratingCount = 0;
              agent.isOnline = true;
          } else {
              this.users[userId].status = UserStatus.ACTIVE;
              this.users[userId].verificationStatus = VerificationStatus.VERIFIED;
          }
          this.currentUser = this.users[userId];
          this.save();
      }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getAllUsers() {
      return Object.values(this.users).filter(u => u.status !== UserStatus.DELETED);
  }

  updateUserProfile(userId: string, data: Partial<User>) {
      if (this.users[userId]) {
          Object.assign(this.users[userId], data);
          if (this.currentUser && this.currentUser.id === userId) {
              this.currentUser = { ...this.users[userId] };
          }
          this.save();
      }
  }

  deleteUser(userId: string) {
      if (this.users[userId]) {
          this.users[userId].status = UserStatus.DELETED;
          this.users[userId].verificationStatus = VerificationStatus.SUSPENDED;
          if (this.currentUser && this.currentUser.id === userId) {
              this.currentUser = null;
          }
          this.save();
      }
  }

  // --- System Settings ---
  getSystemSettings() {
      return this.systemSettings;
  }
  
  updateSystemSettings(newSettings: Partial<SystemSettings>) {
      this.systemSettings = { ...this.systemSettings, ...newSettings };
      this.save();
  }

  // --- Chat System ---
  getChatSession(userId: string): ChatSession {
      if (!this.chatSessions[userId]) {
          // Create new session if none exists
          const user = this.users[userId];
          this.chatSessions[userId] = {
              userId,
              userName: user ? user.name : 'Guest',
              avatarUrl: user?.avatarUrl,
              messages: [
                  { 
                      id: 'welcome', 
                      senderId: 'system', 
                      text: 'Welcome to Support! How can we help you today?', 
                      timestamp: new Date().toISOString(),
                      isSupport: true
                  }
              ],
              lastMessageAt: new Date().toISOString(),
              unreadCount: 0
          };
          this.save();
      }
      return this.chatSessions[userId];
  }

  getAllChatSessions(): ChatSession[] {
      return Object.values(this.chatSessions).sort((a, b) => 
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
  }

  sendChatMessage(userId: string, text: string, isSupport: boolean) {
      const session = this.getChatSession(userId);
      const newMessage: ChatMessage = {
          id: `msg_${Date.now()}`,
          senderId: isSupport ? 'support' : userId,
          text,
          timestamp: new Date().toISOString(),
          isSupport
      };
      
      session.messages.push(newMessage);
      session.lastMessageAt = newMessage.timestamp;
      if (!isSupport) session.unreadCount += 1; // Mark unread for support agent
      else session.unreadCount = 0; // Clear unread if support replies

      this.save();
      return newMessage;
  }

  // --- Users & Agents ---
  getAgents(): Agent[] {
    // Return all agents that are active, not suspended, and have rating > 2.0
    return Object.values(this.users)
        .filter(u => u.role === UserRole.AGENT && u.status === UserStatus.ACTIVE && (u as Agent).rating >= 2.0) as Agent[];
  }

  toggleUserSuspension(userId: string) {
      const user = this.users[userId];
      if (user) {
          const newStatus = user.status === UserStatus.SUSPENDED ? UserStatus.ACTIVE : UserStatus.SUSPENDED;
          user.status = newStatus;
          user.verificationStatus = newStatus === UserStatus.SUSPENDED ? VerificationStatus.SUSPENDED : VerificationStatus.VERIFIED;
          this.logAdminAction(newStatus === UserStatus.SUSPENDED ? 'SUSPEND' : 'REACTIVATE', userId, 'Manual status toggle');
          this.save();
      }
  }

  verifyUser(userId: string) {
      const user = this.users[userId];
      if (user) {
          user.isVerified = true;
          user.verificationStatus = VerificationStatus.VERIFIED;
          this.logAdminAction('VERIFY_KYC', userId, 'Manual verification');
          this.save();
      }
  }

  approveUser(userId: string) {
      const user = this.users[userId];
      if (user) {
          user.status = UserStatus.ACTIVE;
          user.verificationStatus = VerificationStatus.VERIFIED;
          user.kycLevel = 2; // Bump tier on approval
          this.logAdminAction('APPROVE_AGENT', userId, 'Agent application approved');
          this.save();
      }
  }

  rejectUser(userId: string, reason: string) {
      const user = this.users[userId];
      if (user) {
          user.status = UserStatus.ACTIVE; // Active but as a user
          user.verificationStatus = VerificationStatus.REJECTED;
          user.verificationNotes = reason;
          // Demote to User
          user.role = UserRole.USER;
          this.logAdminAction('REJECT_AGENT', userId, `Reason: ${reason}`);
          this.save();
      }
  }

  shouldShowAds(user: User): boolean {
      if (user.role === UserRole.ADMIN || user.role === UserRole.SUPPORT) return false;
      if (user.kycLevel >= 3) return false; // Elite tier
      return true;
  }

  // --- Transactions ---
  getTransactions(filter: 'ALL' | 'USER' = 'USER'): Transaction[] {
    if (filter === 'ALL') return this.transactions;
    if (!this.currentUser) return [];
    return this.transactions.filter(t => t.userId === this.currentUser!.id);
  }

  requestTransaction(tx: Transaction): { success: boolean; message?: string } {
    const user = this.users[tx.userId];
    if (!user) return { success: false, message: 'User not found' };

    // KYC Check
    if (user.status !== UserStatus.ACTIVE) return { success: false, message: 'Account not active' };

    if (tx.type === TransactionType.WITHDRAWAL || tx.type === TransactionType.TRANSFER || tx.type === TransactionType.PAYMENT) {
        if (user.balance < tx.amount) return { success: false, message: 'Insufficient funds' };
        
        if (user.limits) {
             if (user.limits.dailyUsed + tx.amount > user.limits.dailyLimit) return { success: false, message: `Daily limit of ₦${user.limits.dailyLimit.toLocaleString()} exceeded. Upgrade KYC.` };
        }
    }

    if (tx.type === TransactionType.TRANSFER) {
        const targetAccount = tx.description.replace('Transfer to ', '');
        const recipientUser = Object.values(this.users).find(u => u.accountNumber === targetAccount || u.accountNumber === tx.recipientId);

        if (!recipientUser) return { success: false, message: 'Recipient account not found' };
        if (recipientUser.id === user.id) return { success: false, message: 'Cannot transfer to yourself' };

        user.balance -= tx.amount;
        user.limits!.dailyUsed += tx.amount;
        
        recipientUser.balance += tx.amount;
        
        tx.status = TransactionStatus.COMPLETED;
        this.transactions.unshift(tx);
        
        const creditTx: Transaction = {
            ...tx,
            id: `tx_${Date.now()}_rec`,
            userId: recipientUser.id,
            type: TransactionType.DEPOSIT,
            description: `Transfer from ${user.name} (${user.accountNumber})`,
            status: TransactionStatus.COMPLETED
        };
        this.transactions.unshift(creditTx);
        this.save();
        return { success: true };
    } 
    else if (tx.type === TransactionType.WITHDRAWAL) {
        user.balance -= tx.amount;
        user.limits!.dailyUsed += tx.amount;
        tx.status = TransactionStatus.PENDING;
        this.transactions.unshift(tx);
        this.save();
        return { success: true, message: 'Withdrawal requested. Funds deducted pending approval.' };
    }
    else if (tx.type === TransactionType.PAYMENT) {
        const merchant = Object.values(this.users).find(u => u.accountNumber === tx.description.replace('Payment to ', ''));
        
        user.balance -= tx.amount;
        user.limits!.dailyUsed += tx.amount;
        tx.status = TransactionStatus.COMPLETED;
        this.transactions.unshift(tx);

        if (merchant) {
            merchant.balance += tx.amount;
            const creditTx: Transaction = {
                ...tx,
                id: `tx_${Date.now()}_merch`,
                userId: merchant.id,
                type: TransactionType.DEPOSIT,
                description: `Payment from ${user.name}`,
                status: TransactionStatus.COMPLETED
            };
            this.transactions.unshift(creditTx);
        }
        this.save();
        return { success: true };
    }
    else if (tx.type === TransactionType.DEPOSIT) {
        tx.status = TransactionStatus.PENDING;
        this.transactions.unshift(tx);
        this.save();
        return { success: true, message: 'Deposit request submitted for review.' };
    }

    return { success: false };
  }

  updateTransactionStatus(id: string, status: TransactionStatus) {
      const tx = this.transactions.find(t => t.id === id);
      if (tx) {
          const user = this.users[tx.userId];
          if (tx.type === TransactionType.DEPOSIT && tx.status === TransactionStatus.PENDING && status === TransactionStatus.COMPLETED) {
              if (user) user.balance += tx.amount;
          }
          if (tx.type === TransactionType.WITHDRAWAL && tx.status === TransactionStatus.PENDING && status === TransactionStatus.FAILED) {
              if (user) {
                  user.balance += tx.amount;
                  user.limits!.dailyUsed -= tx.amount;
              }
          }
          tx.status = status;
          this.logAdminAction(`TX_${status}`, tx.userId, `Transaction ${tx.id} updated to ${status}`);
          this.save();
      }
  }

  // --- Loans ---
  getLoans(userId?: string) {
      if (userId) return this.loans.filter(l => l.userId === userId);
      return this.loans;
  }

  requestLoan(userId: string, amount: number, tier: LoanTier): { success: boolean; message: string } {
      const user = this.users[userId];
      // KYC Check
      if (user.kycLevel < 2 && tier === LoanTier.SILVER) return { success: false, message: 'Silver loans require Tier 2 KYC.' };
      if (user.kycLevel < 3 && tier === LoanTier.GOLD) return { success: false, message: 'Gold loans require Tier 3 KYC.' };

      const activeLoan = this.loans.find(l => l.userId === userId && l.status !== LoanStatus.PAID && l.status !== LoanStatus.REJECTED);
      if (activeLoan) return { success: false, message: 'You already have an active loan.' };

      const loan: Loan = {
          id: `loan_${Date.now()}`,
          userId,
          amount,
          tier,
          status: LoanStatus.PENDING,
          dateRequested: new Date().toISOString(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          interest: 0.05,
          totalRepayment: amount * 1.05
      };
      this.loans.unshift(loan);
      this.save();
      return { success: true, message: 'Loan application submitted.' };
  }

  approveLoan(loanId: string) {
      const loan = this.loans.find(l => l.id === loanId);
      if (loan && loan.status === LoanStatus.PENDING) {
          loan.status = LoanStatus.APPROVED;
          const user = this.users[loan.userId];
          if (user) {
              user.balance += loan.amount;
              const tx: Transaction = {
                  id: `tx_loan_${loan.id}`,
                  userId: user.id,
                  type: TransactionType.LOAN_DISBURSEMENT,
                  amount: loan.amount,
                  date: new Date().toISOString(),
                  status: TransactionStatus.COMPLETED,
                  description: `Loan Disbursement - ${loan.tier}`
              };
              this.transactions.unshift(tx);
              this.logAdminAction('APPROVE_LOAN', user.id, `Loan ${loanId} approved`);
              this.save();
          }
      }
  }

  rejectLoan(loanId: string) {
      const loan = this.loans.find(l => l.id === loanId);
      if (loan) {
          loan.status = LoanStatus.REJECTED;
          this.logAdminAction('REJECT_LOAN', loan.userId, `Loan ${loanId} rejected`);
          this.save();
      }
  }

  upgradeUserTier(userId: string) {
      const user = this.users[userId];
      if (user && user.kycLevel < 3) {
          user.kycLevel += 1;
          const newLimits = KYC_TIERS[user.kycLevel];
          if (user.limits && newLimits) {
              user.limits.dailyLimit = newLimits.daily;
              user.limits.weeklyLimit = newLimits.weekly;
          }
          this.logAdminAction('UPGRADE_TIER', userId, `Upgraded to Tier ${user.kycLevel}`);
          this.save();
      }
  }

  // --- Ads ---
  getAds() { return this.ads.filter(a => a.active); }
  addAd(text: string, color: string) {
      this.ads.push({ id: `ad_${Date.now()}`, text, color, active: true });
      this.save();
  }
  deleteAd(id: string) {
      this.ads = this.ads.filter(a => a.id !== id);
      this.save();
  }

  // --- Agent Workstation ---
  getServiceRequests(agentId: string) {
      return this.serviceRequests.filter(r => r.agentId === agentId);
  }

  createServiceRequest(userId: string, agentId: string, serviceType: string): { success: boolean; message: string } {
      const user = this.users[userId];
      const request: ServiceRequest = {
          id: `req_${Date.now()}`,
          userId,
          agentId,
          serviceType,
          status: ServiceRequestStatus.PENDING,
          date: new Date().toISOString(),
          userName: user ? user.name : 'Unknown User'
      };
      this.serviceRequests.unshift(request);
      this.save();
      return { success: true, message: 'Request sent to agent. Waiting for acceptance...' };
  }

  respondToServiceRequest(reqId: string, status: ServiceRequestStatus) {
      const req = this.serviceRequests.find(r => r.id === reqId);
      if (req) {
          req.status = status;
          // Implications: If Accepted, Agent is BUSY
          const agent = this.users[req.agentId] as Agent;
          if (agent && status === ServiceRequestStatus.ACCEPTED) {
              agent.isOnline = false; // Busy
          }
           if (agent && status === ServiceRequestStatus.REJECTED) {
               // Agent becomes available again immediately if they were busy (though usually reject comes from pending)
               agent.isOnline = true;
           }
          this.save();
      }
  }

  completeServiceRequest(reqId: string) {
      const req = this.serviceRequests.find(r => r.id === reqId);
      if (req && req.status === ServiceRequestStatus.ACCEPTED) {
          req.status = ServiceRequestStatus.COMPLETED;
          const agent = this.users[req.agentId] as Agent;
          if (agent) {
              agent.completedJobs += 1;
              const commission = 500; 
              agent.totalCommission += commission;
              agent.balance += commission;
              
              // Implications: Job done -> Agent Online
              agent.isOnline = true;

              // Rating Simulation (In real app user provides this)
              // If rating drops low -> Auto Suspend
              // Simulate a rating for this job
              const jobRating = Math.random() > 0.1 ? 5 : 1; 
              const newRating = ((agent.rating * agent.ratingCount) + jobRating) / (agent.ratingCount + 1);
              agent.rating = parseFloat(newRating.toFixed(1));
              agent.ratingCount += 1;

              if (agent.rating < 2.0) {
                  agent.status = UserStatus.SUSPENDED;
                  this.logAdminAction('AUTO_SUSPEND', agent.id, `Rating dropped to ${agent.rating}`);
              }

              this.save();
          }
      }
  }

  toggleAgentOnlineStatus(agentId: string) {
      const agent = this.users[agentId] as Agent;
      if (agent) {
          // Prevent going online if currently in an active job
          const activeJobs = this.serviceRequests.filter(r => r.agentId === agentId && r.status === ServiceRequestStatus.ACCEPTED);
          if (activeJobs.length > 0) return; // Locked

          agent.isOnline = !agent.isOnline;
          this.save();
      }
  }

  updateAgentProfile(agentId: string, data: Partial<Agent>) {
      const agent = this.users[agentId] as Agent;
      if (agent) {
          Object.assign(agent, data);
          // If critical info changed, maybe mark pending review?
          this.save();
      }
  }
}

export const mockStore = new MockStore();