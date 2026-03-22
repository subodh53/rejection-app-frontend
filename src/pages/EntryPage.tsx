import { useMasterData } from '../store/MasterDataContext';
import { useState } from 'react';
import { 
    Plus, 
    Trash2, 
    Save, 
    Calendar, 
    Layers, 
    Box, 
    AlertCircle, 
    CheckCircle2, 
    Loader2 
} from 'lucide-react';
import { createEntryBatch } from '../services/masterDataAPI';

interface EntryRow {
    part_id: string;
    production_qty: number;
    rejection_qty: number;
    defect_id: string;
}

export default function EntryPage() {
    const { parts, stages, defects, loading } = useMasterData();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [stageId, setStageId] = useState('');
    const [entries, setEntries] = useState<EntryRow[]>([
        { part_id: '', production_qty: 0, rejection_qty: 0, defect_id: '' }
    ]);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const addRow = () => {
        setEntries([...entries, { part_id: '', production_qty: 0, rejection_qty: 0, defect_id: '' }]);
    };

    const removeRow = (index: number) => {
        if (entries.length === 1) return;
        setEntries(entries.filter((_, i) => i !== index));
    };

    const updateRow = (index: number, field: keyof EntryRow, value: string | number) => {
        const newEntries = [...entries];
        const updatedRow = { ...newEntries[index], [field]: value };
        
        // If rejection_qty is 0, clear defect_id
        if (field === 'rejection_qty' && value === 0) {
            updatedRow.defect_id = '';
        }

        newEntries[index] = updatedRow;
        setEntries(newEntries);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stageId) {
            setMessage({ text: "Please select a production stage.", type: 'error' });
            return;
        }

        const validEntries = entries.filter(e => e.part_id && e.production_qty >= 0);
        if (validEntries.length === 0) {
            setMessage({ text: "Please add at least one complete entry.", type: 'error' });
            return;
        }

        setSubmitting(true);
        setMessage(null);

        try {
            await createEntryBatch({
                stage_id: parseInt(stageId),
                date,
                entries: validEntries.map(e => ({
                    part_id: parseInt(e.part_id),
                    production_qty: e.production_qty,
                    rejection_qty: e.rejection_qty,
                    defect_id: e.defect_id ? parseInt(e.defect_id) : undefined
                }))
            });
            setMessage({ text: "Batch entries saved successfully!", type: 'success' });
            setEntries([{ part_id: '', production_qty: 0, rejection_qty: 0, defect_id: '' }]);
        } catch (error) {
            console.error(error);
            setMessage({ text: "Failed to save entries. Please check your data.", type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
    );

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-500 max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Data Entry</h1>
                    <p className="text-slate-500 mt-1">Record daily production and rejection counts.</p>
                </div>
                {message && (
                    <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium ${
                        message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                        {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        <span>{message.text}</span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8 ring-1 ring-slate-100 hover:ring-blue-100 transition-all">
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-bold text-slate-700 space-x-2 pb-1 uppercase tracking-wider">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span>Production Date</span>
                        </label>
                        <input 
                            type="date" 
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-slate-200 border-2 focus:border-blue-500 focus:ring-0 transition-colors font-medium text-slate-900" 
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-bold text-slate-700 space-x-2 pb-1 uppercase tracking-wider">
                            <Layers className="w-4 h-4 text-emerald-500" />
                            <span>Production Stage</span>
                        </label>
                        <select 
                            required
                            value={stageId}
                            onChange={(e) => setStageId(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-slate-200 border-2 focus:border-blue-500 focus:ring-0 transition-colors font-medium text-slate-900 appearance-none bg-white"
                        >
                            <option value="">Select Stage</option>
                            {stages.map((s: any) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden ring-1 ring-slate-100">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="font-bold text-slate-700 flex items-center space-x-2">
                           <Box className="w-5 h-5 text-purple-500" />
                           <span>Daily Batch Items</span>
                        </h2>
                        <button 
                            type="button" 
                            onClick={addRow}
                            className="flex items-center space-x-2 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-all active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Row</span>
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-12 gap-4 mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest px-4">
                            <div className="col-span-4">Part Specification</div>
                            <div className="col-span-2">Production</div>
                            <div className="col-span-2">Rejection</div>
                            <div className="col-span-3">Defect Reason</div>
                            <div className="col-span-1"></div>
                        </div>

                        <div className="space-y-3">
                            {entries.map((entry, index) => (
                                <div key={index} className="grid grid-cols-12 gap-4 items-center bg-slate-50/50 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 hover:border-blue-100 transition-all group">
                                    <div className="col-span-4">
                                        <select 
                                            value={entry.part_id}
                                            onChange={(e) => updateRow(index, 'part_id', e.target.value)}
                                            className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:border-blue-500 outline-none transition-colors"
                                        >
                                            <option value="">Select Part</option>
                                            {parts.map((p: any) => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <input 
                                            type="number" 
                                            min="0"
                                            value={entry.production_qty}
                                            onChange={(e) => updateRow(index, 'production_qty', parseInt(e.target.value) || 0)}
                                            className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm text-center focus:border-blue-500 outline-none transition-colors"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <input 
                                            type="number" 
                                            min="0"
                                            value={entry.rejection_qty}
                                            onChange={(e) => updateRow(index, 'rejection_qty', parseInt(e.target.value) || 0)}
                                            className={`w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm text-center focus:border-blue-500 outline-none transition-colors ${entry.rejection_qty > 0 ? 'text-rose-600 font-bold' : ''}`}
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <select 
                                            value={entry.defect_id}
                                            onChange={(e) => updateRow(index, 'defect_id', e.target.value)}
                                            disabled={entry.rejection_qty === 0}
                                            className={`w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:border-blue-500 outline-none transition-colors ${entry.rejection_qty === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <option value="">Select Reason</option>
                                            {defects.map((d: any) => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                        <button 
                                            type="button" 
                                            onClick={() => removeRow(index)}
                                            className="p-2 text-slate-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-50 px-8 py-6 border-t border-slate-100 flex justify-end items-center space-x-6">
                        <div className="text-right">
                           <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total Production</span>
                           <span className="text-2xl font-black text-slate-900 leading-none">
                               {entries.reduce((sum, e) => sum + e.production_qty, 0)}
                           </span>
                        </div>
                        
                        <div className="h-10 w-px bg-slate-200"></div>

                        <div className="text-right">
                           <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total Rejection</span>
                           <span className="text-2xl font-black text-rose-600 leading-none">
                               {entries.reduce((sum, e) => sum + e.rejection_qty, 0)}
                           </span>
                        </div>

                        <button 
                            type="submit"
                            disabled={submitting}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center space-x-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Saving Batch...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>Commit Entries</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}