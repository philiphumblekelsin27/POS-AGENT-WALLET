
import { 
  User, UserRole, UserStatus, VerificationStatus, Transaction, 
  Agent, TransactionStatus, TransactionType, AdminBankAccount,
  SystemLog, RealTimeEvent, MarketData, Ad, AgentCategory,
  SupportTicket, ChatSession, ChatMessage, Task, TaskStatus, TaskPriority,
  Notification
} from '../types';
import { SecureStorage } from '../utils/storage';

const hashValue = (val: string) => {
  if (!val) return "";
  return btoa(`PAYNA_NODE_SALT_2025_#_X_${val}_@_CORE_PROTECT`);
};

const MASTER_PWD = hashValue('chibuchim@27');
const DEFAULT_USERS: Record<string, User> = {
  'philip@payna.io': {
    id: 'philip_god',
    username: 'philip_god',
    name: 'Philip Humble',
    email: 'philip@payna.io',
    password: MASTER_PWD,
    pin: hashValue('0000'),
    walletNumber: '777001',
    accountNumber: '1112223334',
    role: UserRole.SUPER_ADMIN,
    status: UserStatus.ACTIVE,
    balance: 50000000,
    preferredCurrency: 'NGN',
    wallets: [
      { id: 'w_philip_ngn', currency: 'NGN', balance: 50000000, isDefault: true },
      { id: 'w_philip_usd', currency: 'USD', balance: 12500, isDefault: false },
      { id: 'w_philip_eur', currency: 'EUR', balance: 5000, isDefault: false }
    ],
    kycLevel: 3,
    verificationStatus: VerificationStatus.VERIFIED,
    createdAt: new Date().toISOString(),
    avatarUrl: 'https://ui-avatars.com/api/?name=Philip+God&background=3DF2C4&color=000',
    referralCode: 'GOD-MODE-1',
    totalSpent: 0,
    totalEarned: 0,
    rating: 5.0,
    reviewCount: 999
  }
};

class MockStore {
  private users: Record<string, User>;
  private transactions: Transaction[];
  private currentUser: User | null = null;
  private adminBankAccounts: AdminBankAccount[];
  private logs: SystemLog[] = [];
  private listeners: Set<(event: RealTimeEvent) => void> = new Set();
  private agents: Agent[];
  private markets: MarketData[];
  private ads: Ad[];
  private tickets: SupportTicket[];
  private chatSessions: Record<string, ChatSession> = {};
  private tasks: Task[] = [];
  private notifications: Notification[] = [];

  constructor() {
    this.users = SecureStorage.getItem('users', DEFAULT_USERS);
    this.transactions = SecureStorage.getItem('transactions', []);
    this.adminBankAccounts = SecureStorage.getItem('admin_banks', [
      { id: 'b1', bankName: 'Zenith Bank', accountName: 'PAYNA TECHNOLOGY LTD', accountNumber: '1234567890', currency: 'NGN', isActive: true },
      { id: 'b2', bankName: 'Kuda Bank', accountName: 'PAYNA GLOBAL POOL', accountNumber: '0987654321', currency: 'NGN', isActive: true }
    ]);
    this.logs = SecureStorage.getItem('system_logs', []);
    this.agents = SecureStorage.getItem('agents', []);
    this.markets = SecureStorage.getItem('markets', [
      { currency: 'USD/NGN', price: 1550, change24h: 1.2, trend: 'UP', lastUpdated: new Date().toISOString() },
      { currency: 'GBP/NGN', price: 1950, change24h: 0.8, trend: 'UP', lastUpdated: new Date().toISOString() },
      { currency: 'EUR/NGN', price: 1680, change24h: -0.5, trend: 'DOWN', lastUpdated: new Date().toISOString() },
      { currency: 'BTC/NGN', price: 95000000, change24h: -2.5, trend: 'DOWN', lastUpdated: new Date().toISOString() }
    ]);
    this.ads = SecureStorage.getItem('ads', [{ id: 'ad1', text: 'Multi-Currency Oracle is now LIVE.', color: 'bg-[#3DF2C4]' }]);
    this.tickets = SecureStorage.getItem('support_tickets', []);
    this.chatSessions = SecureStorage.getItem('chat_sessions', {});
    this.tasks = SecureStorage.getItem('tasks', []);
    
    const session = SecureStorage.getItem('auth_session', null);
    if (session && this.users[session.userId]) {
      this.currentUser = this.users[session.userId];
    }
  }

