import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { ToastProvider } from '@/context/ToastContext';
import { AppRoutes } from '@/routes';
import { ScrollManager } from '@/components/navigation/ScrollManager';
import { PageViewTracker } from '@/components/navigation/PageViewTracker';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollManager />
      <PageViewTracker />
      <ThemeProvider>
        <AuthProvider>
          <FavoritesProvider>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
