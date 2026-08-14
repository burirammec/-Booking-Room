import React, { useState } from 'react';
import { 
  ElectricityRoom, 
  ElectricityBill, 
  UserProfile, 
  BillStatus, 
  UserRole 
} from '../types';
import { 
  Zap, 
  FileText, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Download, 
  Printer, 
  Building2, 
  User, 
  CreditCard, 
  QrCode, 
  DollarSign, 
  Settings, 
  Trash2, 
  Edit3, 
  BarChart3, 
  Check, 
  X, 
  Calendar,
  Phone,
  ArrowRight,
  ShieldAlert,
  Mail,
  Send,
  CheckCircle,
  Inbox,
  Eye,
  SlidersHorizontal,
  Sliders,
  Calculator,
  Percent,
  GraduationCap,
  Stethoscope,
  Sparkles,
  RefreshCw,
  Users
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';

interface ElectricityManagementProps {
  currentUser: UserProfile | null;
  rooms: ElectricityRoom[];
  bills: ElectricityBill[];
  onAddBill: (bill: ElectricityBill) => Promise<void>;
  onUpdateBill: (billId: string, data: Partial<ElectricityBill>) => Promise<void>;
  onDeleteBill: (billId: string) => Promise<void>;
  onAddRoom: (room: ElectricityRoom) => Promise<void>;
  onUpdateRoom: (roomId: string, data: Partial<ElectricityRoom>) => Promise<void>;
  onDeleteRoom: (roomId: string) => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'info') => void;
}

