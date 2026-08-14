export type UserRole = 'user' | 'admin';

export interface UserPermissions {
  canApproveBookings: boolean;
  canManageRooms: boolean;
  canManageUsers: boolean;
  canManageElectricity: boolean;
  canExportReports: boolean;
  canBookPriorityRooms: boolean;
  maxBookingHoursPerDay: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  department: string;
  academicYear?: string; // e.g. 'ชั้นปีที่ 4', 'ชั้นปีที่ 5', 'ชั้นปีที่ 6', 'แพทย์ฝึกหัด'
  phone?: string;
  status?: 'active' | 'inactive';
  permissions?: UserPermissions;
  createdAt?: string;
  updatedAt?: string;
}

export interface RolePermissionConfig {
  role: UserRole;
  roleNameTh: string;
  description: string;
  badgeColor: string;
  defaultPermissions: UserPermissions;
  maxAdvanceDays: number;
}

export type RoomCategory = 'lecture' | 'pbl' | 'skill_lab' | 'conference' | 'it' | 'lounge';

export interface RoomEquipment {
  projector: boolean;
  smartBoard: boolean;
  microphone: boolean;
  hybridZoom: boolean;
  airConditioner: boolean;
  osceDummies: boolean;
  computersCount?: number;
}

export interface Room {
  id: string;
  name: string;
  code: string;
  category: RoomCategory;
  categoryName: string;
  building: string;
  floor: string;
  capacity: number;
  description: string;
  image: string;
  equipment: RoomEquipment;
  rules?: string[];
  isAvailable: boolean;
}

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  department: string;
  academicYear?: string;
  title: string;
  purpose: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  attendeesCount: number;
  requestedEquipment: string[];
  contactPhone: string;
  status: BookingStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomAnalytics {
  roomId: string;
  roomName: string;
  totalBookings: number;
  approvedHours: number;
}

export type BillStatus = 'unpaid' | 'pending_verify' | 'paid' | 'overdue';

export interface ElectricityRoom {
  id: string;
  roomNumber: string;
  building: string;
  floor: string;
  occupantName: string;
  phone: string;
  occupantEmail?: string;
  occupant2Name?: string;
  phone2?: string;
  occupant2Email?: string;
  occupantRole: UserRole;
  department: string;
  currentMeter: number;
  ratePerUnit: number;
  baseServiceFee: number;
}

export interface ElectricityBill {
  id: string;
  roomId: string;
  roomNumber: string;
  building: string;
  occupantName: string;
  occupantEmail?: string;
  occupantRole: UserRole;
  department: string;
  monthYear: string; // e.g. '2026-08'
  previousMeter: number;
  currentMeter: number;
  unitsUsed: number;
  ratePerUnit: number;
  baseServiceFee: number;
  discountAmount?: number;
  totalAmount: number;
  dueDate: string;
  status: BillStatus;
  recordedBy: string;
  createdAt: string;
  paidAt?: string;
  paymentMethod?: 'promptpay' | 'cash' | 'bank_transfer';
  slipReference?: string;
  notes?: string;
  isEmailSent?: boolean;
  emailSentAt?: string;
}

export interface DepartmentAnalytics {
  department: string;
  bookingsCount: number;
}

export interface DailyBookingTrend {
  date: string;
  dayName: string;
  bookingsCount: number;
  approvedCount: number;
}
