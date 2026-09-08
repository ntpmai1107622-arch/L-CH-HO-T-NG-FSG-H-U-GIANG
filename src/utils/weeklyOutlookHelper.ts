import { WeeklyActivity, WeeklyUnit, AcademicUnit, AdminUnit } from '../types';

export interface UnitConfig {
  name: WeeklyUnit;
  type: 'academic' | 'admin';
  code: string;
  badgeColor: string;
  bgLight: string;
  borderColor: string;
  textColor: string;
  dotColor: string;
  iconName: string;
  description: string;
}

export const ACADEMIC_UNITS_LIST: AcademicUnit[] = [
  'Tiếng Anh - Xã hội',
  'KHTN',
  'PDP',
  'Tiểu học',
];

export const ADMIN_UNITS_LIST: AdminUnit[] = [
  'Văn phòng (VP)',
  'Đào tạo',
  'Công tác học sinh (CTHS)',
  'Tuyển sinh (TS)',
];

export const ALL_WEEKLY_UNITS: WeeklyUnit[] = [
  ...ACADEMIC_UNITS_LIST,
  ...ADMIN_UNITS_LIST,
];

export const UNIT_CONFIG_MAP: Record<string, UnitConfig> = {
  'Tiếng Anh - Xã hội': {
    name: 'Tiếng Anh - Xã hội',
    type: 'academic',
    code: 'TA-XH',
    badgeColor: 'bg-sky-600 text-white',
    bgLight: 'bg-sky-50',
    borderColor: 'border-sky-200',
    textColor: 'text-sky-800',
    dotColor: 'bg-sky-500',
    iconName: 'Languages',
    description: 'Tổ Chuyên môn Tiếng Anh & Khoa học Xã hội',
  },
  'KHTN': {
    name: 'KHTN',
    type: 'academic',
    code: 'KHTN',
    badgeColor: 'bg-teal-600 text-white',
    bgLight: 'bg-teal-50',
    borderColor: 'border-teal-200',
    textColor: 'text-teal-800',
    dotColor: 'bg-teal-500',
    iconName: 'Atom',
    description: 'Tổ Chuyên môn Khoa học Tự nhiên (Toán, Lý, Hóa, Sinh, Tin)',
  },
  'PDP': {
    name: 'PDP',
    type: 'academic',
    code: 'PDP',
    badgeColor: 'bg-purple-600 text-white',
    bgLight: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800',
    dotColor: 'bg-purple-500',
    iconName: 'Sparkles',
    description: 'Bộ phận Phát triển cá nhân (Kỹ năng, Hoạt động trải nghiệm)',
  },
  'Tiểu học': {
    name: 'Tiểu học',
    type: 'academic',
    code: 'TH',
    badgeColor: 'bg-pink-600 text-white',
    bgLight: 'bg-pink-50',
    borderColor: 'border-pink-200',
    textColor: 'text-pink-800',
    dotColor: 'bg-pink-500',
    iconName: 'GraduationCap',
    description: 'Khối Tiểu học FPT School',
  },
  'Văn phòng (VP)': {
    name: 'Văn phòng (VP)',
    type: 'admin',
    code: 'VP',
    badgeColor: 'bg-slate-700 text-white',
    bgLight: 'bg-slate-50',
    borderColor: 'border-slate-300',
    textColor: 'text-slate-800',
    dotColor: 'bg-slate-600',
    iconName: 'Building',
    description: 'Văn phòng & Hành chính quản trị',
  },
  'Đào tạo': {
    name: 'Đào tạo',
    type: 'admin',
    code: 'ĐT',
    badgeColor: 'bg-indigo-600 text-white',
    bgLight: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-800',
    dotColor: 'bg-indigo-500',
    iconName: 'BookOpen',
    description: 'Phòng Quản lý Đào tạo & Khảo thí',
  },
  'Công tác học sinh (CTHS)': {
    name: 'Công tác học sinh (CTHS)',
    type: 'admin',
    code: 'CTHS',
    badgeColor: 'bg-emerald-600 text-white',
    bgLight: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-800',
    dotColor: 'bg-emerald-500',
    iconName: 'Users',
    description: 'Phòng Công tác học sinh, Quản nhiệm & CLB',
  },
  'Tuyển sinh (TS)': {
    name: 'Tuyển sinh (TS)',
    type: 'admin',
    code: 'TS',
    badgeColor: 'bg-amber-600 text-white',
    bgLight: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-900',
    dotColor: 'bg-amber-500',
    iconName: 'PhoneCall',
    description: 'Phòng Tuyển sinh & Truyền thông',
  },
};

