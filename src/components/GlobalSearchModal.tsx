import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  Calendar,
  CalendarDays,
  Building2,
  Bell,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Tag,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  CornerDownLeft,
  ExternalLink,
  Sliders,
  FolderOpen,
  Filter,
} from 'lucide-react';
import {
  Activity,
  WeeklyActivity,
  DepartmentProfile,
  UserInteractionNotification,
  WeeklyUnit,
} from '../types';
import { formatCurrencyVND } from '../utils/conflictDetector';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: Activity[];
  weeklyActivities: WeeklyActivity[];
  departmentProfiles: Record<string, DepartmentProfile>;
  notifications: UserInteractionNotification[];
  onSelectYearlyActivity: (activity: Activity) => void;
  onSelectWeeklyActivity: (activity: WeeklyActivity) => void;
  onSelectDepartment: (deptName: string) => void;
  onNavigateView: (view: 'calendar' | 'table' | 'weekly' | 'department' | 'conflicts' | 'budget') => void;
  onOpenNotifications: () => void;
  onOpenAddNewYearly: () => void;
  onOpenAddNewWeekly: () => void;
  onExportCSV: () => void;
}

type SearchCategory = 'all' | 'yearly' | 'weekly' | 'department' | 'notification' | 'action';

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  activities,
  weeklyActivities,
  departmentProfiles,
  notifications,
  onSelectYearlyActivity,
  onSelectWeeklyActivity,
  onSelectDepartment,
  onNavigateView,
  onOpenNotifications,
  onOpenAddNewYearly,
  onOpenAddNewWeekly,
  onExportCSV,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    } else {
      setQuery('');
      setActiveCategory('all');
    }
  }, [isOpen]);

  // Keyboard navigation: ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Predefined Quick Navigation Actions
  const quickActions = useMemo(() => [
    {
      id: 'act-view-weekly',
      title: 'Xem Lịch tuần các tổ & phòng ban',
      subtitle: 'Theo dõi và cập nhật lịch công tác chi tiết từ Thứ Hai đến Chủ Nhật',
      category: 'action' as const,
      icon: CalendarDays,
      badge: 'Chuyển màn hình',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      action: () => {
        onNavigateView('weekly');
        onClose();
      },
    },
    {
      id: 'act-view-calendar',
      title: 'Xem Lịch kế hoạch theo tháng (Lịch bàn)',
      subtitle: 'Xem lịch tổng quan theo tháng từ T8/2026 đến T6/2027',
      category: 'action' as const,
      icon: Calendar,
      badge: 'Chuyển màn hình',
      badgeColor: 'bg-orange-100 text-orange-800',
      action: () => {
        onNavigateView('calendar');
        onClose();
      },
    },
    {
      id: 'act-view-table',
      title: 'Bảng tổng hợp kế hoạch năm',
      subtitle: 'Duyệt bảng chi tiết, lọc nâng cao, sửa trạng thái và dời ngày',
      category: 'action' as const,
      icon: Sliders,
      badge: 'Chuyển màn hình',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      action: () => {
        onNavigateView('table');
        onClose();
      },
    },
    {
      id: 'act-view-department',
      title: 'Xem Ma trận phân bổ Tổ chuyên môn & Phòng ban',
      subtitle: 'Bản đồ phụ trách của 4 tổ và 4 phòng ban, thông tin nhân sự và ngân sách',
      category: 'action' as const,
      icon: Building2,
      badge: 'Chuyển màn hình',
      badgeColor: 'bg-sky-100 text-sky-800',
      action: () => {
        onNavigateView('department');
        onClose();
      },
    },
    {
      id: 'act-view-conflicts',
      title: 'Trung tâm kiểm tra & Xử lý trùng lịch',
      subtitle: 'Tự động phát hiện trùng ngày, trùng địa điểm, quá tải phòng ban',
      category: 'action' as const,
      icon: AlertTriangle,
      badge: 'Công cụ',
      badgeColor: 'bg-rose-100 text-rose-800',
      action: () => {
        onNavigateView('conflicts');
        onClose();
      },
    },
    {
      id: 'act-view-budget',
      title: 'Phân tích tài chính & Dự toán kinh phí',
      subtitle: 'Thống kê ngân sách chi tiết theo tổ, phòng ban và học kỳ',
      category: 'action' as const,
      icon: DollarSign,
      badge: 'Tài chính',
      badgeColor: 'bg-teal-100 text-teal-800',
      action: () => {
        onNavigateView('budget');
        onClose();
      },
    },
    {
      id: 'act-open-notifs',
      title: 'Trung tâm thông báo & Nhật ký tương tác',
      subtitle: 'Xem toàn bộ lịch sử người dùng thêm, sửa, đổi trạng thái và dời lịch',
      category: 'action' as const,
      icon: Bell,
      badge: 'Hệ thống',
      badgeColor: 'bg-amber-100 text-amber-800',
      action: () => {
        onOpenNotifications();
        onClose();
      },
    },
    {
      id: 'act-new-yearly',
      title: 'Thêm hoạt động kế hoạch năm mới',
      subtitle: 'Khởi tạo sự kiện năm học 2026 - 2027 với đầy đủ địa điểm và dự toán',
      category: 'action' as const,
      icon: Sparkles,
      badge: 'Thao tác nhanh',
      badgeColor: 'bg-orange-100 text-orange-800',
      action: () => {
        onOpenAddNewYearly();
        onClose();
      },
    },
    {
      id: 'act-new-weekly',
      title: 'Thêm công việc lịch tuần mới',
      subtitle: 'Ghi nhận nhiệm vụ tuần cho các tổ chuyên môn hoặc phòng ban',
      category: 'action' as const,
      icon: CalendarDays,
      badge: 'Thao tác nhanh',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      action: () => {
        onOpenAddNewWeekly();
        onClose();
      },
    },
    {
      id: 'act-export-csv',
      title: 'Xuất bảng kế hoạch ra file Excel/CSV',
      subtitle: 'Tải về máy tệp dữ liệu bảng kế hoạch hoạt động năm học',
      category: 'action' as const,
      icon: FileSpreadsheet,
      badge: 'Xuất dữ liệu',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      action: () => {
        onExportCSV();
        onClose();
      },
    },
  ], [
    onNavigateView,
    onOpenNotifications,
    onOpenAddNewYearly,
    onOpenAddNewWeekly,
    onExportCSV,
    onClose,
  ]);

  // Search Results across all entities
  const searchResults = useMemo(() => {
    const rawQ = query.trim().toLowerCase();
    const isBlank = rawQ === '';

    // 1. Search Yearly Activities
    const matchedYearly = activities.filter((act) => {
      if (isBlank) return true;
      return (
        act.title.toLowerCase().includes(rawQ) ||
        (act.description && act.description.toLowerCase().includes(rawQ)) ||
        act.department.toLowerCase().includes(rawQ) ||
        (act.location && act.location.toLowerCase().includes(rawQ)) ||
        (act.participants && act.participants.toLowerCase().includes(rawQ)) ||
        (act.notes && act.notes.toLowerCase().includes(rawQ)) ||
        (act.category && act.category.toLowerCase().includes(rawQ)) ||
        (act.startDate && act.startDate.includes(rawQ)) ||
        `tháng ${act.month}`.includes(rawQ) ||
        `thang ${act.month}`.includes(rawQ) ||
        (act.semester && act.semester.toLowerCase().includes(rawQ))
      );
    });

    // 2. Search Weekly Activities
    const matchedWeekly = weeklyActivities.filter((w) => {
      if (isBlank) return true;
      return (
        w.title.toLowerCase().includes(rawQ) ||
        w.unit.toLowerCase().includes(rawQ) ||
        (w.content && w.content.toLowerCase().includes(rawQ)) ||
        (w.participants && w.participants.toLowerCase().includes(rawQ)) ||
        (w.location && w.location.toLowerCase().includes(rawQ)) ||
        (w.dayOfWeek && w.dayOfWeek.toLowerCase().includes(rawQ)) ||
        (w.date && w.date.includes(rawQ)) ||
        (w.notes && w.notes.toLowerCase().includes(rawQ)) ||
        (w.time && w.time.toLowerCase().includes(rawQ)) ||
        (w.isOnline && ('trực tuyến' .includes(rawQ) || 'online'.includes(rawQ) || 'zoom'.includes(rawQ)))
      );
    });

    // 3. Search Department Profiles
    const deptList: DepartmentProfile[] = Object.values(departmentProfiles || {}) as DepartmentProfile[];
    const matchedDepts = deptList.filter((d: DepartmentProfile) => {
      if (isBlank) return true;
      return (
        d.department.toLowerCase().includes(rawQ) ||
        (d.code && d.code.toLowerCase().includes(rawQ)) ||
        (d.headName && d.headName.toLowerCase().includes(rawQ)) ||
        (d.deputyName && d.deputyName.toLowerCase().includes(rawQ)) ||
        (d.officeLocation && d.officeLocation.toLowerCase().includes(rawQ)) ||
        (d.phone && d.phone.toLowerCase().includes(rawQ)) ||
        (d.email && d.email.toLowerCase().includes(rawQ)) ||
        (d.focusObjectives && d.focusObjectives.toLowerCase().includes(rawQ)) ||
        (d.notes && d.notes.toLowerCase().includes(rawQ))
      );
    });

    // 4. Search Notifications / History
    const matchedNotifications = notifications.filter((n) => {
      if (isBlank) return false; // only show in search if query is typed
      return (
        n.title.toLowerCase().includes(rawQ) ||
        n.message.toLowerCase().includes(rawQ) ||
        (n.userName && n.userName.toLowerCase().includes(rawQ)) ||
        (n.department && n.department.toLowerCase().includes(rawQ))
      );
    });

    // 5. Search Quick Actions
    const matchedActions = quickActions.filter((a) => {
      if (isBlank) return true;
      return (
        a.title.toLowerCase().includes(rawQ) ||
        a.subtitle.toLowerCase().includes(rawQ) ||
        a.badge.toLowerCase().includes(rawQ)
      );
    });

    return {
      yearly: matchedYearly,
      weekly: matchedWeekly,
      departments: matchedDepts,
      notifications: matchedNotifications,
      actions: matchedActions,
      totalCount:
        matchedYearly.length +
        matchedWeekly.length +
        matchedDepts.length +
        matchedNotifications.length +
        matchedActions.length,
    };
  }, [query, activities, weeklyActivities, departmentProfiles, notifications, quickActions]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 sm:pt-16 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Top Search Input Box */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-orange-50/50 via-amber-50/30 to-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-200 shrink-0">
            <Search className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0 relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm bất kỳ: Hoạt động năm, Lịch tuần, Tổ/Phòng ban, Địa điểm, Giáo viên, Ngân sách..."
              className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 font-medium text-sm sm:text-base focus:outline-none pr-8"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title="Xóa từ khóa"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded-md">
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              title="Đóng tìm kiếm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Categories / Tabs Filter Bar */}
        <div className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 border-b border-slate-100 overflow-x-auto scrollbar-none bg-slate-50/80 text-xs">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            Tất cả kết quả ({searchResults.totalCount})
          </button>

          <button
            onClick={() => setActiveCategory('yearly')}
            className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'yearly'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Kế hoạch năm ({searchResults.yearly.length})</span>
          </button>

          <button
            onClick={() => setActiveCategory('weekly')}
            className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'weekly'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Lịch tuần ({searchResults.weekly.length})</span>
          </button>

          <button
            onClick={() => setActiveCategory('department')}
            className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'department'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Tổ / Phòng ban ({searchResults.departments.length})</span>
          </button>

          {searchResults.notifications.length > 0 && (
            <button
              onClick={() => setActiveCategory('notification')}
              className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeCategory === 'notification'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Nhật ký ({searchResults.notifications.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveCategory('action')}
            className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'action'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Điều hướng & Thao tác ({searchResults.actions.length})</span>
          </button>
        </div>

        {/* Scrollable Results List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {searchResults.totalCount === 0 ? (
            <div className="py-14 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Search className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">
                  Không tìm thấy kết quả nào phù hợp với &ldquo;{query}&rdquo;
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Hãy thử tìm bằng từ khóa ngắn hơn như tên hoạt động, tổ chuyên môn (Anh - Xã hội, KHTN, Đào tạo, CTHS) hoặc thời gian.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* SECTION: Quick Actions / Điều hướng */}
              {(activeCategory === 'all' || activeCategory === 'action') &&
                searchResults.actions.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2.5 text-xs font-black uppercase tracking-wider text-slate-400">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Điều hướng & Chức năng hệ thống ({searchResults.actions.length})</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {searchResults.actions.map((item) => {
                        const IconComp = item.icon;
                        return (
                          <div
                            key={item.id}
                            onClick={item.action}
                            className="p-3 rounded-2xl border border-slate-200/90 hover:border-orange-300 hover:bg-orange-50/40 transition-all cursor-pointer flex items-start gap-3 group"
                          >
                            <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-orange-600 group-hover:text-white text-slate-700 transition-colors shrink-0">
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <span className="text-xs font-bold text-slate-900 group-hover:text-orange-700 transition-colors truncate">
                                  {item.title}
                                </span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0 ${item.badgeColor}`}>
                                  {item.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-1">
                                {item.subtitle}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* SECTION: Kế hoạch năm (Yearly Activities) */}
              {(activeCategory === 'all' || activeCategory === 'yearly') &&
                searchResults.yearly.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2.5 text-xs font-black uppercase tracking-wider text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-orange-600" />
                      <span>Hoạt động kế hoạch năm học ({searchResults.yearly.length})</span>
                    </div>
                    <div className="space-y-2">
                      {searchResults.yearly.slice(0, activeCategory === 'yearly' ? 50 : 8).map((act) => (
                        <div
                          key={act.id}
                          onClick={() => {
                            onSelectYearlyActivity(act);
                            onClose();
                          }}
                          className="p-3 rounded-2xl border border-slate-200/90 hover:border-orange-300 hover:bg-orange-50/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                        >
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 font-bold flex flex-col items-center justify-center text-center shrink-0">
                              <span className="text-[10px] uppercase leading-none text-orange-600">Tháng</span>
                              <span className="text-sm font-black leading-tight">{act.month}</span>
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <h4 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-orange-700 transition-colors line-clamp-1">
                                  {act.title}
                                </h4>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                  {act.department}
                                </span>
                                {act.semester && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                    {act.semester}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {act.startDate} {act.endDate ? `đến ${act.endDate}` : ''}
                                </span>
                                {act.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    {act.location}
                                  </span>
                                )}
                                {act.budget && act.budget > 0 ? (
                                  <span className="text-emerald-700 font-bold">
                                    {formatCurrencyVND(act.budget)}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-slate-400 group-hover:text-orange-600 shrink-0">
                            <span className="text-xs font-bold hidden sm:inline">Mở chi tiết</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* SECTION: Lịch tuần (Weekly Activities) */}
              {(activeCategory === 'all' || activeCategory === 'weekly') &&
                searchResults.weekly.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2.5 text-xs font-black uppercase tracking-wider text-slate-400">
                      <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Công việc lịch tuần ({searchResults.weekly.length})</span>
                    </div>
                    <div className="space-y-2">
                      {searchResults.weekly.slice(0, activeCategory === 'weekly' ? 50 : 8).map((w) => (
                        <div
                          key={w.id}
                          onClick={() => {
                            onSelectWeeklyActivity(w);
                            onClose();
                          }}
                          className="p-3 rounded-2xl border border-slate-200/90 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                        >
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-800 font-bold flex flex-col items-center justify-center text-center shrink-0">
                              <span className="text-[9px] uppercase leading-none text-indigo-600">{w.dayOfWeek}</span>
                              <span className="text-xs font-black leading-tight mt-0.5">{w.date.substring(5)}</span>
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <h4 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-1">
                                  {w.title}
                                </h4>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  {w.unit}
                                </span>
                                {w.isOnline && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800">
                                    Online / Zoom
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                                {w.time && <span>{w.time}</span>}
                                {w.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    {w.location}
                                  </span>
                                )}
                                {w.participants && (
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3 text-slate-400" />
                                    {w.participants}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-slate-400 group-hover:text-indigo-600 shrink-0">
                            <span className="text-xs font-bold hidden sm:inline">Xem lịch tuần</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* SECTION: Tổ & Phòng ban (Departments) */}
              {(activeCategory === 'all' || activeCategory === 'department') &&
                searchResults.departments.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2.5 text-xs font-black uppercase tracking-wider text-slate-400">
                      <Building2 className="w-3.5 h-3.5 text-sky-600" />
                      <span>Hồ sơ Tổ chuyên môn & Phòng ban ({searchResults.departments.length})</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {searchResults.departments.map((dept) => (
                        <div
                          key={dept.department}
                          onClick={() => {
                            onSelectDepartment(dept.department);
                            onClose();
                          }}
                          className="p-3.5 rounded-2xl border border-slate-200/90 hover:border-sky-300 hover:bg-sky-50/40 transition-all cursor-pointer flex items-start gap-3 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-black text-xs shrink-0">
                            {dept.code || 'PB'}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-black text-slate-900 group-hover:text-sky-700 transition-colors truncate">
                              {dept.department}
                            </h4>
                            <div className="mt-1 space-y-0.5 text-[11px] text-slate-500">
                              {dept.headName && <div>Trưởng tổ/đơn vị: <strong className="text-slate-700">{dept.headName}</strong></div>}
                              {dept.phone && <div>Liên hệ: {dept.phone}</div>}
                              {dept.allocatedBudget ? (
                                <div className="text-emerald-700 font-bold">
                                  Kinh phí: {formatCurrencyVND(dept.allocatedBudget)}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* SECTION: Nhật ký tương tác & Thông báo */}
              {(activeCategory === 'all' || activeCategory === 'notification') &&
                searchResults.notifications.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2.5 text-xs font-black uppercase tracking-wider text-slate-400">
                      <Bell className="w-3.5 h-3.5 text-amber-600" />
                      <span>Thông báo & Nhật ký tương tác liên quan ({searchResults.notifications.length})</span>
                    </div>
                    <div className="space-y-2">
                      {searchResults.notifications.slice(0, 6).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            onOpenNotifications();
                            onClose();
                          }}
                          className="p-3 rounded-2xl border border-slate-200/90 hover:bg-amber-50/40 hover:border-amber-300 transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="text-xs font-bold text-slate-900">{n.title}</span>
                            <span className="text-[10px] text-slate-400">{n.formattedTime}</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-1">{n.message}</p>
                          <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                            <span>Người thực hiện: <strong className="text-slate-800">{n.userName || 'Cán bộ'}</strong></span>
                            {n.department && <span>• {n.department}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-medium">
              <CornerDownLeft className="w-3.5 h-3.5 text-slate-400" /> Chọn để xem / sửa
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="hidden sm:inline font-medium text-slate-400">
              Nhấn phím <strong>/</strong> hoặc <strong>Ctrl + K</strong> để mở nhanh tìm kiếm
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold cursor-pointer transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
