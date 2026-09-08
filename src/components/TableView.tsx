import React, { useState, useMemo } from 'react';
import {
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  DollarSign,
  ArrowUpDown,
  Plus,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  Loader2,
  XCircle,
  Clock,
  Check,
  Ban,
  Filter,
} from 'lucide-react';
import { Activity, ActivityStatus, ConflictIssue } from '../types';
import {
  ACADEMIC_YEAR_MONTHS,
  CATEGORY_CONFIG,
  STATUS_CONFIG,
  normalizeStatus,
} from '../data/initialData';
import {
  formatCurrencyVND,
  formatDateRangeVN,
} from '../utils/conflictDetector';

interface TableViewProps {
  activities: Activity[];
  conflictMap: Record<string, ConflictIssue[]>;
  onEditActivity: (activity: Activity) => void;
  onDeleteActivity: (id: string) => void;
  onAddNew: (defaultDate?: string) => void;
  onUpdateStatus?: (id: string, newStatus: ActivityStatus) => void;
  onResolveConflict?: (issue: ConflictIssue) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  activities,
  conflictMap,
  onEditActivity,
  onDeleteActivity,
  onAddNew,
  onUpdateStatus,
}) => {
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('ALL'); // 'ALL' or 'month-year' e.g. '8-2026'
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | 'loading' | 'done' | 'cancel'>('ALL');
  const [collapsedMonths, setCollapsedMonths] = useState<Record<string, boolean>>({});
  const [sortField, setSortField] = useState<'date' | 'department' | 'budget' | 'title' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: 'date' | 'department' | 'budget' | 'title' | 'status') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const toggleMonthCollapse = (monthKey: string) => {
    setCollapsedMonths((prev) => ({
      ...prev,
      [monthKey]: !prev[monthKey],
    }));
  };

  const expandAllMonths = () => setCollapsedMonths({});
  const collapseAllMonths = () => {
    const allCollapsed: Record<string, boolean> = {};
    ACADEMIC_YEAR_MONTHS.forEach((m) => {
      allCollapsed[`${m.month}-${m.year}`] = true;
    });
    setCollapsedMonths(allCollapsed);
  };

  // Group activities by Month & Year in Academic Order with Status Filter applied
  const monthGroups = useMemo(() => {
    return ACADEMIC_YEAR_MONTHS.map((mInfo) => {
      const monthKey = `${mInfo.month}-${mInfo.year}`;
      let monthActs = activities.filter(
        (a) => a.month === mInfo.month && a.year === mInfo.year
      );

      // Status filter
      if (selectedStatusFilter !== 'ALL') {
        monthActs = monthActs.filter(
          (a) => normalizeStatus(a.status) === selectedStatusFilter
        );
      }

      // Sort items within this month
      const sortedMonthActs = [...monthActs].sort((a, b) => {
        let result = 0;
        if (sortField === 'date') {
          result = (a.startDate || '').localeCompare(b.startDate || '');
        } else if (sortField === 'department') {
          result = (a.department || '').localeCompare(b.department || '');
        } else if (sortField === 'budget') {
          result = (a.budget || 0) - (b.budget || 0);
        } else if (sortField === 'title') {
          result = (a.title || '').localeCompare(b.title || '');
        } else if (sortField === 'status') {
          result = normalizeStatus(a.status).localeCompare(normalizeStatus(b.status));
        }
        return sortOrder === 'asc' ? result : -result;
      });

      const monthBudget = monthActs
        .filter((a) => normalizeStatus(a.status) !== 'cancel')
        .reduce((sum, a) => sum + (a.budget || 0), 0);

      const conflictCount = monthActs.reduce(
        (count, a) => count + ((conflictMap[a.id] || []).length > 0 ? 1 : 0),
        0
      );

      return {
        ...mInfo,
        key: monthKey,
        activities: sortedMonthActs,
        totalBudget: monthBudget,
        conflictCount,
      };
    }).filter((g) => {
      if (selectedMonthFilter === 'ALL') return true;
      return g.key === selectedMonthFilter;
    });
  }, [activities, selectedMonthFilter, selectedStatusFilter, sortField, sortOrder, conflictMap]);

  // Overall Statistics for Loading, Done, Cancel
  const totalActivitiesCount = activities.length;
  const loadingCount = activities.filter((a) => normalizeStatus(a.status) === 'loading').length;
  const doneCount = activities.filter((a) => normalizeStatus(a.status) === 'done').length;
  const cancelCount = activities.filter((a) => normalizeStatus(a.status) === 'cancel').length;

  const totalCost = activities
    .filter((a) => normalizeStatus(a.status) !== 'cancel')
    .reduce((acc, curr) => acc + (curr.budget || 0), 0);

  const totalConflictsCount = activities.reduce(
    (count, a) => count + ((conflictMap[a.id] || []).length > 0 ? 1 : 0),
    0
  );

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
              Bảng Kế Hoạch Chi Tiết Theo Tháng
            </span>
            <span className="text-xs font-bold text-slate-500">
              Năm học 2026 - 2027
            </span>
          </div>
          <h2 className="text-xl font-black text-indigo-950 mt-1">
            DANH SÁCH NỘI DUNG CÔNG VIỆC TỪNG THÁNG
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Trình bày logic 14 tháng kèm cột theo dõi trạng thái công việc (<strong>Loading</strong>, <strong>Done</strong>, <strong>Cancel</strong>)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="text-right px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl">
            <span className="text-[11px] text-emerald-700 font-semibold block">
              Tổng kinh phí kế hoạch:
            </span>
            <span className="text-sm sm:text-base font-black text-emerald-800">
              {formatCurrencyVND(totalCost)}
            </span>
          </div>

          <button
            id="btn-add-table-row-top"
            onClick={() => onAddNew()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm công việc mới</span>
          </button>
        </div>
      </div>

      {/* Status Summary & Quick Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              Lọc theo trạng thái hoạt động:
            </span>
          </div>

          {/* Status Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* All */}
            <button
              id="filter-status-all"
              onClick={() => setSelectedStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedStatusFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-400'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              <span>Tất cả</span>
              <span className="px-1.5 py-0.2 text-[11px] rounded bg-white/20 font-black">
                {totalActivitiesCount}
              </span>
            </button>

            {/* Loading */}
            <button
              id="filter-status-loading"
              onClick={() => setSelectedStatusFilter('loading')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedStatusFilter === 'loading'
                  ? 'bg-amber-500 text-indigo-950 shadow-sm ring-2 ring-amber-400 font-black'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
              }`}
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
              <span>Loading (Đang thực hiện)</span>
              <span className={`px-1.5 py-0.2 text-[11px] rounded font-black ${
                selectedStatusFilter === 'loading' ? 'bg-amber-600 text-white' : 'bg-amber-200/80 text-amber-950'
              }`}>
                {loadingCount}
              </span>
            </button>

            {/* Done */}
            <button
              id="filter-status-done"
              onClick={() => setSelectedStatusFilter('done')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedStatusFilter === 'done'
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Done (Hoàn thành)</span>
              <span className={`px-1.5 py-0.2 text-[11px] rounded font-black ${
                selectedStatusFilter === 'done' ? 'bg-emerald-700 text-white' : 'bg-emerald-200/80 text-emerald-950'
              }`}>
                {doneCount}
              </span>
            </button>

            {/* Cancel */}
            <button
              id="filter-status-cancel"
              onClick={() => setSelectedStatusFilter('cancel')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedStatusFilter === 'cancel'
                  ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Cancel (Hủy bỏ)</span>
              <span className={`px-1.5 py-0.2 text-[11px] rounded font-black ${
                selectedStatusFilter === 'cancel' ? 'bg-rose-700 text-white' : 'bg-rose-200/80 text-rose-950'
              }`}>
                {cancelCount}
              </span>
            </button>
          </div>
        </div>

        {/* Month Navigation Tabs & View Controls */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Lọc theo tháng:</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={expandAllMonths}
              className="px-2.5 py-1 text-slate-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors font-semibold cursor-pointer"
            >
              Mở rộng tất cả
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={collapseAllMonths}
              className="px-2.5 py-1 text-slate-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors font-semibold cursor-pointer"
            >
              Thu gọn tất cả
            </button>
          </div>
        </div>

        {/* Month Pills list */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            id="btn-month-filter-all"
            onClick={() => setSelectedMonthFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
              selectedMonthFilter === 'ALL'
                ? 'bg-indigo-900 text-white shadow-md shadow-indigo-900/20 ring-2 ring-indigo-500'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>Tất cả 14 tháng</span>
            <span className="text-[10px] opacity-80">({totalActivitiesCount})</span>
          </button>

          {ACADEMIC_YEAR_MONTHS.map((m) => {
            const key = `${m.month}-${m.year}`;
            const isSelected = selectedMonthFilter === key;
            const count = activities.filter(
              (a) => a.month === m.month && a.year === m.year
            ).length;

            return (
              <button
                key={key}
                id={`btn-month-filter-${key}`}
                onClick={() => setSelectedMonthFilter(key)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-900 text-white shadow-md shadow-indigo-900/20 ring-2 ring-indigo-500'
                    : 'bg-indigo-50/70 hover:bg-indigo-100 text-indigo-900 border border-indigo-100/80'
                }`}
              >
                <span>{m.label}</span>
                <span
                  className={`text-[10px] px-1 py-0.2 rounded font-bold ${
                    isSelected
                      ? 'bg-indigo-700 text-white'
                      : 'bg-indigo-200/70 text-indigo-900'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Month Group Sections */}
      <div className="space-y-6">
        {monthGroups.map((group) => {
          const isCollapsed = !!collapsedMonths[group.key];
          const hasActivities = group.activities.length > 0;
          const defaultDateForMonth = `${group.year}-${group.month.toString().padStart(2, '0')}-01`;

          return (
            <div
              key={group.key}
              id={`month-table-section-${group.key}`}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all"
            >
              {/* Month Header Banner */}
              <div
                onClick={() => toggleMonthCollapse(group.key)}
                className={`p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer select-none transition-colors ${
                  group.conflictCount > 0
                    ? 'bg-red-50/80 hover:bg-red-100/70 border-b border-red-200'
                    : 'bg-indigo-950 text-white hover:bg-indigo-900 border-b border-indigo-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    className={`p-1 rounded-lg transition-transform ${
                      group.conflictCount > 0
                        ? 'text-red-700 bg-red-100 hover:bg-red-200'
                        : 'text-indigo-200 bg-indigo-900 hover:bg-indigo-800'
                    }`}
                  >
                    {isCollapsed ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                          group.conflictCount > 0
                            ? 'bg-red-600 text-white'
                            : 'bg-amber-400 text-indigo-950'
                        }`}
                      >
                        {group.semester === 'HK1'
                          ? 'HỌC KỲ I'
                          : group.semester === 'HK2'
                          ? 'HỌC KỲ II'
                          : 'HỌAT ĐỘNG HÈ'}
                      </span>
                      <h3
                        className={`text-base sm:text-lg font-black tracking-tight ${
                          group.conflictCount > 0 ? 'text-red-950' : 'text-white'
                        }`}
                      >
                        {group.label.toUpperCase()}
                      </h3>
                    </div>
                    <p
                      className={`text-xs mt-0.5 ${
                        group.conflictCount > 0 ? 'text-red-700' : 'text-indigo-200'
                      }`}
                    >
                      {group.activities.length} nội dung công việc
                      {selectedStatusFilter !== 'ALL' && ` (đang lọc theo trạng thái ${selectedStatusFilter})`}
                      {group.conflictCount > 0 && ` • ⚠️ Có ${group.conflictCount} công việc bị trùng lịch!`}
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-center gap-2.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className={`px-3 py-1.5 rounded-xl text-right text-xs font-bold ${
                      group.conflictCount > 0
                        ? 'bg-white border border-red-300 text-red-900'
                        : 'bg-indigo-900/80 border border-indigo-700/60 text-emerald-300'
                    }`}
                  >
                    <span className="text-[10px] block opacity-80">
                      Dự trù kinh phí:
                    </span>
                    <span className="text-sm font-extrabold">
                      {formatCurrencyVND(group.totalBudget)}
                    </span>
                  </div>

                  <button
                    onClick={() => onAddNew(defaultDateForMonth)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer ${
                      group.conflictCount > 0
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                    }`}
                    title={`Thêm công việc vào ${group.label}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm</span>
                  </button>
                </div>
              </div>

              {/* Month Table Content (Collapsible) */}
              {!isCollapsed && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-2.5 px-3 text-center w-12">STT</th>
                        <th
                          onClick={() => handleSort('date')}
                          className="py-2.5 px-3.5 cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap min-w-[110px]"
                        >
                          <div className="flex items-center gap-1">
                            <span>Thời gian</span>
                            <ArrowUpDown className="w-3 h-3 opacity-60" />
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('title')}
                          className="py-2.5 px-3.5 cursor-pointer hover:bg-slate-200 transition-colors min-w-[230px]"
                        >
                          <div className="flex items-center gap-1">
                            <span>Nội dung công việc</span>
                            <ArrowUpDown className="w-3 h-3 opacity-60" />
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('department')}
                          className="py-2.5 px-3 cursor-pointer hover:bg-slate-200 transition-colors min-w-[100px]"
                        >
                          <div className="flex items-center gap-1">
                            <span>Phụ trách</span>
                            <ArrowUpDown className="w-3 h-3 opacity-60" />
                          </div>
                        </th>
                        <th className="py-2.5 px-3 min-w-[120px]">Đối tượng</th>
                        <th className="py-2.5 px-3 min-w-[100px]">Địa điểm</th>
                        <th
                          onClick={() => handleSort('budget')}
                          className="py-2.5 px-3 cursor-pointer hover:bg-slate-200 transition-colors text-right min-w-[110px]"
                        >
                          <div className="flex items-center justify-end gap-1">
                            <span>Dự trù kinh phí</span>
                            <ArrowUpDown className="w-3 h-3 opacity-60" />
                          </div>
                        </th>
                        <th className="py-2.5 px-3 min-w-[130px]">Ghi chú</th>
                        {/* CỘT BÁO TRẠNG THÁI: LOADING, DONE, CANCEL */}
                        <th
                          onClick={() => handleSort('status')}
                          className="py-2.5 px-3.5 cursor-pointer hover:bg-slate-200 transition-colors text-center min-w-[150px] bg-indigo-50/70 border-x border-indigo-100"
                        >
                          <div className="flex items-center justify-center gap-1 text-indigo-950 font-black">
                            <span>TRẠNG THÁI</span>
                            <ArrowUpDown className="w-3 h-3 text-indigo-600" />
                          </div>
                        </th>
                        <th className="py-2.5 px-3 text-center min-w-[100px]">Trùng lịch</th>
                        <th className="py-2.5 px-3 text-right min-w-[70px]">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {!hasActivities ? (
                        <tr>
                          <td
                            colSpan={11}
                            className="py-8 text-center text-slate-400 font-medium"
                          >
                            Không có nội dung công việc nào trong {group.label} phù hợp với bộ lọc.
                            <button
                              onClick={() => onAddNew(defaultDateForMonth)}
                              className="ml-2 text-indigo-600 hover:underline font-bold"
                            >
                              + Thêm công việc ngay
                            </button>
                          </td>
                        </tr>
                      ) : (
                        group.activities.map((act, index) => {
                          const actConflicts = conflictMap[act.id] || [];
                          const isConflicted = actConflicts.length > 0;
                          const currentStatusKey = normalizeStatus(act.status);
                          const statusConf = STATUS_CONFIG[currentStatusKey];
                          const catStyle = CATEGORY_CONFIG[act.category] || {
                            badge: 'bg-slate-600 text-white',
                            hex: '#64748b',
                          };

                          return (
                            <tr
                              key={act.id}
                              id={`table-row-${act.id}`}
                              className={`hover:bg-slate-50/90 transition-colors ${
                                isConflicted
                                  ? 'bg-red-50/70 font-medium'
                                  : currentStatusKey === 'cancel'
                                  ? 'bg-rose-50/30 opacity-75'
                                  : index % 2 === 0
                                  ? 'bg-white'
                                  : 'bg-slate-50/50'
                              }`}
                            >
                              {/* STT */}
                              <td className="py-3 px-3 text-center text-slate-500 font-semibold align-top">
                                {index + 1}
                              </td>

                              {/* Thời gian */}
                              <td className="py-3 px-3.5 align-top">
                                <div className="font-bold text-slate-900">
                                  {formatDateRangeVN(act.startDate, act.endDate)}
                                </div>
                                <span className="text-[10px] text-indigo-700 font-semibold block mt-0.5">
                                  {group.shortLabel}
                                </span>
                              </td>

                              {/* Nội dung công việc */}
                              <td className="py-3 px-3.5 align-top">
                                <div className="space-y-1">
                                  <div
                                    className={`font-bold leading-snug ${
                                      currentStatusKey === 'cancel'
                                        ? 'text-slate-500 line-through'
                                        : 'text-slate-900'
                                    }`}
                                  >
                                    {act.title}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                    <span
                                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${catStyle.badge}`}
                                    >
                                      {act.category}
                                    </span>
                                    {isConflicted && (
                                      <span className="text-[10px] px-2 py-0.5 rounded bg-red-600 text-white font-bold flex items-center gap-1 shadow-xs animate-pulse">
                                        <AlertTriangle className="w-2.5 h-2.5" />
                                        TRÙNG LỊCH ({actConflicts.length})
                                      </span>
                                    )}
                                  </div>
                                  {isConflicted && (
                                    <div className="text-[11px] text-red-800 bg-red-100/90 p-2 rounded-lg border border-red-300 mt-1 font-semibold">
                                      <strong>Cảnh báo:</strong> {actConflicts[0]?.description}
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Phụ trách */}
                              <td className="py-3 px-3 align-top">
                                <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-950 border border-indigo-200 rounded-lg font-bold text-[11px]">
                                  {act.department}
                                </span>
                              </td>

                              {/* Đối tượng tham gia */}
                              <td className="py-3 px-3 align-top text-slate-700 font-medium">
                                {act.targetAudience || '—'}
                              </td>

                              {/* Địa điểm tổ chức */}
                              <td className="py-3 px-3 align-top">
                                <span
                                  className={`font-semibold ${
                                    act.location === 'FSC Hậu Giang'
                                      ? 'text-indigo-900 bg-indigo-50/80 px-2 py-0.5 rounded border border-indigo-100'
                                      : 'text-slate-800'
                                  }`}
                                >
                                  {act.location || 'Chưa định'}
                                </span>
                              </td>

                              {/* Dự trù chi phí */}
                              <td className="py-3 px-3 align-top text-right">
                                <span
                                  className={`font-bold ${
                                    currentStatusKey === 'cancel'
                                      ? 'text-slate-400 line-through'
                                      : act.budget > 0
                                      ? 'text-emerald-700 font-extrabold'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {formatCurrencyVND(act.budget || 0)}
                                </span>
                              </td>

                              {/* Ghi chú */}
                              <td className="py-3 px-3 align-top text-slate-600 text-[11px]">
                                {act.notes || '—'}
                              </td>

                              {/* CỘT BÁO TRẠNG THÁI: LOADING, DONE, CANCEL */}
                              <td className="py-3 px-3.5 align-top text-center bg-indigo-50/30 border-x border-indigo-100/60">
                                <div className="inline-flex flex-col items-center gap-1.5">
                                  {/* Status Selector Dropdown / Interactive Badge */}
                                  <div className="relative group">
                                    <select
                                      id={`select-status-${act.id}`}
                                      value={currentStatusKey}
                                      onChange={(e) => {
                                        const newSt = e.target.value as ActivityStatus;
                                        if (onUpdateStatus) {
                                          onUpdateStatus(act.id, newSt);
                                        }
                                      }}
                                      className={`appearance-none pl-7 pr-6 py-1 rounded-xl text-xs font-black cursor-pointer border shadow-2xs focus:outline-none focus:ring-2 transition-all ${
                                        currentStatusKey === 'loading'
                                          ? 'bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200 focus:ring-amber-400'
                                          : currentStatusKey === 'done'
                                          ? 'bg-emerald-100 text-emerald-950 border-emerald-300 hover:bg-emerald-200 focus:ring-emerald-400'
                                          : 'bg-rose-100 text-rose-950 border-rose-300 hover:bg-rose-200 focus:ring-rose-400'
                                      }`}
                                      title="Nhấp để chuyển nhanh trạng thái (Loading, Done, Cancel)"
                                    >
                                      <option value="loading">⏳ Loading (Đang thực hiện)</option>
                                      <option value="done">✅ Done (Hoàn thành)</option>
                                      <option value="cancel">🚫 Cancel (Hủy bỏ)</option>
                                    </select>

                                    {/* Icon Indicator inside selector */}
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                      {currentStatusKey === 'loading' && (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
                                      )}
                                      {currentStatusKey === 'done' && (
                                        <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                                      )}
                                      {currentStatusKey === 'cancel' && (
                                        <Ban className="w-3.5 h-3.5 text-rose-700 stroke-[2.5]" />
                                      )}
                                    </div>

                                    {/* Dropdown Chevron */}
                                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60">
                                      <ChevronDown className="w-3 h-3 text-slate-700" />
                                    </div>
                                  </div>

                                  {/* Subtitle label */}
                                  <span className="text-[10px] text-slate-500 font-semibold">
                                    {statusConf.subLabel}
                                  </span>
                                </div>
                              </td>

                              {/* Cảnh báo Trùng lịch */}
                              <td className="py-3 px-3 align-top text-center">
                                {isConflicted ? (
                                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-bold text-[10px] border border-red-300 shadow-2xs">
                                    <AlertTriangle className="w-3 h-3 text-red-600" />
                                    Trùng lịch
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px] border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    Hợp lệ
                                  </div>
                                )}
                              </td>

                              {/* Thao tác */}
                              <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    id={`btn-table-edit-${act.id}`}
                                    onClick={() => onEditActivity(act)}
                                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                    title="Sửa kế hoạch"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    id={`btn-table-delete-${act.id}`}
                                    onClick={() => {
                                      if (
                                        confirm(
                                          `Bạn có chắc muốn xóa hoạt động: "${act.title}"?`
                                        )
                                      ) {
                                        onDeleteActivity(act.id);
                                      }
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Xóa kế hoạch"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>

                    {/* Month Subtotal Footer */}
                    {hasActivities && (
                      <tfoot>
                        <tr className="bg-indigo-50/70 border-t-2 border-indigo-200 font-bold text-indigo-950">
                          <td
                            colSpan={6}
                            className="py-2.5 px-3.5 text-right uppercase tracking-wider text-[11px]"
                          >
                            Tổng kinh phí {group.label} ({group.activities.length} nội dung):
                          </td>
                          <td className="py-2.5 px-3 text-right text-emerald-700 text-sm font-black">
                            {formatCurrencyVND(group.totalBudget)}
                          </td>
                          <td colSpan={4}></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Grand Total Summary Card */}
      <div className="bg-indigo-950 text-white p-5 rounded-2xl border border-indigo-800 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
            Tổng kết toàn bộ năm học 2026 - 2027
          </span>
          <div className="text-lg sm:text-xl font-black mt-0.5">
            Tổng cộng 14 tháng: {totalActivitiesCount} hoạt động & nội dung công việc
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-bold">
            <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-indigo-950 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Loading: {loadingCount} việc
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Done: {doneCount} việc
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              Cancel: {cancelCount} việc
            </span>
          </div>
          {totalConflictsCount > 0 && (
            <p className="text-xs text-red-300 font-bold mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
              <span>Đang có {totalConflictsCount} hoạt động cần điều chỉnh tránh trùng lịch!</span>
            </p>
          )}
        </div>

        <div className="text-right bg-indigo-900/90 border border-indigo-700 px-4 py-2.5 rounded-xl">
          <span className="text-xs text-indigo-300 font-medium block">
            Tổng dự trù kinh phí toàn trường:
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-300">
            {formatCurrencyVND(totalCost)}
          </span>
        </div>
      </div>
    </div>
  );
};
