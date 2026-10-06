import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Meeting, MeetingType, MeetingStatus } from '../../types';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  Users,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface MeetingModalProps {
  isOpen: boolean;
  meetingToEdit?: Meeting | null;
  onClose: () => void;
}

export const MeetingModal: React.FC<MeetingModalProps> = ({
  isOpen,
  meetingToEdit,
  onClose,
}) => {
  const { addMeeting, updateMeeting, users } = useApp();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<MeetingType>('Họp chuyên môn');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:30');
  const [location, setLocation] = useState('Phòng Hội đồng Sư phạm (Trực tiếp)');
  const [host, setHost] = useState('');
  const [secretary, setSecretary] = useState('');
  const [description, setDescription] = useState('');
  const [attendeesText, setAttendeesText] = useState('Toàn thể Cán bộ Quản lý và Giáo viên các khối Mầm, Chồi, Lá');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<MeetingStatus>('upcoming');

  useEffect(() => {
    if (meetingToEdit) {
      setTitle(meetingToEdit.title);
      setType(meetingToEdit.type);
      setDate(meetingToEdit.date);
      setStartTime(meetingToEdit.startTime);
      setEndTime(meetingToEdit.endTime);
      setLocation(meetingToEdit.location);
      setHost(meetingToEdit.host);
      setSecretary(meetingToEdit.secretary);
      setDescription(meetingToEdit.description);
      setAttendeesText(meetingToEdit.attendeesText);
      setNotes(meetingToEdit.notes || '');
      setStatus(meetingToEdit.status);
    } else {
      // Default new meeting
      const today = new Date().toISOString().split('T')[0];
      setTitle('');
      setType('Họp chuyên môn');
      setDate(today);
      setStartTime('08:00');
      setEndTime('10:30');
      setLocation('Phòng Hội đồng Sư phạm (Trực tiếp)');
      setHost(users[0]?.name ? `${users[0].name} - ${users[0].title}` : 'Ban Giám hiệu');
      setSecretary(users[1]?.name ? `${users[1].name} - Thư ký Hội đồng` : 'Thư ký cuộc họp');
      setDescription('');
      setAttendeesText('Toàn thể Cán bộ Quản lý và Giáo viên các khối Mầm, Chồi, Lá');
      setNotes('');
      setStatus('upcoming');
    }
  }, [meetingToEdit, users, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    if (meetingToEdit) {
      updateMeeting({
        ...meetingToEdit,
        title: title.trim(),
        type,
        date,
        startTime,
        endTime,
        location: location.trim(),
        host: host.trim(),
        secretary: secretary.trim(),
        description: description.trim(),
        attendeesText: attendeesText.trim(),
        notes: notes.trim(),
        status,
      });
    } else {
      addMeeting({
        title: title.trim(),
        type,
        date,
        startTime,
        endTime,
        location: location.trim(),
        host: host.trim(),
        secretary: secretary.trim(),
        description: description.trim(),
        attendeesText: attendeesText.trim(),
        notes: notes.trim(),
        status,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-500 px-6 py-4 text-white flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-amber-200">
              Trường Mầm Non Ánh Sao Phường Rạch Dừa
            </div>
            <h2 className="text-lg sm:text-xl font-bold">
              {meetingToEdit ? 'Chỉnh Sửa Cuộc Họp' : 'Tạo Cuộc Họp Mới'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Tên cuộc họp */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Tên cuộc họp <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Họp Hội đồng Sư phạm tháng 10 - Đổi mới phương pháp STEAM"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm font-medium transition-all"
            />
          </div>

          {/* Loại cuộc họp & Trạng thái */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Loại cuộc họp <span className="text-rose-500">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as MeetingType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm bg-white"
              >
                <option value="Họp hội đồng trường">Họp hội đồng trường</option>
                <option value="Họp chuyên môn">Họp chuyên môn</option>
                <option value="Họp tổ chuyên môn">Họp tổ chuyên môn</option>
                <option value="Họp đột xuất">Họp đột xuất</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Trạng thái cuộc họp
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MeetingStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm bg-white"
              >
                <option value="upcoming">Sắp diễn ra</option>
                <option value="ongoing">Đang diễn ra</option>
                <option value="completed">Đã hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>

          {/* Ngày & Giờ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Ngày họp <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm bg-white"
              >
              </input>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Bắt đầu
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Kết thúc
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm bg-white"
              />
            </div>
          </div>

          {/* Địa điểm hoặc hình thức họp */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Địa điểm hoặc hình thức họp
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="VD: Phòng Hội đồng Sư phạm, Phòng Chuyên môn 1, Trực tuyến Google Meet"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm"
            />
          </div>

          {/* Người chủ trì & Người ghi biên bản */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Người chủ trì
              </label>
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="VD: Cô Nguyễn Thị Thu Duyên - Hiệu trưởng"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Người ghi biên bản
              </label>
              <input
                type="text"
                value={secretary}
                onChange={(e) => setSecretary(e.target.value)}
                placeholder="VD: Cô Lê Hoàng Bảo Ngọc - Thư ký"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm"
              />
            </div>
          </div>

          {/* Nội dung / Mục đích cuộc họp */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nội dung / Mục đích cuộc họp
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tóm tắt mục đích cuộc họp, các vấn đề cốt lõi cần giải quyết..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm"
            />
          </div>

          {/* Thành phần tham dự */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Thành phần tham dự
            </label>
            <input
              type="text"
              value={attendeesText}
              onChange={(e) => setAttendeesText(e.target.value)}
              placeholder="VD: Toàn thể giáo viên, BGH, Tổ trưởng chuyên môn..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm"
            />
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Ghi chú thêm
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Giáo viên mang theo máy tính cá nhân để thực hành..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-amber-600/20 transition-all cursor-pointer"
            >
              {meetingToEdit ? 'Lưu thay đổi' : 'Tạo cuộc họp'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
