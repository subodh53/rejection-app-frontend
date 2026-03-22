import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
    token: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    loginUser: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const decodeRole = (token: string) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role || 'data_entry';
    } catch {
        return 'data_entry';
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(() => {
        const token = localStorage.getItem('token');
        return token ? { token, role: decodeRole(token) } : null;
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && !user) {
            setUser({ token, role: decodeRole(token) });
        }
    }, [user]);

    const loginUser = (token: string) => {
        localStorage.setItem('token', token);
        setUser({ token, role: decodeRole(token) });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loginUser, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
