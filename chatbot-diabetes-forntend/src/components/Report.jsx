import React, { useState, useEffect } from 'react';

// --- [จุดที่ 1: ตั้งค่า URL ของ Render] ---
const API_BASE_URL = "https://diabetes-chat-1.onrender.com";

export default function Report({ user, onBack }) {
  const [range, setRange] = useState('7'); // '7', '30', หรือ 'all'
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // ดึงข้อมูลตามช่วงเวลาที่เลือก
    const fetchUrl = `${API_BASE_URL}/api/report/${user}/${range}`;

    fetch(fetchUrl)
      .then(res => {
        if (!res.ok) throw new Error(`ไม่พบข้อมูล (Status: ${res.status})`);
        return res.json();
      })
      .then(data => {
        setRecords(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("Error fetching report:", err);
        setRecords([]);
      })
      .finally(() => setLoading(false));
  }, [user, range]);

  // ฟังก์ชันช่วยจัดรูปแบบวันที่ (เช่น "16 มี.ค. 69")
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
  };

  // ฟังก์ชันดาวน์โหลดไฟล์
  const handleExport = async (type) => {
    if (records.length === 0) return alert("ไม่มีข้อมูลสำหรับการดาวน์โหลดค่ะ");
    
    const endpoint = type === 'excel' ? 'excel' : 'pdf';
    const filename = type === 'excel' ? `รายงานน้ำตาล_${user}.xlsx` : `รายงานสุขภาพ_${user}.pdf`;

    try {
      const response = await fetch(`${API_BASE_URL}/api/export/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, records: records })
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) { 
      alert(`โหลดไฟล์ ${type.toUpperCase()} ไม่สำเร็จค่ะ`); 
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-10 animate-in fade-in duration-500">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md p-6 border-b border-slate-100 flex items-center gap-4 sticky top-0 z-20 shadow-sm">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full transition-all text-xl">
          ⬅️
        </button>
        <h1 className="text-xl font-black text-slate-800 tracking-tight">สรุปผลสุขภาพ</h1>
      </header>

      <div className="p-4 space-y-6">
        {/* เลือกช่วงเวลา */}
        <div className="bg-white p-1.5 rounded-[2rem] shadow-sm flex gap-1 border border-slate-100">
          {['7', '30', 'all'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`flex-1 py-3 rounded-2xl font-black transition-all text-sm ${
                range === r 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 scale-[1.02]' 
                : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              {r === 'all' ? 'ทั้งหมด' : `${r} วันล่าสุด`}
            </button>
          ))}
        </div>

        {/* ปุ่มดาวน์โหลด */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => handleExport('excel')}
            disabled={records.length === 0 || loading}
            className="bg-emerald-50 text-emerald-700 p-5 rounded-3xl font-black flex flex-col items-center gap-2 border border-emerald-100 active:scale-95 transition-all disabled:opacity-40"
          >
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-100">📊</div>
            <span className="text-xs uppercase tracking-wider">Excel Report</span>
          </button>

          <button 
            onClick={() => handleExport('pdf')}
            disabled={records.length === 0 || loading}
            className="bg-rose-50 text-rose-700 p-5 rounded-3xl font-black flex flex-col items-center gap-2 border border-rose-100 active:scale-95 transition-all disabled:opacity-40"
          >
            <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-rose-100">📄</div>
            <span className="text-xs uppercase tracking-wider">PDF Report</span>
          </button>
        </div>

        {/* รายการข้อมูล */}
        <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-slate-100">
          <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
            <span className="font-black text-slate-400 text-xs uppercase tracking-widest">บันทึกน้ำตาลล่าสุด</span>
            <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded-full">{records.length} รายการ</span>
          </div>
          
          <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-16 text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-400 font-bold">กำลังประมวลผลข้อมูล...</p>
              </div>
            ) : records.length > 0 ? (
              records.map((r, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-slate-800 font-black text-lg">{formatDate(r.timestamp)}</span>
                    <span className="text-[10px] font-bold text-slate-400">{r.timestamp ? r.timestamp.split(' ')[1] : ''}</span>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <span className={`text-2xl font-black ${
                        r.blood_sugar > 180 ? 'text-rose-500' : 
                        r.blood_sugar < 70 ? 'text-amber-500' : 'text-blue-600'
                      }`}>
                        {r.blood_sugar}
                      </span>
                      <span className="text-[10px] font-bold text-slate-300 uppercase">mg/dL</span>
                    </div>
                    {/* จุดสีบอกสถานะ */}
                    <div className={`w-2 h-10 rounded-full ${
                      r.blood_sugar > 180 ? 'bg-rose-500' : 
                      r.blood_sugar < 70 ? 'bg-amber-500' : 'bg-blue-600'
                    }`}></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 text-center flex flex-col items-center">
                <div className="text-6xl mb-4 grayscale opacity-50">📋</div>
                <p className="text-slate-400 font-bold leading-relaxed">ยังไม่มีบันทึกข้อมูล<br/>ในช่วงเวลานี้ค่ะ</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}