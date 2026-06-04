import { useState, useRef, useEffect } from "react";
import { UploadCloud, CheckCircle2, FileText, AlertCircle, Trash2 } from "lucide-react";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("legal_documents");
    if (saved) {
      setUploadedDocs(JSON.parse(saved));
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    setError(null);
    
    const formData = new FormData();
    files.forEach(file => formData.append("files", file));

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload files");
      }

      const newDocs = [...uploadedDocs, ...data.files];
      setUploadedDocs(newDocs);
      localStorage.setItem("legal_documents", JSON.stringify(newDocs));
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const clearDocs = () => {
    if (confirm("هل أنت متأكد من حذف جميع الملفات؟ ستفقد القدرة على البحث فيها.")) {
      setUploadedDocs([]);
      localStorage.removeItem("legal_documents");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">إدارة القوانين وملفات PDF</h2>
      <p className="text-gray-600 mb-8 text-lg">
        قم برفع ملفات الـ PDF التي تحتوي على القوانين والمراجع. سيتم إضافتها إلى قاعدة المعرفة الخاصة بالمساعد الذكي للبحث والاستشارة.
      </p>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <label className="block text-gray-700 font-semibold mb-4 text-lg">اختر الملفات للرفع:</label>
        
        <div className="flex gap-4 items-center">
          <input 
            type="file" 
            accept="application/pdf" 
            multiple 
            onChange={handleFileChange}
            disabled={uploading}
            ref={fileInputRef}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-3 file:px-6 file:mr-rtl
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100 transition cursor-pointer"
          />
          <button 
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-bold shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {uploading ? (
              <span className="animate-pulse">جاري الرفع...</span>
            ) : (
              <>
                <UploadCloud className="w-5 h-5" />
                <span>رفع الملفات</span>
              </>
            )}
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
            <FileText className="w-6 h-6 text-gray-400" />
            الملفات المرفوعة ({uploadedDocs.length})
          </h3>
          {uploadedDocs.length > 0 && (
            <button onClick={clearDocs} className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm bg-red-50 px-3 py-1.5 rounded-md transition">
              <Trash2 className="w-4 h-4" />
              <span>حذف الكل</span>
            </button>
          )}
        </div>
        
        {uploadedDocs.length === 0 ? (
          <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
            لا توجد ملفات مرفوعة حالياً. يرجى رفع بعض الملفات للبدء.
          </div>
        ) : (
          <ul className="space-y-3">
            {uploadedDocs.map((doc, idx) => (
              <li key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-gray-700">{doc.name}</span>
                </div>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border shadow-sm">
                  مفهرس وجاهز
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
