import { UserProfile, UserRole, RolePermissionConfig } from '../types';

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, RolePermissionConfig> = {
  user: {
    role: 'user',
    roleNameTh: 'ผู้ใช้งานทั่วไป (User - คนใช้)',
    description: 'สิทธิ์ระบบคนใช้: ยื่นคำขอจองห้องเรียน/ปฏิบัติการ ดูตารางจอง ดูสถิติ และเช็กค่าไฟฟ้าหอพัก',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    maxAdvanceDays: 14,
    defaultPermissions: {
      canApproveBookings: false,
      canManageRooms: false,
      canManageUsers: false,
      canManageElectricity: false,
      canExportReports: false,
      canBookPriorityRooms: false,
      maxBookingHoursPerDay: 8
    }
  },
  admin: {
    role: 'admin',
    roleNameTh: 'ผู้ดูแลระบบ (Admin - หลังบ้าน)',
    description: 'สิทธิ์ระบบหลังบ้าน: อนุมัติ/ปฏิเสธคำขอจองห้อง จัดการห้องเรียน จัดการผู้ใช้งาน และจัดการระบบไฟฟ้า',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    maxAdvanceDays: 90,
    defaultPermissions: {
      canApproveBookings: true,
      canManageRooms: true,
      canManageUsers: true,
      canManageElectricity: true,
      canExportReports: true,
      canBookPriorityRooms: true,
      maxBookingHoursPerDay: 24
    }
  }
};

export const INITIAL_USERS: UserProfile[] = [
  {
    uid: 'usr-med-01',
    displayName: 'นศพ. ธนกฤต มั่นคง',
    email: 'tanakrit.m@cpird.in.th',
    role: 'user',
    department: 'ชั้นปีที่ 5',
    academicYear: 'ชั้นปีที่ 5',
    phone: '081-234-5678',
    status: 'active',
    permissions: DEFAULT_ROLE_PERMISSIONS.user.defaultPermissions,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    uid: 'usr-admin-04',
    displayName: 'เจ้าหน้าที่ศูนย์แพทยศาสตร์ (Admin)',
    email: 'buriram.mec@cpird.in.th',
    role: 'admin',
    department: 'ศูนย์แพทยศาสตรศึกษาชั้นคลินิก',
    academicYear: 'ผู้ดูแลระบบ (Admin)',
    phone: '044-602-000',
    status: 'active',
    permissions: DEFAULT_ROLE_PERMISSIONS.admin.defaultPermissions,
    createdAt: new Date(Date.now() - 86400000 * 120).toISOString()
  },
  {
    uid: 'usr-staff-03',
    displayName: 'พญ. นภาพร ศิริรักษ์',
    email: 'napaporn.s@buriram.go.th',
    role: 'user',
    department: 'ภาควิชาสูตินรีเวชศาสตร์',
    academicYear: 'อาจารย์แพทย์',
    phone: '089-876-5432',
    status: 'active',
    permissions: DEFAULT_ROLE_PERMISSIONS.user.defaultPermissions,
    createdAt: new Date(Date.now() - 86400000 * 90).toISOString()
  },
  {
    uid: 'usr-med-05',
    displayName: 'นศพ. พิมพ์นารา วงศ์ไทย',
    email: 'pimnara.w@cpird.in.th',
    role: 'user',
    department: 'ชั้นปีที่ 4',
    academicYear: 'ชั้นปีที่ 4',
    phone: '082-999-1234',
    status: 'active',
    permissions: DEFAULT_ROLE_PERMISSIONS.user.defaultPermissions,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString()
  }
];
