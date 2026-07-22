export type Currency = 'EUR' | 'XOF';

export type UserRole = 'SENDER' | 'RECEIVER';

export type KycTier = 'UNVERIFIED' | 'TIER_1' | 'TIER_2';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  country: string;
  countryCode: string;
  flag: string;
  avatar?: string;
  kycStatus: 'NOT_STARTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  kycTier: KycTier;
  role?: 'USER' | 'ADMIN';
}

export interface Wallet {
  id: string;
  userId: string;
  balanceEUR: number;
  balanceXOF: number;
  updatedAt: string;
}

export type TransactionType = 'SEND' | 'RECEIVE' | 'WITHDRAW';

export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'FAILED';

export interface Transaction {
  id: string; // e.g. SDN-124578965 or WD-45879632
  type: TransactionType;
  title: string;
  senderOrRecipientName: string;
  senderOrRecipientPhone?: string;
  amountEUR: number;
  amountXOF: number;
  feeEUR: number;
  feeXOF: number;
  exchangeRate: number; // e.g. 655 XOF per 1 EUR
  status: TransactionStatus;
  geniusPayRef: string;
  paymentMethod?: string; // e.g. "Carte bancaire", "Flooz", "T-Money", "Orange Money", "Wave"
  createdAt: string;
  formattedDate: string;
}

export interface Beneficiary {
  id: string;
  name: string;
  phone: string;
  country: string;
  countryCode: string;
  flag: string;
  operator: 'Flooz' | 'T-Money' | 'Orange Money' | 'MTN MoMo' | 'Moov' | 'Wave' | 'Bank';
  avatarBg?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'mobile_money';
  title: string;
  subtitle: string;
  iconName: string;
  details?: string;
}
