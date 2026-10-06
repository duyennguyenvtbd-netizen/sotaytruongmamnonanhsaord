import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  Meeting,
  AttendanceRecord,
  MeetingMinute,
  MeetingFeedback,
  AiStudioLink,
  ToastMessage,
  AttendanceStatus,
  FeedbackStatus,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_MEETINGS,
  INITIAL_ATTENDANCE,
  INITIAL_MINUTES,
  INITIAL_FEEDBACKS,
  INITIAL_AI_LINKS,
} from '../data/initialData';
import { collection, onSnapshot, doc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  COLLECTIONS,
  saveDocument,
  deleteDocument,
  seedFirestoreCollection,
  testFirestoreHealth,
} from '../firebase/firestoreService';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  meetings: Meeting[];
  attendance: AttendanceRecord[];
  minutes: MeetingMinute[];
  feedbacks: MeetingFeedback[];
  aiLinks: AiStudioLink[];
  activeTab: string;
  selectedMeetingId: string | null;
  toasts: ToastMessage[];

  // Firebase
  firebaseConnected: boolean | null;
  firebasePermissionDenied: boolean;
  firebaseProjectId: string;
  checkFirebaseConnection: () => Promise<boolean>;
  syncAllToFirebase: () => Promise<boolean>;

  // Navigation
  setActiveTab: (tab: string) => void;
  selectMeeting: (meetingId: string | null) => void;

  // Toast
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning', title?: string) => void;
  removeToast: (id: string) => void;

  // Auth
  login: (username: string, password?: string) => boolean;
  loginAsUser: (user: User) => void;
  logout: () => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  changePassword: (oldPassword: string, newPassword: string) => { success: boolean; message: string };
  adminResetPassword: (userId: string, newPassword: string) => void;

  // Meeting
  addMeeting: (meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateMeeting: (meeting: Meeting) => void;
  deleteMeeting: (id: string) => void;

  // Attendance
  updateAttendance: (meetingId: string, userId: string, status: AttendanceStatus, note?: string, checkedBy?: string) => void;
  selfCheckIn: (meetingId: string) => boolean;
  getMeetingAttendance: (meetingId: string) => AttendanceRecord[];

  // Minutes
  addMinute: (minute: Omit<MeetingMinute, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMinute: (minute: MeetingMinute) => void;
  deleteMinute: (id: string) => void;
  getMeetingMinutes: (meetingId: string) => MeetingMinute[];

  // Feedback
  addFeedback: (meetingId: string, content: string) => void;
  updateFeedbackStatus: (feedbackId: string, status: FeedbackStatus, adminReply?: string) => void;
  deleteFeedback: (feedbackId: string) => void;
  getMeetingFeedbacks: (meetingId: string) => MeetingFeedback[];

  // AI Studio Links
  addAiLink: (link: Omit<AiStudioLink, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAiLink: (link: AiStudioLink) => void;
  deleteAiLink: (id: string) => void;
  incrementLinkViews: (id: string) => void;

  // Utilities
  resetToDefaultData: () => void;
  exportDataJson: () => string;
  importDataJson: (jsonStr: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'mn_anhsao_rachdua_users_v2',
  MEETINGS: 'mn_anhsao_rachdua_meetings_v2',
  ATTENDANCE: 'mn_anhsao_rachdua_attendance_v2',
  MINUTES: 'mn_anhsao_rachdua_minutes_v2',
  FEEDBACKS: 'mn_anhsao_rachdua_feedbacks_v2',
  AI_LINKS: 'mn_anhsao_rachdua_ai_links_v2',
  CURRENT_USER: 'mn_anhsao_rachdua_current_user_v2',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load from localStorage or defaults
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null; // Yêu cầu đăng nhập tài khoản và mật khẩu đã cấp trước khi vào sổ tay!
  });

  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MEETINGS);
    return saved ? JSON.parse(saved) : INITIAL_MEETINGS;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [minutes, setMinutes] = useState<MeetingMinute[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MINUTES);
    return saved ? JSON.parse(saved) : INITIAL_MINUTES;
  });

  const [feedbacks, setFeedbacks] = useState<MeetingFeedback[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FEEDBACKS);
    return saved ? JSON.parse(saved) : INITIAL_FEEDBACKS;
  });

  const [aiLinks, setAiLinks] = useState<AiStudioLink[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AI_LINKS);
    return saved ? JSON.parse(saved) : INITIAL_AI_LINKS;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Firebase integration status
  const [firebaseConnected, setFirebaseConnected] = useState<boolean | null>(null);
  const [firebasePermissionDenied, setFirebasePermissionDenied] = useState<boolean>(false);
  const firebaseProjectId = 'sotaytruongmamnonanhsao';

  // Sync state to localStorage for offline cache
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MINUTES, JSON.stringify(minutes));
  }, [minutes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(feedbacks));
  }, [feedbacks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AI_LINKS, JSON.stringify(aiLinks));
  }, [aiLinks]);

  // Toast helper
  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', title?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Realtime Firestore synchronization
  useEffect(() => {
    let unsubUsers: (() => void) | undefined;
    let unsubMeetings: (() => void) | undefined;
    let unsubAttendance: (() => void) | undefined;
    let unsubMinutes: (() => void) | undefined;
    let unsubFeedbacks: (() => void) | undefined;
    let unsubAiLinks: (() => void) | undefined;

    const setupFirestore = async () => {
      try {
        // Seed Firestore if brand new collections
        await seedFirestoreCollection(COLLECTIONS.USERS, INITIAL_USERS);
        await seedFirestoreCollection(COLLECTIONS.MEETINGS, INITIAL_MEETINGS);
        await seedFirestoreCollection(COLLECTIONS.ATTENDANCE, INITIAL_ATTENDANCE);
        await seedFirestoreCollection(COLLECTIONS.MINUTES, INITIAL_MINUTES);
        await seedFirestoreCollection(COLLECTIONS.FEEDBACKS, INITIAL_FEEDBACKS);
        await seedFirestoreCollection(COLLECTIONS.AI_LINKS, INITIAL_AI_LINKS);

        const handleSnapSuccess = () => {
          setFirebaseConnected(true);
          setFirebasePermissionDenied(false);
        };

        const handleSnapError = (colName: string, err: any) => {
          console.warn(`Firestore ${colName} sync notice:`, err?.message || err);
          setFirebaseConnected(false);
          if (
            err?.code === 'permission-denied' ||
            err?.message?.includes('insufficient permissions') ||
            err?.message?.includes('permission')
          ) {
            setFirebasePermissionDenied(true);
          }
        };

        // Listen to Users in Firestore
        unsubUsers = onSnapshot(
          collection(db, COLLECTIONS.USERS),
          (snap) => {
            if (!snap.empty) {
              const list = snap.docs.map((d) => d.data() as User);
              setUsers(list);
            }
            handleSnapSuccess();
          },
          (err) => handleSnapError('users', err)
        );

        // Listen to Meetings in Firestore
        unsubMeetings = onSnapshot(
          collection(db, COLLECTIONS.MEETINGS),
          (snap) => {
            if (!snap.empty) {
              const list = snap.docs.map((d) => d.data() as Meeting);
              setMeetings(list);
            }
            handleSnapSuccess();
          },
          (err) => handleSnapError('meetings', err)
        );

        // Listen to Attendance in Firestore
        unsubAttendance = onSnapshot(
          collection(db, COLLECTIONS.ATTENDANCE),
          (snap) => {
            if (!snap.empty) {
              const list = snap.docs.map((d) => d.data() as AttendanceRecord);
              setAttendance(list);
            }
            handleSnapSuccess();
          },
          (err) => handleSnapError('attendance', err)
        );

        // Listen to Minutes in Firestore
        unsubMinutes = onSnapshot(
          collection(db, COLLECTIONS.MINUTES),
          (snap) => {
            if (!snap.empty) {
              const list = snap.docs.map((d) => d.data() as MeetingMinute);
              setMinutes(list);
            }
            handleSnapSuccess();
          },
          (err) => handleSnapError('minutes', err)
        );

        // Listen to Feedbacks in Firestore
        unsubFeedbacks = onSnapshot(
          collection(db, COLLECTIONS.FEEDBACKS),
          (snap) => {
            if (!snap.empty) {
              const list = snap.docs.map((d) => d.data() as MeetingFeedback);
              setFeedbacks(list);
            }
            handleSnapSuccess();
          },
          (err) => handleSnapError('feedbacks', err)
        );

        // Listen to AI Links in Firestore
        unsubAiLinks = onSnapshot(
          collection(db, COLLECTIONS.AI_LINKS),
          (snap) => {
            if (!snap.empty) {
              const list = snap.docs.map((d) => d.data() as AiStudioLink);
              setAiLinks(list);
            }
            handleSnapSuccess();
          },
          (err) => handleSnapError('aiLinks', err)
        );
      } catch (err: any) {
        console.warn('Firebase init error:', err);
        setFirebaseConnected(false);
        if (err?.code === 'permission-denied' || err?.message?.includes('insufficient permissions')) {
          setFirebasePermissionDenied(true);
        }
      }
    };

    setupFirestore();

    return () => {
      unsubUsers?.();
      unsubMeetings?.();
      unsubAttendance?.();
      unsubMinutes?.();
      unsubFeedbacks?.();
      unsubAiLinks?.();
    };
  }, []);

  // Check connection & rules on demand
  const checkFirebaseConnection = async (): Promise<boolean> => {
    const res = await testFirestoreHealth();
    if (res.allowed) {
      setFirebaseConnected(true);
      setFirebasePermissionDenied(false);
      addToast(
        `Đã kết nối thành công với Firestore (${firebaseProjectId})! Rules đã mở.`,
        'success',
        'Kết nối Firebase'
      );
      return true;
    } else {
      setFirebaseConnected(false);
      if (res.permissionDenied) {
        setFirebasePermissionDenied(true);
        addToast(
          'Rules trên Firebase Console vẫn đang để "allow read, write: if false;". Vui lòng sửa thành "if true;".',
          'warning',
          'Rules đang bị khóa'
        );
      } else {
        addToast(res.message, 'error', 'Lỗi kết nối Firebase');
      }
      return false;
    }
  };

  // Sync all current data to Firestore
  const syncAllToFirebase = async (): Promise<boolean> => {
    try {
      const batch = writeBatch(db);

      users.forEach((u) => batch.set(doc(db, COLLECTIONS.USERS, u.id), u));
      meetings.forEach((m) => batch.set(doc(db, COLLECTIONS.MEETINGS, m.id), m));
      attendance.forEach((a) => batch.set(doc(db, COLLECTIONS.ATTENDANCE, a.id), a));
      minutes.forEach((min) => batch.set(doc(db, COLLECTIONS.MINUTES, min.id), min));
      feedbacks.forEach((f) => batch.set(doc(db, COLLECTIONS.FEEDBACKS, f.id), f));
      aiLinks.forEach((l) => batch.set(doc(db, COLLECTIONS.AI_LINKS, l.id), l));

      await batch.commit();
      setFirebaseConnected(true);
      setFirebasePermissionDenied(false);
      addToast(
        `Đã đồng bộ toàn bộ dữ liệu lên Firebase Firestore (${firebaseProjectId}) thành công!`,
        'success',
        'Đồng bộ Firebase'
      );
      return true;
    } catch (error: any) {
      console.error('Lỗi đồng bộ Firebase:', error);
      const isDenied =
        error?.code === 'permission-denied' ||
        error?.message?.includes('insufficient permissions');
      if (isDenied) {
        setFirebasePermissionDenied(true);
        setFirebaseConnected(false);
        addToast(
          'Rules đang chặn quyền ghi ("allow read, write: if false;"). Vui lòng mở Rules trên Firebase Console!',
          'error',
          'Rules đang khóa'
        );
      } else {
        addToast(
          'Không thể đồng bộ lên Firebase. Vui lòng kiểm tra kết nối mạng hoặc Firestore Rules!',
          'error',
          'Lỗi đồng bộ'
        );
      }
      return false;
    }
  };

  // Auth handlers
  const login = (username: string, password?: string) => {
    if (!username.trim()) {
      addToast('Vui lòng nhập tên tài khoản đăng nhập.', 'warning');
      return false;
    }
    const found = users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );
    if (!found) {
      addToast('Tài khoản không tồn tại trong hệ thống Trường MN Ánh Sao Phường Rạch Dừa.', 'error', 'Đăng nhập thất bại');
      return false;
    }

    const expectedPassword = found.password || '123';
    if (!password || password !== expectedPassword) {
      addToast(
        'Mật khẩu không chính xác! Nếu quên mật khẩu, vui lòng liên hệ Ban Giám Hiệu để được cấp lại mật khẩu.',
        'error',
        'Sai mật khẩu'
      );
      return false;
    }

    setCurrentUser(found);
    addToast(
      `Đăng nhập thành công! Xin chào ${found.name} [${found.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}]`,
      'success',
      'Chào mừng bạn'
    );
    return true;
  };

  const changePassword = (
    oldPassword: string,
    newPassword: string
  ): { success: boolean; message: string } => {
    if (!currentUser) return { success: false, message: 'Chưa đăng nhập' };
    const currentPass = currentUser.password || '123';
    if (oldPassword !== currentPass) {
      addToast('Mật khẩu hiện tại không chính xác! Vui lòng nhập đúng mật khẩu cũ.', 'error');
      return { success: false, message: 'Mật khẩu hiện tại không đúng' };
    }
    if (!newPassword || newPassword.trim().length < 3) {
      addToast('Mật khẩu mới phải có ít nhất 3 ký tự.', 'warning');
      return { success: false, message: 'Mật khẩu mới quá ngắn' };
    }
    if (newPassword.trim() === oldPassword) {
      addToast('Mật khẩu mới không được trùng với mật khẩu hiện tại.', 'warning');
      return { success: false, message: 'Mật khẩu mới trùng mật khẩu cũ' };
    }

    const updatedUser: User = { ...currentUser, password: newPassword.trim() };
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    setCurrentUser(updatedUser);

    // Save to Firestore
    saveDocument(COLLECTIONS.USERS, updatedUser).catch((e) => console.warn('Firestore save user err:', e));

    addToast(
      'Bạn đã đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới cho các lần đăng nhập tiếp theo.',
      'success',
      'Đổi mật khẩu thành công'
    );
    return { success: true, message: 'Đổi mật khẩu thành công' };
  };

  const adminResetPassword = (userId: string, newPassword: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;
    const finalPassword = newPassword.trim() || '123';
    const updated: User = { ...targetUser, password: finalPassword };
    setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    if (currentUser?.id === userId) {
      setCurrentUser(updated);
    }

    // Save to Firestore
    saveDocument(COLLECTIONS.USERS, updated).catch((e) => console.warn('Firestore reset user err:', e));

    addToast(
      `Đã cấp lại mật khẩu cho ${targetUser.name}: "${finalPassword}"`,
      'success',
      'Cấp lại mật khẩu thành công'
    );
  };

  const loginAsUser = (user: User) => {
    setCurrentUser(user);
    addToast(`Đã chuyển sang tài khoản: ${user.name} [${user.role === 'admin' ? 'Quản trị' : 'Thành viên'}]`, 'success');
  };

  const logout = () => {
    setCurrentUser(null);
    addToast('Đã đăng xuất khỏi hệ thống', 'info');
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: 'user-' + Date.now(),
      avatar: userData.avatar || (userData.role === 'admin' ? '👩‍💼' : '👩‍🏫'),
    };
    setUsers((prev) => [...prev, newUser]);
    saveDocument(COLLECTIONS.USERS, newUser).catch((e) => console.warn('Firestore add user err:', e));
    addToast(`Đã thêm thành viên: ${newUser.name}`, 'success');
  };

  const updateUser = (updated: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    if (currentUser?.id === updated.id) {
      setCurrentUser(updated);
    }
    saveDocument(COLLECTIONS.USERS, updated).catch((e) => console.warn('Firestore update user err:', e));
    addToast('Đã cập nhật thông tin thành viên', 'success');
  };

  const deleteUser = (id: string) => {
    if (currentUser?.id === id) {
      addToast('Không thể xóa tài khoản bạn đang đăng nhập', 'error');
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
    deleteDocument(COLLECTIONS.USERS, id).catch((e) => console.warn('Firestore delete user err:', e));
    addToast('Đã xóa thành viên khỏi danh sách', 'info');
  };

  // Navigation
  const selectMeeting = (meetingId: string | null) => {
    setSelectedMeetingId(meetingId);
    if (meetingId) {
      setActiveTab('meeting-detail');
    }
  };

  // Meeting CRUD
  const addMeeting = (data: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = 'meet-' + Date.now();
    const newMeeting: Meeting = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMeetings((prev) => [newMeeting, ...prev]);

    // Save meeting to Firestore
    saveDocument(COLLECTIONS.MEETINGS, newMeeting).catch((e) => console.warn('Firestore add meeting err:', e));

    // Pre-populate initial attendance for this meeting with school staff
    const staffAttendance: AttendanceRecord[] = users.map((u) => ({
      id: `att-${id}-${u.id}`,
      meetingId: id,
      userId: u.id,
      userName: u.name,
      userTitle: u.title,
      userGroup: u.group,
      status: 'unexcused',
    }));
    setAttendance((prev) => [...prev, ...staffAttendance]);

    // Save attendance batch to Firestore
    staffAttendance.forEach((att) => {
      saveDocument(COLLECTIONS.ATTENDANCE, att).catch((e) => console.warn('Firestore add att err:', e));
    });

    addToast(`Đã tạo cuộc họp: "${newMeeting.title}"`, 'success');
    return id;
  };

  const updateMeeting = (updated: Meeting) => {
    const timestamp = new Date().toISOString();
    const meetingWithTs = { ...updated, updatedAt: timestamp };
    setMeetings((prev) =>
      prev.map((m) => (m.id === updated.id ? meetingWithTs : m))
    );
    saveDocument(COLLECTIONS.MEETINGS, meetingWithTs).catch((e) => console.warn('Firestore update meeting err:', e));
    addToast('Đã cập nhật thông tin cuộc họp', 'success');
  };

  const deleteMeeting = (id: string) => {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
    setAttendance((prev) => prev.filter((a) => a.meetingId !== id));
    setMinutes((prev) => prev.filter((m) => m.meetingId !== id));
    setFeedbacks((prev) => prev.filter((f) => f.meetingId !== id));

    deleteDocument(COLLECTIONS.MEETINGS, id).catch((e) => console.warn('Firestore delete meeting err:', e));

    if (selectedMeetingId === id) {
      setSelectedMeetingId(null);
      setActiveTab('meetings');
    }
    addToast('Đã xóa cuộc họp và các dữ liệu liên quan', 'info');
  };

  // Attendance
  const updateAttendance = (
    meetingId: string,
    userId: string,
    status: AttendanceStatus,
    note?: string,
    checkedBy?: string
  ) => {
    const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) +
      ' ' + new Date().toLocaleDateString('vi-VN');

    setAttendance((prev) => {
      const existing = prev.find((a) => a.meetingId === meetingId && a.userId === userId);
      if (existing) {
        const updated = {
          ...existing,
          status,
          checkInTime: status === 'present' ? nowStr : undefined,
          checkedBy: checkedBy || (currentUser?.name || 'Hệ thống'),
          note: note !== undefined ? note : existing.note,
        };
        saveDocument(COLLECTIONS.ATTENDANCE, updated).catch((e) => console.warn('Firestore update att err:', e));
        return prev.map((a) => (a.id === existing.id ? updated : a));
      } else {
        const user = users.find((u) => u.id === userId);
        const newRecord: AttendanceRecord = {
          id: `att-${meetingId}-${userId}-${Date.now()}`,
          meetingId,
          userId,
          userName: user?.name || 'Thành viên',
          userTitle: user?.title || 'Giáo viên',
          userGroup: user?.group || 'Trường',
          status,
          checkInTime: status === 'present' ? nowStr : undefined,
          checkedBy: checkedBy || currentUser?.name || 'Hệ thống',
          note,
        };
        saveDocument(COLLECTIONS.ATTENDANCE, newRecord).catch((e) => console.warn('Firestore add att err:', e));
        return [...prev, newRecord];
      }
    });

    addToast('Đã cập nhật trạng thái điểm danh', 'success');
  };

  const selfCheckIn = (meetingId: string) => {
    if (!currentUser) {
      addToast('Vui lòng đăng nhập để thực hiện điểm danh', 'error');
      return false;
    }
    const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) +
      ' ' + new Date().toLocaleDateString('vi-VN');

    setAttendance((prev) => {
      const existing = prev.find((a) => a.meetingId === meetingId && a.userId === currentUser.id);
      if (existing) {
        const updated = {
          ...existing,
          status: 'present' as AttendanceStatus,
          checkInTime: nowStr,
          checkedBy: 'Tự điểm danh (' + currentUser.name + ')',
        };
        saveDocument(COLLECTIONS.ATTENDANCE, updated).catch((e) => console.warn('Firestore update att err:', e));
        return prev.map((a) => (a.id === existing.id ? updated : a));
      } else {
        const newRecord: AttendanceRecord = {
          id: `att-${meetingId}-${currentUser.id}-${Date.now()}`,
          meetingId,
          userId: currentUser.id,
          userName: currentUser.name,
          userTitle: currentUser.title,
          userGroup: currentUser.group,
          status: 'present',
          checkInTime: nowStr,
          checkedBy: 'Tự điểm danh (' + currentUser.name + ')',
        };
        saveDocument(COLLECTIONS.ATTENDANCE, newRecord).catch((e) => console.warn('Firestore add att err:', e));
        return [...prev, newRecord];
      }
    });

    addToast(`Bạn đã điểm danh thành công lúc ${nowStr}!`, 'success', 'Điểm danh hoàn tất');
    return true;
  };

  const getMeetingAttendance = (meetingId: string) => {
    const meetingRecords = attendance.filter((a) => a.meetingId === meetingId);
    const recordedUserIds = new Set(meetingRecords.map((r) => r.userId));

    const missingUsers: AttendanceRecord[] = users
      .filter((u) => !recordedUserIds.has(u.id))
      .map((u) => ({
        id: `att-virtual-${meetingId}-${u.id}`,
        meetingId,
        userId: u.id,
        userName: u.name,
        userTitle: u.title,
        userGroup: u.group,
        status: 'unexcused',
      }));

    return [...meetingRecords, ...missingUsers];
  };

  // Minutes
  const addMinute = (data: Omit<MeetingMinute, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = 'min-' + Date.now();
    const newMinute: MeetingMinute = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMinutes((prev) => [newMinute, ...prev]);
    saveDocument(COLLECTIONS.MINUTES, newMinute).catch((e) => console.warn('Firestore add minute err:', e));
    addToast('Đã lưu biên bản cuộc họp thành công', 'success');
  };

  const updateMinute = (updated: MeetingMinute) => {
    const updatedMinute = { ...updated, updatedAt: new Date().toISOString() };
    setMinutes((prev) =>
      prev.map((m) => (m.id === updated.id ? updatedMinute : m))
    );
    saveDocument(COLLECTIONS.MINUTES, updatedMinute).catch((e) => console.warn('Firestore update minute err:', e));
    addToast('Đã cập nhật biên bản cuộc họp', 'success');
  };

  const deleteMinute = (id: string) => {
    setMinutes((prev) => prev.filter((m) => m.id !== id));
    deleteDocument(COLLECTIONS.MINUTES, id).catch((e) => console.warn('Firestore delete minute err:', e));
    addToast('Đã xóa biên bản cuộc họp', 'info');
  };

  const getMeetingMinutes = (meetingId: string) => {
    return minutes.filter((m) => m.meetingId === meetingId);
  };

  // Feedback
  const addFeedback = (meetingId: string, content: string) => {
    if (!currentUser) return;
    const newFeedback: MeetingFeedback = {
      id: 'fb-' + Date.now(),
      meetingId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorTitle: currentUser.title,
      authorGroup: currentUser.group,
      content,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setFeedbacks((prev) => [newFeedback, ...prev]);
    saveDocument(COLLECTIONS.FEEDBACKS, newFeedback).catch((e) => console.warn('Firestore add fb err:', e));
    addToast('Ý kiến đóng góp của bạn đã được gửi tới Ban Giám hiệu', 'success');
  };

  const updateFeedbackStatus = (feedbackId: string, status: FeedbackStatus, adminReply?: string) => {
    setFeedbacks((prev) =>
      prev.map((f) => {
        if (f.id === feedbackId) {
          const updated = {
            ...f,
            status,
            adminReply: adminReply !== undefined ? adminReply : f.adminReply,
            updatedAt: new Date().toISOString(),
          };
          saveDocument(COLLECTIONS.FEEDBACKS, updated).catch((e) => console.warn('Firestore update fb err:', e));
          return updated;
        }
        return f;
      })
    );
    addToast('Đã cập nhật trạng thái ý kiến đóng góp', 'success');
  };

  const deleteFeedback = (feedbackId: string) => {
    setFeedbacks((prev) => prev.filter((f) => f.id !== feedbackId));
    deleteDocument(COLLECTIONS.FEEDBACKS, feedbackId).catch((e) => console.warn('Firestore delete fb err:', e));
    addToast('Đã xóa ý kiến đóng góp', 'info');
  };

  const getMeetingFeedbacks = (meetingId: string) => {
    return feedbacks.filter((f) => f.meetingId === meetingId);
  };

  // AI Studio Links
  const addAiLink = (data: Omit<AiStudioLink, 'id' | 'createdAt' | 'updatedAt'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newLink: AiStudioLink = {
      ...data,
      id: 'link-' + Date.now(),
      createdAt: today,
      updatedAt: today,
      viewsCount: 0,
    };
    setAiLinks((prev) => [newLink, ...prev]);
    saveDocument(COLLECTIONS.AI_LINKS, newLink).catch((e) => console.warn('Firestore add link err:', e));
    addToast(`Đã thêm liên kết: "${newLink.name}" vào kho Google AI Studio`, 'success');
  };

  const updateAiLink = (updated: AiStudioLink) => {
    const today = new Date().toISOString().split('T')[0];
    const updatedLink = { ...updated, updatedAt: today };
    setAiLinks((prev) =>
      prev.map((l) => (l.id === updated.id ? updatedLink : l))
    );
    saveDocument(COLLECTIONS.AI_LINKS, updatedLink).catch((e) => console.warn('Firestore update link err:', e));
    addToast('Đã cập nhật thông tin liên kết Google AI Studio', 'success');
  };

  const deleteAiLink = (id: string) => {
    setAiLinks((prev) => prev.filter((l) => l.id !== id));
    deleteDocument(COLLECTIONS.AI_LINKS, id).catch((e) => console.warn('Firestore delete link err:', e));
    addToast('Đã xóa liên kết khỏi kho Google AI Studio', 'info');
  };

  const incrementLinkViews = (id: string) => {
    setAiLinks((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          const updated = { ...l, viewsCount: (l.viewsCount || 0) + 1 };
          saveDocument(COLLECTIONS.AI_LINKS, updated).catch((e) => console.warn('Firestore update link views err:', e));
          return updated;
        }
        return l;
      })
    );
  };

  // Utilities
  const resetToDefaultData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUser(null);
    setMeetings(INITIAL_MEETINGS);
    setAttendance(INITIAL_ATTENDANCE);
    setMinutes(INITIAL_MINUTES);
    setFeedbacks(INITIAL_FEEDBACKS);
    setAiLinks(INITIAL_AI_LINKS);
    localStorage.clear();

    // Re-seed to Firestore
    syncAllToFirebase().catch((e) => console.warn('Firestore sync default err:', e));

    addToast('Đã khôi phục toàn bộ dữ liệu mẫu ban đầu của Trường Mầm non Ánh Sao Phường Rạch Dừa', 'info');
  };

  const exportDataJson = () => {
    const exportObject = {
      exportedAt: new Date().toISOString(),
      school: 'Trường Mầm Non Ánh Sao Phường Rạch Dừa',
      firebaseProjectId,
      users,
      meetings,
      attendance,
      minutes,
      feedbacks,
      aiLinks,
    };
    return JSON.stringify(exportObject, null, 2);
  };

  const importDataJson = (jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.meetings && Array.isArray(data.meetings)) {
        if (data.users) setUsers(data.users);
        if (data.meetings) setMeetings(data.meetings);
        if (data.attendance) setAttendance(data.attendance);
        if (data.minutes) setMinutes(data.minutes);
        if (data.feedbacks) setFeedbacks(data.feedbacks);
        if (data.aiLinks) setAiLinks(data.aiLinks);

        syncAllToFirebase().catch((e) => console.warn('Sync imported to Firestore err:', e));

        addToast('Đã khôi phục dữ liệu từ tệp JSON thành công và đồng bộ Firebase!', 'success');
        return true;
      }
      throw new Error('Định dạng tệp không tương thích');
    } catch {
      addToast('Tệp JSON không hợp lệ hoặc sai cấu trúc', 'error');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        meetings,
        attendance,
        minutes,
        feedbacks,
        aiLinks,
        activeTab,
        selectedMeetingId,
        toasts,
        firebaseConnected,
        firebasePermissionDenied,
        firebaseProjectId,
        checkFirebaseConnection,
        syncAllToFirebase,
        setActiveTab,
        selectMeeting,
        addToast,
        removeToast,
        login,
        loginAsUser,
        logout,
        addUser,
        updateUser,
        deleteUser,
        changePassword,
        adminResetPassword,
        addMeeting,
        updateMeeting,
        deleteMeeting,
        updateAttendance,
        selfCheckIn,
        getMeetingAttendance,
        addMinute,
        updateMinute,
        deleteMinute,
        getMeetingMinutes,
        addFeedback,
        updateFeedbackStatus,
        deleteFeedback,
        getMeetingFeedbacks,
        addAiLink,
        updateAiLink,
        deleteAiLink,
        incrementLinkViews,
        resetToDefaultData,
        exportDataJson,
        importDataJson,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
