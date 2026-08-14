import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  User, 
  Phone, 
  Calendar, 
  MessageSquare,
  Search,
  Filter,
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  X,
  Layers,
  Users,
  AlertTriangle,
  Check,
  Power,
  Lock,
  Unlock,
  Key,
  UserPlus,
  Settings,
  Zap,
  CheckSquare,
  Square,
  UserCheck,
  UserX,
  Sliders,
  Mail,
  GraduationCap,
  ShieldAlert,
  FileDown,
  Clock3,
  CheckCheck,
  FileText,
  BadgeAlert,
  Sparkles
} from 'lucide-react';
import { Booking, Room, RoomCategory, UserRole, UserProfile, UserPermissions, UserApprovalStatus } from '../types';
import { DEFAULT_ROLE_PERMISSIONS } from '../data/mockUserData';


interface AdminProps {
  bookings: Booking[];
  rooms: Room[];
  users: UserProfile[];
  currentUser: UserProfile | null;
  onUpdateStatus: (bookingId: string, status: 'approved' | 'rejected', note?: string) => void;
  onAddRoom: (room: Room) => Promise<void>;
  onUpdateRoom: (roomId: string, roomData: Partial<Room>) => Promise<void>;
  onDeleteRoom: (roomId: string) => Promise<void>;
  onAddBooking: (booking: Booking) => Promise<void>;
  onUpdateBooking: (bookingId: string, bookingData: Partial<Booking>) => Promise<void>;
  onDeleteBooking: (bookingId: string) => Promise<void>;
  onAddUser: (user: UserProfile) => Promise<void>;
  onUpdateUser: (userId: string, userData: Partial<UserProfile>) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onSelectUserPersona?: (user: UserProfile) => void;
}

