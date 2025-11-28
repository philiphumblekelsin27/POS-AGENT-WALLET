

export enum UserRole {
  USER = 'USER',
  AGENT = 'AGENT',
  MERCHANT = 'MERCHANT',
  ADMIN = 'ADMIN',
  SUPPORT = 'SUPPORT'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  PENDING_SETUP = 'PENDING_SETUP', 
  PENDING_APPROVAL = 'PENDING_APPROVAL', 
  SUSPENDED = 'SUSPENDED',
  REJECTED = 'REJECTED',
  DELETED = 'DELETED'
}

export enum VerificationStatus {
  UNVERIFIED = 'UNVERIFIED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED'
}

export enum AgentCategory {
  POS = 'POS',
  DRIVER = 'DRIVER',
  HOTEL = 'HOTEL',
  DELIVERY = 'DELIVERY',
  HAIRDRESSER = 'HAIRDRESSER',
  CLEANER = 'CLEANER',
  TRADES = 'TRADES', // Plumber, Electrician
  MERCHANT = 'MERCHANT',
  HEALTH = 'HEALTH',
  EDUCATION = 'EDUCATION', // Tutor
  EVENT = 'EVENT',
  OTHER = 'OTHER'
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TRANSFER = 'TRANSFER',
  PAYMENT = 'PAYMENT',
  LOAN_DISBURSEMENT = 'LOAN_DISBURSEMENT',
  LOAN_REPAYMENT = 'LOAN_REPAYMENT'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  FLAGGED = 'FLAGGED'
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface SystemSettings {
  bankAccounts: BankAccount[];
  supportPhone: string;
  supportEmail: string;
}

export interface KycLimits {
  dailyLimit: number;
  weeklyLimit: number;
  dailyUsed: number;
  weeklyUsed: number;
}

export interface KycData {
  dob?: string;
  gender?: string;
  nin?: string;
  bvn?: string;
  address?: string;
  idType?: string;
  idNumber?: string;
  idFrontUrl?: string;
  idBackUrl?: string;
  selfieUrl?: string;
  proofOfAddressUrl?: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  password?: string; 
  accountNumber: string; // Wallet Number
  phone?: string;
  role: UserRole;
  status: UserStatus;
  balance: number;
  kycLevel: number; // 0..3
  avatarUrl?: string;
  location?: { lat: number; lng: number };
  limits?: KycLimits;
  kycData?: KycData; 
  bio?: string;
  interests?: string[];
  isVerified?: boolean;
  verificationStatus?: VerificationStatus;
  verificationNotes?: string;
  createdAt: string;
}

// Service Specific Fields
export interface DriverDetails {
  vehicleMake: string;
  vehicleModel: string;
  plateNumber: string;
  color: string;
  licenseNumber: string;
}

export interface HotelDetails {
  checkInTime: string;
  checkOutTime: string;
  amenities: string[];
  roomRate: number;
}

export interface POSDetails {
  shopAddress: string;
  cashCapacity: number;
}

export interface Agent extends User {
  agentNumber: string; // AN-CAT-XXXX
  businessName: string;
  category: AgentCategory;
  subcategories: string[];
  description: string;
  rating: number;
  ratingCount: number;
  isOnline: boolean;
  services: string[]; // Legacy simple list
  workingHours?: string;
  pricingModel?: 'FIXED' | 'HOURLY' | 'COMMISSION';
  
  // Specific Data
  driverDetails?: DriverDetails;
  hotelDetails?: HotelDetails;
  posDetails?: POSDetails;
  
  // Documents
  documents?: {
    businessRegUrl?: string;
    certificateUrl?: string;
    insuranceUrl?: string;
  };

  portfolioImages?: string[];
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  
  totalCommission: number;
  completedJobs: number;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  date: string; 
  status: TransactionStatus;
  description: string;
  receiptUrl?: string;
  aiConfidence?: number;
  aisuggestedAmount?: number;
  recipientId?: string; 
}

export interface Ad {
  id: string;
  text: string;
  color: string;
  active: boolean;
}

export enum LoanStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID'
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
  interest: number;
  totalRepayment: number;
  dueDate: string;
  status: LoanStatus;
  tier: LoanTier;
  dateRequested: string;
}

export enum ServiceRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED'
}

export interface ServiceRequest {
  id: string;
  userId: string;
  agentId: string;
  serviceType: string;
  status: ServiceRequestStatus;
  date: string;
  userName: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isSupport: boolean;
}

export interface ChatSession {
  userId: string;
  userName: string;
  avatarUrl?: string;
  messages: ChatMessage[];
  lastMessageAt: string;
  unreadCount: number;
}

export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  targetId: string;
  details: string;
  timestamp: string;
}

export interface ViolationLevel {
    level: number;
    description: string;
    action: string;
}

// Global Types for Google Integration
declare global {
  interface Window {
    google: any;
    initMap: () => void;
    adsbygoogle: any[];
  }
}