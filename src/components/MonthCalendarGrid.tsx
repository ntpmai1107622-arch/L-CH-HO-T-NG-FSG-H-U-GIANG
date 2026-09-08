import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Plus,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Edit2,
  Trash2,
  ExternalLink,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Activity, ConflictIssue, EventCategory } from '../types';
import { CATEGORY_CONFIG, STATUS_CONFIG, normalizeStatus } from '../data/initialData';
import {
  formatCurrencyVND,
  formatDateVN,
  formatDateRangeVN,
  getDatesInRange,
} from '../utils/conflictDetector';

interface MonthCalendarGridProps {
  currentMonth: number; // 1-12
  currentYear: number; // 2026 or 2027
  activities: Activity[];
  conflictMap: Record<string, ConflictIssue[]>;
  conflictingDates: Set<string>;
  onMonthChange: (month: number, year: number) => void;
  onEditActivity: (activity: Activity) => void;
  onDeleteActivity: (id: string) => void;
  onAddActivityForDate: (dateStr: string) => void;
  onSelectConflict: (issue: ConflictIssue) => void;
}

export const MonthCalendarGrid: React.FC<MonthCalendarGridProps> = ({
  currentMonth,
  currentYear,
  activities,
  conflictMap,
  conflictingDates,
  onMonthChange,
  onEditActivity,
  onDeleteActivity,
  onAddActivityForDate,
  onSelectConflict,
}) => {
  const [selectedDayActivities, setSelectedDayActivities] = useState<{
    dateStr: string;
    items: Activity[];
  } | null>(null);

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      onMonthChange(12, currentYear - 1);
    } else {
      onMonthChange(currentMonth - 1, currentYear);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      onMonthChange(1, currentYear + 1);
    } else {
      onMonthChange(currentMonth + 1, currentYear);
    }
  };

  // Days in month calculation (Vietnamese standard: Monday to Sunday)
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 is Sunday, 1 is Monday
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Align Mon=0, Sun=6

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  // Week header Vietnamese & English as seen in official document
  const weekDays = [
    { vi: 'Thứ 2', en: 'Mon' },
    { vi: 'Thứ 3', en: 'Tue' },
    { vi: 'Thứ 4', en: 'Wed' },
    { vi: 'Thứ 5', en: 'Thu' },
    { vi: 'Thứ 6', en: 'Fri' },
    { vi: 'Thứ 7', en: 'Sat' },
    { vi: 'CN', en: 'Sun' },
  ];

  // Activities for a given day
  const getActivitiesForDay = (day: number) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${currentYear}-${pad(currentMonth)}-${pad(day)}`;

    return activities.filter((act) => {
      if (act.status === 'cancelled') return false;
      const actDates = getDatesInRange(act.startDate, act.endDate);
      return actDates.includes(dateStr);
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Calendar Controls & Category Legend */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">
              Tháng {currentMonth} / {currentYear}
            </h2>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                id="btn-prev-month"
                onClick={handlePrevMonth}
                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors"
                title="Tháng trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                id="btn-next-month"
                onClick={handleNextMonth}
                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors"
                title="Tháng sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <span className="text-xs font-semibold text-slate-500 hidden md:inline">
              (Lịch học kỳ {currentMonth >= 8 || currentMonth <= 1 ? 'I' : currentMonth <= 5 ? 'II' : 'Hè'})
            </span>
          </div>

          {/* Quick Notice about Conflict Highlight */}
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-100 text-red-800 font-bold border border-red-300">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
              Ô viền đỏ = Có hoạt động bị trùng lịch / xung đột
            </span>
          </div>
        </div>

        {/* Categories Color Legend (Matching the School PDF format) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider mr-1">
            Phân loại lịch:
          </span>
          {Object.entries(CATEGORY_CONFIG).map(([catKey, style]) => (
            <div
              key={catKey}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-medium ${style.bg} ${style.border} ${style.text}`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: style.hex }}
              ></span>
              <span>{catKey}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Calendar Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Header Days of Week */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-900 text-white text-center text-xs font-bold divide-x divide-slate-800">
          {weekDays.map((wd, index) => (
            <div
              key={index}
              className={`py-2.5 px-1 ${
                index >= 5 ? 'bg-slate-800 text-orange-400' : ''
              }`}
            >
              <div className="font-bold">{wd.vi}</div>
              <div className="text-[10px] opacity-70 font-normal">{wd.en}</div>
            </div>
          ))}
        </div>

        {/* Days Grid Cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-200 bg-slate-100">
          {daysArray.map((day, idx) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[125px] bg-slate-50/60 p-1 opacity-50 select-none"
                />
              );
            }

            const pad = (n: number) => n.toString().padStart(2, '0');
            const dateStr = `${currentYear}-${pad(currentMonth)}-${pad(day)}`;
            const isConflicted = conflictingDates.has(dateStr);
            const dayActs = getActivitiesForDay(day);
            const isWeekend = idx % 7 === 5 || idx % 7 === 6;

            return (
              <div
                key={`day-${day}`}
                id={`calendar-day-${dateStr}`}
                className={`min-h-[135px] p-1.5 flex flex-col justify-between transition-all group relative ${
                  isConflicted
                    ? 'bg-red-50/80 border-2 border-red-500 ring-2 ring-red-400/40 z-10'
                    : isWeekend
                    ? 'bg-slate-50/70 hover:bg-slate-100/80'
                    : 'bg-white hover:bg-slate-50/90'
                }`}
              >
                {/* Day Number & Conflict indicator & Add button */}
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        isConflicted
                          ? 'bg-red-600 text-white shadow-xs'
                          : isWeekend
                          ? 'text-orange-600 font-semibold'
                          : 'text-slate-800'
                      }`}
                    >
                      {day}
                    </span>

                    {/* Alarming Red Conflict Badge */}
                    {isConflicted && (
                      <span
                        className="inline-flex items-center gap-0.5 px-1 py-0.2 bg-red-600 text-white text-[9px] font-bold rounded uppercase tracking-wider animate-pulse cursor-pointer shadow-xs"
                        title="Phát hiện trùng lịch hoặc xung đột hoạt động!"
                        onClick={() =>
                          setSelectedDayActivities({ dateStr, items: dayActs })
                        }
                      >
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Trùng!
                      </span>
                    )}
                  </div>

                  {/* Add Event Quick Button */}
                  <button
                    id={`btn-add-for-${dateStr}`}
                    onClick={() => onAddActivityForDate(dateStr)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-orange-100 text-orange-600 rounded transition-all"
                    title={`Thêm hoạt động cho ngày ${formatDateVN(dateStr)}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* List of Activities in this day cell */}
                <div className="space-y-1 flex-1 overflow-y-auto max-h-[110px] scrollbar-none">
                  {dayActs.map((act) => {
                    const style = CATEGORY_CONFIG[act.category] || {
                      bg: 'bg-slate-100 hover:bg-slate-200',
                      text: 'text-slate-800',
                      border: 'border-slate-300',
                      badge: 'bg-slate-500 text-white',
                      hex: '#64748b',
                    };

                    const actConflicts = conflictMap[act.id] || [];
                    const hasConflict = actConflicts.length > 0;

                    return (
                      <div
                        key={act.id}
                        id={`calendar-act-${act.id}`}
                        onClick={() =>
                          setSelectedDayActivities({ dateStr, items: dayActs })
                        }
                        className={`p-1.5 rounded text-[11px] leading-tight border transition-all cursor-pointer select-none relative ${
                          hasConflict
                            ? 'bg-red-100 border-red-500 text-red-950 font-semibold shadow-xs ring-1 ring-red-400'
                            : `${style.bg} ${style.border} ${style.text}`
                        }`}
                        title={`${act.title} - Phụ trách: ${act.department} (${act.location || 'Địa điểm chưa định'})`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold truncate text-[10px] opacity-90">
                            [{act.department}]
                          </span>
                          {hasConflict && (
                            <span className="w-2 h-2 rounded-full bg-red-600 shrink-0 animate-ping"></span>
                          )}
                        </div>
                        <div className="line-clamp-2 font-medium">
                          {act.title}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom detail trigger if multiple items */}
                {dayActs.length > 0 && (
                  <button
                    onClick={() =>
                      setSelectedDayActivities({ dateStr, items: dayActs })
                    }
                    className="text-[10px] text-slate-500 hover:text-slate-900 text-left pt-0.5 font-medium block"
                  >
                    {dayActs.length} hoạt động
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Details Modal / Drawer when a day cell is clicked */}
      {selectedDayActivities && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                    Chi tiết ngày
                  </span>
                  <span className="text-base font-bold text-slate-900">
                    {formatDateVN(selectedDayActivities.dateStr)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Có {selectedDayActivities.items.length} hoạt động được lên lịch trong ngày này
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-add-activity-in-day-modal"
                  onClick={() => {
                    const date = selectedDayActivities.dateStr;
                    setSelectedDayActivities(null);
                    onAddActivityForDate(date);
                  }}
                  className="px-2.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm hoạt động
                </button>
                <button
                  onClick={() => setSelectedDayActivities(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* If conflicting, show prominent alert banner */}
              {conflictingDates.has(selectedDayActivities.dateStr) && (
                <div className="p-3.5 bg-red-50 border border-red-300 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>CẢNH BÁO TRÙNG LỊCH TRONG NGÀY NÀY!</span>
                  </div>
                  <p className="text-xs text-red-700 leading-relaxed">
                    Có sự trùng lặp về thời gian, địa điểm (ví dụ cùng ở FSC Hậu Giang) hoặc đối tượng tham gia giữa các Tổ / Phòng ban. Vui lòng kiểm tra và điều chỉnh lịch dưới đây.
                  </p>
                </div>
              )}

              {/* List of activities */}
              <div className="space-y-3">
                {selectedDayActivities.items.map((item) => {
                  const actConflicts = conflictMap[item.id] || [];
                  const isItemConflicted = actConflicts.length > 0;
                  const catStyle = CATEGORY_CONFIG[item.category] || {
                    badge: 'bg-slate-600 text-white',
                    hex: '#64748b',
                  };

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isItemConflicted
                          ? 'bg-red-50/50 border-red-400 shadow-xs ring-1 ring-red-400/50'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 text-xs font-bold rounded bg-slate-900 text-white">
                              Tổ {item.department}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-xs font-semibold rounded ${catStyle.badge}`}
                            >
                              {item.category}
                            </span>
                            {/* Status badge: Loading, Done, Cancel */}
                            {(() => {
                              const sKey = normalizeStatus(item.status);
                              if (sKey === 'done') {
                                return (
                                  <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    Done
                                  </span>
                                );
                              }
                              if (sKey === 'cancel') {
                                return (
                                  <span className="px-2 py-0.5 text-xs font-bold rounded bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1">
                                    <XCircle className="w-3 h-3 text-rose-600" />
                                    Cancel
                                  </span>
                                );
                              }
                              return (
                                <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                                  <Loader2 className="w-3 h-3 text-amber-600 animate-spin" />
                                  Loading
                                </span>
                              );
                            })()}
                            {isItemConflicted && (
                              <span className="px-2 py-0.5 text-xs font-bold rounded bg-red-600 text-white flex items-center gap-1 animate-pulse">
                                <AlertTriangle className="w-3 h-3" />
                                Trùng lịch ({actConflicts.length})
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 leading-snug pt-1">
                            {item.title}
                          </h4>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            id={`btn-edit-act-${item.id}`}
                            onClick={() => {
                              setSelectedDayActivities(null);
                              onEditActivity(item);
                            }}
                            className="p-1.5 text-slate-600 hover:text-orange-600 hover:bg-white rounded-lg border border-slate-200 transition-colors"
                            title="Chỉnh sửa hoạt động"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-delete-act-${item.id}`}
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn xóa hoạt động: "${item.title}"?`)) {
                                onDeleteActivity(item.id);
                                setSelectedDayActivities((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        items: prev.items.filter((x) => x.id !== item.id),
                                      }
                                    : null
                                );
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 transition-colors"
                            title="Xóa hoạt động"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Meta Information grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200/70 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            Thời gian:{' '}
                            <strong className="text-slate-800">
                              {formatDateRangeVN(item.startDate, item.endDate)}
                            </strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            Địa điểm:{' '}
                            <strong className="text-slate-800">
                              {item.location || 'Chưa định'}
                            </strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            Đối tượng:{' '}
                            <strong className="text-slate-800">
                              {item.targetAudience || 'Toàn trường'}
                            </strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            Dự trù kinh phí:{' '}
                            <strong className="text-emerald-700">
                              {formatCurrencyVND(item.budget || 0)}
                            </strong>
                          </span>
                        </div>
                      </div>

                      {item.notes && (
                        <div className="mt-2 text-xs text-slate-500 bg-white p-2 rounded border border-slate-200/60">
                          <span className="font-semibold text-slate-700">Ghi chú:</span>{' '}
                          {item.notes}
                        </div>
                      )}

                      {/* Conflict details if any */}
                      {actConflicts.map((conf) => (
                        <div
                          key={conf.id}
                          className="mt-2.5 p-2 bg-red-100/80 border border-red-300 rounded text-xs text-red-900"
                        >
                          <div className="font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                            <span>{conf.title}</span>
                          </div>
                          <div className="mt-0.5 text-[11px] text-red-800">
                            {conf.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedDayActivities(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
