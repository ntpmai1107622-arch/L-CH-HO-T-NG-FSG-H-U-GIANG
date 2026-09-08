import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  User,
  Users,
  MapPin,
  Mail,
  Phone,
  Target,
  DollarSign,
  FileText,
  Save,
  RotateCcw,
} from 'lucide-react';
import { DepartmentProfile } from '../types';

interface DepartmentInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  departmentName: string;
  initialProfile?: DepartmentProfile;
  onSaveProfile: (profile: DepartmentProfile) => void;
}

export const DepartmentInfoModal: React.FC<DepartmentInfoModalProps> = ({
  isOpen,
  onClose,
  departmentName,
  initialProfile,
  onSaveProfile,
}) => {
  const [formData, setFormData] = useState<DepartmentProfile>({
    department: departmentName,
    code: '',
    headName: '',
    deputyName: '',
    memberCount: 0,
    officeLocation: '',
    email: '',
    phone: '',
    focusObjectives: '',
    allocatedBudget: 0,
    notes: '',
  });

  useEffect(() => {
    if (initialProfile) {
      setFormData({
        department: initialProfile.department || departmentName,
        code: initialProfile.code || '',
        headName: initialProfile.headName || '',
        deputyName: initialProfile.deputyName || '',
        memberCount: initialProfile.memberCount || 0,
        officeLocation: initialProfile.officeLocation || '',
        email: initialProfile.email || '',
        phone: initialProfile.phone || '',
        focusObjectives: initialProfile.focusObjectives || '',
        allocatedBudget: initialProfile.allocatedBudget || 0,
        notes: initialProfile.notes || '',
      });
    } else {
      setFormData({
        department: departmentName,
        code: departmentName.substring(0, 3).toUpperCase(),
        headName: '',
        deputyName: '',
        memberCount: 0,
        officeLocation: '',
        email: '',
        phone: '',
        focusObjectives: '',
        allocatedBudget: 0,
        notes: '',
      });
    }
  }, [departmentName, initialProfile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl border border-white/10">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-300 font-bold">
                Chỉnh Sửa Thông Tin Tổ / Phòng Ban
              </span>
              <h3 className="text-lg font-black text-white">
                Tổ / Ban: {departmentName}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tên Tổ / Phòng ban */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên Tổ / Phòng ban
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Mã viết tắt */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mã viết tắt / Ký hiệu
              </label>
              <input
                type="text"
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="VD: DT, CTHS, PDP, KHTN"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Trưởng tổ / Trưởng ban */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Trưởng tổ / Trưởng phòng
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formData.headName || ''}
                  onChange={(e) => setFormData({ ...formData, headName: e.target.value })}
                  placeholder="VD: Thầy Nguyễn Văn A"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Phó tổ / Phó ban */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phó tổ / Phó phòng
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formData.deputyName || ''}
                  onChange={(e) => setFormData({ ...formData, deputyName: e.target.value })}
                  placeholder="VD: Cô Trần Thị B"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Số lượng nhân sự */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số lượng nhân sự / Giáo viên
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="0"
                  value={formData.memberCount || 0}
                  onChange={(e) => setFormData({ ...formData, memberCount: parseInt(e.target.value, 10) || 0 })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Văn phòng làm việc */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Văn phòng / Địa điểm làm việc
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formData.officeLocation || ''}
                  onChange={(e) => setFormData({ ...formData, officeLocation: e.target.value })}
                  placeholder="VD: Phòng 204, Tòa Alpha"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email phòng ban
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="VD: daotao.hg@fpt.edu.vn"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Số điện thoại / Hotline */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số điện thoại liên hệ / Máy nhánh
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="VD: 0293 388 6688"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Ngân sách phân bổ */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ngân sách dự kiến phân bổ (VND)
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
              <input
                type="number"
                step="1000000"
                min="0"
                value={formData.allocatedBudget || 0}
                onChange={(e) => setFormData({ ...formData, allocatedBudget: parseFloat(e.target.value) || 0 })}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-emerald-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Mục tiêu trọng tâm */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mục tiêu & Định hướng trọng tâm năm học
            </label>
            <div className="relative">
              <textarea
                rows={2}
                value={formData.focusObjectives || ''}
                onChange={(e) => setFormData({ ...formData, focusObjectives: e.target.value })}
                placeholder="VD: Nâng cao chất lượng dạy học STEM, hoàn thành 100% chỉ tiêu tuyển sinh..."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Ghi chú nội bộ */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ghi chú công tác nội bộ
            </label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="VD: Họp giao ban vào thứ Hai hàng tuần..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Thông Tin Phòng Ban</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
