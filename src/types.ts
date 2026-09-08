export type Department =
  | 'Đào tạo'
  | 'TTCM'
  | 'CTHS'
  | 'PDP'
  | 'KHTN'
  | 'Tiếng Anh'
  | 'TA + KHXH'
  | 'BGH'
  | 'Văn phòng'
  | 'Trưởng khối GVCN'
  | 'Tuyển sinh'
  | 'Tiểu học'
  | 'Khác';

export type EventCategory =
  | 'Lịch sự kiện'
  | 'Lịch thi'
  | 'Lịch nghỉ'
  | 'Lịch họp phụ huynh'
  | 'Lịch trải nghiệm hè'
  | 'Lịch Đào Tạo'
  | 'Lịch học bù'
  | 'Hoạt động chuyên môn';

export type Semester = 'HK1' | 'HK2' | 'Hè' | 'Cả năm';

export type ActivityStatus =
  | 'loading'
  | 'done'
  | 'cancel'
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface Activity {
  id: string;
  title: string;
  department: Department | string;
  targetAudience: string;
  location: string;
  budget: number; // in VND
  notes?: string;
  category: EventCategory;
  startDate: string; // YYYY-MM-DD or YYYY-MM
  endDate?: string; // YYYY-MM-DD
  isMonthSpan?: boolean; // If only month specified like "9/2026"
  month: number; // 1-12
  year: number; // 2026 or 2027
  semester: Semester;
  status: ActivityStatus;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ConflictType =
  | 'location_conflict' // Trùng địa điểm cùng ngày
  | 'audience_conflict' // Trùng đối tượng tham gia cùng ngày
  | 'exam_overlap' // Trùng tuần kiểm tra / thi cử
  | 'holiday_overlap' // Trùng ngày nghỉ lễ
  | 'same_day_multitask'; // Quá nhiều hoạt động cùng 1 ngày

export interface ConflictIssue {
  id: string;
  type: ConflictType;
  severity: 'critical' | 'warning';
  activityIds: string[];
  date: string;
  title: string;
  description: string;
  conflictingDepartments: string[];
  conflictingLocation?: string;
  conflictingAudience?: string;
}

export interface MonthInfo {
  month: number;
  year: number;
  label: string;
  shortLabel: string;
  semester: Semester;
}

export interface DepartmentProfile {
  department: string;
  code?: string;
  headName?: string; // Trưởng tổ / Trưởng bộ phận
  deputyName?: string; // Phó tổ / Phó bộ phận
  memberCount?: number; // Số lượng GV / Nhân sự
  officeLocation?: string; // Phòng làm việc / Trụ sở
  email?: string;
  phone?: string;
  focusObjectives?: string; // Mục tiêu trọng tâm
  allocatedBudget?: number; // Ngân sách phân bổ (VND)
  notes?: string; // Ghi chú quản lý
}

// -------------------------------------------------------------
// HẠNG MỤC: LỊCH HOẠT ĐỘNG TRONG TUẦN CỦA TỔ CHUYÊN MÔN & PHÒNG BAN
// -------------------------------------------------------------

export type WeeklyUnitType = 'academic' | 'admin'; // 'academic': Tổ chuyên môn | 'admin': Phòng ban

export type AcademicUnit =
  | 'Tiếng Anh - Xã hội'
  | 'KHTN'
  | 'PDP'
  | 'Tiểu học';

export type AdminUnit =
  | 'Văn phòng (VP)'
  | 'Đào tạo'
  | 'Công tác học sinh (CTHS)'
  | 'Tuyển sinh (TS)';

export type WeeklyUnit = AcademicUnit | AdminUnit | string;

export interface WeeklyActivity {
  id: string;
  title: string;
  unitType: WeeklyUnitType; // 'academic' | 'admin'
  unit: WeeklyUnit; // 'Tiếng Anh - Xã hội' | 'KHTN' | 'PDP' | 'Tiểu học' | 'Văn phòng (VP)' | 'Đào tạo' | 'Công tác học sinh (CTHS)' | 'Tuyển sinh (TS)'
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // 'Thứ Hai' | 'Thứ Ba' | 'Thứ Tư' | 'Thứ Năm' | 'Thứ Sáu' | 'Thứ Bảy' | 'Chủ Nhật'
  startTime: string; // HH:mm (e.g. "08:30")
  endTime: string; // HH:mm (e.g. "10:00")
  isOnline: boolean; // true: Trực tuyến qua Meet | false: Trực tiếp
  meetUrl?: string; // e.g. https://meet.google.com/abc-defg-hij
  location?: string; // e.g. Online Google Meet, Phòng họp 1, Hội trường
  host?: string; // Người chủ trì / Người phụ trách
  participants?: string; // Thành phần tham dự
  contentNotes?: string; // Nội dung chi tiết / Nhiệm vụ trọng tâm
  status: ActivityStatus; // 'loading' | 'done' | 'cancel'
  reminderMinutes?: number; // Cài đặt báo trước 30 phút mặc định cho Outlook/Hệ thống
  createdAt?: string;
  updatedAt?: string;
}

// -------------------------------------------------------------
// HẠNG MỤC: THÔNG BÁO & NHẬT KÝ TƯƠNG TÁC NGƯỜI DÙNG (REAL-TIME NOTIFICATIONS)
// -------------------------------------------------------------

export type InteractionType =
  | 'create_activity'
  | 'update_activity'
  | 'delete_activity'
  | 'status_activity'
  | 'duplicate_activity'
  | 'create_weekly'
  | 'update_weekly'
  | 'delete_weekly'
  | 'status_weekly'
  | 'clear_weekly'
  | 'update_department'
  | 'resolve_conflict'
  | 'restore_data'
  | 'export_data'
  | 'remote_sync';

export interface UserInteractionNotification {
  id: string;
  type: InteractionType;
  title: string;
  message: string;
  userName?: string;
  userRole?: string;
  department?: string;
  targetId?: string;
  targetType?: 'yearly' | 'weekly' | 'department' | 'system';
  timestamp: string;
  formattedTime: string;
  read: boolean;
  severity: 'info' | 'success' | 'warning' | 'error';
}

export interface UserProfileIdentity {
  id: string;
  name: string;
  role: string;
  department: string;
}

