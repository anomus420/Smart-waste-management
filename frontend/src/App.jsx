import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ComplaintProvider } from './context/ComplaintContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AppRoutes from './routes';
import WasteAssistant from './components/common/WasteAssistant';


export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ComplaintProvider>
            <ToastProvider>
              <ThemeProvider>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-200">
                  <Navbar />
                  <main className="flex-1">
                    <AppRoutes />
                  </main>
                  <Footer />
                </div>
              </ThemeProvider>
              <WasteAssistant />
            </ToastProvider>
          </ComplaintProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}