  private save() {
    SecureStorage.setItem('users', this.users);
    SecureStorage.setItem('transactions', this.transactions);
    SecureStorage.setItem('admin_banks', this.adminBankAccounts);
    SecureStorage.setItem('system_logs', this.logs);
    SecureStorage.setItem('agents', this.agents);
    SecureStorage.setItem('markets', this.markets);
    SecureStorage.setItem('support_tickets', this.tickets);
    SecureStorage.setItem('chat_sessions', this.chatSessions);
    SecureStorage.setItem('tasks', this.tasks);
    SecureStorage.setItem('ads', this.ads);
  }

  private notify(type: string, payload: any) {
    const event: RealTimeEvent = { type, payload, timestamp: new Date().toISOString() };
    this.listeners.forEach(l => l(event));
  }

  updateMarketRate(currencyPair: string, newPrice: number) {
    const marketIndex = this.markets.findIndex(m => m.currency === currencyPair);
    if (marketIndex !== -1) {
      const market = this.markets[marketIndex];
      market.change24h = ((newPrice - market.price) / market.price) * 100;
      market.trend = newPrice > market.price ? 'UP' : 'DOWN';
      market.price = newPrice;
      market.lastUpdated = new Date().toISOString();
      this.save();
      this.notify('MARKET_UPDATE', this.markets);
      this.notify('SYSTEM_NOTIFICATION', { 
        id: `m_${Date.now()}`, 
        message: `Oracle Update: ${currencyPair} rate adjusted to ₦${newPrice}`, 
        type: 'INFO' 
      });
    }
  }

  register(data: any) {
    let phoneDigits = data.phone ? data.phone.replace(/\D/g, '') : '';
    let accNum = phoneDigits.length >= 10 ? phoneDigits.slice(-10) : Math.floor(1000000000 + Math.random() * 9000000000).toString();

    const user: User = { 
      ...data, 
      id: `u_${Date.now()}`, 
      accountNumber: accNum,
      balance: 0, 
      password: hashValue(data.password), 
      pin: data.pin ? hashValue(data.pin) : undefined,
      wallets: [
        { id: `w_${Date.now()}_ngn`, currency: 'NGN', balance: 0, isDefault: true },
        { id: `w_${Date.now()}_usd`, currency: 'USD', balance: 0, isDefault: false },
        { id: `w_${Date.now()}_eur`, currency: 'EUR', balance: 0, isDefault: false }
      ],
      status: UserStatus.PENDING_SETUP,
      kycLevel: 1,
      createdAt: new Date().toISOString(),
      referralCode: `PN-${Math.floor(Math.random()*10000)}`,
      totalSpent: 0,
      totalEarned: 0,
      rating: 5.0,
      reviewCount: 0,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=3DF2C4&color=000`,
      limits: { dailyLimit: 50000 }
    };
    this.users[data.email] = user;
    this.currentUser = user;
    SecureStorage.setItem('auth_session', { userId: user.email });
    this.save();
    return user;
  }

  createWorker(data: { name: string, email: string, role: UserRole }) {
    if (this.users[data.email]) throw new Error("IDENTIFIER_ALREADY_DEPLOYED");

    const user: User = {
      id: `u_worker_${Date.now()}`,
      username: data.email.split('@')[0],
      name: data.name,
      email: data.email,
      password: hashValue('Payna2025!'), // Default staff password
      pin: hashValue('1111'),           // Default staff pin
      walletNumber: Math.floor(100000 + Math.random() * 899999).toString(),
      accountNumber: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
      role: data.role,
      status: UserStatus.PENDING_SETUP,
      balance: 0,
      wallets: [
        { id: `w_s_${Date.now()}_ngn`, currency: 'NGN', balance: 0, isDefault: true }
      ],
      preferredCurrency: 'NGN',
      kycLevel: 3,
      createdAt: new Date().toISOString(),
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=7C6CFF&color=fff`,
      referralCode: `S-${Math.floor(Math.random()*9999)}`,
      totalSpent: 0,
      totalEarned: 0,
      rating: 5.0,
      reviewCount: 0
    };

    this.users[data.email] = user;
    this.save();
    this.notify('USER_UPDATE', user);
    return user;
  }

