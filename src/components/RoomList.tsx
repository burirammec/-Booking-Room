import React, { useState } from 'react';
import { 
  Users, 
  Tv, 
  Airplay, 
  Mic, 
  Video, 
  Monitor, 
  Stethoscope, 
  Info, 
  CalendarPlus, 
  Search, 
  Filter,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { Room, RoomCategory } from '../types';

interface RoomListProps {
  rooms: Room[];
  onSelectRoomToBook: (room: Room) => void;
  onViewRoomDetails: (room: Room) => void;
}

export const RoomList: React.FC<RoomListProps> = ({
  rooms,
  onSelectRoomToBook,
  onViewRoomDetails
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [minCapacity, setMinCapacity] = useState<number>(0);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [showEquipmentFilter, setShowEquipmentFilter] = useState(true);

  const categories = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'lecture', label: 'ห้องบรรยายใหญ่' },
    { id: 'pbl', label: 'ห้องเรียน (PBL)' },
    { id: 'skill_lab', label: 'ปฏิบัติการทักษะ (OSCE)' },
    { id: 'it', label: 'คอมพิวเตอร์ & E-Learning' },
    { id: 'lounge', label: 'ห้องพักนักศึกษา' },
  ];

  const equipmentOptions = [
    { id: 'projector', label: 'โปรเจคเตอร์', icon: Airplay },
    { id: 'smartBoard', label: 'Smart Display / Board', icon: Tv },
    { id: 'microphone', label: 'ไมโครโฟนไร้สาย', icon: Mic },
    { id: 'hybridZoom', label: 'Hybrid Zoom / VDO', icon: Video },
    { id: 'osceDummies', label: 'หุ่นซ้อมหัตถการ (OSCE)', icon: Stethoscope },
    { id: 'hasComputer', label: 'มีคอมพิวเตอร์', icon: Monitor },
  ];

  const buildings = Array.from(new Set(rooms.map(r => r.building))).filter(Boolean);

  const toggleEquipmentFilter = (eqId: string) => {
    setSelectedEquipment(prev =>
      prev.includes(eqId)
        ? prev.filter(id => id !== eqId)
        : [...prev, eqId]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedBuilding('all');
    setMinCapacity(0);
    setSelectedEquipment([]);
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          room.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          room.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          room.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || room.category === selectedCategory;
    const matchesBuilding = selectedBuilding === 'all' || room.building === selectedBuilding;
    const matchesCapacity = room.capacity >= minCapacity;

    const matchesEquipment = selectedEquipment.every(eqId => {
      if (eqId === 'projector') return room.equipment.projector;
      if (eqId === 'smartBoard') return room.equipment.smartBoard;
      if (eqId === 'microphone') return room.equipment.microphone;
      if (eqId === 'hybridZoom') return room.equipment.hybridZoom;
      if (eqId === 'osceDummies') return room.equipment.osceDummies;
      if (eqId === 'hasComputer') return (room.equipment.computersCount || 0) > 0;
      return true;
    });

    return matchesSearch && matchesCategory && matchesBuilding && matchesCapacity && matchesEquipment;
  });

  const activeFiltersCount = (selectedCategory !== 'all' ? 1 : 0) +
                             (selectedBuilding !== 'all' ? 1 : 0) +
                             (minCapacity > 0 ? 1 : 0) +
                             selectedEquipment.length +
                             (searchQuery.trim() !== '' ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        {/* Top Search & Dropdown Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อห้อง, รหัสห้อง, อาคาร หรือคำอธิบาย..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold bg-slate-200/80 rounded-full w-5 h-5 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Building Filter */}
            <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-semibold">อาคาร:</span>
              <select
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
              >
                <option value="all">ทุกอาคาร</option>
                {buildings.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Capacity Filter */}
            <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-500 font-semibold">ความจุ:</span>
              <select
                value={minCapacity}
                onChange={(e) => setMinCapacity(Number(e.target.value))}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
              >
                <option value={0}>ทั้งหมด</option>
                <option value={15}>15 คนขึ้นไป</option>
                <option value={30}>30 คนขึ้นไป</option>
                <option value={50}>50 คนขึ้นไป</option>
                <option value={100}>100 คนขึ้นไป</option>
              </select>
            </div>

            {/* Reset Filter Button */}
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl border border-rose-200 font-semibold transition flex items-center gap-1 active:scale-95"
              >
                <span>ล้างตัวกรอง ({activeFiltersCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>ประเภทห้องเรียน / ห้องปฏิบัติการ:</span>
          </div>
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-800 text-white shadow-sm font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Equipment Filter Toggles */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3 h-3 text-emerald-600" />
              <span>ตัวกรองตามอุปกรณ์และสิ่งอำนวยความสะดวกภายในห้อง:</span>
            </span>
            <button
              onClick={() => setShowEquipmentFilter(!showEquipmentFilter)}
              className="text-[11px] text-emerald-700 hover:underline font-semibold"
            >
              {showEquipmentFilter ? 'ซ่อนตัวกรองอุปกรณ์' : 'แสดงตัวกรองอุปกรณ์'}
            </button>
          </div>

          {showEquipmentFilter && (
            <div className="flex flex-wrap gap-2 pt-1">
              {equipmentOptions.map((eq) => {
                const IconComponent = eq.icon;
                const isSelected = selectedEquipment.includes(eq.id);
                return (
                  <button
                    key={eq.id}
                    onClick={() => toggleEquipmentFilter(eq.id)}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-xs border border-emerald-800'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                    <span>{eq.label}</span>
                    {isSelected && <span className="ml-1 text-[10px] bg-emerald-900/60 text-emerald-100 px-1 py-0.2 rounded-full">✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Filter Summary Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div>
            พบห้องเรียนทั้งหมด <strong className="text-emerald-800 font-bold">{filteredRooms.length}</strong> ห้อง (จาก {rooms.length} ห้อง)
          </div>
          {activeFiltersCount > 0 && (
            <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-medium border border-emerald-200/80">
              กำลังกรองด้วย {activeFiltersCount} เงื่อนไข
            </div>
          )}
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <div
            key={room.id}
            className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
          >
            {/* Image Header */}
            <div className="relative h-48 overflow-hidden bg-slate-100">
              <img
                src={room.image}
                alt={room.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              <div className="absolute top-3 left-3 flex items-center space-x-2">
                <span className="bg-emerald-950/90 text-emerald-100 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-emerald-700/80 backdrop-blur-md">
                  {room.code}
                </span>
                <span className="bg-emerald-700/90 text-white text-[11px] font-medium px-2.5 py-1 rounded-lg backdrop-blur-md">
                  {room.categoryName}
                </span>
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="text-xs text-slate-300 font-medium">
                  {room.building} • {room.floor}
                </div>
                <h3 className="text-base font-bold text-white tracking-tight truncate leading-tight mt-0.5">
                  {room.name}
                </h3>
              </div>
            </div>

            {/* Room Specs & Content */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {room.description}
                </p>

                {/* Capacity & Badges */}
                <div className="mt-3.5 flex items-center justify-between text-xs border-t border-b border-slate-100 py-2.5">
                  <div className="flex items-center space-x-1.5 text-slate-700 font-medium">
                    <Users className="w-4 h-4 text-emerald-700" />
                    <span>ความจุ {room.capacity} ที่นั่ง</span>
                  </div>
                  <div className="flex items-center space-x-1 text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>พร้อมใช้งาน</span>
                  </div>
                </div>

                {/* Equipment Icons Grid */}
                <div className="mt-3">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    อุปกรณ์และสิ่งอำนวยความสะดวก:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {room.equipment.projector && (
                      <span className="inline-flex items-center space-x-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-1 rounded-md">
                        <Airplay className="w-3 h-3 text-slate-500" />
                        <span>โปรเจคเตอร์</span>
                      </span>
                    )}
                    {room.equipment.smartBoard && (
                      <span className="inline-flex items-center space-x-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-1 rounded-md">
                        <Tv className="w-3 h-3 text-slate-500" />
                        <span>Smart Display</span>
                      </span>
                    )}
                    {room.equipment.microphone && (
                      <span className="inline-flex items-center space-x-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-1 rounded-md">
                        <Mic className="w-3 h-3 text-slate-500" />
                        <span>ไมค์ไร้สาย</span>
                      </span>
                    )}
                    {room.equipment.hybridZoom && (
                      <span className="inline-flex items-center space-x-1 text-[11px] bg-emerald-50 text-emerald-800 px-2 py-1 rounded-md border border-emerald-200">
                        <Video className="w-3 h-3 text-emerald-700" />
                        <span>Hybrid Zoom</span>
                      </span>
                    )}
                    {room.equipment.osceDummies && (
                      <span className="inline-flex items-center space-x-1 text-[11px] bg-teal-50 text-teal-800 px-2 py-1 rounded-md border border-teal-200">
                        <Stethoscope className="w-3 h-3 text-teal-700" />
                        <span>หุ่นซ้อมหัตถการ</span>
                      </span>
                    )}
                    {room.equipment.computersCount && (
                      <span className="inline-flex items-center space-x-1 text-[11px] bg-emerald-50/80 text-emerald-900 px-2 py-1 rounded-md border border-emerald-200">
                        <Monitor className="w-3 h-3 text-emerald-700" />
                        <span>คอมพิวเตอร์ {room.equipment.computersCount} เครื่อง</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center space-x-2">
                <button
                  onClick={() => onViewRoomDetails(room)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center justify-center space-x-1"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>ดูรายละเอียด</span>
                </button>
                <button
                  onClick={() => onSelectRoomToBook(room)}
                  className="flex-1 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm transition flex items-center justify-center space-x-1 active:scale-95"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>ขอจองห้องนี้</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredRooms.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <Info className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-700">ไม่พบห้องที่ตรงกับเงื่อนไขการค้นหา</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              ลองเปลี่ยนคำค้นหา ปรับความจุขั้นต่ำ หรือเปลี่ยนหมวดหมู่เพื่อดูห้องเพิ่มเติม
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
