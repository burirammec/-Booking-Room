import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Calendar, 
  User, 
  MapPin, 
  Building2, 
  Briefcase, 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Plus, 
  Pencil, 
  Trash2, 
  AlertCircle, 
  LogOut, 
  LogIn, 
  FileText, 
  Award,
  Sparkles,
  Timer,
  Check,
  X,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Zap,
  Info
} from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, ShiftType, UserProfile, UserRole } from '../types';

interface AttendanceManagementProps {
  currentUser: UserProfile | null;
  attendanceRecords: AttendanceRecord[];
  onAddAttendance: (record: AttendanceRecord) => Promise<void>;
  onUpdateAttendance: (id: string, data: Partial<AttendanceRecord>) => Promise<void>;
  onDeleteAttendance: (id: string) => Promise<void>;
  onSelectRole?: (role: UserRole) => void;
  showToast: (message: string, type?: 'success' | 'info') => void;
}

export const AttendanceManagement: React.FC<AttendanceManagementProps> = ({
  currentUser,
  attendanceRecords,
  onAddAttendance,
  onUpdateAttendance,
  onDeleteAttendance,
  onSelectRole,
  showToast
}) => {
  // Live Clock State
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateString, setCurrentDateString] = useState<string>('');

  // Admin filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState<'my_checkin' | 'all_records' | 'role_inspect'>(
    currentUser?.role === 'admin' ? 'all_records' : 'my_checkin'
  );

  // User Clock-in Form State
  const [selectedShift, setSelectedShift] = useState<ShiftType>('morning');
  const [selectedLocation, setSelectedLocation] = useState<string>('อาคารศูนย์แพทยศาสตรศึกษาชั้นคลินิก');
  const [taskNote, setTaskNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Admin Edit/Add Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [modalForm, setModalForm] = useState<Partial<AttendanceRecord>>({
    userName: '',
    department: 'ศูนย์แพทยศาสตรศึกษาชั้นคลินิก',
    date: new Date().toISOString().split('T')[0],
    checkInTime: '08:00',
    checkOutTime: '16:30',
    shiftType: 'morning',
    shiftName: 'เวรเช้า (08:00 - 16:00)',
    location: 'อาคารศูนย์แพทยศาสตรศึกษาชั้นคลินิก',
    status: 'completed',
    note: '',
    adminNote: '',
    verifiedByAdmin: true
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Update Live Time Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDateString(now.toLocaleDateString('th-TH', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  // Locations Preset
  const hospitalLocations = [
    'อาคารศูนย์แพทยศาสตรศึกษาชั้นคลินิก ชั้น 9',
    'สำนักงานศูนย์แพทยศาสตร์ ชั้น 2',
    'หอผู้ป่วยอายุรกรรม 1 - 2 รพ.บุรีรัมย์',
    'หอผู้ป่วยศัลยกรรม รพ.บุรีรัมย์',
    'หอผู้ป่วยสูติ-นรีเวชกรรม / ห้องคลอด',
    'หอผู้ป่วยกุมารเวชกรรม (เด็ก)',
    'ห้องฉุกเฉินและอุบัติเหตุ (ER)',
    'ห้องผ่าตัดใหญ่ (OR)',
    'หอผู้ป่วยวิกฤต (ICU / CCU)',
    'ห้องตรวจผู้ป่วยนอก (OPD คลินิก)'
  ];

  const shiftOptions: { type: ShiftType; name: string; timeRange: string; defaultStatus: AttendanceStatus }[] = [
    { type: 'morning', name: 'เวรเช้า (08:00 - 16:00)', timeRange: '08:00 - 16:00', defaultStatus: 'on_duty' },
    { type: 'afternoon', name: 'เวรบ่าย (16:00 - 24:00)', timeRange: '16:00 - 24:00', defaultStatus: 'on_duty' },
    { type: 'night', name: 'เวรดึก (24:00 - 08:00)', timeRange: '24:00 - 08:00', defaultStatus: 'on_duty' },
    { type: 'full_day', name: 'ปฏิบัติงานประจำวัน (08:30 - 16:30)', timeRange: '08:30 - 16:30', defaultStatus: 'on_duty' },
    { type: 'on_call_ward', name: 'เวรราวด์วอร์ด / On-Call 24 ชม.', timeRange: 'ตามตารางเวรคลินิก', defaultStatus: 'on_duty' },
    { type: 'weekend_duty', name: 'เวรปฏิบัติงานวันหยุดราชการ', timeRange: '08:30 - 16:30', defaultStatus: 'on_duty' }
  ];

  // Find User's active Check-in today
  const userActiveRecord = attendanceRecords.find(
    r => r.userId === (currentUser?.uid || 'demo-user-01') && 
         r.date === todayStr && 
         (r.status === 'on_duty' || !r.checkOutTime)
  );

  // User's own attendance list
  const myRecords = attendanceRecords.filter(
    r => r.userId === (currentUser?.uid || 'demo-user-01') || r.userEmail === currentUser?.email
  );

  // Filtered Attendance for Admin / Overview
  const filteredRecords = attendanceRecords.filter(r => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesDate = !dateFilter || r.date === dateFilter;
    const matchesDept = departmentFilter === 'all' || r.department.includes(departmentFilter);
    const matchesSearch = !searchQuery || 
      r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.note && r.note.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesStatus && matchesDate && matchesDept && matchesSearch;
  });

  // Calculate Stats
  const todayRecords = attendanceRecords.filter(r => r.date === todayStr);
  const totalCheckedInToday = todayRecords.length;
  const onDutyCount = todayRecords.filter(r => r.status === 'on_duty').length;
  const completedCount = todayRecords.filter(r => r.status === 'completed').length;
  const verifiedCount = todayRecords.filter(r => r.verifiedByAdmin).length;

  // Handle User Clock In
  const handleUserClockIn = async () => {
    if (!currentUser) {
      showToast('กรุณาเข้าสู่ระบบก่อนลงเวลาเข้างาน', 'info');
      return;
    }

    setIsSubmitting(true);
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    const shiftObj = shiftOptions.find(s => s.type === selectedShift) || shiftOptions[0];

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now().toString().slice(-6)}`,
      userId: currentUser.uid,
      userName: currentUser.displayName || 'ผู้ใช้งานระบบ',
      userEmail: currentUser.email,
      userRole: currentUser.role,
      department: currentUser.department || 'ศูนย์แพทยศาสตรศึกษาชั้นคลินิก',
      academicYear: currentUser.academicYear,
      date: todayStr,
      checkInTime: timeFormatted,
      shiftType: selectedShift,
      shiftName: shiftObj.name,
      location: selectedLocation,
      status: 'on_duty',
      note: taskNote.trim() || 'ลงเวลาเข้าปฏิบัติงานประจำวัน',
      verifiedByAdmin: currentUser.role === 'admin',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    try {
      await onAddAttendance(newRecord);
      showToast(`ลงเวลาเข้างานสำเร็จ (${timeFormatted} น. - ${shiftObj.name})`);
      setTaskNote('');
    } catch (err) {
      console.error('Clock in error:', err);
      showToast('เกิดข้อผิดพลาดในการบันทึกเวลา กรุณาลองใหม่อีกครั้ง', 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle User Clock Out
  const handleUserClockOut = async (record: AttendanceRecord) => {
    setIsSubmitting(true);
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

    // Calculate approx working hours
    let hoursWorked = 8.0;
    try {
      const [inH, inM] = record.checkInTime.split(':').map(Number);
      const [outH, outM] = timeFormatted.split(':').map(Number);
      const diffMinutes = (outH * 60 + outM) - (inH * 60 + inM);
      if (diffMinutes > 0) {
        hoursWorked = Math.round((diffMinutes / 60) * 10) / 10;
      }
    } catch {
      hoursWorked = 8.0;
    }

    try {
      await onUpdateAttendance(record.id, {
        checkOutTime: timeFormatted,
        status: 'completed',
        workingHours: hoursWorked,
        updatedAt: now.toISOString()
      });
      showToast(`ลงเวลาออกงานสำเร็จ (${timeFormatted} น. รวมปฏิบัติงาน ${hoursWorked} ชม.)`);
    } catch (err) {
      console.error('Clock out error:', err);
      showToast('เกิดข้อผิดพลาดในการบันทึกเวลาออกงาน', 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Admin Quick Verify Attendance
  const handleAdminVerify = async (recordId: string, currentVerified: boolean) => {
    try {
      await onUpdateAttendance(recordId, {
        verifiedByAdmin: !currentVerified,
        verifiedAt: !currentVerified ? new Date().toISOString() : undefined
      });
      showToast(!currentVerified ? 'ยืนยันและรับรองเวลาเข้างานเรียบร้อยแล้ว' : 'ยกเลิกการรับรองเวลาแล้ว');
    } catch (err) {
      console.error('Verify error:', err);
      showToast('ไม่สามารถอัปเดตสถานะได้', 'info');
    }
  };

  // Admin Open Add/Edit Modal
  const handleOpenAddModal = () => {
    setEditingRecord(null);
    setModalForm({
      id: `att-${Date.now().toString().slice(-6)}`,
      userId: currentUser?.uid || 'usr-manual',
      userName: '',
      userEmail: 'buriram.mec@cpird.in.th',
      userRole: 'user',
      department: 'กลุ่มงานแพทยศาสตรศึกษา',
      academicYear: 'นักศึกษาแพทย์ / บุคลากร',
      date: todayStr,
      checkInTime: '08:00',
      checkOutTime: '16:30',
      shiftType: 'morning',
      shiftName: 'เวรเช้า (08:00 - 16:00)',
      location: 'อาคารศูนย์แพทยศาสตรศึกษาชั้นคลินิก',
      status: 'completed',
      note: 'บันทึกเวลาโดยผู้ดูแลระบบ (Admin)',
      adminNote: '',
      workingHours: 8.5,
      verifiedByAdmin: true
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setModalForm({ ...record });
    setIsEditModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalForm.userName || !modalForm.date || !modalForm.checkInTime) {
      showToast('กรุณากรอกข้อมูลสำคัญให้ครบถ้วน', 'info');
      return;
    }

    const shiftObj = shiftOptions.find(s => s.type === modalForm.shiftType) || shiftOptions[0];

    const finalRecord: AttendanceRecord = {
      id: editingRecord ? editingRecord.id : (modalForm.id || `att-${Date.now()}`),
      userId: editingRecord ? editingRecord.userId : (modalForm.userId || 'usr-manual'),
      userName: modalForm.userName || 'ผู้ใช้งาน',
      userEmail: modalForm.userEmail || 'buriram.mec@cpird.in.th',
      userRole: modalForm.userRole || 'user',
      department: modalForm.department || 'ศูนย์แพทยศาสตรศึกษาชั้นคลินิก',
      academicYear: modalForm.academicYear,
      date: modalForm.date || todayStr,
      checkInTime: modalForm.checkInTime || '08:00',
      checkOutTime: modalForm.checkOutTime || undefined,
      shiftType: modalForm.shiftType || 'morning',
      shiftName: shiftObj.name,
      location: modalForm.location || 'อาคารศูนย์แพทยศาสตรศึกษาชั้นคลินิก',
      status: modalForm.status || 'completed',
      note: modalForm.note || '',
      adminNote: modalForm.adminNote || '',
      workingHours: Number(modalForm.workingHours) || undefined,
      verifiedByAdmin: modalForm.verifiedByAdmin ?? true,
      createdAt: editingRecord ? editingRecord.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingRecord) {
      await onUpdateAttendance(editingRecord.id, finalRecord);
      showToast(`อัปเดตข้อมูลการลงเวลาของ "${finalRecord.userName}" สำเร็จ`);
    } else {
      await onAddAttendance(finalRecord);
      showToast(`เพิ่มรายการลงเวลาของ "${finalRecord.userName}" สำเร็จ`);
    }
    setIsEditModalOpen(false);
  };

  const handleDeleteRecord = async (id: string) => {
    await onDeleteAttendance(id);
    setDeleteConfirmId(null);
    showToast('ลบรายการลงเวลาเรียบร้อยแล้ว', 'info');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'รหัสบันทึก',
      'วันที่ (YYYY-MM-DD)',
      'ชื่อ-นามสกุล',
      'อีเมล',
      'สิทธิ์/บทบาท',
      'ภาควิชา/หน่วยงาน/ชั้นปี',
      'กะ/เวร',
      'เวลาเข้างาน',
      'เวลาออกงาน',
      'ชั่วโมงปฏิบัติงาน',
      'สถานที่ปฏิบัติงาน',
      'สถานะ',
      'บันทึกภารกิจ',
      'บันทึก Admin',
      'การรับรอง'
    ];

    const rows = filteredRecords.map(r => [
      `"${r.id}"`,
      `"${r.date}"`,
      `"${(r.userName || '').replace(/"/g, '""')}"`,
      `"${r.userEmail || ''}"`,
      `"${r.userRole === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'ผู้ใช้งาน (User)'}"`,
      `"${(r.department || '').replace(/"/g, '""')}"`,
      `"${(r.shiftName || '').replace(/"/g, '""')}"`,
      `"${r.checkInTime || ''}"`,
      `"${r.checkOutTime || '-'}"`,
      `"${r.workingHours || '-'}"`,
      `"${(r.location || '').replace(/"/g, '""')}"`,
      `"${r.status === 'on_duty' ? 'กำลังปฏิบัติงาน' : r.status === 'completed' ? 'เสร็จสิ้น' : r.status}"`,
      `"${(r.note || '').replace(/"/g, '""')}"`,
      `"${(r.adminNote || '').replace(/"/g, '""')}"`,
      `"${r.verifiedByAdmin ? 'รับรองแล้ว' : 'ยังไม่รับรอง'}"`
    ]);

    const csvContent = '\uFEFF' + [headers.map(h => `"${h}"`).join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `รายงานการลงเวลาเข้างาน_ศูนย์แพทยศาสตร์บุรีรัมย์_${dateFilter || todayStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('ดาวน์โหลดรายงาน CSV เรียบร้อยแล้ว');
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Hospital Identity & Real-time Live Clock */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 rounded-3xl shadow-xl border border-emerald-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center space-x-4">
          <div className="p-3.5 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-2xl text-white font-bold shadow-lg border border-emerald-400/30 shrink-0">
            <Timer className="w-8 h-8 text-emerald-100" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-900/90 px-2.5 py-0.5 rounded-full border border-emerald-700/80">
                BURIRAM MEC • DUTY & ATTENDANCE SYSTEM
              </span>
              <span className="text-[10px] text-emerald-300/80">ระบบลงเวลาเข้างาน/เข้าเวรคลินิก</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white mt-1">
              ระบบบันทึกและตรวจสอบเวลาเข้างาน / เวรปฏิบัติงาน
            </h1>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              ศูนย์แพทยศาสตรศึกษาชั้นคลินิก โรงพยาบาลบุรีรัมย์ (แยกสิทธิ์ผู้ใช้ User & ผู้จัดการ Admin)
            </p>
          </div>
        </div>

        {/* Live Digital Clock Badge */}
        <div className="bg-emerald-900/90 border border-emerald-700/80 rounded-2xl p-3.5 flex items-center space-x-4 shadow-inner">
          <div className="p-2 bg-emerald-800 rounded-xl text-amber-300">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div className="text-left">
            <div className="text-xl font-black font-mono tracking-wider text-white">
              {currentTime || '--:--:--'}
            </div>
            <div className="text-[11px] text-emerald-200 font-medium">
              {currentDateString || 'กำลังโหลดวันที่...'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Subtabs: User vs Admin vs Diagnostic */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          
          {/* Subtab 1: My Check-in (User View) */}
          <button
            onClick={() => setActiveSubTab('my_checkin')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition ${
              activeSubTab === 'my_checkin'
                ? 'bg-emerald-700 text-white shadow-md font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LogIn className="w-4 h-4 text-emerald-300" />
            <span>1. ลงเวลาเข้างานของฉัน (ผู้ใช้ - User)</span>
            {userActiveRecord && (
              <span className="bg-amber-400 text-emerald-950 text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                On Duty
              </span>
            )}
          </button>

          {/* Subtab 2: All Attendance & Admin Check (Admin View) */}
          <button
            onClick={() => setActiveSubTab('all_records')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition ${
              activeSubTab === 'all_records'
                ? 'bg-amber-600 text-white shadow-md font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-200" />
            <span>2. ตรวจสอบการเข้างานทั้งหมด (ผู้จัดการ - Admin)</span>
            <span className="bg-emerald-950 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {todayRecords.length} คนวันนี้
            </span>
          </button>

          {/* Subtab 3: Role & Access Diagnostic */}
          <button
            onClick={() => setActiveSubTab('role_inspect')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition ${
              activeSubTab === 'role_inspect'
                ? 'bg-slate-900 text-white shadow-md font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>3. ตรวจสอบสิทธิ์และระบบเข้าใช้งาน (User / Admin Audit)</span>
          </button>
        </div>

        {/* Current Active Persona Indicator */}
        <div className="flex items-center space-x-2 px-3 py-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700">
          <span className="text-slate-400">สถานะคุณ:</span>
          {currentUser?.role === 'admin' ? (
            <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300 flex items-center gap-1 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" /> ผู้จัดการ Admin
            </span>
          ) : (
            <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300 flex items-center gap-1 font-bold">
              <User className="w-3.5 h-3.5 text-emerald-700" /> ผู้ใช้ (User)
            </span>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: USER WORK CHECK-IN / CLOCK IN & OUT (ส่วนผู้ใช้) */}
      {/* ========================================================================= */}
      {activeSubTab === 'my_checkin' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Active Status Hero Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Box: Active Duty Card or Ready to Clock in */}
            <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    สถานะการปฏิบัติงานปัจจุบัน
                  </div>
                  {userActiveRecord ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> กำลังปฏิบัติงาน (On Duty)
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      ยังไม่ได้ลงเวลาเข้างาน
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-lg">
                      {currentUser?.displayName ? currentUser.displayName.slice(0, 2) : 'นศ'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{currentUser?.displayName || 'ผู้ใช้งานทั่วไป'}</h3>
                      <p className="text-xs text-slate-500">{currentUser?.department || 'ศูนย์แพทยศาสตรศึกษาชั้นคลินิก'}</p>
                      <p className="text-[11px] text-emerald-700 font-medium">{currentUser?.email}</p>
                    </div>
                  </div>

                  {userActiveRecord ? (
                    <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 space-y-2 mt-4 text-xs text-slate-700">
                      <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>ลงเวลาเข้างานแล้ววันนี้:</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <span className="text-slate-500 block text-[10px]">เวลาเข้างาน:</span>
                          <span className="font-bold text-slate-900 text-sm font-mono">{userActiveRecord.checkInTime} น.</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">กะ/เวร:</span>
                          <span className="font-semibold text-emerald-900 truncate block">{userActiveRecord.shiftName.split('(')[0]}</span>
                        </div>
                      </div>
                      <div className="pt-1 border-t border-emerald-200/60">
                        <span className="text-slate-500 block text-[10px]">สถานที่:</span>
                        <span className="font-medium text-slate-800">{userActiveRecord.location}</span>
                      </div>
                      {userActiveRecord.note && (
                        <div>
                          <span className="text-slate-500 block text-[10px]">ภารกิจ:</span>
                          <span className="text-slate-700 italic">{userActiveRecord.note}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 space-y-1.5 mt-4">
                      <p className="font-bold text-slate-800">💡 พร้อมเริ่มต้นปฏิบัติงาน</p>
                      <p className="leading-relaxed">
                        เลือกกะ/เวร และสถานที่ปฏิบัติงานในฟอร์มด้านขวา จากนั้นกดปุ่ม "บันทึกเวลาเข้างาน" ระบบจะประทับเวลา Real-time ทันที
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-4 border-t border-slate-100">
                {userActiveRecord ? (
                  <button
                    onClick={() => handleUserClockOut(userActiveRecord)}
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center space-x-2 group cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-200 group-hover:-translate-x-0.5 transition-transform" />
                    <span>{isSubmitting ? 'กำลังบันทึก...' : 'ลงเวลาออกงาน (Clock Out)'}</span>
                  </button>
                ) : (
                  <div className="text-center text-[11px] text-slate-400">
                    กรอกข้อมูลด้านขวาแล้วกดบันทึกเข้างาน
                  </div>
                )}
              </div>
            </div>

            {/* Right Box: Clock-in Submission Form */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-700" />
                    ฟอร์มบันทึกเวลาเข้างาน / เข้าเวรคลินิก
                  </h3>
                  <p className="text-xs text-slate-500">สำหรับนักศึกษาแพทย์ บุคลากรทางการแพทย์ และเจ้าหน้าที่</p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                  📅 วันที่ {todayStr}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Field 1: Shift Selection */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">
                    เลือกกะ / เวรปฏิบัติงาน <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedShift}
                    onChange={(e) => setSelectedShift(e.target.value as ShiftType)}
                    disabled={Boolean(userActiveRecord)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    {shiftOptions.map(opt => (
                      <option key={opt.type} value={opt.type}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Field 2: Location Selection */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">
                    สถานที่ปฏิบัติงาน / วอร์ด / แผนก <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    disabled={Boolean(userActiveRecord)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    {hospitalLocations.map((loc, idx) => (
                      <option key={idx} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Field 3: Task Note / Mission */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block font-bold text-slate-700">
                    รายละเอียดภารกิจ / กิจกรรมการเรียนรู้ (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น: เข้าร่วม Morning Report, ราวด์วอร์ดอายุรกรรม, ติว PBL ชั้น 9, เข้าห้องผ่าตัด..."
                    value={taskNote}
                    onChange={(e) => setTaskNote(e.target.value)}
                    disabled={Boolean(userActiveRecord)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>
              </div>

              {/* Submit Clock-in */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleUserClockIn}
                  disabled={Boolean(userActiveRecord) || isSubmitting}
                  className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md ${
                    userActiveRecord
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer active:scale-[0.98]'
                  }`}
                >
                  <LogIn className="w-4 h-4 text-emerald-200" />
                  <span>
                    {userActiveRecord 
                      ? 'ท่านได้ลงเวลาเข้างานของวันนี้แล้ว (หากเสร็จสิ้นกรุณากดลงเวลาออกงาน)' 
                      : isSubmitting ? 'กำลังบันทึกลงระบบ...' : '⚡ ยืนยันบันทึกเวลาเข้างาน (Clock In)'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* User's Own Attendance History */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  ประวัติการลงเวลาเข้างานของฉัน ({myRecords.length} รายการ)
                </h3>
                <p className="text-[11px] text-slate-500">บันทึกเวลาเข้า-ออกงานย้อนหลัง พร้อมสถานะการรับรอง</p>
              </div>
              <button
                onClick={handlePrintReport}
                className="flex items-center space-x-1 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>พิมพ์ประวัติ</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">วันที่</th>
                    <th className="py-3 px-4">กะ / เวร</th>
                    <th className="py-3 px-4">เวลาเข้า</th>
                    <th className="py-3 px-4">เวลาออก</th>
                    <th className="py-3 px-4">ชั่วโมงงาน</th>
                    <th className="py-3 px-4">สถานที่</th>
                    <th className="py-3 px-4">ภารกิจ</th>
                    <th className="py-3 px-4 text-center">สถานะ</th>
                    <th className="py-3 px-4 text-center">การรับรอง (Admin)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {myRecords.length > 0 ? (
                    myRecords.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{r.date}</td>
                        <td className="py-3 px-4">
                          <span className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                            {r.shiftName.split('(')[0]}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-800">{r.checkInTime} น.</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{r.checkOutTime ? `${r.checkOutTime} น.` : '-'}</td>
                        <td className="py-3 px-4 font-mono">{r.workingHours ? `${r.workingHours} ชม.` : '-'}</td>
                        <td className="py-3 px-4 max-w-xs truncate">{r.location}</td>
                        <td className="py-3 px-4 max-w-xs truncate text-slate-500">{r.note || '-'}</td>
                        <td className="py-3 px-4 text-center">
                          {r.status === 'on_duty' && (
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold text-[10px] animate-pulse">
                              กำลังปฏิบัติงาน
                            </span>
                          )}
                          {r.status === 'completed' && (
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                              เสร็จสิ้น
                            </span>
                          )}
                          {r.status === 'late' && (
                            <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                              มาสาย
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {r.verifiedByAdmin ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                              <Check className="w-3 h-3 text-emerald-600" /> รับรองแล้ว
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">รอรับรอง</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                        ยังไม่มีประวัติการลงเวลาเข้างาน
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: ADMIN ATTENDANCE MANAGEMENT & INSPECTION (ส่วนผู้จัดการ Admin) */}
      {/* ========================================================================= */}
      {activeSubTab === 'all_records' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500">ลงเวลาทั้งหมดวันนี้</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{totalCheckedInToday} คน</div>
              <p className="text-[10px] text-slate-400 mt-0.5">วันที่ {todayStr}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-[11px] font-bold text-amber-600">กำลังปฏิบัติงาน (On Duty)</div>
              <div className="text-2xl font-black text-amber-700 mt-1">{onDutyCount} คน</div>
              <p className="text-[10px] text-amber-600/80 mt-0.5">ยังไม่ลงเวลาออก</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-[11px] font-bold text-emerald-600">ลงเวลาออกแล้ว (Completed)</div>
              <div className="text-2xl font-black text-emerald-700 mt-1">{completedCount} คน</div>
              <p className="text-[10px] text-emerald-600/80 mt-0.5">ครบถ้วนสมบูรณ์</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-[11px] font-bold text-teal-600">รับรองโดย Admin แล้ว</div>
              <div className="text-2xl font-black text-teal-700 mt-1">{verifiedCount} รายการ</div>
              <p className="text-[10px] text-teal-600/80 mt-0.5">ตรวจสอบความถูกต้องแล้ว</p>
            </div>
          </div>

          {/* Filters & Control Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Left Filter Controls */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                />
                {dateFilter && (
                  <button onClick={() => setDateFilter('')} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="all">ทุกสถานะ</option>
                <option value="on_duty">กำลังปฏิบัติงาน (On Duty)</option>
                <option value="completed">เสร็จสิ้น (Completed)</option>
                <option value="late">มาสาย (Late)</option>
              </select>

              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="all">ทุกภาควิชา / ชั้นปี</option>
                <option value="ชั้นปีที่ 4">นศพ. ชั้นปีที่ 4</option>
                <option value="ชั้นปีที่ 5">นศพ. ชั้นปีที่ 5</option>
                <option value="ชั้นปีที่ 6">นศพ. ชั้นปีที่ 6 (Extern)</option>
                <option value="สูตินรีเวช">สูตินรีเวชกรรม</option>
                <option value="อายุรกรรม">อายุรกรรม</option>
                <option value="ศัลยกรรม">ศัลยกรรม</option>
                <option value="กุมารเวชกรรม">กุมารเวชกรรม</option>
                <option value="ศูนย์แพทยศาสตรศึกษาชั้นคลินิก">ศูนย์แพทยศาสตร์ (เจ้าหน้าที่)</option>
              </select>
            </div>

            {/* Right Search & Action Buttons */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ, อีเมล, วอร์ด..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {currentUser?.role === 'admin' ? (
                <>
                  <button
                    onClick={handleOpenAddModal}
                    className="flex items-center space-x-1 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>บันทึกแทน</span>
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </button>
                </>
              ) : (
                <span className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 font-medium">
                  สิทธิ์อ่านอย่างเดียว (สลับเป็น Admin เพื่อแก้ไข/รับรอง)
                </span>
              )}
            </div>

          </div>

          {/* Master Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">วันที่</th>
                    <th className="py-3 px-4">บุคลากร / นักศึกษา</th>
                    <th className="py-3 px-4">หน่วยงาน / ภาควิชา</th>
                    <th className="py-3 px-4">กะ / เวร</th>
                    <th className="py-3 px-4">เวลาเข้า</th>
                    <th className="py-3 px-4">เวลาออก</th>
                    <th className="py-3 px-4">สถานที่ปฏิบัติงาน</th>
                    <th className="py-3 px-4 text-center">สถานะ</th>
                    <th className="py-3 px-4 text-center">การรับรอง</th>
                    {currentUser?.role === 'admin' && (
                      <th className="py-3 px-4 text-center">จัดการ</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">{r.date}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{r.userName}</div>
                          <div className="text-[10px] text-slate-400">{r.userEmail}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div>{r.department}</div>
                          {r.academicYear && <div className="text-[10px] text-emerald-700 font-semibold">{r.academicYear}</div>}
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold border border-slate-200">
                            {r.shiftName.split('(')[0]}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700">{r.checkInTime} น.</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{r.checkOutTime ? `${r.checkOutTime} น.` : '-'}</td>
                        <td className="py-3 px-4 max-w-xs truncate">{r.location}</td>
                        <td className="py-3 px-4 text-center">
                          {r.status === 'on_duty' && (
                            <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-bold text-[10px]">
                              กำลังปฏิบัติงาน
                            </span>
                          )}
                          {r.status === 'completed' && (
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold text-[10px]">
                              เสร็จสิ้น
                            </span>
                          )}
                          {r.status === 'late' && (
                            <span className="bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded-full font-bold text-[10px]">
                              มาสาย
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {currentUser?.role === 'admin' ? (
                            <button
                              onClick={() => handleAdminVerify(r.id, Boolean(r.verifiedByAdmin))}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition flex items-center justify-center gap-1 mx-auto ${
                                r.verifiedByAdmin
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-rose-100 hover:text-rose-800 border border-emerald-300'
                                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-800 border border-slate-300'
                              }`}
                              title={r.verifiedByAdmin ? 'คลิกเพื่อยกเลิกการรับรอง' : 'คลิกเพื่อรับรองความถูกต้อง'}
                            >
                              <Check className="w-3 h-3" />
                              <span>{r.verifiedByAdmin ? 'รับรองแล้ว' : 'กดรับรอง'}</span>
                            </button>
                          ) : (
                            <span className={`text-[10px] font-bold ${r.verifiedByAdmin ? 'text-emerald-700' : 'text-slate-400'}`}>
                              {r.verifiedByAdmin ? 'รับรองแล้ว' : 'รอรับรอง'}
                            </span>
                          )}
                        </td>

                        {currentUser?.role === 'admin' && (
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                onClick={() => handleOpenEditModal(r)}
                                className="p-1 text-slate-600 hover:text-sky-600 hover:bg-slate-100 rounded transition"
                                title="แก้ไขบันทึก"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(r.id)}
                                className="p-1 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                                title="ลบบันทึก"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={currentUser?.role === 'admin' ? 10 : 9} className="py-8 text-center text-slate-400 text-xs">
                        ไม่พบข้อมูลการลงเวลาเข้างานตามเงื่อนไขที่เลือก
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: ROLE & ACCESS AUDIT / DIAGNOSTIC (ตรวจสอบ User vs Admin) */}
      {/* ========================================================================= */}
      {activeSubTab === 'role_inspect' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Overview Diagnostic Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="p-2.5 bg-amber-50 rounded-2xl text-amber-600 border border-amber-200">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  ผลการตรวจสอบระบบเข้าใช้งาน (Login & Permissions Audit)
                </h3>
                <p className="text-xs text-slate-500">
                  ตรวจสอบความถูกต้องของการแยกสิทธิ์การใช้งานระหว่าง 1. ผู้ใช้ (User) และ 2. ผู้จัดการ (Admin)
                </p>
              </div>
            </div>

            {/* Current Session Diagnostic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  ข้อมูลเซสชันผู้ใช้งานปัจจุบัน (Current Active Session)
                </div>
                <div className="pt-1 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">ชื่อที่แสดง:</span>
                    <span className="font-bold text-slate-800">{currentUser?.displayName || 'ไม่ได้เข้าสู่ระบบ'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">อีเมล Gmail:</span>
                    <span className="font-mono text-emerald-800">{currentUser?.email || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">สิทธิ์ปัจจุบัน (Role):</span>
                    <span className={`font-bold px-2 py-0.2 rounded ${
                      currentUser?.role === 'admin' 
                        ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}>
                      {currentUser?.role === 'admin' ? '2. ผู้จัดการ Admin' : '1. ผู้ใช้ (User)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">สังกัด / ภาควิชา:</span>
                    <span className="text-slate-700">{currentUser?.department || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ฐานข้อมูล Firestore Sync:</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> เชื่อมต่อเรียบร้อย
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Role Switcher Tester */}
              <div className="bg-emerald-950 text-white p-4 rounded-2xl border border-emerald-900 space-y-3 text-xs flex flex-col justify-between">
                <div>
                  <div className="font-bold text-emerald-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>ทดสอบสลับสิทธิ์เข้าใช้งานทันที (Live Role Switcher)</span>
                  </div>
                  <p className="text-[11px] text-emerald-200/80 mt-1">
                    คลิกเลือกเพื่อทดสอบมุมมองของแต่ละบทบาทในระบบ
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => {
                      if (onSelectRole) onSelectRole('user');
                      showToast('สลับเข้าสู่ระบบ: 1. ผู้ใช้ (User)');
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      currentUser?.role === 'user'
                        ? 'bg-emerald-600 text-white font-bold border-emerald-400 shadow-md'
                        : 'bg-emerald-900/60 text-emerald-200 border-emerald-800 hover:bg-emerald-800'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> 1. ผู้ใช้ (User)
                    </div>
                    <div className="text-[10px] text-emerald-100/70 mt-1">
                      ลงเวลาเข้างาน, ยื่นจองห้อง, ดูค่าไฟ
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      if (onSelectRole) onSelectRole('admin');
                      showToast('สลับเข้าสู่ระบบ: 2. ผู้จัดการ Admin');
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      currentUser?.role === 'admin'
                        ? 'bg-amber-600 text-white font-bold border-amber-400 shadow-md'
                        : 'bg-emerald-900/60 text-emerald-200 border-emerald-800 hover:bg-emerald-800'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-200" /> 2. ผู้จัดการ Admin
                    </div>
                    <div className="text-[10px] text-emerald-100/70 mt-1">
                      อนุมัติจอง, ตรวจสอบเข้างาน, ส่งออก CSV
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Matrix comparison table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="bg-slate-100 p-3 font-bold text-xs text-slate-800 border-b border-slate-200">
                ตารางเปรียบเทียบสิทธิ์การใช้งาน (Permissions Matrix)
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">ฟังก์ชัน / ความสามารถในระบบ</th>
                    <th className="py-2.5 px-4 text-center">1. ผู้ใช้ (User)</th>
                    <th className="py-2.5 px-4 text-center">2. ผู้จัดการ Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-2.5 px-4 font-medium">บันทึกเวลาเข้างาน / ออกงาน (Clock In / Out) ของตนเอง</td>
                    <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ ใช้งานได้</td>
                    <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ ใช้งานได้</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium">ดูประวัติการเข้างานและชั่วโมงปฏิบัติงานของตนเอง</td>
                    <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ ใช้งานได้</td>
                    <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ ใช้งานได้</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium">ตรวจสอบการลงเวลาเข้างานของบุคลากร/นศพ. ทุกคนในศูนย์</td>
                    <td className="py-2.5 px-4 text-center text-slate-400">✗ ไม่อนุญาต</td>
                    <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ ใช้งานได้</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium">รับรอง/ยืนยันเวลาเข้างาน (Verify Attendance)</td>
                    <td className="py-2.5 px-4 text-center text-slate-400">✗ ไม่อนุญาต</td>
                    <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ ใช้งานได้</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium">แก้ไข/ลบ/บันทึกเวลาเข้างานแทนบุคลากรอื่น</td>
                    <td className="py-2.5 px-4 text-center text-slate-400">✗ ไม่อนุญาต</td>
                    <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ ใช้งานได้</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium">ดาวน์โหลดรายงานการเข้างานเป็นไฟล์ CSV / Excel</td>
                    <td className="py-2.5 px-4 text-center text-slate-400">✗ ไม่อนุญาต</td>
                    <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ ใช้งานได้</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium">อนุมัติ / ปฏิเสธคำขอจองห้องเรียน และแก้ไขห้องเรียน</td>
                    <td className="py-2.5 px-4 text-center text-slate-400">✗ ไม่อนุญาต</td>
                    <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ ใช้งานได้</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADMIN ADD / EDIT ATTENDANCE RECORD */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-300">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {editingRecord ? 'แก้ไขข้อมูลบันทึกเวลาเข้างาน' : 'เพิ่มบันทึกเวลาเข้างาน (บันทึกแทนโดย Admin)'}
                  </h3>
                  <p className="text-[11px] text-emerald-200/80">ศูนย์แพทยศาสตรศึกษาชั้นคลินิก โรงพยาบาลบุรีรัมย์</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">ชื่อ-นามสกุล บุคลากร / นศพ. *</label>
                  <input
                    type="text"
                    required
                    value={modalForm.userName || ''}
                    onChange={(e) => setModalForm(prev => ({ ...prev, userName: e.target.value }))}
                    placeholder="เช่น: นศพ. ธนกฤต มั่นคง"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">อีเมล Gmail *</label>
                  <input
                    type="email"
                    required
                    value={modalForm.userEmail || ''}
                    onChange={(e) => setModalForm(prev => ({ ...prev, userEmail: e.target.value }))}
                    placeholder="buriram.mec@cpird.in.th"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">ภาควิชา / สังกัด / ชั้นปี *</label>
                  <input
                    type="text"
                    required
                    value={modalForm.department || ''}
                    onChange={(e) => setModalForm(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="เช่น: ชั้นปีที่ 5 (กลุ่มสูตินรีเวช)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">วันที่ (YYYY-MM-DD) *</label>
                  <input
                    type="date"
                    required
                    value={modalForm.date || todayStr}
                    onChange={(e) => setModalForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">กะ / เวรปฏิบัติงาน *</label>
                  <select
                    value={modalForm.shiftType || 'morning'}
                    onChange={(e) => {
                      const shift = e.target.value as ShiftType;
                      const shiftObj = shiftOptions.find(s => s.type === shift);
                      setModalForm(prev => ({
                        ...prev,
                        shiftType: shift,
                        shiftName: shiftObj?.name || 'เวรเช้า'
                      }));
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  >
                    {shiftOptions.map(s => (
                      <option key={s.type} value={s.type}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">สถานที่ปฏิบัติงาน *</label>
                  <input
                    type="text"
                    required
                    value={modalForm.location || ''}
                    onChange={(e) => setModalForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="เช่น: อาคารศูนย์แพทยศาสตรศึกษาชั้นคลินิก ชั้น 9"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">เวลาเข้างาน (HH:mm) *</label>
                  <input
                    type="time"
                    required
                    value={modalForm.checkInTime || '08:00'}
                    onChange={(e) => setModalForm(prev => ({ ...prev, checkInTime: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">เวลาออกงาน (HH:mm)</label>
                  <input
                    type="time"
                    value={modalForm.checkOutTime || ''}
                    onChange={(e) => setModalForm(prev => ({ ...prev, checkOutTime: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">สถานะ *</label>
                  <select
                    value={modalForm.status || 'completed'}
                    onChange={(e) => setModalForm(prev => ({ ...prev, status: e.target.value as AttendanceStatus }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="on_duty">กำลังปฏิบัติงาน (On Duty)</option>
                    <option value="completed">เสร็จสิ้น (Completed)</option>
                    <option value="late">มาสาย (Late)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">ชั่วโมงงานรวม (ชั่วโมง)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={modalForm.workingHours || 8.0}
                    onChange={(e) => setModalForm(prev => ({ ...prev, workingHours: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700">บันทึกภารกิจ / หมายเหตุ</label>
                  <input
                    type="text"
                    value={modalForm.note || ''}
                    onChange={(e) => setModalForm(prev => ({ ...prev, note: e.target.value }))}
                    placeholder="เช่น: เข้าร่วม Morning report, ราวด์วอร์ด..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700">บันทึกของ Admin</label>
                  <input
                    type="text"
                    value={modalForm.adminNote || ''}
                    onChange={(e) => setModalForm(prev => ({ ...prev, adminNote: e.target.value }))}
                    placeholder="เช่น: ตรวจสอบใบลงเวลาแล้ว..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2 pt-1 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="verifiedByAdminCheckbox"
                    checked={Boolean(modalForm.verifiedByAdmin)}
                    onChange={(e) => setModalForm(prev => ({ ...prev, verifiedByAdmin: e.target.checked }))}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <label htmlFor="verifiedByAdminCheckbox" className="font-bold text-slate-700 cursor-pointer">
                    รับรองความถูกต้องของรายการนี้โดยผู้ดูแลระบบ (Verified by Admin)
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">ยืนยันการลบรายการ</h3>
              <p className="text-xs text-slate-500 mt-1">
                คุณแน่ใจหรือไม่ว่าต้องการลบรายการลงเวลานี้ออกจากระบบ?
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleDeleteRecord(deleteConfirmId)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md transition"
              >
                ยืนยันลบ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
