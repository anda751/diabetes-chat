import React, { useState } from 'react';

export default function Record({ onBack, user }) {
  const [record, setRecord] = useState({
    blood_sugar: '',
    carbs: '',
    insulin_meal: '',
    insulin_fix: ''
  });

  const handleSave = async () => {
    // 1. ตรวจสอบว่ากรอกค่าน้ำตาลหรือยัง (อย่างน้อยต้องมีค่าน้ำตาล)
    if (!record.blood_sugar) {
      alert("กรุณากรอกค่าน้ำตาลในเลือดด้วยค่ะ");
      return;
    }

    try {
      // 2. ส่งข้อมูลไปที่ Backend
      const res = await fetch('http://127.0.0.1:5000/api/save_record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user,
          blood_sugar: parseInt(record.blood_sugar),
          carbs: parseInt(record.carbs || 0),
          insulin_meal: parseFloat(record.insulin_meal || 0),
          insulin_fix: parseFloat(record.insulin_fix || 0)
        })
      });

      if (res.ok) {
        // 3. ถ้าบันทึกสำเร็จ ให้เด้งกลับหน้า Dashboard
        onBack(); 
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (err) {
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
        <button onClick={onBack} className="text-3xl text-slate-400">✕</button>
        <h1 className="text-xl font-bold">สร้างบันทึก</h1>
        <button onClick={handleSave} className="text-blue-600 font-bold text-lg">บันทึก</button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* น้ำตาลในเลือด */}
        <div className="flex items-center gap-4 border-b pb-4">
          <div className="w-5 h-5 rounded-full bg-green-600"></div>
          <label className="flex-1 text-xl font-medium">น้ำตาลในเลือด</label>
          <input 
            type="number" 
            className="w-24 text-right text-3xl font-bold outline-none text-green-700"
            placeholder="-"
            value={record.blood_sugar}
            onChange={(e) => setRecord({...record, blood_sugar: e.target.value})}
          />
          <span className="text-slate-400 font-bold">มก./ดล.</span>
        </div>

        {/* คาร์บ */}
        <div className="flex items-center gap-4 border-b pb-4">
          <div className="w-5 h-5 rounded-full bg-orange-400"></div>
          <label className="flex-1 text-xl font-medium">คาร์บ</label>
          <input 
            type="number" 
            className="w-24 text-right text-3xl font-bold outline-none text-orange-600"
            placeholder="-"
            value={record.carbs}
            onChange={(e) => setRecord({...record, carbs: e.target.value})}
          />
          <span className="text-slate-400 font-bold">กรัม</span>
        </div>

        {/* อินซูลิน */}
        <div className="space-y-6">
          <h3 className="text-slate-400 font-bold text-sm uppercase tracking-wider">การคำนวณ Bolus</h3>
          <div className="flex items-center gap-4 border-b pb-4">
            <div className="w-5 h-5 rounded bg-cyan-500"></div>
            <label className="flex-1 text-lg">อินซูลิน (อาหาร)</label>
            <input 
              type="number" 
              className="w-20 text-right text-2xl outline-none"
              placeholder="0"
              value={record.insulin_meal}
              onChange={(e) => setRecord({...record, insulin_meal: e.target.value})}
            />
            <span className="text-slate-400">หน่วย</span>
          </div>
          <div className="flex items-center gap-4 border-b pb-4">
            <div className="w-5 h-5 rounded bg-cyan-700"></div>
            <label className="flex-1 text-lg">อินซูลิน (แก้ไข)</label>
            <input 
              type="number" 
              className="w-20 text-right text-2xl outline-none"
              placeholder="0"
              value={record.insulin_fix}
              onChange={(e) => setRecord({...record, insulin_fix: e.target.value})}
            />
            <span className="text-slate-400">หน่วย</span>
          </div>
        </div>
      </div>

      <div className="p-6 bg-slate-50 border-t">
        <button 
          onClick={handleSave}
          className="w-full bg-blue-600 text-white py-5 rounded-2xl text-2xl font-bold shadow-lg active:scale-95 transition-all"
        >
          ตกลง
        </button>
      </div>
    </div>
  );
}