export const getUnitConfig = (unitName: string): UnitConfig => {
  if (UNIT_CONFIG_MAP[unitName]) {
    return UNIT_CONFIG_MAP[unitName];
  }
  return {
    name: unitName,
    type: 'admin',
    code: 'KHÁC',
    badgeColor: 'bg-slate-600 text-white',
    bgLight: 'bg-slate-50',
    borderColor: 'border-slate-200',
    textColor: 'text-slate-700',
    dotColor: 'bg-slate-500',
    iconName: 'Folder',
    description: 'Đơn vị khác',
  };
};

// ==========================================
// GOOGLE MEET GENERATOR & VALIDATOR
// ==========================================

export const generateGoogleMeetUrl = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const getRandomString = (len: number) => {
    let s = '';
    for (let i = 0; i < len; i++) {
      s += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return s;
  };
  const code = `${getRandomString(3)}-${getRandomString(4)}-${getRandomString(3)}`;
  return `https://meet.google.com/${code}`;
};

// ==========================================
// OUTLOOK INTEGRATION & 30-MINUTE REMINDERS
// ==========================================

/**
 * Creates an Outlook Web Calendar Deep Link URL with subject, body, time and meet link
 */
export const getOutlookCalendarUrl = (
  activity: WeeklyActivity,
  serviceType: 'office365' | 'live' = 'office365'
): string => {
  const baseUrl =
    serviceType === 'office365'
      ? 'https://outlook.office.com/calendar/0/deeplink/compose'
      : 'https://outlook.live.com/calendar/0/deeplink/compose';

  // Construct ISO start & end strings
  const startTimeFormatted = activity.startTime ? `${activity.startTime}:00` : '08:00:00';
  const endTimeFormatted = activity.endTime ? `${activity.endTime}:00` : '09:30:00';

  const startIso = `${activity.date}T${startTimeFormatted}`;
  const endIso = `${activity.date}T${endTimeFormatted}`;

  const locationText = activity.isOnline
    ? `Trực tuyến: ${activity.meetUrl || 'Google Meet'}`
    : activity.location || 'FPT School Hậu Giang';

  let bodyText = `LỊCH HOẠT ĐỘNG TUẦN - FPT SCHOOL HẬU GIANG\n\n`;
  bodyText += `• Đơn vị: ${activity.unit} (${activity.unitType === 'academic' ? 'Tổ chuyên môn' : 'Phòng ban'})\n`;
  bodyText += `• Người chủ trì: ${activity.host || 'Chưa cập nhật'}\n`;
  bodyText += `• Thành phần tham dự: ${activity.participants || 'Toàn thể giáo viên / nhân viên liên quan'}\n`;
  if (activity.isOnline && activity.meetUrl) {
    bodyText += `• LINK HỌP TRỰC TUYẾN GOOGLE MEET: ${activity.meetUrl}\n`;
    bodyText += `• LƯU Ý: Vui lòng vào phòng họp trước 5 phút. Thông báo nhắc nhở tự động đã được cài đặt trước 30 phút!\n`;
  }
  if (activity.contentNotes) {
    bodyText += `\nNỘI DUNG CÔNG VIỆC:\n${activity.contentNotes}\n`;
  }

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: `[${activity.unit}] ${activity.title}`,
    startdt: startIso,
    enddt: endIso,
    location: locationText,
    body: bodyText,
    allday: 'false',
  });

  return `${baseUrl}?${params.toString()}`;
};

/**
 * Generates and downloads a standard .ics (iCalendar) file with VALARM 30-min reminder
 * Compatible with Outlook Desktop, Outlook for Mac, iOS/Android Calendar, Teams, and Google Calendar.
 */
