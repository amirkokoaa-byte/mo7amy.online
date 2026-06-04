import { useState, useEffect } from "react";
import { Star, Share2, Trash2, BookOpen } from "lucide-react";

export default function Favorites() {
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("favorite_consultations");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  const removeFav = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الاستشارة من المفضلة؟")) {
      const newFavs = favorites.filter(f => f.id !== id);
      setFavorites(newFavs);
      localStorage.setItem("favorite_consultations", JSON.stringify(newFavs));
    }
  };

  const handleShare = async (fav: any) => {
    const shareData = {
      title: "استشارة قانونية من دليلي القانوني",
      text: `السؤال: ${fav.question}\n\nالإجابة:\n${fav.answer}`,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareData.text);
      alert("تم نسخ الاستشارة إلى الحافظة. يمكنك لصقها وإرسالها للمختصين.");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto">
      <div className="flex items-center gap-3 mb-8">
        <Star className="w-8 h-8 text-amber-500 fill-current" />
        <h2 className="text-3xl font-bold text-gray-800">الاستشارات المفضلة</h2>
      </div>
      
      {favorites.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">لا توجد استشارات مفضلة بعد</h3>
          <p className="text-gray-400">يمكنك حفظ الإجابات المهمة من شاشة البحث والاستشارة للرجوع إليها لاحقاً.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {favorites.map((fav) => (
            <div key={fav.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-100 p-4 flex justify-between items-start gap-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">{fav.date}</div>
                  <h4 className="font-bold text-gray-800 text-lg leading-snug">{fav.question}</h4>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button 
                    onClick={() => handleShare(fav)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="مشاركة الاستشارة"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => removeFav(fav.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="حذف من المفضلة"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-5 text-gray-700 whitespace-pre-wrap leading-relaxed">
                {fav.answer}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
