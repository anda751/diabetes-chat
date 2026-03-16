import React, { useState } from 'react';
import Welcome from './components/Welcome';
import Auth from './components/Auth';
import Chat from './components/Chat';
import Dashboard from './components/Dashboard';
import Record from './components/Record';
import Report from './components/Report';
import ProfileForm from './components/ProfileForm';
import Settings from './components/Settings';

// --- [จุดที่ 1: ตั้งค่า URL ของ Render ไว้ที่เดียว] ---
const API_BASE_URL = "https://diabetes-chat-1.onrender.com";

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
      const res = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      alert(data.message);
      if (res.ok) setPage('login');
    } catch (err) { 
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง"); 
    }
  };

  // --- 2. เข้าสู่ระบบ & เช็คโปรไฟล์ ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok) {
        setUser(data.username);
        // เช็คว่ามีข้อมูลโปรไฟล์หรือยัง
        const profileRes = await fetch(`${API_BASE_URL}/api/profile/${data.username}`);
        if (profileRes.ok) {
          setPage('dashboard');
        } else {
          setPage('profile_form'); 
        }
      } else {
        alert(data.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (err) { 
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาตรวจสอบอินเทอร์เน็ต"); 
    }
  };

  // --- 3. ส่งข้อความแชท (AI) ---
  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    
    const userMsg = inputText;
    setInputText("");
    // เพิ่มข้อความฝั่ง User และใส่สถานะ "กำลังพิมพ์..." ให้ AI
    setMessages(prev => [...prev, { user_msg: userMsg, ai_reply: "กำลังพิมพ์..." }]);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, message: userMsg })
      });
      
      const data = await res.json();
      
      // อัปเดตข้อความสุดท้ายของ AI จาก "กำลังพิมพ์..." เป็นคำตอบจริง
      setMessages(prev => {
        const newMsgs = [...prev];
        if (newMsgs.length > 0) {
          newMsgs[newMsgs.length - 1].ai_reply = data.reply;
        }
        return newMsgs;
      });
    } catch (err) { 
      // กรณี Error ให้แจ้งเตือนในแชทแทน alert เพื่อ UX ที่ดี
      setMessages(prev => {
        const newMsgs = [...prev];
        if (newMsgs.length > 0) {
          newMsgs[newMsgs.length - 1].ai_reply = "ขออภัยค่ะ ระบบขัดข้องชั่วคราว ลองใหม่อีกครั้งนะคะ";
        }
        return newMsgs;
      });
    } finally { 
      setIsLoading(false); 
    }
  };

  // --- 4. ฟังก์ชันออกจากระบบ ---
  const handleLogout = () => {
    setUser(null); 
    setPage('welcome'); 
    setMessages([]); 
    setFormData({username:'', password:''});
    setInputText("");
  };

  return (
    <div className="min-h-screen bg-slate-100 md:bg-slate-900 flex justify-center items-center transition-all duration-500 font-sans">
      
      {/* Mobile Simulation Frame */}
      <div className="w-full h-screen md:h-[90vh] md:max-w-[450px] md:rounded-[3rem] md:shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-white overflow-hidden relative flex flex-col border-x border-slate-200">
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50">
          
          {page === 'welcome' && <Welcome onStart={() => setPage('auth')} />}
          
          {page === 'auth' && <Auth onSelect={(type) => setPage(type)} onBack={() => setPage('welcome')} />}

          {(page === 'login' || page === 'register') && (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-white animate-in fade-in duration-500">
              <h2 className="text-4xl font-black mb-8 text-blue-600">
                {page === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
              </h2>
              <form onSubmit={page === 'login' ? handleLogin : handleRegister} className="w-full max-w-sm space-y-4">
                <input 
                  required 
                  type="text" 
                  placeholder="ชื่อผู้ใช้งาน" 
                  autoComplete="username"
                  className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl text-xl outline-none focus:border-blue-500 focus:bg-white transition-all"
                  onChange={(e) => setFormData({...formData, username: e.target.value})} 
                />
                <input 
                  required 
                  type="password" 
                  placeholder="รหัสผ่าน" 
                  autoComplete="current-password"
                  className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl text-xl outline-none focus:border-blue-500 focus:bg-white transition-all"
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                />
                <button 
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-5 rounded-2xl text-2xl font-bold shadow-lg mt-4 active:scale-95 transition-all disabled:bg-slate-300"
                >
                  {isLoading ? 'กำลังโหลด...' : 'ตกลง'}
                </button>
                <button type="button" onClick={() => setPage('auth')} className="w-full text-slate-400 font-bold py-2 hover:text-slate-600">
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
              onLogout={handleLogout} 
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
              onLogout={handleLogout}
              onBack={() => setPage('dashboard')} 
            />
          )}

          {page === 'record' && <Record user={user} onBack={() => setPage('dashboard')} />}
          {page === 'report' && <Report user={user} onBack={() => setPage('dashboard')} />}
          {page === 'settings' && <Settings user={user} onBack={() => setPage('dashboard')} />}
          
        </div>

        {/* Home Indicator Styling */}
        <div className="hidden md:flex justify-center items-end pb-3 h-8 bg-white border-t border-slate-50">
          <div className="w-28 h-1.5 bg-slate-200 rounded-full"></div>
        </div>

      </div>
    </div>
  );
}