export const AdminManagement: React.FC<AdminProps> = ({
  bookings,
  rooms,
  users,
  currentUser,
  onUpdateStatus,
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom,
  onAddBooking,
  onUpdateBooking,
  onDeleteBooking,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onSelectUserPersona
}) => {
  const [mainTab, setMainTab] = useState<'bookings' | 'rooms' | 'users'>('bookings');

  // Booking filters & search
  const [bookingStatusTab, setBookingStatusTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [bookingSearch, setBookingSearch] = useState('');
  const [selectedNoteMap, setSelectedNoteMap] = useState<Record<string, string>>({});

  // Room filters & search
  const [roomSearch, setRoomSearch] = useState('');
  const [roomCategoryFilter, setRoomCategoryFilter] = useState<string>('all');

  // User filters & search
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('all');
  const [userSubTab, setUserSubTab] = useState<'list' | 'pending_approvals' | 'roles_matrix'>('list');

  // Pending Registrations Filter & Modals
  const [pendingFilter, setPendingFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [pendingSearch, setPendingSearch] = useState('');
  const [rejectModalUser, setRejectModalUser] = useState<UserProfile | null>(null);
  const [rejectReasonText, setRejectReasonText] = useState('');
  const [approveModalUser, setApproveModalUser] = useState<UserProfile | null>(null);
  const [approveSelectedRole, setApproveSelectedRole] = useState<UserRole>('user');
  const [approveStudentId, setApproveStudentId] = useState('');
  const [approveDepartment, setApproveDepartment] = useState('');
  const [approveAcademicYear, setApproveAcademicYear] = useState('');
  const [approveNote, setApproveNote] = useState('');
  const [isProcessingApproval, setIsProcessingApproval] = useState(false);

  // Modals state
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const [isBookingEditModalOpen, setIsBookingEditModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  // User Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Role Policy Edit Modal State
  const [isRolePolicyModalOpen, setIsRolePolicyModalOpen] = useState(false);
  const [editingRolePolicy, setEditingRolePolicy] = useState<UserRole>('student');
  const [rolePermissionsState, setRolePermissionsState] = useState(DEFAULT_ROLE_PERMISSIONS);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'room' | 'booking' | 'user';
    id: string;
    title: string;
  } | null>(null);

  // Form states for Room Add/Edit
  const [roomForm, setRoomForm] = useState<Partial<Room>>({
    name: '',
    code: '',
    category: 'lecture',
    categoryName: 'ห้องบรรยายใหญ่',
    building: 'อาคารศูนย์แพทยศาสตรศึกษาชั้นคลินิก',
    floor: 'ชั้น 9',
    capacity: 100,
    description: '',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
    isAvailable: true,
    equipment: {
      projector: true,
      smartBoard: false,
      microphone: true,
      hybridZoom: false,
      airConditioner: true,
      osceDummies: false
    }
  });

  // Form state for Booking Edit/Add
  const [bookingForm, setBookingForm] = useState<Partial<Booking>>({
    title: '',
    purpose: '',
    userName: '',
    userEmail: '',
    department: 'ศูนย์แพทยศาสตรศึกษาชั้นคลินิก',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '12:00',
    attendeesCount: 10,
    status: 'pending',
    contactPhone: '081-234-5678',
    adminNote: ''
  });

  // Form state for User Add/Edit
  const [userForm, setUserForm] = useState<Partial<UserProfile>>({
    displayName: '',
    email: '',
    role: 'user',
    department: 'ผู้ใช้งานทั่วไป',
    academicYear: 'นักศึกษาแพทย์ / บุคลากร',
    phone: '',
    status: 'active',
    permissions: DEFAULT_ROLE_PERMISSIONS.user.defaultPermissions
  });

  // Category labels map
  const categoryNamesMap: Record<RoomCategory, string> = {
    lecture: 'ห้องบรรยายใหญ่',
    pbl: 'ห้องเรียน PBL / ติวกลุ่มย่อย',
    skill_lab: 'ห้องปฏิบัติการทักษะทางคลินิก (OSCE/Skill Lab)',
    conference: 'ห้องประชุม / สัมมนา',
    it: 'ห้องปฏิบัติการคอมพิวเตอร์ (IT Center)',
    lounge: 'ห้องพักนักศึกษาแพทย์'
  };

  // --- Handlers for Room ---
  const handleOpenAddRoom = () => {
    setEditingRoom(null);
    setRoomForm({
      id: `room-${Date.now().toString().slice(-4)}`,
      name: '',
      code: `MEC-${Math.floor(100 + Math.random() * 900)}`,
      category: 'lecture',
      categoryName: categoryNamesMap['lecture'],
      building: 'อาคารศูนย์แพทยศาสตรศึกษาชั้นคลินิก',
      floor: 'ชั้น 9',
      capacity: 40,
      description: 'ห้องเรียนปรับอากาศพร้อมโปรเจกเตอร์และระบบเสียงคุณภาพสูง',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
      isAvailable: true,
      equipment: {
        projector: true,
        smartBoard: true,
        microphone: true,
        hybridZoom: false,
        airConditioner: true,
        osceDummies: false
      }
    });
    setIsRoomModalOpen(true);
  };

  const handleOpenEditRoom = (room: Room) => {
    setEditingRoom(room);
    setRoomForm({ ...room });
    setIsRoomModalOpen(true);
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomForm.name || !roomForm.code) return;

    const category = (roomForm.category || 'lecture') as RoomCategory;
    const finalRoom: Room = {
      id: editingRoom ? editingRoom.id : (roomForm.id || `room-${Date.now()}`),
      name: roomForm.name || 'ห้องเรียน',
      code: roomForm.code || 'MEC-L201',
      category,
      categoryName: categoryNamesMap[category] || 'ห้องเรียน',
      building: roomForm.building || 'อาคารศูนย์แพทยศาสตรศึกษาชั้นคลินิก',
      floor: roomForm.floor || 'ชั้น 2',
      capacity: Number(roomForm.capacity) || 20,
      description: roomForm.description || '',
      image: roomForm.image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
      isAvailable: roomForm.isAvailable !== undefined ? roomForm.isAvailable : true,
      equipment: roomForm.equipment || {
        projector: true,
        smartBoard: false,
        microphone: true,
        hybridZoom: false,
        airConditioner: true,
        osceDummies: false
      }
    };

    if (editingRoom) {
      await onUpdateRoom(editingRoom.id, finalRoom);
    } else {
      await onAddRoom(finalRoom);
    }

    setIsRoomModalOpen(false);
  };

  const handleToggleRoomStatus = async (room: Room) => {
    await onUpdateRoom(room.id, { isAvailable: !room.isAvailable });
  };

  // --- Handlers for Booking ---
  const handleOpenAddBooking = () => {
    setEditingBooking(null);
    const defaultRoom = rooms[0];
    setBookingForm({
      id: `book-${Date.now().toString().slice(-4)}`,
      roomId: defaultRoom?.id || 'room-01',
      roomName: defaultRoom?.name || 'ห้องบรรยาย 1',
      userName: 'เจ้าหน้าที่ศูนย์แพทยศาสตร์ (บันทึกแทน)',
      userEmail: 'buriram.mec@cpird.in.th',
      userRole: 'admin',
      department: 'ศูนย์แพทยศาสตรศึกษาชั้นคลินิก',
      title: 'กิจกรรมการเรียนการสอน/การอบรม',
      purpose: 'เพื่อการเรียนการสอนนักศึกษาแพทย์',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '12:00',
      attendeesCount: 20,
      requestedEquipment: ['โปรเจกเตอร์ / จอภาพ', 'ไมโครโฟน / ลำโพง'],
      contactPhone: '044-602-000',
      status: 'approved',
      adminNote: 'บันทึกคำขอโดยผู้ดูแลระบบผู้จัดการ',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setIsBookingEditModalOpen(true);
  };

  const handleOpenEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setBookingForm({ ...booking });
    setIsBookingEditModalOpen(true);
  };

  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.title || !bookingForm.userName) return;

    const selectedRoom = rooms.find(r => r.id === bookingForm.roomId) || rooms[0];

    const finalBooking: Booking = {
      id: editingBooking ? editingBooking.id : (bookingForm.id || `book-${Date.now()}`),
      roomId: selectedRoom?.id || 'room-01',
      roomName: selectedRoom?.name || 'ห้องบรรยาย',
      userId: editingBooking ? editingBooking.userId : 'usr-admin-01',
      userName: bookingForm.userName || 'ผู้ใช้งาน',
      userEmail: bookingForm.userEmail || 'buriram.mec@cpird.in.th',
      userRole: bookingForm.userRole || 'student',
      department: bookingForm.department || 'ศูนย์แพทยศาสตรศึกษาชั้นคลินิก',
      title: bookingForm.title || 'กิจกรรมการเรียนการสอน',
      purpose: bookingForm.purpose || 'เพื่อการศึกษา',
      date: bookingForm.date || new Date().toISOString().split('T')[0],
      startTime: bookingForm.startTime || '09:00',
      endTime: bookingForm.endTime || '12:00',
      attendeesCount: Number(bookingForm.attendeesCount) || 10,
      requestedEquipment: bookingForm.requestedEquipment || ['โปรเจกเตอร์'],
      contactPhone: bookingForm.contactPhone || '081-234-5678',
      status: bookingForm.status || 'pending',
      adminNote: bookingForm.adminNote || '',
      createdAt: editingBooking ? editingBooking.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingBooking) {
      await onUpdateBooking(editingBooking.id, finalBooking);
    } else {
      await onAddBooking(finalBooking);
    }

    setIsBookingEditModalOpen(false);
  };

  // --- Handlers for User Roles & Permissions ---
  const handleOpenAddUser = () => {
    setEditingUser(null);
    const defaultRole: UserRole = 'user';
    setUserForm({
      uid: `usr-${Date.now().toString().slice(-6)}`,
      displayName: '',
      email: '',
      role: defaultRole,
      department: 'ผู้ใช้งานทั่วไป',
      academicYear: 'นักศึกษาแพทย์ / บุคลากร',
      phone: '',
      status: 'active',
      permissions: { ...DEFAULT_ROLE_PERMISSIONS[defaultRole].defaultPermissions }
    });
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: UserProfile) => {
    setEditingUser(user);
    const currentPermissions = user.permissions || DEFAULT_ROLE_PERMISSIONS[user.role]?.defaultPermissions || DEFAULT_ROLE_PERMISSIONS.user.defaultPermissions;
    setUserForm({
      ...user,
      permissions: { ...currentPermissions }
    });
    setIsUserModalOpen(true);
  };

  const handleRoleSelectInForm = (selectedRole: UserRole) => {
    const defaults = DEFAULT_ROLE_PERMISSIONS[selectedRole];
    setUserForm(prev => ({
      ...prev,
      role: selectedRole,
      department: selectedRole === 'admin' ? 'ศูนย์แพทยศาสตรศึกษาชั้นคลินิก' : 'ผู้ใช้งานทั่วไป',
      academicYear: selectedRole === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'นักศึกษาแพทย์ / บุคลากร',
      permissions: { ...defaults.defaultPermissions }
    }));
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.displayName || !userForm.email) return;

    const userRole = (userForm.role || 'student') as UserRole;
    const finalPermissions: UserPermissions = userForm.permissions || DEFAULT_ROLE_PERMISSIONS[userRole].defaultPermissions;

    const finalUser: UserProfile = {
      uid: editingUser ? editingUser.uid : (userForm.uid || `usr-${Date.now()}`),
      displayName: userForm.displayName,
      email: userForm.email,
      role: userRole,
      department: userForm.department || 'ศูนย์แพทยศาสตรศึกษาชั้นคลินิก',
      academicYear: userForm.academicYear || 'บุคลากร',
      phone: userForm.phone || '081-000-0000',
      status: userForm.status || 'active',
      permissions: finalPermissions,
      createdAt: editingUser?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingUser) {
      await onUpdateUser(editingUser.uid, finalUser);
    } else {
      await onAddUser(finalUser);
    }

    setIsUserModalOpen(false);
  };

  const handleToggleUserStatus = async (user: UserProfile) => {
    const newStatus = user.status === 'inactive' ? 'active' : 'inactive';
    await onUpdateUser(user.uid, { status: newStatus });
  };

  const handleOpenEditRolePolicy = (role: UserRole) => {
    setEditingRolePolicy(role);
    setIsRolePolicyModalOpen(true);
  };

  const handleSaveRolePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRolePolicyModalOpen(false);
  };

  // --- Registration Approval & Rejection Handlers ---
  const handleOpenApproveModal = (user: UserProfile) => {
    setApproveModalUser(user);
    setApproveSelectedRole(user.role || 'student');
    setApproveStudentId(user.studentId || '');
    setApproveDepartment(user.department || 'แพทยศาสตรศึกษาชั้นคลินิก');
    setApproveAcademicYear(user.academicYear || 'ชั้นปีที่ 4 (Extern/Clinic)');
  };

  const handleConfirmApproveUser = async () => {
    if (!approveModalUser) return;
    setIsProcessingApproval(true);
    try {
      const defaultPerms = DEFAULT_ROLE_PERMISSIONS[approveSelectedRole]?.defaultPermissions || DEFAULT_ROLE_PERMISSIONS.user.defaultPermissions;
      await onUpdateUser(approveModalUser.uid, {
        approvalStatus: 'approved',
        status: 'active',
        role: approveSelectedRole,
        studentId: approveStudentId,
        department: approveDepartment,
        academicYear: approveAcademicYear,
        approvedAt: new Date().toISOString(),
        approvedBy: currentUser?.email || currentUser?.displayName || 'admin@cpird.in.th',
        permissions: defaultPerms
      });
      setApproveModalUser(null);
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setIsProcessingApproval(false);
    }
  };

  const handleQuickApprove = async (user: UserProfile) => {
    const defaultPerms = DEFAULT_ROLE_PERMISSIONS[user.role || 'user']?.defaultPermissions || DEFAULT_ROLE_PERMISSIONS.user.defaultPermissions;
    await onUpdateUser(user.uid, {
      approvalStatus: 'approved',
      status: 'active',
      approvedAt: new Date().toISOString(),
      approvedBy: currentUser?.email || currentUser?.displayName || 'admin@cpird.in.th',
      permissions: defaultPerms
    });
  };

  const handleOpenRejectModal = (user: UserProfile) => {
    setRejectModalUser(user);
    setRejectReasonText('ไม่พบบันทึกในฐานข้อมูลนักศึกษาแพทย์ หรือข้อมูลไม่ครบถ้วน');
  };

  const handleConfirmRejectUser = async () => {
    if (!rejectModalUser) return;
    setIsProcessingApproval(true);
    try {
      await onUpdateUser(rejectModalUser.uid, {
        approvalStatus: 'rejected',
        status: 'inactive',
        rejectionReason: rejectReasonText,
        approvedBy: currentUser?.email || currentUser?.displayName || 'admin@cpird.in.th'
      });
      setRejectModalUser(null);
      setRejectReasonText('');
    } catch (err) {
      console.error('Rejection failed:', err);
    } finally {
      setIsProcessingApproval(false);
    }
  };

  const handleExportRegistrationsCSV = () => {
    const headers = ['UID', 'ชื่อ-นามสกุล', 'อีเมล', 'รหัสนักศึกษา/บุคลากร', 'บทบาท', 'สังกัด/ภาควิชา', 'ชั้นปี/ตำแหน่ง', 'เบอร์โทร', 'สถานะการอนุมัติ', 'เหตุผลในการสมัคร', 'วันที่สมัคร'];
    const rows = users.map(u => [
      u.uid,
      `"${u.displayName}"`,
      u.email,
      `"${u.studentId || '-'}"`,
      u.role,
      `"${u.department || '-'}"`,
      `"${u.academicYear || '-'}"`,
      `"${u.phone || '-'}"`,
      u.approvalStatus || 'approved',
      `"${(u.registrationReason || '-').replace(/"/g, '""')}"`,
      u.registeredAt || u.createdAt || '-'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `buriram_mec_users_registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Confirm Delete Handler
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'room') {
      await onDeleteRoom(deleteConfirm.id);
    } else if (deleteConfirm.type === 'booking') {
      await onDeleteBooking(deleteConfirm.id);
    } else if (deleteConfirm.type === 'user') {
      await onDeleteUser(deleteConfirm.id);
    }
    setDeleteConfirm(null);
  };

  // Filtered lists
  const filteredBookings = bookings.filter(b => {
    const matchesTab = bookingStatusTab === 'all' || b.status === bookingStatusTab;
    const matchesSearch = b.userName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                          b.roomName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                          b.title.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                          b.department.toLowerCase().includes(bookingSearch.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const filteredRooms = rooms.filter(r => {
    const matchesCategory = roomCategoryFilter === 'all' || r.category === roomCategoryFilter;
    const matchesSearch = r.name.toLowerCase().includes(roomSearch.toLowerCase()) ||
                          r.code.toLowerCase().includes(roomSearch.toLowerCase()) ||
                          r.building.toLowerCase().includes(roomSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredUsers = users.filter(u => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesStatus = userStatusFilter === 'all' || u.status === userStatusFilter || (userStatusFilter === 'active' && !u.status);
    const matchesSearch = u.displayName.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.department.toLowerCase().includes(userSearch.toLowerCase()) ||
                          (u.phone && u.phone.includes(userSearch));
    return matchesRole && matchesStatus && matchesSearch;
  });

  // Filtered pending registrations list
  const filteredPendingUsers = users.filter(u => {
    const matchesApproval = pendingFilter === 'all' || (u.approvalStatus || 'approved') === pendingFilter;
    const matchesSearch = u.displayName.toLowerCase().includes(pendingSearch.toLowerCase()) ||
                          u.email.toLowerCase().includes(pendingSearch.toLowerCase()) ||
                          (u.studentId && u.studentId.toLowerCase().includes(pendingSearch.toLowerCase())) ||
                          u.department.toLowerCase().includes(pendingSearch.toLowerCase()) ||
                          (u.phone && u.phone.includes(pendingSearch));
    return matchesApproval && matchesSearch;
  });

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const pendingRegistrationsCount = users.filter(u => u.approvalStatus === 'pending').length;
  const activeUsersCount = users.filter(u => u.status !== 'inactive' && u.approvalStatus !== 'rejected').length;
  const adminUsersCount = users.filter(u => u.role === 'admin').length;


  return (
    <div className="space-y-6">
      {/* Backend Top Bar Header */}
      <div className="bg-emerald-950 text-white p-6 rounded-3xl shadow-xl border border-emerald-900 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl text-white font-bold shadow-lg border border-emerald-400/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-900/90 px-2.5 py-0.5 rounded-full border border-emerald-700/80">
                MEC Backend Control Panel • MOPH
              </span>
              <span className="text-[10px] text-emerald-300/80">v2.5 (User Roles & RBAC Sync)</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white mt-1">
              ระบบบริหารผู้จัดการ และกำหนดสิทธิ์ผู้ใช้งาน (Roles & Permissions)
            </h1>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              ศูนย์แพทยศาสตรศึกษาชั้นคลินิก โรงพยาบาลบุรีรัมย์
            </p>
          </div>
        </div>

        {/* Main Backend Tabs Switcher */}
        <div className="flex flex-wrap items-center gap-2 bg-emerald-900/90 p-1.5 rounded-2xl border border-emerald-800 text-xs font-bold">
          <button
            onClick={() => setMainTab('bookings')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition ${
              mainTab === 'bookings'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-emerald-100 hover:text-white hover:bg-emerald-800/80'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>คำขอจองห้อง</span>
            {pendingCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMainTab('rooms')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition ${
              mainTab === 'rooms'
                ? 'bg-emerald-600 text-white shadow-md font-bold'
                : 'text-emerald-100 hover:text-white hover:bg-emerald-800/80'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>จัดการห้องเรียน ({rooms.length})</span>
          </button>

          <button
            onClick={() => setMainTab('users')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition ${
              mainTab === 'users'
                ? 'bg-teal-600 text-white shadow-md font-bold'
                : 'text-emerald-100 hover:text-white hover:bg-emerald-800/80'
            }`}
          >
            <Key className="w-4 h-4 text-amber-300" />
            <span>จัดการสิทธิ์และผู้ใช้ ({users.length})</span>
          </button>
        </div>
      </div>

      {/* ==================== TAB 1: BOOKING MANAGEMENT ==================== */}
      {mainTab === 'bookings' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Sub Header & Actions */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setBookingStatusTab('pending')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  bookingStatusTab === 'pending'
                    ? 'bg-amber-500 text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                รออนุมัติ ({pendingCount})
              </button>
              <button
                onClick={() => setBookingStatusTab('approved')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  bookingStatusTab === 'approved'
                    ? 'bg-emerald-600 text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                อนุมัติแล้ว
              </button>
              <button
                onClick={() => setBookingStatusTab('rejected')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  bookingStatusTab === 'rejected'
                    ? 'bg-rose-600 text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ไม่อนุมัติ
              </button>
              <button
                onClick={() => setBookingStatusTab('all')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  bookingStatusTab === 'all'
                    ? 'bg-slate-900 text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ทั้งหมด ({bookings.length})
              </button>
            </div>

            {/* Right Side: Search & Add Manual Booking */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อผู้จอง, ห้อง, หัวข้อ..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                onClick={handleOpenAddBooking}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition shadow-sm shrink-0"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>เพิ่มรายการจองใหม่</span>
              </button>
            </div>
          </div>

          {/* Bookings Card List */}
          <div className="space-y-4">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-slate-300 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg">
                        {b.roomName}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">ID: {b.id}</span>
                      <span className="text-xs text-slate-500">
                        • ยื่นเมื่อ: {new Date(b.createdAt).toLocaleDateString('th-TH')}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {b.status === 'pending' && (
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-amber-300">
                          รอการอนุมัติ
                        </span>
                      )}
                      {b.status === 'approved' && (
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-300">
                          อนุมัติแล้ว
                        </span>
                      )}
                      {b.status === 'rejected' && (
                        <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-rose-300">
                          ไม่อนุมัติ
                        </span>
                      )}
                      {b.status === 'cancelled' && (
                        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-300">
                          ยกเลิกแล้ว
                        </span>
                      )}

                      {/* Edit / Delete Action Buttons */}
                      <div className="flex items-center space-x-1 pl-2 border-l border-slate-200">
                        <button
                          onClick={() => handleOpenEditBooking(b)}
                          title="แก้ไขการจอง"
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-sky-600 transition"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ type: 'booking', id: b.id, title: `การจอง: ${b.title}` })}
                          title="ลบการจอง"
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Booking Activity Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold text-slate-800">{b.title}</h3>
                      <p className="text-slate-600">วัตถุประสงค์: {b.purpose}</p>

                      <div className="pt-2 space-y-1 text-slate-700">
                        <div className="flex items-center space-x-1.5 font-semibold text-slate-900">
                          <Calendar className="w-4 h-4 text-sky-600 shrink-0" />
                          <span>วันที่ {b.date} | เวลา {b.startTime} - {b.endTime} น.</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <User className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>ผู้ยื่นจอง: {b.userName} ({b.department})</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>เบอร์ติดต่อ: {b.contactPhone} | อีเมล: {b.userEmail}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-700">ข้อมูลผู้เข้าร่วม & อุปกรณ์:</div>
                      <ul className="list-disc list-inside space-y-1 text-slate-600">
                        <li>จำนวนผู้เข้าร่วม: <strong>{b.attendeesCount} คน</strong></li>
                        <li>
                          อุปกรณ์ที่ขอใช้:{' '}
                          <strong>
                            {b.requestedEquipment?.length ? b.requestedEquipment.join(', ') : 'ไม่มี'}
                          </strong>
                        </li>
                      </ul>

                      {b.adminNote && (
                        <div className="text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200/80 mt-2">
                          <strong>บันทึกเจ้าหน้าที่:</strong> {b.adminNote}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pending Quick Approval Bar */}
                  {b.status === 'pending' && (
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
                        <input
                          type="text"
                          placeholder="ข้อความถึงผู้จอง (เช่น: อนุมัติแล้ว กรุณารับรีโมตแอร์ที่ธุรการ)"
                          value={selectedNoteMap[b.id] || ''}
                          onChange={(e) => setSelectedNoteMap(prev => ({ ...prev, [b.id]: e.target.value }))}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onUpdateStatus(b.id, 'rejected', selectedNoteMap[b.id])}
                          className="flex items-center space-x-1 px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>ไม่อนุมัติ</span>
                        </button>
                        <button
                          onClick={() => onUpdateStatus(b.id, 'approved', selectedNoteMap[b.id])}
                          className="flex items-center space-x-1 px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>อนุมัติคำขอ</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
                ไม่พบคำขอจองห้องตามเงื่อนไขที่เลือก
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 2: ROOM MANAGEMENT ==================== */}
      {mainTab === 'rooms' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Sub Header */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700">หมวดหมู่:</span>
              <select
                value={roomCategoryFilter}
                onChange={(e) => setRoomCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="all">ทุกประเภทห้อง ({rooms.length})</option>
                <option value="lecture">ห้องบรรยาย</option>
                <option value="pbl">ห้องเรียน PBL / ติวกลุ่ม</option>
                <option value="skill_lab">Skill Lab / OSCE</option>
                <option value="conference">ห้องประชุม</option>
                <option value="it">ห้องคอมพิวเตอร์ IT</option>
                <option value="lounge">ห้องพักผ่อน</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อห้อง, รหัสห้อง..."
                  value={roomSearch}
                  onChange={(e) => setRoomSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <button
                onClick={handleOpenAddRoom}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 transition shadow-sm shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มห้องใหม่</span>
              </button>
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-slate-300 transition"
              >
                <div>
                  {/* Room Thumbnail & Badges */}
                  <div className="relative h-40 bg-slate-100 overflow-hidden">
                    <img
                      src={room.image}
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                      <span className="bg-slate-900/80 backdrop-blur-md text-white font-mono font-bold text-[10px] px-2.5 py-1 rounded-lg">
                        {room.code}
                      </span>
                      <span className="bg-sky-900/80 backdrop-blur-md text-sky-200 font-semibold text-[10px] px-2.5 py-1 rounded-lg">
                        {room.categoryName}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => handleToggleRoomStatus(room)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md transition flex items-center space-x-1 ${
                          room.isAvailable
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                            : 'bg-rose-500 text-white hover:bg-rose-600'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        <span>{room.isAvailable ? 'พร้อมใช้งาน' : 'ปิดปรับปรุง'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Room Body */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-800 text-sm">{room.name}</h3>
                      <span className="text-xs font-semibold text-slate-500 shrink-0">
                        จุ {room.capacity} คน
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2">
                      {room.description || 'ไม่มีรายละเอียด'}
                    </p>

                    <div className="text-[11px] text-slate-600 pt-1 space-y-0.5 font-medium">
                      <div>🏢 {room.building} ({room.floor})</div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {room.equipment?.projector && (
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">
                            โปรเจกเตอร์
                          </span>
                        )}
                        {room.equipment?.smartBoard && (
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">
                            SmartBoard
                          </span>
                        )}
                        {room.equipment?.microphone && (
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">
                            ไมโครโฟน
                          </span>
                        )}
                        {room.equipment?.airConditioner && (
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">
                            แอร์
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit & Delete Actions */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 font-mono">ID: {room.id}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenEditRoom(room)}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition"
                    >
                      <Pencil className="w-3.5 h-3.5 text-sky-600" />
                      <span>แก้ไข</span>
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ type: 'room', id: room.id, title: `ห้อง: ${room.name}` })}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ลบ</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== TAB 3: USER ROLES & PERMISSIONS MANAGEMENT ==================== */}
      {mainTab === 'users' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-slate-500">ผู้ใช้งานทั้งหมด</div>
                <div className="text-2xl font-black text-slate-800 mt-0.5">{users.length} คน</div>
              </div>
              <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div 
              onClick={() => setUserSubTab('pending_approvals')}
              className={`p-4 rounded-2xl border shadow-sm flex items-center justify-between cursor-pointer transition ${
                pendingRegistrationsCount > 0 
                  ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/30' 
                  : 'bg-white border-slate-200'
              }`}
            >
              <div>
                <div className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                  <span>รอ Admin อนุมัติสิทธิ์</span>
                  {pendingRegistrationsCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                  )}
                </div>
                <div className="text-2xl font-black text-amber-900 mt-0.5">{pendingRegistrationsCount} คำขอ</div>
              </div>
              <div className="p-3 bg-amber-100/80 text-amber-800 rounded-xl">
                <Clock3 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-emerald-600">ใช้งานปกติ (Active)</div>
                <div className="text-2xl font-black text-emerald-700 mt-0.5">{activeUsersCount} คน</div>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-slate-500">การเข้าใช้งานปัจจุบัน</div>
                <div className="text-xs font-bold text-teal-700 truncate mt-1">
                  {currentUser ? currentUser.displayName : 'ยังไม่ได้เข้าสู่ระบบ'}
                </div>
              </div>
              <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                <Key className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Sub Navbar & Controls */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center flex-wrap gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setUserSubTab('pending_approvals')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg transition relative ${
                  userSubTab === 'pending_approvals'
                    ? 'bg-amber-600 text-white shadow-sm font-bold'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Clock3 className="w-4 h-4" />
                <span>คำขอสมัครสมาชิกใหม่</span>
                {pendingRegistrationsCount > 0 && (
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ml-1 ${
                    userSubTab === 'pending_approvals' ? 'bg-amber-950 text-amber-200' : 'bg-amber-500 text-white animate-pulse'
                  }`}>
                    {pendingRegistrationsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setUserSubTab('list')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg transition ${
                  userSubTab === 'list'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>รายชื่อผู้ใช้ทั้งหมด ({filteredUsers.length})</span>
              </button>

              <button
                onClick={() => setUserSubTab('roles_matrix')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg transition ${
                  userSubTab === 'roles_matrix'
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>ตารางบทบาทและสิทธิ์มาตรฐาน</span>
              </button>
            </div>

            {/* Action Buttons: Export & Add User */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleExportRegistrationsCSV}
                title="ส่งออกรายชื่อผู้ใช้และข้อมูลการสมัครเป็น CSV"
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition"
              >
                <FileDown className="w-4 h-4 text-slate-600" />
                <span>ส่งออก CSV</span>
              </button>

              <button
                onClick={handleOpenAddUser}
                className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-sm shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>เพิ่มผู้ใช้งานใหม่</span>
              </button>
            </div>
          </div>

          {/* SUB-TAB 1: USER LIST WITH INDIVIDUAL PERMISSIONS & ACTIONS */}
          {userSubTab === 'list' && (
            <div className="space-y-4">
              {/* Filter & Search Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อ, อีเมล, แผนก, เบอร์โทร..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="all">ทุกบทบาท (All Roles)</option>
                    <option value="student">นักศึกษาแพทย์ (Student)</option>
                    <option value="resident">แพทย์ประจำบ้าน (Resident)</option>
                    <option value="staff">อาจารย์แพทย์ (Staff)</option>
                    <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                  </select>
                </div>

                <div>
                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="all">ทุกสถานะ (All Statuses)</option>
                    <option value="active">ใช้งานปกติ (Active)</option>
                    <option value="inactive">ระงับสิทธิ์ (Inactive)</option>
                  </select>
                </div>
              </div>

              {/* Users Cards / Table List */}
              <div className="grid grid-cols-1 gap-4">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const isInactive = user.status === 'inactive';
                    const userRoleConfig = DEFAULT_ROLE_PERMISSIONS[user.role] || DEFAULT_ROLE_PERMISSIONS.user;
                    const perms: UserPermissions = user.permissions || userRoleConfig.defaultPermissions;

                    return (
                      <div
                        key={user.uid}
                        className={`bg-white rounded-2xl border p-5 shadow-sm space-y-4 transition ${
                          isInactive ? 'border-slate-300 opacity-75 bg-slate-50/50' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                          <div className="flex items-start space-x-3">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                              user.role === 'admin' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                              'bg-emerald-100 text-emerald-800 border-emerald-300'
                            }`}>
                              {user.displayName ? user.displayName.slice(0, 2) : 'US'}
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-bold text-slate-900 text-sm">{user.displayName}</h3>
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${userRoleConfig.badgeColor}`}>
                                  {userRoleConfig.roleNameTh}
                                </span>
                                {user.academicYear && (
                                  <span className="text-[10px] text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                                    {user.academicYear}
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                                <span className="flex items-center space-x-1">
                                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{user.email}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{user.department}</span>
                                </span>
                                {user.phone && (
                                  <span className="flex items-center space-x-1">
                                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{user.phone}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right Controls: Status & Edit/Delete */}
                          <div className="flex items-center space-x-2 shrink-0">
                            {/* Active/Inactive Toggle */}
                            <button
                              onClick={() => handleToggleUserStatus(user)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center space-x-1.5 ${
                                isInactive
                                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              }`}
                            >
                              {isInactive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                              <span>{isInactive ? 'ระงับสิทธิ์' : 'ใช้งานปกติ'}</span>
                            </button>

                            {/* Switch Persona Test */}
                            {onSelectUserPersona && (
                              <button
                                onClick={() => onSelectUserPersona(user)}
                                title="ทดสอบสิทธิ์การใช้งานในระบบเป็นผู้ใช้นี้"
                                className="px-3 py-1.5 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition flex items-center space-x-1"
                              >
                                <Zap className="w-3.5 h-3.5 text-amber-500" />
                                <span className="hidden sm:inline">ทดสอบสิทธิ์</span>
                              </button>
                            )}

                            {/* Edit Button */}
                            <button
                              onClick={() => handleOpenEditUser(user)}
                              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 transition"
                              title="แก้ไขสิทธิ์และข้อมูลผู้ใช้"
                            >
                              <Pencil className="w-4 h-4 text-sky-600" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => setDeleteConfirm({ type: 'user', id: user.uid, title: `ผู้ใช้: ${user.displayName}` })}
                              className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
                              title="ลบผู้ใช้งาน"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Permissions Tags Matrix */}
                        <div className="space-y-1.5">
                          <div className="text-[11px] font-bold text-slate-500 flex items-center space-x-1">
                            <Key className="w-3.5 h-3.5 text-amber-500" />
                            <span>สิทธิ์การใช้งานที่ได้รับอนุมัติ (Active Permissions):</span>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1 border ${
                              perms.canApproveBookings ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                            }`}>
                              {perms.canApproveBookings ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                              <span>อนุมัติคำขอจองห้อง</span>
                            </span>

                            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1 border ${
                              perms.canManageRooms ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                            }`}>
                              {perms.canManageRooms ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                              <span>จัดการเพิ่ม/ลบห้อง</span>
                            </span>

                            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1 border ${
                              perms.canManageUsers ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                            }`}>
                              {perms.canManageUsers ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                              <span>กำหนดสิทธิ์ผู้ใช้อื่น</span>
                            </span>

                            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1 border ${
                              perms.canManageElectricity ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                            }`}>
                              {perms.canManageElectricity ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                              <span>ระบบค่าไฟหอพัก</span>
                            </span>

                            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1 border ${
                              perms.canExportReports ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                            }`}>
                              {perms.canExportReports ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                              <span>ออกรายงานสถิติ</span>
                            </span>

                            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1 border ${
                              perms.canBookPriorityRooms ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                            }`}>
                              {perms.canBookPriorityRooms ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                              <span>จองห้อง Priority</span>
                            </span>

                            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                              ⏱️ สูงสุด {perms.maxBookingHoursPerDay || 4} ชม./วัน
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
                    ไม่พบข้อมูลผู้ใช้งานตามเงื่อนไขที่ค้นหา
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUB-TAB 2: PENDING USER REGISTRATIONS & APPROVALS */}
          {userSubTab === 'pending_approvals' && (
            <div className="space-y-4">
              {/* Header Info & Filtering Toolbar */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                      <Clock3 className="w-4 h-4 text-amber-600" />
                      <span>ระบบตรวจสอบและอนุมัติสมาชิกใหม่ (User Registration Approvals)</span>
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      เจ้าหน้าที่ผู้ดูแลระบบ (Admin) ตรวจสอบความถูกต้องของนักศึกษาแพทย์/บุคลากร และกำหนดสิทธิ์การใช้งานก่อนเข้าสู่ระบบ
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportRegistrationsCSV}
                    className="self-start md:self-auto flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>ดาวน์โหลดรายชื่อผู้สมัคร (CSV)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="relative sm:col-span-2">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="ค้นหาชื่อผู้สมัคร, รหัสนักศึกษา, อีเมล, ภาควิชา, เบอร์โทร..."
                      value={pendingSearch}
                      onChange={(e) => setPendingSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <select
                      value={pendingFilter}
                      onChange={(e) => setPendingFilter(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="pending">⏳ รอการอนุมัติ (Pending - {pendingRegistrationsCount} รายการ)</option>
                      <option value="approved">✅ อนุมัติแล้ว (Approved)</option>
                      <option value="rejected">❌ ไม่อนุมัติ (Rejected)</option>
                      <option value="all">📋 ทุกสถานะ (All Applicants)</option>
                    </select>
                  </div>
                </div>

                {/* Filter Quick Pills */}
                <div className="flex items-center flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => setPendingFilter('pending')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                      pendingFilter === 'pending'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>รออนุมัติ</span>
                    <span className="bg-amber-950 text-amber-200 text-[10px] px-1.5 py-0.2 rounded-full">
                      {users.filter(u => u.approvalStatus === 'pending').length}
                    </span>
                  </button>

                  <button
                    onClick={() => setPendingFilter('approved')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                      pendingFilter === 'approved'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>อนุมัติแล้ว</span>
                    <span className="bg-emerald-800 text-emerald-100 text-[10px] px-1.5 py-0.2 rounded-full">
                      {users.filter(u => u.approvalStatus === 'approved' || !u.approvalStatus).length}
                    </span>
                  </button>

                  <button
                    onClick={() => setPendingFilter('rejected')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                      pendingFilter === 'rejected'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>ไม่อนุมัติ</span>
                    <span className="bg-rose-900 text-rose-100 text-[10px] px-1.5 py-0.2 rounded-full">
                      {users.filter(u => u.approvalStatus === 'rejected').length}
                    </span>
                  </button>

                  <button
                    onClick={() => setPendingFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      pendingFilter === 'all'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>ทั้งหมด ({users.length})</span>
                  </button>
                </div>
              </div>

              {/* Pending Applicants List */}
              <div className="grid grid-cols-1 gap-4">
                {filteredPendingUsers.length > 0 ? (
                  filteredPendingUsers.map((applicant) => {
                    const status = applicant.approvalStatus || 'approved';
                    const isPending = status === 'pending';
                    const isApproved = status === 'approved';
                    const isRejected = status === 'rejected';

                    return (
                      <div
                        key={applicant.uid}
                        className={`bg-white rounded-2xl border p-5 shadow-sm space-y-4 transition ${
                          isPending 
                            ? 'border-amber-300 ring-2 ring-amber-400/20 bg-amber-50/20' 
                            : isRejected 
                            ? 'border-rose-200 bg-rose-50/10' 
                            : 'border-slate-200'
                        }`}
                      >
                        {/* Header Row */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                          <div className="flex items-start space-x-3.5">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-700 to-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0 border border-teal-400/30">
                              {applicant.displayName.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center flex-wrap gap-2">
                                <h4 className="text-sm font-bold text-slate-900">{applicant.displayName}</h4>
                                {applicant.studentId && (
                                  <span className="text-[11px] font-bold font-mono px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-md">
                                    รหัส: {applicant.studentId}
                                  </span>
                                )}
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                                  {applicant.role === 'admin' ? '⚡ ผู้ดูแลระบบ' : applicant.role === 'resident' ? '🩺 แพทย์ประจำบ้าน' : applicant.role === 'staff' ? '👨‍🏫 อาจารย์แพทย์' : '🎓 นักศึกษาแพทย์'}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 flex items-center gap-3 mt-1 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{applicant.email}</span>
                                </span>
                                {applicant.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{applicant.phone}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div>
                            {isPending && (
                              <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                <Clock3 className="w-4 h-4 text-amber-600 animate-spin" />
                                <span>รอการตรวจสอบและอนุมัติ</span>
                              </span>
                            )}
                            {isApproved && (
                              <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>อนุมัติสิทธิ์เรียบร้อยแล้ว</span>
                              </span>
                            )}
                            {isRejected && (
                              <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
                                <XCircle className="w-4 h-4 text-rose-600" />
                                <span>ไม่อนุมัติคำขอ</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                          <div>
                            <span className="text-slate-400 text-[11px] block font-medium">สังกัด / ภาควิชา:</span>
                            <span className="font-bold text-slate-800">{applicant.department || 'ไม่ระบุ'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[11px] block font-medium">ระดับชั้นปี / ตำแหน่ง:</span>
                            <span className="font-bold text-slate-800">{applicant.academicYear || applicant.position || 'นักศึกษาแพทย์'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[11px] block font-medium">วันที่ยื่นคำขอสมัคร:</span>
                            <span className="font-bold text-slate-800">
                              {applicant.registeredAt ? new Date(applicant.registeredAt).toLocaleString('th-TH') : (applicant.createdAt ? new Date(applicant.createdAt).toLocaleString('th-TH') : '-')}
                            </span>
                          </div>
                        </div>

                        {/* Registration Reason Box */}
                        {applicant.registrationReason && (
                          <div className="bg-teal-50/60 border border-teal-100 rounded-xl p-3 text-xs text-teal-950 flex items-start space-x-2.5">
                            <MessageSquare className="w-4 h-4 text-teal-700 mt-0.5 shrink-0" />
                            <div>
                              <span className="font-bold text-teal-900 block text-[11px]">วัตถุประสงค์ในการขอเข้าใช้งาน:</span>
                              <p className="mt-0.5 text-slate-700 italic leading-relaxed">"{applicant.registrationReason}"</p>
                            </div>
                          </div>
                        )}

                        {/* Rejection Notice if rejected */}
                        {isRejected && applicant.rejectionReason && (
                          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-900 flex items-start space-x-2.5">
                            <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                            <div>
                              <span className="font-bold block text-[11px]">เหตุผลที่ไม่อนุมัติ:</span>
                              <p className="mt-0.5 text-rose-800">{applicant.rejectionReason}</p>
                            </div>
                          </div>
                        )}

                        {/* Approved Audit Info */}
                        {isApproved && (applicant.approvedBy || applicant.approvedAt) && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-2">
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>อนุมัติโดย: <strong>{applicant.approvedBy || 'Admin ผู้ดูแลระบบ'}</strong></span>
                            {applicant.approvedAt && (
                              <span>เมื่อ: {new Date(applicant.approvedAt).toLocaleString('th-TH')}</span>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-400 font-mono">UID: {applicant.uid}</span>

                          <div className="flex items-center flex-wrap gap-2">
                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOpenRejectModal(applicant)}
                                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
                                >
                                  <XCircle className="w-4 h-4 text-rose-600" />
                                  <span>ปฏิเสธคำขอ (Reject)</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleQuickApprove(applicant)}
                                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition"
                                >
                                  <Check className="w-4 h-4 text-emerald-700" />
                                  <span>อนุมัติด่วน (1-Click Approve)</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenApproveModal(applicant)}
                                  className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-sm transition"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>อนุมัติและกำหนดสิทธิ์...</span>
                                </button>
                              </>
                            )}

                            {isApproved && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditUser(applicant)}
                                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-teal-700" />
                                  <span>ปรับปรุงสิทธิ์/ข้อมูล</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleUserStatus(applicant)}
                                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                                    applicant.status === 'inactive'
                                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                      : 'text-amber-700 bg-amber-50 border-amber-200'
                                  }`}
                                >
                                  <Power className="w-3.5 h-3.5" />
                                  <span>{applicant.status === 'inactive' ? 'เปิดใช้งาน' : 'ระงับชั่วคราว'}</span>
                                </button>
                              </>
                            )}

                            {isRejected && (
                              <button
                                type="button"
                                onClick={() => handleOpenApproveModal(applicant)}
                                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>ทบทวนและอนุมัติใหม่ (Re-Approve)</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs space-y-2">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <Clock3 className="w-6 h-6" />
                    </div>
                    <div className="font-bold text-slate-700 text-sm">ไม่พบคำขอสมัครสมาชิกในหมวดหมู่นี้</div>
                    <p className="text-slate-500">
                      เมื่อผู้ใช้งานลงทะเบียนผ่านหน้าเว็บ คำขอจะปรากฏที่นี่เพื่อให้ Admin อนุมัติสิทธิ์
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUB-TAB 3: DEFAULT ROLES PERMISSIONS MATRIX VIEW */}
          {userSubTab === 'roles_matrix' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-amber-500" />
                  <span>ตารางกำหนดนโยบายสิทธิ์ตามบทบาทมาตรฐาน (Role Default Policies)</span>
                </h3>
                <p className="text-xs text-slate-600">
                  เมื่อคุณเพิ่มผู้ใช้ใหม่หรือเลือกบทบาท สิทธิ์การใช้งานเริ่มต้นจะถูกแจกจ่ายตามตารางนโยบายนี้ (สามารถปรับแต่งสิทธิ์รายบุคคลได้)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {(Object.keys(DEFAULT_ROLE_PERMISSIONS) as UserRole[]).map((rKey) => {
                  const conf = DEFAULT_ROLE_PERMISSIONS[rKey];
                  const p = conf.defaultPermissions;

                  return (
                    <div
                      key={rKey}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 flex flex-col justify-between hover:border-slate-300 transition"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${conf.badgeColor}`}>
                            {conf.roleNameTh}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            ล่วงหน้า {conf.maxAdvanceDays} วัน
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {conf.description}
                        </p>

                        <div className="space-y-2 pt-2 text-xs">
                          <div className="font-bold text-slate-700 text-[11px]">สิทธิ์มาตรฐานที่ได้รับ:</div>

                          <ul className="space-y-1.5 text-slate-600">
                            <li className="flex items-center space-x-2">
                              {p.canApproveBookings ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-slate-300 shrink-0" />}
                              <span className={p.canApproveBookings ? 'font-semibold text-slate-800' : 'text-slate-400'}>อนุมัติคำขอจองห้อง</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              {p.canManageRooms ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-slate-300 shrink-0" />}
                              <span className={p.canManageRooms ? 'font-semibold text-slate-800' : 'text-slate-400'}>จัดการข้อมูลห้องเรียน</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              {p.canManageUsers ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-slate-300 shrink-0" />}
                              <span className={p.canManageUsers ? 'font-semibold text-slate-800' : 'text-slate-400'}>จัดการสิทธิ์ผู้ใช้อื่น</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              {p.canManageElectricity ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-slate-300 shrink-0" />}
                              <span className={p.canManageElectricity ? 'font-semibold text-slate-800' : 'text-slate-400'}>จดและชำระค่าไฟหอพัก</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              {p.canExportReports ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-slate-300 shrink-0" />}
                              <span className={p.canExportReports ? 'font-semibold text-slate-800' : 'text-slate-400'}>ส่งออกรายงานสถิติ</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              {p.canBookPriorityRooms ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-slate-300 shrink-0" />}
                              <span className={p.canBookPriorityRooms ? 'font-semibold text-slate-800' : 'text-slate-400'}>จองห้อง Priority พิเศษ</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded-md">
                          จองได้สูงสุด {p.maxBookingHoursPerDay} ชม./วัน
                        </span>

                        <button
                          onClick={() => handleOpenEditRolePolicy(rKey)}
                          className="text-xs font-bold text-teal-700 hover:text-teal-900 transition flex items-center space-x-1"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>ปรับค่านโยบาย</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== MODAL 1: ADD / EDIT ROOM ==================== */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-sky-600" />
                <h2 className="text-base font-bold text-slate-800">
                  {editingRoom ? 'แก้ไขข้อมูลห้องเรียน' : 'เพิ่มห้องเรียนใหม่'}
                </h2>
              </div>
              <button
                onClick={() => setIsRoomModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ชื่อห้องเรียน/ห้องปฏิบัติการ *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น: ห้องบรรยาย 101"
                    value={roomForm.name || ''}
                    onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">รหัสห้อง (Room Code) *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น: MEC-101"
                    value={roomForm.code || ''}
                    onChange={(e) => setRoomForm({ ...roomForm, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">หมวดหมู่ห้อง *</label>
                  <select
                    value={roomForm.category || 'lecture'}
                    onChange={(e) => setRoomForm({ 
                      ...roomForm, 
                      category: e.target.value as RoomCategory,
                      categoryName: categoryNamesMap[e.target.value as RoomCategory] || 'ห้องเรียน'
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="lecture">ห้องบรรยายใหญ่</option>
                    <option value="pbl">ห้องเรียน PBL / ติวกลุ่มย่อย</option>
                    <option value="skill_lab">Skill Lab / OSCE</option>
                    <option value="conference">ห้องประชุม / สัมมนา</option>
                    <option value="it">ห้องปฏิบัติการคอมพิวเตอร์</option>
                    <option value="lounge">ห้องพักผ่อนนักศึกษาแพทย์</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ความจุผู้เข้าร่วม (คน) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={roomForm.capacity || 20}
                    onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">อาคาร</label>
                  <input
                    type="text"
                    value={roomForm.building || ''}
                    onChange={(e) => setRoomForm({ ...roomForm, building: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ชั้น</label>
                  <input
                    type="text"
                    value={roomForm.floor || ''}
                    onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">รายละเอียดและคำอธิบายห้อง</label>
                <textarea
                  rows={2}
                  value={roomForm.description || ''}
                  onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">รูปภาพห้อง (URL)</label>
                <input
                  type="url"
                  value={roomForm.image || ''}
                  onChange={(e) => setRoomForm({ ...roomForm, image: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={!!roomForm.isAvailable}
                  onChange={(e) => setRoomForm({ ...roomForm, isAvailable: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label htmlFor="isAvailable" className="font-bold text-slate-700 cursor-pointer">
                  สถานะเปิดให้จองใช้งาน (พร้อมใช้งาน)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition shadow-sm"
                >
                  บันทึกข้อมูลห้อง
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL 2: ADD / EDIT BOOKING ==================== */}
      {isBookingEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-bold text-slate-800">
                  {editingBooking ? 'แก้ไขข้อมูลการจองห้อง' : 'บันทึกรายการจองห้องใหม่ (โดยแอดมิน)'}
                </h2>
              </div>
              <button
                onClick={() => setIsBookingEditModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBooking} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">เลือกห้องเรียน/ห้องปฏิบัติการ *</label>
                <select
                  value={bookingForm.roomId || rooms[0]?.id}
                  onChange={(e) => setBookingForm({ ...bookingForm, roomId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-slate-800"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code}) - ความจุ {r.capacity} คน
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">หัวข้อกิจกรรม/วิชาการ *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น: ติวเข้มปูพื้นฐาน OSCE พาสท์ที่ 1"
                  value={bookingForm.title || ''}
                  onChange={(e) => setBookingForm({ ...bookingForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ชื่อผู้ยื่นจอง *</label>
                  <input
                    type="text"
                    required
                    value={bookingForm.userName || ''}
                    onChange={(e) => setBookingForm({ ...bookingForm, userName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ภาควิชา/หน่วยงาน *</label>
                  <input
                    type="text"
                    required
                    value={bookingForm.department || ''}
                    onChange={(e) => setBookingForm({ ...bookingForm, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">วันที่ใช้ห้อง *</label>
                  <input
                    type="date"
                    required
                    value={bookingForm.date || ''}
                    onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">เวลาเริ่ม *</label>
                  <input
                    type="time"
                    required
                    value={bookingForm.startTime || ''}
                    onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">เวลาสิ้นสุด *</label>
                  <input
                    type="time"
                    required
                    value={bookingForm.endTime || ''}
                    onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">สถานะคำขอจอง *</label>
                  <select
                    value={bookingForm.status || 'pending'}
                    onChange={(e) => setBookingForm({ ...bookingForm, status: e.target.value as Booking['status'] })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                  >
                    <option value="pending">รอการอนุมัติ (Pending)</option>
                    <option value="approved">อนุมัติแล้ว (Approved)</option>
                    <option value="rejected">ไม่อนุมัติ (Rejected)</option>
                    <option value="cancelled">ยกเลิกรายการ (Cancelled)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">เบอร์โทรศัพท์ติดต่อ</label>
                  <input
                    type="text"
                    value={bookingForm.contactPhone || ''}
                    onChange={(e) => setBookingForm({ ...bookingForm, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">หมายเหตุเจ้าหน้าที่ / ข้อความถึงผู้จอง</label>
                <input
                  type="text"
                  placeholder="เช่น: อนุมัติแล้ว ติดต่อรับกุญแจห้องที่งานธุรการชั้น 1"
                  value={bookingForm.adminNote || ''}
                  onChange={(e) => setBookingForm({ ...bookingForm, adminNote: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsBookingEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition shadow-sm"
                >
                  บันทึกการจอง
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL 3: ADD / EDIT USER & PERMISSIONS ==================== */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <h2 className="text-base font-bold text-slate-800">
                  {editingUser ? `แก้ไขสิทธิ์และข้อมูล: ${editingUser.displayName}` : 'เพิ่มผู้ใช้งานและกำหนดสิทธิ์ใหม่'}
                </h2>
              </div>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-5 text-xs">
              {/* User Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ชื่อ-นามสกุล / คำนำหน้า *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น: นศพ. สมชาย ใจดี"
                    value={userForm.displayName || ''}
                    onChange={(e) => setUserForm({ ...userForm, displayName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">อีเมลผู้ใช้งาน (Email) *</label>
                  <input
                    type="email"
                    required
                    placeholder="somchai@cpird.in.th"
                    value={userForm.email || ''}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">บทบาทการใช้งาน (Role) *</label>
                  <select
                    value={userForm.role || 'user'}
                    onChange={(e) => handleRoleSelectInForm(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="user">1. ผู้ใช้งานทั่วไป (User - ผู้ใช้)</option>
                    <option value="admin">2. ผู้ดูแลระบบ (Admin - ผู้จัดการ)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ภาควิชา / สังกัด *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น: ชั้นปีที่ 5 หรือ อายุรศาสตร์"
                    value={userForm.department || ''}
                    onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ระดับชั้นปี / ตำแหน่ง</label>
                  <input
                    type="text"
                    placeholder="เช่น: ชั้นปีที่ 5 (Extern)"
                    value={userForm.academicYear || ''}
                    onChange={(e) => setUserForm({ ...userForm, academicYear: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">เบอร์โทรศัพท์ติดต่อ</label>
                  <input
                    type="text"
                    placeholder="081-234-5678"
                    value={userForm.phone || ''}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">สถานะสิทธิ์ในระบบ *</label>
                  <select
                    value={userForm.status || 'active'}
                    onChange={(e) => setUserForm({ ...userForm, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="active">ใช้งานปกติ (Active)</option>
                    <option value="inactive">ระงับการใช้งาน (Inactive / Suspended)</option>
                  </select>
                </div>
              </div>

              {/* Granular Permission Toggles */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                    <Key className="w-4 h-4 text-amber-500" />
                    <span>กำหนดสิทธิ์การใช้งานรายบุคคล (Fine-Grained Permissions)</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const defaults = DEFAULT_ROLE_PERMISSIONS[userForm.role as UserRole || 'user'].defaultPermissions;
                      setUserForm(prev => ({ ...prev, permissions: { ...defaults } }));
                    }}
                    className="text-[11px] font-bold text-teal-700 hover:underline"
                  >
                    รีเซ็ตเป็นค่าเริ่มต้นของบทบาท
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <label className="flex items-center space-x-2 bg-white p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:border-slate-300">
                    <input
                      type="checkbox"
                      checked={!!userForm.permissions?.canApproveBookings}
                      onChange={(e) => setUserForm({
                        ...userForm,
                        permissions: { ...userForm.permissions!, canApproveBookings: e.target.checked }
                      })}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <div>
                      <div className="font-bold text-slate-800">สิทธิ์อนุมัติ/ปฏิเสธคำขอจองห้อง</div>
                      <div className="text-[10px] text-slate-500">สามารถพิจารณาอนุมัติคำขอจองของผู้อื่นได้</div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2 bg-white p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:border-slate-300">
                    <input
                      type="checkbox"
                      checked={!!userForm.permissions?.canManageRooms}
                      onChange={(e) => setUserForm({
                        ...userForm,
                        permissions: { ...userForm.permissions!, canManageRooms: e.target.checked }
                      })}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <div>
                      <div className="font-bold text-slate-800">สิทธิ์เพิ่ม/แก้ไข/ลบ ข้อมูลห้องเรียน</div>
                      <div className="text-[10px] text-slate-500">สามารถจัดการแค็ตตาล็อกห้องและอุปกรณ์</div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2 bg-white p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:border-slate-300">
                    <input
                      type="checkbox"
                      checked={!!userForm.permissions?.canManageUsers}
                      onChange={(e) => setUserForm({
                        ...userForm,
                        permissions: { ...userForm.permissions!, canManageUsers: e.target.checked }
                      })}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <div>
                      <div className="font-bold text-slate-800">สิทธิ์จัดการผู้ใช้งานและสิทธิ์ระบบ</div>
                      <div className="text-[10px] text-slate-500">สามารถแก้ไขบทบาทและให้สิทธิ์ผู้ใช้อื่น</div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2 bg-white p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:border-slate-300">
                    <input
                      type="checkbox"
                      checked={!!userForm.permissions?.canManageElectricity}
                      onChange={(e) => setUserForm({
                        ...userForm,
                        permissions: { ...userForm.permissions!, canManageElectricity: e.target.checked }
                      })}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <div>
                      <div className="font-bold text-slate-800">สิทธิ์บันทึกและจัดการค่าไฟหอพัก</div>
                      <div className="text-[10px] text-slate-500">สามารถจดมิเตอร์และจัดการบิลค่าไฟฟ้า</div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2 bg-white p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:border-slate-300">
                    <input
                      type="checkbox"
                      checked={!!userForm.permissions?.canExportReports}
                      onChange={(e) => setUserForm({
                        ...userForm,
                        permissions: { ...userForm.permissions!, canExportReports: e.target.checked }
                      })}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <div>
                      <div className="font-bold text-slate-800">สิทธิ์ดาวน์โหลดและออกรายงาน CSV</div>
                      <div className="text-[10px] text-slate-500">สามารถดู Analytics และ Export สถิติได้</div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2 bg-white p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:border-slate-300">
                    <input
                      type="checkbox"
                      checked={!!userForm.permissions?.canBookPriorityRooms}
                      onChange={(e) => setUserForm({
                        ...userForm,
                        permissions: { ...userForm.permissions!, canBookPriorityRooms: e.target.checked }
                      })}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <div>
                      <div className="font-bold text-slate-800">สิทธิ์จองห้อง Priority พิเศษ</div>
                      <div className="text-[10px] text-slate-500">จองห้องประชุมใหญ่และห้องสอบได้ก่อน</div>
                    </div>
                  </label>
                </div>

                <div className="pt-2">
                  <label className="block font-bold text-slate-700 mb-1">ชั่วโมงการจองสูงสุดต่อวัน (Max Booking Hours/Day)</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={userForm.permissions?.maxBookingHoursPerDay || 4}
                    onChange={(e) => setUserForm({
                      ...userForm,
                      permissions: { ...userForm.permissions!, maxBookingHoursPerDay: Number(e.target.value) }
                    })}
                    className="w-full sm:w-48 px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 transition shadow-sm"
                >
                  บันทึกข้อมูลผู้ใช้งาน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== APPROVE USER MODAL ==================== */}
      {approveModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">อนุมัติคำขอสมัครสมาชิก</h3>
                  <p className="text-[11px] text-slate-500">กำหนดบทบาทและเปิดการใช้งานระบบ</p>
                </div>
              </div>
              <button
                onClick={() => setApproveModalUser(null)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">ชื่อ-สกุล:</span>
                <span className="font-bold text-slate-900">{approveModalUser.displayName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">อีเมล:</span>
                <span className="font-medium text-slate-700">{approveModalUser.email}</span>
              </div>
              {approveModalUser.studentId && (
                <div className="flex justify-between">
                  <span className="text-slate-500">รหัสนักศึกษา:</span>
                  <span className="font-mono font-bold text-teal-700">{approveModalUser.studentId}</span>
                </div>
              )}
              {approveModalUser.department && (
                <div className="flex justify-between">
                  <span className="text-slate-500">ภาควิชา / สังกัด:</span>
                  <span className="font-medium text-slate-700">{approveModalUser.department}</span>
                </div>
              )}
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  กำหนดระดับบทบาทผู้ใช้งาน (Role)
                </label>
                <select
                  value={approveSelectedRole}
                  onChange={(e) => setApproveSelectedRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="user">👤 ผู้ใช้งานทั่วไป (User - ผู้ใช้ระบบ)</option>
                  <option value="admin">⚡ ผู้ดูแลระบบศูนย์ฯ (System Administrator)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  บันทึกข้อความจาก Admin ถึงผู้สมัคร (ทางเลือก)
                </label>
                <textarea
                  rows={2}
                  value={approveNote}
                  onChange={(e) => setApproveNote(e.target.value)}
                  placeholder="เช่น ยืนยันข้อมูลในระบบแล้ว พร้อมใช้งานห้องเรียนและหอพัก..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setApproveModalUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmApproveUser}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-sm transition"
              >
                ยืนยันการอนุมัติสิทธิ์
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== REJECT USER MODAL ==================== */}
      {rejectModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">ปฏิเสธคำขอสมัครสมาชิก</h3>
                  <p className="text-[11px] text-slate-500">ระบุเหตุผลเพื่อให้ผู้สมัครทราบและแก้ไข</p>
                </div>
              </div>
              <button
                onClick={() => setRejectModalUser(null)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-rose-50/50 p-3 rounded-2xl border border-rose-100 text-xs">
              <p className="text-slate-700">
                คุณกำลังจะปฏิเสธคำขอสมัครของ <strong className="text-rose-900">{rejectModalUser.displayName}</strong> ({rejectModalUser.email})
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block text-slate-700 font-bold">
                เหตุผลที่ไม่อนุมัติ <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={rejectReasonText}
                onChange={(e) => setRejectReasonText(e.target.value)}
                placeholder="ระบุเหตุผล เช่น ไม่พบรหัสนักศึกษาในฐานข้อมูลชั้นคลินิก, กรุณาใช้อีเมลสถาบัน, ข้อมูลไม่ครบถ้วน..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectModalUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectUser}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition"
              >
                ยืนยันการปฏิเสธ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== DELETE CONFIRMATION MODAL ==================== */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">ยืนยันการลบข้อมูล?</h3>
              <p className="text-xs text-slate-500 mt-1">
                คุณกำลังจะลบ <strong className="text-slate-800">{deleteConfirm.title}</strong>{' '}
                ออกจากระบบ ข้อมูลจะถูกลบถาวรจากฐานข้อมูล Firestore
              </p>
            </div>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition"
              >
                ยืนยันลบข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
