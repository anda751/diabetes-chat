import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- [จุดที่ 1: ตั้งค่า URL กลาง] ---
const API_BASE_URL = "https://diabetes-chat-1.onrender.com";

export default function Dashboard({ user, onGoToChat, onGoToRecord, onGoToReport, onGoToSettings, onLogout }) {
  const [stats, setStats] = useState({ avg: "--", max: "--", min: "--" });
  const [graphData, setGraphData] = useState([]);
  const [timeRange, setTimeRange] = useState('7');
  const [profile, setProfile] = useState({ target_low: 80, target_high: 130 });
  
  // --- [จุดที่ 2: เพิ่มสถานะการโหลด] ---
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // ดึงข้อมูลหลายอย่างพร้อมกันเพื่อความเร็ว
        const [sRes, gRes, pRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/stats/${user}`),
          fetch(`${API_BASE_URL}/api/graph/${user}/${timeRange}`),
          fetch(`${API_BASE_URL}/api/profile/${user}`)
        ]);

        if (sRes.ok) setStats(await sRes.json());
        if (gRes.ok) setGraphData(await gRes.json());
        if (pRes.ok) setProfile(await pRes.json());

      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, timeRange]);

  return (
    <div className="flex flex-col h-full bg-slate-50 relative pb-32">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md p-5 shadow-sm flex justify-between items-center sticky top-0 z-40 border-b border-slate-100">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">แนวโน้มของฉัน</h1>
          <div className="text-blue-600 font-bold text-xs md:text-sm">คุณ {user}</div>
        </div>
        <button 
          onClick={() => window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?") && onLogout()}
          className="bg-red-50 text-red-500 p-2 md:px-4 md:py-2 rounded-xl font-bold text-xs active:scale-95 flex items-center gap-2 border border-red-100 transition-all hover:bg-red-100"
        >
          <span>🚪 <span className="hidden md:inline">ออกจากระบบ</span></span>
        </button>
      </header>

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
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 w-full relative overflow-hidden min-h-[260px]">
            {isLoading ? (
              <div className="h-[230px] flex flex-col items-center justify-center text-slate-400 animate-pulse">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-sm">กำลังสรุปข้อมูล...</p>
              </div>
            ) : graphData && graphData.length > 0 ? (
              <div style={{ width: '100%', height: 230, paddingTop: '15px' }}>
                <ResponsiveContainer width="100%" height="100%">
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
                      isAnimationActive={true}
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
            <div key={idx} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 text-center flex flex-col justify-center transition-transform active:scale-95">
              <div className={`text-lg md:text-xl font-black ${item.color}`}>{item.val}</div>
              <div className="text-[10px] md:text-xs text-slate-400 font-bold uppercase mt-1 tracking-wider">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Action */}
        <div className="px-4 mt-2">
          <button 
            onClick={onGoToRecord}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-5 rounded-3xl font-black text-xl md:text-2xl shadow-xl shadow-green-100 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <span className="text-3xl">+</span> เพิ่มบันทึกใหม่
          </button>
        </div>
      </main>

      {/* Chat Bubble */}
      <button 
        onClick={onGoToChat}
        className="fixed bottom-28 right-6 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl z-50 border-4 border-white animate-bounce active:scale-90 transition-all"
      >
        👩‍⚕️
      </button>

      {/* Nav Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-100 flex justify-around p-4 pb-8 z-40">
        <NavItem active label="แนวโน้ม" icon="graph-report" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
        <NavItem label="รายงาน" icon="business-report" onClick={onGoToReport} />
        <NavItem label="ตั้งค่า" icon="settings" onClick={onGoToSettings} />
      </footer>
    </div>
  );
}

function NavItem({ label, icon, onClick, active = false }) {
  return (
    <div onClick={onClick} className={`flex flex-col items-center transition-all cursor-pointer ${active ? 'text-blue-600 scale-110' : 'text-slate-400'}`}>
      <img src={`https://img.icons8.com/fluency/48/${icon}.png`} className="w-7 h-7 mb-1" alt={label} />
      <span className="text-[11px] font-bold tracking-tight">{label}</span>
    </div>
  );
}