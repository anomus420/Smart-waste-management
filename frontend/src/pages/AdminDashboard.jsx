import { useState } from 'react';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Dashboard from '../components/admin/Dashboard';
import ComplaintTable from '../components/admin/ComplaintTable';
import UserManagement from '../components/admin/UserManagement';
import Analytics from '../components/admin/Analytics';
import EWasteTable from '../components/admin/EWasteTable';
import AwarenessManager from '../components/admin/AwarenessManager';
import CentresManager from '../components/admin/CentresManager';

const TABS = [
  { id: 'dashboard',  label: 'Dashboard'  },
  { id: 'complaints', label: 'Complaints' },
  { id: 'users',      label: 'Users'      },
  { id: 'analytics',  label: 'Analytics'  },
  { id: 'ewaste',     label: 'E-Waste'    },
  { id: 'awareness',  label: 'Awareness'  },
  { id: 'centres',    label: 'Centres'    },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':  return <Dashboard />;
      case 'complaints': return <ComplaintTable />;
      case 'users':      return <UserManagement />;
      case 'analytics':  return <Analytics />;
      case 'ewaste':     return <EWasteTable />;
      case 'awareness':  return <AwarenessManager />;
      case 'centres':    return <CentresManager />;
      default:           return null;
    }
  };

  return (
    <ProtectedRoute adminOnly>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 font-display">Admin Panel</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage and monitor the Smart Waste Management System</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8 overflow-x-auto">
          <nav className="flex gap-1 min-w-max">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>{renderTab()}</div>
      </div>
    </ProtectedRoute>
  );
}