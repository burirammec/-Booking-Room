/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { RoomList } from './components/RoomList';
import { BookingCalendar } from './components/BookingCalendar';
import { BookingFormModal } from './components/BookingFormModal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AdminManagement } from './components/AdminManagement';
import { ElectricityManagement } from './components/ElectricityManagement';
import { AttendanceManagement } from './components/AttendanceManagement';
import { LoginModal } from './components/LoginModal';
import { RegisterModal } from './components/RegisterModal';
import { INITIAL_ROOMS, INITIAL_BOOKINGS } from './data/mockData';
import { INITIAL_ELECTRICITY_ROOMS, INITIAL_ELECTRICITY_BILLS } from './data/mockElectricityData';
import { INITIAL_ATTENDANCE } from './data/mockAttendanceData';
import { Booking, Room, UserProfile, UserRole, ElectricityRoom, ElectricityBill, AttendanceRecord } from './types';
import { auth, loginWithGoogle, logoutUser, onAuthStateChanged } from './firebase';
import { 
  syncInitialDataToFirestore, 
  subscribeToBookings, 
  subscribeToRooms, 
  addBookingToFirestore, 
  updateBookingInFirestore,
  updateBookingStatusInFirestore,
  deleteBookingFromFirestore,
  addRoomToFirestore,
  updateRoomInFirestore,
  deleteRoomFromFirestore
} from './services/bookingService';
import {
  syncElectricityDataToFirestore,
  subscribeToElectricityRooms,
  subscribeToElectricityBills,
  addElectricityBillToFirestore,
  updateElectricityBillInFirestore,
  deleteElectricityBillFromFirestore,
  addElectricityRoomToFirestore,
  updateElectricityRoomInFirestore,
  deleteElectricityRoomFromFirestore
} from './services/electricityService';
import {
  syncInitialAttendanceToFirestore,
  subscribeToAttendance,
  addAttendanceToFirestore,
  updateAttendanceInFirestore,
  deleteAttendanceFromFirestore
} from './services/attendanceService';
import {
  syncInitialUsersToFirestore,
  subscribeToUsers,
  addUserToFirestore,
  updateUserInFirestore,
  deleteUserFromFirestore,
  registerUserInFirestore
} from './services/userService';

