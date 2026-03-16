import React, { useState } from 'react';
import Welcome from './components/Welcome';
import Auth from './components/Auth';
import Chat from './components/Chat';
import Dashboard from './components/Dashboard';
import Record from './components/Record';
import Report from './components/Report';
import ProfileForm from './components/ProfileForm';
import Settings from './components/Settings';

export default function App() {
  const [page, setPage] = useState('welcome'); 
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [messages, setMessages] = useState([]); 
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- 1. สมัครสมาชิก ---
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      alert(data.message);
      if (res.ok) setPage('login');
    } catch (err) { alert("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้"); }
  };

  // --- 2. เข้าสู่ระบบ & เช็คโปรไฟล์ ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok) {
        setUser(data.username);
        const profileRes = await fetch(`http://127.0.0.1:5000/api/profile/${data.username}`);
        if (profileRes.ok) {
          setPage('dashboard');
        } else {
          setPage('profile_form'); 
        }
      } else {
        alert(data.message);
      }
    } catch (err) { alert("เกิดข้อผิดพลาดในการล็อกอิน"); }
  };

  // --- 3. ส่งข้อความแชท (AI) ---
  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    const userMsg = inputText;
    setInputText("");
    setMessages(prev => [...prev, { user_msg: userMsg, ai_reply: "กำลังพิมพ์..." }]);
    setIsLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, message: userMsg })
      });
      const data = await res.json();
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1].ai_reply = data.reply;
        return newMsgs;
      });
    } catch (err) { 
      alert("AI ขัดข้องชั่วคราว");
    } finally { setIsLoading(false); }
  };

  return (
    /* พื้นหลัง: มือถือจะเป็นสี Slate จางๆ ส่วน Laptop จะเป็นสีเข้มเพื่อเน้นตัวเครื่องจำลอง */
    <div className="min-h-screen bg-slate-100 md:bg-slate-900 flex justify-center items-center transition-all duration-500 font-sans">
      
      {/* Responsive Container:
         - Mobile: กว้าง 100%, สูง 100% (h-screen)
         - Laptop: กว้าง 450px, สูง 90% ของหน้าจอ (90vh), ขอบมนมาก (rounded-3xl), มีเงาซ้อนกัน 
      */}
      <div className="w-full h-screen md:h-[90vh] md:max-w-[450px] md:rounded-[3rem] md:shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-white overflow-hidden relative flex flex-col border-x border-slate-200">
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50">
          
          {page === 'welcome' && <Welcome onStart={() => setPage('auth')} />}
          {page === 'auth' && <Auth onSelect={(type) => setPage(type)} onBack={() => setPage('welcome')} />}

          {(page === 'login' || page === 'register') && (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-white">
              <h2 className="text-4xl font-black mb-8 text-blue-600">
                {page === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
              </h2>
              <form onSubmit={page === 'login' ? handleLogin : handleRegister} className="w-full max-w-sm space-y-4">
                <input 
                  required 
                  type="text" 
                  placeholder="ชื่อผู้ใช้งาน" 
                  className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl text-xl outline-none focus:border-blue-500 focus:bg-white transition-all"
                  onChange={(e) => setFormData({...formData, username: e.target.value})} 
                />
                <input 
                  required 
                  type="password" 
                  placeholder="รหัสผ่าน" 
                  className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl text-xl outline-none focus:border-blue-500 focus:bg-white transition-all"
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                />
                <button className="w-full bg-blue-600 text-white py-5 rounded-2xl text-2xl font-bold shadow-lg mt-4 active:scale-95 transition-all">
                  ตกลง
                </button>
                <button type="button" onClick={() => setPage('auth')} className="w-full text-slate-400 font-bold py-2">
                  ย้อนกลับ
                </button>
              </form>
            </div>
          )}

          {page === 'profile_form' && <ProfileForm user={user} onComplete={() => setPage('dashboard')} />}

          {page === 'dashboard' && (
            <Dashboard 
              user={user} 
              onGoToChat={() => setPage('chat')} 
              onGoToRecord={() => setPage('record')}
              onGoToReport={() => setPage('report')}
              onGoToSettings={() => setPage('settings')}
              onLogout={() => { setUser(null); setPage('welcome'); setMessages([]); setFormData({username:'', password:''}); }} 
            />
          )}

          {page === 'chat' && (
            <Chat 
              user={user} 
              messages={messages} 
              inputText={inputText} 
              setInputText={setInputText} 
              onSend={handleSendMessage} 
              isLoading={isLoading} 
              onBack={() => setPage('dashboard')} 
            />
          )}

          {page === 'record' && <Record user={user} onBack={() => setPage('dashboard')} />}
          {page === 'report' && <Report user={user} onBack={() => setPage('dashboard')} />}
          {page === 'settings' && <Settings user={user} onBack={() => setPage('dashboard')} />}
          
        </div>

        {/* ตกแต่งแถบ Home Indicator ด้านล่างเฉพาะใน Laptop เพื่อให้เหมือนมือถือจริงๆ */}
        <div className="hidden md:flex justify-center items-end pb-3 h-8 bg-white border-t border-slate-50">
          <div className="w-28 h-1.5 bg-slate-200 rounded-full"></div>
        </div>

      </div>
    </div>
  );
}