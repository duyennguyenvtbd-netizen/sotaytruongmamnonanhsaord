import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import {
  LogIn,
  UserCheck,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  UserPlus,
  Lock,
  User as UserIcon,
  X,
  Eye,
  EyeOff,
  HelpCircle,
  Phone,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  canDismiss?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  canDismiss = true,
}) => {
  const { users, currentUser, login, loginAsUser, addUser } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('123');
  const [regRole, setRegRole] = useState<UserRole>('member');
  const [regTitle, setRegTitle] = useState('Giáo viên');
  const [regGroup, setRegGroup] = useState('Tổ Lá');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    const success = login(username, password);
    if (success && onClose) {
      onClose();
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regUsername.trim()) return;

    addUser({
      name: regName.trim(),
      username: regUsername.trim(),
      password: regPassword || '123',
      role: regRole,
      title: regTitle.trim() || (regRole === 'admin' ? 'Cán bộ Quản lý' : 'Giáo viên'),
      group: regGroup,
      avatar: regRole === 'admin' ? '👩‍💼' : '👩‍🏫',
    });

    login(regUsername.trim(), regPassword || '123');
    if (onClose) onClose();
  };

  const handleFillPreset = (u: User) => {
    setUsername(u.username);
    setPassword(u.password || '123');
  };

  const handleDirectLogin = (u: User) => {
    loginAsUser(u);
    if (onClose) onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-amber-100 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
          {/* Header with Preschool Branding */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 text-white relative">
            {canDismiss && onClose && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl shadow-inner border border-white/30">
                ⭐
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider font-semibold text-amber-100">
                  Trường Mầm Non Ánh Sao Phường Rạch Dừa
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  Sổ Tay Điện Tử Nhà Trường
                </h2>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-amber-100 mt-2 leading-relaxed">
              Thành viên vui lòng đăng nhập bằng tài khoản và mật khẩu đã được nhà trường cấp để sử dụng sổ tay và Kho Google AI Studio.
            </p>
          </div>

          {/* Quick Preset Selector for Demonstration */}
          <div className="p-5 border-b border-slate-100 bg-amber-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Tài khoản mẫu đã cấp cho các khối/tổ:
              </span>
              <span className="text-[11px] text-slate-500">Bấm để điền nhanh</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {users.slice(0, 4).map((u) => {
                const isAdmin = u.role === 'admin';
                const isSelected = username.toLowerCase() === u.username.toLowerCase();
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleFillPreset(u)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all text-xs cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-amber-100 font-bold text-amber-950 shadow-xs ring-1 ring-amber-300'
                        : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/60 text-slate-800'
                    }`}
                  >
                    <span className="text-lg shrink-0">{u.avatar || '👩‍🏫'}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold truncate flex items-center justify-between">
                        <span className="truncate">{u.name}</span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {u.username}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {isAdmin ? '👑 BGH Quản Trị' : '⭐ Giáo viên'} · {u.title}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Switch: Login or Create Account */}
          <div className="p-6">
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl mb-5 text-sm font-semibold">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LogIn className="w-4 h-4" />
                Đăng Nhập Sổ Tay
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Đăng Ký Tài Khoản Mới
              </button>
            </div>

            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tài khoản được cấp <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Nhập tên đăng nhập (VD: admin, phuongmai, thanhvan...)"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm transition-all bg-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Mật khẩu <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-xs text-amber-700 hover:text-amber-900 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Quên mật khẩu?</span>
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu (mặc định: 123)"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm transition-all bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>Mật khẩu khởi tạo ban đầu: <strong>123</strong></span>
                    <span className="text-emerald-700 font-medium">Có thể tự đổi mật khẩu sau khi vào sổ tay</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập vào sổ tay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Họ và tên giáo viên / cán bộ *
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="VD: Cô Lê Thanh Hằng"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tên đăng nhập *
                    </label>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="VD: thanhhang"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mật khẩu khởi tạo
                    </label>
                    <input
                      type="text"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Mặc định: 123"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Vai trò hệ thống *
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm bg-white"
                    >
                      <option value="member">THÀNH VIÊN (Giáo viên / Nhân viên)</option>
                      <option value="admin">QUẢN TRỊ (Ban Giám Hiệu)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Chức danh / Vị trí
                    </label>
                    <input
                      type="text"
                      value={regTitle}
                      onChange={(e) => setRegTitle(e.target.value)}
                      placeholder="VD: Giáo viên Lớp Chồi 1"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tổ / Khối chuyên môn
                    </label>
                    <select
                      value={regGroup}
                      onChange={(e) => setRegGroup(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm bg-white"
                    >
                      <option value="Ban Giám hiệu">Ban Giám hiệu</option>
                      <option value="Tổ Nhà trẻ">Tổ Nhà trẻ (24-36 tháng)</option>
                      <option value="Tổ Mầm">Tổ Mầm (3-4 tuổi)</option>
                      <option value="Tổ Chồi">Tổ Chồi (4-5 tuổi)</option>
                      <option value="Tổ Lá">Tổ Lá (5-6 tuổi)</option>
                      <option value="Tổ Năng khiếu">Tổ Năng khiếu</option>
                      <option value="Tổ Văn phòng & Y tế">Tổ Văn phòng & Y tế</option>
                      <option value="Tổ Cấp dưỡng">Tổ Nuôi dưỡng cấp dưỡng</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Tạo tài khoản & Đăng nhập ngay</span>
                </button>
              </form>
            )}

            {/* Quyền lợi theo vai trò */}
            <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                Chính sách tài khoản & mật khẩu:
              </div>
              <p className="leading-relaxed">
                • <strong>Người dùng:</strong> Có thể đổi mật khẩu theo ý muốn bất cứ lúc nào sau khi đăng nhập.
              </p>
              <p className="leading-relaxed">
                • <strong>Quản trị viên (BGH):</strong> Có quyền cấp lại hoặc đặt lại mật khẩu mới cho người dùng nếu quên mật khẩu.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl">
                  🔑
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Lấy Lại Mật Khẩu
                  </h3>
                  <div className="text-xs text-slate-500">
                    Trường Mầm Non Ánh Sao Phường Rạch Dừa
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-2">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                Hướng dẫn khi quên mật khẩu:
              </div>
              <p className="leading-relaxed">
                Để bảo mật dữ liệu họp của nhà trường, nếu giáo viên hoặc cán bộ quên mật khẩu, vui lòng liên hệ trực tiếp <strong>Ban Giám Hiệu</strong> để được cấp lại mật khẩu ngay trong mục <em>"Quản lý Cán bộ & Giáo viên"</em>.
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="font-bold text-slate-800">
                Thông tin liên hệ Ban Giám Hiệu Phụ Trách:
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Cô Nguyễn Thị Thu Duyên</div>
                  <div className="text-[11px] text-slate-500">Hiệu trưởng - Quản trị hệ thống</div>
                </div>
                <a
                  href="tel:0903123456"
                  className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold text-xs flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  0903 123 456
                </a>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Cô Trần Thị Phương Mai</div>
                  <div className="text-[11px] text-slate-500">Phó Hiệu trưởng Chuyên môn</div>
                </div>
                <a
                  href="tel:0908234567"
                  className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold text-xs flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  0908 234 567
                </a>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              >
                Đã hiểu, quay lại đăng nhập
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
