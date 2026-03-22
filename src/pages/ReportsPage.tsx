import { useState, useEffect } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
    Calendar, 
    FileBarChart, 
    Filter, 
    Download, 
    Loader2, 
    TrendingUp, 
    AlertCircle,
    Layers,
    Box,
    ShieldAlert,
    Activity
} from 'lucide-react';
import { getCustomReport } from '../services/masterDataAPI';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const ReportsPage = () => {
    const formatDate = (date: Date) => {
        const d = new Date(date);
        const month = '' + (d.getMonth() + 1);
        const day = '' + d.getDate();
        const year = d.getFullYear();
        return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
    };

    const today = formatDate(new Date());
    const firstDayOfMonth = formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    
    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(today);
    const [reportType, setReportType] = useState('trend_analysis');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [paretoEnabled, setParetoEnabled] = useState(false);

    const fetchReport = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await getCustomReport(startDate, endDate, reportType);
            setData(result);
        } catch (err) {
            setError('Failed to load report data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [reportType]);

    const renderHeader = () => (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-slate-100 pb-8">
            <div>
                <div className="flex items-center text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
                    <FileBarChart className="w-4 h-4 mr-2" />
                    <span>Analytics & Intelligence</span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Manufacturing Reports</h1>
                <p className="text-slate-500 mt-2 font-medium">Aggregate insights from production and quality control logs.</p>
            </div>

            <div className="flex flex-wrap items-end gap-4 p-4 bg-white rounded-3xl shadow-sm border border-slate-100 ring-1 ring-slate-100">
                <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Report Type</label>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select 
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="pl-9 pr-6 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold appearance-none outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all min-w-[200px]"
                        >
                            <option value="trend_analysis">📈 Quality Trends</option>
                            <option value="part_performance">📦 Part Performance</option>
                            <option value="stage_performance">🏭 Stage Performance</option>
                            <option value="defect_distribution">🚫 Defect Analysis</option>
                            <option value="part_defect_analysis">🧩 Part vs Defect</option>
                            <option value="part_stage_analysis">📍 Part vs Stage</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Period</label>
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="pl-8 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none ring-1 ring-slate-200"
                            />
                        </div>
                        <span className="text-slate-300">to</span>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="pl-8 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none ring-1 ring-slate-200"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Focus</label>
                    <button 
                        onClick={() => setParetoEnabled(!paretoEnabled)}
                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                            paretoEnabled 
                            ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-100' 
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                    >
                        <Activity className="w-3.5 h-3.5" />
                        <span>80/20 MODE</span>
                    </button>
                </div>

                <button 
                    onClick={fetchReport}
                    className="bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95"
                >
                    Update
                </button>
            </div>
        </div>
    );

    const getParetoData = (rawData: any[]) => {
        if (!paretoEnabled || reportType === 'trend_analysis') return rawData;

        // 1. Determine the 'value' to sum based on report type
        const getValue = (item: any) => {
            if (reportType === 'part_defect_analysis' || reportType === 'part_stage_analysis') {
                // Sum all numeric keys (defects/stages)
                return Object.keys(item)
                    .filter(k => k !== 'name')
                    .reduce((sum, k) => sum + (item[k] || 0), 0);
            }
            return item.total_rejection || item.count || 0;
        };

        // 2. Sort descending
        const sorted = [...rawData].sort((a, b) => getValue(b) - getValue(a));
        const total = sorted.reduce((sum, item) => sum + getValue(item), 0);
        
        if (total === 0) return rawData;

        // 3. Accumulate until 80%
        let cumulative = 0;
        const result = [];
        for (const item of sorted) {
            result.push(item);
            cumulative += getValue(item);
            if (cumulative >= total * 0.8) break;
        }
        return result;
    };

    const renderChart = () => {
        const displayData = getParetoData(data);
        if (loading) return (
            <div className="flex flex-col items-center justify-center h-80 bg-white rounded-[32px] border border-slate-100 shadow-sm animate-pulse">
                <Loader2 className="w-12 h-12 text-blue-200 animate-spin mb-4" />
                <p className="text-xs font-black text-slate-400 tracking-[0.2em] uppercase">Calculating Metrics...</p>
            </div>
        );

        if (error) return (
            <div className="flex items-center justify-center h-80 bg-white rounded-[32px] border border-slate-100 shadow-sm">
                <div className="text-center p-8">
                    <AlertCircle className="w-12 h-12 text-rose-200 mx-auto mb-4" />
                    <p className="font-bold text-slate-600">{error}</p>
                </div>
            </div>
        );

        if (data.length === 0) return (
            <div className="flex items-center justify-center h-80 bg-white rounded-[32px] border border-slate-100 shadow-sm">
                <p className="font-bold text-slate-400 uppercase tracking-widest">No data for selected period</p>
            </div>
        );

        switch (reportType) {
            case 'trend_analysis':
                return (
                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm h-[450px]">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
                            Daily Rejection Trend (%)
                        </h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={displayData}>
                                <defs>
                                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} fontWeight={600} axisLine={false} tickLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={10} fontWeight={600} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} 
                                />
                                <Area type="monotone" dataKey="rejection_rate" name="Rejection Rate" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                );
            case 'defect_distribution':
                return (
                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm h-[450px] flex gap-8">
                        <div className="flex-1">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                                <ShieldAlert className="w-4 h-4 mr-2 text-rose-500" />
                                Defect Proportions
                            </h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={displayData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="name"
                                        cornerRadius={8}
                                    >
                                        {displayData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                );
            case 'part_performance':
            case 'stage_performance':
                const icon = reportType === 'part_performance' ? <Box className="w-4 h-4 mr-2 text-indigo-500" /> : <Layers className="w-4 h-4 mr-2 text-emerald-500" />;
                return (
                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm h-[450px]">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center">
                            {icon}
                            Rejection Rate per {reportType === 'part_performance' ? 'Part' : 'Stage'} (%)
                        </h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={displayData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontWeight={600} axisLine={false} tickLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={10} fontWeight={600} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                                <Bar dataKey="rejection_rate" name="Rejection Rate" fill="#8b5cf6" radius={[8, 8, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                );
            case 'part_defect_analysis':
            case 'part_stage_analysis':
                const relKeys = Array.from(new Set(displayData.flatMap(obj => Object.keys(obj)))).filter(k => k !== 'name');
                const relTitle = reportType === 'part_defect_analysis' ? 'Defects per Part' : 'Stages per Part';
                
                return (
                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm h-[500px]">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center">
                            <Activity className="w-4 h-4 mr-2 text-blue-500" />
                            {relTitle} (Comparison)
                        </h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={displayData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontWeight={600} axisLine={false} tickLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={10} fontWeight={600} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                                <Legend />
                                {relKeys.map((key, index) => (
                                    <Bar key={key} dataKey={key} stackId="a" fill={COLORS[index % COLORS.length]} radius={index === relKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                );
            default:
                return null;
        }
    };

    const renderTable = () => {
        const displayData = getParetoData(data);
        if (loading || displayData.length === 0) return null;

        if (reportType === 'part_defect_analysis' || reportType === 'part_stage_analysis') {
            const keys = Array.from(new Set(displayData.flatMap(obj => Object.keys(obj)))).filter(k => k !== 'name');
            return (
                <div className="mt-10 overflow-hidden bg-white rounded-[32px] border border-slate-100 shadow-sm ring-1 ring-slate-100">
                    <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Crosstab Data Matrix</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Part Name</th>
                                    {keys.map(k => (
                                        <th key={k} className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{k}</th>
                                    ))}
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Row Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/50">
                                {displayData.map((row, idx) => {
                                    let rowTotal = 0;
                                    return (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-5 text-sm font-bold text-slate-700">{row.name}</td>
                                            {keys.map(k => {
                                                const val = row[k] || 0;
                                                rowTotal += val;
                                                return (
                                                    <td key={k} className="px-8 py-5 text-sm font-mono font-bold text-slate-500 text-right">{val || '—'}</td>
                                                );
                                            })}
                                            <td className="px-8 py-5 text-sm font-mono font-black text-blue-600 text-right">{rowTotal}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        return (
            <div className="mt-10 overflow-hidden bg-white rounded-[32px] border border-slate-100 shadow-sm ring-1 ring-slate-100">
                <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Detailed Analytics Data</h3>
                    <button className="flex items-center text-xs font-black text-blue-600 space-x-2 px-4 py-2 hover:bg-blue-50 rounded-xl transition-all">
                        <Download className="w-4 h-4" />
                        <span>EXPORT CSV</span>
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{reportType === 'trend_analysis' ? 'Date' : 'Entity Name'}</th>
                                {reportType !== 'defect_distribution' && (
                                    <>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Production</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Rejection</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Rate</th>
                                    </>
                                )}
                                {reportType === 'defect_distribution' && (
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Occurrences</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50">
                            {displayData.map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-5 text-sm font-bold text-slate-700">{row.date || row.name}</td>
                                    {reportType !== 'defect_distribution' && (
                                        <>
                                            <td className="px-8 py-5 text-sm font-mono font-bold text-slate-500 text-right">{row.total_production}</td>
                                            <td className="px-8 py-5 text-sm font-mono font-bold text-rose-500 text-right">{row.total_rejection}</td>
                                            <td className="px-8 py-5 text-right">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${
                                                    row.rejection_rate > 10 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                                                }`}>
                                                    {row.rejection_rate}%
                                                </span>
                                            </td>
                                        </>
                                    )}
                                    {reportType === 'defect_distribution' && (
                                        <td className="px-8 py-5 text-sm font-mono font-black text-slate-900 text-right">{row.count}</td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="animate-in fade-in duration-700 pb-20">
            {renderHeader()}
            
            <div className="grid grid-cols-1 gap-10">
                {renderChart()}
                {renderTable()}
            </div>
        </div>
    );
};

export default ReportsPage;
