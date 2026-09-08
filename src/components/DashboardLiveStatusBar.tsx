import React from 'react';
import {
  Bell,
  Activity as ActivityIcon,
  CheckCircle2,
  Clock,
  Sparkles,
  User,
  Radio,
  ArrowRight,
  TrendingUp,
  Search,
} from 'lucide-react';
import { UserInteractionNotification, UserProfileIdentity, Activity, WeeklyActivity } from '../types';

interface DashboardLiveStatusBarProps {
  notifications: UserInteractionNotification[];
  activities: Activity[];
  weeklyActivities: WeeklyActivity[];
  currentUser: UserProfileIdentity;
  onOpenNotifications: () => void;
  onOpenIdentityModal: () => void;
  onOpenSearch?: () => void;
}

export const DashboardLiveStatusBar: React.FC<DashboardLiveStatusBarProps> = ({
  notifications,
  activities,
  weeklyActivities,
  currentUser,
  onOpenNotifications,
  onOpenIdentityModal,
  onOpenSearch,
}) => {
  const latestNotification = notifications[0];
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Compute status stats across both yearly and weekly
  const allYearlyDone = activities.filter((a) => a.status === 'done' || a.status === 'completed').length;
  const allWeeklyDone = weeklyActivities.filter((w) => w.status === 'done' || w.status === 'completed').length;
  const totalCompleted = allYearlyDone + allWeeklyDone;

  const allYearlyLoading = activities.filter((a) => a.status === 'loading' || a.status === 'in_progress' || a.status === 'planned').length;
  const allWeeklyLoading = weeklyActivities.filter((w) => w.status === 'loading' || w.status === 'in_progress' || w.status === 'planned').length;
  const totalInProgress = allYearlyLoading + allWeeklyLoading;

  return (
    <div
      id="dashboard-live-status-bar"
      className="bg-white border border-slate-200/90 rounded-2xl shadow-xs p-3 sm:px-4 sm:py-3 mb-5 transition-all"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Live Sync & Latest Interaction Banner */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative flex items-center justify-center shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-sm">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Live Sync Dashboard
              </span>

              <span className="text-xs font-semibold text-slate-500">
                Tự động thông báo & cập nhật dữ liệu tức thì
              </span>
            </div>

            {latestNotification ? (
              <div
                onClick={onOpenNotifications}
                className="text-xs text-slate-800 mt-1 truncate cursor-pointer hover:text-orange-600 transition-colors flex items-center gap-1.5"
                title="Bấm để mở nhật ký chi tiết"
              >
                <span className="font-bold text-slate-900">
                  {latestNotification.userName || 'Người dùng'}
                </span>
                <span className="text-slate-500 truncate">
                  - {latestNotification.title}: {latestNotification.message}
                </span>
                <span className="text-[10px] text-slate-400 shrink-0 font-medium ml-1">
                  ({latestNotification.formattedTime.split(' - ')[0]})
                </span>
              </div>
            ) : (
              <div className="text-xs text-slate-500 mt-1">
                Sẵn sàng ghi nhận và thông báo mọi tương tác thêm mới, sửa, đổi trạng thái và dời lịch.
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Stats & Interactive Actions */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3 border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-100 shrink-0">
          {/* Progress summary */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div className="flex items-center gap-1 text-emerald-700 font-bold" title="Hoạt động đã hoàn thành">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{totalCompleted} Xong</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1 text-amber-700 font-bold" title="Hoạt động đang triển khai / tải">
              <Clock className="w-3.5 h-3.5" />
              <span>{totalInProgress} Đang chạy</span>
            </div>
          </div>

          {/* User identity badge with switch action */}
          <button
            onClick={onOpenIdentityModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            title="Nhấp để đổi danh xưng người cập nhật"
          >
            <User className="w-3.5 h-3.5 text-amber-700" />
            <span className="truncate max-w-[130px]">{currentUser.name}</span>
            <span className="text-[10px] px-1 bg-amber-200 text-amber-950 rounded font-bold">Đổi</span>
          </button>

          {/* Quick Global Search Button */}
          {onOpenSearch && (
            <button
              id="btn-open-search-statusbar"
              onClick={onOpenSearch}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-700 border border-slate-200 hover:border-orange-300 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="Tìm kiếm bất kỳ thông tin nào trên dashboard (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-orange-600" />
              <span>Tìm kiếm</span>
            </button>
          )}

          {/* Open notifications button */}
          <button
            id="btn-open-notifications-bar"
            onClick={onOpenNotifications}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer relative"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Nhật ký</span>
            {unreadCount > 0 ? (
              <span className="px-1.5 py-0.2 text-[10px] font-black bg-white text-orange-700 rounded-full animate-bounce">
                {unreadCount}
              </span>
            ) : (
              <span className="text-[10px] opacity-80">({notifications.length})</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
