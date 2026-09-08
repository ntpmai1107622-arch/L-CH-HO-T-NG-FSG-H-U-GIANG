import React from 'react';
import {
  Calendar as CalendarIcon,
  AlertTriangle,
  Plus,
  RotateCcw,
  Download,
  FileSpreadsheet,
  Layers,
  CheckCircle2,
  CalendarDays,
  Video,
  Bell,
  Search,
} from 'lucide-react';
import { Activity, ConflictIssue } from '../types';
import { formatCurrencyVND } from '../utils/conflictDetector';

interface NavbarProps {
  activities: Activity[];
  conflictIssues: ConflictIssue[];
  weeklyCount?: number;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  onOpenSearch?: () => void;
  activeView: 'calendar' | 'table' | 'weekly' | 'department' | 'conflicts' | 'budget';
  setActiveView: (view: 'calendar' | 'table' | 'weekly' | 'department' | 'conflicts' | 'budget') => void;
  onAddNew: () => void;
  onAddNewWeekly?: () => void;
  onResetData: () => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activities,
  conflictIssues,
  weeklyCount = 0,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onOpenSearch,
  activeView,
  setActiveView,
  onAddNew,
  onAddNewWeekly,
  onResetData,
  onExportCSV,
}) => {

  const totalBudget = activities
    .filter((a) => a.status !== 'cancelled')
    .reduce((sum, a) => sum + (a.budget || 0), 0);

  const activeCount = activities.filter((a) => a.status !== 'cancelled').length;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top brand row */}
        <div className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white font-bold shadow-md shadow-orange-200">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                  FPT School Hậu Giang
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Năm học 2026 - 2027
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                Lịch Hoạt Động & Kế Hoạch Các Tổ / Phòng Ban
              </h1>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-sm">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
              <span className="text-xs text-slate-500 font-medium">Hoạt động năm:</span>
              <span className="font-bold text-slate-900">{activeCount}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-800">
              <span className="text-xs text-indigo-600 font-medium">Lịch tuần:</span>
              <span className="font-bold">{weeklyCount}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800">
              <span className="text-xs text-emerald-600 font-medium">Kinh phí:</span>
              <span className="font-bold">{formatCurrencyVND(totalBudget)}</span>
            </div>

            {conflictIssues.length > 0 ? (
              <button
                id="navbar-conflicts-button"
                onClick={() => setActiveView('conflicts')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold shadow-xs shadow-red-200 transition-all animate-pulse"
                title="Bấm để xem chi tiết các mục bị trùng lịch"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>{conflictIssues.length} Trùng lịch!</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Không có trùng lịch</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2">
              {onOpenSearch && (
                <button
                  id="navbar-search-button"
                  onClick={onOpenSearch}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-700 rounded-lg border border-slate-200 hover:border-orange-300 transition-all font-semibold text-xs sm:text-sm cursor-pointer shadow-2xs group"
                  title="Tìm kiếm bất kỳ thông tin nào trên dashboard (Phím tắt: Ctrl + K hoặc /)"
                  aria-label="Tìm kiếm toàn diện dashboard"
                >
                  <Search className="w-4 h-4 text-slate-500 group-hover:text-orange-600 transition-colors" />
                  <span className="hidden md:inline">Tìm kiếm</span>
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-white border border-slate-200 rounded shadow-2xs">
                    Ctrl+K
                  </kbd>
                </button>
              )}

              {onOpenNotifications && (
                <button
                  id="navbar-notifications-button"
                  onClick={onOpenNotifications}
                  className="relative p-2 text-slate-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  title="Xem thông báo & nhật ký tương tác người dùng"
                  aria-label="Thông báo tương tác"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-orange-600 text-white text-[10px] font-black animate-pulse">
                      {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                    </span>
                  )}
                </button>
              )}

              <button
                id="btn-add-activity-top"
                onClick={activeView === 'weekly' && onAddNewWeekly ? onAddNewWeekly : onAddNew}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {activeView === 'weekly' ? 'Thêm việc tuần' : 'Thêm hoạt động'}
                </span>
                <span className="sm:hidden">Thêm</span>
              </button>

              <button
                id="btn-export-csv"
                onClick={onExportCSV}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                title="Xuất file bảng kế hoạch (CSV/Excel)"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>

              <button
                id="btn-reset-data"
                onClick={onResetData}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 transition-colors"
                title="Khôi phục dữ liệu gốc theo văn bản nhà trường"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between overflow-x-auto py-2 scrollbar-none gap-2">
          <nav className="flex space-x-1">
            {/* NEW TAB: LỊCH HOẠT ĐỘNG TUẦN */}
            <button
              id="view-tab-weekly"
              onClick={() => setActiveView('weekly')}
              className={`px-3.5 py-1.5 text-sm font-black rounded-lg transition-all flex items-center gap-2 relative ${
                activeView === 'weekly'
                  ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-300'
                  : 'text-indigo-900 bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-200/80'
              }`}
            >
              <CalendarDays className="w-4 h-4 text-indigo-500 group-hover:text-indigo-600" />
              <span>Lịch Tuần Các Tổ / Phòng Ban</span>
              <span className="flex items-center gap-0.5 px-1.5 py-0.2 text-[10px] font-black bg-amber-400 text-indigo-950 rounded">
                <Video className="w-2.5 h-2.5" />
                Meet + Outlook
              </span>
            </button>

            <button
              id="view-tab-calendar"
              onClick={() => setActiveView('calendar')}
              className={`px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
                activeView === 'calendar'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              Lịch Tháng Trực Quan
            </button>

            <button
              id="view-tab-table"
              onClick={() => setActiveView('table')}
              className={`px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
                activeView === 'table'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Bảng Kế Hoạch Chi Tiết
            </button>

            <button
              id="view-tab-department"
              onClick={() => setActiveView('department')}
              className={`px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
                activeView === 'department'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              Theo Tổ / Phòng Ban
            </button>

            <button
              id="view-tab-conflicts"
              onClick={() => setActiveView('conflicts')}
              className={`px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 relative ${
                activeView === 'conflicts'
                  ? 'bg-red-600 text-white shadow-xs'
                  : conflictIssues.length > 0
                  ? 'text-red-700 bg-red-50 hover:bg-red-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Xử lý Trùng Lịch</span>
              {conflictIssues.length > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${
                    activeView === 'conflicts'
                      ? 'bg-white text-red-700'
                      : 'bg-red-600 text-white'
                  }`}
                >
                  {conflictIssues.length}
                </span>
              )}
            </button>

            <button
              id="view-tab-budget"
              onClick={() => setActiveView('budget')}
              className={`px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
                activeView === 'budget'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Download className="w-4 h-4" />
              Dự trù Ngân Sách & Xuất Báo Cáo
            </button>
          </nav>

          {onOpenSearch && (
            <button
              id="view-tab-search-quick"
              onClick={onOpenSearch}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-orange-700 bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 rounded-lg transition-colors cursor-pointer shrink-0 ml-auto"
              title="Tìm kiếm bất kỳ thông tin nào trên dashboard"
            >
              <Search className="w-3.5 h-3.5 text-orange-600" />
              <span>Tìm kiếm dữ liệu dashboard...</span>
              <kbd className="px-1.5 py-0.2 text-[10px] font-bold text-slate-400 bg-white border border-slate-200 rounded">
                Ctrl+K
              </kbd>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

