import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  AlertTriangle,
  MapPin,
  DollarSign,
  Users,
  User,
  Edit2,
  Plus,
  Trash2,
  Copy,
  Settings,
  Mail,
  Phone,
  Target,
  Search,
  Filter,
  CheckCircle2,
  Layers,
  ChevronDown,
  Info,
} from 'lucide-react';
import { Activity, ConflictIssue, DepartmentProfile, ActivityStatus, Semester } from '../types';
import {
  DEPARTMENTS_LIST,
  CATEGORY_CONFIG,
  STATUS_CONFIG,
  normalizeStatus,
  ACADEMIC_YEAR_MONTHS,
} from '../data/initialData';
import { formatCurrencyVND, formatDateRangeVN } from '../utils/conflictDetector';
import { DepartmentInfoModal } from './DepartmentInfoModal';

interface DepartmentMatrixViewProps {
  activities: Activity[];
  conflictMap: Record<string, ConflictIssue[]>;
  selectedMonth: number;
  selectedYear: number;
  departmentProfiles: Record<string, DepartmentProfile>;
  onEditActivity: (activity: Activity) => void;
  onAddNewForDepartment: (department: string) => void;
  onDeleteActivity: (id: string) => void;
  onDuplicateActivity: (activity: Activity) => void;
  onUpdateStatus: (id: string, status: ActivityStatus) => void;
  onSaveDepartmentProfile: (profile: DepartmentProfile) => void;
  onAddNewDepartment?: (deptName: string) => void;
}

