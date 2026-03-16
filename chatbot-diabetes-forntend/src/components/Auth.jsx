import React from 'react';

export default function Auth({ onSelect, onBack }) {
  return (
    <div className="h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <h2 className="text-4xl font-bold text-slate-800 text-center mb-10">เข้าใช้งานระบบ</h2>
        <button onClick={() => onSelect('login')} className="w-full bg-blue-600 text-white py-6 rounded-3xl text-2xl font-bold shadow-lg cursor-pointer">
          เข้าสู่ระบบ
        </button>
        <button onClick={() => onSelect('register')} className="w-full bg-white border-4 border-blue-600 text-blue-600 py-6 rounded-3xl text-2xl font-bold shadow-sm cursor-pointer">
          สมัครสมาชิกใหม่
        </button>
        <button onClick={onBack} className="w-full text-slate-400 text-lg font-medium mt-4">ย้อนกลับ</button>
      </div>
    </div>
  );
}