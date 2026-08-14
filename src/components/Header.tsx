import React from 'react';
import { 
  Building2, 
  Calendar, 
  PlusCircle, 
  BarChart3, 
  CheckSquare, 
  LogIn, 
  LogOut, 
  User, 
  ShieldAlert,
  GraduationCap,
  Zap,
  UserPlus
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserProfile | null;
  onLoginWithGoogle: () => void;
  onLogout: () => void;
  onSelectRole: (role: UserRole) => void;
  onOpenLoginModal?: () => void;
  onOpenRegisterModal?: () => void;
  pendingCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLoginWithGoogle,
  onLogout,
  onSelectRole,
  onOpenLoginModal,
  onOpenRegisterModal,
  pendingCount
}) => {
  return (
    <header className="bg-emerald-950 text-white shadow-lg sticky top-0 z-40 border-b border-emerald-900">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Hospital Name */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('rooms')}>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-500 flex items-center justify-center shadow-md border border-emerald-400/30">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300 bg-emerald-900/90 border border-emerald-700/80 px-2 py-0.5 rounded">
                BURIRAM MEC • MOPH
              </span>
              <span className="text-xs text-emerald-300/80 font-medium">ระบบจองห้องออนไลน์</span>
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-tight">
              ศูนย์แพทยศาสตรศึกษาชั้นคลินิก โรงพยาบาลบุรีรัมย์
            </h1>
          </div>
        </div>

        {/* User Account & 2-Role System Switcher */}
        <div className="flex items-center space-x-3">
          {/* Quick Role Switcher for 2 primary systems */}
          <div className="hidden md:flex items-center bg-emerald-900/90 border border-emerald-800/90 rounded-lg p-1 text-xs">
            <span className="px-2 text-emerald-200/80 font-medium flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> เลือกระบบ:
            </span>
            <button
              onClick={() => onSelectRole('user')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                currentUser?.role !== 'admin'
                  ? 'bg-emerald-600 text-white font-bold shadow-sm'
                  : 'text-emerald-100 hover:bg-emerald-800/80'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>1. ผู้ใช้ (User)</span>
            </button>
            <button
              onClick={() => onSelectRole('admin')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                currentUser?.role === 'admin'
                  ? 'bg-amber-600 text-white font-bold shadow-sm'
                  : 'text-emerald-100 hover:bg-emerald-800/80'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-200" />
              <span>2. ผู้จัดการ Admin</span>
            </button>
          </div>

          {/* User Profile / Registration / Gmail Sign-in */}
          {currentUser ? (
            <div className="flex items-center space-x-2 bg-emerald-900 border border-emerald-800 rounded-lg px-3 py-1.5">
              <img
                src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName)}&background=047857&color=fff`}
                alt={currentUser.displayName}
                className="w-7 h-7 rounded-full border border-emerald-400"
              />
              <div className="text-left hidden sm:block cursor-pointer" onClick={onOpenLoginModal}>
                <div className="text-xs font-semibold text-emerald-50 truncate max-w-[150px] flex items-center gap-1">
                  <span>{currentUser.displayName}</span>
                </div>
                <div className="text-[10px] truncate max-w-[150px] flex items-center gap-1">
                  {currentUser.role === 'admin' ? (
                    <span className="text-amber-300 font-bold bg-amber-950/80 px-1 py-0.2 rounded border border-amber-500/30">
                      ⚡ ผู้จัดการ Admin
                    </span>
                  ) : (
                    <span className="text-emerald-300 font-medium">
                      👤 ผู้ใช้ ({currentUser.department || 'ผู้ใช้งานทั่วไป'})
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onOpenLoginModal}
                title="จัดการระบบล็อกอิน / สิทธิ์"
                className="p-1 text-emerald-300 hover:text-white hover:bg-emerald-800 rounded transition"
              >
                <LogIn className="w-4 h-4" />
              </button>
              <button
                onClick={onLogout}
                title="ออกจากระบบ"
                className="p-1 text-emerald-300 hover:text-rose-300 hover:bg-emerald-800 rounded transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              {onOpenRegisterModal && (
                <button
                  onClick={onOpenRegisterModal}
                  className="flex items-center space-x-1.5 bg-emerald-900/90 hover:bg-emerald-800 text-emerald-200 hover:text-white border border-emerald-700/80 font-bold text-xs px-3 py-2 rounded-xl transition-all active:scale-95 shadow-sm"
                >
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  <span>สมัครสมาชิก (User)</span>
                </button>
              )}
              <button
                onClick={onOpenLoginModal || onLoginWithGoogle}
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-md transition-all active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบ</span>
              </button>
            </div>
          )}
        </div>
      </div>


      {/* Navigation Tabs */}
      <div className="bg-emerald-950/90 border-t border-emerald-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'analytics'
                ? 'bg-emerald-700 text-white shadow-sm font-bold'
                : 'text-emerald-100 hover:bg-emerald-900 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-amber-300" />
            <span>📊 หน้าหลัก: สรุปผลและกราฟวิเคราะห์</span>
          </button>

          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'rooms'
                ? 'bg-emerald-700 text-white shadow-sm font-bold'
                : 'text-emerald-100 hover:bg-emerald-900 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>ห้องทั้งหมด (Catalog)</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'calendar'
                ? 'bg-emerald-700 text-white shadow-sm font-bold'
                : 'text-emerald-100 hover:bg-emerald-900 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>ปฏิทินจองห้อง</span>
          </button>

          <button
            onClick={() => setActiveTab('new-booking')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'new-booking'
                ? 'bg-emerald-700 text-white shadow-sm font-bold'
                : 'text-emerald-100 hover:bg-emerald-900 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-emerald-300" />
            <span>ขอจองห้องเรียน/ปฏิบัติการ</span>
          </button>

          <button
            onClick={() => setActiveTab('electricity')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'electricity'
                ? 'bg-emerald-700 text-white shadow-sm font-bold'
                : 'text-emerald-100 hover:bg-emerald-900 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300/30" />
            <span>ค่าไฟฟ้าหอพัก</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'attendance'
                ? 'bg-emerald-600 text-white shadow-sm font-bold ring-1 ring-emerald-300'
                : 'text-emerald-100 hover:bg-emerald-900 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4 text-amber-300" />
            <span>เข้างาน (ลงเวลา/ตรวจสอบ)</span>
            <span className="bg-amber-400 text-emerald-950 font-black text-[10px] px-1.5 py-0.2 rounded-full">
              {currentUser?.role === 'admin' ? 'Admin & User' : 'User'}
            </span>
          </button>

          {currentUser?.role === 'admin' && (

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors relative ${
                activeTab === 'admin'
                  ? 'bg-amber-600 text-white shadow-sm font-bold'
                  : 'text-amber-300 hover:bg-emerald-900'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-amber-200" />
              <span>ระบบผู้จัดการ Admin (อนุมัติจอง/จัดการ)</span>
              {pendingCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1 animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