export const ElectricityManagement: React.FC<ElectricityManagementProps> = ({
  currentUser,
  rooms,
  bills,
  onAddBill,
  onUpdateBill,
  onDeleteBill,
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<'bills' | 'record' | 'rooms' | 'analytics'>('bills');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  
  // Selected Bill for Payment or Viewing Invoice
  const [selectedBillForPayment, setSelectedBillForPayment] = useState<ElectricityBill | null>(null);
  const [selectedBillForInvoice, setSelectedBillForInvoice] = useState<ElectricityBill | null>(null);
  const [slipReference, setSlipReference] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Email Dispatch Modal States
  const [selectedBillForEmail, setSelectedBillForEmail] = useState<ElectricityBill | null>(null);
  const [emailToAddress, setEmailToAddress] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailMessage, setEmailMessage] = useState<string>('');
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);

  // Batch Email Dispatch State
  const [isBatchEmailModalOpen, setIsBatchEmailModalOpen] = useState<boolean>(false);
  const [isBatchSending, setIsBatchSending] = useState<boolean>(false);

  const handleOpenEmailModal = (bill: ElectricityBill) => {
    setSelectedBillForEmail(bill);
    const defaultEmail = bill.occupantEmail || 
      (bill.occupantName.includes('ธนกฤต') ? 'tanakrit.m@cpird.in.th' :
       bill.occupantName.includes('พิมพ์นารา') ? 'pimnara.w@cpird.in.th' :
       bill.occupantName.includes('กิตติพงษ์') ? 'kittipong.s@cpird.in.th' :
       bill.occupantName.includes('ชัยวัฒน์') ? 'chaiwat.s@cpird.in.th' :
       bill.occupantName.includes('ณิชชา') ? 'nichcha.w@cpird.in.th' :
       'occupant@cpird.in.th');

    setEmailToAddress(defaultEmail);
    setEmailSubject(`[ใบแจ้งหนี้ค่าไฟฟ้า] ศูนย์แพทยฯ รพ.บุรีรัมย์ - ห้อง ${bill.roomNumber} (${bill.monthYear})`);
    setEmailMessage(
`เรียน ${bill.occupantName} (${bill.department})

ศูนย์แพทยศาสตรศึกษาชั้นคลินิก โรงพยาบาลบุรีรัมย์ ขอส่งใบแจ้งหนี้ค่าไฟฟ้าประจำเดือน ${bill.monthYear}

รายละเอียดใบแจ้งหนี้:
• ห้องพัก: ${bill.roomNumber} (${bill.building})
• เลขมิเตอร์เดิม: ${bill.previousMeter} | เลขมิเตอร์ใหม่: ${bill.currentMeter}
• จำนวนหน่วยใช้ไฟ: ${bill.unitsUsed} kWh
• ยอดรวมทั้งสิ้น: ${bill.totalAmount.toLocaleString()} บาท
• กำหนดชำระเงินภายใน: ${bill.dueDate}

ท่านสามารถเปิดดูเอกสารใบแจ้งหนี้ตัวเต็ม สแกน QR Code ชำระเงิน หรือแจ้งชำระเงินออนไลน์ได้ที่ระบบบริการหอพักนักศึกษาแพทย์ MEC`
    );
  };

  const handleSendSingleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillForEmail || !emailToAddress) {
      showToast('กรุณากรอกอีเมลผู้รับ', 'info');
      return;
    }
    setIsSendingEmail(true);
    setTimeout(async () => {
      const nowISO = new Date().toISOString();
      await onUpdateBill(selectedBillForEmail.id, {
        isEmailSent: true,
        emailSentAt: nowISO,
        occupantEmail: emailToAddress
      });
      setIsSendingEmail(false);
      setSelectedBillForEmail(null);
      showToast(`จัดส่ง Email ใบแจ้งหนี้ไปยัง ${emailToAddress} สำเร็จเรียบร้อย!`, 'success');
    }, 600);
  };

  const handleBatchSendEmails = async () => {
    const pendingBills = filteredBills.filter(b => b.status === 'unpaid' || !b.isEmailSent);
    if (pendingBills.length === 0) {
      showToast('ไม่มีใบแจ้งหนี้ค้างส่งในขณะนี้', 'info');
      return;
    }
    setIsBatchSending(true);
    setTimeout(async () => {
      const nowISO = new Date().toISOString();
      for (const bill of pendingBills) {
        const targetEmail = bill.occupantEmail || 'occupant@cpird.in.th';
        await onUpdateBill(bill.id, {
          isEmailSent: true,
          emailSentAt: nowISO,
          occupantEmail: targetEmail
        });
      }
      setIsBatchSending(false);
      setIsBatchEmailModalOpen(false);
      showToast(`จัดส่ง Email แจ้งหนี้ให้อัตโนมัติสำหรับผู้พักอาศัยจำนวน ${pendingBills.length} ท่านสำเร็จแล้ว!`, 'success');
    }, 1000);
  };

  // Rate Settings per Occupant Category (นศพ. / แพทย์ประจำบ้าน / บุคลากร)
  interface RoleRateConfig {
    studentRate: number; // นศพ.
    studentFee: number;
    residentRate: number; // แพทย์ประจำบ้าน / Extern
    residentFee: number;
    staffRate: number; // บุคลากร
    staffFee: number;
  }

  const DEFAULT_ROLE_RATES: RoleRateConfig = {
    studentRate: 5.0,
    studentFee: 30,
    residentRate: 5.5,
    residentFee: 30,
    staffRate: 6.0,
    staffFee: 30
  };

  // Helper to detect occupant category
  const getRoomRoleCategory = (room: { department?: string; occupantName?: string; occupantRole?: string }): 'student' | 'resident' | 'staff' => {
    const dept = (room.department || '').toLowerCase();
    const occ = (room.occupantName || '').toLowerCase();
    const role = room.occupantRole;

    if (role === 'admin' || role === 'staff' || dept.includes('อาจารย์') || dept.includes('บุคลากร') || dept.includes('เจ้าหน้าที่')) {
      return 'staff';
    }
    if (
      dept.includes('แพทย์ประจำบ้าน') ||
      dept.includes('resident') ||
      dept.includes('extern') ||
      dept.includes('intern') ||
      dept.includes('ศัลยศาสตร์') ||
      dept.includes('อายุรศาสตร์') ||
      dept.includes('กุมาร') ||
      dept.includes('สูติ') ||
      dept.includes('ออร์โธ') ||
      dept.includes('พยาธิ') ||
      occ.startsWith('นพ.') ||
      occ.startsWith('พญ.') ||
      occ.startsWith('dr.')
    ) {
      return 'resident';
    }
    return 'student';
  };

  // Meter Reading Entry Form & Global Rates State
  const [meterMonthYear, setMeterMonthYear] = useState('2026-08');
  const [meterDueDate, setMeterDueDate] = useState('2026-08-25');
  
  const [roleRates, setRoleRates] = useState<RoleRateConfig>(() => {
    const saved = localStorage.getItem('mec_dorm_role_rates');
    if (saved) {
      try {
        return { ...DEFAULT_ROLE_RATES, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_ROLE_RATES;
      }
    }
    return DEFAULT_ROLE_RATES;
  });

  const [ratePerUnit, setRatePerUnit] = useState<number>(() => {
    const saved = localStorage.getItem('mec_dorm_rate_per_unit');
    return saved ? Number(saved) : 5.0;
  });
  const [baseServiceFee, setBaseServiceFee] = useState<number>(() => {
    const saved = localStorage.getItem('mec_dorm_base_service_fee');
    return saved ? Number(saved) : 30;
  });
  const [batchMeterReadings, setBatchMeterReadings] = useState<Record<string, number>>({});

  // Rate Settings Modal State
  const [isRateSettingsModalOpen, setIsRateSettingsModalOpen] = useState(false);
  const [tempRoleRates, setTempRoleRates] = useState<RoleRateConfig>(roleRates);
  const [activeRateRoleTab, setActiveRateRoleTab] = useState<'student' | 'resident' | 'staff'>('student');
  const [rateApplyMode, setRateApplyMode] = useState<'smart_by_role' | 'student_only' | 'resident_only' | 'all_rooms_student'>('smart_by_role');

  // Edit Bill Modal State
  const [editingBill, setEditingBill] = useState<ElectricityBill | null>(null);
  const [isEditBillModalOpen, setIsEditBillModalOpen] = useState(false);
  const [billEditForm, setBillEditForm] = useState<{
    previousMeter: number;
    currentMeter: number;
    ratePerUnit: number;
    baseServiceFee: number;
    discountAmount: number;
    totalAmount: number;
    dueDate: string;
    status: BillStatus;
    notes: string;
  }>({
    previousMeter: 0,
    currentMeter: 0,
    ratePerUnit: 5.0,
    baseServiceFee: 30,
    discountAmount: 0,
    totalAmount: 0,
    dueDate: '2026-08-25',
    status: 'unpaid',
    notes: ''
  });

  const handleOpenRateSettingsModal = () => {
    setTempRoleRates({ ...roleRates });
    setRateApplyMode('smart_by_role');
    setIsRateSettingsModalOpen(true);
  };

  const handleSaveGlobalRates = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanRates: RoleRateConfig = {
      studentRate: Math.max(0, Number(tempRoleRates.studentRate) || 0),
      studentFee: Math.max(0, Number(tempRoleRates.studentFee) || 0),
      residentRate: Math.max(0, Number(tempRoleRates.residentRate) || 0),
      residentFee: Math.max(0, Number(tempRoleRates.residentFee) || 0),
      staffRate: Math.max(0, Number(tempRoleRates.staffRate) || 0),
      staffFee: Math.max(0, Number(tempRoleRates.staffFee) || 0)
    };

    setRoleRates(cleanRates);
    localStorage.setItem('mec_dorm_role_rates', JSON.stringify(cleanRates));
    setRatePerUnit(cleanRates.studentRate);
    setBaseServiceFee(cleanRates.studentFee);
    localStorage.setItem('mec_dorm_rate_per_unit', cleanRates.studentRate.toString());
    localStorage.setItem('mec_dorm_base_service_fee', cleanRates.studentFee.toString());

    if (rooms && rooms.length > 0) {
      let studentUpdated = 0;
      let residentUpdated = 0;
      let staffUpdated = 0;

      for (const r of rooms) {
        const cat = getRoomRoleCategory(r);
        let targetRate = r.ratePerUnit;
        let targetFee = r.baseServiceFee;
        let shouldUpdate = false;

        if (rateApplyMode === 'smart_by_role') {
          shouldUpdate = true;
          if (cat === 'resident') {
            targetRate = cleanRates.residentRate;
            targetFee = cleanRates.residentFee;
            residentUpdated++;
          } else if (cat === 'staff') {
            targetRate = cleanRates.staffRate;
            targetFee = cleanRates.staffFee;
            staffUpdated++;
          } else {
            targetRate = cleanRates.studentRate;
            targetFee = cleanRates.studentFee;
            studentUpdated++;
          }
        } else if (rateApplyMode === 'student_only' && cat === 'student') {
          shouldUpdate = true;
          targetRate = cleanRates.studentRate;
          targetFee = cleanRates.studentFee;
          studentUpdated++;
        } else if (rateApplyMode === 'resident_only' && cat === 'resident') {
          shouldUpdate = true;
          targetRate = cleanRates.residentRate;
          targetFee = cleanRates.residentFee;
          residentUpdated++;
        } else if (rateApplyMode === 'all_rooms_student') {
          shouldUpdate = true;
          targetRate = cleanRates.studentRate;
          targetFee = cleanRates.studentFee;
          studentUpdated++;
        }

        if (shouldUpdate) {
          await onUpdateRoom(r.id, { ratePerUnit: targetRate, baseServiceFee: targetFee });
        }
      }

      if (rateApplyMode === 'smart_by_role') {
        showToast(
          `บันทึกสำเร็จ! อัปเดตอัตราค่าไฟ นศพ. ${cleanRates.studentRate} บ. (${studentUpdated} ห้อง) และแพทย์ประจำบ้าน ${cleanRates.residentRate} บ. (${residentUpdated} ห้อง) เรียบร้อย`,
          'success'
        );
      } else if (rateApplyMode === 'student_only') {
        showToast(`บันทึกอัตราค่าไฟ นศพ. ${cleanRates.studentRate} บ./หน่วย (${studentUpdated} ห้อง) สำเร็จ`, 'success');
      } else if (rateApplyMode === 'resident_only') {
        showToast(`บันทึกอัตราค่าไฟ แพทย์ประจำบ้าน ${cleanRates.residentRate} บ./หน่วย (${residentUpdated} ห้อง) สำเร็จ`, 'success');
      } else {
        showToast(`บันทึกอัตราค่าไฟ ${cleanRates.studentRate} บ./หน่วย ให้กับห้องพักทั้งหมดเรียบร้อย`, 'success');
      }
    } else {
      showToast(`บันทึกการตั้งค่าอัตราค่าไฟส่วนกลางเรียบร้อย`, 'success');
    }

    setIsRateSettingsModalOpen(false);
  };

  const handleOpenEditBill = (bill: ElectricityBill) => {
    setEditingBill(bill);
    setBillEditForm({
      previousMeter: bill.previousMeter,
      currentMeter: bill.currentMeter,
      ratePerUnit: bill.ratePerUnit,
      baseServiceFee: bill.baseServiceFee,
      discountAmount: bill.discountAmount || 0,
      totalAmount: bill.totalAmount,
      dueDate: bill.dueDate,
      status: bill.status,
      notes: bill.notes || ''
    });
    setIsEditBillModalOpen(true);
  };

  const handleSaveEditedBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBill) return;

    const prev = Number(billEditForm.previousMeter) || 0;
    const curr = Number(billEditForm.currentMeter) || 0;
    const units = Math.max(0, curr - prev);
    const rate = Math.max(0, Number(billEditForm.ratePerUnit) || 0);
    const fee = Math.max(0, Number(billEditForm.baseServiceFee) || 0);
    const discount = Math.max(0, Number(billEditForm.discountAmount) || 0);
    const calculatedTotal = Math.max(0, (units * rate) + fee - discount);
    const finalTotal = billEditForm.totalAmount !== undefined && billEditForm.totalAmount !== null 
      ? Number(billEditForm.totalAmount) 
      : calculatedTotal;

    await onUpdateBill(editingBill.id, {
      previousMeter: prev,
      currentMeter: curr,
      unitsUsed: units,
      ratePerUnit: rate,
      baseServiceFee: fee,
      discountAmount: discount,
      totalAmount: finalTotal,
      dueDate: billEditForm.dueDate || editingBill.dueDate,
      status: billEditForm.status || editingBill.status,
      notes: billEditForm.notes || ''
    });

    if (curr > 0 && editingBill.monthYear === '2026-08') {
      await onUpdateRoom(editingBill.roomId, { currentMeter: curr });
    }

    showToast(`ปรับปรุงยอดค่าไฟห้อง ${editingBill.roomNumber} ประจำรอบเดือน ${editingBill.monthYear} เรียบร้อยแล้ว`, 'success');
    setIsEditBillModalOpen(false);
    setEditingBill(null);
  };

  // Room Edit/Create Modal State
  const [editingRoom, setEditingRoom] = useState<ElectricityRoom | null>(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);

  // Dorm Building Management State
  const [buildings, setBuildings] = useState<string[]>(() => {
    const saved = localStorage.getItem('mec_dorm_buildings_list');
    let initialList = [
      'อาคารหอพักนักศึกษาแพทย์ 1 (MEC Dorm 1)',
      'อาคารหอพักแพทย์ประจำบ้าน 2 (MEC Dorm 2)'
    ];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) initialList = parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return initialList;
  });

  // Sync building list with existing rooms
  React.useEffect(() => {
    if (rooms && rooms.length > 0) {
      const existingInRooms = rooms.map(r => r.building).filter(Boolean);
      const combined = Array.from(new Set([...buildings, ...existingInRooms]));
      if (combined.length !== buildings.length) {
        setBuildings(combined);
        localStorage.setItem('mec_dorm_buildings_list', JSON.stringify(combined));
      }
    }
  }, [rooms]);

  const saveBuildingsList = (newList: string[]) => {
    setBuildings(newList);
    localStorage.setItem('mec_dorm_buildings_list', JSON.stringify(newList));
  };

  // Building Management Modal state
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [newBuildingInput, setNewBuildingInput] = useState('');
  const [editingBuildingOldName, setEditingBuildingOldName] = useState<string | null>(null);
  const [editingBuildingNewName, setEditingBuildingNewName] = useState('');
  const [selectedBuildingFilter, setSelectedBuildingFilter] = useState<string>('all');

  const handleAddBuildingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newBuildingInput.trim();
    if (!trimmed) {
      showToast('กรุณากรอกชื่ออาคารหอพัก', 'info');
      return;
    }
    if (buildings.includes(trimmed)) {
      showToast('มีชื่ออาคารหอพักนี้อยู่ในระบบแล้ว', 'info');
      return;
    }
    const updated = [...buildings, trimmed];
    saveBuildingsList(updated);
    setNewBuildingInput('');
    showToast(`เพิ่มอาคาร "${trimmed}" สำเร็จเรียบร้อย!`, 'success');
  };

  const handleSaveEditBuilding = async (oldName: string) => {
    const trimmed = editingBuildingNewName.trim();
    if (!trimmed) {
      showToast('กรุณากรอกชื่ออาคารใหม่', 'info');
      return;
    }
    if (trimmed !== oldName && buildings.includes(trimmed)) {
      showToast('มีชื่ออาคารหอพักนี้อยู่ในระบบแล้ว', 'info');
      return;
    }

    const updated = buildings.map(b => b === oldName ? trimmed : b);
    saveBuildingsList(updated);

    // Cascading update to all rooms with old building name
    const affectedRooms = rooms.filter(r => r.building === oldName);
    for (const r of affectedRooms) {
      await onUpdateRoom(r.id, { building: trimmed });
    }

    // Cascading update to all bills with old building name
    const affectedBills = bills.filter(b => b.building === oldName);
    for (const b of affectedBills) {
      await onUpdateBill(b.id, { building: trimmed });
    }

    setEditingBuildingOldName(null);
    setEditingBuildingNewName('');
    showToast(`แก้ไขชื่ออาคารเป็น "${trimmed}" เรียบร้อย (ปรับปรุง ${affectedRooms.length} ห้องพัก)`, 'success');
  };

  const handleDeleteBuilding = async (buildingToDelete: string) => {
    const roomsInBuilding = rooms.filter(r => r.building === buildingToDelete);
    if (roomsInBuilding.length > 0) {
      if (!confirm(`มีห้องพักจำนวน ${roomsInBuilding.length} ห้องอยู่ในอาคาร "${buildingToDelete}"\nคุณต้องการยืนยันลบชื่ออาคารนี้ใช่หรือไม่?`)) {
        return;
      }
    } else {
      if (!confirm(`ต้องการยืนยันลบชื่ออาคาร "${buildingToDelete}" ใช่หรือไม่?`)) {
        return;
      }
    }

    const updated = buildings.filter(b => b !== buildingToDelete);
    saveBuildingsList(updated);
    showToast(`ลบอาคาร "${buildingToDelete}" เรียบร้อยแล้ว`, 'success');
  };

  const [roomForm, setRoomForm] = useState<Partial<ElectricityRoom>>({
    roomNumber: '',
    building: buildings[0] || 'อาคารหอพักนักศึกษาแพทย์ 1 (MEC Dorm 1)',
    floor: 'ชั้น 2',
    occupantName: '',
    phone: '',
    occupant2Name: '',
    phone2: '',
    occupantRole: 'student',
    department: 'ชั้นปีที่ 4',
    currentMeter: 1000,
    ratePerUnit: 5.0,
    baseServiceFee: 30
  });

  const isAdminOrStaff = currentUser?.role === 'admin' || currentUser?.role === 'staff';

  // Filter bills
  const filteredBills = bills.filter(b => {
    const matchesSearch = 
      b.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.occupantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.building.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMonth = selectedMonth === 'all' || b.monthYear === selectedMonth;
    const matchesStatus = selectedStatusFilter === 'all' || b.status === selectedStatusFilter;

    return matchesSearch && matchesMonth && matchesStatus;
  });

  // Filter rooms by search and building
  const filteredRooms = rooms.filter(r => {
    const matchesSearch = 
      r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.occupantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.occupant2Name && r.occupant2Name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.building.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBuilding = selectedBuildingFilter === 'all' || r.building === selectedBuildingFilter;
    return matchesSearch && matchesBuilding;
  });

  // Unique Month options
  const monthOptions = Array.from(new Set(bills.map(b => b.monthYear))).sort().reverse();
  if (!monthOptions.includes('2026-08')) monthOptions.unshift('2026-08');

  // Key KPI Metrics
  const augustBills = bills.filter(b => b.monthYear === (selectedMonth === 'all' ? '2026-08' : selectedMonth));
  const totalRevenueCollected = augustBills.filter(b => b.status === 'paid').reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalUnpaidAmount = augustBills.filter(b => b.status === 'unpaid' || b.status === 'overdue').reduce((acc, curr) => acc + curr.totalAmount, 0);
  const unpaidCount = augustBills.filter(b => b.status === 'unpaid' || b.status === 'overdue').length;
  const pendingVerifyCount = augustBills.filter(b => b.status === 'pending_verify').length;
  const totalUnitsConsumed = augustBills.reduce((acc, curr) => acc + curr.unitsUsed, 0);

  // Status Badge Helper
  const getStatusBadge = (status: BillStatus) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-lg border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>ชำระเงินแล้ว</span>
          </span>
        );
      case 'pending_verify':
        return (
          <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-800 text-xs font-semibold px-2.5 py-1 rounded-lg border border-sky-300">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            <span>รอตรวจสอบ Slip</span>
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-xs font-semibold px-2.5 py-1 rounded-lg border border-rose-300">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>เกินกำหนดชำระ</span>
          </span>
        );
      case 'unpaid':
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-lg border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>รอการชำระเงิน</span>
          </span>
        );
    }
  };

  // Submit Payment Handler
  const handleConfirmPayment = async () => {
    if (!selectedBillForPayment) return;
    setIsSubmittingPayment(true);
    try {
      await onUpdateBill(selectedBillForPayment.id, {
        status: isAdminOrStaff ? 'paid' : 'pending_verify',
        paidAt: new Date().toISOString(),
        paymentMethod: 'promptpay',
        slipReference: slipReference || `SLIP-${Date.now().toString().slice(-6)}`,
        notes: isAdminOrStaff ? 'ชำระและยืนยันโดยเจ้าหน้าที่' : 'แจ้งชำระเงินเรียบร้อย รอตรวจสอบ'
      });
      showToast(
        isAdminOrStaff 
          ? `ยืนยันรับชำระเงินห้อง ${selectedBillForPayment.roomNumber} เรียบร้อย` 
          : `ส่งหลักฐานการชำระเงินห้อง ${selectedBillForPayment.roomNumber} เรียบร้อยแล้ว`,
        'success'
      );
      setSelectedBillForPayment(null);
      setSlipReference('');
    } catch (err) {
      showToast('เกิดข้อผิดพลาดในการบันทึกชำระเงิน', 'info');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Submit Batch Meter Readings
  const handleSaveBatchMeters = async () => {
    let createdCount = 0;
    for (const room of rooms) {
      const newMeter = batchMeterReadings[room.id];
      if (newMeter !== undefined && newMeter > room.currentMeter) {
        const cat = getRoomRoleCategory(room);
        const roomSpecificRate = room.ratePerUnit !== undefined && room.ratePerUnit > 0
          ? room.ratePerUnit
          : (cat === 'resident' ? roleRates.residentRate : (cat === 'staff' ? roleRates.staffRate : roleRates.studentRate));
        const roomSpecificFee = room.baseServiceFee !== undefined
          ? room.baseServiceFee
          : (cat === 'resident' ? roleRates.residentFee : (cat === 'staff' ? roleRates.staffFee : roleRates.studentFee));

        const unitsUsed = newMeter - room.currentMeter;
        const totalAmount = (unitsUsed * roomSpecificRate) + roomSpecificFee;
        
        const newBill: ElectricityBill = {
          id: `bill-${meterMonthYear}-${room.roomNumber}`,
          roomId: room.id,
          roomNumber: room.roomNumber,
          building: room.building,
          occupantName: room.occupantName,
          occupantRole: room.occupantRole || (cat === 'student' ? 'student' : 'user'),
          department: room.department,
          monthYear: meterMonthYear,
          previousMeter: room.currentMeter,
          currentMeter: newMeter,
          unitsUsed,
          ratePerUnit: roomSpecificRate,
          baseServiceFee: roomSpecificFee,
          totalAmount,
          dueDate: meterDueDate,
          status: 'unpaid',
          recordedBy: currentUser?.displayName || 'เจ้าหน้าที่ศูนย์แพทยศาสตร์',
          createdAt: new Date().toISOString(),
          notes: `รอบบิลประจำเดือน ${meterMonthYear} (${cat === 'resident' ? 'แพทย์ประจำบ้าน' : 'นศพ.'} @${roomSpecificRate} บ./หน่วย)`
        };

        await onAddBill(newBill);
        await onUpdateRoom(room.id, { currentMeter: newMeter });
        createdCount++;
      }
    }

    if (createdCount > 0) {
      showToast(`จดบันทึกมิเตอร์และสร้างใบแจ้งหนี้สำเร็จ ${createdCount} ห้อง`, 'success');
      setBatchMeterReadings({});
      setActiveTab('bills');
    } else {
      showToast('โปรดกรอกเลขมิเตอร์ใหม่ที่มากกว่ามิเตอร์เดิมอย่างน้อย 1 ห้อง', 'info');
    }
  };

  // Room Save Handler
  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomForm.roomNumber || !roomForm.occupantName) {
      showToast('กรุณากรอกเลขห้องและชื่อ-สกุลของผู้พักอาศัย', 'info');
      return;
    }

    const cat = getRoomRoleCategory({
      department: roomForm.department,
      occupantName: roomForm.occupantName,
      occupantRole: roomForm.occupantRole
    });

    const fallbackRate = cat === 'resident' 
      ? roleRates.residentRate 
      : cat === 'staff' 
        ? roleRates.staffRate 
        : roleRates.studentRate;

    const fallbackFee = cat === 'resident' 
      ? roleRates.residentFee 
      : cat === 'staff' 
        ? roleRates.staffFee 
        : roleRates.studentFee;

    const cleanRate = roomForm.ratePerUnit !== undefined && !isNaN(Number(roomForm.ratePerUnit)) && Number(roomForm.ratePerUnit) > 0
      ? Number(roomForm.ratePerUnit)
      : fallbackRate;

    const cleanFee = roomForm.baseServiceFee !== undefined && !isNaN(Number(roomForm.baseServiceFee))
      ? Number(roomForm.baseServiceFee)
      : fallbackFee;

    const newRoom: ElectricityRoom = {
      id: editingRoom ? editingRoom.id : `dorm-${roomForm.roomNumber}`,
      roomNumber: roomForm.roomNumber || '201',
      building: roomForm.building || buildings[0] || 'อาคารหอพักนักศึกษาแพทย์ 1 (MEC Dorm 1)',
      floor: roomForm.floor || 'ชั้น 2',
      occupantName: roomForm.occupantName || 'ผู้พักอาศัย',
      phone: roomForm.phone || '-',
      occupantEmail: roomForm.occupantEmail || '',
      occupant2Name: roomForm.occupant2Name || '',
      phone2: roomForm.phone2 || '',
      occupantRole: roomForm.occupantRole || (cat === 'student' ? 'student' : 'user'),
      department: roomForm.department || (cat === 'resident' ? 'แพทย์ประจำบ้าน' : 'นักศึกษาแพทย์'),
      currentMeter: Number(roomForm.currentMeter) || 1000,
      ratePerUnit: cleanRate,
      baseServiceFee: cleanFee
    };

    if (editingRoom) {
      await onUpdateRoom(editingRoom.id, newRoom);
      showToast(`แก้ไขข้อมูลและอัตราค่าไฟห้อง ${newRoom.roomNumber} (${cleanRate} บ./หน่วย) สำเร็จ`, 'success');
    } else {
      await onAddRoom(newRoom);
      showToast(`เพิ่มห้องพัก ${newRoom.roomNumber} (${cleanRate} บ./หน่วย) เรียบร้อยแล้ว`, 'success');
    }

    setIsRoomModalOpen(false);
    setEditingRoom(null);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (currentUser?.role !== 'admin') {
      showToast('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถดาวน์โหลดรายงาน CSV ได้', 'info');
      return;
    }
    const headers = ['เดือน/ปี', 'เลขห้อง', 'อาคาร', 'ผู้พักอาศัย', 'สังกัด/ชั้นปี', 'มิเตอร์เดิม', 'มิเตอร์ใหม่', 'หน่วยที่ใช้', 'อัตรา/หน่วย', 'ค่าบริการ', 'รวมเงิน(บาท)', 'สถานะ', 'กำหนดชำระ'];
    const rows = filteredBills.map(b => [
      b.monthYear,
      b.roomNumber,
      `"${b.building}"`,
      `"${b.occupantName}"`,
      `"${b.department}"`,
      b.previousMeter,
      b.currentMeter,
      b.unitsUsed,
      b.ratePerUnit,
      b.baseServiceFee,
      b.totalAmount,
      b.status === 'paid' ? 'ชำระแล้ว' : b.status === 'pending_verify' ? 'รอตรวจสอบ' : 'ยังไม่ชำระ',
      b.dueDate
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `electricity_bills_buriram_mec_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('ดาวน์โหลดรายงานค่าไฟฟ้า CSV เรียบร้อยแล้ว', 'success');
  };

  // Chart Data
  const roomUsageChartData = augustBills.map(b => ({
    room: `ห้อง ${b.roomNumber}`,
    units: b.unitsUsed,
    amount: b.totalAmount
  })).sort((a, b) => b.units - a.units);

  const statusPieData = [
    { name: 'ชำระแล้ว', value: augustBills.filter(b => b.status === 'paid').length, color: '#10b981' },
    { name: 'รอตรวจสอบ', value: augustBills.filter(b => b.status === 'pending_verify').length, color: '#0284c7' },
    { name: 'ยังไม่ชำระ', value: augustBills.filter(b => b.status === 'unpaid' || b.status === 'overdue').length, color: '#f59e0b' }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-emerald-950 text-white p-6 rounded-3xl shadow-xl border border-emerald-900 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 bg-gradient-to-tr from-amber-500 to-emerald-500 rounded-2xl text-white font-bold shadow-lg border border-amber-300/30">
            <Zap className="w-8 h-8 fill-amber-300 text-amber-100" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-900/90 px-2.5 py-0.5 rounded-full border border-emerald-700/80">
                MEC DORMITORY UTILITIES • MOPH
              </span>
              <span className="text-[10px] text-emerald-300/80">อัตรา {ratePerUnit} บาท/หน่วย</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white mt-1">
              ระบบจัดเก็บและจดบันทึกค่าไฟฟ้า หอพักนักศึกษาแพทย์/แพทย์ประจำบ้าน
            </h1>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              ศูนย์แพทยศาสตรศึกษาชั้นคลินิก โรงพยาบาลบุรีรัมย์
            </p>
          </div>
        </div>

        {/* Action Tabs Bar */}
        <div className="flex flex-wrap items-center gap-2 bg-emerald-900/90 p-1.5 rounded-2xl border border-emerald-800 text-xs font-bold">
          {isAdminOrStaff && (
            <button
              onClick={handleOpenRateSettingsModal}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition shadow-xs cursor-pointer mr-1"
              title="ปรับอัตราค่าไฟฟ้าส่วนกลางและค่าบริการตามจริง"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>ปรับอัตราค่าไฟ ({ratePerUnit} บ./หน่วย)</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('bills')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition ${
              activeTab === 'bills'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-emerald-100 hover:text-white hover:bg-emerald-800/80'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>รายการใบแจ้งหนี้ ({augustBills.length})</span>
          </button>

          {isAdminOrStaff && (
            <button
              onClick={() => setActiveTab('record')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition ${
                activeTab === 'record'
                  ? 'bg-emerald-600 text-white shadow-md font-bold'
                  : 'text-emerald-100 hover:text-white hover:bg-emerald-800/80'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>+ บันทึกจดมิเตอร์</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition ${
              activeTab === 'rooms'
                ? 'bg-emerald-700 text-white shadow-md font-bold'
                : 'text-emerald-100 hover:text-white hover:bg-emerald-800/80'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>ห้องพัก ({rooms.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition ${
              activeTab === 'analytics'
                ? 'bg-teal-600 text-white shadow-md font-bold'
                : 'text-emerald-100 hover:text-white hover:bg-emerald-800/80'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-amber-300" />
            <span>กราฟสรุปค่าไฟ</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">จัดเก็บชำระแล้ว</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">{totalRevenueCollected.toLocaleString()} บาท</div>
          <p className="text-[11px] text-slate-500">ชำระแล้วในเดือน {selectedMonth}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">ยอดค้างชำระ</span>
            <AlertCircle className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600">{totalUnpaidAmount.toLocaleString()} บาท</div>
          <p className="text-[11px] text-rose-600 font-medium">{unpaidCount} ห้องที่ยังไม่ชำระ</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">รอตรวจสอบ Slip</span>
            <Clock className="w-5 h-5 text-sky-600" />
          </div>
          <div className="text-2xl font-extrabold text-sky-700">{pendingVerifyCount} ห้อง</div>
          <p className="text-[11px] text-sky-600 font-medium">รอเจ้าหน้าที่กดยืนยัน</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">การใช้ไฟฟ้ารวม</span>
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-800">{totalUnitsConsumed.toLocaleString()} kWh</div>
          <p className="text-[11px] text-slate-500">หน่วยรวมหอพักทั้งหมด</p>
        </div>
      </div>

      {/* TAB 1: INVOICES & BILLS LIST */}
      {activeTab === 'bills' && (
        <div className="space-y-4">
          {/* Filters & Actions Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-1 items-center space-x-2">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="ค้นหาเลขห้อง, ชื่อผู้พักอาศัย, อาคาร..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Month Selector */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="all">ทุกรอบเดือน</option>
                {monthOptions.map(m => (
                  <option key={m} value={m}>รอบเดือน {m}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="all">ทุกสถานะการชำระ</option>
                <option value="unpaid">ยังไม่ชำระ</option>
                <option value="pending_verify">รอตรวจสอบ Slip</option>
                <option value="paid">ชำระแล้ว</option>
              </select>
            </div>

            {currentUser?.role === 'admin' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBatchEmailModalOpen(true)}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200/80 transition border border-emerald-300 shadow-xs shrink-0 cursor-pointer"
                  title="ส่ง Email ใบแจ้งหนี้ทุกห้องพร้อมกัน"
                >
                  <Mail className="w-4 h-4 text-emerald-800" />
                  <span>ส่ง Email ทั้งหมด</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition shadow-sm shrink-0 cursor-pointer"
                  title="เฉพาะ Admin เท่านั้นที่ดาวน์โหลด CSV ได้"
                >
                  <Download className="w-4 h-4" />
                  <span>ดาวน์โหลด CSV</span>
                </button>
              </div>
            )}
          </div>

          {/* Bills Grid */}
          {filteredBills.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-500">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-sm">ไม่พบรายการใบแจ้งหนี้ค่าไฟฟ้าตามเงื่อนไข</p>
              <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหา หรือกดจดมิเตอร์เพื่อสร้างใบแจ้งหนี้ใหม่</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBills.map((b) => (
                <div 
                  key={b.id}
                  className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between ${
                    b.status === 'unpaid' ? 'border-amber-200/90' : b.status === 'paid' ? 'border-emerald-200' : 'border-sky-200'
                  }`}
                >
                  <div>
                    {/* Header line */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="text-xs font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          ห้อง {b.roomNumber}
                        </span>
                        <div className="text-[11px] text-slate-500 mt-1 truncate">{b.building}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {getStatusBadge(b.status)}
                        {b.isEmailSent ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <Mail className="w-3 h-3 text-emerald-600" />
                            ส่ง Email แล้ว
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            ยังไม่ส่ง Email
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Occupant Info */}
                    <div className="space-y-1 my-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span className="truncate">{b.occupantName}</span>
                      </div>
                      <div className="text-slate-500 text-[11px] pl-5">{b.department}</div>
                      {b.occupantEmail && (
                        <div className="text-emerald-700 text-[10px] pl-5 font-mono truncate">{b.occupantEmail}</div>
                      )}
                    </div>

                    {/* Usage Calculation */}
                    <div className="grid grid-cols-3 gap-2 text-center my-3 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium">มิเตอร์เดิม</div>
                        <div className="text-xs font-bold text-slate-700">{b.previousMeter}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium">มิเตอร์ใหม่</div>
                        <div className="text-xs font-bold text-slate-700">{b.currentMeter}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-emerald-700 font-medium">ใช้ไป (kWh)</div>
                        <div className="text-xs font-bold text-emerald-800">{b.unitsUsed} หน่วย</div>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-1.5 py-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center justify-between text-slate-500">
                        <span>ค่าไฟ ({b.unitsUsed} x {b.ratePerUnit} + {b.baseServiceFee}บ.):</span>
                        <span className="font-semibold text-slate-700">
                          {((b.unitsUsed * b.ratePerUnit) + b.baseServiceFee).toLocaleString()} บาท
                        </span>
                      </div>

                      {b.discountAmount !== undefined && b.discountAmount > 0 && (
                        <div className="flex items-center justify-between text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-amber-200">
                          <span>ส่วนลด / ปรับลดยอด:</span>
                          <span>-{b.discountAmount.toLocaleString()} บาท</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="font-bold text-slate-800">ยอดรวมสุทธิ:</span>
                        <span className="text-base font-extrabold text-emerald-800">{b.totalAmount.toLocaleString()} บาท</span>
                      </div>

                      {b.notes && (
                        <div className="text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100 truncate">
                          หมายเหตุ: {b.notes}
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
                      <span>รอบเดือน: {b.monthYear}</span>
                      <span>กำหนดชำระ: {b.dueDate}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-100 mt-4 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setSelectedBillForInvoice(b)}
                      className="flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center space-x-1 cursor-pointer"
                      title="ดูใบแจ้งหนี้ / พิมพ์เป็น PDF"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>ใบแจ้งหนี้/PDF</span>
                    </button>

                    {isAdminOrStaff && (
                      <button
                        onClick={() => handleOpenEditBill(b)}
                        className="p-2 text-slate-600 hover:text-emerald-800 bg-slate-100 hover:bg-emerald-50 rounded-xl transition border border-transparent hover:border-emerald-200 cursor-pointer"
                        title="แก้ไขยอด/อัตราค่าไฟตามจริง (Admin)"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {isAdminOrStaff && (
                      <button
                        onClick={() => handleOpenEmailModal(b)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-1 cursor-pointer ${
                          b.isEmailSent 
                            ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200' 
                            : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                        }`}
                        title="จัดส่งทาง Email ผู้พักอาศัย"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>{b.isEmailSent ? 'ส่งซ้ำ' : 'ส่ง Email'}</span>
                      </button>
                    )}

                    {b.status !== 'paid' && (
                      <button
                        onClick={() => setSelectedBillForPayment(b)}
                        className="flex-1 py-2 px-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm transition flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>{isAdminOrStaff ? 'รับชำระ' : 'ชำระเงิน'}</span>
                      </button>
                    )}

                    {isAdminOrStaff && (
                      <button
                        onClick={() => onDeleteBill(b.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                        title="ลบใบแจ้งหนี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RECORD METER READINGS (STAFF/ADMIN) */}
      {activeTab === 'record' && isAdminOrStaff && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500 fill-amber-300" />
                บันทึกจดเลขมิเตอร์ไฟฟ้าประจำเดือน
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                กรอกเลขมิเตอร์ปัจจุบันของแต่ละห้อง ระบบจะคำนวณหน่วยไฟฟ้าและยอดเงินอัตโนมัติ (อัตรา {ratePerUnit} บาท/หน่วย + ค่าบริการ {baseServiceFee} บาท)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-slate-500">รอบเดือน/ปี:</label>
                <input
                  type="month"
                  value={meterMonthYear}
                  onChange={(e) => setMeterMonthYear(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold"
                />
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-slate-500">กำหนดชำระเงิน:</label>
                <input
                  type="date"
                  value={meterDueDate}
                  onChange={(e) => setMeterDueDate(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold"
                />
              </div>
            </div>
          </div>

          {/* Batch Rate Controller Toolbar */}
          <div className="bg-amber-50/80 border border-amber-200/90 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs text-amber-950 flex items-center gap-2">
                  <span>ปรับอัตราค่าไฟรอบการจดนี้</span>
                  <span className="text-[11px] font-bold text-amber-900 bg-amber-200/70 px-2.5 py-0.5 rounded-full border border-amber-300">
                    {ratePerUnit} บ./หน่วย + ค่าบริการ {baseServiceFee} บ.
                  </span>
                </div>
                <p className="text-[11px] text-amber-800/90 mt-0.5">
                  Admin สามารถปรับลด/เพิ่มอัตราค่าไฟตามความเป็นจริงได้ทันที ตัวเลขในตารางจะคำนวณใหม่แบบเรียลไทม์
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Rate per unit stepper */}
              <div className="flex items-center space-x-1.5 bg-white border border-amber-300 rounded-xl px-2.5 py-1 text-xs shadow-xs">
                <span className="text-[11px] text-slate-500 font-medium">ค่าไฟ:</span>
                <button
                  type="button"
                  onClick={() => setRatePerUnit(prev => Math.max(0.5, Number((prev - 0.25).toFixed(2))))}
                  className="w-5 h-5 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-bold transition cursor-pointer"
                  title="ลด 0.25 บาท"
                >
                  -
                </button>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={ratePerUnit}
                  onChange={(e) => setRatePerUnit(Math.max(0, Number(e.target.value)))}
                  className="w-14 text-center font-bold text-amber-900 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500">บ./หน่วย</span>
                <button
                  type="button"
                  onClick={() => setRatePerUnit(prev => Number((prev + 0.25).toFixed(2)))}
                  className="w-5 h-5 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-bold transition cursor-pointer"
                  title="เพิ่ม 0.25 บาท"
                >
                  +
                </button>
              </div>

              {/* Base fee stepper */}
              <div className="flex items-center space-x-1.5 bg-white border border-amber-300 rounded-xl px-2.5 py-1 text-xs shadow-xs">
                <span className="text-[11px] text-slate-500 font-medium">ค่าบริการ:</span>
                <button
                  type="button"
                  onClick={() => setBaseServiceFee(prev => Math.max(0, prev - 5))}
                  className="w-5 h-5 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-bold transition cursor-pointer"
                  title="ลด 5 บาท"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  value={baseServiceFee}
                  onChange={(e) => setBaseServiceFee(Math.max(0, Number(e.target.value)))}
                  className="w-12 text-center font-bold text-amber-900 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500">บ.</span>
                <button
                  type="button"
                  onClick={() => setBaseServiceFee(prev => prev + 5)}
                  className="w-5 h-5 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-bold transition cursor-pointer"
                  title="เพิ่ม 5 บาท"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleOpenRateSettingsModal}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1 shadow-xs cursor-pointer"
                title="เปิดแผงตั้งค่าอัตราส่วนกลางและจำลองคำนวณ"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>ตั้งค่าส่วนกลาง</span>
              </button>
            </div>
          </div>

          {/* Meter Entry Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">เลขห้อง</th>
                  <th className="py-3 px-4">ผู้พักอาศัย / สังกัด</th>
                  <th className="py-3 px-4">มิเตอร์ครั้งก่อน</th>
                  <th className="py-3 px-4">มิเตอร์ครั้งนี้ (ป้อนใหม่)</th>
                  <th className="py-3 px-4 text-center">หน่วยใช้ไฟ (kWh)</th>
                  <th className="py-3 px-4 text-right">ยอดรวม (บาท)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rooms.map((r) => {
                  const newMeter = batchMeterReadings[r.id] ?? r.currentMeter;
                  const units = Math.max(0, newMeter - r.currentMeter);
                  const total = (units * ratePerUnit) + baseServiceFee;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-emerald-900">
                        ห้อง {r.roomNumber}
                        <div className="text-[10px] text-slate-400 font-normal">{r.building}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{r.occupantName}</div>
                        <div className="text-[11px] text-slate-500">{r.department}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{r.currentMeter}</td>
                      <td className="py-3.5 px-4">
                        <input
                          type="number"
                          min={r.currentMeter}
                          value={batchMeterReadings[r.id] !== undefined ? batchMeterReadings[r.id] : ''}
                          placeholder={`> ${r.currentMeter}`}
                          onChange={(e) => {
                            const val = e.target.value === '' ? r.currentMeter : Number(e.target.value);
                            setBatchMeterReadings({ ...batchMeterReadings, [r.id]: val });
                          }}
                          className="w-32 bg-amber-50 border border-amber-300 focus:border-emerald-600 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none"
                        />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`font-bold px-2.5 py-1 rounded-lg ${units > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                          {units} หน่วย
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-800">
                        {total.toLocaleString()} บาท
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveBatchMeters}
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-2 active:scale-95"
            >
              <Zap className="w-4 h-4 fill-amber-300" />
              <span>บันทึกเลขมิเตอร์และออกใบแจ้งหนี้ทุกห้อง</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: DORM ROOMS SETUP */}
      {activeTab === 'rooms' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700" />
                ผังห้องพักและข้อมูลผู้พักอาศัย หอพักแพทย์
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                อัตราค่าไฟฟ้ามาตรฐาน: {ratePerUnit} บาท/หน่วย | ค่าบริการรักษามิเตอร์: {baseServiceFee} บาท
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Filter By Building Dropdown */}
              <select
                value={selectedBuildingFilter}
                onChange={(e) => setSelectedBuildingFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="all">ทุกอาคารหอพัก ({rooms.length} ห้อง)</option>
                {buildings.map(b => (
                  <option key={b} value={b}>
                    {b} ({rooms.filter(r => r.building === b).length} ห้อง)
                  </option>
                ))}
              </select>

              {isAdminOrStaff && (
                <>
                  <button
                    type="button"
                    onClick={handleOpenRateSettingsModal}
                    className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl border border-amber-300 transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                    title="ปรับอัตราค่าไฟฟ้าส่วนกลางและค่าบริการรายเดือน"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-amber-700" />
                    <span>ปรับอัตราค่าไฟ ({ratePerUnit} บ.)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsBuildingModalOpen(true)}
                    className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl border border-emerald-300 transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                    title="จัดการ เพิ่ม/แก้ไข/ลบ รายชื่ออาคารหอพัก"
                  >
                    <Building2 className="w-4 h-4 text-emerald-800" />
                    <span>จัดการอาคารหอพัก</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingRoom(null);
                      setRoomForm({
                        roomNumber: '',
                        building: buildings[0] || 'อาคารหอพักนักศึกษาแพทย์ 1 (MEC Dorm 1)',
                        floor: 'ชั้น 2',
                        occupantName: '',
                        phone: '',
                        occupant2Name: '',
                        phone2: '',
                        occupantRole: 'student',
                        department: 'ชั้นปีที่ 4',
                        currentMeter: 1000,
                        ratePerUnit: 5.0,
                        baseServiceFee: 30
                      });
                      setIsRoomModalOpen(true);
                    }}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ เพิ่มห้องพักใหม่</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {filteredRooms.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-sm font-bold text-slate-700">ไม่พบข้อมูลห้องพักตามเงื่อนไขที่เลือก</div>
              <p className="text-xs text-slate-500">
                ลองเลือก "ทุกอาคารหอพัก" หรือเพิ่มห้องพักใหม่ในอาคารนี้
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRooms.map((r) => (
              <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300">
                      ห้อง {r.roomNumber}
                    </span>
                    <span className="text-[11px] text-slate-500 ml-2">{r.floor}</span>
                  </div>
                  {isAdminOrStaff && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingRoom(r);
                          setRoomForm(r);
                          setIsRoomModalOpen(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        title="แก้ไขข้อมูลห้องพัก"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteRoom(r.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="ลบห้องพัก"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-3 space-y-2">
                  <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 space-y-1">
                    <div className="text-[10px] font-bold text-emerald-800">1. ผู้พักอาศัยคนที่ 1 (หลัก):</div>
                    <div className="text-xs font-bold text-slate-800">{r.occupantName}</div>
                    <div className="text-[11px] text-slate-600 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{r.phone || 'ไม่ระบุ'}</span>
                    </div>
                  </div>

                  {r.occupant2Name && (
                    <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 space-y-1">
                      <div className="text-[10px] font-bold text-slate-500">2. ผู้พักอาศัยคนที่ 2:</div>
                      <div className="text-xs font-bold text-slate-800">{r.occupant2Name}</div>
                      {r.phone2 && (
                        <div className="text-[11px] text-slate-600 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{r.phone2}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 pt-0.5">{r.department}</div>
                  <div className="text-[11px] text-slate-400">{r.building}</div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">เลขมิเตอร์ล่าสุด:</span>
                  <span className="font-extrabold text-emerald-800 font-mono text-sm">{r.currentMeter} kWh</span>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      )}

      {/* TAB 4: ANALYTICS & CHARTS */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-700" />
              เปรียบเทียบปริมาณการใช้ไฟฟ้าแต่ละห้อง (kWh) - เดือน {selectedMonth}
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roomUsageChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="room" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip 
                    formatter={(val: any) => [`${val} kWh`, 'หน่วยที่ใช้']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                  <Bar dataKey="units" fill="#047857" radius={[8, 8, 0, 0]}>
                    {roomUsageChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#047857' : '#0d9488'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-700" />
              สัดส่วนสถานะการชำระเงิน
            </h3>
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>ค่าไฟฟ้ารวมทั้งเดือน:</span>
                <span className="font-bold text-slate-800">
                  {augustBills.reduce((acc, c) => acc + c.totalAmount, 0).toLocaleString()} บาท
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ยอดเงินที่ได้รับแล้ว:</span>
                <span className="font-bold text-emerald-700">{totalRevenueCollected.toLocaleString()} บาท</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ค้างชำระ:</span>
                <span className="font-bold text-rose-600">{totalUnpaidAmount.toLocaleString()} บาท</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROMPTPAY PAYMENT MODAL */}
      {selectedBillForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-emerald-950 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm">สแกนชำระเงินค่าไฟฟ้า PromptPay</h3>
              </div>
              <button 
                onClick={() => setSelectedBillForPayment(null)}
                className="p-1 text-emerald-300 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Summary card */}
              <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 text-center space-y-1">
                <div className="text-xs font-semibold text-emerald-900">
                  ห้อง {selectedBillForPayment.roomNumber} - {selectedBillForPayment.occupantName}
                </div>
                <div className="text-2xl font-black text-emerald-800">
                  {selectedBillForPayment.totalAmount.toLocaleString()} บาท
                </div>
                <div className="text-[11px] text-emerald-700">
                  ประจำเดือน {selectedBillForPayment.monthYear} ({selectedBillForPayment.unitsUsed} kWh)
                </div>
              </div>

              {/* Fake PromptPay QR Display */}
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-emerald-300 p-4 rounded-2xl bg-slate-50 space-y-2">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=PROMPTPAY-044602000-AMOUNT-${selectedBillForPayment.totalAmount}`}
                  alt="PromptPay QR Code"
                  className="w-44 h-44 rounded-lg shadow-sm border border-slate-200 bg-white p-2"
                />
                <div className="text-[11px] font-bold text-slate-700">
                  พร้อมเพย์: ศูนย์แพทยศาสตรศึกษา โรงพยาบาลบุรีรัมย์
                </div>
                <div className="text-[10px] text-slate-500">เลขบัญชี PromptPay: 044-602-000</div>
              </div>

              {/* Slip / Reference Entry */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  เลขที่อ้างอิง Slip การโอนเงิน / หมายเหตุ:
                </label>
                <input
                  type="text"
                  placeholder="เช่น: PP-20260805-1234 หรือแนบหลักฐาน"
                  value={slipReference}
                  onChange={(e) => setSlipReference(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => setSelectedBillForPayment(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={isSubmittingPayment}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow transition flex items-center justify-center space-x-1"
                >
                  <Check className="w-4 h-4" />
                  <span>ยืนยันแจ้งชำระเงิน</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE INVOICE / RECEIPT MODAL */}
      {selectedBillForInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:border-none print:m-0 print:p-0 print:max-w-none">
            {/* Modal Header (Hidden on print) */}
            <div className="bg-emerald-950 px-6 py-4 text-white flex items-center justify-between print:hidden">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm">ใบแจ้งหนี้ / ใบเสร็จรับเงินค่าไฟฟ้า</h3>
              </div>
              <div className="flex items-center space-x-2">
                {currentUser?.role === 'admin' && (
                  <>
                    <button
                      onClick={() => handleOpenEmailModal(selectedBillForInvoice)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                      title="ส่ง Email ใบแจ้งหนี้ให้ผู้พักอาศัย"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>ส่ง Email</span>
                    </button>

                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                      title="พิมพ์เอกสารใบแจ้งหนี้หรือบันทึกเป็น PDF"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>พิมพ์ / PDF</span>
                    </button>
                  </>
                )}
                <button 
                  onClick={() => setSelectedBillForInvoice(null)}
                  className="p-1 text-emerald-300 hover:text-white rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="p-8 space-y-6 text-slate-800 bg-white" id="printable-invoice">
              {/* Header section */}
              <div className="border-b-2 border-emerald-800 pb-4 flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center font-bold text-sm">
                      MEC
                    </div>
                    <h2 className="font-bold text-base text-emerald-950">
                      ศูนย์แพทยศาสตรศึกษาชั้นคลินิก โรงพยาบาลบุรีรัมย์
                    </h2>
                  </div>
                  <p className="text-xs text-slate-600 font-medium pl-10">
                    หอพักนักศึกษาแพทย์ / แพทย์ประจำบ้าน (กระทรวงสาธารณสุข)
                  </p>
                  <p className="text-[11px] text-slate-500 pl-10">
                    24 ถนนหน้าสถานี ต.ในเมือง อ.เมืองบุรีรัมย์ จ.บุรีรัมย์ 31000 โทร. 044-602-000 ต่อศูนย์แพทยฯ
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 block">
                    NO: {selectedBillForInvoice.id}
                  </span>
                  <div className="text-[11px] text-slate-500 mt-1">วันที่ออก: {new Date(selectedBillForInvoice.createdAt).toLocaleDateString('th-TH')}</div>
                  {selectedBillForInvoice.isEmailSent && (
                    <div className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-1 inline-block">
                      ✓ จัดส่ง Email แล้ว
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Status Stamp */}
              <div className="text-center relative my-2">
                <h3 className="text-lg font-black text-slate-900 underline decoration-emerald-600 underline-offset-4">
                  ใบแจ้งหนี้ค่าไฟฟ้าประจำเดือน {selectedBillForInvoice.monthYear}
                </h3>
                {selectedBillForInvoice.status === 'paid' ? (
                  <div className="mt-2 inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full border border-emerald-300">
                    ✓ ชำระเงินเรียบร้อยแล้ว (PAID) - {selectedBillForInvoice.paidAt ? new Date(selectedBillForInvoice.paidAt).toLocaleDateString('th-TH') : ''}
                  </div>
                ) : (
                  <div className="mt-2 inline-block px-3 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-full border border-amber-300">
                    ⚠️ รอการชำระเงิน (DUE)
                  </div>
                )}
              </div>

              {/* Recipient Details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-600">ห้องพัก:</span>
                  <span className="font-bold text-emerald-900">ห้อง {selectedBillForInvoice.roomNumber} ({selectedBillForInvoice.building})</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-600">ผู้พักอาศัย:</span>
                  <span className="font-bold text-slate-800">{selectedBillForInvoice.occupantName} ({selectedBillForInvoice.department})</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-600">อีเมลจัดส่ง:</span>
                  <span className="font-mono text-emerald-800 font-medium">{selectedBillForInvoice.occupantEmail || (selectedBillForInvoice.occupantName.includes('ธนกฤต') ? 'tanakrit.m@cpird.in.th' : 'occupant@cpird.in.th')}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200/80 pt-1.5 mt-1">
                  <span className="font-bold text-slate-600">กำหนดชำระภายใน:</span>
                  <span className="font-extrabold text-rose-600">{selectedBillForInvoice.dueDate}</span>
                </div>
              </div>

              {/* Table details */}
              <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-emerald-900 text-white font-bold">
                    <tr>
                      <th className="py-2.5 px-3">รายการ</th>
                      <th className="py-2.5 px-3 text-center">เลขมิเตอร์เดิม</th>
                      <th className="py-2.5 px-3 text-center">เลขมิเตอร์ใหม่</th>
                      <th className="py-2.5 px-3 text-center">จำนวนหน่วย (kWh)</th>
                      <th className="py-2.5 px-3 text-right">จำนวนเงิน (บาท)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-2.5 px-3 font-semibold">ค่าไฟฟ้าประจำรอบเดือน ({selectedBillForInvoice.ratePerUnit} บ./หน่วย)</td>
                      <td className="py-2.5 px-3 text-center font-mono">{selectedBillForInvoice.previousMeter}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{selectedBillForInvoice.currentMeter}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-800">{selectedBillForInvoice.unitsUsed}</td>
                      <td className="py-2.5 px-3 text-right font-bold">
                        {(selectedBillForInvoice.unitsUsed * selectedBillForInvoice.ratePerUnit).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold" colSpan={4}>ค่าบริการรักษามิเตอร์ประจำเดือน</td>
                      <td className="py-2.5 px-3 text-right font-bold">{selectedBillForInvoice.baseServiceFee.toLocaleString()}</td>
                    </tr>
                    {selectedBillForInvoice.discountAmount !== undefined && selectedBillForInvoice.discountAmount > 0 && (
                      <tr className="text-amber-800 bg-amber-50/70 font-semibold">
                        <td className="py-2.5 px-3" colSpan={4}>
                          ส่วนลด / ปรับลดยอดค่าไฟตามจริง {selectedBillForInvoice.notes ? `(${selectedBillForInvoice.notes})` : ''}
                        </td>
                        <td className="py-2.5 px-3 text-right text-amber-900 font-bold">
                          -{selectedBillForInvoice.discountAmount.toLocaleString()}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-emerald-50 font-extrabold text-sm">
                      <td className="py-3 px-3 text-emerald-950" colSpan={4}>รวมเงินทั้งสิ้นที่ต้องชำระ</td>
                      <td className="py-3 px-3 text-right text-emerald-800">{selectedBillForInvoice.totalAmount.toLocaleString()} บาท</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Payment Info & PromptPay QR Box for Print */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-slate-800">วิธีการชำระเงิน:</div>
                  <div className="text-[11px] text-slate-600">
                    1. สแกน PromptPay QR Code ด้วยแอป Mobile Banking ได้ทุกธนาคาร<br />
                    2. หรือโอนเข้าบัญชี <strong>ศูนย์แพทยศาสตรศึกษาชั้นคลินิก รพ.บุรีรัมย์</strong><br />
                    3. แจ้งหลักฐานการโอนผ่านระบบบันทึกค่าไฟฟ้าหอพัก MEC
                  </div>
                </div>
                <div className="text-center shrink-0 border-l border-slate-200 pl-4">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=PROMPTPAY-044602000-AMOUNT-${selectedBillForInvoice.totalAmount}`}
                    alt="PromptPay QR Code"
                    className="w-20 h-20 rounded border border-slate-300 p-1 bg-white mx-auto shadow-2xs"
                  />
                  <div className="text-[9px] font-bold text-slate-600 mt-1">PromptPay QR Code</div>
                </div>
              </div>

              {/* Footer signatures */}
              <div className="pt-4 grid grid-cols-2 gap-8 text-center text-xs text-slate-600">
                <div>
                  <div className="h-10 border-b border-dashed border-slate-400 max-w-[160px] mx-auto"></div>
                  <div className="mt-2 font-bold">{selectedBillForInvoice.recordedBy}</div>
                  <div className="text-[10px] text-slate-400">เจ้าหน้าที่ผู้บันทึก/ออกเอกสาร</div>
                </div>
                <div>
                  <div className="h-10 border-b border-dashed border-slate-400 max-w-[160px] mx-auto"></div>
                  <div className="mt-2 font-bold">{selectedBillForInvoice.occupantName}</div>
                  <div className="text-[10px] text-slate-400">ผู้รับใบแจ้งหนี้/ผู้ชำระเงิน</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SINGLE EMAIL DISPATCH MODAL */}
      {selectedBillForEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-emerald-950 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm">จัดส่ง Email ใบแจ้งหนี้ - ห้อง {selectedBillForEmail.roomNumber}</h3>
              </div>
              <button 
                onClick={() => setSelectedBillForEmail(null)}
                className="p-1 text-emerald-300 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendSingleEmailSubmit} className="p-6 space-y-4 text-xs text-slate-700">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 space-y-1">
                <div className="font-bold text-emerald-950">ผู้พักอาศัย: {selectedBillForEmail.occupantName}</div>
                <div className="text-slate-600">หอพัก: ห้อง {selectedBillForEmail.roomNumber} ({selectedBillForEmail.building})</div>
                <div className="text-emerald-800 font-bold">ยอดที่ต้องชำระ: {selectedBillForEmail.totalAmount.toLocaleString()} บาท (กำหนด {selectedBillForEmail.dueDate})</div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800">อีเมลผู้รับ (Recipient Email):</label>
                <input
                  type="email"
                  required
                  value={emailToAddress}
                  onChange={(e) => setEmailToAddress(e.target.value)}
                  placeholder="เช่น: occupant@cpird.in.th"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800">หัวข้อ Email (Subject):</label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800">ข้อความใน Email (Message Body):</label>
                <textarea
                  rows={8}
                  required
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-mono text-[11px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-600"
                ></textarea>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedBillForEmail(null)}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="flex-1 py-2.5 rounded-xl font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition shadow flex items-center justify-center space-x-1 cursor-pointer"
                >
                  {isSendingEmail ? (
                    <span>กำลังจัดส่ง...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>จัดส่ง Email ใบแจ้งหนี้</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BATCH EMAIL DISPATCH MODAL */}
      {isBatchEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-emerald-950 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm">จัดส่ง Email ใบแจ้งหนี้ทุกห้องอัตโนมัติ</h3>
              </div>
              <button 
                onClick={() => setIsBatchEmailModalOpen(false)}
                className="p-1 text-emerald-300 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 text-sm">
                  สรุปการส่ง Email ใบแจ้งหนี้ประจำเดือน {selectedMonth}
                </div>
                <p className="text-slate-600">
                  ระบบจะทำการจัดส่งอีเมลใบแจ้งหนี้ค่าไฟฟ้าไปยังผู้พักอาศัยทุกห้องที่มีรายการค้างส่งในรอบเดือนนี้อัตโนมัติ
                </p>
                <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 font-bold text-amber-900">
                  รายการที่จะจัดส่ง: {filteredBills.filter(b => b.status === 'unpaid' || !b.isEmailSent).length} ห้อง
                </div>
              </div>

              <div className="text-[11px] text-slate-500">
                • ผู้พักอาศัยจะได้รับ Email สรุปยอดค่าไฟฟ้า ลิ้งก์เปิดดูใบแจ้งหนี้ และ QR Code ชำระเงิน<br />
                • สถานะในระบบจะเปลี่ยนเป็น "ส่ง Email แล้ว" พร้อมบันทึกเวลาจัดส่ง
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => setIsBatchEmailModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleBatchSendEmails}
                  disabled={isBatchSending}
                  className="flex-1 py-2.5 rounded-xl font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition shadow flex items-center justify-center space-x-1 cursor-pointer"
                >
                  {isBatchSending ? (
                    <span>กำลังส่ง Email...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>ยืนยันส่ง Email ทุกห้อง</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT / CREATE ROOM MODAL */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-emerald-950 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm">
                  {editingRoom ? `แก้ไขข้อมูลห้อง ${editingRoom.roomNumber}` : 'เพิ่มห้องพักหอพักใหม่'}
                </h3>
              </div>
              <button 
                onClick={() => setIsRoomModalOpen(false)}
                className="p-1 text-emerald-300 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="p-6 space-y-4">
              {/* Category / Role Selector */}
              <div className="space-y-1.5 bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-2xl">
                <label className="text-xs font-bold text-emerald-950 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-700" />
                    <span>ประเภทผู้พักอาศัย *</span>
                  </span>
                  <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-100 px-2 py-0.5 rounded-md">
                    กำหนดอัตราค่าไฟตามกลุ่ม
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { id: 'student', label: 'นักศึกษาแพทย์', icon: GraduationCap, rate: roleRates.studentRate, fee: roleRates.studentFee, desc: 'นศพ.' },
                    { id: 'resident', label: 'แพทย์ประจำบ้าน', icon: Stethoscope, rate: roleRates.residentRate, fee: roleRates.residentFee, desc: 'Resident / Extern' },
                    { id: 'staff', label: 'อาจารย์ / บุคลากร', icon: Building2, rate: roleRates.staffRate, fee: roleRates.staffFee, desc: 'Staff' }
                  ].map((cat) => {
                    const IconComp = cat.icon;
                    const isSelected = (roomForm.occupantRole === cat.id) || 
                      (!roomForm.occupantRole && cat.id === 'student');

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setRoomForm({
                            ...roomForm,
                            occupantRole: cat.id as UserRole,
                            ratePerUnit: cat.rate,
                            baseServiceFee: cat.fee,
                            department: roomForm.department || (cat.id === 'resident' ? 'แพทย์ประจำบ้าน' : (cat.id === 'staff' ? 'ศูนย์แพทยศาสตร์' : 'ชั้นปีที่ 4'))
                          });
                        }}
                        className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                          isSelected
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400/40'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                        }`}
                      >
                        <IconComp className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-emerald-700'}`} />
                        <div className="text-[11px] font-bold leading-tight">{cat.label}</div>
                        <div className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                          {cat.rate} บ./หน่วย
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">เลขห้องพัก *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น: 201"
                    value={roomForm.roomNumber || ''}
                    onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ชั้นที่ *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น: ชั้น 2"
                    value={roomForm.floor || ''}
                    onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">ชื่ออาคารหอพัก *</label>
                  {isAdminOrStaff && (
                    <button
                      type="button"
                      onClick={() => setIsBuildingModalOpen(true)}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Building2 className="w-3 h-3" />
                      <span>จัดการอาคาร</span>
                    </button>
                  )}
                </div>
                <select
                  value={roomForm.building || ''}
                  onChange={(e) => setRoomForm({ ...roomForm, building: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {buildings.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">สังกัด / ชั้นปี / ภาควิชา</label>
                <input
                  type="text"
                  placeholder="เช่น: นศพ. ชั้นปีที่ 5 หรือ แพทย์ประจำบ้าน ศัลยศาสตร์"
                  value={roomForm.department || ''}
                  onChange={(e) => setRoomForm({ ...roomForm, department: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Specific Rate & Fee for this room */}
              <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-amber-200/80 pb-1.5">
                  <div className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span>อัตราค่าไฟฟ้าเฉพาะห้องนี้ (ปรับตามจริงได้)</span>
                  </div>
                  <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded">
                    {roomForm.ratePerUnit || (roomForm.occupantRole === 'resident' ? roleRates.residentRate : roleRates.studentRate)} บาท/หน่วย
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">อัตราต่อหน่วย (บาท / kWh)</label>
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => setRoomForm(prev => ({
                          ...prev,
                          ratePerUnit: Math.max(0.5, Number(((prev.ratePerUnit || 5.0) - 0.25).toFixed(2)))
                        }))}
                        className="px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
                      >
                        -0.25
                      </button>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={roomForm.ratePerUnit !== undefined ? roomForm.ratePerUnit : 5.0}
                        onChange={(e) => setRoomForm({ ...roomForm, ratePerUnit: Number(e.target.value) })}
                        className="w-full bg-white border border-amber-300 focus:border-amber-500 rounded-xl px-2 py-1.5 text-xs text-center font-bold text-slate-800 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setRoomForm(prev => ({
                          ...prev,
                          ratePerUnit: Number(((prev.ratePerUnit || 5.0) + 0.25).toFixed(2))
                        }))}
                        className="px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
                      >
                        +0.25
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">ค่าบริการรักษามิเตอร์ (บาท / เดือน)</label>
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => setRoomForm(prev => ({
                          ...prev,
                          baseServiceFee: Math.max(0, (prev.baseServiceFee ?? 30) - 5)
                        }))}
                        className="px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
                      >
                        -5
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={roomForm.baseServiceFee !== undefined ? roomForm.baseServiceFee : 30}
                        onChange={(e) => setRoomForm({ ...roomForm, baseServiceFee: Number(e.target.value) })}
                        className="w-full bg-white border border-amber-300 focus:border-amber-500 rounded-xl px-2 py-1.5 text-xs text-center font-bold text-slate-800 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setRoomForm(prev => ({
                          ...prev,
                          baseServiceFee: (prev.baseServiceFee ?? 30) + 5
                        }))}
                        className="px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
                      >
                        +5
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 font-medium">เรทแนะนำ:</span>
                  {[
                    { label: `นศพ. (${roleRates.studentRate} บ.)`, rate: roleRates.studentRate, fee: roleRates.studentFee },
                    { label: `แพทย์ประจำบ้าน (${roleRates.residentRate} บ.)`, rate: roleRates.residentRate, fee: roleRates.residentFee },
                    { label: '6.00 บ.', rate: 6.0, fee: 30 }
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setRoomForm(prev => ({ ...prev, ratePerUnit: p.rate, baseServiceFee: p.fee }))}
                      className="px-2 py-0.5 bg-white hover:bg-amber-100 border border-amber-300 rounded-md text-[10px] font-bold text-amber-900 transition cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Occupants Section: 2 Rows */}
              <div className="border border-slate-200 bg-slate-50/80 p-3.5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-xs font-bold text-emerald-950">ข้อมูลชื่อผู้พักอาศัย (2 แถว) *</span>
                  <span className="text-[10px] text-slate-500 font-medium">1: บังคับ | 2: ไม่บังคับ</span>
                </div>

                {/* Occupant Row 1 (Required) */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 inline-block">
                    1. ผู้พักอาศัยคนที่ 1 (บังคับต้องมี *)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-0.5">
                      <label className="text-[11px] font-bold text-slate-700">ชื่อ-สกุล *</label>
                      <input
                        type="text"
                        required
                        placeholder="เช่น: นศพ. ธนกฤต มั่นคง หรือ นพ. ชัยวัฒน์"
                        value={roomForm.occupantName || ''}
                        onChange={(e) => setRoomForm({ ...roomForm, occupantName: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[11px] font-bold text-slate-700">เบอร์โทรศัพท์ (ถ้ามี)</label>
                      <input
                        type="text"
                        placeholder="เช่น: 081-234-5678"
                        value={roomForm.phone || ''}
                        onChange={(e) => setRoomForm({ ...roomForm, phone: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Occupant Row 2 (Optional) */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
                  <div className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block">
                    2. ผู้พักอาศัยคนที่ 2 (ไม่บังคับ)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-0.5">
                      <label className="text-[11px] font-medium text-slate-600">ชื่อ-สกุล (ไม่บังคับ)</label>
                      <input
                        type="text"
                        placeholder="ชื่อ-สกุล ผู้พักอาศัยคนที่ 2"
                        value={roomForm.occupant2Name || ''}
                        onChange={(e) => setRoomForm({ ...roomForm, occupant2Name: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[11px] font-medium text-slate-600">เบอร์โทรศัพท์ (ไม่บังคับ)</label>
                      <input
                        type="text"
                        placeholder="เบอร์โทรศัพท์ (ถ้ามี)"
                        value={roomForm.phone2 || ''}
                        onChange={(e) => setRoomForm({ ...roomForm, phone2: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">เลขมิเตอร์เริ่มต้น (kWh)</label>
                <input
                  type="number"
                  value={roomForm.currentMeter || 1000}
                  onChange={(e) => setRoomForm({ ...roomForm, currentMeter: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>บันทึกข้อมูลและอัตราค่าไฟห้อง</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MANAGING BUILDINGS MODAL (ADMIN / STAFF) */}
      {isBuildingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-emerald-950 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm">จัดการชื่ออาคารหอพัก</h3>
              </div>
              <button 
                onClick={() => setIsBuildingModalOpen(false)}
                className="p-1 text-emerald-300 hover:text-white rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs text-slate-700">
              {/* Form to add a new building */}
              <form onSubmit={handleAddBuildingSubmit} className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 space-y-2">
                <label className="font-bold text-emerald-950 text-xs block">
                  + เพิ่มชื่ออาคารหอพักใหม่:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newBuildingInput}
                    onChange={(e) => setNewBuildingInput(e.target.value)}
                    placeholder="เช่น: อาคารหอพักแพทย์ประจำบ้าน 3"
                    className="flex-1 bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-xs transition shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>เพิ่มอาคาร</span>
                  </button>
                </div>
              </form>

              {/* List of existing buildings */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 px-1">
                  <span>รายชื่ออาคารในระบบ ({buildings.length} อาคาร)</span>
                  <span className="text-[10px] text-slate-500 font-normal">คลิกไอคอนเพื่อแก้ไขหรือลบ</span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {buildings.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      ยังไม่มีรายชื่ออาคาร กรุณาเพิ่มอาคารใหม่
                    </div>
                  ) : (
                    buildings.map((b) => {
                      const roomCount = rooms.filter(r => r.building === b).length;
                      const isEditingThis = editingBuildingOldName === b;

                      return (
                        <div 
                          key={b} 
                          className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-2"
                        >
                          {isEditingThis ? (
                            <div className="flex-1 flex items-center gap-2">
                              <input
                                type="text"
                                value={editingBuildingNewName}
                                onChange={(e) => setEditingBuildingNewName(e.target.value)}
                                className="flex-1 bg-white border border-emerald-500 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveEditBuilding(b)}
                                className="p-2 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition cursor-pointer"
                                title="บันทึกการแก้ไข"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingBuildingOldName(null);
                                  setEditingBuildingNewName('');
                                }}
                                className="p-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition cursor-pointer"
                                title="ยกเลิก"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-slate-800 text-xs truncate">{b}</div>
                                <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                                    {roomCount} ห้องพัก
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingBuildingOldName(b);
                                    setEditingBuildingNewName(b);
                                  }}
                                  className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-white rounded-xl transition border border-transparent hover:border-slate-200 cursor-pointer"
                                  title="แก้ไขชื่ออาคาร"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBuilding(b)}
                                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-200 cursor-pointer"
                                  title="ลบอาคาร"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsBuildingModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RATE SETTINGS MODAL (ADMIN / STAFF) */}
      {isRateSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-emerald-950 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-bold text-sm">กำหนดและแก้ไขอัตราค่าไฟตามกลุ่มผู้พัก</h3>
                  <p className="text-[10px] text-emerald-300">นศพ. / แพทย์ประจำบ้าน / บุคลากร ปรับลด-เพิ่มตามจริง</p>
                </div>
              </div>
              <button 
                onClick={() => setIsRateSettingsModalOpen(false)}
                className="p-1 text-emerald-300 hover:text-white rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGlobalRates} className="p-6 space-y-5 text-xs text-slate-700">
              {/* Role Tabs Header */}
              <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
                {[
                  { id: 'student', label: '🎓 นักศึกษาแพทย์ (นศพ.)', rate: tempRoleRates.studentRate, color: 'text-emerald-800' },
                  { id: 'resident', label: '🩺 แพทย์ประจำบ้าน / Extern', rate: tempRoleRates.residentRate, color: 'text-cyan-800' },
                  { id: 'staff', label: '🏢 อาจารย์ / บุคลากร', rate: tempRoleRates.staffRate, color: 'text-purple-800' }
                ].map((tab) => {
                  const isActive = activeRateRoleTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveRateRoleTab(tab.id as 'student' | 'resident' | 'staff')}
                      className={`flex-1 py-2 px-2 rounded-xl text-center font-bold text-xs transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                        isActive
                          ? 'bg-white text-emerald-950 shadow-sm border border-slate-200/80'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`text-[10px] font-mono ${isActive ? 'text-emerald-700 font-extrabold' : 'text-slate-500'}`}>
                        {tab.rate} บ./หน่วย
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* ACTIVE TAB: STUDENT */}
              {activeRateRoleTab === 'student' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="bg-emerald-50/80 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-emerald-700" />
                      <div>
                        <div className="font-bold text-emerald-950 text-xs">อัตราค่าไฟสำหรับ นักศึกษาแพทย์ (นศพ.)</div>
                        <div className="text-[10px] text-emerald-800">หอพักนักศึกษาแพทย์ มักอิงราคาตามจริงหรืออัตราสวัสดิการ</div>
                      </div>
                    </div>
                    <span className="font-mono font-extrabold text-sm text-emerald-800 bg-white px-2.5 py-1 rounded-xl border border-emerald-200 shadow-xs">
                      {tempRoleRates.studentRate.toFixed(2)} บ./หน่วย
                    </span>
                  </div>

                  {/* Rate per unit */}
                  <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-emerald-700" />
                        <span>อัตราค่าไฟฟ้าต่อหน่วย (บาท / kWh)</span>
                      </label>
                    </div>

                    {/* Presets */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {[4.50, 5.00, 5.50, 6.00].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setTempRoleRates(prev => ({ ...prev, studentRate: rate }))}
                          className={`py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            tempRoleRates.studentRate === rate
                              ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50'
                          }`}
                        >
                          {rate.toFixed(2)} บ.
                        </button>
                      ))}
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setTempRoleRates(prev => ({ ...prev, studentRate: Math.max(0.5, Number((prev.studentRate - 0.25).toFixed(2))) }))}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-bold text-xs cursor-pointer"
                      >
                        -0.25
                      </button>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={tempRoleRates.studentRate}
                        onChange={(e) => setTempRoleRates(prev => ({ ...prev, studentRate: Number(e.target.value) }))}
                        className="flex-1 bg-white border border-emerald-400 focus:border-emerald-600 rounded-xl px-3 py-1.5 text-center font-extrabold text-sm text-slate-900 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setTempRoleRates(prev => ({ ...prev, studentRate: Number((prev.studentRate + 0.25).toFixed(2)) }))}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-bold text-xs cursor-pointer"
                      >
                        +0.25
                      </button>
                    </div>
                  </div>

                  {/* Fee */}
                  <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-600" />
                        <span>ค่าบริการรักษามิเตอร์รายเดือน (บาท / เดือน)</span>
                      </label>
                      <span className="font-mono font-bold text-xs text-amber-900">{tempRoleRates.studentFee} บาท</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[0, 20, 30, 50].map((fee) => (
                        <button
                          key={fee}
                          type="button"
                          onClick={() => setTempRoleRates(prev => ({ ...prev, studentFee: fee }))}
                          className={`py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            tempRoleRates.studentFee === fee
                              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400 hover:bg-amber-50/50'
                          }`}
                        >
                          {fee === 0 ? '0 บ. (ยกเว้น)' : `${fee} บ.`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ACTIVE TAB: RESIDENT */}
              {activeRateRoleTab === 'resident' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="bg-cyan-50/80 border border-cyan-200 p-3 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-cyan-700" />
                      <div>
                        <div className="font-bold text-cyan-950 text-xs">อัตราค่าไฟสำหรับ แพทย์ประจำบ้าน / Extern / Intern</div>
                        <div className="text-[10px] text-cyan-800">ปรับเพิ่มหรือลดตามนโยบายหอพักแพทย์</div>
                      </div>
                    </div>
                    <span className="font-mono font-extrabold text-sm text-cyan-800 bg-white px-2.5 py-1 rounded-xl border border-cyan-200 shadow-xs">
                      {tempRoleRates.residentRate.toFixed(2)} บ./หน่วย
                    </span>
                  </div>

                  {/* Rate per unit */}
                  <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-cyan-700" />
                        <span>อัตราค่าไฟฟ้าต่อหน่วย (บาท / kWh)</span>
                      </label>
                    </div>

                    {/* Presets */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {[4.50, 5.00, 5.50, 6.00].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setTempRoleRates(prev => ({ ...prev, residentRate: rate }))}
                          className={`py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            tempRoleRates.residentRate === rate
                              ? 'bg-cyan-700 text-white border-cyan-700 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/50'
                          }`}
                        >
                          {rate.toFixed(2)} บ.
                        </button>
                      ))}
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setTempRoleRates(prev => ({ ...prev, residentRate: Math.max(0.5, Number((prev.residentRate - 0.25).toFixed(2))) }))}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-bold text-xs cursor-pointer"
                      >
                        -0.25
                      </button>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={tempRoleRates.residentRate}
                        onChange={(e) => setTempRoleRates(prev => ({ ...prev, residentRate: Number(e.target.value) }))}
                        className="flex-1 bg-white border border-cyan-400 focus:border-cyan-600 rounded-xl px-3 py-1.5 text-center font-extrabold text-sm text-slate-900 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setTempRoleRates(prev => ({ ...prev, residentRate: Number((prev.residentRate + 0.25).toFixed(2)) }))}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-bold text-xs cursor-pointer"
                      >
                        +0.25
                      </button>
                    </div>
                  </div>

                  {/* Fee */}
                  <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-600" />
                        <span>ค่าบริการรักษามิเตอร์รายเดือน (บาท / เดือน)</span>
                      </label>
                      <span className="font-mono font-bold text-xs text-amber-900">{tempRoleRates.residentFee} บาท</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[0, 20, 30, 50].map((fee) => (
                        <button
                          key={fee}
                          type="button"
                          onClick={() => setTempRoleRates(prev => ({ ...prev, residentFee: fee }))}
                          className={`py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            tempRoleRates.residentFee === fee
                              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400 hover:bg-amber-50/50'
                          }`}
                        >
                          {fee === 0 ? '0 บ. (ยกเว้น)' : `${fee} บ.`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ACTIVE TAB: STAFF */}
              {activeRateRoleTab === 'staff' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="bg-purple-50/80 border border-purple-200 p-3 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-purple-700" />
                      <div>
                        <div className="font-bold text-purple-950 text-xs">อัตราค่าไฟสำหรับ อาจารย์แพทย์ / บุคลากร</div>
                        <div className="text-[10px] text-purple-800">อัตราตามระเบียบที่พักบุคลากร</div>
                      </div>
                    </div>
                    <span className="font-mono font-extrabold text-sm text-purple-800 bg-white px-2.5 py-1 rounded-xl border border-purple-200 shadow-xs">
                      {tempRoleRates.staffRate.toFixed(2)} บ./หน่วย
                    </span>
                  </div>

                  {/* Rate per unit */}
                  <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-purple-700" />
                        <span>อัตราค่าไฟฟ้าต่อหน่วย (บาท / kWh)</span>
                      </label>
                    </div>

                    {/* Presets */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {[5.00, 5.50, 6.00, 6.50].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setTempRoleRates(prev => ({ ...prev, staffRate: rate }))}
                          className={`py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            tempRoleRates.staffRate === rate
                              ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-purple-400 hover:bg-purple-50/50'
                          }`}
                        >
                          {rate.toFixed(2)} บ.
                        </button>
                      ))}
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setTempRoleRates(prev => ({ ...prev, staffRate: Math.max(0.5, Number((prev.staffRate - 0.25).toFixed(2))) }))}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-bold text-xs cursor-pointer"
                      >
                        -0.25
                      </button>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={tempRoleRates.staffRate}
                        onChange={(e) => setTempRoleRates(prev => ({ ...prev, staffRate: Number(e.target.value) }))}
                        className="flex-1 bg-white border border-purple-400 focus:border-purple-600 rounded-xl px-3 py-1.5 text-center font-extrabold text-sm text-slate-900 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setTempRoleRates(prev => ({ ...prev, staffRate: Number((prev.staffRate + 0.25).toFixed(2)) }))}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-bold text-xs cursor-pointer"
                      >
                        +0.25
                      </button>
                    </div>
                  </div>

                  {/* Fee */}
                  <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-600" />
                        <span>ค่าบริการรักษามิเตอร์รายเดือน (บาท / เดือน)</span>
                      </label>
                      <span className="font-mono font-bold text-xs text-amber-900">{tempRoleRates.staffFee} บาท</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[0, 20, 30, 50].map((fee) => (
                        <button
                          key={fee}
                          type="button"
                          onClick={() => setTempRoleRates(prev => ({ ...prev, staffFee: fee }))}
                          className={`py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            tempRoleRates.staffFee === fee
                              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400 hover:bg-amber-50/50'
                          }`}
                        >
                          {fee === 0 ? '0 บ. (ยกเว้น)' : `${fee} บ.`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Realistic Overview Grid */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Calculator className="w-3.5 h-3.5 text-emerald-700" />
                  <span>สรุปอัตราเปรียบเทียบและการจำลองค่าไฟ 100 หน่วย (kWh)</span>
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white p-2 rounded-xl border border-emerald-200">
                    <div className="text-[10px] text-emerald-800 font-bold">นศพ.</div>
                    <div className="font-extrabold text-xs text-emerald-950 font-mono mt-0.5">
                      {tempRoleRates.studentRate} บ./u
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      100u = <span className="font-bold text-emerald-700">{((100 * tempRoleRates.studentRate) + tempRoleRates.studentFee).toLocaleString()} บ.</span>
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded-xl border border-cyan-200">
                    <div className="text-[10px] text-cyan-800 font-bold">แพทย์ประจำบ้าน</div>
                    <div className="font-extrabold text-xs text-cyan-950 font-mono mt-0.5">
                      {tempRoleRates.residentRate} บ./u
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      100u = <span className="font-bold text-cyan-700">{((100 * tempRoleRates.residentRate) + tempRoleRates.residentFee).toLocaleString()} บ.</span>
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded-xl border border-purple-200">
                    <div className="text-[10px] text-purple-800 font-bold">อาจารย์/บุคลากร</div>
                    <div className="font-extrabold text-xs text-purple-950 font-mono mt-0.5">
                      {tempRoleRates.staffRate} บ./u
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      100u = <span className="font-bold text-purple-700">{((100 * tempRoleRates.staffRate) + tempRoleRates.staffFee).toLocaleString()} บ.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Apply Scope Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">เลือกรูปแบบการปรับใช้อัตรากับห้องพัก ({rooms.length} ห้อง)</label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2.5 p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-300 cursor-pointer">
                    <input
                      type="radio"
                      name="rateApplyMode"
                      checked={rateApplyMode === 'smart_by_role'}
                      onChange={() => setRateApplyMode('smart_by_role')}
                      className="text-emerald-700 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="font-bold text-emerald-950 text-xs">
                        🌟 ปรับตามกลุ่มผู้พักอัตโนมัติ (แนะนำ)
                      </div>
                      <div className="text-[10px] text-emerald-800">
                        นศพ. ได้เรท {tempRoleRates.studentRate} บ. | แพทย์ประจำบ้านได้เรท {tempRoleRates.residentRate} บ.
                      </div>
                    </div>
                  </label>

                  <div className="grid grid-cols-2 gap-1.5">
                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                      <input
                        type="radio"
                        name="rateApplyMode"
                        checked={rateApplyMode === 'student_only'}
                        onChange={() => setRateApplyMode('student_only')}
                        className="text-emerald-700 focus:ring-emerald-500"
                      />
                      <span className="text-[11px] font-bold text-slate-700">ปรับเฉพาะห้อง นศพ.</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                      <input
                        type="radio"
                        name="rateApplyMode"
                        checked={rateApplyMode === 'resident_only'}
                        onChange={() => setRateApplyMode('resident_only')}
                        className="text-emerald-700 focus:ring-emerald-500"
                      />
                      <span className="text-[11px] font-bold text-slate-700">ปรับเฉพาะห้องแพทย์ประจำบ้าน</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRateSettingsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-700 hover:bg-emerald-800 shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>บันทึกและปรับใช้อัตราค่าไฟ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT BILL / ADJUST RATE MODAL (ADMIN / STAFF) */}
      {isEditBillModalOpen && editingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-emerald-950 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm">
                  แก้ไขใบแจ้งหนี้ / ปรับยอดตามจริง (ห้อง {editingBill.roomNumber})
                </h3>
              </div>
              <button 
                onClick={() => {
                  setIsEditBillModalOpen(false);
                  setEditingBill(null);
                }}
                className="p-1 text-emerald-300 hover:text-white rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedBill} className="p-6 space-y-4 text-xs text-slate-700">
              {/* Room summary header */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 text-xs">
                    ห้อง {editingBill.roomNumber} ({editingBill.building})
                  </div>
                  <div className="text-[11px] text-slate-500">
                    ผู้พักอาศัย: {editingBill.occupantName} ({editingBill.department})
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                    รอบเดือน {editingBill.monthYear}
                  </span>
                </div>
              </div>

              {/* Meter readings row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">มิเตอร์เดิม (kWh):</label>
                  <input
                    type="number"
                    required
                    value={billEditForm.previousMeter}
                    onChange={(e) => setBillEditForm({ ...billEditForm, previousMeter: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">มิเตอร์ใหม่ (kWh):</label>
                  <input
                    type="number"
                    required
                    value={billEditForm.currentMeter}
                    onChange={(e) => setBillEditForm({ ...billEditForm, currentMeter: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-emerald-800 text-[11px]">คำนวณหน่วยใช้ไฟ:</label>
                  <div className="w-full bg-emerald-100/70 border border-emerald-300 rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-900 text-center">
                    {Math.max(0, Number(billEditForm.currentMeter) - Number(billEditForm.previousMeter))} kWh
                  </div>
                </div>
              </div>

              {/* Rates & Base Fee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">อัตราค่าไฟต่อหน่วย (บาท/หน่วย):</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={billEditForm.ratePerUnit}
                    onChange={(e) => {
                      const newRate = Number(e.target.value);
                      const units = Math.max(0, Number(billEditForm.currentMeter) - Number(billEditForm.previousMeter));
                      const autoTotal = (units * newRate) + Number(billEditForm.baseServiceFee) - Number(billEditForm.discountAmount);
                      setBillEditForm({ 
                        ...billEditForm, 
                        ratePerUnit: newRate,
                        totalAmount: Math.max(0, autoTotal)
                      });
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">ค่าบริการรักษามิเตอร์ (บาท):</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={billEditForm.baseServiceFee}
                    onChange={(e) => {
                      const newFee = Number(e.target.value);
                      const units = Math.max(0, Number(billEditForm.currentMeter) - Number(billEditForm.previousMeter));
                      const autoTotal = (units * Number(billEditForm.ratePerUnit)) + newFee - Number(billEditForm.discountAmount);
                      setBillEditForm({ 
                        ...billEditForm, 
                        baseServiceFee: newFee,
                        totalAmount: Math.max(0, autoTotal)
                      });
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Discount / Adjustment */}
              <div className="space-y-1 bg-amber-50 p-3.5 rounded-2xl border border-amber-200">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-amber-950 text-[11px] flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5 text-amber-700" />
                    <span>ส่วนลด / ปรับลดยอดค่าไฟตามจริง (บาท):</span>
                  </label>
                  <span className="text-[10px] text-amber-800">กรอก 0 หากไม่มีส่วนลด</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    value={billEditForm.discountAmount}
                    onChange={(e) => {
                      const discount = Number(e.target.value);
                      const units = Math.max(0, Number(billEditForm.currentMeter) - Number(billEditForm.previousMeter));
                      const autoTotal = (units * Number(billEditForm.ratePerUnit)) + Number(billEditForm.baseServiceFee) - discount;
                      setBillEditForm({ 
                        ...billEditForm, 
                        discountAmount: discount,
                        totalAmount: Math.max(0, autoTotal)
                      });
                    }}
                    className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <div className="flex items-center gap-1">
                    {[0, 30, 50, 100].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          const units = Math.max(0, Number(billEditForm.currentMeter) - Number(billEditForm.previousMeter));
                          const autoTotal = (units * Number(billEditForm.ratePerUnit)) + Number(billEditForm.baseServiceFee) - d;
                          setBillEditForm({ 
                            ...billEditForm, 
                            discountAmount: d,
                            totalAmount: Math.max(0, autoTotal)
                          });
                        }}
                        className="px-2 py-1 bg-white hover:bg-amber-100 border border-amber-200 rounded-lg text-[10px] font-bold text-amber-900 cursor-pointer"
                      >
                        -{d}บ.
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Total Amount & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-emerald-950 text-xs">ยอดรวมสุทธิที่ต้องชำระ (บาท):</label>
                  <input
                    type="number"
                    required
                    value={billEditForm.totalAmount}
                    onChange={(e) => setBillEditForm({ ...billEditForm, totalAmount: Number(e.target.value) })}
                    className="w-full bg-emerald-50 border border-emerald-400 focus:border-emerald-600 rounded-xl px-3 py-2 text-sm font-extrabold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-xs">กำหนดชำระเงิน:</label>
                  <input
                    type="date"
                    required
                    value={billEditForm.dueDate}
                    onChange={(e) => setBillEditForm({ ...billEditForm, dueDate: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Status & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-xs">สถานะบิล:</label>
                  <select
                    value={billEditForm.status}
                    onChange={(e) => setBillEditForm({ ...billEditForm, status: e.target.value as BillStatus })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="unpaid">ยังไม่ชำระ (Unpaid)</option>
                    <option value="pending_verify">รอตรวจสอบหลักฐาน (Pending)</option>
                    <option value="paid">ชำระเงินแล้ว (Paid)</option>
                    <option value="overdue">เกินกำหนดชำระ (Overdue)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-xs">หมายเหตุการปรับปรุง/ลดหย่อน:</label>
                  <input
                    type="text"
                    value={billEditForm.notes}
                    onChange={(e) => setBillEditForm({ ...billEditForm, notes: e.target.value })}
                    placeholder="เช่น: ปรับลดยอดตามจริง / มิเตอร์อ่านคลาดเคลื่อน"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditBillModalOpen(false);
                    setEditingBill(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-700 hover:bg-emerald-800 shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>บันทึกการแก้ไขบิล</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
