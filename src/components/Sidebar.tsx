import { Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    ClipboardList, 
    Layers, 
    Box, 
    Tags, 
    ShieldAlert, 
    Users, 
    LogOut,
    Clock,
    BarChart4,
    ChevronLeft,
    ChevronRight,
    Upload
} from 'lucide-react';
import { useAuth } from '../store/AuthContext';

const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Data Entry', path: '/entries', icon: ClipboardList },
    { name: 'Reports', path: '/reports', icon: BarChart4 },
    { name: 'Bulk Upload', path: '/master-upload', icon: Upload },
    { name: 'Stages', path: '/stages', icon: Layers },
    { name: 'Parts', path: '/parts', icon: Box },
    { name: 'Categories', path: '/categories', icon: Tags },
    { name: 'Defects', path: '/defects', icon: ShieldAlert },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Audit Logs', path: '/audit-logs', icon: Clock },
];

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
    const location = useLocation();
    const { user, logout } = useAuth();

    return (
        <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col shadow-xl transition-all duration-300 ease-in-out z-50`}>
            <div className="p-6 flex items-center justify-between relative">
                {!collapsed && (
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent truncate">
                        Rejection Analysis
                    </h1>
                )}
                <button 
                    onClick={onToggle}
                    className={`absolute -right-3 top-7 bg-blue-600 text-white p-1 rounded-full shadow-lg hover:bg-blue-700 transition-all border-2 border-slate-900`}
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </div>
            
            <nav className="flex-1 mt-4 px-3 space-y-2 overflow-y-auto">
                {navItems
                  .filter(item => user?.role === 'admin' || item.path === '/entries')
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            title={collapsed ? item.name : ''}
                            className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-lg transition-all duration-200 group ${
                                isActive 
                                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' 
                                    : 'hover:bg-slate-800 text-slate-400 hover:text-slate-100'
                            }`}
                        >
                            <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-100'}`} />
                            {!collapsed && <span className="font-medium truncate">{item.name}</span>}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-3 border-t border-slate-800 mt-auto">
                <button
                    onClick={logout}
                    title={collapsed ? 'Sign Out' : ''}
                    className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} p-3 w-full rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors group`}
                >
                    <LogOut className="w-5 h-5 flex-shrink-0 group-hover:animate-pulse" />
                    {!collapsed && <span className="font-medium truncate">Sign Out</span>}
                </button>
            </div>
        </aside>
    );
};
