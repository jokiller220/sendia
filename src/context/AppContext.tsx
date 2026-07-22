import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, Wallet, Transaction, Beneficiary, Currency } from '../types';
import { supabase } from '../lib/supabase';
import { geniusPay } from '../lib/geniuspay';

export type ScreenId =
  | 'welcome'
  | 'login'
  | 'register'
  | 'otp'
  | 'password'
  | 'auth_success'
  | 'kyc_overview'
  | 'kyc_doc_select'
  | 'kyc_doc_capture'
  | 'kyc_selfie_capture'
  | 'kyc_processing'
  | 'dashboard'
  | 'send_amount'
  | 'send_payment_method'
  | 'send_summary'
  | 'send_success'
  | 'withdraw_amount'
  | 'withdraw_status';

export type DashboardTab = 'home' | 'transactions' | 'beneficiaries' | 'profile';

interface AppContextType {
  // Navigation & Screen State
  currentScreen: ScreenId;
  setCurrentScreen: (screen: ScreenId) => void;
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  
  // Auth Session Protection
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;

  // App Currency Mode
  activeCurrency: Currency;
  setActiveCurrency: (currency: Currency) => void;
  exchangeRate: number; // EUR -> XOF rate (e.g. 655)

  // Supabase Connection Status
  isSupabaseConnected: boolean;
  supabaseUrl: string;

  // Data State
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  wallet: Wallet;
  setWallet: React.Dispatch<React.SetStateAction<Wallet>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  beneficiaries: Beneficiary[];
  setBeneficiaries: React.Dispatch<React.SetStateAction<Beneficiary[]>>;
  selectedTransaction: Transaction | null;
  setSelectedTransaction: (tx: Transaction | null) => void;
  
  // Flow State
  sendDraft: {
    amountEUR: number;
    amountXOF: number;
    feeEUR: number;
    recipientName: string;
    recipientPhone: string;
    recipientCountry: string;
    paymentMethodTitle: string;
    useWalletBalance: boolean;
  };
  setSendDraft: React.Dispatch<React.SetStateAction<AppContextType['sendDraft']>>;

  withdrawDraft: {
    amountXOF: number;
    amountEUR: number;
    feeXOF: number;
    operator: string;
    phoneOrIban: string;
  };
  setWithdrawDraft: React.Dispatch<React.SetStateAction<AppContextType['withdrawDraft']>>;

  // Actions
  registerNewAccount: (name: string, phone: string, email: string) => Promise<void>;
  rechargeWallet: (amountEUR: number) => Promise<void>;
  updateWalletBalance: (newEur: number) => Promise<void>;
  addBeneficiary: (beneficiary: Omit<Beneficiary, 'id'>) => void;
  executeSendMoney: () => Promise<void>;
  executeWithdrawal: () => Promise<void>;
  submitKyc: () => void;
  resetAppState: () => void;
  simulateWebhookPaymentSuccess: (amountEUR: number, senderName: string) => void;
  goBack: () => void;
  
  // Notification Drawer
  notifications: { id: string; title: string; message: string; date: string; unread: boolean }[];
  markNotificationsAsRead: () => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
}

const DEFAULT_USER: UserProfile = {
  id: 'usr_new',
  name: 'Membre Sendia',
  phone: '+33 6 00 00 00 00',
  email: 'membre@sendia.app',
  country: 'France',
  countryCode: 'FR',
  flag: '🇫🇷',
  kycStatus: 'NOT_STARTED',
  kycTier: 'UNVERIFIED',
};

const DEFAULT_WALLET: Wallet = {
  id: 'wal_new',
  userId: 'usr_new',
  balanceEUR: 0.00, // Zero balance by default
  balanceXOF: 0,
  updatedAt: new Date().toISOString(),
};

