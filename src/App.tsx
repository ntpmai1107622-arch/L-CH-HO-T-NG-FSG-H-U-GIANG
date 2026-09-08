import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Activity,
  ActivityStatus,
  ConflictIssue,
  DepartmentProfile,
  Semester,
  WeeklyActivity,
  WeeklyUnit,
} from './types';
import { INITIAL_ACTIVITIES, ACADEMIC_YEAR_MONTHS, DEFAULT_DEPARTMENT_PROFILES } from './data/initialData';
import { INITIAL_WEEKLY_ACTIVITIES } from './data/initialWeeklyData';
import { detectScheduleConflicts } from './utils/conflictDetector';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { MonthCalendarGrid } from './components/MonthCalendarGrid';
import { TableView } from './components/TableView';
import { DepartmentMatrixView } from './components/DepartmentMatrixView';
import { ConflictResolutionCenter } from './components/ConflictResolutionCenter';
import { AnalyticsBudgetView } from './components/AnalyticsBudgetView';
import { ActivityModal } from './components/ActivityModal';
import { WeeklyScheduleView } from './components/WeeklyScheduleView';
import { WeeklyActivityModal } from './components/WeeklyActivityModal';
import { WeeklyReminderBanner } from './components/WeeklyReminderBanner';

const LOCAL_STORAGE_KEY = 'fpt_school_calendar_2026_2027_v1';
const LOCAL_STORAGE_WEEKLY_KEY = 'fpt_school_weekly_activities_2026_v2_clean';
const LOCAL_STORAGE_PROFILES_KEY = 'fpt_school_department_profiles_2026_v1';

