import React, { useEffect, useRef, useState } from 'react';

export default function Chat({ user, messages, inputText, setInputText, onSend, isLoading, onLogout, onBack }) {
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const [isListening, setIsListening] = useState(false);

  // เลื่อนลงล่างสุดอัตโนมัติเมื่อมีข้อความใหม่
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus ที่ช่องพิมพ์เมื่อเข้าหน้าแชท
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ฟังก์ชันสำหรับใช้เสียงภาษาไทย
  const startVoice = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      alert("เบราว์เซอร์ของคุณไม่รองรับการสั่งงานด้วยเสียง");
      return;
    }
    
    const recognition = new Recognition();
    recognition.lang = 'th-TH';
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      // หากต้องการให้ส่งทันทีที่พูดจบ สามารถใส่ onSend() ตรงนี้ได้
    };

    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack} 
            className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full transition-all active:scale-90 text-xl"
            title="ย้อนกลับ"
          >
            ⬅️
          </button>
          
          <div className="relative">
            <div className="bg-blue-600 w-11 h-11 rounded-full flex items-center justify-center text-xl shadow-inner border-2 border-white">👩‍⚕️</div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          
          <div>
            <h1 className="text-lg font-black text-slate-800 leading-tight">น้องดูแล</h1>
            <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Online</p>
          </div>
        </div>
        <button 
          onClick={() => window.confirm("ต้องการออกจากระบบใช่หรือไม่?") && onLogout()} 
          className="text-slate-400 hover:text-red-500 text-xs font-bold px-3 py-2 rounded-xl hover:bg-red-50 transition-all"
        >
          ออกจากระบบ
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-slate-50/50">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4 opacity-60 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-4xl shadow-sm">💬</div>
            <div className="text-center">
              <p className="text-lg font-black text-slate-400">สวัสดีค่ะ คุณ {user}</p>
              <p className="text-sm">มีอะไรให้น้องดูแลช่วยไหมคะ?</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className="flex flex-col space-y-2">
            {/* User Message */}
            <div className="flex justify-end animate-in fade-in slide-in-from-right-3 duration-300">
              <div className="bg-blue-600 text-white px-5 py-3 rounded-3xl rounded-tr-none max-w-[85%] shadow-lg shadow-blue-100 text-[16px] leading-relaxed">
                {msg.user_msg}
              </div>
            </div>
            
            {/* AI Reply */}
            <div className="flex justify-start animate-in fade-in slide-in-from-left-3 duration-300">
              <div className="bg-white text-slate-800 px-5 py-3 rounded-3xl rounded-tl-none max-w-[85%] shadow-sm border border-slate-100 text-[16px] whitespace-pre-line leading-relaxed">
                {msg.ai_reply === "กำลังพิมพ์..." ? (
                  <div className="flex gap-1.5 py-2 px-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-duration:0.8s]"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]"></div>
                  </div>
                ) : (
                  msg.ai_reply
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </main>

      {/* Footer */}
      <footer className="p-4 bg-white border-t border-slate-100 space-y-3 z-30 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
        <button 
          onClick={startVoice}
          disabled={isListening}
          className={`w-full py-3.5 rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all ${
            isListening 
            ? 'bg-red-100 text-red-600 animate-pulse border border-red-200' 
            : 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-rose-100 hover:brightness-105'
          }`}
        >
          {isListening ? '🛑 กำลังฟังเสียงของคุณ...' : '🎤 พูดคำถามของคุณ'}
        </button>

        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-md transition-all">
          <input 
            ref={inputRef}
            type="text" 
            className="flex-1 bg-transparent px-4 py-2 text-md outline-none text-slate-700" 
            placeholder="พิมพ์ข้อความคุยกับน้องดูแล..." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && onSend()}
          />
          <button 
            onClick={onSend}
            disabled={isLoading || !inputText.trim()}
            className={`px-5 py-2 rounded-xl text-md font-black text-white transition-all ${
              isLoading || !inputText.trim() 
              ? 'bg-slate-300' 
              : 'bg-blue-600 hover:bg-blue-700 active:scale-90 shadow-md shadow-blue-100'
            }`}
          >
            {isLoading ? "..." : "ส่ง"}
          </button>
        </div>
      </footer>
    </div>
  );
}