const DEFAULT_BENEFICIARIES: Beneficiary[] = [];
const DEFAULT_TRANSACTIONS: Transaction[] = [];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticatedState] = useState<boolean>(() => {
    const savedAuth = localStorage.getItem('sendia_auth');
    return savedAuth !== null ? JSON.parse(savedAuth) : false;
  });

  const [currentScreen, setCurrentScreenRaw] = useState<ScreenId>(() => {
    const savedAuth = localStorage.getItem('sendia_auth');
    const isLoggedIn = savedAuth !== null ? JSON.parse(savedAuth) : false;
    return isLoggedIn ? 'dashboard' : 'welcome';
  });

  const [activeTab, setActiveTab] = useState<DashboardTab>('home');
  const [activeCurrency, setActiveCurrency] = useState<Currency>('EUR');
  const exchangeRate = 655; // 1 EUR = 655 XOF

  const setIsAuthenticated = (auth: boolean) => {
    setIsAuthenticatedState(auth);
    localStorage.setItem('sendia_auth', JSON.stringify(auth));
    // Redirect screen based on auth state
    setCurrentScreenRaw(auth ? 'dashboard' : 'welcome');
  };

  // Auth Redirection Guard
  const setCurrentScreen = (screen: ScreenId) => {
    const authScreens: ScreenId[] = ['welcome', 'login', 'register', 'otp', 'password'];
    
    // If logged in and trying to go to auth screens, force dashboard
    if (isAuthenticated && authScreens.includes(screen)) {
      setCurrentScreenRaw('dashboard');
      return;
    }

    // If NOT logged in and trying to go to protected screens, force welcome
    if (!isAuthenticated && !authScreens.includes(screen) && screen !== 'auth_success') {
      setCurrentScreenRaw('welcome');
      return;
    }

    setCurrentScreenRaw(screen);
  };

  const goBack = () => {
    const subScreens: ScreenId[] = [
      'send_amount', 'send_payment_method', 'send_summary', 'send_success',
      'withdraw_amount', 'withdraw_status',
      'kyc_overview', 'kyc_doc_select', 'kyc_doc_capture', 'kyc_selfie_capture', 'kyc_processing',
      'otp', 'password', 'register', 'login'
    ];

    if (subScreens.includes(currentScreen)) {
      if (currentScreen === 'send_payment_method') setCurrentScreen('send_amount');
      else if (currentScreen === 'send_summary') setCurrentScreen('send_payment_method');
      else if (currentScreen === 'send_success') setCurrentScreen('dashboard');
      else if (currentScreen === 'withdraw_status') setCurrentScreen('dashboard');
      else if (currentScreen === 'kyc_doc_select') setCurrentScreen('kyc_overview');
      else if (currentScreen === 'kyc_doc_capture') setCurrentScreen('kyc_doc_select');
      else if (currentScreen === 'kyc_selfie_capture') setCurrentScreen('kyc_doc_capture');
      else if (currentScreen === 'otp') setCurrentScreen('register');
      else if (currentScreen === 'password') setCurrentScreen('otp');
      else if (currentScreen === 'login') setCurrentScreen('welcome');
      else setCurrentScreen('dashboard');
    }
  };

  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(true);
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jkfruplfaxdiufrqzeew.supabase.co';

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('sendia_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  const [wallet, setWallet] = useState<Wallet>(() => {
    const saved = localStorage.getItem('sendia_wallet');
    return saved ? JSON.parse(saved) : DEFAULT_WALLET;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('sendia_transactions');
    return saved ? JSON.parse(saved) : DEFAULT_TRANSACTIONS;
  });

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(() => {
    const saved = localStorage.getItem('sendia_beneficiaries');
    return saved ? JSON.parse(saved) : DEFAULT_BENEFICIARIES;
  });

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  const [notifications, setNotifications] = useState([
    { id: 'notif-1', title: 'Base de données Supabase', message: 'Bienvenue sur Sendia ! Votre wallet est actif.', date: 'Aujourd\'hui', unread: true },
    { id: 'notif-2', title: 'GeniusPay Live', message: 'Clés API Production opérationnelles', date: 'Aujourd\'hui', unread: true },
  ]);

  const [sendDraft, setSendDraft] = useState<AppContextType['sendDraft']>({
    amountEUR: 50.00,
    amountXOF: 32750,
    feeEUR: 0.00,
    recipientName: '',
    recipientPhone: '',
    recipientCountry: 'Togo',
    paymentMethodTitle: 'Carte bancaire (Visa/Mastercard)',
    useWalletBalance: false,
  });

  const [withdrawDraft, setWithdrawDraft] = useState<AppContextType['withdrawDraft']>({
    amountXOF: 10000,
    amountEUR: 15.27,
    feeXOF: 100,
    operator: 'Flooz',
    phoneOrIban: '',
  });

  // Auto-initialize the Admin Treasury Wallet on load
  useEffect(() => {
    async function ensureAdminWalletExists() {
      const ADMIN_USER_ID = '00000000-0000-0000-0000-000000000000';
      try {
        const { data: adminUser } = await supabase.from('users').select('id').eq('id', ADMIN_USER_ID).maybeSingle();
        if (!adminUser) {
          // Create admin treasury user
          await supabase.from('users').insert([{
            id: ADMIN_USER_ID,
            name: 'Trésorerie Sendia',
            phone: '+33000000000',
            email: 'admin@sendia.app',
            country: 'France',
            country_code: 'FR',
            flag: '🇫🇷',
            kyc_status: 'VERIFIED',
            kyc_tier: 'TIER_2'
          }]);

          // Create admin treasury wallet
          await supabase.from('wallets').insert([{
            id: '00000000-0000-0000-0000-000000000001',
            user_id: ADMIN_USER_ID,
            balance_eur: 0.00,
            balance_xof: 0,
            updated_at: new Date().toISOString()
          }]);
          console.log('[Treasury] Initialized admin treasury user and wallet.');
        }
      } catch (err) {
        console.warn('[Treasury] Initialisation warning:', err);
      }
    }
    ensureAdminWalletExists();
  }, []);

  // Verify and sync live data from Supabase
  useEffect(() => {
    async function fetchSupabaseData() {
      if (!user || !user.phone || user.phone === '+33 6 00 00 00 00') return;

      try {
        setIsSupabaseConnected(true);
        const { data: usersData } = await supabase.from('users').select('*').eq('phone', user.phone).single();
        if (usersData) {
          setUser({
            id: usersData.id,
            name: usersData.name,
            phone: usersData.phone,
            email: usersData.email,
            country: usersData.country,
            countryCode: usersData.country_code,
            flag: usersData.flag,
            kycStatus: usersData.kyc_status,
            kycTier: usersData.kyc_tier,
          });

          // Fetch Wallet from Supabase
          const { data: walletData } = await supabase.from('wallets').select('*').eq('user_id', usersData.id).single();
          if (walletData) {
            setWallet({
              id: walletData.id,
              userId: walletData.user_id,
              balanceEUR: parseFloat(walletData.balance_eur),
              balanceXOF: parseInt(walletData.balance_xof, 10),
              updatedAt: walletData.updated_at,
            });
          }

          // Fetch Transactions from Supabase
          const { data: txsData } = await supabase.from('transactions').select('*').eq('user_id', usersData.id).order('created_at', { ascending: false });
          if (txsData) {
            setTransactions(txsData.map(t => ({
              id: t.id,
              type: t.type,
              title: t.title,
              senderOrRecipientName: t.sender_or_recipient_name,
              senderOrRecipientPhone: t.sender_or_recipient_phone,
              amountEUR: parseFloat(t.amount_eur),
              amountXOF: parseInt(t.amount_xof, 10),
              feeEUR: parseFloat(t.fee_eur),
              feeXOF: parseInt(t.fee_xof, 10),
              exchangeRate: parseFloat(t.exchange_rate),
              status: t.status,
              geniusPayRef: t.genius_pay_ref,
              paymentMethod: t.payment_method,
              createdAt: t.created_at,
              formattedDate: t.formatted_date || 'Récemment',
            })));
          }

          // Fetch Beneficiaries from Supabase
          const { data: benData } = await supabase.from('beneficiaries').select('*').eq('user_id', usersData.id);
          if (benData) {
            setBeneficiaries(benData.map(b => ({
              id: b.id,
              name: b.name,
              phone: b.phone,
              country: b.country,
              countryCode: b.country_code,
              flag: b.flag,
              operator: b.operator,
              avatarBg: b.avatar_bg || 'bg-indigo-500',
            })));
          }
        }
      } catch (err) {
        console.log('Supabase load note:', err);
      }
    }

    fetchSupabaseData();
  }, [user.phone]);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('sendia_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('sendia_wallet', JSON.stringify(wallet));
  }, [wallet]);

  useEffect(() => {
    localStorage.setItem('sendia_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('sendia_beneficiaries', JSON.stringify(beneficiaries));
  }, [beneficiaries]);

  /**
   * Helper function to update wallet balance in both React state and Supabase DB
   */
  const updateWalletBalance = async (newEur: number) => {
    const roundedEur = Math.round(newEur * 100) / 100;
    const roundedXof = Math.round(roundedEur * exchangeRate);
    const updatedAt = new Date().toISOString();

    const updated = {
      ...wallet,
      balanceEUR: roundedEur,
      balanceXOF: roundedXof,
      updatedAt,
    };

    setWallet(updated);

    try {
      await supabase.from('wallets').update({
        balance_eur: roundedEur,
        balance_xof: roundedXof,
        updated_at: updatedAt,
      }).eq('user_id', user.id);
    } catch (e) {
      console.log('Supabase wallet update error:', e);
    }
  };

  /**
   * Recharge Wallet (Recharger mon solde via CB/GeniusPay)
   */
  const rechargeWallet = async (amountEUR: number) => {
    const newBalance = wallet.balanceEUR + amountEUR;
    await updateWalletBalance(newBalance);

    const newTx: Transaction = {
      id: `SDN-TOPUP-${Math.floor(10000000 + Math.random() * 90000000)}`,
      type: 'RECEIVE',
      title: 'Rechargement Wallet (CB)',
      senderOrRecipientName: 'Mon Compte Bancaire',
      amountEUR: amountEUR,
      amountXOF: Math.round(amountEUR * exchangeRate),
      feeEUR: 0,
      feeXOF: 0,
      exchangeRate,
      status: 'COMPLETED',
      geniusPayRef: `GPAY-TOPUP-${Math.floor(100000 + Math.random() * 900000)}`,
      paymentMethod: 'Carte bancaire',
      createdAt: new Date().toISOString(),
      formattedDate: 'À l\'instant',
    };

    setTransactions(prev => [newTx, ...prev]);

    supabase.from('transactions').insert([{
      id: newTx.id,
      user_id: user.id,
      type: newTx.type,
      title: newTx.title,
      sender_or_recipient_name: newTx.senderOrRecipientName,
      amount_eur: newTx.amountEUR,
      amount_xof: newTx.amountXOF,
      fee_eur: newTx.feeEUR,
      fee_xof: newTx.feeXOF,
      exchange_rate: newTx.exchangeRate,
      status: newTx.status,
      genius_pay_ref: newTx.geniusPayRef,
      payment_method: newTx.paymentMethod,
      formatted_date: newTx.formattedDate,
    }]).then();
  };

  /**
   * Register a brand new real user account directly in Supabase DB (0.00 € initial balance)
   */
  const registerNewAccount = async (name: string, phone: string, email: string) => {
    const newUser: UserProfile = {
      id: crypto.randomUUID(),
      name: name || 'Membre Sendia',
      phone,
      email: email || `${phone.replace(/\s+/g, '')}@sendia.app`,
      country: user.country || 'France',
      countryCode: user.countryCode || 'FR',
      flag: user.flag || '🇫🇷',
      kycStatus: 'NOT_STARTED',
      kycTier: 'UNVERIFIED',
    };

    const newWallet: Wallet = {
      id: crypto.randomUUID(),
      userId: newUser.id,
      balanceEUR: 0.00, // 0.00 € initial balance (No fake gifts or hardcoded bonuses)
      balanceXOF: 0,
      updatedAt: new Date().toISOString(),
    };

    setUser(newUser);
    setWallet(newWallet);
    setTransactions([]);
    setBeneficiaries([]);
    setIsAuthenticated(true);

    // Insert into Supabase
    try {
      await supabase.from('users').insert([{
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
        country: newUser.country,
        country_code: newUser.countryCode,
        flag: newUser.flag,
        kyc_status: newUser.kycStatus,
        kyc_tier: newUser.kycTier,
      }]);

      await supabase.from('wallets').insert([{
        id: newWallet.id,
        user_id: newUser.id,
        balance_eur: newWallet.balanceEUR,
        balance_xof: newWallet.balanceXOF,
      }]);
    } catch (e) {
      console.log('Supabase account register sync note:', e);
    }
  };

  const addBeneficiary = (b: Omit<Beneficiary, 'id'>) => {
    const newBen: Beneficiary = {
      ...b,
      id: crypto.randomUUID(),
      avatarBg: 'bg-indigo-500',
    };
    setBeneficiaries(prev => [newBen, ...prev]);

    // Supabase sync
    supabase.from('beneficiaries').insert([{
      id: newBen.id,
      user_id: user.id,
      name: newBen.name,
      phone: newBen.phone,
      country: newBen.country,
      country_code: newBen.countryCode,
      flag: newBen.flag,
      operator: newBen.operator,
      avatar_bg: newBen.avatarBg,
    }]).then(({ error }) => {
      if (error) console.log('Supabase sync info:', error.message);
    });
  };

  const executeSendMoney = async () => {
    let geniusRef = `GPAY-LIVE-${Math.floor(100000 + Math.random() * 900000)}`;

    if (!sendDraft.useWalletBalance) {
      // Payment was already done via GeniusPay checkout before reaching here.
      // The reference is stored in the pending send draft from localStorage.
      const pendingStr = localStorage.getItem('sendia_completed_ref');
      if (pendingStr) geniusRef = pendingStr;
    } else {
      geniusRef = `SDN-WALLET-TRANSFER-${Math.floor(100000 + Math.random() * 900000)}`;
    }

    const newTx: Transaction = {
      id: `SDN-${Math.floor(100000000 + Math.random() * 900000000)}`,
      type: 'SEND',
      title: `Envoyé à ${sendDraft.recipientName}`,
      senderOrRecipientName: sendDraft.recipientName,
      senderOrRecipientPhone: sendDraft.recipientPhone,
      amountEUR: sendDraft.amountEUR,
      amountXOF: sendDraft.amountXOF,
      feeEUR: sendDraft.feeEUR,
      feeXOF: Math.round(sendDraft.feeEUR * exchangeRate),
      exchangeRate,
      status: 'COMPLETED',
      geniusPayRef: geniusRef,
      paymentMethod: sendDraft.paymentMethodTitle,
      createdAt: new Date().toISOString(),
      formattedDate: 'À l\'instant',
    };

    setTransactions(prev => [newTx, ...prev]);

    // Update wallet balance if paid via wallet balance
    if (sendDraft.useWalletBalance) {
      const newBalance = Math.max(0, wallet.balanceEUR - sendDraft.amountEUR - sendDraft.feeEUR);
      await updateWalletBalance(newBalance);
    }

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'Transfert effectué',
        message: `${sendDraft.amountXOF.toLocaleString('fr-FR')} XOF envoyés à ${sendDraft.recipientName} via ${sendDraft.paymentMethodTitle}`,
        date: 'À l\'instant',
        unread: true,
      },
      ...prev,
    ]);

    // Supabase sync & Wallet-to-Wallet credit in DB
    supabase.from('transactions').insert([{
      id: newTx.id,
      user_id: user.id,
      type: newTx.type,
      title: newTx.title,
      sender_or_recipient_name: newTx.senderOrRecipientName,
      sender_or_recipient_phone: newTx.senderOrRecipientPhone,
      amount_eur: newTx.amountEUR,
      amount_xof: newTx.amountXOF,
      fee_eur: newTx.feeEUR,
      fee_xof: newTx.feeXOF,
      exchange_rate: newTx.exchangeRate,
      status: newTx.status,
      genius_pay_ref: newTx.geniusPayRef,
      payment_method: newTx.paymentMethod,
      formatted_date: newTx.formattedDate,
    }]).then(({ error }) => {
      if (error) console.log('Supabase tx sync info:', error.message);
    });

    // Credit transaction fee to Admin Wallet in Supabase
    if (sendDraft.feeEUR > 0) {
      try {
        const ADMIN_USER_ID = '00000000-0000-0000-0000-000000000000';
        const { data: adminWallet } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', ADMIN_USER_ID)
          .maybeSingle();

        if (adminWallet) {
          const updatedEur = parseFloat(adminWallet.balance_eur) + sendDraft.feeEUR;
          const updatedXof = parseInt(adminWallet.balance_xof, 10) + Math.round(sendDraft.feeEUR * exchangeRate);

          await supabase
            .from('wallets')
            .update({
              balance_eur: updatedEur,
              balance_xof: updatedXof,
              updated_at: new Date().toISOString()
            })
            .eq('id', adminWallet.id);
            
          // Add earning transaction for admin treasury
          await supabase.from('transactions').insert([{
            id: `FEE-${Math.floor(100000000 + Math.random() * 900000000)}`,
            user_id: ADMIN_USER_ID,
            type: 'RECEIVE',
            title: `Commission - Transfert de ${user.name}`,
            sender_or_recipient_name: user.name,
            sender_or_recipient_phone: user.phone,
            amount_eur: sendDraft.feeEUR,
            amount_xof: Math.round(sendDraft.feeEUR * exchangeRate),
            fee_eur: 0,
            fee_xof: 0,
            exchange_rate: exchangeRate,
            status: 'COMPLETED',
            genius_pay_ref: geniusRef,
            payment_method: 'Commission Sendia',
            formatted_date: 'À l\'instant',
          }]);
        }
      } catch (err) {
        console.error('Error crediting fee to admin wallet:', err);
      }
    }

    // Credit recipient wallet in Supabase DB if recipient exists
    if (sendDraft.recipientPhone) {
      const cleanPhone = sendDraft.recipientPhone.trim().replace(/\s+/g, '');
      const digitsOnly = cleanPhone.replace(/\D/g, '');
      const lastDigits = digitsOnly.substring(Math.max(0, digitsOnly.length - 8));

      const { data: recipientUsers } = await supabase
        .from('users')
        .select('id, name, phone')
        .ilike('phone', `%${lastDigits}%`);
      
      const recipient = (recipientUsers || []).find(u => {
        const dbPhoneClean = u.phone.replace(/\D/g, '');
        const searchPhoneClean = digitsOnly;
        return dbPhoneClean.endsWith(searchPhoneClean) || searchPhoneClean.endsWith(dbPhoneClean);
      });
      
      if (recipient) {
        const { data: recipientWallets } = await supabase.from('wallets').select('*').eq('user_id', recipient.id);

        if (recipientWallets && recipientWallets.length > 0) {
          const recWallet = recipientWallets[0];
          const updatedXof = (recWallet.balance_xof || 0) + sendDraft.amountXOF;
          const updatedEur = (recWallet.balance_eur || 0) + sendDraft.amountEUR;

          await supabase.from('wallets').update({
            balance_xof: updatedXof,
            balance_eur: updatedEur,
            updated_at: new Date().toISOString()
          }).eq('id', recWallet.id);

          // Add transaction record for recipient
          await supabase.from('transactions').insert([{
            id: `SDN-REC-${Math.floor(100000000 + Math.random() * 900000000)}`,
            user_id: recipient.id,
            type: 'RECEIVE',
            title: `Reçu de ${user.name}`,
            sender_or_recipient_name: user.name,
            sender_or_recipient_phone: user.phone,
            amount_eur: sendDraft.amountEUR,
            amount_xof: sendDraft.amountXOF,
            fee_eur: 0,
            fee_xof: 0,
            exchange_rate: exchangeRate,
            status: 'COMPLETED',
            genius_pay_ref: geniusRef,
            payment_method: 'Transfert Wallet Sendia',
            formatted_date: 'À l\'instant',
          }]);
        }
      }
    }
  };

  const executeWithdrawal = async () => {
    // Invoke GeniusPay Payout API
    const gpayRes = await geniusPay.createPayout({
      amount: withdrawDraft.amountXOF,
      currency: 'XOF',
      recipientPhone: withdrawDraft.phoneOrIban,
      operator: withdrawDraft.operator,
      description: `Sendia Payout ${withdrawDraft.operator}`,
    });

    const newTx: Transaction = {
      id: `WD-${Math.floor(10000000 + Math.random() * 90000000)}`,
      type: 'WITHDRAW',
      title: `Retrait ${withdrawDraft.operator}`,
      senderOrRecipientName: `Compte ${withdrawDraft.operator}`,
      senderOrRecipientPhone: withdrawDraft.phoneOrIban,
      amountEUR: withdrawDraft.amountEUR,
      amountXOF: withdrawDraft.amountXOF,
      feeEUR: Math.round((withdrawDraft.feeXOF / exchangeRate) * 100) / 100,
      feeXOF: withdrawDraft.feeXOF,
      exchangeRate,
      status: 'COMPLETED',
      geniusPayRef: gpayRes.reference || `GPAY-WD-${Math.floor(10000 + Math.random() * 90000)}`,
      paymentMethod: `${withdrawDraft.operator} (${withdrawDraft.phoneOrIban})`,
      createdAt: new Date().toISOString(),
      formattedDate: 'À l\'instant',
    };

    setTransactions(prev => [newTx, ...prev]);

    // Debit wallet balance
    const newBalance = Math.max(0, wallet.balanceEUR - withdrawDraft.amountEUR);
    await updateWalletBalance(newBalance);

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'Retrait GeniusPay Payout',
        message: `${withdrawDraft.amountXOF.toLocaleString('fr-FR')} XOF retirés vers ${withdrawDraft.operator}`,
        date: 'À l\'instant',
        unread: true,
      },
      ...prev,
    ]);

    supabase.from('transactions').insert([{
      id: newTx.id,
      user_id: user.id,
      type: newTx.type,
      title: newTx.title,
      sender_or_recipient_name: newTx.senderOrRecipientName,
      sender_or_recipient_phone: newTx.senderOrRecipientPhone,
      amount_eur: newTx.amountEUR,
      amount_xof: newTx.amountXOF,
      fee_eur: newTx.feeEUR,
      fee_xof: newTx.feeXOF,
      exchange_rate: newTx.exchangeRate,
      status: newTx.status,
      genius_pay_ref: newTx.geniusPayRef,
      payment_method: newTx.paymentMethod,
      formatted_date: newTx.formattedDate,
    }]).then(({ error }) => {
      if (error) console.log('Supabase wd sync info:', error.message);
    });
  };

  const submitKyc = () => {
    const updatedUser = {
      ...user,
      kycStatus: 'VERIFIED' as const,
      kycTier: 'TIER_2' as const,
    };
    setUser(updatedUser);

    supabase.from('users').update({
      kyc_status: 'VERIFIED',
      kyc_tier: 'TIER_2',
    }).eq('id', user.id).then();
  };

  const simulateWebhookPaymentSuccess = (amountEUR: number, senderName: string) => {
    const amountXOF = Math.round(amountEUR * exchangeRate);
    const newTx: Transaction = {
      id: `SDN-WEBHOOK-${Math.floor(10000000 + Math.random() * 90000000)}`,
      type: 'RECEIVE',
      title: `Reçu de ${senderName}`,
      senderOrRecipientName: senderName,
      amountEUR,
      amountXOF,
      feeEUR: 0,
      feeXOF: 0,
      exchangeRate,
      status: 'COMPLETED',
      geniusPayRef: `WEBHOOK-GPAY-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      formattedDate: 'À l\'instant',
    };

    setTransactions(prev => [newTx, ...prev]);

    // Credit wallet
    const newEur = wallet.balanceEUR + amountEUR;
    updateWalletBalance(newEur);

    supabase.from('transactions').insert([{
      id: newTx.id,
      user_id: user.id,
      type: newTx.type,
      title: newTx.title,
      sender_or_recipient_name: newTx.senderOrRecipientName,
      amount_eur: newTx.amountEUR,
      amount_xof: newTx.amountXOF,
      fee_eur: newTx.feeEUR,
      fee_xof: newTx.feeXOF,
      exchange_rate: newTx.exchangeRate,
      status: newTx.status,
      genius_pay_ref: newTx.geniusPayRef,
      formatted_date: newTx.formattedDate,
    }]).then();
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const resetAppState = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUser(DEFAULT_USER);
    setWallet(DEFAULT_WALLET);
    setTransactions([]);
    setBeneficiaries([]);
    setCurrentScreenRaw('welcome');
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        activeTab,
        setActiveTab,
        isAuthenticated,
        setIsAuthenticated,
        activeCurrency,
        setActiveCurrency,
        exchangeRate,
        isSupabaseConnected,
        supabaseUrl,
        user,
        setUser,
        wallet,
        setWallet,
        transactions,
        setTransactions,
        beneficiaries,
        setBeneficiaries,
        selectedTransaction,
        setSelectedTransaction,
        sendDraft,
        setSendDraft,
        withdrawDraft,
        setWithdrawDraft,
        registerNewAccount,
        rechargeWallet,
        updateWalletBalance,
        addBeneficiary,
        executeSendMoney,
        executeWithdrawal,
        submitKyc,
        resetAppState,
        simulateWebhookPaymentSuccess,
        goBack,
        notifications,
        markNotificationsAsRead,
        isAdminOpen,
        setIsAdminOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
