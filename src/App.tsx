import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { Book, MessageSquare, Star, Settings } from "lucide-react";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Favorites from "./pages/Favorites";

function AppContent() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const NavLinks = () => (
    <>
      <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive('/') ? 'bg-blue-100 text-blue-800 font-bold' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}`}>
        <Settings className="w-5 h-5 flex-shrink-0" />
        <span className="hidden md:inline">إدارة القوانين وملفات الطبع</span>
        <span className="md:hidden text-xs font-medium">الإدارة</span>
      </Link>
      <Link to="/chat" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive('/chat') ? 'bg-blue-100 text-blue-800 font-bold' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}`}>
        <MessageSquare className="w-5 h-5 flex-shrink-0" />
        <span className="hidden md:inline">البحث والاستشارة</span>
        <span className="md:hidden text-xs font-medium">الاستشارة</span>
      </Link>
      <Link to="/favorites" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive('/favorites') ? 'bg-blue-100 text-blue-800 font-bold' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}`}>
        <Star className="w-5 h-5 flex-shrink-0" />
        <span className="hidden md:inline">الاستشارات المفضلة</span>
        <span className="md:hidden text-xs font-medium">المفضلة</span>
      </Link>
    </>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 text-gray-900 overflow-hidden" dir="rtl">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-l px-4 py-6 flex-col justify-between flex-shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-8 px-2">
            <Book className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800">دليلي القانوني</h1>
          </div>
          <nav className="space-y-2">
            <NavLinks />
          </nav>
        </div>
        <div className="text-xs text-gray-400 text-center">
          تطبيق مساعدك القانوني الذكي<br/>يعمل بالذكاء الاصطناعي
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-16 md:pb-0 relative flex flex-col h-full items-stretch">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b shadow-sm sticky top-0 z-10">
           <div className="flex items-center gap-3">
             <Book className="w-6 h-6 text-blue-600" />
             <h1 className="text-lg font-bold text-gray-800">دليلي القانوني</h1>
           </div>
        </header>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/favorites" element={<Favorites />} />
        </Routes>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t flex justify-around items-center p-2 z-20 pb-safe">
        <Link to="/" className={`flex flex-col items-center p-2 rounded-lg ${isActive('/') ? 'text-blue-700' : 'text-gray-500'}`}>
          <Settings className={`w-6 h-6 ${isActive('/') ? 'fill-blue-100' : ''}`} />
          <span className="text-[10px] mt-1 font-medium">الإدارة</span>
        </Link>
        <Link to="/chat" className={`flex flex-col items-center p-2 rounded-lg ${isActive('/chat') ? 'text-blue-700' : 'text-gray-500'}`}>
          <MessageSquare className={`w-6 h-6 ${isActive('/chat') ? 'fill-blue-100' : ''}`} />
          <span className="text-[10px] mt-1 font-medium">الاستشارة</span>
        </Link>
        <Link to="/favorites" className={`flex flex-col items-center p-2 rounded-lg ${isActive('/favorites') ? 'text-blue-700' : 'text-gray-500'}`}>
          <Star className={`w-6 h-6 ${isActive('/favorites') ? 'fill-amber-100' : ''}`} />
          <span className="text-[10px] mt-1 font-medium">المفضلة</span>
        </Link>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

