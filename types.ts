
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
  REJECTED = 'REJECTED'
}

export enum VerificationStatus {
  UNVERIFIED = 'UNVERIFIED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  IN_ESCROW = 'IN_ESCROW',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  FLAGGED = 'FLAGGED',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED',
  DISPUTED = 'DISPUTED'
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TRANSFER = 'TRANSFER',
  SWAP = 'SWAP',
  ESCROW_PAYMENT = 'ESCROW_PAYMENT',
  SYSTEM_ADJUSTMENT = 'SYSTEM_ADJUSTMENT'
}

export interface LatLng {
  lat: number;
  lng: number;
}

export enum AgentCategory {
  POS = 'POS',
  DRIVER = 'DRIVER',
  HOTEL = 'HOTEL',
  BARBER = 'BARBER',
  DELIVERY = 'DELIVERY',
  ELECTRICIAN = 'ELECTRICIAN',
  OTHER = 'OTHER'
}

export interface MultiCurrencyWallet {
  id: string;
  currency: string; 
  balance: number;
  isDefault: boolean;
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
  walletNumber: string; // 6-digit ID
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
  
  // Professional Update Fields
  referralCode: string;
  referredBy?: string;
  totalSpent: number;
  totalEarned: number;
  rating: number;
  reviewCount: number;
  businessAddress?: string;
  businessPhoto?: string;
  
  // Financial Prefs
  privacyMode?: boolean;
  externalBank?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };

  limits?: {
    dailyLimit: number;
  };
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  toCurrency?: string; 
  date: string; 
  status: TransactionStatus;
  description: string;
  recipientId?: string;
  recipientName?: string;
  isEscrow?: boolean;
  serviceType?: AgentCategory;
  referenceNumber?: string;
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
  senderId: string;
  text: string;
  timestamp: string;
  isAdmin: boolean;
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

export interface AIInsight {
  type: 'ADVICE' | 'ALERT' | 'OPPORTUNITY';
  message: string;
  actionLabel?: string;
  actionTarget?: string;
}

export interface Agent {
  id: string;
  userId: string;
  businessName: string;
  category: AgentCategory;
  avatarUrl: string;
  rating: number;
  ratingCount: number;
  isOnline: boolean;
  location?: LatLng;
  basePrice: number;
  verificationStatus: VerificationStatus;
  phone?: string;
  description?: string;
  operatingHours?: string;
  travelRadius?: number; // in km
}

export interface Ad {
  id: string;
  text: string;
  color?: string;
}

export enum WalletStatus {
  ACTIVE = 'ACTIVE',
  FROZEN = 'FROZEN',
  MAINTENANCE = 'MAINTENANCE'
}

export interface WealthInsight {
  category: string;
  percentage: number;
  trend: 'UP' | 'DOWN';
  message: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'SUCCESS' | 'ERROR' | 'INFO' | 'LIVE';
  timestamp: string;
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
  status: 'PENDING' | 'APPROVED' | 'REPAID' | 'DEFAULTED';
  tier: LoanTier;
}

export interface ChatSession {
    messages: {
        id: string;
        text: string;
        timestamp: string;
        isSupport: boolean;
    }[];
}
