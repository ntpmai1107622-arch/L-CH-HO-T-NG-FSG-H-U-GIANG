import { Activity, ConflictIssue } from '../types';

// Helper to check if two date intervals [s1, e1] and [s2, e2] overlap
export function isDateOverlap(
  start1: string,
  end1: string | undefined,
  start2: string,
  end2: string | undefined
): boolean {
  const e1 = end1 || start1;
  const e2 = end2 || start2;
  return start1 <= e2 && start2 <= e1;
}

// Generate all dates in YYYY-MM-DD within range
export function getDatesInRange(startDate: string, endDate?: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate || startDate);

  const current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export function detectScheduleConflicts(activities: Activity[]): {
  conflictMap: Record<string, ConflictIssue[]>;
  conflictingDates: Set<string>;
  allIssues: ConflictIssue[];
} {
  const conflictMap: Record<string, ConflictIssue[]> = {};
  const conflictingDates = new Set<string>();
  const allIssues: ConflictIssue[] = [];

  // Group activities by active status (ignore cancelled)
  const activeActivities = activities.filter((a) => a.status !== 'cancelled');

  for (let i = 0; i < activeActivities.length; i++) {
    const act1 = activeActivities[i];

    for (let j = i + 1; j < activeActivities.length; j++) {
      const act2 = activeActivities[j];

      // Check date overlap
      if (isDateOverlap(act1.startDate, act1.endDate, act2.startDate, act2.endDate)) {
        const overlapDates = getDatesInRange(act1.startDate, act1.endDate).filter((d) =>
          getDatesInRange(act2.startDate, act2.endDate).includes(d)
        );

        const primaryDate = overlapDates[0] || act1.startDate;

        // 1. Holiday overlap conflict
        if (act1.category === 'Lịch nghỉ' || act2.category === 'Lịch nghỉ') {
          const holiday = act1.category === 'Lịch nghỉ' ? act1 : act2;
          const other = act1.category === 'Lịch nghỉ' ? act2 : act1;

          if (other.category !== 'Lịch nghỉ') {
            const issue: ConflictIssue = {
              id: `conflict-holiday-${act1.id}-${act2.id}`,
              type: 'holiday_overlap',
              severity: 'critical',
              activityIds: [act1.id, act2.id],
              date: primaryDate,
              title: `Trùng ngày Nghỉ lễ: ${holiday.title}`,
              description: `Hoạt động "${other.title}" (${other.department}) được xếp vào đợt nghỉ lễ "${holiday.title}".`,
              conflictingDepartments: Array.from(new Set([act1.department, act2.department])),
            };
            allIssues.push(issue);
            overlapDates.forEach((d) => conflictingDates.add(d));

            conflictMap[act1.id] = [...(conflictMap[act1.id] || []), issue];
            conflictMap[act2.id] = [...(conflictMap[act2.id] || []), issue];
            continue;
          }
        }

        // 2. Exam period conflict
        if (act1.category === 'Lịch thi' || act2.category === 'Lịch thi') {
          const exam = act1.category === 'Lịch thi' ? act1 : act2;
          const other = act1.category === 'Lịch thi' ? act2 : act1;

          if (other.category !== 'Lịch thi' && other.category !== 'Lịch Đào Tạo') {
            const issue: ConflictIssue = {
              id: `conflict-exam-${act1.id}-${act2.id}`,
              type: 'exam_overlap',
              severity: 'critical',
              activityIds: [act1.id, act2.id],
              date: primaryDate,
              title: `Trùng đợt thi: ${exam.title}`,
              description: `Hoạt động "${other.title}" (${other.department}) diễn ra trùng đợt thi "${exam.title}" (${exam.department}). Học sinh cần tập trung ôn tập và dự thi.`,
              conflictingDepartments: Array.from(new Set([act1.department, act2.department])),
            };
            allIssues.push(issue);
            overlapDates.forEach((d) => conflictingDates.add(d));

            conflictMap[act1.id] = [...(conflictMap[act1.id] || []), issue];
            conflictMap[act2.id] = [...(conflictMap[act2.id] || []), issue];
            continue;
          }
        }

        // 3. Location Conflict (Same venue, e.g. FSC Hậu Giang, Hội trường, Phòng họp...)
        const loc1 = (act1.location || '').trim().toLowerCase();
        const loc2 = (act2.location || '').trim().toLowerCase();
        const isSharedVenue =
          loc1 &&
          loc2 &&
          loc1 === loc2 &&
          loc1 !== 'online' &&
          loc1 !== 'toàn trường' &&
          loc1 !== 'phòng học';

        if (isSharedVenue && act1.department !== act2.department) {
          const issue: ConflictIssue = {
            id: `conflict-loc-${act1.id}-${act2.id}`,
            type: 'location_conflict',
            severity: 'critical',
            activityIds: [act1.id, act2.id],
            date: primaryDate,
            title: `Trùng địa điểm: ${act1.location}`,
            description: `Tổ "${act1.department}" và Tổ "${act2.department}" cùng đăng ký tổ chức tại "${act1.location}" trong cùng ngày ${primaryDate}.`,
            conflictingDepartments: [act1.department, act2.department],
            conflictingLocation: act1.location,
          };
          allIssues.push(issue);
          overlapDates.forEach((d) => conflictingDates.add(d));

          conflictMap[act1.id] = [...(conflictMap[act1.id] || []), issue];
          conflictMap[act2.id] = [...(conflictMap[act2.id] || []), issue];
          continue;
        }

        // 4. Target Audience Conflict (e.g., both targeting 'Học sinh toàn trường' or 'CMHS toàn trường')
        const aud1 = (act1.targetAudience || '').trim().toLowerCase();
        const aud2 = (act2.targetAudience || '').trim().toLowerCase();
        const isAudienceOverlap =
          aud1 &&
          aud2 &&
          (aud1.includes('học sinh toàn trường') ||
            aud1.includes('cmhs toàn trường') ||
            aud1.includes('toàn trường')) &&
          (aud2.includes('học sinh toàn trường') ||
            aud2.includes('cmhs toàn trường') ||
            aud2.includes('toàn trường')) &&
          act1.department !== act2.department;

        if (isAudienceOverlap) {
          const issue: ConflictIssue = {
            id: `conflict-aud-${act1.id}-${act2.id}`,
            type: 'audience_conflict',
            severity: 'warning',
            activityIds: [act1.id, act2.id],
            date: primaryDate,
            title: `Trùng đối tượng tham gia`,
            description: `Hoạt động "${act1.title}" (${act1.department}) và "${act2.title}" (${act2.department}) cùng huy động "${act1.targetAudience}".`,
            conflictingDepartments: [act1.department, act2.department],
            conflictingAudience: act1.targetAudience,
          };
          allIssues.push(issue);
          overlapDates.forEach((d) => conflictingDates.add(d));

          conflictMap[act1.id] = [...(conflictMap[act1.id] || []), issue];
          conflictMap[act2.id] = [...(conflictMap[act2.id] || []), issue];
        }
      }
    }
  }

  return { conflictMap, conflictingDates, allIssues };
}

// Format Currency VND
export function formatCurrencyVND(amount: number): string {
  if (amount === 0) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
}

// Format Date string DD/MM/YYYY
export function formatDateVN(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

// Format Date Range
export function formatDateRangeVN(startDate: string, endDate?: string): string {
  if (!startDate) return '';
  if (!endDate || endDate === startDate) {
    return formatDateVN(startDate);
  }
  return `${formatDateVN(startDate)} - ${formatDateVN(endDate)}`;
}
