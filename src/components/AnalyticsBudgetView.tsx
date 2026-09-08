import React from 'react';
import {
  DollarSign,
  FileSpreadsheet,
  Download,
  Printer,
  PieChart,
  Calendar,
  Building2,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { Activity } from '../types';
import { ACADEMIC_YEAR_MONTHS, DEPARTMENTS_LIST, CATEGORY_CONFIG } from '../data/initialData';
import { formatCurrencyVND } from '../utils/conflictDetector';

interface AnalyticsBudgetViewProps {
  activities: Activity[];
  onExportCSV: () => void;
  onExportJSON: () => void;
}

export const AnalyticsBudgetView: React.FC<AnalyticsBudgetViewProps> = ({
  activities,
  onExportCSV,
  onExportJSON,
}) => {
  const activeActivities = activities.filter((a) => a.status !== 'cancelled');

  const totalBudget = activeActivities.reduce((sum, a) => sum + (a.budget || 0), 0);

  // Group by department
  const departmentStats = DEPARTMENTS_LIST.map((dept) => {
    const deptActs = activeActivities.filter((a) => a.department === dept);
    const cost = deptActs.reduce((s, a) => s + (a.budget || 0), 0);
    return {
      department: dept,
      count: deptActs.length,
      budget: cost,
      percentage: totalBudget > 0 ? ((cost / totalBudget) * 100).toFixed(1) : '0',
    };
  }).sort((a, b) => b.budget - a.budget);

  // Group by category
  const categoryStats = Object.keys(CATEGORY_CONFIG).map((cat) => {
    const catActs = activeActivities.filter((a) => a.category === cat);
    const cost = catActs.reduce((s, a) => s + (a.budget || 0), 0);
    return {
      category: cat,
      count: catActs.length,
      budget: cost,
      style: CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG],
    };
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Export Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
            Thống kê & Ngân sách
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Tổng Hợp Kế Hoạch & Dự Trù Kinh Phí Năm Học 2026 - 2027
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Báo cáo phân bổ ngân sách, số lượng chương trình theo từng Tổ / Phòng ban
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-analytics-export-csv"
            onClick={onExportCSV}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Excel / CSV</span>
          </button>

          <button
            id="btn-analytics-export-json"
            onClick={onExportJSON}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Sao lưu JSON</span>
          </button>

          <button
            id="btn-analytics-print"
            onClick={handlePrint}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>In kế hoạch</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Tổng dự trù kinh phí
          </span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {formatCurrencyVND(totalBudget)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Gồm hoạt động thường niên & mới
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Tổng số công việc / hoạt động
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {activeActivities.length}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Được phân bổ trong 14 tháng
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Tổ phụ trách nhiều kinh phí nhất
          </span>
          <div className="text-lg font-bold text-orange-600 truncate mt-1">
            Tổ: {departmentStats[0]?.department || '—'}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block font-semibold text-emerald-700">
            {formatCurrencyVND(departmentStats[0]?.budget || 0)} ({departmentStats[0]?.percentage}%)
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Học kỳ trọng điểm
          </span>
          <div className="text-lg font-bold text-slate-900 mt-1">
            Học kỳ I & Học kỳ II
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Tháng 8/2026 đến Tháng 5/2027
          </span>
        </div>
      </div>

      {/* Budget Breakdown by Department Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Department Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-orange-600" />
            <span>Phân bổ ngân sách theo Tổ / Phòng ban</span>
          </h3>

          <div className="space-y-3">
            {departmentStats.map((item) => (
              <div key={item.department} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800">
                    Tổ {item.department} ({item.count} hoạt động)
                  </span>
                  <span className="text-emerald-700 font-bold">
                    {formatCurrencyVND(item.budget)} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.max(2, Number(item.percentage)))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Category Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-orange-600" />
            <span>Phân bổ theo loại hình hoạt động</span>
          </h3>

          <div className="space-y-2.5">
            {categoryStats.map((cat) => (
              <div
                key={cat.category}
                className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.style.hex }}
                  />
                  <div>
                    <div className="font-bold text-slate-900">{cat.category}</div>
                    <div className="text-[11px] text-slate-500">{cat.count} sự kiện</div>
                  </div>
                </div>

                <div className="font-bold text-emerald-700">
                  {formatCurrencyVND(cat.budget)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
