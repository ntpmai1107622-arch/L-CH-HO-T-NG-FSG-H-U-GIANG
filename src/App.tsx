import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Activity,
  ActivityStatus,
  ConflictIssue,
  DepartmentProfile,
  Semester,
  WeeklyActivity,
  WeeklyUnit,
  UserInteractionNotification,
  UserProfileIdentity,
  InteractionType,
} from './types';
import { INITIAL_ACTIVITIES, ACADEMIC_YEAR_MONTHS, DEFAULT_DEPARTMENT_PROFILES } from './data/initialData';
import { INITIAL_WEEKLY_ACTIVITIES } from './data/initialWeeklyData';
import { detectScheduleConflicts } from './utils/conflictDetector';
import { playNotificationSound } from './utils/notificationSound';
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
import { ToastNotificationContainer } from './components/ToastNotificationContainer';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { DashboardLiveStatusBar } from './components/DashboardLiveStatusBar';
import { GlobalSearchModal } from './components/GlobalSearchModal';

const LOCAL_STORAGE_KEY = 'fpt_school_calendar_2026_2027_v1';
const LOCAL_STORAGE_WEEKLY_KEY = 'fpt_school_weekly_activities_2026_v2_clean';
const LOCAL_STORAGE_PROFILES_KEY = 'fpt_school_department_profiles_2026_v1';
const LOCAL_STORAGE_NOTIFICATIONS_KEY = 'fpt_school_notifications_2026_v1';
const LOCAL_STORAGE_USER_KEY = 'fpt_school_current_user_2026_v1';
const LOCAL_STORAGE_SOUND_KEY = 'fpt_school_sound_enabled_2026_v1';
const BROADCAST_CHANNEL_NAME = 'fpt_school_live_bus_2026';

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

  // 1.4 Notification & User Interaction State
  const [notifications, setNotifications] = useState<UserInteractionNotification[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_NOTIFICATIONS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading notifications:', e);
    }
    return [
      {
        id: 'init_welcome',
        type: 'remote_sync',
        title: 'Hệ thống Dashboard đồng bộ trực tiếp',
        message: 'Bất kỳ người dùng nào tương tác (thêm, sửa, đổi tiến độ, dời lịch), Dashboard sẽ cập nhật dữ liệu và phát thông báo tức thì.',
        userName: 'Hệ thống FPT School',
        department: 'BGH & Các Tổ',
        timestamp: new Date().toISOString(),
        formattedTime: 'Vừa xong',
        read: true,
        severity: 'success',
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_NOTIFICATIONS_KEY, JSON.stringify(notifications.slice(0, 100)));
    } catch (e) {
      console.error('Error saving notifications:', e);
    }
  }, [notifications]);

  // Current User Identity (who is interacting)
  const [currentUser, setCurrentUser] = useState<UserProfileIdentity>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading user identity:', e);
    }
    return {
      id: 'user_active',
      name: 'Cán bộ / Giáo viên',
      role: 'Thành viên',
      department: 'Tổ Chuyên Môn / Phòng Ban',
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(currentUser));
    } catch (e) {
      console.error('Error saving user identity:', e);
    }
  }, [currentUser]);

  // Sound preference
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SOUND_KEY);
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading sound preference:', e);
    }
    return true;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_SOUND_KEY, JSON.stringify(isSoundEnabled));
    } catch (e) {
      console.error('Error saving sound preference:', e);
    }
  }, [isSoundEnabled]);

  // Live Toast queue & Modals
  const [toasts, setToasts] = useState<UserInteractionNotification[]>([]);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Global keyboard shortcut for Search (Ctrl+K, Cmd+K, or "/" when not typing in input)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      } else if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-dismiss toasts after 4.5 seconds
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(0, prev.length - 1));
    }, 4500);
    return () => clearTimeout(timer);
  }, [toasts]);

  // Broadcast & Cross-tab live synchronization listener
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);

    channel.onmessage = (event) => {
      const data = event.data;
      if (!data) return;

      if (data.type === 'SYNC_ALL') {
        if (data.activities) setActivities(data.activities);
        if (data.weeklyActivities) setWeeklyActivities(data.weeklyActivities);
        if (data.departmentProfiles) setDepartmentProfiles(data.departmentProfiles);
        if (data.notification) {
          setNotifications((prev) => [data.notification, ...prev.slice(0, 99)]);
          setToasts((prev) => [data.notification, ...prev.slice(0, 3)]);
          if (isSoundEnabled) {
            playNotificationSound(data.notification.severity);
          }
        }
      }
    };

    return () => {
      channel.close();
    };
  }, [isSoundEnabled]);

  // Central Notification & Interaction Dispatcher
  const notifyInteraction = useCallback(
    ({
      type,
      title,
      message,
      department,
      targetId,
      targetType = 'yearly',
      severity = 'info',
      updatedActivities,
      updatedWeekly,
      updatedProfiles,
    }: {
      type: InteractionType;
      title: string;
      message: string;
      department?: string;
      targetId?: string;
      targetType?: 'yearly' | 'weekly' | 'department' | 'system';
      severity?: 'info' | 'success' | 'warning' | 'error';
      updatedActivities?: Activity[];
      updatedWeekly?: WeeklyActivity[];
      updatedProfiles?: Record<string, DepartmentProfile>;
    }) => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} - ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

      const notif: UserInteractionNotification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type,
        title,
        message,
        userName: currentUser.name,
        userRole: currentUser.role,
        department: department || currentUser.department,
        targetId,
        targetType,
        timestamp: now.toISOString(),
        formattedTime: timeStr,
        read: false,
        severity,
      };

      // Update local state
      setNotifications((prev) => [notif, ...prev.slice(0, 99)]);
      setToasts((prev) => [notif, ...prev.slice(0, 3)]);

      // Play audio cue
      if (isSoundEnabled) {
        playNotificationSound(severity);
      }

      // Broadcast to other tabs & windows
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        try {
          const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
          channel.postMessage({
            type: 'SYNC_ALL',
            notification: notif,
            activities: updatedActivities,
            weeklyActivities: updatedWeekly,
            departmentProfiles: updatedProfiles,
          });
          channel.close();
        } catch (e) {
          console.error('Broadcast error:', e);
        }
      }
    },
    [currentUser, isSoundEnabled]
  );


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
    const target = activities.find((a) => a.id === id);
    const newActs = activities.filter((a) => a.id !== id);
    setActivities(newActs);

    notifyInteraction({
      type: 'delete_activity',
      title: 'Xóa hoạt động kế hoạch năm',
      message: `${currentUser.name} đã xóa hoạt động "${target?.title || id}" (${target?.department || 'Chung'})`,
      department: target?.department,
      targetId: id,
      targetType: 'yearly',
      severity: 'error',
      updatedActivities: newActs,
    });
  };

  const handleSaveActivity = (activity: Activity) => {
    const exists = activities.some((a) => a.id === activity.id);
    const newActs = exists
      ? activities.map((a) => (a.id === activity.id ? activity : a))
      : [activity, ...activities];

    setActivities(newActs);
    setSelectedMonthKey(`${activity.month}-${activity.year}`);

    notifyInteraction({
      type: exists ? 'update_activity' : 'create_activity',
      title: exists ? 'Cập nhật hoạt động năm' : 'Thêm hoạt động năm mới',
      message: exists
        ? `${currentUser.name} đã cập nhật "${activity.title}" (${activity.department})`
        : `${currentUser.name} đã thêm hoạt động "${activity.title}" (${activity.department}) vào ngày ${activity.startDate}`,
      department: activity.department,
      targetId: activity.id,
      targetType: 'yearly',
      severity: exists ? 'info' : 'success',
      updatedActivities: newActs,
    });
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
    const target = weeklyActivities.find((a) => a.id === id);
    const newWeekly = weeklyActivities.filter((a) => a.id !== id);
    setWeeklyActivities(newWeekly);

    notifyInteraction({
      type: 'delete_weekly',
      title: 'Xóa công việc lịch tuần',
      message: `${currentUser.name} đã xóa công việc "${target?.title || id}" khỏi lịch tuần ${target?.unit || ''}`,
      department: target?.unit,
      targetId: id,
      targetType: 'weekly',
      severity: 'error',
      updatedWeekly: newWeekly,
    });
  };

  const handleSaveWeeklyActivity = (activity: WeeklyActivity) => {
    const exists = weeklyActivities.some((a) => a.id === activity.id);
    const newWeekly = exists
      ? weeklyActivities.map((a) => (a.id === activity.id ? activity : a))
      : [activity, ...weeklyActivities];

    setWeeklyActivities(newWeekly);

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
    });

    notifyInteraction({
      type: exists ? 'update_weekly' : 'create_weekly',
      title: exists ? 'Cập nhật công việc lịch tuần' : 'Thêm công việc tuần mới',
      message: exists
        ? `${currentUser.name} đã cập nhật công việc "${activity.title}" của ${activity.unit} (${activity.date})`
        : `${currentUser.name} đã thêm công việc "${activity.title}" cho ${activity.unit} vào ${activity.dayOfWeek} (${activity.date})`,
      department: activity.unit,
      targetId: activity.id,
      targetType: 'weekly',
      severity: exists ? 'info' : 'success',
      updatedWeekly: newWeekly,
    });
  };

  const handleUpdateWeeklyStatus = (id: string, newStatus: ActivityStatus) => {
    const target = weeklyActivities.find((a) => a.id === id);
    const newWeekly = weeklyActivities.map((a) =>
      a.id === id ? { ...a, status: newStatus } : a
    );
    setWeeklyActivities(newWeekly);

    const statusName =
      newStatus === 'done' || newStatus === 'completed'
        ? '✅ Hoàn thành'
        : newStatus === 'cancel' || newStatus === 'cancelled'
        ? '🚫 Hủy việc'
        : '⏳ Đang thực hiện';

    notifyInteraction({
      type: 'status_weekly',
      title: 'Cập nhật tiến độ lịch tuần',
      message: `${currentUser.name} đã cập nhật trạng thái công việc "${target?.title || id}" (${target?.unit || ''}) sang ${statusName}`,
      department: target?.unit,
      targetId: id,
      targetType: 'weekly',
      severity: newStatus === 'done' || newStatus === 'completed' ? 'success' : newStatus === 'cancel' || newStatus === 'cancelled' ? 'warning' : 'info',
      updatedWeekly: newWeekly,
    });
  };

  const handleClearAllWeeklyActivities = () => {
    if (
      confirm(
        'Bạn có chắc chắn muốn xóa tất cả lịch tuần để làm trống hoàn toàn cho các cá nhân, tổ và phòng ban tự cập nhật?'
      )
    ) {
      setWeeklyActivities([]);
      localStorage.removeItem(LOCAL_STORAGE_WEEKLY_KEY);

      notifyInteraction({
        type: 'clear_weekly',
        title: 'Làm trống toàn bộ lịch tuần',
        message: `${currentUser.name} đã xóa trắng toàn bộ lịch tuần các tổ/phòng ban để nhập dữ liệu mới`,
        targetType: 'weekly',
        severity: 'error',
        updatedWeekly: [],
      });
    }
  };

  // Quick Conflict Resolution: Auto-reschedule activity by N days
  const handleAutoReschedule = (activityId: string, daysOffset: number) => {
    const target = activities.find((a) => a.id === activityId);
    const newActs = activities.map((act) => {
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
    });

    setActivities(newActs);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });

    notifyInteraction({
      type: 'resolve_conflict',
      title: 'Dời lịch xử lý trùng kế hoạch',
      message: `${currentUser.name} đã dời lịch hoạt động "${target?.title || activityId}" +${daysOffset} ngày để tránh trùng lịch`,
      department: target?.department,
      targetId: activityId,
      targetType: 'yearly',
      severity: 'warning',
      updatedActivities: newActs,
    });
  };

  // Quick Conflict Resolution: Change venue
  const handleChangeLocation = (activityId: string, newLocation: string) => {
    const target = activities.find((a) => a.id === activityId);
    const newActs = activities.map((act) =>
      act.id === activityId
        ? {
            ...act,
            location: newLocation,
            notes: `${act.notes || ''} (Đã đổi địa điểm sang ${newLocation} để tránh trùng)`.trim(),
          }
        : act
    );

    setActivities(newActs);

    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 },
    });

    notifyInteraction({
      type: 'resolve_conflict',
      title: 'Đổi địa điểm xử lý trùng kế hoạch',
      message: `${currentUser.name} đã đổi địa điểm "${target?.title || activityId}" sang "${newLocation}"`,
      department: target?.department,
      targetId: activityId,
      targetType: 'yearly',
      severity: 'warning',
      updatedActivities: newActs,
    });
  };

  // Quick update status for yearly activity (Loading, Done, Cancel)
  const handleUpdateStatus = (activityId: string, newStatus: ActivityStatus) => {
    const target = activities.find((a) => a.id === activityId);
    const newActs = activities.map((act) =>
      act.id === activityId ? { ...act, status: newStatus } : act
    );
    setActivities(newActs);

    const statusName =
      newStatus === 'done' || newStatus === 'completed'
        ? '✅ Hoàn thành (Done)'
        : newStatus === 'cancel' || newStatus === 'cancelled'
        ? '🚫 Đã hủy (Cancel)'
        : '⏳ Đang triển khai (Loading)';

    notifyInteraction({
      type: 'status_activity',
      title: 'Cập nhật tiến độ kế hoạch năm',
      message: `${currentUser.name} đã chuyển trạng thái hoạt động "${target?.title || activityId}" sang ${statusName}`,
      department: target?.department,
      targetId: activityId,
      targetType: 'yearly',
      severity: newStatus === 'done' || newStatus === 'completed' ? 'success' : newStatus === 'cancel' || newStatus === 'cancelled' ? 'warning' : 'info',
      updatedActivities: newActs,
    });
  };

  // Duplicate activity
  const handleDuplicateActivity = (activity: Activity) => {
    const copy: Activity = {
      ...activity,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: `${activity.title} (Bản sao)`,
      status: 'loading',
    };
    const newActs = [copy, ...activities];
    setActivities(newActs);

    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.6 },
    });

    notifyInteraction({
      type: 'duplicate_activity',
      title: 'Nhân bản hoạt động kế hoạch',
      message: `${currentUser.name} đã nhân bản hoạt động "${activity.title}" (${activity.department})`,
      department: activity.department,
      targetId: copy.id,
      targetType: 'yearly',
      severity: 'success',
      updatedActivities: newActs,
    });
  };

  // Save Department Profile info
  const handleSaveDepartmentProfile = (profile: DepartmentProfile) => {
    const newProfiles = {
      ...departmentProfiles,
      [profile.department]: profile,
    };
    setDepartmentProfiles(newProfiles);

    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.5 },
    });

    notifyInteraction({
      type: 'update_department',
      title: 'Cập nhật hồ sơ tổ / phòng ban',
      message: `${currentUser.name} đã cập nhật hồ sơ thông tin mục tiêu và nhân sự cho "${profile.department}"`,
      department: profile.department,
      targetType: 'department',
      severity: 'success',
      updatedProfiles: newProfiles,
    });
  };

  // Add custom department
  const handleAddNewDepartment = (deptName: string) => {
    const newProfiles = {
      ...departmentProfiles,
      [deptName]: {
        department: deptName,
        code: deptName.substring(0, 3).toUpperCase(),
        memberCount: 0,
        allocatedBudget: 0,
      },
    };
    setDepartmentProfiles(newProfiles);

    notifyInteraction({
      type: 'update_department',
      title: 'Thêm tổ / phòng ban mới',
      message: `${currentUser.name} đã thêm tổ/phòng ban mới: "${deptName}" vào hệ thống`,
      department: deptName,
      targetType: 'department',
      severity: 'success',
      updatedProfiles: newProfiles,
    });
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

      notifyInteraction({
        type: 'restore_data',
        title: 'Khôi phục dữ liệu gốc',
        message: `${currentUser.name} đã khôi phục toàn bộ dữ liệu lịch kế hoạch năm và lịch tuần theo mẫu ban đầu của nhà trường`,
        targetType: 'system',
        severity: 'warning',
        updatedActivities: INITIAL_ACTIVITIES,
        updatedWeekly: INITIAL_WEEKLY_ACTIVITIES,
        updatedProfiles: DEFAULT_DEPARTMENT_PROFILES,
      });

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

    notifyInteraction({
      type: 'export_data',
      title: 'Xuất dữ liệu kế hoạch Excel/CSV',
      message: `${currentUser.name} đã xuất bảng kế hoạch hoạt động năm học ra tệp CSV`,
      targetType: 'system',
      severity: 'info',
    });
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

    notifyInteraction({
      type: 'export_data',
      title: 'Sao lưu dữ liệu JSON',
      message: `${currentUser.name} đã xuất tệp dữ liệu sao lưu JSON`,
      targetType: 'system',
      severity: 'info',
    });
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-900">
      {/* 1. Header & Navigation Bar */}
      <Navbar
        activities={activities}
        conflictIssues={allIssues}
        weeklyCount={weeklyActivities.length}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => setIsNotificationCenterOpen(true)}
        onOpenSearch={() => setIsSearchModalOpen(true)}
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
        {/* LIVE DASHBOARD STATUS BAR: Tự động cập nhật thông tin & thông báo khi bất kỳ ai tương tác */}
        <DashboardLiveStatusBar
          notifications={notifications}
          activities={activities}
          weeklyActivities={weeklyActivities}
          currentUser={currentUser}
          onOpenNotifications={() => setIsNotificationCenterOpen(true)}
          onOpenIdentityModal={() => setIsNotificationCenterOpen(true)}
          onOpenSearch={() => setIsSearchModalOpen(true)}
        />

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

      {/* 6. Live Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
        onClearAll={() => {
          setNotifications([]);
          localStorage.removeItem(LOCAL_STORAGE_NOTIFICATIONS_KEY);
        }}
        onMarkAsRead={(id) => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
          );
        }}
        currentUser={currentUser}
        onUpdateCurrentUser={setCurrentUser}
        isSoundEnabled={isSoundEnabled}
        onToggleSound={() => setIsSoundEnabled(!isSoundEnabled)}
      />

      {/* 7. Live Floating Toast Notifications */}
      <ToastNotificationContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
        onOpenCenter={() => setIsNotificationCenterOpen(true)}
      />

      {/* 8. Global Omnibox Search Modal (Tìm kiếm bất kỳ thông tin nào trên dashboard) */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        activities={activities}
        weeklyActivities={weeklyActivities}
        departmentProfiles={departmentProfiles}
        notifications={notifications}
        onSelectYearlyActivity={(act) => {
          setSelectedMonthKey(`${act.month}-${act.year}`);
          handleEditActivity(act);
        }}
        onSelectWeeklyActivity={(w) => {
          setActiveView('weekly');
          handleEditWeeklyActivity(w);
        }}
        onSelectDepartment={(deptName) => {
          setActiveView('department');
          setSelectedDepartment(deptName);
        }}
        onNavigateView={(view) => setActiveView(view)}
        onOpenNotifications={() => setIsNotificationCenterOpen(true)}
        onOpenAddNewYearly={() => handleOpenAddNew()}
        onOpenAddNewWeekly={() => handleOpenAddWeekly()}
        onExportCSV={handleExportCSV}
      />
    </div>
  );
}

