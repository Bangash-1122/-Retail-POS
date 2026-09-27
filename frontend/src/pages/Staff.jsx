import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Briefcase, 
  Zap, 
  Edit3, 
  Trash2, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  X, 
  Lock, 
  Mail, 
  Phone, 
  User, 
  ShieldAlert,
  ArrowRightLeft,
  KeyRound
} from 'lucide-react';
import { api } from '../utils/api';
import { usePOS } from '../context/POSContext';

export default function Staff() {
  const { currentUser, setCurrentUser } = usePOS();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'salesman',
    phone: '',
    status: 'active',
    avatar: ''
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers();
      setUsers(res.data || []);
    } catch (err) {
      console.error("Failed to load staff users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'salesman',
      phone: '',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setFormData({
      name: u.name || '',
      email: u.email || '',
      password: '', // leave empty unless changing
      role: u.role || 'salesman',
      phone: u.phone || '',
      status: u.status || 'active',
      avatar: u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMsg("Full name and email address are required.");
      return;
    }

    if (!editingUser && !formData.password.trim()) {
      setErrorMsg("Password is required for new staff member.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingUser) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password; // keep unchanged
        await api.updateUser(editingUser._id, payload);
        
        // If current logged-in user updated their own info, update context
        if (currentUser?._id === editingUser._id) {
          const updatedSelf = { ...currentUser, ...payload };
          setCurrentUser(updatedSelf);
          localStorage.setItem('retail_pos_user', JSON.stringify(updatedSelf));
        }
      } else {
        await api.createUser(formData);
      }
      setIsModalOpen(false);
      await fetchUsers();
    } catch (err) {
      setErrorMsg(err.message || "Failed to save staff member");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (u) => {
    if (u._id === currentUser?._id) {
      alert("You cannot delete your own active account!");
      return;
    }
    const confirmDel = window.confirm(`Are you sure you want to delete staff account "${u.name}" (${u.email})?`);
    if (!confirmDel) return;

    try {
      await api.deleteUser(u._id);
      await fetchUsers();
    } catch (err) {
      alert(err.message || "Failed to delete user");
    }
  };

  const handleQuickSwitchUser = (targetUser) => {
    setCurrentUser(targetUser);
    localStorage.setItem('retail_pos_user', JSON.stringify(targetUser));
  };

  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'owner':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
            👑 Owner
          </span>
        );
      case 'manager':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            💼 Manager
          </span>
        );
      case 'salesman':
      case 'cashier':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            ⚡ Salesman
          </span>
        );
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = !search || 
      u.name.toLowerCase().includes(search.toLowerCase()) || 
      u.email.toLowerCase().includes(search.toLowerCase()) || 
      (u.phone && u.phone.includes(search));
    const matchesRole = selectedRoleFilter === 'All' || u.role?.toLowerCase() === selectedRoleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <Users size={22} />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-2xl text-white tracking-tight">
                Staff & Roles Management
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage accounts, roles, access permissions (Owner, Manager, Salesman) and switch profiles.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchUsers}
            title="Refresh Staff List"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]"
          >
            <UserPlus size={16} />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* Quick 1-Click Role Switcher Demo Cards */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <ArrowRightLeft size={15} className="text-indigo-400" />
            <span>Active Session Switcher (Instant Role Testing)</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Current: <span className="text-indigo-400 font-bold capitalize">{currentUser?.name} ({currentUser?.role})</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Owner Quick Card */}
          <div 
            onClick={() => {
              const u = users.find(x => x.role === 'owner') || {
                _id: 'user_owner_01',
                name: 'Muhammad Ubaid',
                email: 'owner@retailpos.com',
                role: 'owner',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              };
              handleQuickSwitchUser(u);
            }}
            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
              currentUser?.role === 'owner' 
                ? 'bg-amber-500/10 border-amber-500/40 shadow-glow' 
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                👑
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">Store Owner</p>
                <p className="text-[10px] text-slate-500 font-mono">Full Control & Finance</p>
              </div>
            </div>
            {currentUser?.role === 'owner' ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950">Active</span>
            ) : (
              <span className="text-[10px] text-slate-400 hover:text-white">Switch →</span>
            )}
          </div>

          {/* Manager Quick Card */}
          <div 
            onClick={() => {
              const u = users.find(x => x.role === 'manager') || {
                _id: 'user_manager_01',
                name: 'Hamza Tariq',
                email: 'manager@retailpos.com',
                role: 'manager',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
              };
              handleQuickSwitchUser(u);
            }}
            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
              currentUser?.role === 'manager' 
                ? 'bg-indigo-500/10 border-indigo-500/40 shadow-glow' 
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                💼
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">Store Manager</p>
                <p className="text-[10px] text-slate-500 font-mono">Operations & Stock</p>
              </div>
            </div>
            {currentUser?.role === 'manager' ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500 text-white">Active</span>
            ) : (
              <span className="text-[10px] text-slate-400 hover:text-white">Switch →</span>
            )}
          </div>

          {/* Salesman Quick Card */}
          <div 
            onClick={() => {
              const u = users.find(x => x.role === 'salesman' || x.role === 'cashier') || {
                _id: 'user_salesman_01',
                name: 'Ali Raza',
                email: 'salesman@retailpos.com',
                role: 'salesman',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
              };
              handleQuickSwitchUser(u);
            }}
            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
              currentUser?.role === 'salesman' || currentUser?.role === 'cashier'
                ? 'bg-emerald-500/10 border-emerald-500/40 shadow-glow' 
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                ⚡
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">Lead Salesman</p>
                <p className="text-[10px] text-slate-500 font-mono">Counter & Register</p>
              </div>
            </div>
            {currentUser?.role === 'salesman' || currentUser?.role === 'cashier' ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-slate-950">Active</span>
            ) : (
              <span className="text-[10px] text-slate-400 hover:text-white">Switch →</span>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search staff by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Role Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['All', 'owner', 'manager', 'salesman'].map(role => (
            <button
              key={role}
              onClick={() => setSelectedRoleFilter(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
                selectedRoleFilter === role
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F172A] text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">STAFF MEMBER</th>
                <th className="py-3.5 px-4">ROLE</th>
                <th className="py-3.5 px-4">CONTACT</th>
                <th className="py-3.5 px-4">STATUS</th>
                <th className="py-3.5 px-4">PERMISSIONS</th>
                <th className="py-3.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    <RefreshCw size={24} className="animate-spin text-indigo-500 mx-auto mb-2" />
                    <span>Loading staff members...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    <Users size={32} className="text-slate-600 mx-auto mb-2" />
                    <p className="font-semibold text-slate-300">No staff members found</p>
                    <p className="text-xs text-slate-500 mt-0.5">Click 'Add Staff Member' to create a new user account.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrent = currentUser?._id === u._id;
                  return (
                    <tr key={u._id || u.email} className={`hover:bg-slate-800/30 transition-colors ${isCurrent ? 'bg-indigo-950/20' : ''}`}>
                      
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                            alt={u.name}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-700 bg-slate-800"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-200">{u.name}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">
                        {getRoleBadge(u.role)}
                      </td>

                      {/* Contact Phone */}
                      <td className="py-3 px-4 text-slate-300 font-mono">
                        {u.phone || '—'}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.status === 'inactive'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'inactive' ? 'bg-rose-400' : 'bg-emerald-400'}`}></span>
                          {u.status === 'inactive' ? 'Inactive' : 'Active'}
                        </span>
                      </td>

                      {/* Permissions Description */}
                      <td className="py-3 px-4 text-[11px] text-slate-400">
                        {u.role === 'owner' && 'Full store control, financial analytics, user accounts & settings'}
                        {u.role === 'manager' && 'Inward stock, expenses, inventory pricing, sales review'}
                        {(u.role === 'salesman' || u.role === 'cashier') && 'Register billing, barcode scan, thermal printing'}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(u)}
                            title="Edit User Details & Role"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          >
                            <Edit3 size={14} />
                          </button>

                          <button
                            onClick={() => handleDelete(u)}
                            disabled={isCurrent}
                            title={isCurrent ? "Cannot delete own active session" : "Delete User"}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isCurrent
                                ? 'text-slate-600 cursor-not-allowed'
                                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#111827] border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 bg-[#0F172A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-indigo-400" />
                <h3 className="font-display font-bold text-white text-base">
                  {editingUser ? `Edit Staff: ${editingUser.name}` : 'Add New Staff Member'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-2">
                  <ShieldAlert size={16} className="flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Name & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asad Khan"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+92 300 1234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="staff@retailpos.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    {editingUser ? 'New Password (Optional)' : 'Password *'}
                  </label>
                  <input
                    type="password"
                    placeholder={editingUser ? 'Leave blank to keep' : '••••••••'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-slate-400 font-medium mb-1.5">Staff Role & System Permissions</label>
                <div className="grid grid-cols-3 gap-2">
                  
                  {/* Owner */}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'owner' })}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      formData.role === 'owner'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1">👑 Owner</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">All features & Users</div>
                  </button>

                  {/* Manager */}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'manager' })}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      formData.role === 'manager'
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1">💼 Manager</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Stock, Inward, Expenses</div>
                  </button>

                  {/* Salesman */}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'salesman' })}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      formData.role === 'salesman'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1">⚡ Salesman</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Counter & POS checkout</div>
                  </button>

                </div>
              </div>

              {/* Status and Avatar */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Account Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="active">Active (Can log in)</option>
                    <option value="inactive">Inactive (Disabled)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Avatar Image URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-lg flex items-center gap-1.5"
                >
                  {submitting && <RefreshCw size={13} className="animate-spin" />}
                  <span>{editingUser ? 'Save Changes' : 'Create Staff User'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
