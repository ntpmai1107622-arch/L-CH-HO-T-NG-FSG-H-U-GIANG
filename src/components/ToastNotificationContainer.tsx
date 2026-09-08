import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  Trash2,
  X,
  Bell,
  Clock,
  Sparkles,
} from 'lucide-react';
import { UserInteractionNotification } from '../types';

interface ToastNotificationContainerProps {
  toasts: UserInteractionNotification[];
  onDismiss: (id: string) => void;
  onOpenCenter: () => void;
}

export const ToastNotificationContainer: React.FC<ToastNotificationContainerProps> = ({
  toasts,
  onDismiss,
  onOpenCenter,
}) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      id="toast-notification-container"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none"
      aria-live="polite"
    >
      {toasts.slice(0, 4).map((toast) => {
        const isSuccess = toast.severity === 'success';
        const isWarning = toast.severity === 'warning';
        const isError = toast.severity === 'error';

        let borderClass = 'border-sky-300 bg-white shadow-xl shadow-sky-900/10';
        let iconBadgeClass = 'bg-sky-100 text-sky-700';
        let IconComponent = Info;

        if (isSuccess) {
          borderClass = 'border-emerald-300 bg-white shadow-xl shadow-emerald-950/10';
          iconBadgeClass = 'bg-emerald-100 text-emerald-700';
          IconComponent = CheckCircle2;
        } else if (isWarning) {
          borderClass = 'border-amber-300 bg-white shadow-xl shadow-amber-950/10';
          iconBadgeClass = 'bg-amber-100 text-amber-700';
          IconComponent = AlertTriangle;
        } else if (isError) {
          borderClass = 'border-rose-300 bg-white shadow-xl shadow-rose-950/10';
          iconBadgeClass = 'bg-rose-100 text-rose-700';
          IconComponent = Trash2;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border p-3.5 transition-all transform duration-300 translate-y-0 opacity-100 flex items-start gap-3 ${borderClass}`}
            role="alert"
          >
            <div className={`p-2 rounded-xl shrink-0 ${iconBadgeClass}`}>
              <IconComponent className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="text-xs font-black text-slate-900 line-clamp-1">
                  {toast.title}
                </span>
                <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3" />
                  {toast.formattedTime.split(' - ')[0] || 'Vừa xong'}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                {toast.message}
              </p>

              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {toast.department && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {toast.department}
                    </span>
                  )}
                  {toast.userName && (
                    <span className="text-[10px] font-medium text-slate-500">
                      bởi {toast.userName}
                    </span>
                  )}
                </div>

                <button
                  onClick={onOpenCenter}
                  className="text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Chi tiết</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
              title="Đóng thông báo"
              aria-label="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
