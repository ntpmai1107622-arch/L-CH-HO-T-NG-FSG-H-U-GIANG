import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Video,
  MapPin,
  User,
  Users,
  FileText,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Building,
  GraduationCap,
  Bell,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  WeeklyActivity,
  WeeklyUnit,
  WeeklyUnitType,
  ActivityStatus,
} from '../types';
import {
  ACADEMIC_UNITS_LIST,
  ADMIN_UNITS_LIST,
  getUnitConfig,
  generateGoogleMeetUrl,
} from '../utils/weeklyOutlookHelper';
import { normalizeStatus } from '../data/initialData';

interface WeeklyActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: WeeklyActivity) => void;
  initialActivity: WeeklyActivity | null;
  defaultDate?: string;
  defaultUnit?: WeeklyUnit;
}

export const WeeklyActivityModal: React.FC<WeeklyActivityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialActivity,
  defaultDate,
  defaultUnit,
}) => {
  const [title, setTitle] = useState('');
  const [unitType, setUnitType] = useState<WeeklyUnitType>('academic');
  const [unit, setUnit] = useState<WeeklyUnit>('Tiếng Anh - Xã hội');
  const [date, setDate] = useState(defaultDate || '2026-09-07');
  const [startTime, setStartTime] = useState('08:30');
  const [endTime, setEndTime] = useState('10:00');
  const [isOnline, setIsOnline] = useState(false);
  const [meetUrl, setMeetUrl] = useState('');
  const [location, setLocation] = useState('');
  const [host, setHost] = useState('');
  const [participants, setParticipants] = useState('');
  const [contentNotes, setContentNotes] = useState('');
  const [status, setStatus] = useState<ActivityStatus>('loading');
  const [reminderMinutes, setReminderMinutes] = useState(30);
  const [copiedMeet, setCopiedMeet] = useState(false);

  // Compute day of week in Vietnamese
  const getDayOfWeekName = (dateString: string) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Thứ Hai';
    const day = d.getDay();
    const map = [
      'Chủ Nhật',
      'Thứ Hai',
      'Thứ Ba',
      'Thứ Tư',
      'Thứ Năm',
      'Thứ Sáu',
      'Thứ Bảy',
    ];
    return map[day];
  };

  useEffect(() => {
    if (initialActivity) {
      setTitle(initialActivity.title || '');
      setUnitType(initialActivity.unitType || 'academic');
      setUnit(initialActivity.unit || 'Tiếng Anh - Xã hội');
      setDate(initialActivity.date || '2026-09-07');
      setStartTime(initialActivity.startTime || '08:30');
      setEndTime(initialActivity.endTime || '10:00');
      setIsOnline(!!initialActivity.isOnline);
      setMeetUrl(initialActivity.meetUrl || '');
      setLocation(initialActivity.location || '');
      setHost(initialActivity.host || '');
      setParticipants(initialActivity.participants || '');
      setContentNotes(initialActivity.contentNotes || '');
      setStatus(normalizeStatus(initialActivity.status));
      setReminderMinutes(initialActivity.reminderMinutes || 30);
    } else {
      setTitle('');
      const initialU = defaultUnit || 'Tiếng Anh - Xã hội';
      const isAcad = ACADEMIC_UNITS_LIST.includes(initialU as any);
      setUnitType(isAcad ? 'academic' : 'admin');
      setUnit(initialU);
      setDate(defaultDate || '2026-09-07');
      setStartTime('08:30');
      setEndTime('10:00');
      setIsOnline(false);
      setMeetUrl('');
      setLocation('FSC Hậu Giang');
      setHost('');
      setParticipants('');
      setContentNotes('');
      setStatus('loading');
      setReminderMinutes(30);
    }
  }, [initialActivity, defaultDate, defaultUnit, isOpen]);

  // When toggling online, auto-generate a meet link if empty
  const handleToggleOnline = (online: boolean) => {
    setIsOnline(online);
    if (online && !meetUrl) {
      const generated = generateGoogleMeetUrl();
      setMeetUrl(generated);
      if (!location || location === 'FSC Hậu Giang') {
        setLocation('Online Google Meet');
      }
    } else if (!online && location === 'Online Google Meet') {
      setLocation('Phòng họp 1');
    }
  };

  const handleGenerateNewMeetUrl = () => {
    const generated = generateGoogleMeetUrl();
    setMeetUrl(generated);
  };

  const handleCopyMeetUrl = () => {
    if (!meetUrl) return;
    navigator.clipboard.writeText(meetUrl);
    setCopiedMeet(true);
    setTimeout(() => setCopiedMeet(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tên nội dung hoạt động / cuộc họp!');
      return;
    }

    const dayName = getDayOfWeekName(date);

    const newAct: WeeklyActivity = {
      id: initialActivity?.id || `w-act-${Date.now()}`,
      title: title.trim(),
      unitType,
      unit,
      date,
      dayOfWeek: dayName,
      startTime: startTime || '08:00',
      endTime: endTime || '09:30',
      isOnline,
      meetUrl: isOnline ? meetUrl.trim() : undefined,
      location: location.trim() || (isOnline ? 'Online Google Meet' : 'FSC Hậu Giang'),
      host: host.trim() || undefined,
      participants: participants.trim() || undefined,
      contentNotes: contentNotes.trim() || undefined,
      status: normalizeStatus(status),
      reminderMinutes: reminderMinutes || 30,
      updatedAt: new Date().toISOString(),
      createdAt: initialActivity?.createdAt || new Date().toISOString(),
    };

    onSave(newAct);
    onClose();
  };

  if (!isOpen) return null;

  const currentUnitConfig = getUnitConfig(unit);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6 transition-all animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 font-bold border border-white/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                {initialActivity ? 'Chỉnh sửa hoạt động tuần' : 'Thêm hoạt động tuần mới'}
              </span>
              <h2 className="text-base sm:text-lg font-black leading-tight">
                LỊCH CÔNG TÁC TỔ CHUYÊN MÔN & PHÒNG BAN
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Unit Selection: Tổ Chuyên Môn vs Phòng Ban */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
              Đơn vị phụ trách (Tổ chuyên môn / Phòng ban) <span className="text-rose-500">*</span>
            </label>

            {/* Type selector tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setUnitType('academic');
                  if (!ACADEMIC_UNITS_LIST.includes(unit as any)) {
                    setUnit(ACADEMIC_UNITS_LIST[0]);
                  }
                }}
                className={`py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  unitType === 'academic'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Tổ Chuyên Môn ({ACADEMIC_UNITS_LIST.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUnitType('admin');
                  if (!ADMIN_UNITS_LIST.includes(unit as any)) {
                    setUnit(ADMIN_UNITS_LIST[0]);
                  }
                }}
                className={`py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  unitType === 'admin'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Phòng Ban Chức Năng ({ADMIN_UNITS_LIST.length})</span>
              </button>
            </div>

            {/* Unit Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {(unitType === 'academic' ? ACADEMIC_UNITS_LIST : ADMIN_UNITS_LIST).map((u) => {
                const isSelected = unit === u;
                const conf = getUnitConfig(u);
                return (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnit(u)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-bold text-left transition-all border flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? `${conf.bgLight} ${conf.borderColor} ring-2 ring-indigo-500 shadow-xs`
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="text-[10px] font-black opacity-70 uppercase block">
                      {conf.code}
                    </span>
                    <span className={`font-extrabold ${isSelected ? conf.textColor : 'text-slate-800'}`}>
                      {u}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Activity Title */}
          <div>
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">
              Nội dung công việc / Tên cuộc họp <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="input-weekly-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Sinh hoạt chuyên môn KHTN / Họp giao ban đầu tuần VP / Tập huấn PDP..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              required
            />
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">
                Ngày diễn ra <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="input-weekly-date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  required
                />
              </div>
              <span className="text-[11px] font-bold text-indigo-700 block mt-1">
                {getDayOfWeekName(date)}
              </span>
            </div>

            <div>
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">
                Giờ bắt đầu <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  id="input-weekly-starttime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">
                Giờ kết thúc
              </label>
              <div className="relative">
                <input
                  type="time"
                  id="input-weekly-endtime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* ONLINE (GOOGLE MEET) & OUTLOOK 30-MIN REMINDER SECTION */}
          <div className="p-4 rounded-2xl border-2 transition-all bg-indigo-50/50 border-indigo-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${isOnline ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                    Hình thức tổ chức trực tuyến (Google Meet)
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Tự động tạo link phòng họp & kết nối Outlook thông báo trước 30 phút
                  </p>
                </div>
              </div>

              {/* Toggle switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="toggle-is-online"
                  checked={isOnline}
                  onChange={(e) => handleToggleOnline(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* If Online is checked: show Meet URL inputs & generator */}
            {isOnline && (
              <div className="pt-2 border-t border-indigo-100 space-y-2.5 animate-in fade-in duration-150">
                <label className="text-xs font-bold text-indigo-900 block">
                  Đường dẫn phòng họp Google Meet:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    id="input-meet-url"
                    value={meetUrl}
                    onChange={(e) => setMeetUrl(e.target.value)}
                    placeholder="https://meet.google.com/xxx-yyyy-zzz"
                    className="flex-1 px-3 py-2 bg-white border border-indigo-300 rounded-xl text-xs font-semibold text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  <button
                    type="button"
                    onClick={handleGenerateNewMeetUrl}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-colors shadow-2xs cursor-pointer"
                    title="Tạo mã Google Meet mới"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Tạo link mới</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyMeetUrl}
                    className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-colors shrink-0"
                    title="Sao chép link Google Meet"
                  >
                    {copiedMeet ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Outlook Reminder Notice */}
                <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                  <Bell className="w-4 h-4 text-amber-700 shrink-0" />
                  <div>
                    <span className="font-bold">Đã kích hoạt kết nối Outlook:</span>
                    <span className="text-[11px] block text-amber-800">
                      Khi lưu, hệ thống cung cấp nút 1-chạm đẩy sự kiện sang Outlook Web và tải tệp .ICS với báo thức trước 30 phút tự động.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Location & Host Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">
                Địa điểm / Phòng họp
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="input-weekly-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="VD: Phòng họp 1, Hội trường, Online Meet..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">
                Người chủ trì / Phụ trách
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="input-weekly-host"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="VD: Tổ trưởng KHTN / Thầy Nguyễn Văn A..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Participants */}
          <div>
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">
              Thành phần tham dự
            </label>
            <input
              type="text"
              id="input-weekly-participants"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              placeholder="VD: Toàn thể giáo viên tổ Toán - Lý - Hóa, Đại diện BGH..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* Content Notes */}
          <div>
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">
              Nội dung công việc trọng tâm & Ghi chú
            </label>
            <textarea
              id="input-weekly-notes"
              value={contentNotes}
              onChange={(e) => setContentNotes(e.target.value)}
              rows={3}
              placeholder="Ghi chú các đầu việc cần chuẩn bị, tài liệu gửi trước, yêu cầu thảo luận..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* Status selector: Loading, Done, Cancel */}
          <div>
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1.5">
              Trạng thái hoạt động
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('loading')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                  status === 'loading'
                    ? 'bg-amber-500 text-indigo-950 border-amber-500 ring-2 ring-amber-300 shadow-xs'
                    : 'bg-white hover:bg-amber-50 text-slate-700 border-slate-200'
                }`}
              >
                <Loader2 className={`w-3.5 h-3.5 ${status === 'loading' ? 'animate-spin' : ''}`} />
                <span>Loading (Đang thực hiện)</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('done')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                  status === 'done'
                    ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-300 shadow-xs'
                    : 'bg-white hover:bg-emerald-50 text-slate-700 border-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Done (Hoàn thành)</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('cancel')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                  status === 'cancel'
                    ? 'bg-rose-600 text-white border-rose-600 ring-2 ring-rose-300 shadow-xs'
                    : 'bg-white hover:bg-rose-50 text-slate-700 border-slate-200'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel (Hủy bỏ)</span>
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              id="btn-save-weekly-activity"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {initialActivity ? 'Lưu cập nhật' : 'Thêm vào lịch tuần'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
