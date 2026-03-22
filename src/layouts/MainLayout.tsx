import { useState, type ReactNode } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../store/AuthContext';
import { Navigate } from 'react-router-dom';

export const MainLayout = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return (
        <div className="flex bg-slate-50 min-h-screen">
            <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
            <main className={`flex-1 ${collapsed ? 'ml-20' : 'ml-64'} p-8 transition-all duration-300 ease-in-out`}>
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};
