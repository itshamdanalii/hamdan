
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import DashboardView from './components/DashboardView';
import BillingView from './components/BillingView';
import HistoryView from './components/HistoryView';
import ProductView from './components/ProductView';
import ExpenseView from './components/ExpenseView';
import SettingsView from './components/SettingsView';
import { db, ensureSettings } from './db';
import { Settings } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settings, setSettings] = useState<Settings | null>(null);

  const loadSettings = async () => {
    await ensureSettings();
    const s = await db.settings.toArray();
    if (s.length > 0) {
      setSettings(s[0]);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const renderContent = () => {
    if (!settings) return <div className="flex items-center justify-center min-h-[50vh]">Loading shop settings...</div>;

    switch (activeTab) {
      case 'dashboard':
        return <DashboardView settings={settings} />;
      case 'billing':
        return <BillingView settings={settings} />;
      case 'history':
        return <HistoryView settings={settings} />;
      case 'products':
        return <ProductView />;
      case 'expenses':
        return <ExpenseView />;
      case 'settings':
        return <SettingsView settings={settings} onUpdate={loadSettings} />;
      default:
        return <DashboardView settings={settings} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
