import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Building2,
  MapPin,
  Users,
  DollarSign,
  Tag,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Activity, Department, EventCategory, Semester, ActivityStatus } from '../types';
import { DEPARTMENTS_LIST, CATEGORY_CONFIG, normalizeStatus } from '../data/initialData';
import { isDateOverlap, formatCurrencyVND } from '../utils/conflictDetector';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: Activity) => void;
  initialActivity?: Activity | null;
  defaultDate?: string;
  defaultDepartment?: string;
  existingActivities: Activity[];
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialActivity,
  defaultDate,
  defaultDepartment,
  existingActivities,
}) => {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState<Department | string>('Đào tạo');
  const [targetAudience, setTargetAudience] = useState('Học sinh toàn trường');
  const [location, setLocation] = useState('FSC Hậu Giang');
  const [budget, setBudget] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<EventCategory>('Lịch sự kiện');
  const [startDate, setStartDate] = useState(defaultDate || '2026-09-01');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<ActivityStatus>('loading');

  useEffect(() => {
    if (initialActivity) {
      setTitle(initialActivity.title || '');
      setDepartment(initialActivity.department || 'Đào tạo');
      setTargetAudience(initialActivity.targetAudience || '');
      setLocation(initialActivity.location || '');
      setBudget(initialActivity.budget || 0);
      setNotes(initialActivity.notes || '');
      setCategory(initialActivity.category || 'Lịch sự kiện');
      setStartDate(initialActivity.startDate || '2026-09-01');
      setEndDate(initialActivity.endDate || '');
      setStatus(normalizeStatus(initialActivity.status));
    } else {
      setTitle('');
      setDepartment(defaultDepartment || 'Đào tạo');
      setTargetAudience('Học sinh toàn trường');
      setLocation('FSC Hậu Giang');
      setBudget(0);
      setNotes('Hoạt động thường niên');
      setCategory('Lịch sự kiện');
      setStartDate(defaultDate || '2026-09-05');
      setEndDate('');
      setStatus('loading');
    }
  }, [initialActivity, defaultDate, defaultDepartment, isOpen]);

  if (!isOpen) return null;

  // Determine month, year and semester from startDate
  const dateObj = new Date(startDate || '2026-09-01');
  const month = !isNaN(dateObj.getMonth()) ? dateObj.getMonth() + 1 : 9;
  const year = !isNaN(dateObj.getFullYear()) ? dateObj.getFullYear() : 2026;
  const semester: Semester = month >= 8 || month === 1 ? 'HK1' : month <= 5 ? 'HK2' : 'Hè';

  // Real-time Conflict preview check
  const potentialConflicts = existingActivities.filter((act) => {
    if (initialActivity && act.id === initialActivity.id) return false;
    if (act.status === 'cancelled') return false;

    const overlap = isDateOverlap(startDate, endDate || startDate, act.startDate, act.endDate);
    if (!overlap) return false;

    // Check location or audience or exam overlap
    const locMatch =
      location.trim() &&
      act.location &&
      location.trim().toLowerCase() === act.location.trim().toLowerCase() &&
      location.toLowerCase() !== 'online' &&
      location.toLowerCase() !== 'phòng học';

    const examOverlap =
      (category === 'Lịch thi' || act.category === 'Lịch thi') &&
      category !== act.category;

    const holidayOverlap =
      (category === 'Lịch nghỉ' || act.category === 'Lịch nghỉ') &&
      category !== act.category;

    return locMatch || examOverlap || holidayOverlap;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tên nội dung công việc');
      return;
    }

    const activityData: Activity = {
      id: initialActivity?.id || `act-${Date.now()}`,
      title: title.trim(),
      department: department.trim(),
      targetAudience: targetAudience.trim(),
      location: location.trim(),
      budget: Number(budget) || 0,
      notes: notes.trim(),
      category,
      startDate,
      endDate: endDate || undefined,
      month,
      year,
      semester,
      status,
      updatedAt: new Date().toISOString(),
    };

    onSave(activityData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
              {initialActivity ? 'Cập nhật lịch' : 'Thêm hoạt động mới'}
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              {initialActivity ? 'Điều chỉnh nội dung công việc' : 'Đăng ký kế hoạch hoạt động'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg text-sm transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Live Conflict Alert Banner */}
          {potentialConflicts.length > 0 && (
            <div className="p-3.5 bg-red-50 border-2 border-red-400 rounded-xl space-y-1.5 animate-pulse">
              <div className="flex items-center gap-2 text-red-800 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>CẢNH BÁO TRÙNG LỊCH: PHÁT HIỆN XUNG ĐỘT TIỀM ẨN!</span>
              </div>
              <ul className="text-xs text-red-700 space-y-1 list-disc pl-5">
                {potentialConflicts.map((c) => (
                  <li key={c.id}>
                    Trùng với <strong>"{c.title}"</strong> (Tổ {c.department}) tại{' '}
                    <strong>{c.location}</strong> ({c.startDate}).
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nội dung công việc / Tên hoạt động *
            </label>
            <textarea
              id="input-activity-title"
              required
              rows={2}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Tổ chức Lễ Khai giảng năm học 2026 - 2027..."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Department & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tổ / Phòng ban phụ trách *
              </label>
              <select
                id="input-activity-dept"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-medium"
              >
                {DEPARTMENTS_LIST.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phân loại hoạt động *
              </label>
              <select
                id="input-activity-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-medium"
              >
                {Object.keys(CATEGORY_CONFIG).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Ngày bắt đầu (hoặc ngày diễn ra) *
              </label>
              <input
                id="input-activity-start-date"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Ngày kết thúc (nếu kéo dài nhiều ngày)
              </label>
              <input
                id="input-activity-end-date"
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-medium"
              />
            </div>
          </div>

          {/* Location & Audience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Địa điểm tổ chức
              </label>
              <input
                id="input-activity-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="VD: FSC Hậu Giang, Phòng học, Hội trường..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Đối tượng tham gia
              </label>
              <input
                id="input-activity-audience"
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="VD: Học sinh toàn trường, GVBM, CMHS..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-medium"
              />
            </div>
          </div>

          {/* Budget & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Dự trù chi phí (VNĐ)
              </label>
              <div className="relative">
                <input
                  id="input-activity-budget"
                  type="number"
                  min="0"
                  step="500000"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-bold text-emerald-700"
                />
                <span className="text-[11px] text-slate-400 absolute right-3 top-1/2 -translate-y-1/2">
                  {formatCurrencyVND(budget || 0)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Trạng thái hoạt động
              </label>
              <select
                id="input-activity-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ActivityStatus)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-bold"
              >
                <option value="loading">⏳ Loading (Đang thực hiện / Chuẩn bị)</option>
                <option value="done">✅ Done (Hoàn thành)</option>
                <option value="cancel">🚫 Cancel (Hủy bỏ / Tạm hoãn)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Ghi chú (Tài chính, kế hoạch chi tiết...)
            </label>
            <input
              id="input-activity-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Hoạt động thường niên, Dự trù: 2M/ 1 lớp..."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              id="btn-submit-activity-form"
              type="submit"
              className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              {initialActivity ? 'Lưu thay đổi' : 'Tạo hoạt động'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
