import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import { MasterDataProvider } from './store/MasterDataContext';
import LoginPage from './pages/LoginPage';
import EntryPage from './pages/EntryPage';
import Dashboard from './pages/Dashboard';
import MasterData from './pages/MasterData';
import { MainLayout } from './layouts/MainLayout';
import { useAuth } from './store/AuthContext';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (user?.role !== 'admin') {
    return <Navigate to="/entries" replace />;
  }
  return <MainLayout>{children}</MainLayout>;
};

const RootRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'data_entry') {
    return <Navigate to="/entries" replace />;
  }
  return <MainLayout><Dashboard /></MainLayout>;
};

import AuditLogs from './pages/AuditLogs';
import ReportsPage from './pages/ReportsPage';

function App() {
  return (
    <AuthProvider>
      <MasterDataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route path="/" element={<RootRedirect />} />
            <Route path="/entries" element={<MainLayout><EntryPage /></MainLayout>} />
            
            <Route path="/stages" element={<AdminRoute><MasterData type="stages" /></AdminRoute>} />
            <Route path="/parts" element={<AdminRoute><MasterData type="parts" /></AdminRoute>} />
            <Route path="/categories" element={<AdminRoute><MasterData type="categories" /></AdminRoute>} />
            <Route path="/defects" element={<AdminRoute><MasterData type="defects" /></AdminRoute>} />
            
            <Route path="/users" element={<AdminRoute><MasterData type="users" /></AdminRoute>} />
            <Route path="/audit-logs" element={<AdminRoute><AuditLogs /></AdminRoute>} />
            <Route path="/reports" element={<AdminRoute><ReportsPage /></AdminRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </MasterDataProvider>
    </AuthProvider>
  )
}

export default App;