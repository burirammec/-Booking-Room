import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie, 
  Legend, 
  AreaChart, 
  Area,
  CartesianGrid
} from 'recharts';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Building2, 
  Clock, 
  CheckCircle2, 
  Download, 
  Printer, 
  Users,
  Award,
  ShieldAlert
} from 'lucide-react';
import { Booking, Room, UserProfile } from '../types';

interface AnalyticsProps {
  bookings: Booking[];
  rooms: Room[];
  currentUser?: UserProfile | null;
}

export const AnalyticsDashboard: React.FC<AnalyticsProps> = ({ bookings, rooms, currentUser }) => {
  // Stat calculations
  const totalBookings = bookings.length;
  const approvedBookings = bookings.filter(b => b.status === 'approved').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const approvalRate = totalBookings > 0 ? Math.round((approvedBookings / totalBookings) * 100) : 0;

  // Chart 1: Bookings count per Room
  const roomUsageData = rooms.map(room => {
    const count = bookings.filter(b => b.roomId === room.id && b.status === 'approved').length;
    return {
      name: room.code,
      fullName: room.name,
      count
    };
  });

  // Chart 2: Department distribution
  const deptMap: Record<string, number> = {};
  bookings.forEach(b => {
    if (b.status === 'approved') {
      const dept = b.department || 'ไม่ระบุภาควิชา';
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    }
  });

  const departmentData = Object.keys(deptMap).map(dept => ({
    name: dept,
    value: deptMap[dept]
  }));

  // Chart 3: Time Slot Popularity
  const slotMap = {
    'ช่วงเช้า (08:00 - 12:00)': 0,
    'ช่วงบ่าย (13:00 - 16:00)': 0,
    'ช่วงเย็น/ค่ำ (16:00 - 20:00)': 0,
    'เต็มวัน': 0
  };

  bookings.forEach(b => {
    if (b.status === 'approved') {
      if (b.startTime >= '08:00' && b.endTime <= '12:30') {
        slotMap['ช่วงเช้า (08:00 - 12:00)'] += 1;
      } else if (b.startTime >= '12:30' && b.endTime <= '17:00') {
        slotMap['ช่วงบ่าย (13:00 - 16:00)'] += 1;
      } else if (b.startTime >= '16:00') {
        slotMap['ช่วงเย็น/ค่ำ (16:00 - 20:00)'] += 1;
      } else {
        slotMap['เต็มวัน'] += 1;
      }
    }
  });

  const timeSlotData = Object.keys(slotMap).map(slot => ({
    name: slot,
    count: slotMap[slot as keyof typeof slotMap]
  }));

  // Colors (Ministry of Public Health Green Palette)
  const COLORS = ['#047857', '#0d9488', '#059669', '#10b981', '#14b8a6', '#0f766e', '#065f46'];

  // Export CSV Handler
  const handleExportCSV = () => {
    if (currentUser?.role !== 'admin') {
      alert('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถดาวน์โหลดรายงาน CSV ได้');
      return;
    }
    const headers = [
      'รหัสการจอง',
      'ห้องเรียน/ห้องปฏิบัติการ',
      'หัวข้อกิจกรรม/การเรียนการสอน',
      'วัตถุประสงค์',
      'ผู้ขอจอง',
      'อีเมล',
      'ภาควิชา/หน่วยงาน',
      'เบอร์โทรติดต่อ',
      'วันที่จอง (ปปปป-ดด-วว)',
      'เวลาเริ่ม',
      'เวลาสิ้นสุด',
      'จำนวนผู้เข้าร่วม (คน)',
      'อุปกรณ์ที่ขอใช้',
      'สถานะคำขอ',
      'หมายเหตุเจ้าหน้าที่',
      'วันที่ยื่นคำขอ'
    ];

    const statusMap: Record<string, string> = {
      approved: 'อนุมัติแล้ว',
      pending: 'รออนุมัติ',
      rejected: 'ไม่อนุมัติ',
      cancelled: 'ยกเลิกแล้ว'
    };

    const rows = bookings.map(b => {
      const requestedEquip = Array.isArray(b.requestedEquipment) && b.requestedEquipment.length > 0
        ? b.requestedEquipment.join('; ')
        : 'ไม่มี';
      const statusText = statusMap[b.status] || b.status;
      
      return [
        `"${(b.id || '').replace(/"/g, '""')}"`,
        `"${(b.roomName || '').replace(/"/g, '""')}"`,
        `"${(b.title || '').replace(/"/g, '""')}"`,
        `"${(b.purpose || '').replace(/"/g, '""')}"`,
        `"${(b.userName || '').replace(/"/g, '""')}"`,
        `"${(b.userEmail || '').replace(/"/g, '""')}"`,
        `"${(b.department || '').replace(/"/g, '""')}"`,
        `"${(b.contactPhone || '').replace(/"/g, '""')}"`,
        `"${(b.date || '').replace(/"/g, '""')}"`,
        `"${(b.startTime || '').replace(/"/g, '""')}"`,
        `"${(b.endTime || '').replace(/"/g, '""')}"`,
        `"${b.attendeesCount || 0}"`,
        `"${requestedEquip.replace(/"/g, '""')}"`,
        `"${statusText}"`,
        `"${(b.adminNote || '').replace(/"/g, '""')}"`,
        `"${(b.createdAt || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.map(h => `"${h}"`).join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `รายงานสถิติการจองห้อง_MEC_บุรีรัมย์_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (currentUser?.role !== 'admin') {
      alert('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถพิมพ์รายงานได้');
      return;
    }
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner & Print Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
            <BarChart3 className="w-4 h-4 text-emerald-700" />
            <span>ANALYTICS & SUMMARY REPORT</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight mt-0.5">
            สรุปผลและกราฟวิเคราะห์ข้อมูลการใช้ห้องเรียนและห้องปฏิบัติการ
          </h2>
          <p className="text-xs text-slate-500">
            ศูนย์แพทยศาสตรศึกษาชั้นคลินิก โรงพยาบาลบุรีรัมย์ (Buriram Medical Education Center)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentUser?.role === 'admin' ? (
            <>
              <button
                onClick={handleExportCSV}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition shadow-sm border border-emerald-600 active:scale-95 cursor-pointer"
                title="ดาวน์โหลดไฟล์รายงาน CSV"
              >
                <Download className="w-4 h-4 text-emerald-100" />
                <span>ดาวน์โหลดรายงาน (CSV)</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition border border-slate-300/80 active:scale-95 cursor-pointer"
                title="พิมพ์หน้ารายงานสรุปผล"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>พิมพ์รายงาน</span>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200/80 rounded-xl text-xs font-medium">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>ดาวน์โหลด / พิมพ์รายงาน (เฉพาะ Admin หลังบ้านเท่านั้น)</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">คำขอจองรวม</span>
            <Building2 className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="text-2xl font-extrabold text-slate-800">{totalBookings} รายการ</div>
          <p className="text-[11px] text-slate-500">คำขอจองห้องทั้งหมดในระบบ</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">รายการอนุมัติ</span>
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-teal-600">{approvedBookings} รายการ</div>
          <p className="text-[11px] text-teal-700 font-medium">อัตราการอนุมัติ {approvalRate}%</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">รอการอนุมัติ</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{pendingBookings} รายการ</div>
          <p className="text-[11px] text-slate-500">รอเจ้าหน้าที่ตรวจสอบความพร้อม</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">ห้องยอดนิยมสูงสุด</span>
            <Award className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-base font-bold text-slate-800 truncate">
            {roomUsageData.length > 0 ? roomUsageData.sort((a,b) => b.count - a.count)[0]?.fullName.split(' ')[0] : '-'}
          </div>
          <p className="text-[11px] text-slate-500">มีการใช้งานเรียนการสอนถี่ที่สุด</p>
        </div>
      </div>

      {/* Main Analytical Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Room Usage Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-700" />
              จำนวนการจองแยกตามห้องเรียน/ห้องปฏิบัติการ
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">(อนุมัติแล้ว)</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roomUsageData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  formatter={(value) => [`${value} ครั้ง`, 'จำนวนการจองที่อนุมัติ']}
                  labelFormatter={(label) => `รหัสห้อง: ${label}`}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#047857" radius={[8, 8, 0, 0]}>
                  {roomUsageData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Department Distribution Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-teal-600" />
              สัดส่วนการจองแยกตามภาควิชา / ชั้นปีนักศึกษา
            </h3>
          </div>
          <div className="h-64">
            {departmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={{ strokeWidth: 1 }}
                  >
                    {departmentData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} ครั้ง`, 'จำนวนการจอง']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                ยังไม่มีข้อมูลการจองแยกตามภาควิชา
              </div>
            )}
          </div>
        </div>

        {/* Chart 3: Peak Time Slot Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              ความหนาแน่นการใช้งานแยกตามช่วงเวลา (Peak Time Slots)
            </h3>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSlotData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" width={170} tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} />
                <Tooltip formatter={(value) => [`${value} รายการ`, 'การเข้าใช้งาน']} />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-800">
            ตารางสรุปรายการขอจองห้องทั้งหมด ({bookings.length} รายการ)
          </h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition border border-emerald-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลด CSV</span>
            </button>
            <span className="text-xs text-slate-500">ข้อมูลอัปเดตล่าสุด Real-time</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">วันที่ / เวลา</th>
                <th className="py-3 px-4">ชื่อห้องเรียน</th>
                <th className="py-3 px-4">หัวข้อกิจกรรม / การสอน</th>
                <th className="py-3 px-4">ผู้ขอจอง / ภาควิชา</th>
                <th className="py-3 px-4">จำนวนคน</th>
                <th className="py-3 px-4 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-800">{b.date}</div>
                    <div className="text-[11px] text-slate-500">{b.startTime} - {b.endTime} น.</div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-emerald-900">{b.roomName}</td>
                  <td className="py-3 px-4 max-w-xs truncate">{b.title}</td>
                  <td className="py-3 px-4">
                    <div>{b.userName}</div>
                    <div className="text-[10px] text-slate-400">{b.department}</div>
                  </td>
                  <td className="py-3 px-4">{b.attendeesCount} คน</td>
                  <td className="py-3 px-4 text-center">
                    {b.status === 'approved' && (
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold text-[11px]">อนุมัติแล้ว</span>
                    )}
                    {b.status === 'pending' && (
                      <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold text-[11px]">รออนุมัติ</span>
                    )}
                    {b.status === 'rejected' && (
                      <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-semibold text-[11px]">ไม่อนุมัติ</span>
                    )}
                    {b.status === 'cancelled' && (
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold text-[11px]">ยกเลิกแล้ว</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
