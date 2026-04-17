import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileSpreadsheet,
  ChevronRight,
  Loader2,
  X,
  Plus
} from "lucide-react";
import type { UploadResult, SheetResult } from "../services/uploadAPI";
import { uploadMasterData } from "../services/uploadAPI";
import { useMasterData } from "../store/MasterDataContext";

const MasterUpload = () => {
    const { refresh } = useMasterData();
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<UploadResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
            setResult(null);
        }
    };

    const downloadTemplate = () => {
        const wb = XLSX.utils.book_new();

        // 1. Categories
        const catWs = XLSX.utils.json_to_sheet([
            { name: "Electronics" },
            { name: "Automotive" }
        ]);
        XLSX.utils.book_append_sheet(wb, catWs, "Categories");

        // 2. Stages
        const stageWs = XLSX.utils.json_to_sheet([
            { name: "Injection Molding" },
            { name: "Assembly" },
            { name: "Quality Check" }
        ]);
        XLSX.utils.book_append_sheet(wb, stageWs, "Stages");

        // 3. Defects
        const defectWs = XLSX.utils.json_to_sheet([
            { name: "Surface Scratch" },
            { name: "Dimension Mismatch" },
            { name: "Cracked" }
        ]);
        XLSX.utils.book_append_sheet(wb, defectWs, "Defects");

        // 4. Parts
        const partWs = XLSX.utils.json_to_sheet([
            { name: "Sensor Module A", category_name: "Electronics" },
            { name: "Bumper Plate X", category_name: "Automotive" },
            { name: "Casing Upper", category_name: "Electronics" }
        ]);
        XLSX.utils.book_append_sheet(wb, partWs, "Parts");

        XLSX.writeFile(wb, "MasterData_Template.xlsx");
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setError(null);
        try {
            const data = await uploadMasterData(file);
            setResult(data);
            refresh(); // Refresh global master data
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to upload file. Please ensure it's a valid Excel file.");
        } finally {
            setIsUploading(false);
        }
    };

    const ResultCard = ({ title, data, icon: Icon }: { title: string, data: SheetResult, icon: any }) => (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-lg bg-slate-50 text-slate-600">
                    <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                    <span className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Inserted</span>
                    <span className="text-xl font-black text-emerald-700">{data.inserted}</span>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <span className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Skipped</span>
                    <span className="text-xl font-black text-blue-700">{data.skipped}</span>
                </div>
            </div>

            {data.errors.length > 0 && (
                <div className="mt-4 space-y-2">
                    <div className="flex items-center text-xs font-bold text-rose-500 uppercase tracking-wider mb-2">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        <span>Errors ({data.errors.length})</span>
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                        {data.errors.map((err, idx) => (
                            <div key={idx} className="text-[11px] bg-rose-50 text-rose-600 p-2 rounded-lg border border-rose-100 flex items-start space-x-2">
                                <span className="font-bold whitespace-nowrap">Row {err.row}:</span>
                                <span>{err.error}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-12">
            <div className="flex justify-between items-end border-b border-slate-100 pb-6">
                <div>
                    <div className="flex items-center text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
                        <span>Master Data</span>
                        <ChevronRight className="w-3 h-3 mx-1" />
                        <span className="text-slate-400">Bulk Utility</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Bulk Upload</h1>
                    <p className="text-slate-500 mt-2 font-medium">Populate categories, parts, defects and stages in one operation.</p>
                </div>
                
                <button 
                    onClick={downloadTemplate}
                    className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-100 px-6 py-3 rounded-2xl transition-all active:scale-95 font-bold shadow-sm"
                >
                    <Download className="w-5 h-5 text-blue-600" />
                    <span>Download Template</span>
                </button>
            </div>

            {error && (
                <div className="bg-rose-50 border-2 border-rose-100 text-rose-600 px-5 py-4 rounded-2xl flex items-center space-x-3 animate-in slide-in-from-top-4 font-semibold">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {!result ? (
                <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-12 ring-1 ring-slate-100">
                    <div 
                        className={`border-4 border-dashed rounded-[24px] p-12 text-center transition-all cursor-pointer bg-slate-50/30
                            ${file ? 'border-blue-500 bg-blue-50/10' : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50/50'}`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input 
                            type="file" 
                            className="hidden" 
                            accept=".xlsx, .xls"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        
                        <div className="flex flex-col items-center">
                            <div className={`p-6 rounded-3xl mb-6 transition-all ${file ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-110' : 'bg-white text-slate-400 shadow-sm border border-slate-100'}`}>
                                {file ? <FileSpreadsheet className="w-12 h-12" /> : <Upload className="w-12 h-12" />}
                            </div>
                            
                            {file ? (
                                <>
                                    <h2 className="text-2xl font-black text-slate-800 mb-1">{file.name}</h2>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{(file.size / 1024).toFixed(1)} KB • Ready for processing</p>
                                    
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFile(null);
                                            if (fileInputRef.current) fileInputRef.current.value = '';
                                        }}
                                        className="mt-6 flex items-center space-x-2 text-slate-400 hover:text-rose-500 transition-colors font-bold text-sm"
                                    >
                                        <X className="w-4 h-4" />
                                        <span>Remove File</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-black text-slate-800 mb-2">Select Excel File</h2>
                                    <p className="text-slate-500 font-medium max-w-sm mx-auto">Drag and drop your master data spreadsheet here or click to browse your computer.</p>
                                    <div className="mt-8 inline-flex items-center space-x-3 px-4 py-2 bg-white rounded-xl border border-slate-100 text-xs font-bold text-slate-400">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        <span>Supports .xlsx and .xls formats</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="mt-10 flex justify-center">
                        <button 
                            disabled={!file || isUploading}
                            onClick={handleUpload}
                            className={`px-12 py-4 rounded-2xl font-black text-lg transition-all flex items-center space-x-3 shadow-xl
                                ${file && !isUploading 
                                    ? 'bg-slate-900 text-white hover:bg-black shadow-slate-200 active:scale-95' 
                                    : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'}`}
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <Clock className="w-6 h-6" />
                                    <span>Sync Master Data</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-in zoom-in-95 duration-500">
                    <div className="bg-emerald-50 border-2 border-emerald-100 p-8 rounded-[32px] flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <div className="p-4 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-200">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-emerald-900 leading-tight">Sync Completed Successfully</h2>
                                <p className="text-emerald-700 font-medium mt-1">Foundational data has been merged with the central repository.</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setResult(null)}
                            className="bg-white hover:bg-emerald-100 text-emerald-700 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-sm border border-emerald-200"
                        >
                            Upload Another
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ResultCard title="Categories" data={result.categories} icon={Plus} />
                        <ResultCard title="Stages" data={result.stages} icon={Clock} />
                        <ResultCard title="Defects" data={result.defects} icon={AlertCircle} />
                        <ResultCard title="Parts" data={result.parts} icon={FileSpreadsheet} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MasterUpload;
