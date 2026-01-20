
import { 
  User, UserRole, UserStatus, VerificationStatus, Transaction, 
  Agent, AgentCategory, TransactionStatus, TransactionType,
  MarketData, SupportTicket, SystemLog, RealTimeEvent, ChatSession
} from '../types';
import { SecureStorage } from '../utils/storage';
import { generateAccountNumber } from '../utils/accountGenerator';

const DEFAULT_USERS: Record<string, User> = {
  'user_123': {
    id: 'user_123',
    username: 'johndoe',
    name: 'John Doe',
    displayName: 'Johnny D',
    bio: 'Tech enthusiast and frequent traveler.',
    email: 'john@example.com',
    password: 'password',
    pin: '123456',
    walletNumber: '112233', 
    accountNumber: generateAccountNumber('08000000000'),
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    balance: 55400.00,
    preferredCurrency: 'NGN',
    wallets: [{ id: 'w1', currency: 'NGN', balance: 55400.00, isDefault: true }],
    kycLevel: 2,
    avatarUrl: 'https://ui-avatars.com/api/?name=John+Doe&background=1E293B&color=fff',
    verificationStatus: VerificationStatus.VERIFIED,
    createdAt: new Date().toISOString(),
    referralCode: 'PAYNA-123',
    totalSpent: 124500,
    totalEarned: 0,
    rating: 5.0,
    reviewCount: 0,
    privacyMode: false,
    limits: { dailyLimit: 500000 }
  },
  'super_admin': {
    id: 'super_admin',
    username: 'godmode',
    name: 'Thomas Kwofie',
    email: 'admin@payna.io',
    password: 'password',
    walletNumber: '000000',
    accountNumber: generateAccountNumber('00000000000'),
    role: UserRole.SUPER_ADMIN,
    status: UserStatus.ACTIVE,
    balance: 10000000,
    preferredCurrency: 'NGN',
    wallets: [{ id: 'w_master', currency: 'NGN', balance: 10000000, isDefault: true }],
    kycLevel: 3,
    verificationStatus: VerificationStatus.VERIFIED,
    createdAt: new Date().toISOString(),
    avatarUrl: 'https://ui-avatars.com/api/?name=Thomas+Kwofie&background=10B981&color=fff',
    referralCode: 'ADMIN-001',
    totalSpent: 0,
    totalEarned: 0,
    rating: 5.0,
    reviewCount: 100
  }
};

const DEFAULT_AGENTS: Agent[] = [
  {
    id: 'agent_1',
    userId: 'u_agent_1',
    businessName: 'Lagos Fast-Cash POS',
    category: AgentCategory.POS,
    avatarUrl: 'https://ui-avatars.com/api/?name=POS+Lagos&background=10B981&color=fff',
    rating: 4.8,
    ratingCount: 156,
    isOnline: true,
    basePrice: 100,
    verificationStatus: VerificationStatus.VERIFIED,
    location: { lat: 6.5244, lng: 3.3792 },
    phone: '+2348012345678',
    description: 'Instant cash withdrawals and deposits. Open 24/7.',
    operatingHours: '9:00 AM - 9:00 PM',
    travelRadius: 5
  }
];

class MockStore {
  private users: Record<string, User>;
  private agents: Agent[];
  private transactions: Transaction[];
  private currentUser: User | null = null;
  private logs: SystemLog[] = [];
  private listeners: Set<(event: RealTimeEvent) => void> = new Set();
  private supportTickets: SupportTicket[];

  constructor() {
    this.users = SecureStorage.getItem('users', DEFAULT_USERS);
    this.agents = SecureStorage.getItem('agents', DEFAULT_AGENTS);
    this.transactions = SecureStorage.getItem('transactions', []);
    this.logs = SecureStorage.getItem('system_logs', [
      { id: 'l1', event: 'Vault Kernel Initialized', user: 'SYSTEM', timestamp: new Date().toISOString() }
    ]);
    this.supportTickets = SecureStorage.getItem('support_tickets', []);
  }

