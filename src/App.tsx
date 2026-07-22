import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { WelcomeScreen } from './components/auth/WelcomeScreen';
import { RegisterScreen } from './components/auth/RegisterScreen';
import { OtpScreen } from './components/auth/OtpScreen';
import { CreatePasswordScreen } from './components/auth/CreatePasswordScreen';
import { SuccessScreen } from './components/auth/SuccessScreen';

import { KycOverviewScreen } from './components/kyc/KycOverviewScreen';
import { DocumentSelectScreen } from './components/kyc/DocumentSelectScreen';
import { DocumentCaptureScreen } from './components/kyc/DocumentCaptureScreen';
import { SelfieCaptureScreen } from './components/kyc/SelfieCaptureScreen';
import { KycProcessingScreen } from './components/kyc/KycProcessingScreen';

import { HeaderNav } from './components/dashboard/HeaderNav';
import { WalletCard } from './components/dashboard/WalletCard';
import { RecentTransactions } from './components/dashboard/RecentTransactions';
import { TransactionHistoryScreen } from './components/dashboard/TransactionHistoryScreen';
import { TransactionDetailModal } from './components/dashboard/TransactionDetailModal';
import { BeneficiariesScreen } from './components/dashboard/BeneficiariesScreen';
import { ProfileScreen } from './components/dashboard/ProfileScreen';
import { BottomNavBar } from './components/dashboard/BottomNavBar';

import { SendAmountScreen } from './components/send/SendAmountScreen';
import { PaymentMethodScreen } from './components/send/PaymentMethodScreen';
import { SendSummaryScreen } from './components/send/SendSummaryScreen';
import { SendSuccessScreen } from './components/send/SendSuccessScreen';

import { WithdrawAmountScreen } from './components/withdraw/WithdrawAmountScreen';
import { WithdrawStatusScreen } from './components/withdraw/WithdrawStatusScreen';

import { AdminDrawer } from './components/admin/AdminDrawer';
import { SendiaAdminPortal } from './components/admin/SendiaAdminPortal';
import { SwipeBackContainer } from './components/common/SwipeBackContainer';

const MainLayout: React.FC = () => {
  const { currentScreen, activeTab, isAdminOpen } = useApp();
  const [isAdminModeUrl, setIsAdminModeUrl] = useState<boolean>(() => {
    return window.location.search.includes('admin') || window.location.pathname.includes('admin');
  });

  useEffect(() => {
    const checkUrl = () => {
      setIsAdminModeUrl(window.location.search.includes('admin') || window.location.pathname.includes('admin'));
    };
    window.addEventListener('popstate', checkUrl);
    return () => window.removeEventListener('popstate', checkUrl);
  }, []);

  // If in desktop Admin Portal mode
  if (isAdminModeUrl || isAdminOpen) {
    return <SendiaAdminPortal />;
  }

  const renderDashboardTab = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="flex-1 pb-24">
            <HeaderNav />
            <WalletCard />
            <RecentTransactions />
          </div>
        );
      case 'transactions':
        return (
          <div className="flex-1 flex flex-col">
            <HeaderNav />
            <TransactionHistoryScreen />
          </div>
        );
      case 'beneficiaries':
        return (
          <div className="flex-1 flex flex-col">
            <HeaderNav />
            <BeneficiariesScreen />
          </div>
        );
      case 'profile':
        return (
          <div className="flex-1 flex flex-col">
            <HeaderNav />
            <ProfileScreen />
          </div>
        );
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (currentScreen) {
      // Auth Flow
      case 'welcome':
        return <WelcomeScreen />;
      case 'register':
        return <RegisterScreen />;
      case 'otp':
        return <OtpScreen />;
      case 'password':
        return <CreatePasswordScreen />;
      case 'auth_success':
        return <SuccessScreen />;

      // KYC Flow
      case 'kyc_overview':
        return <KycOverviewScreen />;
      case 'kyc_doc_select':
        return <DocumentSelectScreen />;
      case 'kyc_doc_capture':
        return <DocumentCaptureScreen />;
      case 'kyc_selfie_capture':
        return <SelfieCaptureScreen />;
      case 'kyc_processing':
        return <KycProcessingScreen />;

      // Send Flow
      case 'send_amount':
        return <SendAmountScreen />;
      case 'send_payment_method':
        return <PaymentMethodScreen />;
      case 'send_summary':
        return <SendSummaryScreen />;
      case 'send_success':
        return <SendSuccessScreen />;

      // Withdraw Flow
      case 'withdraw_amount':
        return <WithdrawAmountScreen />;
      case 'withdraw_status':
        return <WithdrawStatusScreen />;

      // Dashboard Tabs
      case 'dashboard':
      default:
        return renderDashboardTab();
    }
  };

  return (
    <div className="pwa-container">
      <SwipeBackContainer>
        {renderContent()}
      </SwipeBackContainer>
      <BottomNavBar />
      <TransactionDetailModal />
      <AdminDrawer />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