export const DepartmentMatrixView: React.FC<DepartmentMatrixViewProps> = ({
  activities,
  conflictMap,
  selectedMonth,
  selectedYear,
  departmentProfiles,
  onEditActivity,
  onAddNewForDepartment,
  onDeleteActivity,
  onDuplicateActivity,
  onUpdateStatus,
  onSaveDepartmentProfile,
  onAddNewDepartment,
}) => {
  // Local filter states within Department View
  const [timeScope, setTimeScope] = useState<'all' | 'current_month' | 'hk1' | 'hk2' | 'he'>('all');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'loading' | 'done' | 'cancel'>('ALL');
  const [searchDeptQuery, setSearchDeptQuery] = useState<string>('');
  
  // Department Info Modal state
  const [editingDeptProfile, setEditingDeptProfile] = useState<string | null>(null);

  // New Department input state
  const [showAddDeptInput, setShowAddDeptInput] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');

  // Get active departments list (from DEPARTMENTS_LIST + any custom ones in activities or profiles)
  const allDeptNames = Array.from(
    new Set([
      ...DEPARTMENTS_LIST,
      ...Object.keys(departmentProfiles),
      ...activities.map((a) => a.department).filter(Boolean),
    ])
  );

  // Filter activities based on local filters
  const filteredActivities = activities.filter((act) => {
    // Time filter
    if (timeScope === 'current_month') {
      if (act.month !== selectedMonth || act.year !== selectedYear) return false;
    } else if (timeScope === 'hk1') {
      if (act.semester !== 'HK1') return false;
    } else if (timeScope === 'hk2') {
      if (act.semester !== 'HK2') return false;
    } else if (timeScope === 'he') {
      if (act.semester !== 'Hè') return false;
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      if (normalizeStatus(act.status) !== statusFilter) return false;
    }

    // Search query
    if (searchDeptQuery.trim()) {
      const q = searchDeptQuery.toLowerCase();
      const mTitle = (act.title || '').toLowerCase().includes(q);
      const mDept = (act.department || '').toLowerCase().includes(q);
      const mLoc = (act.location || '').toLowerCase().includes(q);
      const mAud = (act.targetAudience || '').toLowerCase().includes(q);
      const mNotes = (act.notes || '').toLowerCase().includes(q);
      if (!mTitle && !mDept && !mLoc && !mAud && !mNotes) return false;
    }

    return true;
  });

  const handleCreateNewDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    const name = newDeptName.trim();
    if (onAddNewDepartment) {
      onAddNewDepartment(name);
    }
    // Also init profile
    onSaveDepartmentProfile({
      department: name,
      code: name.substring(0, 3).toUpperCase(),
      headName: '',
      deputyName: '',
      memberCount: 0,
      officeLocation: '',
      focusObjectives: '',
      allocatedBudget: 0,
    });
    setNewDeptName('');
    setShowAddDeptInput(false);
  };

  return (
    <div className="space-y-5">
      {/* 1. View Header & Quick Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-100">
              Quản Trị Lịch Phòng Ban
            </span>
            <span className="text-xs font-bold text-slate-500">
              Năm Học 2026 - 2027
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-orange-600" />
            <span>ĐIỀU PHỐI & CHỈNH SỬA LỊCH CÁC TỔ, PHÒNG BAN</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Xem và chỉnh sửa toàn diện thông tin hoạt động, người phụ trách, mục tiêu trọng tâm và kinh phí của từng Tổ & Phòng Ban.
          </p>
        </div>

        {/* Add new department button */}
        <div className="flex items-center gap-2">
          {!showAddDeptInput ? (
            <button
              id="btn-add-custom-dept"
              onClick={() => setShowAddDeptInput(true)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-orange-400" />
              <span>Thêm Tổ / Phòng Ban Mới</span>
            </button>
          ) : (
            <form onSubmit={handleCreateNewDept} className="flex items-center gap-1.5">
              <input
                type="text"
                autoFocus
                placeholder="Nhập tên tổ / ban mới..."
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Lưu
              </button>
              <button
                type="button"
                onClick={() => setShowAddDeptInput(false)}
                className="px-2 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Hủy
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 2. Secondary Filter Bar within Department View */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Scope selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
            <button
              onClick={() => setTimeScope('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                timeScope === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Toàn Năm Học
            </button>
            <button
              onClick={() => setTimeScope('current_month')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                timeScope === 'current_month'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Tháng {selectedMonth}/{selectedYear}
            </button>
            <button
              onClick={() => setTimeScope('hk1')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                timeScope === 'hk1'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Học Kỳ 1
            </button>
            <button
              onClick={() => setTimeScope('hk2')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                timeScope === 'hk2'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Học Kỳ 2
            </button>
            <button
              onClick={() => setTimeScope('he')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                timeScope === 'he'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Kỳ Hè
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Tất cả trạng thái
            </button>
            <button
              onClick={() => setStatusFilter('loading')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'loading'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-2xs'
                  : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              ⏳ Loading
            </button>
            <button
              onClick={() => setStatusFilter('done')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'done'
                  ? 'bg-emerald-600 text-white font-black shadow-2xs'
                  : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              ✅ Done
            </button>
            <button
              onClick={() => setStatusFilter('cancel')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'cancel'
                  ? 'bg-rose-600 text-white font-black shadow-2xs'
                  : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              🚫 Cancel
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchDeptQuery}
            onChange={(e) => setSearchDeptQuery(e.target.value)}
            placeholder="Tìm kiếm công việc phòng ban..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* 3. Grid of Departments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {allDeptNames.map((dept) => {
          const deptActs = filteredActivities.filter((a) => a.department === dept);
          const deptConflicts = deptActs.filter((a) => (conflictMap[a.id] || []).length > 0);
          const deptTotalBudget = deptActs.reduce((acc, curr) => acc + (curr.budget || 0), 0);
          const profile = departmentProfiles[dept] || {
            department: dept,
            code: dept.substring(0, 3).toUpperCase(),
          };

          return (
            <div
              key={dept}
              id={`dept-card-${dept}`}
              className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden ${
                deptConflicts.length > 0
                  ? 'border-red-300 ring-2 ring-red-300/40 shadow-xs'
                  : 'border-slate-200 shadow-2xs hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              {/* Card Header with Department Info & Action Buttons */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/80">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-950 text-amber-400 font-black text-xs flex items-center justify-center shadow-xs">
                      {profile.code || dept.substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-sm leading-tight">
                        Tổ / Ban: {dept}
                      </h3>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        {deptActs.length} hoạt động
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Conflict Badge */}
                    {deptConflicts.length > 0 && (
                      <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center gap-1 animate-pulse mr-1">
                        <AlertTriangle className="w-3 h-3" />
                        {deptConflicts.length} trùng
                      </span>
                    )}

                    {/* Edit Department Profile Button */}
                    <button
                      id={`btn-edit-dept-${dept}`}
                      onClick={() => setEditingDeptProfile(dept)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                      title="Sửa thông tin Tổ / Phòng ban (Người phụ trách, nhân sự, mục tiêu, ngân sách)"
                    >
                      <Settings className="w-4 h-4" />
                    </button>

                    {/* Add Activity Button */}
                    <button
                      onClick={() => onAddNewForDepartment(dept)}
                      className="p-1.5 text-white bg-orange-600 hover:bg-orange-700 rounded-lg font-bold transition-colors shadow-2xs cursor-pointer"
                      title={`Thêm hoạt động mới cho tổ ${dept}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Department Profile Metadata Snippet */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  {profile.headName && (
                    <div className="flex items-center gap-1 truncate" title={`Trưởng tổ/ban: ${profile.headName}`}>
                      <User className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">
                        <strong className="text-slate-800 font-semibold">Trưởng:</strong> {profile.headName}
                      </span>
                    </div>
                  )}
                  {profile.memberCount !== undefined && profile.memberCount > 0 && (
                    <div className="flex items-center gap-1 truncate" title={`Nhân sự: ${profile.memberCount} GV/CBNV`}>
                      <Users className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>
                        <strong className="text-slate-800 font-semibold">Nhân sự:</strong> {profile.memberCount} người
                      </span>
                    </div>
                  )}
                  {profile.officeLocation && (
                    <div className="flex items-center gap-1 col-span-2 truncate text-slate-500" title={`Địa điểm: ${profile.officeLocation}`}>
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{profile.officeLocation}</span>
                    </div>
                  )}
                  {profile.focusObjectives && (
                    <div className="col-span-2 text-[10px] text-indigo-900 bg-indigo-50/70 p-1.5 rounded-lg border border-indigo-100/70 leading-relaxed font-medium line-clamp-2" title={profile.focusObjectives}>
                      🎯 <span className="font-bold">Mục tiêu:</span> {profile.focusObjectives}
                    </div>
                  )}
                </div>
              </div>

              {/* Activities List */}
              <div className="p-3.5 space-y-2.5 flex-1 max-h-[380px] overflow-y-auto scrollbar-thin">
                {deptActs.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    <p className="italic">Chưa có hoạt động nào được phân công.</p>
                    <button
                      onClick={() => onAddNewForDepartment(dept)}
                      className="mt-2 text-orange-600 hover:text-orange-700 font-bold inline-flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm hoạt động đầu tiên</span>
                    </button>
                  </div>
                ) : (
                  deptActs.map((act) => {
                    const actConflicts = conflictMap[act.id] || [];
                    const isConflicted = actConflicts.length > 0;
                    const catStyle = CATEGORY_CONFIG[act.category] || {
                      badge: 'bg-slate-600 text-white',
                      hex: '#64748b',
                    };
                    const sKey = normalizeStatus(act.status);

                    return (
                      <div
                        key={act.id}
                        className={`p-3 rounded-xl border text-xs transition-all space-y-2 group ${
                          isConflicted
                            ? 'bg-red-50/70 border-red-300 text-red-950 font-medium'
                            : sKey === 'cancel'
                            ? 'bg-slate-50 border-slate-200 opacity-70'
                            : 'bg-slate-50/60 border-slate-200 text-slate-800 hover:bg-white hover:border-slate-300 hover:shadow-2xs'
                        }`}
                      >
                        {/* Title & Category Badge */}
                        <div className="flex items-start justify-between gap-1.5">
                          <div
                            onClick={() => onEditActivity(act)}
                            className={`font-black leading-snug flex-1 cursor-pointer hover:text-orange-600 transition-colors ${
                              sKey === 'cancel' ? 'line-through text-slate-500' : 'text-slate-900'
                            }`}
                          >
                            {act.title}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap ${catStyle.badge}`}
                            >
                              {act.category}
                            </span>
                          </div>
                        </div>

                        {/* Details (Date, Location, Budget, Audience) */}
                        <div className="space-y-1 text-[11px] text-slate-600">
                          <div className="flex items-center gap-1 font-semibold text-slate-700">
                            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{formatDateRangeVN(act.startDate, act.endDate)}</span>
                          </div>
                          {act.targetAudience && (
                            <div className="flex items-center gap-1 text-slate-500">
                              <Users className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{act.targetAudience}</span>
                            </div>
                          )}
                          {act.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{act.location}</span>
                            </div>
                          )}
                          {act.budget > 0 && (
                            <div className="flex items-center gap-1 font-bold text-emerald-700">
                              <DollarSign className="w-3 h-3 text-emerald-500 shrink-0" />
                              <span>{formatCurrencyVND(act.budget)}</span>
                            </div>
                          )}
                        </div>

                        {/* Conflict warning badge */}
                        {isConflicted && (
                          <div className="p-1.5 bg-red-100 text-red-900 border border-red-300 rounded-lg text-[10px] font-medium flex items-start gap-1">
                            <AlertTriangle className="w-3 h-3 text-red-600 shrink-0 mt-0.5" />
                            <span>{actConflicts[0]?.description}</span>
                          </div>
                        )}

                        {/* Direct Action Row: Status Selector & Edit/Duplicate/Delete Buttons */}
                        <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between gap-1.5">
                          {/* Quick Status Dropdown */}
                          <select
                            value={sKey}
                            onChange={(e) => onUpdateStatus(act.id, e.target.value as ActivityStatus)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-black border cursor-pointer ${
                              sKey === 'loading'
                                ? 'bg-amber-100 text-amber-950 border-amber-300'
                                : sKey === 'done'
                                ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                                : 'bg-rose-100 text-rose-950 border-rose-300'
                            }`}
                          >
                            <option value="loading">⏳ Loading</option>
                            <option value="done">✅ Done</option>
                            <option value="cancel">🚫 Cancel</option>
                          </select>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onEditActivity(act)}
                              className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Chỉnh sửa chi tiết thông tin hoạt động"
                            >
                              <Edit2 className="w-3 h-3 text-indigo-600" />
                              <span>Sửa</span>
                            </button>

                            <button
                              onClick={() => onDuplicateActivity(act)}
                              className="p-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                              title="Sao chép / Nhân bản hoạt động này"
                            >
                              <Copy className="w-3 h-3" />
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`Xóa hoạt động "${act.title}" của tổ ${dept}?`)) {
                                  onDeleteActivity(act.id);
                                }
                              }}
                              className="p-1 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-300 rounded-lg transition-colors cursor-pointer"
                              title="Xóa hoạt động này"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Card Footer Budget & Allocation Comparison */}
              <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 font-medium block text-[10px]">
                    Dự toán kế hoạch:
                  </span>
                  <span className="font-black text-emerald-700 text-xs">
                    {formatCurrencyVND(deptTotalBudget)}
                  </span>
                </div>

                {profile.allocatedBudget && profile.allocatedBudget > 0 ? (
                  <div className="text-right">
                    <span className="text-slate-400 font-medium block text-[10px]">
                      Hạn mức cấp:
                    </span>
                    <span className="font-bold text-slate-700 text-xs">
                      {formatCurrencyVND(profile.allocatedBudget)}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Department Info Edit Modal */}
      {editingDeptProfile && (
        <DepartmentInfoModal
          isOpen={!!editingDeptProfile}
          onClose={() => setEditingDeptProfile(null)}
          departmentName={editingDeptProfile}
          initialProfile={departmentProfiles[editingDeptProfile]}
          onSaveProfile={(updatedProfile) => {
            onSaveDepartmentProfile(updatedProfile);
          }}
        />
      )}
    </div>
  );
};

