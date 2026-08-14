import { UserProfile, UserRole, RolePermissionConfig } from '../types';

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, RolePermissionConfig> = {
  user: {
    role: 'user',
    roleNameTh: 'ผู้ใช้งานทั่วไป (User - ผู้ใช้)',
    description: 'สิทธิ์ระบบผู้ใช้: ยื่นคำขอจองห้องเรียน/ปฏิบัติการ ดูตารางจอง ดูสถิติ และเช็กค่าไฟฟ้าหอพัก',
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
    roleNameTh: 'ผู้ดูแลระบบ (Admin - ผู้จัดการ)',
    description: 'สิทธิ์ระบบผู้จัดการ: อนุมัติ/ปฏิเสธคำขอจองห้อง จัดการห้องเรียน จัดการผู้ใช้งาน และจัดการระบบไฟฟ้า',
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
    studentId: '64010042',
    position: 'นักศึกษาแพทย์ชั้นคลินิก (Extern/ปี 5)',
    phone: '081-234-5678',
    status: 'active',
    approvalStatus: 'approved',
    registrationReason: 'ใช้งานเพื่อจองห้องติวกลุ่มย่อย PBL และบันทึกเวลาขึ้นวอร์ดสูตินรีเวช',
    registeredAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    approvedAt: new Date(Date.now() - 86400000 * 29).toISOString(),
    approvedBy: 'buriram.mec@cpird.in.th',
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
    studentId: 'MEC-ADM-01',
    position: 'เจ้าหน้าที่บริหารงานทั่วไป / ผู้ดูแลระบบ',
    phone: '044-602-000',
    status: 'active',
    approvalStatus: 'approved',
    registrationReason: 'ผู้ดูแลระบบและจัดสรรห้องเรียนศูนย์แพทยศาสตร์ รพ.บุรีรัมย์',
    registeredAt: new Date(Date.now() - 86400000 * 120).toISOString(),
    approvedAt: new Date(Date.now() - 86400000 * 120).toISOString(),
    approvedBy: 'SYSTEM_SUPERADMIN',
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
    studentId: 'DOC-55421',
    position: 'อาจารย์แพทย์ผู้เชี่ยวชาญ',
    phone: '089-876-5432',
    status: 'active',
    approvalStatus: 'approved',
    registrationReason: 'ใช้งานเพื่อจองห้องบรรยายใหญ่และการเรียนการสอน OSCE ประจำภาควิชา',
    registeredAt: new Date(Date.now() - 86400000 * 90).toISOString(),
    approvedAt: new Date(Date.now() - 86400000 * 89).toISOString(),
    approvedBy: 'buriram.mec@cpird.in.th',
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
    studentId: '65010088',
    position: 'นักศึกษาแพทย์ชั้นคลินิก',
    phone: '082-999-1234',
    status: 'active',
    approvalStatus: 'approved',
    registrationReason: 'ใช้งานเพื่อจองห้องฝึกทักษะหัตถการ Skill Lab',
    registeredAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    approvedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    approvedBy: 'buriram.mec@cpird.in.th',
    permissions: DEFAULT_ROLE_PERMISSIONS.user.defaultPermissions,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString()
  },
  {
    uid: 'usr-pending-01',
    displayName: 'นศพ. ภัทรพล เจริญสุข',
    email: 'pattaraporn.c@cpird.in.th',
    role: 'user',
    department: 'ชั้นปีที่ 4 (วอร์ดอายุรกรรม)',
    academicYear: 'ชั้นปีที่ 4',
    studentId: '65010112',
    position: 'นักศึกษาแพทย์ (นศพ.ปี 4)',
    phone: '086-778-9901',
    status: 'inactive',
    approvalStatus: 'pending',
    registrationReason: 'ขอสิทธิ์เข้าใช้งานระบบเพื่อยื่นขอจองห้องติวกลุ่มย่อยก่อนสอบ และดูยอดค่าไฟหอพักแพทย์ชั้น 5',
    registeredAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    permissions: DEFAULT_ROLE_PERMISSIONS.user.defaultPermissions,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    uid: 'usr-pending-02',
    displayName: 'นศพ. ชนิกานต์ ดวงมณี',
    email: 'chanikan.d@cpird.in.th',
    role: 'user',
    department: 'ชั้นปีที่ 5 (วอร์ดกุมารเวชศาสตร์)',
    academicYear: 'ชั้นปีที่ 5',
    studentId: '64010077',
    position: 'นักศึกษาแพทย์ (นศพ.ปี 5)',
    phone: '089-445-6677',
    status: 'inactive',
    approvalStatus: 'pending',
    registrationReason: 'ขอเปิดใช้งานบัญชีเพื่อลงเวลาขึ้นเวรภาคค่ำ และจองห้องคอมพิวเตอร์ค้นคว้าวิจัย',
    registeredAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    permissions: DEFAULT_ROLE_PERMISSIONS.user.defaultPermissions,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];
