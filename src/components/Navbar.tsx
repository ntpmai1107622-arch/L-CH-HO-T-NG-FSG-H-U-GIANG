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
} from 'lucide-react';
import { Activity, ConflictIssue } from '../types';
import { formatCurrencyVND } from '../utils/conflictDetector';

interface NavbarProps {
  activities: Activity[];
  conflictIssues: ConflictIssue[];
  weeklyCount?: number;
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
        </div>
      </div>
    </header>
  );
};