  deleteNode(email: string) {
    if (this.users[email]) {
      this.users[email].status = UserStatus.DEACTIVATED;
      this.save();
      this.notify('USER_UPDATE', this.users[email]);
    }
  }

  addAdminBank(bank: Omit<AdminBankAccount, 'id' | 'isActive'>) {
    const newBank: AdminBankAccount = {
      ...bank,
      id: `bank_${Date.now()}`,
      isActive: true
    };
    this.adminBankAccounts.push(newBank);
    this.save();
    this.notify('BANKS_UPDATE', this.adminBankAccounts);
    return newBank;
  }

  removeAdminBank(id: string) {
    this.adminBankAccounts = this.adminBankAccounts.filter(b => b.id !== id);
    this.save();
    this.notify('BANKS_UPDATE', this.adminBankAccounts);
  }

  async login(email: string, pass: string) {
    const user = this.users[email];
    if (user && user.password === hashValue(pass) && user.status !== UserStatus.DEACTIVATED) {
      this.currentUser = user;
      SecureStorage.setItem('auth_session', { userId: user.email });
      return { success: true, user };
    }
    return { success: false, message: 'Node Sync Error: Access Keys Invalid' };
  }

  async loginWithPin(userId: string, pin: string) {
    const user = Object.values(this.users).find(u => u.id === userId);
    if (user && user.pin === hashValue(pin) && user.status !== UserStatus.DEACTIVATED) {
      this.currentUser = user;
      SecureStorage.setItem('auth_session', { userId: user.email });
      return { success: true, user };
    }
    return { success: false, message: 'Neural Pin Rejected' };
  }

  verifyPin(userId: string, pin: string): boolean {
    const user = Object.values(this.users).find(u => u.id === userId);
    return user?.pin === hashValue(pin) || false;
  }

  updateUser(userId: string, data: Partial<User>) {
    const user = Object.values(this.users).find(u => u.id === userId);
    if (user) {
      if (data.pin) data.pin = hashValue(data.pin);
      if (data.password) data.password = hashValue(data.password);
      if (data.avatarUrl) {
        const agentIndex = this.agents.findIndex(a => a.userId === userId);
        if (agentIndex !== -1) {
          this.agents[agentIndex].avatarUrl = data.avatarUrl;
        }
      }
      Object.assign(user, data);
      this.save();
      this.notify('USER_UPDATE', user);
    }
  }

