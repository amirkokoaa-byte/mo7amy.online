import { useState, useRef, useEffect } from "react";
import { UploadCloud, CheckCircle2, FileText, AlertCircle, Trash2 } from "lucide-react";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          setUploadedDocs(data.documents || []);
        } catch (e) {
          console.error("Invalid JSON:", text);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

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
      
      const textRes = await res.text();
      let data;
      try {
        data = JSON.parse(textRes);
      } catch (err) {
        throw new Error(`Server Error: ${res.status}`);
      }
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload files");
      }

      await fetchDocs();

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

  const clearDocs = async () => {
    if (confirm("هل أنت متأكد من حذف جميع الملفات؟ ستفقد القدرة على البحث فيها.")) {
      try {
        const res = await fetch("/api/documents", { method: "DELETE" });
        if (res.ok) {
          setUploadedDocs([]);
        }
      } catch (e: any) {
        setError(e.message);
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto h-full flex flex-col">
      <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-800">إدارة القوانين وملفات PDF</h2>
      <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-lg">
        قم برفع ملفات الـ PDF التي تحتوي على القوانين والمراجع. جميع الملفات المرفوعة هنا ستكون متاحة للمساعد الذكي للإجابة عن أسئلة المستخدمين.
      </p>

      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 md:mb-8">
        <label className="block text-gray-700 font-semibold mb-4 text-base md:text-lg">اختر الملفات للرفع:</label>
        
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
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
            className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-full font-bold shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>

      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 relative flex-1 min-h-0 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-gray-800">
            <FileText className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
            الملفات المرفوعة للجميع ({uploadedDocs.length})
          </h3>
          {uploadedDocs.length > 0 && (
            <button onClick={clearDocs} className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm bg-red-50 px-3 py-1.5 rounded-md transition">
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">حذف الكل</span>
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto min-h-0">
          {uploadedDocs.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
              لا توجد ملفات مرفوعة حالياً. يرجى رفع بعض الملفات للبدء.
            </div>
          ) : (
            <ul className="space-y-3 pb-4">
              {uploadedDocs.map((doc, idx) => (
                <li key={idx} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="font-medium text-gray-700 text-sm md:text-base pr-2 truncate" dir="auto">{doc.name}</span>
                  </div>
                  <span className="text-[10px] md:text-xs text-gray-500 bg-white px-2 py-1 rounded border shadow-sm flex-shrink-0 whitespace-nowrap">
                    متاح للجميع
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
