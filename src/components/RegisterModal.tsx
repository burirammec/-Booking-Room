import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  CheckCircle2, 
  GraduationCap, 
  Building2, 
  Phone, 
  Mail, 
  FileText, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  ArrowRight,
  Search,
  Check
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { DEFAULT_ROLE_PERMISSIONS } from '../data/mockUserData';
import { registerUserInFirestore } from '../services/userService';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess?: (userData: UserProfile) => void;
  onRegisterUser?: (userData: UserProfile) => Promise<void>;
  onOpenLogin: () => void;
  existingUsers?: UserProfile[];
  showToast?: (msg: string) => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
  onRegisterUser,
  onOpenLogin,
  existingUsers = [],
  showToast = (msg: string) => console.log(msg)
}) => {
  const [step, setStep] = useState<'form' | 'success' | 'check_status'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchStatusEmail, setSearchStatusEmail] = useState('');
  const [checkedUserResult, setCheckedUserResult] = useState<UserProfile | null | undefined>(undefined);

  // Form State
  const [formData, setFormData] = useState({
    titlePrefix: 'นศพ.',
    firstName: '',
    lastName: '',
    studentId: '',
    email: '',
    phone: '',
    academicYear: 'ชั้นปีที่ 4',
    department: 'ภาควิชาอายุรกรรม',
    customDepartment: '',
    position: 'นักศึกษาแพทย์ชั้นคลินิก',
    registrationReason: 'ขอเข้าใช้งานเพื่อยื่นคำขอจองห้องเรียนกลุ่มย่อย PBL, ฝึกทักษะ Skill Lab และตรวจสอบค่าไฟฟ้าหอพักแพทย์'
  });

  const [submittedUser, setSubmittedUser] = useState<UserProfile | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.studentId) {
      showToast('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    // Check duplicate email
    const duplicate = existingUsers.find(u => u.email.toLowerCase() === formData.email.trim().toLowerCase());
    if (duplicate) {
      showToast(`อีเมลนี้ (${formData.email}) มีการลงทะเบียนในระบบแล้ว`);
      return;
    }

    setIsSubmitting(true);
    try {
      const fullName = `${formData.titlePrefix} ${formData.firstName.trim()} ${formData.lastName.trim()}`;
      const departmentFinal = formData.department === 'อื่นๆ' ? (formData.customDepartment || 'ทั่วไป') : formData.department;

      const newUser: UserProfile = {
        uid: `usr-reg-${Date.now().toString().slice(-6)}`,
        displayName: fullName,
        email: formData.email.trim().toLowerCase(),
        studentId: formData.studentId.trim(),
        role: 'user',
        academicYear: formData.academicYear,
        department: departmentFinal,
        position: `${formData.titlePrefix} (${formData.academicYear})`,
        phone: formData.phone.trim() || '081-000-0000',
        status: 'inactive',
        approvalStatus: 'pending',
        registrationReason: formData.registrationReason.trim(),
        registeredAt: new Date().toISOString(),
        permissions: DEFAULT_ROLE_PERMISSIONS.user.defaultPermissions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Call Firestore registration service and callbacks
      await registerUserInFirestore(newUser);
      if (onRegisterUser) {
        await onRegisterUser(newUser);
      }
      if (onRegisterSuccess) {
        onRegisterSuccess(newUser);
      }
      setSubmittedUser(newUser);
      setStep('success');
      showToast('ส่งคำขอสมัครสมาชิกเรียบร้อยแล้ว รอการอนุมัติจาก Admin');
    } catch (error) {
      console.error('Registration error:', error);
      showToast('เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchStatusEmail.trim()) return;

    const found = existingUsers.find(
      u => u.email.toLowerCase() === searchStatusEmail.trim().toLowerCase() ||
           (u.studentId && u.studentId.trim() === searchStatusEmail.trim())
    );

    setCheckedUserResult(found || null);
  };

  const handleResetForm = () => {
    setFormData({
      titlePrefix: 'นศพ.',
      firstName: '',
      lastName: '',
      studentId: '',
      email: '',
      phone: '',
      academicYear: 'ชั้นปีที่ 4',
      department: 'ภาควิชาอายุรกรรม',
      customDepartment: '',
      position: 'นักศึกษาแพทย์ชั้นคลินิก',
      registrationReason: 'ขอเข้าใช้งานเพื่อยื่นคำขอจองห้องเรียนกลุ่มย่อย PBL, ฝึกทักษะ Skill Lab และตรวจสอบค่าไฟฟ้าหอพักแพทย์'
    });
    setStep('form');
    setSubmittedUser(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-teal-900 via-emerald-800 to-teal-950 text-white p-5 sm:p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-teal-200 hover:text-white hover:bg-white/10 rounded-full transition"
            title="ปิด"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2.5 bg-emerald-500/20 backdrop-blur border border-emerald-400/30 rounded-2xl text-emerald-300">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded inline-block border border-emerald-500/30">
                USER REGISTRATION • ศูนย์แพทยศาสตร์ศึกษา รพ.บุรีรัมย์
              </div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white mt-0.5">
                สมัครสมาชิกผู้ใช้งาน (User Sign Up)
              </h2>
            </div>
          </div>
          <p className="text-xs text-teal-100/90 leading-relaxed">
            สำหรับนักศึกษาแพทย์ บุคลากร และอาจารย์แพทย์ (Admin จะทำการตรวจสอบและอนุมัติสิทธิ์เข้าใช้งาน)
          </p>

          {/* Sub Navigation */}
          <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-teal-800/60">
            <button
              onClick={() => { setStep('form'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                step === 'form' 
                  ? 'bg-white text-teal-900 shadow-sm' 
                  : 'text-teal-200 hover:bg-teal-800/40'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1. แบบฟอร์มสมัครสมาชิก</span>
            </button>

            <button
              onClick={() => { setStep('check_status'); setCheckedUserResult(undefined); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                step === 'check_status' 
                  ? 'bg-white text-teal-900 shadow-sm' 
                  : 'text-teal-200 hover:bg-teal-800/40'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>2. ตรวจสอบสถานะคำขอ</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">

          {/* ================= STEP 1: REGISTRATION FORM ================= */}
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Notice Banner */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-amber-900">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <p className="font-bold">ขั้นตอนการอนุมัติสิทธิ์การใช้งาน (Admin Approval Required):</p>
                  <p className="text-amber-800 mt-0.5">
                    เมื่อท่านกรอกข้อมูลและกดยื่นสมัคร ข้อมูลจะถูกส่งเข้าสู่ระบบผู้จัดการ เจ้าหน้าที่ศูนย์แพทยศาสตร์จะตรวจสอบรหัสนักศึกษา/สังกัดและอนุมัติสิทธิ์เข้าใช้งานภายใน 24 ชม.
                  </p>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-3">
                <div className="font-bold text-slate-800 text-xs flex items-center space-x-1.5 border-b border-slate-100 pb-1.5">
                  <GraduationCap className="w-4 h-4 text-teal-600" />
                  <span>ข้อมูลส่วนตัวและสังกัด</span>
                </div>

                <div className="grid grid-cols-12 gap-2.5">
                  <div className="col-span-12 sm:col-span-3">
                    <label className="block font-bold text-slate-700 mb-1">คำนำหน้า *</label>
                    <select
                      value={formData.titlePrefix}
                      onChange={(e) => setFormData({ ...formData, titlePrefix: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                    >
                      <option value="นศพ.">นศพ.</option>
                      <option value="นพ.">นพ.</option>
                      <option value="พญ.">พญ.</option>
                      <option value="นาย">นาย</option>
                      <option value="นาง">นาง</option>
                      <option value="นางสาว">นางสาว</option>
                      <option value="อ.นพ.">อ.นพ.</option>
                      <option value="อ.พญ.">อ.พญ.</option>
                    </select>
                  </div>

                  <div className="col-span-12 sm:col-span-4">
                    <label className="block font-bold text-slate-700 mb-1">ชื่อจริง *</label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น ธนกฤต"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-5">
                    <label className="block font-bold text-slate-700 mb-1">นามสกุล *</label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น มั่นคง"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      รหัสนักศึกษา / รหัสประจำตัวบุคลากร *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น 65010042 หรือ MEC-01"
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ระดับชั้นปี / สถานภาพ *</label>
                    <select
                      value={formData.academicYear}
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                    >
                      <option value="ชั้นปีที่ 4">นักศึกษาแพทย์ ชั้นปีที่ 4</option>
                      <option value="ชั้นปีที่ 5">นักศึกษาแพทย์ ชั้นปีที่ 5</option>
                      <option value="ชั้นปีที่ 6">นักศึกษาแพทย์ ชั้นปีที่ 6 (Extern)</option>
                      <option value="แพทย์เพิ่มพูนทักษะ (Intern)">แพทย์เพิ่มพูนทักษะ (Intern)</option>
                      <option value="แพทย์ประจำบ้าน (Resident)">แพทย์ประจำบ้าน (Resident)</option>
                      <option value="อาจารย์แพทย์">อาจารย์แพทย์ประจำภาควิชา</option>
                      <option value="เจ้าหน้าที่ศูนย์/บุคลากร">เจ้าหน้าที่ศูนย์แพทยศาสตร์ / บุคลากร</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ภาควิชา / วอร์ดที่หมุนเวียน *</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="ภาควิชาอายุรกรรม">ภาควิชาอายุรกรรม (Medicine)</option>
                      <option value="ภาควิชาศัลยกรรม">ภาควิชาศัลยกรรม (Surgery)</option>
                      <option value="ภาควิชาสูตินรีเวชศาสตร์">ภาควิชาสูตินรีเวชศาสตร์ (OB-GYN)</option>
                      <option value="ภาควิชากุมารเวชศาสตร์">ภาควิชากุมารเวชศาสตร์ (Pediatrics)</option>
                      <option value="ภาควิชาออร์โธปิดิกส์">ภาควิชาออร์โธปิดิกส์ (Orthopedics)</option>
                      <option value="ภาควิชาเวชศาสตร์ฉุกเฉิน">ภาควิชาเวชศาสตร์ฉุกเฉิน (ER)</option>
                      <option value="ศูนย์แพทยศาสตรศึกษาชั้นคลินิก">ศูนย์แพทยศาสตรศึกษาชั้นคลินิก</option>
                      <option value="อื่นๆ">อื่นๆ (ระบุ)</option>
                    </select>
                  </div>

                  {formData.department === 'อื่นๆ' ? (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">ระบุหน่วยงาน/ภาควิชา *</label>
                      <input
                        type="text"
                        required
                        placeholder="ระบุสังกัด"
                        value={formData.customDepartment}
                        onChange={(e) => setFormData({ ...formData, customDepartment: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">เบอร์โทรศัพท์มือถือ *</label>
                      <input
                        type="tel"
                        required
                        placeholder="เช่น 081-234-5678"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  )}
                </div>

                {formData.department === 'อื่นๆ' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">เบอร์โทรศัพท์มือถือ *</label>
                    <input
                      type="tel"
                      required
                      placeholder="เช่น 081-234-5678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                )}
              </div>

              {/* Account Credentials & Contact */}
              <div className="space-y-3 pt-2">
                <div className="font-bold text-slate-800 text-xs flex items-center space-x-1.5 border-b border-slate-100 pb-1.5">
                  <Mail className="w-4 h-4 text-teal-600" />
                  <span>ข้อมูลอีเมลและวัตถุประสงค์</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    อีเมลที่ใช้เข้าสู่ระบบ (แนะนำใช้อีเมลสถาบัน หรือ Gmail) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="เช่น username@cpird.in.th หรือ user@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-[11px]"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    * เมื่อ Admin อนุมัติแล้ว ท่านสามารถใช้ Gmail บัญชีนี้ล็อกอินเข้าสู่ระบบได้ทันที
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    เหตุผลหรือวัตถุประสงค์ในการขอเข้าใช้งาน *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="ระบุเหตุผลความจำเป็น เช่น ใช้เพื่อจองห้องบรรยาย, ติวกลุ่มย่อย PBL, เช็กชั่วโมงเวร, ดูค่าไฟหอพัก"
                    value={formData.registrationReason}
                    onChange={(e) => setFormData({ ...formData, registrationReason: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="text-teal-700 hover:text-teal-900 font-bold text-xs flex items-center space-x-1"
                >
                  <span>มีบัญชีอยู่แล้ว? เข้าสู่ระบบที่นี่</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition flex-1 sm:flex-initial text-center"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 transition shadow-md shadow-teal-700/20 active:scale-[0.98] flex items-center justify-center space-x-2 flex-1 sm:flex-initial"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isSubmitting ? 'กำลังส่งข้อมูล...' : 'ส่งคำขอสมัครสมาชิก'}</span>
                  </button>
                </div>
              </div>

            </form>
          )}

          {/* ================= STEP 2: REGISTRATION SUCCESS SCREEN ================= */}
          {step === 'success' && submittedUser && (
            <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> สถานะ: รอผู้ดูแลระบบ Admin อนุมัติ (Pending Approval)
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">
                  ส่งคำขอสมัครสมาชิกเรียบร้อยแล้ว
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                  ระบบได้บันทึกคำขอของท่านลงในฐานข้อมูลเรียบร้อยแล้ว เจ้าหน้าที่ศูนย์แพทยศาสตร์ศึกษาจะตรวจสอบข้อมูลและเปิดสิทธิ์การใช้งาน
                </p>
              </div>

              {/* Applicant Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">ชื่อ-นามสกุล:</span>
                  <span className="font-bold text-slate-800">{submittedUser.displayName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">รหัสนักศึกษา/บุคลากร:</span>
                  <span className="font-bold text-slate-800 font-mono">{submittedUser.studentId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">อีเมลที่ลงทะเบียน:</span>
                  <span className="font-bold text-teal-800 font-mono">{submittedUser.email}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">ระดับชั้นปี/สังกัด:</span>
                  <span className="font-bold text-slate-800">{submittedUser.academicYear} • {submittedUser.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">เวลายื่นคำขอ:</span>
                  <span className="font-medium text-slate-600">{new Date(submittedUser.registeredAt || '').toLocaleString('th-TH')}</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => { setStep('check_status'); setSearchStatusEmail(submittedUser.email); }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition flex items-center space-x-1.5 w-full sm:w-auto justify-center"
                >
                  <Search className="w-4 h-4" />
                  <span>ตรวจสอบสถานะคำขอ</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition shadow-md w-full sm:w-auto text-center"
                >
                  เสร็จสิ้น / ปิดหน้าต่าง
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: CHECK APPLICATION STATUS ================= */}
          {step === 'check_status' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <form onSubmit={handleCheckStatus} className="space-y-3">
                  <label className="block font-bold text-slate-800">
                    กรอกอีเมล หรือ รหัสนักศึกษา เพื่อตรวจสอบสถานะการอนุมัติ
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="เช่น tanakrit.m@cpird.in.th หรือ 65010042"
                      value={searchStatusEmail}
                      onChange={(e) => setSearchStatusEmail(e.target.value)}
                      className="flex-1 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-mono"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl transition flex items-center space-x-1 shrink-0"
                    >
                      <Search className="w-4 h-4" />
                      <span>ตรวจสอบ</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Status Result Card */}
              {checkedUserResult !== undefined && (
                <div>
                  {checkedUserResult === null ? (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-2 text-rose-800">
                      <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                      <p className="font-bold">ไม่พบข้อมูลการสมัครสมาชิก</p>
                      <p className="text-[11px] text-rose-700">
                        ไม่พบคำขอที่มีอีเมลหรือรหัสดังกล่าวในระบบ ท่านสามารถกรอกแบบฟอร์มเพื่อสมัครใหม่ได้ทันที
                      </p>
                      <button
                        onClick={handleResetForm}
                        className="mt-2 px-4 py-2 bg-rose-700 text-white font-bold rounded-xl text-xs hover:bg-rose-800 transition inline-flex items-center space-x-1.5"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>กรอกแบบฟอร์มสมัครสมาชิก</span>
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{checkedUserResult.displayName}</h4>
                          <p className="text-[11px] text-slate-500">{checkedUserResult.email} • รหัส: {checkedUserResult.studentId || '-'}</p>
                        </div>

                        {/* Status Badge */}
                        {checkedUserResult.approvalStatus === 'approved' && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>อนุมัติแล้ว (Approved)</span>
                          </span>
                        )}

                        {checkedUserResult.approvalStatus === 'pending' && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-amber-600" />
                            <span>รอ Admin อนุมัติ (Pending)</span>
                          </span>
                        )}

                        {checkedUserResult.approvalStatus === 'rejected' && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center space-x-1">
                            <AlertCircle className="w-4 h-4 text-rose-600" />
                            <span>ไม่อนุมัติ (Rejected)</span>
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-[11px]">
                        <div className="flex justify-between text-slate-600">
                          <span>ระดับชั้นปี/สังกัด:</span>
                          <span className="font-bold text-slate-800">{checkedUserResult.academicYear} • {checkedUserResult.department}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>วันที่ยื่นคำขอ:</span>
                          <span>{checkedUserResult.registeredAt ? new Date(checkedUserResult.registeredAt).toLocaleDateString('th-TH') : '-'}</span>
                        </div>
                        {checkedUserResult.approvedAt && (
                          <div className="flex justify-between text-slate-600">
                            <span>วันที่ได้รับอนุมัติ:</span>
                            <span className="text-emerald-700 font-medium">{new Date(checkedUserResult.approvedAt).toLocaleDateString('th-TH')} โดย {checkedUserResult.approvedBy}</span>
                          </div>
                        )}
                        {checkedUserResult.rejectionReason && (
                          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
                            <span className="font-bold block mb-0.5">เหตุผลที่ไม่อนุมัติ:</span>
                            <span>{checkedUserResult.rejectionReason}</span>
                          </div>
                        )}
                      </div>

                      {/* Action following status */}
                      <div className="pt-3 border-t border-slate-100 flex justify-end">
                        {checkedUserResult.approvalStatus === 'approved' ? (
                          <button
                            onClick={() => { onClose(); onOpenLogin(); }}
                            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                          >
                            <span>เข้าสู่ระบบด้วย Gmail ทันที</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <p className="text-[11px] text-slate-500">
                            หากต้องการสอบถามเพิ่มเติม ติดต่อศูนย์แพทยศาสตร์: โทร 044-602-000
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> ระบบจัดเก็บข้อมูลปลอดภัยตามมาตรฐาน PDPA
          </span>
          <button
            onClick={onOpenLogin}
            className="text-teal-800 hover:underline font-bold"
          >
            เข้าสู่ระบบ (Sign In)
          </button>
        </div>

      </div>
    </div>
  );
};
