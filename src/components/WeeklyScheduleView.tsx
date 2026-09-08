import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Video,
  Clock,
  MapPin,
  User,
  Users,
  Building,
  GraduationCap,
  ExternalLink,
  Copy,
  Check,
  Bell,
  Download,
  Filter,
  Search,
  CheckCircle2,
  Loader2,
  XCircle,
  Edit2,
  Trash2,
  Sparkles,
  LayoutGrid,
  List,
  Layers,
  ChevronDown,
} from 'lucide-react';
import {
  WeeklyActivity,
  WeeklyUnit,
  WeeklyUnitType,
  ActivityStatus,
} from '../types';
import {
  ACADEMIC_UNITS_LIST,
  ADMIN_UNITS_LIST,
  ALL_WEEKLY_UNITS,
  UNIT_CONFIG_MAP,
  getUnitConfig,
  getDaysOfWeek,
  getWeekRangeLabel,
  getAcademicWeekNumber,
  getOutlookCalendarUrl,
  downloadICSFile,
} from '../utils/weeklyOutlookHelper';
import { normalizeStatus, STATUS_CONFIG } from '../data/initialData';

interface WeeklyScheduleViewProps {
  activities: WeeklyActivity[];
  onAddWeeklyActivity: (defaultDate?: string, defaultUnit?: WeeklyUnit) => void;
  onEditWeeklyActivity: (activity: WeeklyActivity) => void;
  onDeleteWeeklyActivity: (id: string) => void;
  onUpdateWeeklyStatus: (id: string, status: ActivityStatus) => void;
  onClearAllWeekly?: () => void;
}