import { INITIAL_USERS } from './data/mockUserData';
import { Building2, Phone, Mail, GraduationCap, CheckCircle, AlertTriangle, Clock, UserPlus } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('analytics');
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [electricityRooms, setElectricityRooms] = useState<ElectricityRoom[]>(INITIAL_ELECTRICITY_ROOMS);
  const [electricityBills, setElectricityBills] = useState<ElectricityBill[]>(INITIAL_ELECTRICITY_BILLS);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [selectedRoomToBook, setSelectedRoomToBook] = useState<Room | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // User state - 2 systems: 'user' (คนใช้) and 'admin' (ผู้จัดการ admin)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>({
    uid: 'demo-user-01',
    displayName: 'นศพ. ธนกฤต มั่นคง',
    email: 'buriram.mec@cpird.in.th',
    role: 'user',
    department: 'ผู้ใช้งานทั่วไป (นศพ. ชั้นปีที่ 5)',
    academicYear: 'ชั้นปีที่ 5',
    phone: '081-234-5678'
  });

  // Sync initial seed data and subscribe to Firestore live updates
  useEffect(() => {
    syncInitialDataToFirestore();
    syncElectricityDataToFirestore();
    syncInitialUsersToFirestore();
    syncInitialAttendanceToFirestore();

    const unsubscribeBookings = subscribeToBookings((data) => {
      setBookings(data);
    });
    const unsubscribeRooms = subscribeToRooms((data) => {
      setRooms(data);
    });

    const unsubscribeUsers = subscribeToUsers((data) => {
      setUsers(data);
    });

    const unsubscribeElecRooms = subscribeToElectricityRooms((data) => {
      setElectricityRooms(data);
    });
    const unsubscribeElecBills = subscribeToElectricityBills((data) => {
      setElectricityBills(data);
    });
    const unsubscribeAttendance = subscribeToAttendance((data) => {
      setAttendanceRecords(data);
    });

    return () => {
      unsubscribeBookings();
      unsubscribeRooms();
      unsubscribeUsers();
      unsubscribeElecRooms();
      unsubscribeElecBills();
      unsubscribeAttendance();
    };
  }, []);


  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(prev => ({
          uid: user.uid,
          displayName: user.displayName || 'ผู้ใช้งาน Gmail',
          email: user.email || 'buriram.mec@cpird.in.th',
          photoURL: user.photoURL || undefined,
          role: prev?.role || 'user',
          department: prev?.role === 'admin' ? 'ศูนย์แพทยศาสตรศึกษาชั้นคลินิก' : 'ผู้ใช้งานทั่วไป (Gmail User)',
          academicYear: prev?.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'ผู้ใช้งานทั่วไป',
          phone: prev?.phone || '081-123-4567'
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleLoginGoogle = async (targetRole?: UserRole) => {
    try {
      const user = await loginWithGoogle();
      if (user) {
        const assignedRole = targetRole || 'user';
        setCurrentUser({
          uid: user.uid,
          displayName: user.displayName || 'ผู้ใช้งานระบบ',
          email: user.email || 'buriram.mec@cpird.in.th',
          photoURL: user.photoURL || undefined,
          role: assignedRole,
          department: assignedRole === 'admin' ? 'ศูนย์แพทยศาสตรศึกษาชั้นคลินิก' : 'ผู้ใช้งานทั่วไป (Gmail User)',
          academicYear: assignedRole === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'ผู้ใช้งานระบบ',
          phone: '081-123-4567'
        });
        showToast(`เข้าสู่ระบบสำเร็จด้วย Gmail: ${user.displayName || user.email} (${assignedRole === 'admin' ? 'สิทธิ์ผู้จัดการ Admin' : 'สิทธิ์คนใช้ User'})`);
      }
    } catch (err) {
      console.warn('Fallback login initialized:', err);
      const assignedRole = targetRole || 'user';
      setCurrentUser({
        uid: `usr-gmail-${Date.now().toString().slice(-4)}`,
        displayName: 'ผู้ใช้งาน Gmail (Demo)',
        email: 'buriram.mec@cpird.in.th',
        role: assignedRole,
        department: assignedRole === 'admin' ? 'ผู้ดูแลระบบ (Admin ผู้จัดการ)' : 'ผู้ใช้งานทั่วไป (User)',
        academicYear: assignedRole === 'admin' ? 'เจ้าหน้าที่ Admin' : 'นักศึกษาแพทย์/บุคลากร',
        phone: '081-234-5678'
      });
      showToast(`เข้าสู่ระบบสิทธิ์ ${assignedRole === 'admin' ? '2. ผู้จัดการ Admin' : '1. คนใช้ (User)'} เรียบร้อยแล้ว`, 'info');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // fallback
    }
    setCurrentUser(null);
    showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
  };

  const handleRoleChange = (role: UserRole) => {
    if (role === 'admin') {
      setCurrentUser({
        uid: 'usr-admin-01',
        displayName: 'เจ้าหน้าที่ศูนย์แพทยศาสตร์ (Admin)',
        email: 'buriram.mec@cpird.in.th',
        role: 'admin',
        department: 'ศูนย์แพทยศาสตรศึกษาชั้นคลินิก',
        academicYear: 'ผู้ดูแลระบบ (Admin)',
        phone: '044-602-000'
      });
      showToast('สลับเข้าสู่ระบบ: 2. ระบบผู้จัดการ (Admin)');
    } else {
      setCurrentUser({
        uid: 'usr-user-01',
        displayName: 'นศพ. ธนกฤต มั่นคง',
        email: 'buriram.mec@cpird.in.th',
        role: 'user',
        department: 'ผู้ใช้งานทั่วไป (นศพ. ชั้นปีที่ 5)',
        academicYear: 'ชั้นปีที่ 5',
        phone: '081-234-5678'
      });
      showToast('สลับเข้าสู่ระบบ: 1. คนใช้ (User)');
    }
  };

  const handleOpenNewBooking = (room?: Room) => {
    setSelectedRoomToBook(room || null);
    setIsBookingModalOpen(true);
  };

  const handleCreateBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBooking: Booking = {
      ...bookingData,
      id: `book-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Optimistic UI update
    setBookings(prev => [newBooking, ...prev]);
    setIsBookingModalOpen(false);
    showToast(`ส่งคำขอจองห้อง "${newBooking.roomName}" เรียบร้อยแล้ว (บันทึกลง Firebase Firestore)`);
    setActiveTab('calendar');

    // Firestore async persist
    await addBookingToFirestore(newBooking);
  };

  const handleCancelBooking = async (bookingId: string) => {
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    );
    showToast('ยกเลิกรายการจองเรียบร้อยแล้ว', 'info');
    await updateBookingStatusInFirestore(bookingId, 'cancelled');
  };

  const handleUpdateStatus = async (bookingId: string, status: 'approved' | 'rejected', note?: string) => {
    const defaultNote = note || (status === 'approved' ? 'อนุมัติเรียบร้อย' : 'ไม่อนุมัติ');
    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? { ...b, status, adminNote: defaultNote }
          : b
      )
    );
    showToast(status === 'approved' ? 'อนุมัติคำขอจองห้องเรียบร้อย' : 'ปฏิเสธคำขอจองห้องเรียบร้อย');
    await updateBookingStatusInFirestore(bookingId, status, defaultNote);
  };

  // Admin Room CRUD
  const handleAddRoom = async (newRoom: Room) => {
    setRooms(prev => [...prev, newRoom]);
    showToast(`เพิ่มห้อง "${newRoom.name}" สำเร็จ (บันทึกลง Firestore)`);
    await addRoomToFirestore(newRoom);
  };

  const handleUpdateRoom = async (roomId: string, roomData: Partial<Room>) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, ...roomData } : r));
    showToast(`อัปเดตข้อมูลห้องเรียบร้อยแล้ว`);
    await updateRoomInFirestore(roomId, roomData);
  };

  const handleDeleteRoom = async (roomId: string) => {
    setRooms(prev => prev.filter(r => r.id !== roomId));
    showToast(`ลบข้อมูลห้องเรียนเรียบร้อยแล้ว`, 'info');
    await deleteRoomFromFirestore(roomId);
  };

  // Admin Booking CRUD
  const handleAddBooking = async (newBooking: Booking) => {
    setBookings(prev => [newBooking, ...prev]);
    showToast(`เพิ่มรายการจองห้อง "${newBooking.roomName}" สำเร็จ`);
    await addBookingToFirestore(newBooking);
  };

  const handleUpdateBooking = async (bookingId: string, bookingData: Partial<Booking>) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...bookingData } : b));
    showToast(`อัปเดตข้อมูลการจองเรียบร้อยแล้ว`);
    await updateBookingInFirestore(bookingId, bookingData);
  };

  const handleDeleteBooking = async (bookingId: string) => {
    setBookings(prev => prev.filter(b => b.id !== bookingId));
    showToast(`ลบรายการจองออกจากระบบเรียบร้อยแล้ว`, 'info');
    await deleteBookingFromFirestore(bookingId);
  };

  // Electricity Handlers
  const handleAddElectricityBill = async (bill: ElectricityBill) => {
    setElectricityBills(prev => [bill, ...prev]);
    await addElectricityBillToFirestore(bill);
  };

  const handleUpdateElectricityBill = async (billId: string, data: Partial<ElectricityBill>) => {
    setElectricityBills(prev => prev.map(b => b.id === billId ? { ...b, ...data } : b));
    await updateElectricityBillInFirestore(billId, data);
  };

  const handleDeleteElectricityBill = async (billId: string) => {
    setElectricityBills(prev => prev.filter(b => b.id !== billId));
    showToast('ลบรายการใบแจ้งหนี้ค่าไฟฟ้าเรียบร้อยแล้ว', 'info');
    await deleteElectricityBillFromFirestore(billId);
  };

  const handleAddElectricityRoom = async (room: ElectricityRoom) => {
    setElectricityRooms(prev => [...prev, room]);
    await addElectricityRoomToFirestore(room);
  };

  const handleUpdateElectricityRoom = async (roomId: string, data: Partial<ElectricityRoom>) => {
    setElectricityRooms(prev => prev.map(r => r.id === roomId ? { ...r, ...data } : r));
    await updateElectricityRoomInFirestore(roomId, data);
  };

  const handleDeleteElectricityRoom = async (roomId: string) => {
    setElectricityRooms(prev => prev.filter(r => r.id !== roomId));
    showToast('ลบห้องพักหอพักเรียบร้อยแล้ว', 'info');
    await deleteElectricityRoomFromFirestore(roomId);
  };

  // Attendance Handlers
  const handleAddAttendance = async (record: AttendanceRecord) => {
    setAttendanceRecords(prev => [record, ...prev]);
    await addAttendanceToFirestore(record);
  };

  const handleUpdateAttendance = async (id: string, data: Partial<AttendanceRecord>) => {
    setAttendanceRecords(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
    await updateAttendanceInFirestore(id, data);
  };

  const handleDeleteAttendance = async (id: string) => {
    setAttendanceRecords(prev => prev.filter(r => r.id !== id));
    await deleteAttendanceFromFirestore(id);
  };

  // User CRUD Handlers

  const handleAddUser = async (newUser: UserProfile) => {
    setUsers(prev => [...prev, newUser]);
    showToast(`เพิ่มผู้ใช้งาน "${newUser.displayName}" สำเร็จ (บันทึกลง Firestore)`);
    await addUserToFirestore(newUser);
  };

  const handleUpdateUser = async (userId: string, userData: Partial<UserProfile>) => {
    setUsers(prev => prev.map(u => u.uid === userId ? { ...u, ...userData } : u));
    showToast(`อัปเดตสิทธิ์และข้อมูลผู้ใช้งานเรียบร้อยแล้ว`);
    await updateUserInFirestore(userId, userData);
  };

  const handleDeleteUser = async (userId: string) => {
    setUsers(prev => prev.filter(u => u.uid !== userId));
    showToast(`ลบผู้ใช้งานออกจากระบบเรียบร้อยแล้ว`, 'info');
    await deleteUserFromFirestore(userId);
  };

  const handleSelectUserPersona = (userPersona: UserProfile) => {
    setCurrentUser(userPersona);
    showToast(`สลับใช้งานระบบในนาม: ${userPersona.displayName} (${userPersona.role})`);
  };

  const handleRegisterSuccess = (newUser: UserProfile) => {
    setUsers(prev => [newUser, ...prev]);
    showToast(`ส่งคำขอสมัครสมาชิกของ "${newUser.displayName}" เรียบร้อยแล้ว (รอเจ้าหน้าที่ Admin อนุมัติสิทธิ์)`, 'info');
  };

  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans antialiased">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold flex items-center space-x-2 ${
            notification.type === 'success' 
              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50' 
              : 'bg-emerald-950 text-teal-300 border-teal-500/50'
          }`}>
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLoginWithGoogle={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onSelectRole={handleRoleChange}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
        pendingCount={pendingCount}
      />

      {/* Account Pending/Rejected Warning Banner */}
      {currentUser && currentUser.approvalStatus === 'pending' && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2.5 shadow-sm text-xs font-semibold flex items-center justify-between border-b border-amber-600">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 animate-spin text-slate-950 shrink-0" />
              <span>
                <strong>สถานะบัญชี:</strong> คำขอสมัครสมาชิกของท่าน (<span className="underline font-bold">{currentUser.displayName}</span>) อยู่ระหว่างรอการตรวจสอบและอนุมัติสิทธิ์จากเจ้าหน้าที่ผู้ดูแลระบบ (Admin)
              </span>
            </div>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[11px] font-bold hover:bg-slate-800 transition shrink-0"
            >
              ตรวจสอบสถานะคำขอ
            </button>
          </div>
        </div>
      )}

      {currentUser && currentUser.approvalStatus === 'rejected' && (
        <div className="bg-rose-600 text-white px-4 py-2.5 shadow-sm text-xs font-semibold flex items-center justify-between border-b border-rose-700">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-200 shrink-0" />
              <span>
                <strong>แจ้งเตือน:</strong> คำขอสมัครสมาชิกของท่านไม่ผ่านการอนุมัติ: <em>"{currentUser.rejectionReason || 'ข้อมูลไม่ถูกต้อง'}"</em> กรุณาติดต่อศูนย์แพทยศาสตรศึกษาชั้นคลินิก
              </span>
            </div>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-3 py-1 bg-white text-rose-700 rounded-lg text-[11px] font-bold hover:bg-rose-50 transition shrink-0"
            >
              ยื่นสมัครใหม่
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'rooms' && (
          <RoomList
            rooms={rooms}
            onSelectRoomToBook={(room) => handleOpenNewBooking(room)}
            onViewRoomDetails={(room) => {
              setSelectedRoomToBook(room);
              setActiveTab('calendar');
            }}
          />
        )}

        {activeTab === 'calendar' && (
          <BookingCalendar
            bookings={bookings}
            rooms={rooms}
            currentUser={currentUser}
            onCancelBooking={handleCancelBooking}
            onOpenNewBooking={() => handleOpenNewBooking()}
          />
        )}

        {activeTab === 'new-booking' && (
          <div className="max-w-2xl mx-auto py-4">
            <button
              onClick={() => handleOpenNewBooking()}
              className="w-full py-12 bg-white rounded-3xl border-2 border-dashed border-emerald-300 hover:border-emerald-500 text-emerald-800 font-bold text-sm shadow-sm transition flex flex-col items-center justify-center gap-2 group"
            >
              <div className="p-4 bg-emerald-50 rounded-2xl group-hover:bg-emerald-100 transition">
                <Building2 className="w-8 h-8 text-emerald-700" />
              </div>
              <span>คลิกเพื่อเปิดฟอร์มยื่นคำขอจองห้องเรียน / ห้องปฏิบัติการ</span>
              <span className="text-xs font-normal text-slate-500">เลือกห้อง วันที่ เวลา และอุปกรณ์การสอนที่ต้องการ</span>
            </button>
          </div>
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard bookings={bookings} rooms={rooms} currentUser={currentUser} />
        )}

        {activeTab === 'electricity' && (
          <ElectricityManagement
            currentUser={currentUser}
            rooms={electricityRooms}
            bills={electricityBills}
            onAddBill={handleAddElectricityBill}
            onUpdateBill={handleUpdateElectricityBill}
            onDeleteBill={handleDeleteElectricityBill}
            onAddRoom={handleAddElectricityRoom}
            onUpdateRoom={handleUpdateElectricityRoom}
            onDeleteRoom={handleDeleteElectricityRoom}
            showToast={showToast}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceManagement
            currentUser={currentUser}
            attendanceRecords={attendanceRecords}
            onAddAttendance={handleAddAttendance}
            onUpdateAttendance={handleUpdateAttendance}
            onDeleteAttendance={handleDeleteAttendance}
            onSelectRole={handleRoleChange}
            showToast={showToast}
          />
        )}

        {activeTab === 'admin' && (

          <AdminManagement
            bookings={bookings}
            rooms={rooms}
            users={users}
            currentUser={currentUser}
            onUpdateStatus={handleUpdateStatus}
            onAddRoom={handleAddRoom}
            onUpdateRoom={handleUpdateRoom}
            onDeleteRoom={handleDeleteRoom}
            onAddBooking={handleAddBooking}
            onUpdateBooking={handleUpdateBooking}
            onDeleteBooking={handleDeleteBooking}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onSelectUserPersona={handleSelectUserPersona}
          />
        )}
      </main>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginWithGoogle={handleLoginGoogle}
        onSelectRole={handleRoleChange}
        currentUser={currentUser}
        onOpenRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />

      {/* Register / Member Signup Modal */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegisterSuccess={handleRegisterSuccess}
        onOpenLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      {/* Booking Form Modal */}
      {(isBookingModalOpen || activeTab === 'new-booking') && (
        <BookingFormModal
          rooms={rooms}
          selectedRoom={selectedRoomToBook}
          existingBookings={bookings}
          currentUser={currentUser}
          onSubmitBooking={handleCreateBooking}
          onClose={() => {
            setIsBookingModalOpen(false);
            if (activeTab === 'new-booking') setActiveTab('calendar');
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-emerald-950 text-emerald-200/80 text-xs border-t border-emerald-900 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-700 rounded-xl text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">
                ศูนย์แพทยศาสตรศึกษาชั้นคลินิก โรงพยาบาลบุรีรัมย์
              </div>
              <div className="text-[11px] text-emerald-300/80">
                Buriram Hospital Medical Education Center
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-emerald-300/80 text-[11px]">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              โทรศัพท์: 0 4461 5002 ต่อ 3619 - 20 ศูนย์แพทยศาสตรศึกษาชั้นคลินิก
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              อีเมล: buriram.mec@cpird.in.th
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
