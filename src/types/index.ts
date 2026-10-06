export type UserRole = 'admin' | 'member';

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  title: string; // Chức vụ: Hiệu trưởng, Phó Hiệu trưởng, Tổ trưởng, Giáo viên...
  group: string; // Khối/Tổ: Ban Giám hiệu, Khối Nhà trẻ, Khối Mầm, Khối Chồi, Khối Lá, Tổ Văn phòng
  avatar?: string;
  email?: string;
  phone?: string;
}

export type MeetingType =
  | 'Họp hội đồng trường'
  | 'Họp chuyên môn'
  | 'Họp tổ chuyên môn'
  | 'Họp đột xuất'
  | 'Khác';

export type MeetingStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface Meeting {
  id: string;
  title: string;
  type: MeetingType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location: string; // Địa điểm hoặc hình thức họp
  host: string; // Người chủ trì
  secretary: string; // Người ghi biên bản
  description: string; // Nội dung/mục đích cuộc họp
  attendeesText: string; // Thành phần tham dự mô tả
  notes?: string; // Ghi chú
  status: MeetingStatus;
  createdAt: string;
  updatedAt: string;
}

export type AttendanceStatus = 'present' | 'excused' | 'unexcused';

export interface AttendanceRecord {
  id: string;
  meetingId: string;
  userId: string;
  userName: string;
  userTitle: string;
  userGroup: string;
  status: AttendanceStatus;
  checkInTime?: string; // e.g. "08:15:30 15/10/2024"
  checkedBy?: string; // "Tự điểm danh" hoặc tên Quản trị viên
  note?: string;
}

export interface MeetingTask {
  id: string;
  task: string;
  assignee: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed';
  note?: string;
}

export interface MeetingMinute {
  id: string;
  meetingId: string;
  title: string;
  meetingContent: string; // Nội dung cuộc họp
  deployedContent: string; // Các nội dung đã triển khai
  contributions: string; // Ý kiến đóng góp
  conclusions: string; // Kết luận
  tasks: MeetingTask[]; // Nhiệm vụ được giao
  notes?: string; // Ghi chú
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type FeedbackStatus = 'pending' | 'acknowledged' | 'resolved';

export interface MeetingFeedback {
  id: string;
  meetingId: string;
  authorId: string;
  authorName: string;
  authorTitle: string;
  authorGroup: string;
  content: string;
  status: FeedbackStatus;
  adminReply?: string;
  createdAt: string;
  updatedAt?: string;
}

export type AiLinkCategory =
  | 'Ứng dụng họp'
  | 'Ứng dụng chuyên môn'
  | 'Ứng dụng quản lý lớp'
  | 'Ứng dụng giáo dục'
  | 'Công cụ AI'
  | 'Tài liệu'
  | 'Khác';

export type AiLinkStatus = 'active' | 'testing' | 'maintenance' | 'deprecated';

export interface AiStudioLink {
  id: string;
  name: string;
  description: string;
  url: string;
  category: AiLinkCategory;
  creator: string;
  createdAt: string;
  updatedAt: string;
  status: AiLinkStatus;
  notes?: string;
  viewsCount?: number;
}

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}
