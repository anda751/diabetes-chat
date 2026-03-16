import React, { useState, useEffect } from 'react';

// --- [จุดที่ 1: ตั้งค่า URL ของ Render] ---
const API_BASE_URL = "https://diabetes-chat-1.onrender.com";

export default function Settings({ user, onBack }) {
  const [profile, setProfile] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' หรือ 'account'
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // ดึงข้อมูลเดิมมาแสดง
    fetch(`${API_BASE_URL}/api/profile/${user}`)
      .then(res => {
        if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูลโปรไฟล์ได้");
        return res.json();
      })
      .then(data => setProfile(data))
      .catch(err => {
        console.error(err);
        // หากดึงไม่ได้ ให้ตั้งค่าเริ่มต้นเพื่อไม่ให้แอปค้าง
        setProfile({ weight: '', height: '', medication: '', username: user });
      });
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/save_profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        alert("อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้วค่ะ ✨");
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (err) {
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      alert("รหัสผ่านควรมีความยาวอย่างน้อย 4 ตัวอักษร");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/update_password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, new_password: newPassword })
      });
      if (res.ok) {
        alert("เปลี่ยนรหัสผ่านสำเร็จแล้วค่ะ 🔒");
        setNewPassword('');
      } else {
        alert("ไม่สามารถเปลี่ยนรหัสผ่านได้");
      }
    } catch (err) {
      alert("การเชื่อมต่อล้มเหลว");
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-slate-500 font-bold">กำลังโหลดข้อมูล...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-10 animate-in fade-in duration-300">
      {/* Header */}
      <header className="bg-white p-6 shadow-sm flex items-center gap-4 sticky top-0 z-10 border-b border-slate-100">
        <button onClick={onBack} className="text-2xl hover:bg-slate-100 w-10 h-10 rounded-full flex items-center justify-center transition-all">
          ←
        </button>
        <h1 className="text-xl font-black text-slate-800 tracking-tight">ตั้งค่าบัญชี</h1>
      </header>

      {/* Tabs */}
      <div className="flex p-4 gap-2">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-3 rounded-2xl font-bold transition-all ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-slate-400 border border-slate-200'}`}
        >
          ข้อมูลส่วนตัว
        </button>
        <button 
          onClick={() => setActiveTab('account')}
          className={`flex-1 py-3 rounded-2xl font-bold transition-all ${activeTab === 'account' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-slate-400 border border-slate-200'}`}
        >
          รหัสผ่าน
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1">
        {activeTab === 'profile' ? (
          <form onSubmit={handleUpdateProfile} className="space-y-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase mb-1 block">น้ำหนัก (กก.)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={profile.weight} 
                  className="w-full p-4 bg-slate-50 rounded-2xl border border-transparent focus:border-blue-500 outline-none transition-all"
                  placeholder="เช่น 65.5"
                  onChange={e => setProfile({...profile, weight: e.target.value})} 
                />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase mb-1 block">ส่วนสูง (ซม.)</label>
                <input 
                  type="number" 
                  value={profile.height} 
                  className="w-full p-4 bg-slate-50 rounded-2xl border border-transparent focus:border-blue-500 outline-none transition-all"
                  placeholder="เช่น 170"
                  onChange={e => setProfile({...profile, height: e.target.value})} 
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-black text-slate-400 uppercase mb-1 block">ยาที่ใช้ประจำ / โรคประจำตัว</label>
              <textarea 
                value={profile.medication} 
                className="w-full p-4 bg-slate-50 rounded-2xl border border-transparent focus:border-blue-500 outline-none transition-all" 
                rows="3"
                placeholder="ระบุยาหรือข้อมูลที่ต้องการให้ AI ทราบ"
                onChange={e => setProfile({...profile, medication: e.target.value})} 
              />
            </div>
            <button 
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 active:scale-95 transition-all disabled:bg-slate-300"
            >
              {isLoading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div>
              <label className="text-xs font-black text-slate-400 uppercase mb-1 block">รหัสผ่านใหม่</label>
              <input 
                type="password" 
                value={newPassword} 
                required 
                className="w-full p-4 bg-slate-50 rounded-2xl border border-transparent focus:border-blue-500 outline-none transition-all"
                placeholder="กรอกรหัสผ่านใหม่" 
                onChange={e => setNewPassword(e.target.value)} 
              />
            </div>
            <button 
              disabled={isLoading}
              className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold active:scale-95 transition-all disabled:bg-slate-300"
            >
              {isLoading ? 'กำลังอัปเดต...' : 'เปลี่ยนรหัสผ่าน'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}