export const downloadICSFile = (activities: WeeklyActivity | WeeklyActivity[]): void => {
  const acts = Array.isArray(activities) ? activities : [activities];
  if (acts.length === 0) return;

  const formatDateToICS = (dateStr: string, timeStr: string) => {
    // converts "2026-09-08" and "08:30" to "20260908T083000"
    const cleanDate = dateStr.replace(/-/g, '');
    const cleanTime = (timeStr || '08:00').replace(/:/g, '') + '00';
    return `${cleanDate}T${cleanTime}`;
  };

  const escapeICS = (text: string) => {
    return (text || '')
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FPT School Hau Giang//Weekly Schedule Calendar//VI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Lịch Hoạt Động Tuần FPT School',
    'X-WR-TIMEZONE:Asia/Ho_Chi_Minh',
  ];

  acts.forEach((act) => {
    const dtStart = formatDateToICS(act.date, act.startTime || '08:00');
    const dtEnd = formatDateToICS(act.date, act.endTime || '09:30');
    const nowStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const location = act.isOnline
      ? `Trực tuyến: ${act.meetUrl || 'Google Meet'}`
      : act.location || 'FPT School Hậu Giang';

    let description = `Đơn vị: ${act.unit}\\n`;
    description += `Chủ trì: ${act.host || 'N/A'}\\n`;
    description += `Thành phần: ${act.participants || 'N/A'}\\n`;
    if (act.isOnline && act.meetUrl) {
      description += `Link Google Meet: ${act.meetUrl}\\n`;
    }
    if (act.contentNotes) {
      description += `Nội dung: ${escapeICS(act.contentNotes)}\\n`;
    }

    icsContent.push(
      'BEGIN:VEVENT',
      `UID:weekly-${act.id}-${dtStart}@fptschool.edu.vn`,
      `DTSTAMP:${nowStamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${escapeICS(`[${act.unit}] ${act.title}`)}`,
      `LOCATION:${escapeICS(location)}`,
      `DESCRIPTION:${description}`,
      'STATUS:CONFIRMED',
      // VALARM: 30 minutes before notification
      'BEGIN:VALARM',
      'TRIGGER:-PT30M',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeICS(`Nhắc nhở họp trước 30 phút: [${act.unit}] ${act.title}`)}`,
      'END:VALARM',
      'END:VEVENT'
    );
  });

  icsContent.push('END:VCALENDAR');

  const blob = new Blob([icsContent.join('\r\n')], {
    type: 'text/calendar;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName =
    acts.length === 1
      ? `Lich_Outlook_${acts[0].unit.replace(/\s+/g, '_')}_${acts[0].date}.ics`
      : `Lich_Hoat_Dong_Tuan_Outlook_${Date.now()}.ics`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ==========================================
// WEEK DATE UTILITIES
// ==========================================

export interface WeekDayInfo {
  dayName: string; // 'Thứ Hai', 'Thứ Ba', ...
  shortName: string; // 'T2', 'T3', ...
  dateStr: string; // '2026-09-07'
  dayNumber: number; // 7
  monthNumber: number; // 9
  isToday: boolean;
}

export const getDaysOfWeek = (currentDateStr: string): WeekDayInfo[] => {
  const curr = new Date(currentDateStr);
  if (isNaN(curr.getTime())) {
    return getDaysOfWeek('2026-09-07');
  }

  // Get Monday of the current week (Monday is 1, Sunday is 0)
  const day = curr.getDay();
  const diffToMonday = curr.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(curr.setDate(diffToMonday));

  const dayNames = [
    'Thứ Hai',
    'Thứ Ba',
    'Thứ Tư',
    'Thứ Năm',
    'Thứ Sáu',
    'Thứ Bảy',
    'Chủ Nhật',
  ];
  const shortNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  const todayStr = new Date().toISOString().split('T')[0];

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    return {
      dayName: dayNames[i],
      shortName: shortNames[i],
      dateStr,
      dayNumber: d.getDate(),
      monthNumber: d.getMonth() + 1,
      isToday: dateStr === todayStr,
    };
  });
};

export const getWeekRangeLabel = (dateStr: string): { label: string; start: string; end: string } => {
  const days = getDaysOfWeek(dateStr);
  const startDay = days[0];
  const endDay = days[6];
  return {
    label: `Từ ${startDay.dayNumber}/${startDay.monthNumber} đến ${endDay.dayNumber}/${endDay.monthNumber}/${endDay.dateStr.split('-')[0]}`,
    start: startDay.dateStr,
    end: endDay.dateStr,
  };
};

export const getAcademicWeekNumber = (dateStr: string): number => {
  // Academic year start: 2026-08-17 (Tuần 1 bắt đầu năm học)
  const schoolStart = new Date('2026-08-17');
  const targetDate = new Date(dateStr);
  const diffTime = targetDate.getTime() - schoolStart.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const weekNum = Math.floor(diffDays / 7) + 1;
  return weekNum > 0 ? weekNum : 1;
};
