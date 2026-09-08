import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Trash2,
  X,
  Clock,
  Filter,
  Search,
  CheckCheck,
  User,
  Volume2,
  VolumeX,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { UserInteractionNotification, UserProfileIdentity } from '../types';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: UserInteractionNotification[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onMarkAsRead: (id: string) => void;
  currentUser: UserProfileIdentity;
  onUpdateCurrentUser: (user: UserProfileIdentity) => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
}

const AVAILABLE_DEPARTMENTS = [
  'Ban Giám Hiệu (BGH)',
  'Tổ Tiếng Anh - Xã hội',
  'Tổ KHTN',
  'Tổ PDP',
  'Khối Tiểu học',
  'Phòng Đào tạo',
  'Phòng Văn phòng (VP)',
  'Phòng Công tác học sinh (CTHS)',
  'Phòng Tuyển sinh (TS)',
  'Trưởng khối GVCN',
  'Giáo viên / Nhân viên',
];

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearAll,
  onMarkAsRead,
  currentUser,
  onUpdateCurrentUser,
  isSoundEnabled,
  onToggleSound,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'yearly' | 'weekly' | 'dept'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [tempUserName, setTempUserName] = useState(currentUser.name);
  const [tempUserDept, setTempUserDept] = useState(currentUser.department);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((item) => {
    // Tab filter
    if (filterType === 'unread' && item.read) return false;
    if (filterType === 'yearly' && item.targetType !== 'yearly') return false;
    if (filterType === 'weekly' && item.targetType !== 'weekly') return false;
    if (filterType === 'dept' && item.targetType !== 'department') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchMsg = (item.message || '').toLowerCase().includes(q);
      const matchDept = (item.department || '').toLowerCase().includes(q);
      const matchUser = (item.userName || '').toLowerCase().includes(q);
      if (!matchTitle && !matchMsg && !matchDept && !matchUser) return false;
    }

    return true;
  });

  const handleSaveUserIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCurrentUser({
      ...currentUser,
      name: tempUserName.trim() || 'Cán bộ / Giáo viên',
      department: tempUserDept,
    });
    setIsEditingUser(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-gradient-to-r from-orange-50/70 via-amber-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-200 shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  Trung Tâm Thông Báo & Nhật Ký Tương Tác
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-orange-600 text-white animate-pulse">
                    {unreadCount} mới
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Cập nhật tức thì mọi thay đổi, bổ sung và điều phối từ người dùng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                isSoundEnabled
                  ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
              }`}
              title={isSoundEnabled ? 'Tắt âm báo khi có tương tác' : 'Bật âm báo khi có tương tác'}
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-rose-500" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current User Identity Bar */}
        <div className="bg-slate-50 px-5 py-2.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-100 text-orange-700">
              <User className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-slate-500">Tương tác hiện tại ghi nhận với danh xưng:</span>{' '}
              <span className="font-bold text-slate-900">{currentUser.name}</span>{' '}
              <span className="text-slate-400">({currentUser.department})</span>
            </div>
          </div>

          <button
            onClick={() => {
              setTempUserName(currentUser.name);
              setTempUserDept(currentUser.department);
              setIsEditingUser(!isEditingUser);
            }}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 underline shrink-0 cursor-pointer text-left sm:text-right"
          >
            {isEditingUser ? 'Hủy đổi' : 'Đổi thông tin người cập nhật'}
          </button>
        </div>

        {/* User Identity Form when editing */}
        {isEditingUser && (
          <form onSubmit={handleSaveUserIdentity} className="bg-amber-50/60 p-4 border-b border-amber-200 flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Tên hoặc Chức danh của bạn
              </label>
              <input
                type="text"
                value={tempUserName}
                onChange={(e) => setTempUserName(e.target.value)}
                placeholder="VD: Thầy Nguyễn Văn A, Cô Mai CTHS..."
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Tổ / Phòng ban công tác
              </label>
              <select
                value={tempUserDept}
                onChange={(e) => setTempUserDept(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                {AVAILABLE_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors shadow-xs cursor-pointer"
            >
              Lưu danh xưng
            </button>
          </form>
        )}

        {/* Toolbar: Search, Filters, Mark as read, Clear */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm nội dung thông báo..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Đánh dấu đã đọc toàn bộ"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đã đọc hết</span>
              </button>
            )}

            {notifications.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử thông báo và nhật ký tương tác?')) {
                    onClearAll();
                  }
                }}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-rose-200 transition-colors cursor-pointer"
                title="Xóa toàn bộ thông báo"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Xóa nhật ký</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabs Filter */}
        <div className="flex items-center gap-1.5 px-4 pt-3 pb-2 overflow-x-auto scrollbar-none border-b border-slate-100">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterType === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tất cả ({notifications.length})
          </button>
          <button
            onClick={() => setFilterType('unread')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterType === 'unread'
                ? 'bg-orange-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Chưa đọc ({unreadCount})
          </button>
          <button
            onClick={() => setFilterType('weekly')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterType === 'weekly'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Lịch tuần
          </button>
          <button
            onClick={() => setFilterType('yearly')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterType === 'yearly'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Kế hoạch năm
          </button>
          <button
            onClick={() => setFilterType('dept')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterType === 'dept'
                ? 'bg-sky-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tổ / Phòng ban
          </button>
        </div>

        {/* Notification List Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">Chưa có thông báo tương tác nào</p>
              <p className="text-xs text-slate-400 max-w-xs">
                Mọi hành động thêm mới, chỉnh sửa, đổi trạng thái hoặc dời lịch của bạn và đồng nghiệp sẽ xuất hiện tại đây ngay lập tức.
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const isSuccess = item.severity === 'success';
              const isWarning = item.severity === 'warning';
              const isError = item.severity === 'error';

              let badgeBg = 'bg-sky-100 text-sky-800';
              let IconComp = Info;
              if (isSuccess) {
                badgeBg = 'bg-emerald-100 text-emerald-800';
                IconComp = CheckCircle2;
              } else if (isWarning) {
                badgeBg = 'bg-amber-100 text-amber-800';
                IconComp = AlertTriangle;
              } else if (isError) {
                badgeBg = 'bg-rose-100 text-rose-800';
                IconComp = Trash2;
              }

              return (
                <div
                  key={item.id}
                  onClick={() => onMarkAsRead(item.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    item.read
                      ? 'bg-white hover:bg-slate-50/80 border-slate-200'
                      : 'bg-orange-50/40 hover:bg-orange-50/70 border-orange-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl shrink-0 ${badgeBg}`}>
                      <IconComp className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-black text-slate-900">
                            {item.title}
                          </h4>
                          {!item.read && (
                            <span className="w-2 h-2 rounded-full bg-orange-600 shrink-0" />
                          )}
                          {item.department && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {item.department}
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.formattedTime}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                        {item.message}
                      </p>

                      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          Người thực hiện: <strong className="text-slate-800">{item.userName || 'Cán bộ'}</strong>
                        </span>

                        <span className="text-slate-400 text-[10px]">
                          {item.targetType === 'weekly'
                            ? 'Lịch tuần'
                            : item.targetType === 'yearly'
                            ? 'Kế hoạch năm'
                            : item.targetType === 'department'
                            ? 'Hồ sơ phòng ban'
                            : 'Hệ thống'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Đồng bộ thời gian thực tự động qua BroadcastChannel & Lưu trữ an toàn</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold cursor-pointer transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
