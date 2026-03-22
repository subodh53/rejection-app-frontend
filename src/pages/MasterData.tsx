import { useState, useEffect } from "react";
import { 
  categoriesAPI, 
  partsAPI, 
  stagesAPI, 
  defectsAPI 
} from "../services/masterDataAPI";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2, 
  AlertCircle,
  Users,
  ChevronRight
} from "lucide-react";
import { useMasterData } from "../store/MasterDataContext";

type Mode = 'list' | 'add' | 'edit';

const MasterDataPage = ({ type }: { type: 'stages' | 'parts' | 'categories' | 'defects' | 'users' }) => {
  const { refresh, categories } = useMasterData();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('list');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({ name: "" });
  const [searchTerm, setSearchTerm] = useState("");

  const api = {
    stages: stagesAPI,
    parts: partsAPI,
    categories: categoriesAPI,
    defects: defectsAPI,
    users: null as any
  }[type];
  const singularType = type === 'categories' ? 'category' : type.slice(0, -1);

  // Load data
  const fetchData = async () => {
    if (type === 'users') {
        setData([]);
        setLoading(false);
        return;
    }
    setLoading(true);
    try {
      const res = await api.getAll();
      setData(res);
      setError(null);
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api) return;
    
    // Construct the payload correctly
    const dataToSave: any = { 
        name: formData.name, 
    };

    if (type === 'parts') {
        dataToSave.category_id = formData.category_id ? parseInt(formData.category_id) : undefined;
    }
    
    try {
      if (mode === 'add') {
        await api.create(dataToSave);
      } else {
        await api.update(selectedItem.id, dataToSave);
      }
      setMode('list');
      refresh();
      fetchData();
    } catch (err) {
      setError("Failed to save. Check if the name is already in use.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this entry permanently? This action cannot be undone.")) return;
    try {
      await api.delete(id);
      refresh();
      fetchData();
    } catch (err) {
      setError("Impossible to delete. This item is referenced by existing production entries.");
    }
  };

  const filteredData = data.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (type === 'users') {
      return (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
              <div className="p-8 rounded-full bg-slate-100 mb-6 scale-110 shadow-inner">
                  <Users className="w-16 h-16 opacity-30 text-blue-900" />
              </div>
              <h1 className="text-2xl font-black text-slate-800">User Governance</h1>
              <p className="text-slate-500 max-w-sm text-center mt-3 font-medium px-4">The IAM (Identity and Access Management) portal is currently limited to authentication logic only.</p>
              <div className="mt-8 flex space-x-2">
                  {[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-slate-200 animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />)}
              </div>
          </div>
      )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex justify-between items-end border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
             <span>Master Data</span>
             <ChevronRight className="w-3 h-3 mx-1" />
             <span className="text-slate-400">Index</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 capitalize tracking-tight">{type}</h1>
          <p className="text-slate-500 mt-2 font-medium">Configure and maintain the standard {type} used in the production pipeline.</p>
        </div>
        
        {mode === 'list' && (
          <button 
            onClick={() => { 
                setMode('add'); 
                setFormData(type === 'parts' ? { name: "", category_id: "" } : { name: "" }); 
            }}
            className="group bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-2xl flex items-center space-x-2 transition-all shadow-xl hover:shadow-slate-200 active:scale-95 font-bold"
          >
            <Plus className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            <span>New {singularType}</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 border-2 border-rose-100 text-rose-600 px-5 py-4 rounded-2xl flex items-center space-x-3 animate-in slide-in-from-top-4 font-semibold">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {mode === 'list' ? (
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden ring-1 ring-slate-100 hover:shadow-lg transition-shadow">
          <div className="p-6 border-b border-slate-50 bg-slate-50/30">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder={`Search through ${data.length} records...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-3.5 w-full rounded-2xl border-2 border-slate-100 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium placeholder:text-slate-300"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reference</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identifier Name</th>
                  {type === 'parts' && (
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Attribute Class</th>
                  )}
                  <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-8 py-20 text-center text-slate-400">
                      <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-slate-200" />
                      <span className="font-bold uppercase tracking-widest text-xs">Synchronizing Database...</span>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-8 py-20 text-center">
                        <div className="opacity-20 flex flex-col items-center">
                            <Plus className="w-12 h-12 mb-2" />
                            <span className="font-bold text-xs">NO COLLECTIONS FOUND</span>
                        </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-8 py-5 whitespace-nowrap">
                          <code className="bg-slate-100 px-2 py-1 rounded-md text-[11px] font-bold text-slate-500">REF-{item.id.toString().padStart(4, '0')}</code>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap focus-within:bg-blue-50">
                          <span className="text-base font-bold text-slate-800">{item.name}</span>
                      </td>
                      {type === 'parts' && (
                        <td className="px-8 py-5 whitespace-nowrap font-bold text-xs uppercase">
                            <span className={`px-3 py-1.5 rounded-full ${item.category_id ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                                {categories.find((c:any) => c.id === item.category_id)?.name || 'Generic Part'}
                            </span>
                        </td>
                      )}
                      <td className="px-8 py-5 whitespace-nowrap text-right space-x-2">
                        <div className="inline-flex opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                            <button 
                              onClick={() => {
                                setSelectedItem(item);
                                setFormData(type === 'parts' ? { name: item.name, category_id: item.category_id || "" } : { name: item.name });
                                setMode('edit');
                              }}
                              className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2.5 rounded-xl transition-all"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2.5 rounded-xl transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 p-12 max-w-xl mx-auto animate-in zoom-in-95 duration-500 ring-1 ring-slate-100">
          <div className="text-center mb-10">
              <div className="inline-flex p-4 rounded-2xl bg-blue-50 text-blue-600 mb-6">
                  {mode === 'edit' ? <Edit2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
              </div>
              <h2 className="text-3xl font-black text-slate-900">{mode === 'edit' ? 'Update Details' : 'Initialize New Entry'}</h2>
              <p className="text-slate-500 font-medium mt-2">Modify the {singularType} parameters in the central repository.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Label Name</label>
              <input 
                autoFocus
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-600 focus:ring-0 transition-all text-xl font-bold bg-slate-50/50 focus:bg-white"
                placeholder="Ex. Stage Alpha"
              />
            </div>

            {type === 'parts' && (
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Category Assignment</label>
                   <select 
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-600 focus:outline-none transition-all text-lg font-bold bg-slate-50/50 focus:bg-white appearance-none"
                   >
                     <option value="">No Category (Generic)</option>
                     {categories.map((c: any) => (
                         <option key={c.id} value={c.id}>{c.name}</option>
                     ))}
                   </select>
                </div>
            )}

            <div className="flex flex-col space-y-3 pt-4">
              <button 
                type="submit"
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-black shadow-xl shadow-slate-200 active:scale-95 transition-all"
              >
                {mode === 'edit' ? 'Commit Updates' : 'Save To Hub'}
              </button>
              <button 
                type="button" 
                onClick={() => setMode('list')}
                className="w-full py-4 text-slate-400 font-bold hover:text-slate-900 rounded-2xl transition-all"
              >
                Discard Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default MasterDataPage;
