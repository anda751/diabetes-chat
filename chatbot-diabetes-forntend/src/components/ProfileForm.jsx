import React, { useState } from 'react';

// --- [จุดที่ 1: ตั้งค่า URL ของ Render] ---
const API_BASE_URL = "https://diabetes-chat-1.onrender.com";

export default function ProfileForm({ user, onComplete }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    age: '', weight: '', height: '',
    diabetes_type: 'type2', 
    medication: '',
    comorbidities: '', 
    activity_level: 'sedentary', 
    target_low: 80, 
    target_high: 130
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/save_profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, username: user })
      });
      
      if (res.ok) {
        onComplete();
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err) { 
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้"); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 pb-20 animate-in fade-in duration-500">
      <div className="mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm">🩺</div>
        <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">ข้อมูลสุขภาพส่วนตัว</h2>
        <p className="text-slate-400 font-medium leading-relaxed">ข้อมูลนี้จะช่วยให้ <span className="text-blue-600 font-bold">"น้องดูแล"</span> ประเมินสุขภาพของคุณได้แม่นยำขึ้นค่ะ</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* ส่วนที่ 1: ข้อมูลกายภาพ */}
        <section className="space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">1. ข้อมูลร่างกาย</h3>
          <div className="bg-blue-50/50 p-5 rounded-[2rem] grid grid-cols-2 gap-4 border border-blue-100">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-blue-800 text-xs ml-2">น้ำหนัก (กก.)</label>
              <input type="number" required step="0.1" min="20" max="300"
                className="bg-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all" 
                placeholder="0.0" onChange={e => setFormData({...formData, weight: e.target.value})} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold text-blue-800 text-xs ml-2">ส่วนสูง (ซม.)</label>
              <input type="number" required min="50" max="250"
                className="bg-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all" 
                placeholder="0" onChange={e => setFormData({...formData, height: e.target.value})} />
            </div>
          </div>
        </section>

        {/* ส่วนที่ 2: ข้อมูลเบาหวาน */}
        <section className="space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">2. การดูแลเบาหวาน</h3>
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700 text-sm ml-2">ประเภทเบาหวาน</label>
              <select className="bg-slate-50 p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-all cursor-pointer" 
                onChange={e => setFormData({...formData, diabetes_type: e.target.value})}>
                <option value="type2">ชนิดที่ 2 (ดื้ออินซูลิน/กินยา)</option>
                <option value="type1">ชนิดที่ 1 (ต้องฉีดอินซูลิน)</option>
                <option value="gestational">เบาหวานขณะตั้งครรภ์</option>
                <option value="pre-diabetes">กลุ่มเสี่ยง (ก่อนเบาหวาน)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700 text-sm ml-2">ยาที่ใช้เป็นประจำ</label>
              <input type="text" className="bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm" 
                placeholder="เช่น เมทฟอร์มิน, ยาลดความดัน"
                onChange={e => setFormData({...formData, medication: e.target.value})} />
            </div>
          </div>
        </section>

        {/* ส่วนที่ 3: กิจกรรม */}
        <section className="space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">3. ไลฟ์สไตล์</h3>
          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-700 text-sm ml-2">การทำกิจกรรม/ออกกำลังกาย</label>
            <select className="bg-slate-50 p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer" 
              onChange={e => setFormData({...formData, activity_level: e.target.value})}>
              <option value="sedentary">น้อยมาก (นั่งทำงานเป็นหลัก)</option>
              <option value="light">เบาๆ (เดินบ้าง 1-2 วัน/สัปดาห์)</option>
              <option value="moderate">ปานกลาง (ออกกำลังกาย 3-5 วัน/สัปดาห์)</option>
              <option value="active">หนัก (ออกกำลังกายเกือบทุกวัน)</option>
            </select>
          </div>
        </section>

        {/* ส่วนที่ 4: ค่าเป้าหมาย */}
        <section className="border-t border-slate-100 pt-6 space-y-4">
          <div className="bg-orange-50 p-5 rounded-[2rem] border border-orange-100">
            <label className="font-black text-orange-800 mb-3 block text-center">ค่าน้ำตาลเป้าหมายที่หมอแนะนำ (mg/dL)</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-orange-400 uppercase text-center">ต่ำสุด (ก่อนอาหาร)</span>
                <input type="number" defaultValue="80" 
                  className="bg-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-400 text-center font-bold text-orange-700" 
                  onChange={e => setFormData({...formData, target_low: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-orange-400 uppercase text-center">สูงสุด (หลังอาหาร)</span>
                <input type="number" defaultValue="130" 
                  className="bg-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-400 text-center font-bold text-orange-700" 
                  onChange={e => setFormData({...formData, target_high: e.target.value})} />
              </div>
            </div>
          </div>
        </section>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-xl shadow-xl shadow-blue-100 active:scale-95 transition-all hover:brightness-105 disabled:bg-slate-300"
        >
          {isLoading ? "กำลังบันทึก..." : "เริ่มบันทึกสุขภาพกันเลย ✨"}
        </button>
      </form>
    </div>
  );
}