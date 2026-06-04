import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Book, MessageSquare, Star, Settings } from "lucide-react";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Favorites from "./pages/Favorites";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-50 text-gray-900" dir="rtl">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-l px-4 py-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <Book className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-800">دليلي القانوني</h1>
            </div>
            
            <nav className="space-y-2">
              <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition">
                <Settings className="w-5 h-5" />
                <span>إدارة القوانين وملفات الطبع</span>
              </Link>
              <Link to="/chat" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition">
                <MessageSquare className="w-5 h-5" />
                <span>البحث والاستشارة</span>
              </Link>
              <Link to="/favorites" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition">
                <Star className="w-5 h-5" />
                <span>الاستشارات المفضلة</span>
              </Link>
            </nav>
          </div>
          
          <div className="text-xs text-gray-400 text-center">
            تطبيق مساعدك القانوني الذكي<br/>يعمل بالذكاء الاصطناعي
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

