import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  Sparkles,
  Edit2,
  Building2,
} from 'lucide-react';
import { Activity, ConflictIssue } from '../types';
import { formatDateVN, formatCurrencyVND } from '../utils/conflictDetector';

interface ConflictResolutionCenterProps {
  conflictIssues: ConflictIssue[];
  activities: Activity[];
  onEditActivity: (activity: Activity) => void;
  onAutoReschedule: (activityId: string, daysOffset: number) => void;
  onChangeLocation: (activityId: string, newLocation: string) => void;
  onRefreshChecks: () => void;
}

export const ConflictResolutionCenter: React.FC<ConflictResolutionCenterProps> = ({
  conflictIssues,
  activities,
  onEditActivity,
  onAutoReschedule,
  onChangeLocation,
}) => {
  const getActivity = (id: string) => activities.find((a) => a.id === id);

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          conflictIssues.length > 0
            ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-lg shadow-red-200'
            : 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold uppercase tracking-wider">
              {conflictIssues.length > 0 ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-yellow-300" />
                  <span>Phát hiện {conflictIssues.length} điểm trùng lịch cần xử lý</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Lịch hoạt động hoàn hảo, không có xung đột!</span>
                </>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Trung Tâm Điều Phối & Xử Lý Trùng Lịch Trường Học
            </h2>
            <p className="text-xs sm:text-sm text-white/90 max-w-2xl leading-relaxed">
              Hệ thống tự động quét và cảnh báo khi 2 tổ chuyên môn cùng tổ chức sự kiện tại một địa điểm, cùng huy động một đối tượng học sinh, hoặc xếp lịch vào tuần thi cử / nghỉ lễ.
            </p>
          </div>
        </div>
      </div>

      {/* List of conflicts */}
      {conflictIssues.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-2xs">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Tất cả hoạt động đều không bị xung đột!
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Không có hoạt động nào bị trùng địa điểm, trùng đối tượng tham gia hoặc rơi vào các đợt thi / nghỉ lễ của nhà trường.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {conflictIssues.map((issue, idx) => {
            const act1 = getActivity(issue.activityIds[0]);
            const act2 = getActivity(issue.activityIds[1]);

            if (!act1 || !act2) return null;

            return (
              <div
                key={issue.id || idx}
                id={`conflict-card-${issue.id}`}
                className="bg-white rounded-2xl border-2 border-red-400 p-5 shadow-sm space-y-4"
              >
                {/* Conflict Title & Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-red-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-red-100 text-red-600 rounded-xl">
                      <AlertTriangle className="w-5 h-5" />
                    </span>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-red-600 block">
                        Xung đột #{idx + 1} — Ngày {formatDateVN(issue.date)}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">
                        {issue.title}
                      </h3>
                    </div>
                  </div>

                  <span className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold self-start sm:self-auto">
                    {issue.type === 'location_conflict' && 'Trùng Địa điểm'}
                    {issue.type === 'audience_conflict' && 'Trùng Đối tượng'}
                    {issue.type === 'exam_overlap' && 'Trùng Tuần Thi Cử'}
                    {issue.type === 'holiday_overlap' && 'Trùng Ngày Nghỉ Lễ'}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 bg-red-50/70 p-3 rounded-xl border border-red-200">
                  <strong>Chi tiết:</strong> {issue.description}
                </p>

                {/* Side by side comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Activity 1 */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-slate-900 text-white text-[11px] font-bold rounded">
                        Tổ: {act1.department}
                      </span>
                      <button
                        onClick={() => onEditActivity(act1)}
                        className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        Chỉnh sửa
                      </button>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">
                      {act1.title}
                    </h4>
                    <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-200/60">
                      <div>📍 Địa điểm: <strong>{act1.location || 'Chưa định'}</strong></div>
                      <div>👥 Đối tượng: <strong>{act1.targetAudience}</strong></div>
                      <div>💰 Kinh phí: <strong>{formatCurrencyVND(act1.budget || 0)}</strong></div>
                    </div>
                  </div>

                  {/* Activity 2 */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-slate-900 text-white text-[11px] font-bold rounded">
                        Tổ: {act2.department}
                      </span>
                      <button
                        onClick={() => onEditActivity(act2)}
                        className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        Chỉnh sửa
                      </button>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">
                      {act2.title}
                    </h4>
                    <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-200/60">
                      <div>📍 Địa điểm: <strong>{act2.location || 'Chưa định'}</strong></div>
                      <div>👥 Đối tượng: <strong>{act2.targetAudience}</strong></div>
                      <div>💰 Kinh phí: <strong>{formatCurrencyVND(act2.budget || 0)}</strong></div>
                    </div>
                  </div>
                </div>

                {/* Quick Action Suggestion Bar */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                    Gợi ý xử lý nhanh:
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Quick Reschedule */}
                    <button
                      id={`btn-reschedule-${act2.id}`}
                      onClick={() => onAutoReschedule(act2.id, 7)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Dời "{act2.department}" sang tuần sau (+7 ngày)</span>
                    </button>

                    {/* Quick Venue Change */}
                    {issue.type === 'location_conflict' && (
                      <button
                        id={`btn-change-venue-${act2.id}`}
                        onClick={() => onChangeLocation(act2.id, 'Phòng Hội trường 2 / Phòng Đa năng')}
                        className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Đổi địa điểm "{act2.department}" sang Hội trường 2</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
