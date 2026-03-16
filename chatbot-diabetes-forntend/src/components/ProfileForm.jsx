import React, { useState } from 'react';

export default function ProfileForm({ user, onComplete }) {
  const [formData, setFormData] = useState({
    age: '', weight: '', height: '',
    diabetes_type: 'type2', 
    medication: '',
    comorbidities: '', // โรคประจำตัวอื่นๆ
    activity_level: 'sedentary', // ระดับกิจกรรม
    target_low: 80, 
    target_high: 130
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:5000/api/save_profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, username: user })
      });
      if (res.ok) onComplete();
    } catch (err) { alert("บันทึกข้อมูลไม่สำเร็จ"); }
  };

  return (
    <div className="min-h-screen bg-white p-6 pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-800 mb-2">ข้อมูลสุขภาพส่วนตัว</h2>
        <p className="text-slate-400">ข้อมูลนี้จะช่วยให้ "น้องดูแล" ประเมินสุขภาพของคุณได้ดียิ่งขึ้นค่ะ</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 1. ข้อมูลกายภาพพื้นฐาน */}
        <div className="bg-blue-50 p-5 rounded-3xl grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-bold text-blue-800 text-sm">น้ำหนัก (กก.)</label>
            <input type="number" required className="bg-white p-4 rounded-2xl outline-blue-500 shadow-sm" 
              placeholder="0.0" onChange={e => setFormData({...formData, weight: e.target.value})} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-bold text-blue-800 text-sm">ส่วนสูง (ซม.)</label>
            <input type="number" required className="bg-white p-4 rounded-2xl outline-blue-500 shadow-sm" 
              placeholder="0" onChange={e => setFormData({...formData, height: e.target.value})} />
          </div>
        </div>

        {/* 2. รายละเอียดเบาหวาน */}
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-600">ประเภทเบาหวาน</label>
            <select className="bg-slate-50 p-4 rounded-2xl border-none outline-blue-500" 
              onChange={e => setFormData({...formData, diabetes_type: e.target.value})}>
              <option value="type1">ชนิดที่ 1 (ต้องฉีดอินซูลิน)</option>
              <option value="type2">ชนิดที่ 2 (ดื้ออินซูลิน/กินยา)</option>
              <option value="gestational">เบาหวานขณะตั้งครรภ์</option>
              <option value="pre-diabetes">กลุ่มเสี่ยง (ก่อนเบาหวาน)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-600">ยาที่ใช้เป็นประจำ</label>
            <input type="text" className="bg-slate-50 p-4 rounded-2xl outline-blue-500" 
              placeholder="เช่น เมทฟอร์มิน หรือ ชื่อยาลดความดัน"
              onChange={e => setFormData({...formData, medication: e.target.value})} />
          </div>
        </div>

        {/* 3. โรคประจำตัวและภาวะแทรกซ้อน (สำคัญมาก) */}
        <div className="flex flex-col gap-1">
          <label className="font-bold text-slate-600">โรคประจำตัวอื่นๆ / ภาวะแทรกซ้อน</label>
          <input type="text" className="bg-slate-50 p-4 rounded-2xl outline-blue-500" 
            placeholder="เช่น ความดันสูง, ไขมันในเลือด, โรคไต"
            onChange={e => setFormData({...formData, comorbidities: e.target.value})} />
        </div>

        {/* 4. การออกกำลังกาย (ส่งผลต่อการตอบสนองของอินซูลิน) */}
        <div className="flex flex-col gap-1">
          <label className="font-bold text-slate-600">การทำกิจกรรม/ออกกำลังกาย</label>
          <select className="bg-slate-50 p-4 rounded-2xl border-none outline-blue-500" 
            onChange={e => setFormData({...formData, activity_level: e.target.value})}>
            <option value="sedentary">น้อยมาก (นั่งทำงานเป็นหลัก)</option>
            <option value="light">เบาๆ (เดินบ้าง 1-2 วัน/สัปดาห์)</option>
            <option value="moderate">ปานกลาง (ออกกำลังกาย 3-5 วัน/สัปดาห์)</option>
            <option value="active">หนัก (ออกกำลังกายเกือบทุกวัน)</option>
          </select>
        </div>

        {/* 5. ค่าเป้าหมายที่หมอแนะนำ */}
        <div className="border-t pt-6">
          <label className="font-bold text-slate-800 mb-3 block">ค่าน้ำตาลเป้าหมาย (mg/dL)</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-400">ต่ำสุด (ก่อนอาหาร)</span>
              <input type="number" defaultValue="80" className="bg-slate-50 p-4 rounded-2xl outline-blue-500" 
                onChange={e => setFormData({...formData, target_low: e.target.value})} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-400">สูงสุด (หลังอาหาร)</span>
              <input type="number" defaultValue="130" className="bg-slate-50 p-4 rounded-2xl outline-blue-500" 
                onChange={e => setFormData({...formData, target_high: e.target.value})} />
            </div>
          </div>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-3xl font-bold text-xl shadow-xl shadow-blue-100 active:scale-95 transition-all">
          เริ่มบันทึกสุขภาพกันเลย ✨
        </button>
      </form>
    </div>
  );
}