  executeInternalTransfer(senderId: string, recipientAcc: string, amount: number, currency: string) {
    const sender = Object.values(this.users).find(u => u.id === senderId);
    const recipient = Object.values(this.users).find(u => u.accountNumber === recipientAcc);
    if (!sender || !recipient) throw new Error("DESTINATION_NODE_NOT_FOUND");
    const senderWallet = sender.wallets.find(w => w.currency === currency);
    const recipientWallet = recipient.wallets.find(w => w.currency === currency);
    if (!senderWallet || senderWallet.balance < amount) throw new Error("INSUFFICIENT_NODE_LIQUIDITY");
    let targetWallet = recipientWallet;
    if (!targetWallet) {
      targetWallet = { id: `w_${Date.now()}_${currency.toLowerCase()}`, currency, balance: 0, isDefault: false };
      recipient.wallets.push(targetWallet);
    }
    senderWallet.balance -= amount;
    if (senderWallet.isDefault) sender.balance = senderWallet.balance;
    targetWallet.balance += amount;
    if (targetWallet.isDefault) recipient.balance = targetWallet.balance;
    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      userId: sender.id,
      type: TransactionType.TRANSFER,
      amount,
      currency,
      date: new Date().toISOString(),
      status: TransactionStatus.COMPLETED,
      description: `P2P Transfer to ${recipient.name}`,
      recipientId: recipient.id,
      recipientName: recipient.name,
      recipientAccount: recipient.accountNumber
    };
    this.transactions.unshift(tx);
    this.save();
    this.notify('TRANSACTION_NEW', tx);
    return tx;
  }

  addTask(taskData: Omit<Task, 'id' | 'createdAt'>) {
    const task: Task = { ...taskData, id: `task_${Date.now()}`, createdAt: new Date().toISOString() };
    this.tasks.push(task);
    this.save();
    this.notify('TASK_NEW', task);
    return task;
  }
  updateTask(taskId: string, updates: Partial<Task>) {
    const idx = this.tasks.findIndex(t => t.id === taskId);
    if (idx !== -1) {
      this.tasks[idx] = { ...this.tasks[idx], ...updates };
      this.save();
      this.notify('TASK_UPDATE', this.tasks[idx]);
    }
  }
  deleteTask(taskId: string) {
    this.tasks = this.tasks.filter(t => t.id !== taskId);
    this.save();
    this.notify('TASK_DELETE', taskId);
  }
  releaseEscrow(id: string) {
    const tx = this.transactions.find(t => t.id === id);
    if (tx && tx.status === TransactionStatus.IN_ESCROW) {
      tx.status = TransactionStatus.COMPLETED;
      this.save();
      this.notify('TRANSACTION_UPDATE', tx);
    }
  }
  completeOnboarding(userId: string, data: any) {
    const user = Object.values(this.users).find(u => u.id === userId);
    if (user) {
      if (user.role === UserRole.AGENT) {
        const newAgent: Agent = {
          id: `a_${Date.now()}`,
          userId: user.id,
          businessName: data.businessName || user.name,
          category: data.category || AgentCategory.POS,
          avatarUrl: user.avatarUrl || '',
          rating: 5.0,
          isOnline: true,
          basePrice: data.basePrice || 1000,
          verificationStatus: VerificationStatus.PENDING,
          location: { lat: 6.5244, lng: 3.3792 }
        };
        this.agents.push(newAgent);
      }
      Object.assign(user, { ...data, status: UserStatus.ACTIVE });
      this.save();
      this.notify('USER_UPDATE', user);
    }
  }
  getTickets(scope: 'ALL' | 'USER' = 'USER') {
    if (scope === 'ALL') return this.tickets;
    return this.tickets.filter(t => t.userId === this.currentUser?.id);
  }
  sendTicketMessage(ticketId: string, senderId: string, text: string, isAdmin: boolean) {
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (ticket) {
      const msg: ChatMessage = { id: `msg_${Date.now()}`, text, timestamp: new Date().toISOString(), isAdmin, isSupport: isAdmin };
      ticket.messages.push(msg);
      ticket.updatedAt = new Date().toISOString();
      this.save();
      this.notify('TICKET_UPDATE', ticket);
    }
  }
  getChatSession(userId: string) {
    if (!this.chatSessions[userId]) this.chatSessions[userId] = { userId, messages: [] };
    return this.chatSessions[userId];
  }
  sendChatMessage(userId: string, text: string, isAdmin: boolean) {
    const session = this.getChatSession(userId);
    const msg: ChatMessage = { id: `msg_${Date.now()}`, text, timestamp: new Date().toISOString(), isAdmin, isSupport: isAdmin };
    session.messages.push(msg);
    this.save();
    this.notify('CHAT_UPDATE', session);
  }
  getCurrentUser() { return this.currentUser; }
  getAllUsers() { return Object.values(this.users); }
  getAgents() { return this.agents; }
  getMarketData() { return this.markets; }
  getAds() { return this.ads; }
  getTransactions(scope: 'ALL' | 'USER' = 'USER') {
    if (scope === 'ALL') return this.transactions;
    return this.transactions.filter(t => t.userId === this.currentUser?.id || t.recipientId === this.currentUser?.id);
  }
  getAdminBanks() { return this.adminBankAccounts; }
  getTasks(userId: string) { return this.tasks.filter(t => t.userId === userId); }
  getUserByAccountNumber(acc: string) { return Object.values(this.users).find(u => u.accountNumber === acc); }
  calculateSystemLiquidity() { 
    return { 
      totalLiquidityNGN: Object.values(this.users).reduce((s, u) => s + (u.status !== UserStatus.DEACTIVATED ? u.balance : 0), 0),
      totalNodes: Object.values(this.users).filter(u => u.status !== UserStatus.DEACTIVATED).length
    }; 
  }
  subscribe(callback: (event: RealTimeEvent) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
  logout() { 
    this.currentUser = null; 
    SecureStorage.setItem('auth_session', null); 
    window.location.reload(); 
  }
}

export const mockStore = new MockStore();
