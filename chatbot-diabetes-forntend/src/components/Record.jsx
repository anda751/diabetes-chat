import React, { useState } from 'react';

// --- [จุดที่ 1: ตั้งค่า URL ของ Render] ---
const API_BASE_URL = "https://diabetes-chat-1.onrender.com";

export default function Record({ onBack, user }) {
  const [isLoading, setIsLoading] = useState(false);
  const [record, setRecord] = useState({
    blood_sugar: '',
    carbs: '',
    insulin_meal: '',
    insulin_fix: ''
  });

  const handleSave = async () => {
    // 1. ตรวจสอบข้อมูล (อย่างน้อยต้องมีค่าน้ำตาล)
    if (!record.blood_sugar) {
      alert("กรุณากรอกค่าน้ำตาลในเลือดด้วยนะคะ ✨");
      return;
    }

    setIsLoading(true);
    try {
      // 2. เตรียมข้อมูล (รวมเวลาปัจจุบัน)
      const payload = {
        username: user,
        blood_sugar: parseInt(record.blood_sugar),
        carbs: parseInt(record.carbs || 0),
        insulin_meal: parseFloat(record.insulin_meal || 0),
        insulin_fix: parseFloat(record.insulin_fix || 0),
        timestamp: new Date().toISOString() // บันทึกเวลาที่กดส่ง
      };

      // 3. ส่งข้อมูลไปที่ Backend
      const res = await fetch(`${API_BASE_URL}/api/save_record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // 4. บันทึกสำเร็จ กลับหน้า Dashboard
        onBack(); 
      } else {
        const data = await res.json();
        alert(data.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (err) {
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ตค่ะ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col animate-in slide-in-from-bottom duration-500">
      {/* Header */}
      <header className="p-5 border-b flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center text-3xl text-slate-300 hover:text-slate-500 transition-colors">✕</button>
        <h1 className="text-xl font-black text-slate-800 tracking-tight">สร้างบันทึกใหม่</h1>
        <button 
          onClick={handleSave} 
          disabled={isLoading}
          className={`font-black text-lg transition-all ${isLoading ? 'text-slate-300' : 'text-blue-600 active:scale-90'}`}
        >
          {isLoading ? '...' : 'บันทึก'}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-10 bg-slate-50/30">
        
        {/* ส่วนที่ 1: น้ำตาลในเลือด (สีเขียว) */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-4 transition-all focus-within:ring-2 focus-within:ring-green-500/20">
          <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-2xl shadow-inner">🩸</div>
          <div className="flex-1">
            <label className="block text-xs font-black text-slate-400 uppercase mb-1">น้ำตาลในเลือด</label>
            <div className="flex items-baseline gap-2">
              <input 
                type="number" 
                inputMode="numeric"
                className="w-full text-3xl font-black outline-none text-green-600 bg-transparent placeholder:text-slate-200"
                placeholder="000"
                value={record.blood_sugar}
                onChange={(e) => setRecord({...record, blood_sugar: e.target.value})}
              />
              <span className="text-slate-400 font-bold text-sm">mg/dL</span>
            </div>
          </div>
        </div>

        {/* ส่วนที่ 2: คาร์โบไฮเดรต (สีส้ม) */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-4 transition-all focus-within:ring-2 focus-within:ring-orange-500/20">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-2xl shadow-inner">🍞</div>
          <div className="flex-1">
            <label className="block text-xs font-black text-slate-400 uppercase mb-1">ปริมาณคาร์บ (Carbs)</label>
            <div className="flex items-baseline gap-2">
              <input 
                type="number" 
                inputMode="numeric"
                className="w-full text-3xl font-black outline-none text-orange-500 bg-transparent placeholder:text-slate-200"
                placeholder="0"
                value={record.carbs}
                onChange={(e) => setRecord({...record, carbs: e.target.value})}
              />
              <span className="text-slate-400 font-bold text-sm">กรัม</span>
            </div>
          </div>
        </div>

        {/* ส่วนที่ 3: อินซูลิน (สีฟ้า/น้ำเงิน) */}
        <div className="space-y-4">
          <h3 className="text-slate-400 font-black text-xs uppercase tracking-[0.2em] px-2">การฉีดอินซูลิน (Bolus)</h3>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl">💉</div>
              <label className="flex-1 font-bold text-slate-600">อินซูลิน (อาหาร)</label>
              <input 
                type="number" 
                step="0.5"
                className="w-20 text-right text-2xl font-black outline-none text-blue-600 placeholder:text-slate-200"
                placeholder="0"
                value={record.insulin_meal}
                onChange={(e) => setRecord({...record, insulin_meal: e.target.value})}
              />
              <span className="text-slate-400 text-xs font-bold uppercase">Unit</span>
            </div>

            <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl">✨</div>
              <label className="flex-1 font-bold text-slate-600">อินซูลิน (แก้ไข)</label>
              <input 
                type="number" 
                step="0.5"
                className="w-20 text-right text-2xl font-black outline-none text-indigo-600 placeholder:text-slate-200"
                placeholder="0"
                value={record.insulin_fix}
                onChange={(e) => setRecord({...record, insulin_fix: e.target.value})}
              />
              <span className="text-slate-400 text-xs font-bold uppercase">Unit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="p-6 bg-white border-t border-slate-50">
        <button 
          onClick={handleSave}
          disabled={isLoading}
          className={`w-full py-5 rounded-[2rem] text-2xl font-black shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
            isLoading 
            ? 'bg-slate-100 text-slate-400' 
            : 'bg-blue-600 text-white shadow-blue-100 hover:brightness-105'
          }`}
        >
          {isLoading ? (
            <div className="w-6 h-6 border-4 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div>
          ) : 'ยืนยันบันทึก ✨'}
        </button>
      </div>
    </div>
  );
}