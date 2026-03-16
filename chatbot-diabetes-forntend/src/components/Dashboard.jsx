import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard({ user, onGoToChat, onGoToRecord, onGoToReport, onGoToSettings, onLogout }) {
  const [stats, setStats] = useState({ avg: "--", max: "--", min: "--" });
  const [graphData, setGraphData] = useState([]);
  const [timeRange, setTimeRange] = useState('7');
  const [profile, setProfile] = useState({ target_low: 80, target_high: 130 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sRes = await fetch(`http://127.0.0.1:5000/api/stats/${user}`);
        if (sRes.ok) {
          const sData = await sRes.json();
          setStats(sData);
        }

        const gRes = await fetch(`http://127.0.0.1:5000/api/graph/${user}/${timeRange}`);
        if (gRes.ok) {
          const gData = await gRes.json();
          setGraphData(gData);
        }

        const pRes = await fetch(`http://127.0.0.1:5000/api/profile/${user}`);
        if (pRes.ok) {
          const pData = await pRes.json();
          setProfile(pData);
        }
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      }
    };
    fetchData();
  }, [user, timeRange]);

  const handleIconError = (e) => {
    e.target.style.display = 'none';
    if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative pb-32">
      {/* Header - ปรับให้กว้างตาม Container หลัก */}
      <header className="bg-white/80 backdrop-blur-md p-5 shadow-sm flex justify-between items-center sticky top-0 z-30 border-b border-slate-100">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">แนวโน้มของฉัน</h1>
          <div className="text-blue-600 font-bold text-xs md:text-sm">คุณ {user}</div>
        </div>
        <button 
          onClick={() => window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?") && onLogout()}
          className="bg-red-50 text-red-500 p-2 md:px-4 md:py-2 rounded-xl font-bold text-xs active:scale-95 flex items-center gap-2 border border-red-100 transition-all hover:bg-red-100"
        >
          <span>🚪 <span className="hidden md:inline">ออก</span></span>
        </button>
      </header>

      {/* Main Content Scroll Area */}
      <main className="flex-1">
        {/* Time Range Selector */}
        <div className="flex justify-center gap-2 p-4">
          {['1', '7', '30'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`flex-1 max-w-[100px] py-2.5 rounded-2xl font-bold text-sm transition-all ${
                timeRange === range ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'
              }`}
            >
              {range === '1' ? '24 ชม.' : `${range} วัน`}
            </button>
          ))}
        </div>

        {/* Graph Section */}
        <div className="px-4 w-full">
  <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 w-full relative overflow-hidden">
    {graphData && graphData.length > 0 ? (
      /* หุ้มด้วย div เพิ่มเติมเพื่อคุมระยะ */
      <div style={{ width: '100%', height: 230, paddingTop: '15px' }}> {/* เพิ่มความสูงเล็กน้อยและใส่ paddingTop */}
        <ResponsiveContainer width="100%" height="100%">
          {/* เพิ่ม margin-top: 20px ใน LineChart เพื่อดันตัวกราฟลงมา */}
          <LineChart data={graphData} margin={{ top: 20, right: 10, left: -30, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="time" hide />
            <YAxis domain={[40, 300]} hide />
            <Tooltip 
              contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              labelStyle={{ fontWeight: 'bold' }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#2563eb" 
              strokeWidth={4} 
              dot={{ r: 5, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} 
              activeDot={{ r: 7 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    ) : (
      <div className="h-[230px] flex flex-col items-center justify-center text-slate-300">
        <span className="text-5xl mb-2 text-slate-200">📈</span>
        <p>ยังไม่มีข้อมูลบันทึกในช่วงนี้</p>
      </div>
    )}
          </div>
        </div>
        {/* Stats Cards */}
        <div className="p-4 grid grid-cols-3 gap-3">
          {[
            { label: 'ค่าเฉลี่ย', val: stats.avg, color: 'text-blue-600' },
            { label: 'เป้าหมาย', val: `${profile.target_low}-${profile.target_high}`, color: 'text-green-600' },
            { label: 'สูง/ต่ำ', val: `${stats.max}/${stats.min}`, color: 'text-orange-500' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 text-center flex flex-col justify-center transition-transform hover:scale-105">
              <div className={`text-lg md:text-xl font-black ${item.color}`}>{item.val}</div>
              <div className="text-[10px] md:text-xs text-slate-400 font-bold uppercase mt-1 tracking-wider">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Action */}
        <div className="px-4 mt-2">
          <button 
            onClick={onGoToRecord}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-5 rounded-3xl font-black text-xl md:text-2xl shadow-xl shadow-green-100 active:scale-95 transition-all hover:brightness-105 flex items-center justify-center gap-3"
          >
            <span className="text-3xl">+</span> เพิ่มบันทึกใหม่
          </button>
        </div>
      </main>

      {/* Chat Bubble - ปรับให้อยู่ในกรอบ Container */}
      <button 
        onClick={onGoToChat}
        className="absolute bottom-28 right-6 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-200 flex items-center justify-center text-3xl z-40 border-4 border-white animate-bounce active:scale-90 transition-all"
      >
        👩‍⚕️
      </button>

      {/* Nav Bar - ปรับให้ติดด้านล่างของ Container และจำกัดความกว้าง */}
      <footer className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-100 flex justify-around p-4 pb-8 z-30">
        <NavItem active label="แนวโน้ม" icon="graph-report" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
        <NavItem label="รายงาน" icon="business-report" onClick={onGoToReport} />
        <NavItem label="ตั้งค่า" icon="settings" onClick={onGoToSettings} />
      </footer>
    </div>
  );
}

// Sub-component สำหรับ Navigation Item
function NavItem({ label, icon, onClick, active = false }) {
  return (
    <div onClick={onClick} className={`flex flex-col items-center transition-all cursor-pointer ${active ? 'text-blue-600 scale-110' : 'text-slate-400 hover:text-blue-400'}`}>
      <img src={`https://img.icons8.com/fluency/48/${icon}.png`} className="w-7 h-7 mb-1" alt={label} />
      <span className="text-[11px] font-bold tracking-tight">{label}</span>
    </div>
  );
}