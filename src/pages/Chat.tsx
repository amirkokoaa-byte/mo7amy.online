import { useState, useEffect, useRef } from "react";
import { Send, Mic, Square, Volume2, Star, StopCircle, RefreshCw } from "lucide-react";
import Markdown from "react-markdown";

export default function Chat() {
  const [messages, setMessages] = useState<{ role: string; text: string; id: number }[]>([
    { role: "model", text: "أهلاً بك في 'دليلي القانوني'. كيف يمكنني مساعدتك اليوم في شؤون القانون أو تقديم استشارة قانونية؟", id: Date.now() }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
  const [documentUris, setDocumentUris] = useState<any[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    fetch("/api/documents")
      .then(res => res.json())
      .then(data => setDocumentUris(data.documents || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    // Setup Speech Recognition
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-EG';
      recognition.interimResults = true;
      recognition.continuous = true;

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setInput(prev => prev + " " + finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      stopCurrentAudio();
    };
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setInput("");
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }

    const userMessage = { role: "user", text: input, id: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Send to server
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          documentUris
        }),
      });

      const textRes = await res.text();
      let data;
      try {
        data = JSON.parse(textRes);
      } catch (err) {
        throw new Error(`Server Error: ${res.status}`);
      }

      if (!res.ok) throw new Error(data?.error || "Error from server");

      setMessages(prev => [...prev, { role: "model", text: data.text, id: Date.now() }]);
    } catch (e: any) {
      console.error(e);
      setMessages(prev => [...prev, { role: "model", text: "عذراً، حدث خطأ أثناء الاتصال بالخادم.", id: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  const stopCurrentAudio = () => {
    if (currentAudioSourceRef.current) {
      currentAudioSourceRef.current.stop();
      currentAudioSourceRef.current.disconnect();
      currentAudioSourceRef.current = null;
    }
    setPlayingAudioId(null);
  };

  const playTTS = async (text: string, messageId: number) => {
    if (playingAudioId === messageId) {
      stopCurrentAudio();
      return;
    }

    stopCurrentAudio();
    setPlayingAudioId(messageId);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const textRes = await res.text();
      let data;
      try {
        data = JSON.parse(textRes);
      } catch (err) {
        throw new Error(`Server Error: ${res.status}`);
      }

      if (!res.ok) throw new Error(data?.error || "Error from server");

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const binaryString = atob(data.audioBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const audioBuffer = await audioContextRef.current.decodeAudioData(bytes.buffer);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        setPlayingAudioId(null);
        currentAudioSourceRef.current = null;
      };

      source.start(0);
      currentAudioSourceRef.current = source;

    } catch (e) {
      console.error("TTS playback error:", e);
      setPlayingAudioId(null);
    }
  };

  const saveToFavorites = (msg: any) => {
    const saved = localStorage.getItem("favorite_consultations");
    const favs = saved ? JSON.parse(saved) : [];
    
    // find the previous user message for context
    const msgIndex = messages.findIndex(m => m.id === msg.id);
    let question = "استشارة عامة";
    if (msgIndex > 0 && messages[msgIndex - 1].role === "user") {
      question = messages[msgIndex - 1].text;
    }

    const newFav = {
      id: Date.now(),
      question,
      answer: msg.text,
      date: new Date().toLocaleDateString("ar-EG")
    };

    localStorage.setItem("favorite_consultations", JSON.stringify([newFav, ...favs]));
    alert("تم حفظ الاستشارة في المفضلة بنجاح!");
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl p-5 ${m.role === "user" ? "bg-blue-600 text-white rounded-tl-none shadow-md" : "bg-gray-100 text-gray-800 rounded-tr-none border border-gray-200"}`}>
              <div className="whitespace-pre-wrap leading-relaxed markdown-body">
                 {m.role === "model" ? <Markdown>{m.text}</Markdown> : m.text}
              </div>
              
              {m.role === "model" && m.id !== messages[0].id && (
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-200/50 text-gray-500">
                  <button 
                    onClick={() => playTTS(m.text, m.id)}
                    className="hover:text-blue-600 transition flex items-center gap-1"
                    title={playingAudioId === m.id ? "إيقاف الصوت" : "استماع"}
                  >
                    {playingAudioId === m.id ? <StopCircle className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
                    <span className="text-xs">{playingAudioId === m.id ? "إيقاف" : "استماع"}</span>
                  </button>
                  <button 
                    onClick={() => saveToFavorites(m)}
                    className="hover:text-amber-500 transition flex items-center gap-1 ml-auto"
                    title="حفظ في المفضلة"
                  >
                    <Star className="w-4 h-4" />
                    <span className="text-xs">حفظ</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-tr-none p-5 flex items-center gap-3 border border-gray-200">
              <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
              <span className="text-gray-500">جاري البحث في القوانين وصياغة الاستشارة...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto flex items-end gap-3 bg-gray-50 rounded-3xl p-2 border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition">
          <button 
            type="button"
            onClick={toggleRecording}
            className={`p-3 rounded-full flex-shrink-0 transition ${isRecording ? "bg-red-100 text-red-600 animate-pulse" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            title="تحدث بدلاً من الكتابة"
          >
            {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isRecording ? "تحدث الآن، جاري الاستماع..." : "اكتب سؤالك أو استشارتك هنا..."}
            className="flex-1 bg-transparent border-0 outline-none resize-none max-h-32 min-h-[44px] py-3 text-gray-800"
            rows={1}
            dir="auto"
          />
          
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="p-3 bg-blue-600 text-white rounded-full flex-shrink-0 shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition hover:-translate-y-0.5 active:translate-y-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center mt-2 text-xs text-gray-400">
          يمكنك الضغط على زر الميكروفون للتحدث مباشرة، وسؤال البوت عن أي مادة قانونية أو استشارة.
        </div>
      </div>
    </div>
  );
}
