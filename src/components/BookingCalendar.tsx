import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Building2, 
  CheckCircle2, 
  Clock3, 
  XCircle, 
  AlertCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
  Phone
} from 'lucide-react';
import { Booking, Room, UserProfile } from '../types';

interface BookingCalendarProps {
  bookings: Booking[];
  rooms: Room[];
  currentUser: UserProfile | null;
  onCancelBooking: (bookingId: string) => void;
  onOpenNewBooking: (room?: Room) => void;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  bookings,
  rooms,
  currentUser,
  onCancelBooking,
  onOpenNewBooking
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Filter bookings
  const filteredBookings = bookings.filter(b => {
    const matchesRoom = selectedRoomFilter === 'all' || b.roomId === selectedRoomFilter;
    const matchesStatus = selectedStatusFilter === 'all' || b.status === selectedStatusFilter;
    const matchesDate = !selectedDate || b.date === selectedDate;
    return matchesRoom && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300/80">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>อนุมัติแล้ว</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300/80">
            <Clock3 className="w-3.5 h-3.5 text-amber-600" />
            <span>รอการอนุมัติ</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300/80">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>ไม่อนุมัติ</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-300/80">
            <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>ยกเลิกแล้ว</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header & Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">ตารางการจองห้องเรียนและห้องปฏิบัติการ</h2>
              <p className="text-xs text-slate-500">ตรวจสอบสถานะห้องว่างและรายการจองล่วงหน้า</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onOpenNewBooking()}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition active:scale-95"
            >
              + ขอจองห้องใหม่
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          {/* Select Date */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">เลือกวันที่:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
            />
          </div>

          {/* Room Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">เลือกห้อง:</label>
            <select
              value={selectedRoomFilter}
              onChange={(e) => setSelectedRoomFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="all">ทุกห้องเรียน/ปฏิบัติการ</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">สถานะคำขอ:</label>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="approved">อนุมัติแล้ว</option>
              <option value="pending">รอการอนุมัติ</option>
              <option value="rejected">ไม่อนุมัติ</option>
              <option value="cancelled">ยกเลิกแล้ว</option>
            </select>
          </div>
        </div>
      </div>

      {/* Booking List Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            รายการจองวันที่ {selectedDate ? new Date(selectedDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : 'ทั้งหมด'} ({filteredBookings.length} รายการ)
          </span>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="text-xs text-emerald-700 hover:underline font-medium"
            >
              แสดงรายการทั้งหมดทุกวัน
            </button>
          )}
        </div>

        {filteredBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm hover:shadow transition space-y-3 flex flex-col justify-between"
              >
                <div>
                  {/* Status & Room Badge */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 truncate">
                      {b.roomName}
                    </span>
                    {getStatusBadge(b.status)}
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-slate-800 leading-snug">
                    {b.title}
                  </h3>

                  {/* Purpose */}
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    วัตถุประสงค์: {b.purpose}
                  </p>

                  {/* Meta details */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center space-x-2 font-medium text-slate-800">
                      <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>{b.date} | เวลา {b.startTime} - {b.endTime} น.</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>ผู้จอง: <strong className="text-slate-800">{b.userName}</strong> ({b.department})</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>โทร: {b.contactPhone} | ผู้เข้าร่วม {b.attendeesCount} คน</span>
                    </div>

                    {b.requestedEquipment && b.requestedEquipment.length > 0 && (
                      <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                        อุปกรณ์เพิ่มเติม: {b.requestedEquipment.join(', ')}
                      </div>
                    )}

                    {b.adminNote && (
                      <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-2">
                        <strong>หมายเหตุจากเจ้าหน้าที่:</strong> {b.adminNote}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action (Cancel if user's booking or admin) */}
                {b.status !== 'cancelled' && b.status !== 'rejected' && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                    {(currentUser?.uid === b.userId || currentUser?.role === 'admin') && (
                      <button
                        onClick={() => {
                          if (confirm(`คุณต้องการยกเลิกการจอง "${b.title}" ใช่หรือไม่?`)) {
                            onCancelBooking(b.id);
                          }
                        }}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 transition"
                      >
                        ยกเลิกรายการจองนี้
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">ไม่มีรายการจองในช่วงเวลานี้</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              ห้องพักและห้องเรียนเปิดว่างสำหรับช่วงเวลาดังกล่าว สามารถคลิกปุ่มขอจองห้องเพื่อยื่นคำขอจองได้ทันที
            </p>
            <button
              onClick={() => onOpenNewBooking()}
              className="mt-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl shadow transition"
            >
              + ขอจองห้องเลย
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