export const WeeklyScheduleView: React.FC<WeeklyScheduleViewProps> = ({
  activities,
  onAddWeeklyActivity,
  onEditWeeklyActivity,
  onDeleteWeeklyActivity,
  onUpdateWeeklyStatus,
  onClearAllWeekly,
}) => {
  // Current focused date for weekly view (default: 2026-09-07)
  const [currentWeekDate, setCurrentWeekDate] = useState<string>('2026-09-07');
  const [viewLayout, setViewLayout] = useState<'matrix' | 'list' | 'by_unit'>('matrix');

  // Filter States
  const [selectedGroupType, setSelectedGroupType] = useState<'ALL' | 'academic' | 'admin'>('ALL');
  const [selectedUnit, setSelectedUnit] = useState<string>('ALL');
  const [onlineFilter, setOnlineFilter] = useState<'ALL' | 'online_only' | 'offline_only'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'loading' | 'done' | 'cancel'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Copy feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Compute Days in the current week (Mon -> Sun)
  const weekDays = useMemo(() => {
    return getDaysOfWeek(currentWeekDate);
  }, [currentWeekDate]);

  const weekRange = useMemo(() => {
    return getWeekRangeLabel(currentWeekDate);
  }, [currentWeekDate]);

  const weekNumber = useMemo(() => {
    return getAcademicWeekNumber(currentWeekDate);
  }, [currentWeekDate]);

  // Week navigation
  const handlePrevWeek = () => {
    const d = new Date(currentWeekDate);
    d.setDate(d.getDate() - 7);
    setCurrentWeekDate(d.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const d = new Date(currentWeekDate);
    d.setDate(d.getDate() + 7);
    setCurrentWeekDate(d.toISOString().split('T')[0]);
  };

  const handleCurrentWeek = () => {
    setCurrentWeekDate('2026-09-07');
  };

  // Filter activities for the current week and criteria
  const weekDateStrings = useMemo(() => weekDays.map((d) => d.dateStr), [weekDays]);

  const currentWeekActivities = useMemo(() => {
    return activities.filter((a) => {
      // Must be within current week
      if (!weekDateStrings.includes(a.date)) return false;

      // Group type filter
      if (selectedGroupType !== 'ALL' && a.unitType !== selectedGroupType) return false;

      // Unit filter
      if (selectedUnit !== 'ALL' && a.unit !== selectedUnit) return false;

      // Online filter
      if (onlineFilter === 'online_only' && !a.isOnline) return false;
      if (onlineFilter === 'offline_only' && a.isOnline) return false;

      // Status filter
      if (statusFilter !== 'ALL' && normalizeStatus(a.status) !== statusFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mTitle = (a.title || '').toLowerCase().includes(q);
        const mUnit = (a.unit || '').toLowerCase().includes(q);
        const mHost = (a.host || '').toLowerCase().includes(q);
        const mNotes = (a.contentNotes || '').toLowerCase().includes(q);
        const mLoc = (a.location || '').toLowerCase().includes(q);
        if (!mTitle && !mUnit && !mHost && !mNotes && !mLoc) return false;
      }

      return true;
    });
  }, [
    activities,
    weekDateStrings,
    selectedGroupType,
    selectedUnit,
    onlineFilter,
    statusFilter,
    searchQuery,
  ]);

  // Quick statistics for current week
  const totalCount = currentWeekActivities.length;
  const onlineCount = currentWeekActivities.filter((a) => a.isOnline).length;
  const loadingCount = currentWeekActivities.filter((a) => normalizeStatus(a.status) === 'loading').length;
  const doneCount = currentWeekActivities.filter((a) => normalizeStatus(a.status) === 'done').length;
  const cancelCount = currentWeekActivities.filter((a) => normalizeStatus(a.status) === 'cancel').length;

  const handleCopyLink = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-5">
      {/* 1. TOP HEADER & WEEK NAVIGATOR CARD */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-100">
              Lịch Hoạt Động Theo Tuần
            </span>
            <span className="text-xs font-bold text-slate-500">
              Tổ Chuyên Môn & Phòng Ban FPT School
            </span>
          </div>
          <h2 className="text-xl font-black text-indigo-950 mt-1">
            LỊCH CÔNG TÁC & HỌP TRỰC TUYẾN TUẦN {weekNumber}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý kế hoạch tuần các tổ (TA-XH, KHTN, PDP, Tiểu học) & các phòng ban (VP, Đào tạo, CTHS, TS). Tích hợp tạo link Meet và kết nối Outlook nhắc nhở trước 30 phút.
          </p>
        </div>

        {/* Action buttons & Week Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Week Navigation Controls */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              id="btn-prev-week"
              onClick={handlePrevWeek}
              className="p-1.5 hover:bg-white text-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Tuần trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              id="btn-current-week"
              onClick={handleCurrentWeek}
              className="px-2.5 py-1 text-xs font-black text-indigo-950 hover:bg-white rounded-lg transition-colors cursor-pointer"
            >
              Tuần {weekNumber}
            </button>

            <button
              id="btn-next-week"
              onClick={handleNextWeek}
              className="p-1.5 hover:bg-white text-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Tuần sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Jump to specific date */}
          <input
            type="date"
            id="picker-week-date"
            value={currentWeekDate}
            onChange={(e) => {
              if (e.target.value) setCurrentWeekDate(e.target.value);
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            title="Chọn ngày bất kỳ trong tuần"
          />

          {/* Download all ICS for current week */}
          <button
            id="btn-download-week-ics"
            onClick={() => downloadICSFile(currentWeekActivities)}
            disabled={currentWeekActivities.length === 0}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            title="Tải toàn bộ lịch tuần dạng tệp .ICS với báo thức Outlook trước 30 phút"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Xuất Outlook .ICS (Nhắc 30p)</span>
            <span className="sm:hidden">.ICS</span>
          </button>

          {/* Clear all weekly schedule button */}
          {activities.length > 0 && onClearAllWeekly && (
            <button
              id="btn-clear-all-weekly"
              onClick={onClearAllWeekly}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Xóa trắng toàn bộ các nội dung trên lịch tuần để cá nhân/tổ cập nhật lại từ đầu"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Làm trống lịch tuần</span>
            </button>
          )}

          {/* Add new activity */}
          <button
            id="btn-add-weekly-activity-top"
            onClick={() => onAddWeeklyActivity(currentWeekDate)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm công việc tuần</span>
          </button>
        </div>
      </div>

      {/* 2. STATS & QUICK HIGHLIGHT BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Total in week */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block">
            {weekRange.label}
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-lg font-black text-indigo-950">{totalCount} Việc</span>
            <CalendarIcon className="w-4 h-4 text-indigo-600" />
          </div>
        </div>

        {/* Online Meetings */}
        <div className="bg-indigo-50/80 p-3.5 rounded-2xl border border-indigo-200 shadow-2xs">
          <span className="text-[11px] font-bold text-indigo-800 block">
            Họp Trực Tuyến (Meet)
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-lg font-black text-indigo-900">{onlineCount} Cuộc họp</span>
            <Video className="w-4 h-4 text-indigo-600" />
          </div>
        </div>

        {/* Loading status */}
        <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-900 block">
            Đang thực hiện (Loading)
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-lg font-black text-amber-950">{loadingCount} Việc</span>
            <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
          </div>
        </div>

        {/* Done status */}
        <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-900 block">
            Đã hoàn thành (Done)
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-lg font-black text-emerald-950">{doneCount} Việc</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
        </div>

        {/* Cancel status */}
        <div className="bg-rose-50/80 p-3.5 rounded-2xl border border-rose-200 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-rose-900 block">
            Hủy / Tạm hoãn (Cancel)
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-lg font-black text-rose-950">{cancelCount} Việc</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
        </div>
      </div>

      {/* 3. FILTER & VIEW MODE BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
        {/* Row 1: Search & Layout buttons */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              id="input-search-weekly"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo nội dung, người chủ trì, ghi chú, đơn vị..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 hidden sm:inline">Chế độ xem:</span>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                id="btn-layout-matrix"
                onClick={() => setViewLayout('matrix')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewLayout === 'matrix'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Xem dạng Ma trận 7 ngày trong tuần"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Lịch tuần 7 ngày</span>
              </button>

              <button
                id="btn-layout-list"
                onClick={() => setViewLayout('list')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewLayout === 'list'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Xem dạng Danh sách chi tiết từng ngày"
              >
                <List className="w-3.5 h-3.5" />
                <span>Danh sách chi tiết</span>
              </button>

              <button
                id="btn-layout-unit"
                onClick={() => setViewLayout('by_unit')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewLayout === 'by_unit'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Xem nhóm theo từng Tổ chuyên môn & Phòng ban"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Theo Tổ / Phòng ban</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Unit Group Filter Tabs */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-indigo-600" />
              Đơn vị:
            </span>

            {/* All units */}
            <button
              id="filter-unit-all"
              onClick={() => {
                setSelectedGroupType('ALL');
                setSelectedUnit('ALL');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedGroupType === 'ALL' && selectedUnit === 'ALL'
                  ? 'bg-indigo-950 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Tất cả các tổ & phòng ban
            </button>

            {/* Tổ chuyên môn group button */}
            <button
              id="filter-unit-academic-group"
              onClick={() => {
                setSelectedGroupType('academic');
                setSelectedUnit('ALL');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                selectedGroupType === 'academic' && selectedUnit === 'ALL'
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Tổ Chuyên Môn (4)</span>
            </button>

            {/* Phòng ban group button */}
            <button
              id="filter-unit-admin-group"
              onClick={() => {
                setSelectedGroupType('admin');
                setSelectedUnit('ALL');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                selectedGroupType === 'admin' && selectedUnit === 'ALL'
                  ? 'bg-indigo-700 text-white shadow-xs'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Phòng Ban (4)</span>
            </button>
          </div>

          {/* Quick Online & Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Online only filter */}
            <button
              id="filter-online-only"
              onClick={() => setOnlineFilter(onlineFilter === 'online_only' ? 'ALL' : 'online_only')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                onlineFilter === 'online_only'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Video className="w-3 h-3" />
              <span>Chỉ Họp Trực Tuyến</span>
            </button>

            {/* Status Filter Dropdown */}
            <select
              id="select-status-filter-weekly"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">Mọi trạng thái</option>
              <option value="loading">⏳ Loading (Đang thực hiện)</option>
              <option value="done">✅ Done (Hoàn thành)</option>
              <option value="cancel">🚫 Cancel (Hủy bỏ)</option>
            </select>
          </div>
        </div>

        {/* Row 3: Unit Badges Pills (4 Academic + 4 Admin) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          {ALL_WEEKLY_UNITS.map((u) => {
            const isSelected = selectedUnit === u;
            const conf = getUnitConfig(u);
            const countForUnit = activities.filter(
              (a) => weekDateStrings.includes(a.date) && a.unit === u
            ).length;

            return (
              <button
                key={u}
                id={`pill-unit-${conf.code}`}
                onClick={() => {
                  setSelectedUnit(isSelected ? 'ALL' : u);
                  setSelectedGroupType(conf.type);
                }}
                className={`px-2.5 py-1 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? `${conf.badgeColor} shadow-xs ring-2 ring-indigo-500`
                    : `${conf.bgLight} ${conf.textColor} ${conf.borderColor} border hover:bg-white`
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${conf.dotColor}`}></span>
                <span>{u}</span>
                <span className="text-[10px] opacity-80 font-black px-1 py-0.2 bg-black/10 rounded">
                  {countForUnit}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. MAIN CONTENT WORKSPACE (SWITCH BY LAYOUT) */}
      {currentWeekActivities.length === 0 && (
        <div className="bg-sky-50/60 border border-sky-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sky-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-100 rounded-xl text-sky-700 shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wide">
                Lịch tuần {weekNumber} ({weekRange.label}) đang để trống
              </h4>
              <p className="text-xs text-sky-800 mt-0.5">
                Chưa có nội dung công tác nào. Các cá nhân, tổ chuyên môn và phòng ban có thể tự cập nhật công việc trực tiếp tại đây.
              </p>
            </div>
          </div>
          <button
            onClick={() => onAddWeeklyActivity(currentWeekDate)}
            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm shrink-0 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm công việc tuần</span>
          </button>
        </div>
      )}

      {/* VIEW LAYOUT 1: WEEKLY CALENDAR MATRIX (THỨ HAI -> CHỦ NHẬT) */}
      {viewLayout === 'matrix' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((day) => {
            const dayActs = currentWeekActivities
              .filter((a) => a.date === day.dateStr)
              .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

            return (
              <div
                key={day.dateStr}
                id={`weekly-col-${day.dateStr}`}
                className={`rounded-2xl border flex flex-col bg-white overflow-hidden transition-all ${
                  day.isToday
                    ? 'border-indigo-500 shadow-md ring-2 ring-indigo-300/60'
                    : 'border-slate-200 shadow-2xs'
                }`}
              >
                {/* Day Header */}
                <div
                  className={`p-3 border-b text-center ${
                    day.isToday
                      ? 'bg-indigo-950 text-white border-indigo-900'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider">
                      {day.dayName}
                    </span>
                    {day.isToday && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-amber-400 text-indigo-950 rounded">
                        Hôm nay
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-extrabold mt-0.5">
                    {day.dayNumber}/{day.monthNumber}
                  </div>
                  <span className="text-[10px] opacity-75 block">
                    {dayActs.length} công việc
                  </span>
                </div>

                {/* Day Content Activities */}
                <div className="p-2 space-y-2 flex-1 min-h-[300px] bg-slate-50/40">
                  {dayActs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-4 text-center text-slate-400">
                      <span className="text-[11px] font-medium">Chưa có lịch</span>
                      <button
                        onClick={() => onAddWeeklyActivity(day.dateStr)}
                        className="mt-1.5 text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Thêm mới</span>
                      </button>
                    </div>
                  ) : (
                    dayActs.map((act) => {
                      const uConf = getUnitConfig(act.unit);
                      const sKey = normalizeStatus(act.status);

                      return (
                        <div
                          key={act.id}
                          id={`weekly-card-${act.id}`}
                          className={`p-2.5 rounded-xl border text-xs bg-white shadow-2xs transition-all space-y-2 ${
                            sKey === 'cancel'
                              ? 'opacity-65 border-rose-200 bg-rose-50/30'
                              : sKey === 'done'
                              ? 'border-emerald-200 hover:border-emerald-300'
                              : 'border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                          }`}
                        >
                          {/* Unit code & Time */}
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`text-[10px] font-black px-1.5 py-0.5 rounded ${uConf.badgeColor}`}
                              title={act.unit}
                            >
                              {uConf.code}
                            </span>

                            <div className="flex items-center gap-1 text-[11px] font-extrabold text-slate-700">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{act.startTime}</span>
                              {act.endTime && <span>- {act.endTime}</span>}
                            </div>
                          </div>

                          {/* Title */}
                          <div
                            className={`font-black leading-snug ${
                              sKey === 'cancel' ? 'line-through text-slate-500' : 'text-slate-900'
                            }`}
                          >
                            {act.title}
                          </div>

                          {/* Host & Location */}
                          <div className="space-y-0.5 text-[10px] text-slate-500">
                            {act.host && (
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate font-semibold">{act.host}</span>
                              </div>
                            )}

                            {act.isOnline ? (
                              <div className="flex items-center gap-1 text-indigo-700 font-bold">
                                <Video className="w-3 h-3 text-indigo-600 shrink-0" />
                                <span>Trực tuyến Google Meet</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-slate-600 font-medium">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{act.location || 'FSC Hậu Giang'}</span>
                              </div>
                            )}
                          </div>

                          {/* Online Google Meet & Outlook Actions */}
                          {act.isOnline && act.meetUrl && (
                            <div className="pt-1.5 border-t border-slate-100 flex flex-wrap items-center gap-1">
                              <a
                                href={act.meetUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-black text-[10px] flex items-center justify-center gap-1 transition-colors"
                                title="Mở phòng họp Google Meet"
                              >
                                <Video className="w-3 h-3" />
                                <span>Vào Meet</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-75" />
                              </a>

                              <button
                                onClick={() => handleCopyLink(act.meetUrl!, act.id)}
                                className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                                title="Sao chép link Meet"
                              >
                                {copiedId === act.id ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          )}

                          {/* Outlook & Status Buttons */}
                          <div className="pt-1 border-t border-slate-100 flex items-center justify-between gap-1">
                            {/* Outlook 30-min Reminder Button */}
                            <a
                              href={getOutlookCalendarUrl(act, 'office365')}
                              target="_blank"
                              rel="noreferrer"
                              className="px-1.5 py-0.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded text-[9px] font-bold flex items-center gap-0.5 transition-colors"
                              title="Thêm vào Outlook Calendar và nhận thông báo trước 30 phút"
                            >
                              <Bell className="w-2.5 h-2.5 text-sky-600" />
                              <span>Outlook (+30p)</span>
                            </a>

                            {/* Status Selector dropdown */}
                            <select
                              value={sKey}
                              onChange={(e) => onUpdateWeeklyStatus(act.id, e.target.value as ActivityStatus)}
                              className={`appearance-none px-1.5 py-0.5 rounded text-[10px] font-black border cursor-pointer ${
                                sKey === 'loading'
                                  ? 'bg-amber-100 text-amber-950 border-amber-300'
                                  : sKey === 'done'
                                  ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                                  : 'bg-rose-100 text-rose-950 border-rose-300'
                              }`}
                              title="Chuyển trạng thái: Loading, Done, Cancel"
                            >
                              <option value="loading">⏳ Loading</option>
                              <option value="done">✅ Done</option>
                              <option value="cancel">🚫 Cancel</option>
                            </select>

                            {/* Edit / Delete Buttons */}
                            <div className="flex items-center gap-0.5">
                              <button
                                onClick={() => onEditWeeklyActivity(act)}
                                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                                title="Sửa"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Xóa công việc: "${act.title}"?`)) {
                                    onDeleteWeeklyActivity(act.id);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded transition-colors"
                                title="Xóa"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Quick Add Button per day */}
                  <button
                    onClick={() => onAddWeeklyActivity(day.dateStr)}
                    className="w-full py-1.5 border border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/40 text-slate-500 hover:text-indigo-900 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Thêm</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW LAYOUT 2: DETAILED DAY-BY-DAY LIST */}
      {viewLayout === 'list' && (
        <div className="space-y-4">
          {weekDays.map((day) => {
            const dayActs = currentWeekActivities
              .filter((a) => a.date === day.dateStr)
              .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

            return (
              <div
                key={day.dateStr}
                id={`weekly-list-day-${day.dateStr}`}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden"
              >
                {/* Day Header Banner */}
                <div
                  className={`p-3.5 flex items-center justify-between border-b ${
                    day.isToday
                      ? 'bg-indigo-950 text-white border-indigo-900'
                      : 'bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                        day.isToday ? 'bg-amber-400 text-indigo-950' : 'bg-slate-800 text-white'
                      }`}
                    >
                      {day.dayName}
                    </span>
                    <span className="text-sm font-black">
                      Ngày {day.dayNumber}/{day.monthNumber}/{day.dateStr.split('-')[0]}
                    </span>
                    <span className="text-xs opacity-75">
                      ({dayActs.length} nội dung công việc)
                    </span>
                  </div>

                  <button
                    onClick={() => onAddWeeklyActivity(day.dateStr)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                      day.isToday
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        : 'bg-white hover:bg-slate-200 text-slate-800 border border-slate-300'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm công việc</span>
                  </button>
                </div>

                {/* Day Items List */}
                <div className="divide-y divide-slate-100">
                  {dayActs.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400 font-medium">
                      Không có hoạt động nào trong {day.dayName} ({day.dayNumber}/{day.monthNumber}).
                    </div>
                  ) : (
                    dayActs.map((act) => {
                      const uConf = getUnitConfig(act.unit);
                      const sKey = normalizeStatus(act.status);

                      return (
                        <div
                          key={act.id}
                          id={`list-item-${act.id}`}
                          className={`p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${
                            sKey === 'cancel' ? 'bg-rose-50/20 opacity-70' : ''
                          }`}
                        >
                          {/* Left: Time & Unit Badge */}
                          <div className="flex items-start gap-3 md:w-1/4 shrink-0">
                            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 font-black text-xs text-center shrink-0">
                              <Clock className="w-3.5 h-3.5 mx-auto text-indigo-600 mb-0.5" />
                              <span>{act.startTime}</span>
                              {act.endTime && <span className="block text-[10px] text-slate-500 font-bold">{act.endTime}</span>}
                            </div>

                            <div>
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider inline-block ${uConf.badgeColor}`}
                              >
                                {act.unit}
                              </span>
                              <span className="text-[11px] text-slate-500 font-semibold block mt-1">
                                {act.unitType === 'academic' ? 'Tổ Chuyên Môn' : 'Phòng Ban'}
                              </span>
                            </div>
                          </div>

                          {/* Center: Title, Host, Notes & Meet info */}
                          <div className="flex-1 space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4
                                className={`text-sm font-black ${
                                  sKey === 'cancel'
                                    ? 'line-through text-slate-500'
                                    : 'text-slate-900'
                                }`}
                              >
                                {act.title}
                              </h4>

                              {act.isOnline ? (
                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-lg text-[10px] font-extrabold flex items-center gap-1">
                                  <Video className="w-3 h-3 text-indigo-600" />
                                  Trực tuyến (Meet)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-500" />
                                  {act.location || 'FSC Hậu Giang'}
                                </span>
                              )}
                            </div>

                            {/* Host and Participants */}
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                              {act.host && (
                                <div className="flex items-center gap-1">
                                  <User className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="font-bold text-slate-800">Chủ trì:</span>
                                  <span>{act.host}</span>
                                </div>
                              )}
                              {act.participants && (
                                <div className="flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="font-bold text-slate-800">Tham gia:</span>
                                  <span className="truncate max-w-xs">{act.participants}</span>
                                </div>
                              )}
                            </div>

                            {/* Content Notes */}
                            {act.contentNotes && (
                              <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100 font-medium">
                                {act.contentNotes}
                              </p>
                            )}

                            {/* Google Meet Link direct box if online */}
                            {act.isOnline && act.meetUrl && (
                              <div className="flex items-center gap-2 p-2 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs">
                                <Video className="w-4 h-4 text-indigo-700 shrink-0" />
                                <span className="font-bold text-indigo-950 truncate flex-1">
                                  {act.meetUrl}
                                </span>

                                <a
                                  href={act.meetUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition-colors"
                                >
                                  <span>Tham gia Meet</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>

                                <button
                                  onClick={() => handleCopyLink(act.meetUrl!, act.id)}
                                  className="p-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                                  title="Sao chép link Google Meet"
                                >
                                  {copiedId === act.id ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Right: Outlook Deep Link, ICS & Status */}
                          <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 shrink-0">
                            {/* Outlook 30-min buttons */}
                            <div className="flex items-center gap-1.5">
                              <a
                                href={getOutlookCalendarUrl(act, 'office365')}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                                title="Mở trên Outlook Web & Báo trước 30 phút"
                              >
                                <Bell className="w-3.5 h-3.5 text-sky-700" />
                                <span>Thêm Outlook (+30p)</span>
                              </a>

                              <button
                                onClick={() => downloadICSFile(act)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors"
                                title="Tải file .ICS báo thức Outlook 30 phút"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Status Selector */}
                            <div className="flex items-center gap-2">
                              <select
                                value={sKey}
                                onChange={(e) => onUpdateWeeklyStatus(act.id, e.target.value as ActivityStatus)}
                                className={`px-2.5 py-1 rounded-xl text-xs font-black border cursor-pointer shadow-2xs ${
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

                              {/* Action buttons */}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => onEditWeeklyActivity(act)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                                  title="Sửa công việc"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Xóa công việc: "${act.title}"?`)) {
                                      onDeleteWeeklyActivity(act.id);
                                    }
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                                  title="Xóa công việc"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW LAYOUT 3: ORGANIZED BY TỔ CHUYÊN MÔN & PHÒNG BAN */}
      {viewLayout === 'by_unit' && (
        <div className="space-y-6">
          {/* Group 1: Tổ Chuyên Môn */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-sky-600 text-white rounded-lg">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h3 className="text-base font-black text-sky-950 uppercase tracking-wider">
                Lịch Hoạt Động 4 Tổ Chuyên Môn
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ACADEMIC_UNITS_LIST.map((unitName) => {
                const conf = getUnitConfig(unitName);
                const unitActs = currentWeekActivities.filter((a) => a.unit === unitName);

                return (
                  <div
                    key={unitName}
                    id={`unit-card-${conf.code}`}
                    className={`bg-white rounded-2xl border ${conf.borderColor} shadow-2xs overflow-hidden flex flex-col`}
                  >
                    {/* Unit header */}
                    <div className={`p-3.5 ${conf.bgLight} border-b ${conf.borderColor} flex items-center justify-between`}>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black px-2 py-0.5 rounded ${conf.badgeColor}`}>
                          {conf.code}
                        </span>
                        <div>
                          <h4 className={`text-sm font-black ${conf.textColor}`}>
                            {unitName}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-medium block">
                            {conf.description}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onAddWeeklyActivity(currentWeekDate, unitName)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg ${conf.badgeColor} hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer`}
                      >
                        <Plus className="w-3 h-3" />
                        <span>Thêm việc</span>
                      </button>
                    </div>

                    {/* Unit activities */}
                    <div className="p-3 space-y-2.5 flex-1">
                      {unitActs.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-400 font-medium">
                          Chưa có công việc được ghi chú cho tuần này.
                        </div>
                      ) : (
                        unitActs.map((act) => {
                          const sKey = normalizeStatus(act.status);
                          return (
                            <div
                              key={act.id}
                              className={`p-3 rounded-xl border text-xs bg-slate-50/60 transition-all space-y-2 group ${
                                sKey === 'cancel'
                                  ? 'opacity-65 border-rose-200 bg-rose-50/30'
                                  : 'border-slate-200 hover:bg-white hover:shadow-xs'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                                  {act.dayOfWeek} ({act.date.split('-')[2]}/{act.date.split('-')[1]}) • {act.startTime}
                                </span>
                                {act.isOnline ? (
                                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 flex items-center gap-1">
                                    <Video className="w-3 h-3" />
                                    Online Meet
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    {act.location || 'FSC Hậu Giang'}
                                  </span>
                                )}
                              </div>

                              <div
                                onClick={() => onEditWeeklyActivity(act)}
                                className={`font-black text-sm leading-snug cursor-pointer hover:text-indigo-600 transition-colors ${
                                  sKey === 'cancel' ? 'line-through text-slate-500' : 'text-slate-900'
                                }`}
                              >
                                {act.title}
                              </div>

                              {act.host && (
                                <div className="text-[11px] text-slate-600 flex items-center gap-1">
                                  <User className="w-3 h-3 text-slate-400" />
                                  <span className="font-semibold">Chủ trì:</span>
                                  <span>{act.host}</span>
                                </div>
                              )}

                              {/* Action Row */}
                              <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-1.5">
                                <div className="flex items-center gap-1">
                                  {act.isOnline && act.meetUrl && (
                                    <a
                                      href={act.meetUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                                    >
                                      <Video className="w-2.5 h-2.5" />
                                      <span>Meet</span>
                                    </a>
                                  )}
                                  <a
                                    href={getOutlookCalendarUrl(act, 'office365')}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2 py-0.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg text-[10px] font-bold flex items-center gap-1"
                                    title="Thêm vào Outlook"
                                  >
                                    <Bell className="w-2.5 h-2.5" />
                                    <span>Outlook</span>
                                  </a>
                                </div>

                                <div className="flex items-center gap-1">
                                  <select
                                    value={sKey}
                                    onChange={(e) => onUpdateWeeklyStatus(act.id, e.target.value as ActivityStatus)}
                                    className={`px-1.5 py-0.5 rounded-lg text-[10px] font-black border cursor-pointer ${
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

                                  <button
                                    onClick={() => onEditWeeklyActivity(act)}
                                    className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                                    title="Sửa công việc"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => {
                                      if (confirm(`Xóa công việc: "${act.title}"?`)) {
                                        onDeleteWeeklyActivity(act.id);
                                      }
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                                    title="Xóa công việc"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Group 2: Phòng Ban Chức Năng */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                <Building className="w-4 h-4" />
              </div>
              <h3 className="text-base font-black text-indigo-950 uppercase tracking-wider">
                Lịch Hoạt Động 4 Phòng Ban Chức Năng
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ADMIN_UNITS_LIST.map((unitName) => {
                const conf = getUnitConfig(unitName);
                const unitActs = currentWeekActivities.filter((a) => a.unit === unitName);

                return (
                  <div
                    key={unitName}
                    id={`admin-card-${conf.code}`}
                    className={`bg-white rounded-2xl border ${conf.borderColor} shadow-2xs overflow-hidden flex flex-col`}
                  >
                    {/* Unit header */}
                    <div className={`p-3.5 ${conf.bgLight} border-b ${conf.borderColor} flex items-center justify-between`}>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black px-2 py-0.5 rounded ${conf.badgeColor}`}>
                          {conf.code}
                        </span>
                        <div>
                          <h4 className={`text-sm font-black ${conf.textColor}`}>
                            {unitName}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-medium block">
                            {conf.description}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onAddWeeklyActivity(currentWeekDate, unitName)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg ${conf.badgeColor} hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer`}
                      >
                        <Plus className="w-3 h-3" />
                        <span>Thêm việc</span>
                      </button>
                    </div>

                    {/* Unit activities */}
                    <div className="p-3 space-y-2.5 flex-1">
                      {unitActs.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-400 font-medium">
                          Chưa có công việc được ghi chú cho tuần này.
                        </div>
                      ) : (
                        unitActs.map((act) => {
                          const sKey = normalizeStatus(act.status);
                          return (
                            <div
                              key={act.id}
                              className={`p-3 rounded-xl border text-xs bg-slate-50/60 transition-all space-y-2 group ${
                                sKey === 'cancel'
                                  ? 'opacity-65 border-rose-200 bg-rose-50/30'
                                  : 'border-slate-200 hover:bg-white hover:shadow-xs'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                                  {act.dayOfWeek} ({act.date.split('-')[2]}/{act.date.split('-')[1]}) • {act.startTime}
                                </span>
                                {act.isOnline ? (
                                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 flex items-center gap-1">
                                    <Video className="w-3 h-3" />
                                    Online Meet
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    {act.location || 'FSC Hậu Giang'}
                                  </span>
                                )}
                              </div>

                              <div
                                onClick={() => onEditWeeklyActivity(act)}
                                className={`font-black text-sm leading-snug cursor-pointer hover:text-indigo-600 transition-colors ${
                                  sKey === 'cancel' ? 'line-through text-slate-500' : 'text-slate-900'
                                }`}
                              >
                                {act.title}
                              </div>

                              {act.host && (
                                <div className="text-[11px] text-slate-600 flex items-center gap-1">
                                  <User className="w-3 h-3 text-slate-400" />
                                  <span className="font-semibold">Chủ trì:</span>
                                  <span>{act.host}</span>
                                </div>
                              )}

                              {/* Action Row */}
                              <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-1.5">
                                <div className="flex items-center gap-1">
                                  {act.isOnline && act.meetUrl && (
                                    <a
                                      href={act.meetUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                                    >
                                      <Video className="w-2.5 h-2.5" />
                                      <span>Meet</span>
                                    </a>
                                  )}
                                  <a
                                    href={getOutlookCalendarUrl(act, 'office365')}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2 py-0.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg text-[10px] font-bold flex items-center gap-1"
                                    title="Thêm vào Outlook"
                                  >
                                    <Bell className="w-2.5 h-2.5" />
                                    <span>Outlook</span>
                                  </a>
                                </div>

                                <div className="flex items-center gap-1">
                                  <select
                                    value={sKey}
                                    onChange={(e) => onUpdateWeeklyStatus(act.id, e.target.value as ActivityStatus)}
                                    className={`px-1.5 py-0.5 rounded-lg text-[10px] font-black border cursor-pointer ${
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

                                  <button
                                    onClick={() => onEditWeeklyActivity(act)}
                                    className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                                    title="Sửa công việc"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => {
                                      if (confirm(`Xóa công việc: "${act.title}"?`)) {
                                        onDeleteWeeklyActivity(act.id);
                                      }
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                                    title="Xóa công việc"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
