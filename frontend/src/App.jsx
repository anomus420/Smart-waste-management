import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ComplaintProvider } from './context/ComplaintContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AppRoutes from './routes';
import WasteAssistant from './components/common/WasteAssistant';

function AppContent() {
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isHomePage
          ? 'bg-linear-to-br from-[#0fa049] via-[#22c55e] to-[#14b87f]'
          : 'bg-white dark:bg-gray-900 dark:text-gray-100'
      }`}
    >
      <Navbar />
      <main className="flex-1">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ComplaintProvider>
            <ToastProvider>
              <ThemeProvider>
                <AppContent />
              </ThemeProvider>
              <WasteAssistant />
            </ToastProvider>
          </ComplaintProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}