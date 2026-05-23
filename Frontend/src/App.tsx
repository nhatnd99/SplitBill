import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Groups } from './pages/Groups';
import { GroupDetail } from './pages/GroupDetail';
import { ActivityHistory } from './pages/ActivityHistory';
import { Profile } from './pages/Profile';
import { Landing } from './pages/Landing';
import { useAppStore } from './store';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const currentUser = useAppStore(state => state.currentUser);
  if (!currentUser) {
    return <Navigate to="/welcome" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const { theme } = useAppStore();

  useEffect(() => {
    const applyTheme = () => {
      let isDark = theme === 'dark';
      if (theme === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  return (
    <HashRouter>
      <Routes>
        <Route path="/welcome" element={<Landing />} />

        {/* Dashboard layouts routes */}
        <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="groups" element={<Groups />} />
          <Route path="groups/:id" element={<GroupDetail />} />
          <Route path="activities" element={<ActivityHistory />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
