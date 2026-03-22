import { useState, useEffect } from 'react';
import { 
    Calendar, 
    ChevronRight, 
    Eye,
    Loader2,
    ShieldAlert,
    Activity,
    FileText,
    ArrowRight
} from 'lucide-react';
import { getAuditLogs } from '../services/masterDataAPI';

interface AuditLog {
    id: number;
    user_id: number;
    username: string;
    action: string;
    entity_name: string;
    entity_id?: number;
    metadata: any;
    timestamp: string;
}

const MetadataView = ({ log }: { log: AuditLog }) => {
    const { action, metadata } = log;

    if (action === 'BATCH_ENTRY') {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">Stage</span>
                        <span className="text-lg font-bold text-slate-900">{metadata.stage_name || `ID: ${metadata.stage_id}`}</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">Production Date</span>
                        <span className="text-lg font-bold text-slate-900">{metadata.date}</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 font-bold text-slate-500">Part Name</th>
                                <th className="px-4 py-3 font-bold text-slate-500 text-right">Prod Qty</th>
                                <th className="px-4 py-3 font-bold text-slate-500 text-right">Rej Qty</th>
                                <th className="px-4 py-3 font-bold text-slate-500">Defect Reason</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {metadata.entries?.map((entry: any, idx: number) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 font-bold text-slate-700">{entry.part_name || `Part #${entry.part_id}`}</td>
                                    <td className="px-4 py-3 text-right font-mono font-bold text-blue-600">{entry.production_qty}</td>
                                    <td className="px-4 py-3 text-right font-mono font-bold text-rose-600">{entry.rejection_qty}</td>
                                    <td className="px-4 py-3">
                                        {(entry.defect_name || entry.defect_id) ? (
                                            <span className="text-xs bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-bold">
                                                {entry.defect_name || `Defect #${entry.defect_id}`}
                                            </span>
                                        ) : (
                                            <span className="text-slate-300">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between items-center px-4 py-2 bg-blue-50/50 rounded-xl border border-blue-100">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Total Batch Summary</span>
                    <div className="space-x-4 flex">
                        <span className="text-sm font-bold text-slate-600">P: {metadata.production_count}</span>
                        <span className="text-sm font-bold text-slate-600">R: {metadata.rejection_count}</span>
                    </div>
                </div>
            </div>
        );
    }

    if (action === 'REPORT_GENERATED') {
        return (
            <div className="space-y-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest mb-1">Duration Parameters</span>
                        <div className="flex items-center space-x-3">
                            <span className="text-lg font-bold text-slate-900">{metadata.startDate}</span>
                            <ArrowRight className="w-4 h-4 text-slate-300" />
                            <span className="text-lg font-bold text-slate-900">{metadata.endDate}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest mb-1">Protocol Type</span>
                        <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-black uppercase tracking-widest">
                            {metadata.type}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // Default view for standard CRUD actions
    return (
        <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-start space-x-3 mb-4 border-b border-slate-50 pb-4">
                    <div className="bg-slate-100 p-2 rounded-lg">
                        <FileText className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 capitalize italic">{log.entity_name} Event</h4>
                        <p className="text-xs text-slate-500">Internal Reference ID: {log.entity_id || 'N/A'}</p>
                    </div>
                </div>
                
                <div className="grid gap-3">
                    {Object.entries(metadata).map(([key, value]) => {
                        if (typeof value === 'object') return null;
                        return (
                            <div key={key} className="flex justify-between items-center text-sm py-1">
                                <span className="text-slate-400 font-medium capitalize">{key.replace('_', ' ')}</span>
                                <span className="font-bold text-slate-800">{String(value)}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const AuditLogs = () => {
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const fetchLogs = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getAuditLogs(startDate, endDate);
            setLogs(data);
        } catch (err: any) {
            setError('Failed to fetch audit logs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const getActionBadge = (action: string) => {
        const styles: Record<string, string> = {
            BATCH_ENTRY: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            REPORT_GENERATED: 'bg-blue-50 text-blue-600 border-blue-100',
            CREATE: 'bg-indigo-50 text-indigo-600 border-indigo-100',
            UPDATE: 'bg-amber-50 text-amber-600 border-amber-100',
            DELETE: 'bg-rose-50 text-rose-600 border-rose-100',
        };
        
        return (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[action] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                {action.replace('_', ' ')}
            </span>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex justify-between items-end border-b border-slate-100 pb-6">
                <div>
                   <div className="flex items-center text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
                        <span>System Control</span>
                        <ChevronRight className="w-3 h-3 mx-1" />
                        <span className="text-slate-400">Audit Logs</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Security Audit</h1>
                    <p className="text-slate-500 mt-2 font-medium">Traceable history of all manufacturing events and report generations.</p>
                </div>
                
                <div className="flex items-center space-x-4">
                    <div className="flex flex-col space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">From Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">To Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                    </div>
                    <button 
                        onClick={fetchLogs}
                        className="bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl self-end font-bold transition-all shadow-lg active:scale-95"
                    >
                        Search Logs
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border-2 border-rose-100 text-rose-600 px-5 py-4 rounded-2xl flex items-center space-x-3">
                    <ShieldAlert className="w-5 h-5" />
                    <span className="font-semibold">{error}</span>
                </div>
            )}

            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden ring-1 ring-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actor</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Event Action</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Collection Scope</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-200 mb-4" />
                                        <p className="font-bold text-xs uppercase tracking-widest text-slate-400">Authenticating Audit Data...</p>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <div className="opacity-20 flex flex-col items-center">
                                            <Activity className="w-12 h-12 mb-2" />
                                            <span className="font-bold text-xs">NO AUDIT RECORDS LOADED</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-700">
                                                    {new Date(log.timestamp).toLocaleDateString()}
                                                </span>
                                                <span className="text-[10px] font-medium text-slate-400">
                                                    {new Date(log.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 ring-2 ring-white">
                                                    {log.username?.slice(0, 2).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-bold text-slate-600">{log.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            {getActionBadge(log.action)}
                                        </td>
                                        <td className="px-8 py-5 font-bold text-[11px] text-slate-400 uppercase">
                                            {log.entity_name}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button 
                                                onClick={() => setSelectedLog(log)}
                                                className="text-slate-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for viewing detailed metadata */}
            {selectedLog && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
                        <div className="p-10 pb-6 border-b border-slate-100 flex justify-between items-start">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                                    <Activity className="w-8 h-8" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black text-slate-900">Security Inspection</h1>
                                    <p className="text-slate-500 font-medium">Record ID: {selectedLog.id} • Protocol: {selectedLog.action}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedLog(null)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-500 p-3 rounded-2xl transition-all"
                            >
                                <ChevronRight className="w-6 h-6 rotate-90" />
                            </button>
                        </div>
                        
                        <div className="p-10 max-h-[60vh] overflow-y-auto bg-slate-50 custom-scrollbar">
                            <MetadataView log={selectedLog} />
                            
                            <div className="mt-8 pt-8 border-t border-slate-200">
                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-4">Raw Data Object</p>
                                <details className="group">
                                    <summary className="cursor-pointer text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-2">
                                        <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                                        <span>Show Raw JSON Protocol</span>
                                    </summary>
                                    <pre className="mt-4 text-[10px] font-mono text-slate-500 bg-white p-4 rounded-xl border border-slate-200 overflow-x-auto leading-relaxed">
                                        {JSON.stringify(selectedLog.metadata, null, 4)}
                                    </pre>
                                </details>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                            <button 
                                onClick={() => setSelectedLog(null)}
                                className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-black transition-all"
                            >
                                Close Inspection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogs;
