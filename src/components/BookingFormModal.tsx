import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  Phone, 
  FileText, 
  Building2, 
  AlertTriangle,
  CheckCircle2,
  Tv,
  Mic,
  Video,
  Stethoscope
} from 'lucide-react';
import { Room, Booking, UserProfile } from '../types';
import { DEPARTMENTS } from '../data/mockData';

interface BookingFormProps {
  rooms: Room[];
  selectedRoom: Room | null;
  existingBookings: Booking[];
  currentUser: UserProfile | null;
  onSubmitBooking: (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

export const BookingFormModal: React.FC<BookingFormProps> = ({
  rooms,
  selectedRoom,
  existingBookings,
  currentUser,
  onSubmitBooking,
  onClose
}) => {
  const [roomId, setRoomId] = useState<string>(selectedRoom?.id || rooms[0]?.id || '');
  const [title, setTitle] = useState('');
  const [purpose, setPurpose] = useState('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');
  const [attendeesCount, setAttendeesCount] = useState<number>(20);
  const [department, setDepartment] = useState(currentUser?.department || DEPARTMENTS[0]);
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '081-123-4567');
  const [requestedEquipment, setRequestedEquipment] = useState<string[]>(['โพรเจกเตอร์', 'เครื่องปรับอากาศ']);

  const activeRoom = rooms.find(r => r.id === roomId) || rooms[0];

  // Conflict Check Logic
  const hasConflict = existingBookings.some(b => {
    if (b.status === 'rejected' || b.status === 'cancelled') return false;
    if (b.roomId !== roomId) return false;
    if (b.date !== date) return false;

    const bStart = b.startTime;
    const bEnd = b.endTime;

    // Time overlap condition: (start1 < end2) && (end1 > start2)
    return (startTime < bEnd) && (endTime > bStart);
  });

  const timeSlots = [
    { label: 'ช่วงเช้า (08:00 - 12:00)', start: '08:00', end: '12:00' },
    { label: 'ช่วงบ่าย (13:00 - 16:00)', start: '13:00', end: '16:00' },
    { label: 'ช่วงเย็น/หลังเลิกงาน (16:00 - 20:00)', start: '16:00', end: '20:00' },
    { label: 'เต็มวัน (08:00 - 16:00)', start: '08:00', end: '16:00' },
  ];

  const handleEquipmentToggle = (item: string) => {
    if (requestedEquipment.includes(item)) {
      setRequestedEquipment(requestedEquipment.filter(i => i !== item));
    } else {
      setRequestedEquipment([...requestedEquipment, item]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('กรุณากรอกหัวข้อกิจกรรม/การเรียนการสอน');
      return;
    }
    if (hasConflict) {
      alert('ห้องนี้มีการจองซ้อนทับในช่วงเวลาดังกล่าวแล้ว กรุณาเลือกเวลาหรือห้องอื่น');
      return;
    }

    onSubmitBooking({
      roomId: activeRoom.id,
      roomName: activeRoom.name,
      userId: currentUser?.uid || 'guest-user',
      userName: currentUser?.displayName || 'ผู้ใช้งานระบบ',
      userEmail: currentUser?.email || 'user@cpird.in.th',
      userRole: currentUser?.role || 'student',
      department,
      academicYear: currentUser?.academicYear || department,
      title,
      purpose: purpose || title,
      date,
      startTime,
      endTime,
      attendeesCount,
      requestedEquipment,
      contactPhone,
      status: 'pending'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-emerald-950 px-6 py-4 text-white flex items-center justify-between border-b border-emerald-900">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-700 rounded-xl">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">ยื่นคำขอจองห้องเรียน / ห้องปฏิบัติการ</h2>
              <p className="text-xs text-emerald-200/80">ศูนย์แพทยศาสตรศึกษาชั้นคลินิก โรงพยาบาลบุรีรัมย์</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-900 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-slate-800">
          {/* Room Selection Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Building2 className="w-4 h-4 text-emerald-700" />
              เลือกร้องเรียน/ปฏิบัติการ *
            </label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
            >
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.code}) — ความจุ {r.capacity} คน
                </option>
              ))}
            </select>
          </div>

          {/* Activity Title & Purpose */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <FileText className="w-4 h-4 text-emerald-700" />
                หัวข้อกิจกรรม/การเรียนการสอน *
              </label>
              <input
                type="text"
                required
                placeholder="เช่น ติว OSCE อายุรศาสตร์, PBL Group 2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                ภาควิชา / ชั้นปีผู้จอง *
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {DEPARTMENTS.map(dep => (
                  <option key={dep} value={dep}>{dep}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Quick Time Slots */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  วันที่ต้องการใช้งาน *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Users className="w-4 h-4 text-emerald-700" />
                  จำนวนผู้เข้าร่วม (คน) *
                </label>
                <input
                  type="number"
                  min={1}
                  max={activeRoom.capacity}
                  value={attendeesCount}
                  onChange={(e) => setAttendeesCount(Number(e.target.value))}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Quick Time Presets */}
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                เลือกช่วงเวลาด่วน:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {timeSlots.map(slot => (
                  <button
                    key={slot.label}
                    type="button"
                    onClick={() => {
                      setStartTime(slot.start);
                      setEndTime(slot.end);
                    }}
                    className={`p-2 rounded-xl text-xs text-left border transition ${
                      startTime === slot.start && endTime === slot.end
                        ? 'bg-emerald-700 text-white border-emerald-700 font-bold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-medium truncate">{slot.label.split(' ')[0]}</div>
                    <div className="text-[11px] opacity-80">{slot.start} - {slot.end}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Hours */}
            <div className="flex items-center space-x-3 pt-2">
              <div className="flex-1 space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">เวลาเริ่ม:</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
                />
              </div>
              <span className="text-slate-400 font-bold self-end pb-1.5">ถึง</span>
              <div className="flex-1 space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">เวลาสิ้นสุด:</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Time Conflict Warning Banner */}
          {hasConflict ? (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-start space-x-3 text-rose-800">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold">คำเตือน: มีการจองซ้อนทับ!</div>
                <div>ห้อง {activeRoom.name} มีรายการจองในช่วงเวลา {startTime} - {endTime} น. วันที่ {date} แล้ว กรุณาเปลี่ยนเวลาหรือเปลี่ยนห้อง</div>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center space-x-2 text-emerald-900 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>ห้องว่างสำหรับช่วงเวลานี้ พร้อมส่งคำขออนุมัติ</span>
            </div>
          )}

          {/* Equipment Checkboxes */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">
              อุปกรณ์เพิ่มเติมที่ขอใช้งาน:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {['โปรเจกเตอร์', 'ไมโครโฟนไร้สาย', 'ระบบ Hybrid Zoom', 'หุ่นฝึกซ้อมหัตถการ', 'เครื่องปรับอากาศ', 'กระดาน Smart Board'].map(item => (
                <label
                  key={item}
                  className={`flex items-center space-x-2 p-2 rounded-xl border cursor-pointer transition ${
                    requestedEquipment.includes(item)
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={requestedEquipment.includes(item)}
                    onChange={() => handleEquipmentToggle(item)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Contact Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Phone className="w-4 h-4 text-emerald-700" />
              เบอร์โทรศัพท์ติดต่อกลับ *
            </label>
            <input
              type="tel"
              required
              placeholder="081-XXX-XXXX"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={hasConflict}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-md transition active:scale-95 flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ยืนยันส่งคำขอจองห้อง</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
