
export enum UserRole {
  USER = 'USER',
  AGENT = 'AGENT',
  MERCHANT = 'MERCHANT',
  SUPPORT = 'SUPPORT',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  PENDING_SETUP = 'PENDING_SETUP', 
  PENDING_APPROVAL = 'PENDING_APPROVAL', 
  SUSPENDED = 'SUSPENDED',
  REJECTED = 'REJECTED',
  DEACTIVATED = 'DEACTIVATED'
}

export enum VerificationStatus {
  UNVERIFIED = 'UNVERIFIED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export enum WalletStatus {
  ACTIVE = 'ACTIVE',
  FROZEN = 'FROZEN',
  CLOSED = 'CLOSED'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  IN_ESCROW = 'IN_ESCROW',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  FLAGGED = 'FLAGGED',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED',
  DISPUTED = 'DISPUTED',
  REJECTED = 'REJECTED'
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TRANSFER = 'TRANSFER',
  SWAP = 'SWAP',
  ESCROW_PAYMENT = 'ESCROW_PAYMENT',
  SYSTEM_ADJUSTMENT = 'SYSTEM_ADJUSTMENT'
}

export enum AgentCategory {
  POS = 'POS',
  DRIVER = 'DRIVER',
  HOTEL = 'HOTEL',
  BARBER = 'BARBER'
}

// NEW: Task Management Types
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
}

export interface AIInsight {
  type: 'ADVICE' | 'ALERT' | 'OPPORTUNITY';
  message: string;
  actionLabel?: string;
  actionTarget?: string;
}

export enum LoanTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD'
}

export interface Loan {
  id: string;
  userId: string;
  amount: number;
  totalRepayment: number;
  dueDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  tier: LoanTier;
}

export interface AdminBankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  currency: string;
  isActive: boolean;
}

export interface User {
  id: string;
  username: string;
  name: string;
  displayName?: string;
  bio?: string;
  email: string;
  password?: string; 
  pin?: string; 
  walletNumber: string; 
  accountNumber: string; 
  phone?: string;
  role: UserRole;
  status: UserStatus;
  balance: number; 
  wallets: MultiCurrencyWallet[]; 
  preferredCurrency: string; 
  kycLevel: number;
  avatarUrl?: string;
  verificationStatus?: VerificationStatus;
  createdAt: string;
  referralCode: string;
  referredBy?: string;
  totalSpent: number;
  totalEarned: number;
  rating: number;
  reviewCount: number;
  limits?: {
    dailyLimit: number;
  };
  privacyMode?: boolean;
}

export interface MultiCurrencyWallet {
  id: string;
  currency: string; 
  balance: number;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  date: string; 
  status: TransactionStatus;
  description: string;
  recipientId?: string;
  recipientName?: string;
  recipientAccount?: string;
  referenceNumber?: string;
  evidenceUrl?: string;
  serviceType?: string;
}

export interface SystemLog {
  id: string;
  event: string;
  user: string;
  timestamp: string;
}

export interface RealTimeEvent {
  type: string;
  payload: any;
  timestamp: string;
}

export interface MarketData {
  currency: string;
  price: number;
  change24h: number; 
  trend: 'UP' | 'DOWN' | 'NEUTRAL';
  lastUpdated: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  timestamp: string;
  isAdmin?: boolean;
  isSupport?: boolean;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  status: 'OPEN' | 'CLOSED';
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatSession {
  userId: string;
  messages: ChatMessage[];
}

export interface Agent {
  id: string;
  userId: string;
  businessName: string;
  category: AgentCategory;
  avatarUrl: string;
  rating: number;
  isOnline: boolean;
  basePrice: number;
  location?: { lat: number, lng: number };
  phone?: string;
  verificationStatus?: VerificationStatus;
}

export interface Ad {
  id: string;
  text: string;
  color?: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'SUCCESS' | 'ERROR' | 'INFO' | 'LIVE';
  timestamp: string;
}
