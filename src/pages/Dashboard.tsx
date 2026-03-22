import { useEffect, useState } from 'react';
import { useMasterData } from '../store/MasterDataContext';
import {
    Activity,
    Layers,
    Box,
    Tags,
    ShieldAlert,
    PlusCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../services/masterDataAPI';

const DashboardPage = () => {
    const { categories, parts, stages, defects, loading: masterLoading } = useMasterData();
    const [statsData, setStatsData] = useState<any>(null);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats();
                setStatsData(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setStatsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const stats = [
        { name: 'Total Stages', value: stages.length, icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50' },
        { name: 'Active Parts', value: parts.length, icon: Box, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { name: 'Categories', value: categories.length, icon: Tags, color: 'text-purple-600', bg: 'bg-purple-50' },
        { name: 'Defect Types', value: defects.length, icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50' },
    ];

    if (masterLoading) {
        return (
            <div className="flex animate-pulse flex-col space-y-8">
                <div className="h-12 w-48 bg-slate-200 rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Manufacturing Overview</h1>
                    <p className="text-slate-500 mt-1">Real-time status of production rejection tracking.</p>
                </div>

                <Link
                    to="/entries"
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 active:scale-95 group font-medium"
                >
                    <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    <span>New Data Entry</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.name} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Master Data</span>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-3xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{stat.value}</h3>
                                <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Activity className="w-32 h-32 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Welcome to Rejection Analysis</h2>
                    <p className="text-slate-500 max-w-md mb-6 leading-relaxed">
                        Start tracking your production quality by entering daily batch data.
                        Manage your master data to keep your reports accurate and up-to-date.
                    </p>
                    <div className="flex space-x-4">
                        <Link to="/parts" className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline">Manage Parts &rarr;</Link>
                        <Link to="/defects" className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline">Review Defects &rarr;</Link>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl shadow-slate-200">
                    <h2 className="text-lg font-bold mb-4">Quick Stats (Today)</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                            <span className="text-slate-400 text-sm">Avg Rejection Rate</span>
                            <span className="font-mono font-bold text-blue-400">
                                {statsLoading ? '...' : `${statsData?.rejectionRate || '0.0'}%`}
                            </span>
                        </div>
                        <div className="pt-2 border-t border-white/10 mt-2">
                            <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                <span>Production</span>
                                <span>Rejection</span>
                            </div>
                            <div className="flex justify-between font-bold text-sm">
                                <span>{statsLoading ? '...' : statsData?.totalProduction || 0}</span>
                                <span className="text-rose-400">{statsLoading ? '...' : statsData?.totalRejection || 0}</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 italic mt-4">
                            Stats reflect all entries submitted for {statsData?.today || 'today'}.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;
