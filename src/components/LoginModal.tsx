import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  ShieldCheck, 
  User, 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  GraduationCap, 
  Lock,
  ArrowRight,
  UserPlus
} from 'lucide-react';
import { UserRole, UserProfile } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginWithGoogle: (targetRole?: UserRole) => Promise<void>;
  onSelectRole: (role: UserRole) => void;
  currentUser: UserProfile | null;
  onOpenRegister?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginWithGoogle,
  onSelectRole,
  currentUser,
  onOpenRegister
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await onLoginWithGoogle(selectedRole);
      onClose();
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleQuickRoleSelect = (role: UserRole) => {
    onSelectRole(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-emerald-200 hover:text-white hover:bg-white/10 rounded-full transition"
            title="ปิด"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2.5 bg-emerald-500/20 backdrop-blur border border-emerald-400/30 rounded-2xl text-emerald-300">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded inline-block">
                BURIRAM MEC • LOGIN SYSTEM
              </div>
              <h2 className="text-lg font-bold tracking-tight text-white mt-0.5">
                เข้าสู่ระบบ ศูนย์แพทยศาสตรศึกษาชั้นคลินิก
              </h2>
            </div>
          </div>
          <p className="text-xs text-emerald-100/80">
            ระบบรองรับการเข้าสู่ระบบ 2 รูปแบบสิทธิ์การใช้งาน พร้อมรองรับ Gmail (Google Account)
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          
          {/* Sign Up Promotion Card */}
          {onOpenRegister && (
            <div className="p-3.5 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-teal-600 text-white rounded-xl">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-teal-950">ยังไม่มีบัญชีผู้ใช้งาน (User)?</h4>
                  <p className="text-[11px] text-teal-700">ลงทะเบียนสมาชิกใหม่ รอ Admin อนุมัติสิทธิ์</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRegister();
                }}
                className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl transition shadow-sm shrink-0 flex items-center space-x-1"
              >
                <span>สมัครสมาชิก</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Step 1: Select System Role */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>เลือกประเภทระบบที่ต้องการเข้าใช้งาน (2 ระบบหลัก)</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Role 1: ผู้ใช้ (User) */}
              <button
                type="button"
                onClick={() => setSelectedRole('user')}
                className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                  selectedRole === 'user'
                    ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/30 shadow-md'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                {selectedRole === 'user' && (
                  <div className="absolute top-3 right-3 text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
                <div className="flex items-center space-x-2.5 mb-2">
                  <div className={`p-2 rounded-xl ${selectedRole === 'user' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-1.5 py-0.5 rounded">ระบบที่ 1</span>
                    <h3 className="text-sm font-bold text-slate-800">1. ผู้ใช้ (User)</h3>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  สำหรับนักศึกษาแพทย์ บุคลากร และอาจารย์ผู้ใช้บริการทั่วไป: ยื่นจองห้อง ดูปฏิทิน และเช็กค่าไฟหอพัก
                </p>
              </button>

              {/* Role 2: ระบบผู้จัดการ Admin */}
              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                  selectedRole === 'admin'
                    ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/30 shadow-md'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                {selectedRole === 'admin' && (
                  <div className="absolute top-3 right-3 text-amber-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
                <div className="flex items-center space-x-2.5 mb-2">
                  <div className={`p-2 rounded-xl ${selectedRole === 'admin' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">ระบบที่ 2</span>
                    <h3 className="text-sm font-bold text-slate-800">2. ผู้จัดการ Admin</h3>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  สำหรับเจ้าหน้าที่ผู้ดูแลระบบ: อนุมัติ/ปฏิเสธคำขอจองห้อง จัดการห้อง จัดการผู้ใช้ และจดมิเตอร์ไฟ
                </p>
              </button>

            </div>
          </div>

          {/* Primary Login Action: Gmail / Google Sign-In */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-800 hover:from-emerald-800 hover:to-teal-700 text-white font-bold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center space-x-3 group"
            >
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              </div>
              <span>
                {isLoggingIn ? 'กำลังเชื่อมต่อ Google...' : `เข้าสู่ระบบด้วย Gmail (${selectedRole === 'admin' ? 'สิทธิ์ผู้จัดการ Admin' : 'สิทธิ์ผู้ใช้ User'})`}
              </span>
              <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Quick Demo Mode Selection */}
          <div className="pt-3 border-t border-slate-100">
            <div className="text-center mb-2">
              <span className="text-[11px] font-medium text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                หรือ สลับสิทธิ์ใช้งานทันที (Quick Switch System)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickRoleSelect('user')}
                className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition"
              >
                <User className="w-4 h-4 text-emerald-600" />
                <span>1. เข้าแบบ "ผู้ใช้ (User)"</span>
              </button>

              <button
                onClick={() => handleQuickRoleSelect('admin')}
                className="py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition"
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>2. เข้าแบบ "ผู้จัดการ Admin"</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-600" /> ปลอดภัยด้วย Firebase OAuth Google Security
          </span>
          {onOpenRegister ? (
            <button 
              onClick={() => { onClose(); onOpenRegister(); }}
              className="text-teal-800 hover:underline font-bold"
            >
              สมัครสมาชิก User ใหม่
            </button>
          ) : (
            <span>ศูนย์แพทยศาสตรศึกษาชั้นคลินิก รพ.บุรีรัมย์</span>
          )}
        </div>

      </div>
    </div>
  );
};

