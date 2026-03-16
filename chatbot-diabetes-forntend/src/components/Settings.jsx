import React, { useState, useEffect } from 'react';

export default function Settings({ user, onBack }) {
  const [profile, setProfile] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' หรือ 'account'

  useEffect(() => {
    // ดึงข้อมูลเดิมมาโชว์
    fetch(`http://127.0.0.1:5000/api/profile/${user}`)
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(err => console.error(err));
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const res = await fetch('http://127.0.0.1:5000/api/save_profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    if (res.ok) alert("อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้วค่ะ");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const res = await fetch('http://127.0.0.1:5000/api/update_password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, new_password: newPassword })
    });
    if (res.ok) {
        alert("เปลี่ยนรหัสผ่านสำเร็จ");
        setNewPassword('');
    }
  };

  if (!profile) return <div className="p-10 text-center">กำลังโหลด...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-10">
      <header className="bg-white p-6 shadow-sm flex items-center gap-4 sticky top-0 z-10">
        <button onClick={onBack} className="text-2xl">←</button>
        <h1 className="text-xl font-bold text-slate-800">ตั้งค่าบัญชี</h1>
      </header>

      <div className="flex p-4 gap-2">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 rounded-xl font-bold ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'}`}
        >ข้อมูลส่วนตัว</button>
        <button 
          onClick={() => setActiveTab('account')}
          className={`flex-1 py-2 rounded-xl font-bold ${activeTab === 'account' ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'}`}
        >รหัสผ่าน</button>
      </div>

      <div className="p-4 flex-1">
        {activeTab === 'profile' ? (
          <form onSubmit={handleUpdateProfile} className="space-y-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">น้ำหนัก (กก.)</label>
                <input type="number" value={profile.weight} className="w-full p-3 bg-slate-50 rounded-xl"
                  onChange={e => setProfile({...profile, weight: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">ส่วนสูง (ซม.)</label>
                <input type="number" value={profile.height} className="w-full p-3 bg-slate-50 rounded-xl"
                  onChange={e => setProfile({...profile, height: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">ยาที่ใช้ประจำ</label>
              <textarea value={profile.medication} className="w-full p-3 bg-slate-50 rounded-xl" rows="2"
                onChange={e => setProfile({...profile, medication: e.target.value})} />
            </div>
            <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100">บันทึกการเปลี่ยนแปลง</button>
          </form>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">รหัสผ่านใหม่</label>
              <input type="password" value={newPassword} required className="w-full p-3 bg-slate-50 rounded-xl"
                placeholder="กรอกรหัสผ่านใหม่" onChange={e => setNewPassword(e.target.value)} />
            </div>
            <button className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold">เปลี่ยนรหัสผ่าน</button>
          </form>
        )}
      </div>
    </div>
  );
}
