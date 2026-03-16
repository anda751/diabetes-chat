import React, { useState, useEffect } from 'react';

export default function Report({ user, onBack }) {
  const [range, setRange] = useState('7'); // '7', '30', หรือ 'all'
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // ดึงข้อมูลตามช่วงเวลาที่เลือก
    setLoading(true);
    
    // FIX: ปรับ URL ให้ส่งแค่ค่า range (เช่น /anda/7 หรือ /anda/all) 
    // เพื่อให้ตรงกับโครงสร้าง API ทั่วไป และป้องกัน Error 404
    const fetchUrl = `http://127.0.0.1:5000/api/report/${user}/${range}`;

    fetch(fetchUrl)
      .then(res => {
        if (!res.ok) throw new Error(`ระบุที่อยู่ผิดหรือไม่มีข้อมูล (Status: ${res.status})`);
        return res.json();
      })
      .then(data => {
        setRecords(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching report:", err);
        setRecords([]);
        setLoading(false);
      });
  }, [user, range]);

  // ฟังก์ชันดาวน์โหลด Excel
  const handleExportExcel = async () => {
    if (records.length === 0) return alert("ไม่มีข้อมูลสำหรับการดาวน์โหลด");
    try {
      const response = await fetch('http://127.0.0.1:5000/api/export/excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, records: records })
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `รายงานน้ำตาล_${user}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) { 
      alert("ไม่สามารถดาวน์โหลดไฟล์ Excel ได้"); 
    }
  };

  // ฟังก์ชันดาวน์โหลด PDF
  const handleExportPDF = async () => {
    if (records.length === 0) return alert("ไม่มีข้อมูลสำหรับการดาวน์โหลด");
    try {
      const res = await fetch('http://127.0.0.1:5000/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, records: records })
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `รายงานสุขภาพ_${user}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) { 
      alert("โหลด PDF ไม่สำเร็จ"); 
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-10">
      <header className="bg-white p-6 border-b flex items-center gap-4 sticky top-0 z-10">
        <button onClick={onBack} className="text-3xl p-2 hover:bg-slate-100 rounded-full transition-colors">⬅️</button>
        <h1 className="text-2xl font-bold text-slate-800">รายงานสุขภาพ</h1>
      </header>

      <div className="p-4 space-y-6">
        {/* เลือกช่วงเวลา */}
        <div className="bg-white p-2 rounded-[24px] shadow-sm flex gap-2 border border-slate-100">
          {['7', '30', 'all'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`flex-1 py-3 rounded-2xl font-bold transition-all ${
                range === r ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50'
              }`}
            >
              {r === 'all' ? 'ทั้งหมด' : `${r} วัน`}
            </button>
          ))}
        </div>

        {/* ปุ่มดาวน์โหลด 2 แบบ */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={handleExportExcel}
            className="bg-green-600 text-white py-4 rounded-2xl font-bold flex flex-col items-center gap-1 shadow-md active:scale-95 transition-all disabled:opacity-50"
            disabled={records.length === 0}
          >
            <span className="text-2xl">📊</span>
            <span>โหลด Excel</span>
          </button>

          <button 
            onClick={handleExportPDF}
            className="bg-red-500 text-white py-4 rounded-2xl font-bold flex flex-col items-center gap-1 shadow-md active:scale-95 transition-all disabled:opacity-50"
            disabled={records.length === 0}
          >
            <span className="text-2xl">📄</span>
            <span>โหลด PDF</span>
          </button>
        </div>

        {/* ตารางข้อมูลพรีวิว */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b">
              <tr className="text-slate-500 text-sm uppercase">
                <th className="p-4 font-bold">วัน-เวลา</th>
                <th className="p-4 text-right font-bold">น้ำตาล (mg/dL)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan="2" className="p-10 text-center text-slate-400">กำลังโหลดข้อมูล...</td>
                </tr>
              ) : records.length > 0 ? (
                records.map((r, i) => (
                  <tr key={i} className="text-lg hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-600">
                      <div className="font-medium">{r.timestamp ? r.timestamp.split(' ')[0] : '-'}</div>
                      <div className="text-xs text-slate-400">{r.timestamp ? r.timestamp.split(' ')[1] : ''}</div>
                    </td>
                    <td className={`p-4 text-right font-black ${r.blood_sugar > 180 ? 'text-red-500' : 'text-blue-600'}`}>
                      {r.blood_sugar}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="p-10 text-center text-slate-300">
                    <div className="text-4xl mb-2">📭</div>
                    <p>ไม่มีข้อมูลในช่วงนี้</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}