export default function App() {
  // 1. Core State with Local Storage persistence
  const [activities, setActivities] = useState<Activity[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading saved calendar data:', e);
    }
    return INITIAL_ACTIVITIES;
  });

  // Save to local storage whenever activities change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(activities));
    } catch (e) {
      console.error('Error saving calendar data:', e);
    }
  }, [activities]);

  // 1.2 Weekly Activities State with Local Storage persistence
  const [weeklyActivities, setWeeklyActivities] = useState<WeeklyActivity[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_WEEKLY_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading weekly activities:', e);
    }
    return INITIAL_WEEKLY_ACTIVITIES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_WEEKLY_KEY, JSON.stringify(weeklyActivities));
    } catch (e) {
      console.error('Error saving weekly activities:', e);
    }
  }, [weeklyActivities]);

  // 1.3 Department Profiles State with Local Storage persistence
  const [departmentProfiles, setDepartmentProfiles] = useState<Record<string, DepartmentProfile>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PROFILES_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading department profiles:', e);
    }
    return DEFAULT_DEPARTMENT_PROFILES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PROFILES_KEY, JSON.stringify(departmentProfiles));
    } catch (e) {
      console.error('Error saving department profiles:', e);
    }
  }, [departmentProfiles]);

  // 2. Active Tab / View
  const [activeView, setActiveView] = useState<
    'calendar' | 'table' | 'weekly' | 'department' | 'conflicts' | 'budget'
  >('weekly');

  // 3. Filters for Yearly Plan
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('8-2026'); // Month 8, 2026
  const [selectedSemester, setSelectedSemester] = useState<Semester | 'ALL'>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [onlyConflicts, setOnlyConflicts] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Parse Month & Year from key "8-2026"
  const [currentMonth, currentYear] = useMemo(() => {
    const parts = selectedMonthKey.split('-');
    return [parseInt(parts[0], 10) || 8, parseInt(parts[1], 10) || 2026];
  }, [selectedMonthKey]);

  // 4. Run Conflict Detection Engine on all active activities
  const { conflictMap, conflictingDates, allIssues } = useMemo(() => {
    return detectScheduleConflicts(activities);
  }, [activities]);

  // 5. Filter activities for views
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (act.title || '').toLowerCase().includes(q);
        const matchDept = (act.department || '').toLowerCase().includes(q);
        const matchAud = (act.targetAudience || '').toLowerCase().includes(q);
        const matchLoc = (act.location || '').toLowerCase().includes(q);
        const matchNotes = (act.notes || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDept && !matchAud && !matchLoc && !matchNotes) {
          return false;
        }
      }

      // Conflict only filter
      if (onlyConflicts) {
        const hasConflict = (conflictMap[act.id] || []).length > 0;
        if (!hasConflict) return false;
      }

      // Department filter
      if (selectedDepartment !== 'ALL' && act.department !== selectedDepartment) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL' && act.category !== selectedCategory) {
        return false;
      }

      // Semester filter
      if (selectedSemester !== 'ALL' && act.semester !== selectedSemester) {
        return false;
      }

      // For calendar view, only match current month (unless table / department / budget view)
      if (activeView === 'calendar') {
        const matchMonth = act.month === currentMonth && act.year === currentYear;
        return matchMonth;
      }

      return true;
    });
  }, [
    activities,
    searchQuery,
    onlyConflicts,
    selectedDepartment,
    selectedCategory,
    selectedSemester,
    activeView,
    currentMonth,
    currentYear,
    conflictMap,
  ]);

  // 6. Modal State for Yearly Plan
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<string>('2026-09-01');
  const [modalDefaultDept, setModalDefaultDept] = useState<string>('Đào tạo');

  // 7. Modal State for Weekly Schedule
  const [isWeeklyModalOpen, setIsWeeklyModalOpen] = useState(false);
  const [editingWeeklyActivity, setEditingWeeklyActivity] = useState<WeeklyActivity | null>(null);
  const [weeklyDefaultDate, setWeeklyDefaultDate] = useState<string>('2026-09-07');
  const [weeklyDefaultUnit, setWeeklyDefaultUnit] = useState<WeeklyUnit>('Tiếng Anh - Xã hội');

  // Handlers for Yearly Activities
  const handleOpenAddNew = (defaultDate?: string, defaultDept?: string) => {
    setEditingActivity(null);
    setModalDefaultDate(
      defaultDate ||
        `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`
    );
    setModalDefaultDept(defaultDept || 'Đào tạo');
    setIsModalOpen(true);
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setIsModalOpen(true);
  };

  const handleDeleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSaveActivity = (activity: Activity) => {
    setActivities((prev) => {
      const exists = prev.some((a) => a.id === activity.id);
      if (exists) {
        return prev.map((a) => (a.id === activity.id ? activity : a));
      }
      return [activity, ...prev];
    });

    setSelectedMonthKey(`${activity.month}-${activity.year}`);
  };

  // Handlers for Weekly Activities
  const handleOpenAddWeekly = (defaultDate?: string, defaultUnit?: WeeklyUnit) => {
    setEditingWeeklyActivity(null);
    setWeeklyDefaultDate(defaultDate || '2026-09-07');
    setWeeklyDefaultUnit(defaultUnit || 'Tiếng Anh - Xã hội');
    setIsWeeklyModalOpen(true);
  };

  const handleEditWeeklyActivity = (activity: WeeklyActivity) => {
    setEditingWeeklyActivity(activity);
    setIsWeeklyModalOpen(true);
  };

  const handleDeleteWeeklyActivity = (id: string) => {
    setWeeklyActivities((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSaveWeeklyActivity = (activity: WeeklyActivity) => {
    setWeeklyActivities((prev) => {
      const exists = prev.some((a) => a.id === activity.id);
      if (exists) {
        return prev.map((a) => (a.id === activity.id ? activity : a));
      }
      return [activity, ...prev];
    });

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleUpdateWeeklyStatus = (id: string, newStatus: ActivityStatus) => {
    setWeeklyActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
  };

  const handleClearAllWeeklyActivities = () => {
    if (
      confirm(
        'Bạn có chắc chắn muốn xóa tất cả lịch tuần để làm trống hoàn toàn cho các cá nhân, tổ và phòng ban tự cập nhật?'
      )
    ) {
      setWeeklyActivities([]);
      localStorage.removeItem(LOCAL_STORAGE_WEEKLY_KEY);
    }
  };

  // Quick Conflict Resolution: Auto-reschedule activity by N days
  const handleAutoReschedule = (activityId: string, daysOffset: number) => {
    setActivities((prev) =>
      prev.map((act) => {
        if (act.id === activityId) {
          const start = new Date(act.startDate);
          start.setDate(start.getDate() + daysOffset);
          const newStart = start.toISOString().split('T')[0];

          let newEnd = undefined;
          if (act.endDate) {
            const end = new Date(act.endDate);
            end.setDate(end.getDate() + daysOffset);
            newEnd = end.toISOString().split('T')[0];
          }

          const newMonth = start.getMonth() + 1;
          const newYear = start.getFullYear();

          return {
            ...act,
            startDate: newStart,
            endDate: newEnd,
            month: newMonth,
            year: newYear,
            semester: newMonth >= 8 || newMonth === 1 ? 'HK1' : newMonth <= 5 ? 'HK2' : 'Hè',
            notes: `${act.notes || ''} (Đã dời lịch +${daysOffset} ngày để tránh trùng)`.trim(),
          };
        }
        return act;
      })
    );

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  // Quick Conflict Resolution: Change venue
  const handleChangeLocation = (activityId: string, newLocation: string) => {
    setActivities((prev) =>
      prev.map((act) =>
        act.id === activityId
          ? {
              ...act,
              location: newLocation,
              notes: `${act.notes || ''} (Đã đổi địa điểm sang ${newLocation} để tránh trùng)`.trim(),
            }
          : act
      )
    );

    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 },
    });
  };

  // Quick update status for yearly activity (Loading, Done, Cancel)
  const handleUpdateStatus = (activityId: string, newStatus: ActivityStatus) => {
    setActivities((prev) =>
      prev.map((act) =>
        act.id === activityId ? { ...act, status: newStatus } : act
      )
    );
  };

  // Duplicate activity
  const handleDuplicateActivity = (activity: Activity) => {
    const copy: Activity = {
      ...activity,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: `${activity.title} (Bản sao)`,
      status: 'loading',
    };
    setActivities((prev) => [copy, ...prev]);
    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.6 },
    });
  };

  // Save Department Profile info
  const handleSaveDepartmentProfile = (profile: DepartmentProfile) => {
    setDepartmentProfiles((prev) => ({
      ...prev,
      [profile.department]: profile,
    }));
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.5 },
    });
  };

  // Add custom department
  const handleAddNewDepartment = (deptName: string) => {
    setDepartmentProfiles((prev) => ({
      ...prev,
      [deptName]: {
        department: deptName,
        code: deptName.substring(0, 3).toUpperCase(),
        memberCount: 0,
        allocatedBudget: 0,
      },
    }));
  };

  // Reset to original dataset from PDF
  const handleResetData = () => {
    if (
      confirm(
        'Bạn có chắc muốn khôi phục toàn bộ lịch hoạt động về dữ liệu kế hoạch mẫu ban đầu của trường?'
      )
    ) {
      setActivities(INITIAL_ACTIVITIES);
      setWeeklyActivities(INITIAL_WEEKLY_ACTIVITIES);
      setDepartmentProfiles(DEFAULT_DEPARTMENT_PROFILES);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem(LOCAL_STORAGE_WEEKLY_KEY);
      localStorage.removeItem(LOCAL_STORAGE_PROFILES_KEY);
      alert('Đã khôi phục thành công dữ liệu lịch kế hoạch năm học và lịch tuần 2026 - 2027!');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Thời gian',
      'Nội dung công việc',
      'Phụ trách (Tổ/Phòng ban)',
      'Đối tượng tham gia',
      'Địa điểm tổ chức',
      'Dự trù chi phí (VNĐ)',
      'Ghi chú',
      'Phân loại',
      'Trạng thái',
    ];

    const rows = activities.map((a) => [
      `"${a.startDate}${a.endDate ? ` - ${a.endDate}` : ''}"`,
      `"${(a.title || '').replace(/"/g, '""')}"`,
      `"${a.department}"`,
      `"${(a.targetAudience || '').replace(/"/g, '""')}"`,
      `"${(a.location || '').replace(/"/g, '""')}"`,
      a.budget || 0,
      `"${(a.notes || '').replace(/"/g, '""')}"`,
      `"${a.category}"`,
      `"${a.status}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Ke_hoach_nam_hoc_2026_2027_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify({ activities, weeklyActivities }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `Lich_Hoat_Dong_FPT_School_${Date.now()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-900">
      {/* 1. Header & Navigation Bar */}
      <Navbar
        activities={activities}
        conflictIssues={allIssues}
        weeklyCount={weeklyActivities.length}
        activeView={activeView}
        setActiveView={setActiveView}
        onAddNew={() => handleOpenAddNew()}
        onAddNewWeekly={() => handleOpenAddWeekly()}
        onResetData={handleResetData}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
      />

      {/* 2. Filter Bar only shown for Year-level views */}
      {activeView !== 'weekly' && (
        <FilterBar
          selectedMonthKey={selectedMonthKey}
          setSelectedMonthKey={setSelectedMonthKey}
          selectedSemester={selectedSemester}
          setSelectedSemester={setSelectedSemester}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          onlyConflicts={onlyConflicts}
          setOnlyConflicts={setOnlyConflicts}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          totalConflictsCount={allIssues.length}
        />
      )}

      {/* 3. Main Workspace Views */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Sticky Reminder Banner for Upcoming Online Meetings */}
        <WeeklyReminderBanner
          activities={weeklyActivities}
          onOpenActivity={handleEditWeeklyActivity}
        />

        {activeView === 'weekly' && (
          <WeeklyScheduleView
            activities={weeklyActivities}
            onAddWeeklyActivity={handleOpenAddWeekly}
            onEditWeeklyActivity={handleEditWeeklyActivity}
            onDeleteWeeklyActivity={handleDeleteWeeklyActivity}
            onUpdateWeeklyStatus={handleUpdateWeeklyStatus}
            onClearAllWeekly={handleClearAllWeeklyActivities}
          />
        )}

        {activeView === 'calendar' && (
          <MonthCalendarGrid
            currentMonth={currentMonth}
            currentYear={currentYear}
            activities={filteredActivities}
            conflictMap={conflictMap}
            conflictingDates={conflictingDates}
            onMonthChange={(m, y) => setSelectedMonthKey(`${m}-${y}`)}
            onEditActivity={handleEditActivity}
            onDeleteActivity={handleDeleteActivity}
            onAddActivityForDate={(date) => handleOpenAddNew(date)}
            onSelectConflict={() => setActiveView('conflicts')}
          />
        )}

        {activeView === 'table' && (
          <TableView
            activities={filteredActivities}
            conflictMap={conflictMap}
            onEditActivity={handleEditActivity}
            onDeleteActivity={handleDeleteActivity}
            onAddNew={(defaultDate) => handleOpenAddNew(defaultDate)}
            onUpdateStatus={handleUpdateStatus}
            onResolveConflict={() => setActiveView('conflicts')}
          />
        )}

        {activeView === 'department' && (
          <DepartmentMatrixView
            activities={filteredActivities}
            conflictMap={conflictMap}
            selectedMonth={currentMonth}
            selectedYear={currentYear}
            departmentProfiles={departmentProfiles}
            onEditActivity={handleEditActivity}
            onAddNewForDepartment={(dept) => handleOpenAddNew(undefined, dept)}
            onDeleteActivity={handleDeleteActivity}
            onDuplicateActivity={handleDuplicateActivity}
            onUpdateStatus={handleUpdateStatus}
            onSaveDepartmentProfile={handleSaveDepartmentProfile}
            onAddNewDepartment={handleAddNewDepartment}
          />
        )}

        {activeView === 'conflicts' && (
          <ConflictResolutionCenter
            conflictIssues={allIssues}
            activities={activities}
            onEditActivity={handleEditActivity}
            onAutoReschedule={handleAutoReschedule}
            onChangeLocation={handleChangeLocation}
            onRefreshChecks={() => {}}
          />
        )}

        {activeView === 'budget' && (
          <AnalyticsBudgetView
            activities={activities}
            onExportCSV={handleExportCSV}
            onExportJSON={handleExportJSON}
          />
        )}
      </main>

      {/* 4. Yearly Activity Create / Edit Modal */}
      <ActivityModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingActivity(null);
        }}
        onSave={handleSaveActivity}
        initialActivity={editingActivity}
        defaultDate={modalDefaultDate}
        defaultDepartment={modalDefaultDept}
        existingActivities={activities}
      />

      {/* 5. Weekly Activity Create / Edit Modal */}
      <WeeklyActivityModal
        isOpen={isWeeklyModalOpen}
        onClose={() => {
          setIsWeeklyModalOpen(false);
          setEditingWeeklyActivity(null);
        }}
        onSave={handleSaveWeeklyActivity}
        initialActivity={editingWeeklyActivity}
        defaultDate={weeklyDefaultDate}
        defaultUnit={weeklyDefaultUnit}
      />
    </div>
  );
}

