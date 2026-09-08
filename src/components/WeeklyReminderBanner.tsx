import React, { useState, useEffect } from 'react';
import {
  Bell,
  Video,
  ExternalLink,
  X,
  Clock,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { WeeklyActivity } from '../types';
import { getUnitConfig } from '../utils/weeklyOutlookHelper';
import { normalizeStatus } from '../data/initialData';

interface WeeklyReminderBannerProps {
  activities: WeeklyActivity[];
  onOpenActivity: (activity: WeeklyActivity) => void;
}

export const WeeklyReminderBanner: React.FC<WeeklyReminderBannerProps> = ({
  activities,
  onOpenActivity,
}) => {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  // Check browser notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationEnabled(true);
    }
  }, []);

  const requestBrowserNotification = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setNotificationEnabled(true);
        new Notification('FPT School Hậu Giang', {
          body: 'Đã bật thành công thông báo nhắc nhở họp trực tuyến trước 30 phút!',
          icon: '/favicon.ico',
        });
      }
    }
  };

  // Find upcoming online meetings for current day or near future
  const todayStr = '2026-09-07'; // Match current demo date
  const upcomingOnlineActs = activities.filter((a) => {
    if (!a.isOnline || !a.meetUrl) return false;
    if (normalizeStatus(a.status) === 'cancel') return false;
    if (dismissedIds.includes(a.id)) return false;
    return a.date === todayStr || a.date === '2026-09-08';
  });

  if (upcomingOnlineActs.length === 0) return null;

  const nextMeeting = upcomingOnlineActs[0];
  const unitConfig = getUnitConfig(nextMeeting.unit);

  return (
    <div
      id="weekly-reminder-banner"
      className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-3.5 sm:p-4 shadow-lg border border-indigo-700/50 mb-5 animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-400 text-indigo-950 font-black shrink-0 relative">
            <Bell className="w-5 h-5 animate-bounce" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-indigo-950"></span>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30">
                Nhắc nhở họp trước 30 phút • Outlook Synced
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded ${unitConfig.badgeColor}`}>
                {nextMeeting.unit}
              </span>
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {nextMeeting.dayOfWeek} ({nextMeeting.date.split('-')[2]}/{nextMeeting.date.split('-')[1]}) lúc {nextMeeting.startTime}
              </span>
            </div>

            <h3 className="text-sm font-black text-white leading-snug">
              {nextMeeting.title}
            </h3>

            {nextMeeting.host && (
              <p className="text-xs text-slate-300">
                Chủ trì: <span className="text-amber-200 font-bold">{nextMeeting.host}</span>
                {nextMeeting.participants && <span> • Tham gia: {nextMeeting.participants}</span>}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <a
            href={nextMeeting.meetUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-indigo-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-md shadow-amber-400/20"
          >
            <Video className="w-4 h-4" />
            <span>Vào Google Meet</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {!notificationEnabled && 'Notification' in window && (
            <button
              onClick={requestBrowserNotification}
              className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors hidden md:flex items-center gap-1"
              title="Bật chuông thông báo trình duyệt"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Bật chuông báo</span>
            </button>
          )}

          <button
            onClick={() => setDismissedIds((prev) => [...prev, nextMeeting.id])}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Đóng thông báo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
