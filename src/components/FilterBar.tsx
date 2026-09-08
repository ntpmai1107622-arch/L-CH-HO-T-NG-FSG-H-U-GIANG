import React from 'react';
import {
  Search,
  Filter,
  AlertCircle,
  X,
  Calendar,
  Building2,
  Tag,
} from 'lucide-react';
import { ACADEMIC_YEAR_MONTHS, CATEGORY_CONFIG, DEPARTMENTS_LIST } from '../data/initialData';
import { Department, EventCategory, Semester } from '../types';

interface FilterBarProps {
  selectedMonthKey: string; // "8-2026"
  setSelectedMonthKey: (key: string) => void;
  selectedSemester: Semester | 'ALL';
  setSelectedSemester: (sem: Semester | 'ALL') => void;
  selectedDepartment: string;
  setSelectedDepartment: (dep: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onlyConflicts: boolean;
  setOnlyConflicts: (only: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  totalConflictsCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedMonthKey,
  setSelectedMonthKey,
  selectedSemester,
  setSelectedSemester,
  selectedDepartment,
  setSelectedDepartment,
  selectedCategory,
  setSelectedCategory,
  onlyConflicts,
  setOnlyConflicts,
  searchQuery,
  setSearchQuery,
  totalConflictsCount,
}) => {
  const isFiltered =
    selectedSemester !== 'ALL' ||
    selectedDepartment !== 'ALL' ||
    selectedCategory !== 'ALL' ||
    onlyConflicts ||
    searchQuery !== '';

  const clearFilters = () => {
    setSelectedSemester('ALL');
    setSelectedDepartment('ALL');
    setSelectedCategory('ALL');
    setOnlyConflicts(false);
    setSearchQuery('');
  };

  return (
    <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 lg:px-8 space-y-3">
      {/* Month timeline picker */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-orange-600" />
          Chọn tháng:
        </span>
        <div className="flex items-center gap-1.5">
          {ACADEMIC_YEAR_MONTHS.map((m) => {
            const key = `${m.month}-${m.year}`;
            const isSelected = selectedMonthKey === key;
            return (
              <button
                key={key}
                id={`btn-month-${key}`}
                onClick={() => setSelectedMonthKey(key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{m.label}</span>
                {m.semester === 'HK1' && (
                  <span className="text-[10px] opacity-70">HK1</span>
                )}
                {m.semester === 'HK2' && (
                  <span className="text-[10px] opacity-70">HK2</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter controls row */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="search-activities-input"
              type="text"
              placeholder="Tìm nội dung, đối tượng, địa điểm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Department Filter */}
          <div className="relative">
            <select
              id="filter-department-select"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="appearance-none pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
            >
              <option value="ALL">Tất cả Tổ / Phòng ban</option>
              {DEPARTMENTS_LIST.map((d) => (
                <option key={d} value={d}>
                  Tổ: {d}
                </option>
              ))}
            </select>
            <Building2 className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              id="filter-category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
            >
              <option value="ALL">Tất cả Loại hoạt động</option>
              {Object.keys(CATEGORY_CONFIG).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <Tag className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Semester Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
            {(['ALL', 'HK1', 'HK2', 'Hè'] as const).map((sem) => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  selectedSemester === sem
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sem === 'ALL' ? 'Cả năm' : sem}
              </button>
            ))}
          </div>
        </div>

        {/* Highlight Red Conflict Button Toggle */}
        <div className="flex items-center gap-2">
          <button
            id="toggle-conflict-only-btn"
            onClick={() => setOnlyConflicts(!onlyConflicts)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              onlyConflicts
                ? 'bg-red-600 text-white border-red-700 shadow-xs ring-2 ring-red-400'
                : totalConflictsCount > 0
                ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                : 'bg-slate-50 text-slate-600 border-slate-200 opacity-60'
            }`}
          >
            <AlertCircle className={`w-4 h-4 ${onlyConflicts ? 'text-white' : 'text-red-600'}`} />
            <span>Chỉ xem các mục TRÙNG NHAU (Màu đỏ)</span>
            {totalConflictsCount > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  onlyConflicts ? 'bg-white text-red-700 font-extrabold' : 'bg-red-600 text-white'
                }`}
              >
                {totalConflictsCount}
              </span>
            )}
          </button>

          {isFiltered && (
            <button
              onClick={clearFilters}
              className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