  subscribe(callback: (event: RealTimeEvent) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private emit(type: string, payload: any) {
    const event: RealTimeEvent = { type, payload, timestamp: new Date().toISOString() };
    this.listeners.forEach(cb => cb(event));
  }

  private save() {
    SecureStorage.setItem('users', this.users);
    SecureStorage.setItem('agents', this.agents);
    SecureStorage.setItem('transactions', this.transactions);
    SecureStorage.setItem('system_logs', this.logs);
    SecureStorage.setItem('support_tickets', this.supportTickets);
  }

  private addLog(event: string, user: string) {
    this.logs.unshift({ id: `l_${Date.now()}`, event, user, timestamp: new Date().toISOString() });
    this.save();
  }

  // --- Profile Updates ---
  updateUser(userId: string, updates: Partial<User>) {
    if (this.users[userId]) {
      this.users[userId] = { ...this.users[userId], ...updates };
      if (this.currentUser?.id === userId) {
        this.currentUser = this.users[userId];
      }
      this.addLog(`Profile Updated: ${Object.keys(updates).join(', ')}`, this.users[userId].name);
      this.save();
      this.emit('USER_UPDATE', this.users[userId]);
      return { success: true, user: this.users[userId] };
    }
    return { success: false, message: 'User not found' };
  }

  updateAgent(agentId: string, updates: Partial<Agent>) {
    const idx = this.agents.findIndex(a => a.id === agentId);
    if (idx !== -1) {
      this.agents[idx] = { ...this.agents[idx], ...updates };
      this.addLog(`Agent Profile Updated: ${this.agents[idx].businessName}`, 'SYSTEM');
      this.save();
      this.emit('AGENT_UPDATE', this.agents[idx]);
      return { success: true, agent: this.agents[idx] };
    }
    return { success: false, message: 'Agent not found' };
  }

  // --- Financial Integrity (God Mode) ---
  calculateSystemLiquidity() {
    const rates: Record<string, number> = { NGN: 1, USD: 1550, EUR: 1680, BTC: 105000000 };
    let totalLiquidityNGN = 0;
    const breakdown: Record<string, { totalHoldings: number, valueInNGN: number }> = {};

    Object.values(this.users).forEach(user => {
      user.wallets.forEach(wallet => {
        if (!breakdown[wallet.currency]) breakdown[wallet.currency] = { totalHoldings: 0, valueInNGN: 0 };
        breakdown[wallet.currency].totalHoldings += wallet.balance;
        const valNGN = wallet.balance * (rates[wallet.currency] || 1);
        breakdown[wallet.currency].valueInNGN += valNGN;
        totalLiquidityNGN += valNGN;
      });
    });

    return { totalLiquidityNGN, breakdown, lastUpdated: new Date().toISOString() };
  }

  calculateTotalNetWorth(userId: string): number {
    const user = this.users[userId];
    if (!user) return 0;
    return user.wallets.reduce((acc, w) => acc + w.balance, 0);
  }

  // --- Auth & Node Identity ---
  async autoLogin(): Promise<User | null> {
    const session = SecureStorage.getItem('auth_session', null);
    if (session && this.users[session.userId]) {
      this.currentUser = this.users[session.userId];
      return this.currentUser;
    }
    return null;
  }

  login(email: string, pass: string) {
    const user = Object.values(this.users).find(u => u.email === email && u.password === pass);
    if (user) {
      this.currentUser = user;
      SecureStorage.setItem('auth_session', { userId: user.id });
      this.addLog('Secure Entry Successful', user.name);
      return { success: true, user };
    }
    return { success: false, message: 'Invalid Credentials' };
  }

  loginWithPin(email: string, pin: string) {
    const user = Object.values(this.users).find(u => u.email === email && u.pin === pin);
    if (user) {
      this.currentUser = user;
      SecureStorage.setItem('auth_session', { userId: user.id });
      this.addLog('PIN-based Entry', user.name);
      return { success: true, user };
    }
    return { success: false, message: 'Invalid PIN' };
  }

  register(data: any) {
    const newUser: User = {
      id: `u_${Date.now()}`,
      ...data,
      accountNumber: generateAccountNumber(),
      balance: 0,
      wallets: [{ id: `w_${Date.now()}`, currency: 'NGN', balance: 0, isDefault: true }],
      kycLevel: 1,
      status: UserStatus.ACTIVE,
      verificationStatus: VerificationStatus.UNVERIFIED,
      createdAt: new Date().toISOString(),
      referralCode: `PAYNA-${Math.floor(1000 + Math.random() * 9000)}`,
      totalSpent: 0,
      totalEarned: 0,
      rating: 5.0,
      reviewCount: 0
    };
    this.users[newUser.id] = newUser;
    this.addLog('New Node Registered', newUser.name);
    this.save();
    return newUser;
  }

  logout() {
    if (this.currentUser) this.addLog('Node Desynchronized', this.currentUser.name);
    this.currentUser = null;
    SecureStorage.setItem('auth_session', null);
  }

  // --- Escrow & Transaction Engine ---
  initiateEscrow(senderId: string, receiverId: string, amount: number, currency: string, service: AgentCategory) {
    const sender = this.users[senderId];
    if (!sender || sender.balance < amount) throw new Error("Insufficient Funds");

    sender.balance -= amount;
    const tx: Transaction = {
      id: `esc_${Date.now()}`,
      userId: senderId,
      recipientId: receiverId,
      recipientName: this.users[receiverId]?.name || 'Agent',
      amount,
      currency,
      status: TransactionStatus.IN_ESCROW,
      type: TransactionType.ESCROW_PAYMENT,
      isEscrow: true,
      serviceType: service,
      description: `${service} Service secured payment`,
      date: new Date().toISOString(),
      referenceNumber: `ESC-${Math.random().toString(36).substring(7).toUpperCase()}`
    };

    this.transactions.unshift(tx);
    this.addLog(`Escrow Locked: ${amount} ${currency}`, sender.name);
    this.save();
    this.emit('ESCROW_INIT', tx);
    return tx;
  }

  releaseEscrow(txId: string) {
    const tx = this.transactions.find(t => t.id === txId);
    if (!tx || tx.status !== TransactionStatus.IN_ESCROW) return;

    const receiver = this.users[tx.recipientId!];
    if (receiver) {
      receiver.balance += tx.amount;
      receiver.totalEarned += tx.amount;
      const wallet = receiver.wallets.find(w => w.currency === tx.currency);
      if (wallet) wallet.balance += tx.amount;
    }

    const sender = this.users[tx.userId];
    if (sender) sender.totalSpent += tx.amount;

    tx.status = TransactionStatus.RELEASED;
    this.addLog(`Escrow Released: ${tx.id}`, 'SYSTEM_KERNEL');
    this.save();
    this.emit('ESCROW_RELEASE', tx);
  }

  // --- Admin Operations ---
  updateUserRole(adminId: string, targetId: string, role: UserRole) {
    const admin = this.users[adminId];
    if (admin?.role !== UserRole.SUPER_ADMIN) throw new Error("Unauthorized God-Mode action");
    if (this.users[targetId]) {
      this.users[targetId].role = role;
      this.addLog(`Role Override: ${this.users[targetId].name} -> ${role}`, admin.name);
      this.save();
      this.emit('USER_UPDATE', this.users[targetId]);
    }
  }

  manuallyAdjustBalance(adminId: string, targetId: string, amount: number) {
    const admin = this.users[adminId];
    if (admin?.role !== UserRole.SUPER_ADMIN) throw new Error("Unauthorized");
    const user = this.users[targetId];
    if (user) {
      user.balance = amount;
      const wallet = user.wallets.find(w => w.isDefault);
      if (wallet) wallet.balance = amount;
      this.addLog(`Balance Adjustment: ${user.name} set to ${amount}`, admin.name);
      this.save();
    }
  }

  getTickets(scope: 'USER' | 'ALL' = 'USER'): SupportTicket[] {
    if (scope === 'ALL') return this.supportTickets;
    return this.supportTickets.filter(t => t.userId === this.currentUser?.id);
  }

  sendTicketMessage(ticketId: string, senderId: string, text: string, isAdmin: boolean) {
    const ticket = this.supportTickets.find(t => t.id === ticketId);
    if (ticket) {
      ticket.messages.push({
        id: `m_${Date.now()}`,
        senderId,
        text,
        timestamp: new Date().toISOString(),
        isAdmin
      });
      ticket.updatedAt = new Date().toISOString();
      this.save();
      this.emit('TICKET_UPDATE', ticket);
    }
  }

  // --- Marketplace & Staff ---
  getAgents(): Agent[] {
    return this.agents;
  }

  getStaffDirectory() {
    return Object.values(this.users).filter(u => 
      [UserRole.ADMIN, UserRole.SUPPORT, UserRole.SUPER_ADMIN].includes(u.role)
    );
  }

  // --- Helpers ---
  getCurrentUser() { return this.currentUser; }
  getAllUsers() { return Object.values(this.users); }
  getTransactions(scope: 'USER' | 'ALL' = 'USER') { 
    if (scope === 'ALL') return this.transactions;
    return this.transactions.filter(t => t.userId === this.currentUser?.id || t.recipientId === this.currentUser?.id);
  }
  getSystemLogs() { return this.logs; }
  getMarketData(): MarketData[] { 
    return [{ currency: 'BTC', price: 64230, change24h: 4.25, trend: 'UP', lastUpdated: new Date().toISOString() }];
  }
  getAds() { return [{ id: 'ad1', text: 'Professional Agents earn 0.5% higher on P2P Escrow.', color: 'bg-[#10B981]' }]; }
  isWalletNumberAvailable(num: string) { return !Object.values(this.users).some(u => u.walletNumber === num); }
  getUserByAccountNumber(num: string) { return Object.values(this.users).find(u => u.accountNumber === num || u.walletNumber === num); }
  requestTransaction(tx: any) { this.transactions.unshift(tx); this.save(); }
  getExchangeRate(f: string, t: string) { return 1; }
  isFaceIdEnrolled(e: string) { return true; }
  getAuthenticationOptions(e: string) { return { challenge: 'MOCK_CHALLENGE' }; }
  verifyAuthentication(e: string, c: any) { return { success: true }; }
  completeOnboarding(uid: string, data: any) {
    if (this.users[uid]) {
      this.users[uid].status = UserStatus.ACTIVE;
      this.save();
    }
  }

  getChatSession(userId: string): ChatSession {
    return {
      messages: [
        { id: 'm1', text: 'How can we help you?', timestamp: new Date().toISOString(), isSupport: true }
      ]
    };
  }

  sendChatMessage(userId: string, text: string, isSupport: boolean) {
    console.log(`Support chat from ${userId}: ${text}`);
  }
}

export const mockStore = new MockStore();
