import React, { useEffect, useRef } from 'react';

export default function Chat({ user, messages, inputText, setInputText, onSend, isLoading, onLogout, onBack }) {
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ฟังก์ชันสำหรับใช้เสียงภาษาไทย
  const startVoice = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      alert("เบราว์เซอร์ของคุณไม่รองรับการสั่งงานด้วยเสียง");
      return;
    }
    const recognition = new Recognition();
    recognition.lang = 'th-TH';
    recognition.onresult = (event) => {
      setInputText(event.results[0][0].transcript);
    };
    recognition.start();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header - ปรับให้ติดด้านบนของ Container */}
      <header className="bg-white/80 backdrop-blur-md p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack} 
            className="text-2xl p-2 hover:bg-slate-100 rounded-full transition-all active:scale-90"
            title="ย้อนกลับ"
          >
            ⬅️
          </button>
          
          <div className="relative">
            <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-inner">👩‍⚕️</div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">น้องดูแล</h1>
            <p className="text-xs text-slate-400">ออนไลน์</p>
          </div>
        </div>
        <button 
          onClick={onLogout} 
          className="text-slate-400 hover:text-red-500 text-sm font-bold px-3 py-1 rounded-lg transition-colors"
        >
          ออกจากระบบ
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-2 opacity-60">
            <span className="text-6xl">💬</span>
            <p className="text-lg font-medium">เริ่มต้นพูดคุยกับน้องดูแล</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className="flex flex-col space-y-2">
            {/* User Message */}
            <div className="flex justify-end animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="bg-blue-600 text-white px-5 py-3 rounded-2xl rounded-tr-none max-w-[85%] shadow-md text-lg">
                {msg.user_msg}
              </div>
            </div>
            
            {/* AI Reply */}
            <div className="flex justify-start animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="bg-white text-slate-800 px-5 py-3 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm border border-slate-100 text-lg whitespace-pre-line leading-relaxed">
                {msg.ai_reply === "กำลังพิมพ์..." ? (
                  <div className="flex gap-1 py-2">
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                ) : msg.ai_reply}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </main>

      {/* Footer - ออกแบบให้ดูสะอาดและใช้ง่าย */}
      <footer className="p-4 bg-white border-t border-slate-100 space-y-3">
        <button 
          onClick={startVoice}
          className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-2xl font-bold text-xl shadow-lg shadow-red-100 flex items-center justify-center gap-2 active:scale-95 transition-all hover:brightness-105"
        >
          🎤 พูดคำถามของคุณ
        </button>

        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 focus-within:border-blue-400 transition-all">
          <input 
            type="text" 
            className="flex-1 bg-transparent px-4 py-2 text-lg outline-none" 
            placeholder="พิมพ์ข้อความ..." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
          />
          <button 
            onClick={onSend}
            disabled={isLoading || !inputText.trim()}
            className={`px-6 py-2 rounded-xl text-lg font-bold text-white transition-all shadow-md ${
              isLoading || !inputText.trim() ? 'bg-slate-300 shadow-none' : 'bg-blue-600 hover:bg-blue-700 active:scale-90'
            }`}
          >
            {isLoading ? "..." : "ส่ง"}
          </button>
        </div>
      </footer>
    </div>
  );
}