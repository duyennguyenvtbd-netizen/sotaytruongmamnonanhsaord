import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';
import { AdminResetPasswordModal } from './AdminResetPasswordModal';
import {
  Users,
  UserPlus,
  Search,
  ShieldCheck,
  UserCheck,
  Edit2,
  Trash2,
  LogIn,
  Phone,
  Mail,
  Shield,
  X,
  KeyRound,
} from 'lucide-react';

export const UsersListView: React.FC = () => {
  const {
    users,
    currentUser,
    addUser,
    updateUser,
    deleteUser,
    loginAsUser,
    addToast,
  } = useApp();

  const isAdmin = currentUser?.role === 'admin';

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [resetPasswordTargetUser, setResetPasswordTargetUser] = useState<User | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123');
  const [role, setRole] = useState<UserRole>('member');
  const [title, setTitle] = useState('');
  const [group, setGroup] = useState('Tổ Lá');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Groups list
  const GROUPS = [
    'Ban Giám hiệu',
    'Tổ Nhà trẻ',
    'Tổ Mầm',
    'Tổ Chồi',
    'Tổ Lá',
    'Tổ Năng khiếu',
    'Tổ Văn phòng & Y tế',
    'Tổ Cấp dưỡng',
  ];

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.group.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesGroup = groupFilter === 'all' || u.group === groupFilter;

    return matchesSearch && matchesRole && matchesGroup;
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setName('');
    setUsername('');
    setPassword('123');
    setRole('member');
    setTitle('Giáo viên');
    setGroup('Tổ Lá');
    setEmail('');
    setPhone('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setUsername(user.username);
    setPassword(user.password || '123');
    setRole(user.role);
    setTitle(user.title);
    setGroup(user.group);
    setEmail(user.email || '');
    setPhone(user.phone || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) return;

    if (editingUser) {
      updateUser({
        ...editingUser,
        name: name.trim(),
        username: username.trim(),
        password: password.trim() || '123',
        role,
        title: title.trim(),
        group,
        email: email.trim(),
        phone: phone.trim(),
      });
    } else {
      // Check existing username
      if (users.some((u) => u.username.toLowerCase() === username.trim().toLowerCase())) {
        addToast('Tên đăng nhập đã tồn tại trong trường, vui lòng chọn tên khác', 'error');
        return;
      }
      addUser({
        name: name.trim(),
        username: username.trim(),
        password: password.trim() || '123',
        role,
        title: title.trim() || 'Giáo viên',
        group,
        email: email.trim(),
        phone: phone.trim(),
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-amber-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">👥</span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Danh Sách Cán Bộ Quản Lý & Giáo Viên
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quản trị tài khoản, phân quyền QUẢN TRỊ / THÀNH VIÊN và danh bạ tổ chuyên môn MN Ánh Sao Phường Rạch Dừa.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-600/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm thành viên mới</span>
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên giáo viên, chức danh, khối..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:border-amber-500 bg-white"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'all' | UserRole)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white outline-none focus:border-amber-500"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="admin">QUẢN TRỊ (BGH)</option>
            <option value="member">THÀNH VIÊN (Giáo viên)</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white outline-none focus:border-amber-500"
          >
            <option value="all">Tất cả các tổ/khối</option>
            {GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => {
          const isUserAdmin = user.role === 'admin';
          const isCurrent = currentUser?.id === user.id;

          return (
            <div
              key={user.id}
              className={`bg-white rounded-3xl border transition-all p-5 flex flex-col justify-between ${
                isCurrent
                  ? 'border-amber-400 ring-2 ring-amber-200 shadow-md bg-amber-50/20'
                  : 'border-amber-100 hover:border-amber-300 shadow-2xs hover:shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl shadow-inner shrink-0">
                      {user.avatar || (isUserAdmin ? '👩‍💼' : '👩‍🏫')}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
                        {user.name}
                      </h3>
                      <div className="text-xs text-slate-500 font-medium">
                        {user.title}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                      isUserAdmin
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                    }`}
                  >
                    {isUserAdmin ? '👑 QUẢN TRỊ' : '⭐ THÀNH VIÊN'}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Tổ / Khối:</span>
                    <span className="font-semibold text-slate-800">{user.group}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Tài khoản:</span>
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">
                      {user.username}
                    </span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Điện thoại:</span>
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.email && (
                    <div className="flex items-center justify-between truncate">
                      <span className="text-slate-400">Email:</span>
                      <span className="truncate max-w-[160px]">{user.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {isCurrent ? (
                  <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-xl">
                    Đang đăng nhập
                  </span>
                ) : (
                  <button
                    onClick={() => loginAsUser(user)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    title="Chuyển sang tài khoản này để kiểm tra vai trò"
                  >
                    <LogIn className="w-3.5 h-3.5 text-slate-500" />
                    <span>Đăng nhập tài khoản này</span>
                  </button>
                )}

                {isAdmin && (
                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      onClick={() => setResetPasswordTargetUser(user)}
                      className="px-2 py-1 rounded-lg text-amber-800 bg-amber-50 hover:bg-amber-100 font-bold text-[11px] flex items-center gap-1 transition-colors border border-amber-200 cursor-pointer"
                      title="Cấp lại mật khẩu cho thành viên"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                      <span>Cấp lại MK</span>
                    </button>
                    <button
                      onClick={() => handleOpenEdit(user)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                      title="Sửa thông tin"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {!isCurrent && (
                      <button
                        onClick={() => setDeleteTargetId(user.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                        title="Xóa thành viên"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-amber-600 to-orange-500 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-wider font-bold text-amber-200">
                  Quản lý Cán bộ & Giáo viên
                </div>
                <h3 className="text-lg font-bold">
                  {editingUser ? 'Cập Nhật Thông Tin Thành Viên' : 'Thêm Thành Viên Mới'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Cô Lê Thanh Hằng"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên đăng nhập *
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="VD: thanhhang"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mặc định: 123"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vai trò hệ thống *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white outline-none focus:border-amber-500"
                  >
                    <option value="member">THÀNH VIÊN (Giáo viên / Nhân viên)</option>
                    <option value="admin">QUẢN TRỊ (Ban Giám Hiệu)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Chức vụ / Vị trí
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Giáo viên Lớp Chồi 1"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tổ / Khối chuyên môn
                  </label>
                  <select
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white outline-none focus:border-amber-500"
                  >
                    {GROUPS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="VD: 0912 345 678"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email liên hệ
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="VD: giaovien@mnanhsao.edu.vn"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-600/20"
                >
                  {editingUser ? 'Lưu thay đổi' : 'Thêm thành viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Reset Password Modal */}
      <AdminResetPasswordModal
        isOpen={resetPasswordTargetUser !== null}
        user={resetPasswordTargetUser}
        onClose={() => setResetPasswordTargetUser(null)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteTargetId !== null}
        title="Xác nhận xóa tài khoản?"
        message="Hành động này sẽ xóa thành viên khỏi danh bạ nhà trường."
        onConfirm={() => {
          if (deleteTargetId) {
            deleteUser(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
