import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, History, Ban, Unlock, Eye, X, Mail, Phone, Pencil, Trash2, Search } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmUserId, setConfirmUserId] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ fullName: '', email: '', phone: '', address: '', role: 'ROLE_CUSTOMER' });
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [historyUser, setHistoryUser] = useState(null);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const USERS_PER_PAGE = 10;
  const HISTORY_PER_PAGE = 5;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      const list = Array.isArray(response.data) ? response.data : [];
      setUsers(list);
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = (id) => setConfirmUserId(id);

  const handleConfirmToggle = async () => {
    if (!confirmUserId) return;
    try {
      const res = await api.put(`/admin/users/${confirmUserId}/toggle-status`);
      setUsers((prev) => prev.map((u) => (u.id === confirmUserId ? res.data : u)));
      toast.success(res.data.isActive ? 'Mở khóa người dùng thành công' : 'Đã khóa người dùng');
    } catch {
      toast.error('Thay đổi trạng thái thất bại');
    } finally {
      setConfirmUserId(null);
    }
  };

  const handleOpenEdit = (user) => {
    setEditUser(user);
    setEditForm({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      role: user.role || 'ROLE_CUSTOMER'
    });
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    try {
      const res = await api.put(`/admin/users/${editUser.id}`, editForm);
      setUsers((prev) => prev.map((u) => (u.id === editUser.id ? res.data : u)));
      if (viewUser?.id === editUser.id) setViewUser(res.data);
      toast.success('Cập nhật thông tin người dùng thành công');
      setEditUser(null);
    } catch {
      toast.error('Cập nhật thông tin người dùng thất bại');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    try {
      await api.delete(`/admin/users/${deleteUserId}`);
      setUsers((prev) => prev.filter((u) => u.id !== deleteUserId));
      if (viewUser?.id === deleteUserId) setViewUser(null);
      toast.success('Đã xóa người dùng thành công');
    } catch {
      toast.error('Xóa người dùng thất bại');
    } finally {
      setDeleteUserId(null);
    }
  };

  const handleViewOrderHistory = async (user) => {
    setHistoryUser(user);
    setHistoryPage(1);
    setHistoryLoading(true);
    try {
      const res = await api.get(`/admin/users/${user.id}/orders`);
      setHistoryOrders(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Không tải được lịch sử đặt hàng');
      setHistoryOrders([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const filteredUsers = (users || []).filter((u) => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return true;
    const name = String(u.fullName || u.username || '').toLowerCase();
    const phone = String(u.phone || '').toLowerCase();
    return name.includes(keyword) || phone.includes(keyword);
  });

  const totalPages = Math.max(1, Math.ceil((filteredUsers.length || 0) / USERS_PER_PAGE));
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);
  const historyTotalPages = Math.max(1, Math.ceil((historyOrders.length || 0) / HISTORY_PER_PAGE));
  const paginatedHistoryOrders = historyOrders.slice((historyPage - 1) * HISTORY_PER_PAGE, historyPage * HISTORY_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm theo tên hoặc số điện thoại..."
            className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Khách hàng</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Thông tin liên hệ</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Vai trò</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-sm border border-emerald-200 uppercase">{(user.username || '?').charAt(0)}</div>
                      <div>
                        <p className="text-slate-900 font-bold text-sm">{user.fullName || user.username}</p>
                        <p className="text-[11px] text-slate-400 font-medium">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><div className="space-y-1"><div className="flex items-center gap-2 text-slate-600 text-[13px] font-medium"><Mail className="w-3.5 h-3.5 text-slate-400" /><span>{user.email || 'N/A'}</span></div><div className="flex items-center gap-2 text-slate-600 text-[13px] font-medium"><Phone className="w-3.5 h-3.5 text-slate-400" /><span>{user.phone || 'N/A'}</span></div></div></td>
                  <td className="px-6 py-4 text-center"><span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tight border ${user.role === 'ROLE_ADMIN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>{user.role?.replace('ROLE_', '')}</span></td>
                  <td className="px-6 py-4 text-center"><span className={`inline-flex items-center gap-1.5 text-xs font-bold ${(user.isActive ?? user.active) ? 'text-emerald-600' : 'text-rose-600'}`}>{(user.isActive ?? user.active) ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}{(user.isActive ?? user.active) ? 'Dang hoat dong' : 'Da khoa'}</span></td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewUser(user)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><Eye className="w-4 h-4" />
                      </button>
                        <button onClick={() => handleOpenEdit(user)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleViewOrderHistory(user)} className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all"><History className="w-4 h-4" /></button>
                        <button onClick={() => handleToggleStatus(user.id)} className={`p-2 transition-all rounded-lg ${(user.isActive ?? user.active) ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}>{(user.isActive ?? user.active) ? <Ban className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}</button>
                      <button onClick={() => setDeleteUserId(user.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filteredUsers.length === 0 && <div className="p-16 text-center text-slate-400 text-sm font-medium">Không có khách hàng nào trong hệ thống.</div>}

        {!loading && filteredUsers.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">Hiển thị {paginatedUsers.length} / {filteredUsers.length} khách hàng</p>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 disabled:opacity-50">Truoc</button>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 disabled:opacity-50">Sau</button>
            </div>
          </div>
        )}
      </div>

      {historyUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setHistoryUser(null)}></div>
          <div className="relative bg-white rounded-[28px] shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800">Lich su dat hang - {historyUser.fullName || historyUser.username}</h3>
              <button onClick={() => setHistoryUser(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {historyLoading ? (
                <p className="text-sm text-slate-500">Đang tải...</p>
              ) : historyOrders.length === 0 ? (
                <p className="text-sm text-slate-500">Người dùng chưa có đơn hàng nào.</p>
              ) : (
                <div className="space-y-3">
                  {paginatedHistoryOrders.map((o) => (
                    <div key={o.id} className="border border-slate-200 rounded-xl p-4">
                      <p className="text-sm font-bold text-slate-800">Đơn #{o.id}</p>
                      <p className="text-xs text-slate-500 mt-1">Ngày đặt: {o.orderDate ? new Date(o.orderDate).toLocaleDateString('vi-VN') : 'N/A'}</p>
                      <p className="text-xs text-slate-500">Trạng thái: {o.status}</p>
                      <p className="text-sm text-emerald-700 font-bold mt-1">Tổng tiền: {(o.totalAmount || 0).toLocaleString()} d</p>
                    </div>
                  ))}
                  <div className="pt-2 flex items-center justify-between">
                    <p className="text-xs text-slate-500">Hiển thị {paginatedHistoryOrders.length} / {historyOrders.length} đơn</p>
                    <div className="flex gap-2">
                      <button onClick={() => setHistoryPage((p) => Math.max(1, p - 1))} disabled={historyPage === 1} className="px-3 py-1 border border-slate-200 rounded text-xs text-slate-600 disabled:opacity-50">Truoc</button>
                      <button onClick={() => setHistoryPage((p) => Math.min(historyTotalPages, p + 1))} disabled={historyPage === historyTotalPages} className="px-3 py-1 border border-slate-200 rounded text-xs text-slate-600 disabled:opacity-50">Sau</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setViewUser(null)}></div>
          <div className="relative bg-white rounded-[28px] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800">Hồ sơ khách hàng</h3>
              <button onClick={() => setViewUser(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 uppercase border border-emerald-200">{(viewUser.username || '?').charAt(0)}</div>
                <div>
                  <p className="text-slate-900 font-bold">{viewUser.fullName || viewUser.username}</p>
                  <p className="text-xs text-slate-400 font-medium">@{viewUser.username}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Email</p>
                  <p className="text-slate-700 font-semibold mt-1">{viewUser.email || 'N/A'}</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Số điện thoại</p>
                  <p className="text-slate-700 font-semibold mt-1">{viewUser.phone || 'N/A'}</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Địa chỉ</p>
                  <p className="text-slate-700 font-semibold mt-1">{viewUser.address || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setEditUser(null)}></div>
          <div className="relative bg-white rounded-[28px] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800">Sửa thông tin khách hàng</h3>
              <button onClick={() => setEditUser(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <input className="w-full border border-slate-200 rounded-lg px-3 py-2" placeholder="Ho ten" value={editForm.fullName} onChange={(e) => setEditForm((p) => ({ ...p, fullName: e.target.value }))} />
              <input className="w-full border border-slate-200 rounded-lg px-3 py-2" placeholder="Email" value={editForm.email} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} />
              <input className="w-full border border-slate-200 rounded-lg px-3 py-2" placeholder="So dien thoai" value={editForm.phone} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} />
              <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2" rows={3} placeholder="Địa chỉ" value={editForm.address} onChange={(e) => setEditForm((p) => ({ ...p, address: e.target.value }))} />
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2" value={editForm.role} onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))}>
                <option value="ROLE_CUSTOMER">CUSTOMER</option>
                <option value="ROLE_ADMIN">ADMIN</option>
              </select>
              <div className="flex justify-end gap-2">
                <button onClick={() => setEditUser(null)} className="px-4 py-2 border border-slate-200 rounded-lg">Hủy</button>
                <button onClick={handleSaveEdit} className="px-4 py-2 bg-emerald-600 text-white rounded-lg">Lưu</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDeleteUserId(null)}></div>
          <div className="relative bg-white rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6 space-y-4"><h3 className="text-lg font-black text-slate-800">Xóa người dùng?</h3>
              <p className="text-sm text-slate-500">Người dùng sẽ bị xóa khỏi cơ sở dữ liệu. Hành động này không thể hoàn tác.</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setDeleteUserId(null)} className="px-4 py-2 border border-slate-200 rounded-lg">Hủy</button>
                <button onClick={handleDeleteUser} className="px-4 py-2 bg-rose-600 text-white rounded-lg">Xóa</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setConfirmUserId(null)}></div>
          <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">{(users.find((u) => u.id === confirmUserId)?.isActive ?? users.find((u) => u.id === confirmUserId)?.active) ? (
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-100">
                <Ban className="w-8 h-8" />
              </div>) : (
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                <Unlock className="w-8 h-8" />
              </div>)}
                <h3 className="text-xl font-black text-slate-800 mb-2">{(users.find((u) => u.id === confirmUserId)?.isActive ?? users.find((u) => u.id === confirmUserId)?.active) ? 'Khóa khách hàng?' : 'Mở khóa khách hàng?'}</h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">{(users.find((u) => u.id === confirmUserId)?.isActive ?? users.find((u) => u.id === confirmUserId)?.active) ? 'Khách hàng này sẽ không thể đăng nhập vào hệ thống sau khi bị khóa.' : 'Khách hàng sẽ có thể truy cập lại hệ thống ngay lập tức.'}</p>
                <div className="flex gap-3">
                  <button onClick={() => setConfirmUserId(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">Hủy</button>
                  <button onClick={handleConfirmToggle} className={`flex-1 py-3 text-white rounded-xl font-bold transition-all shadow-lg ${(users.find((u) => u.id === confirmUserId)?.isActive ?? users.find((u) => u.id === confirmUserId)?.active) ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-100' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'}`}>Xác nhận</button>
                </div>
              </div>
            </div>
          </div>
      )}
    </div>
  );
};

export default UserManagement;
