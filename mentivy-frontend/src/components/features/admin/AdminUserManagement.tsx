'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Search, ShieldCheck, Shield, GraduationCap, 
  CheckCircle2, XCircle, Activity, Loader2, AlertCircle, 
  ChevronLeft, ChevronRight, UserCog, Sparkles, BookOpen, 
  Plus, Check, Crown
} from 'lucide-react';
import { adminGetUsers, adminUpdateUserRole, adminGetFields } from '@/app/actions/admin-actions';
import { useAuthStore } from '@/store/useAuthStore';
import UserAvatar from '@/components/ui/UserAvatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  assignedFields?: string[];
  avatarUrl?: string;
  phoneNumber?: string;
  isEmailVerified: boolean;
  createdAt: string;
  targetExam: string;
  targetYear: number;
  currentLevel: string;
  attemptCount: number;
}

export default function AdminUserManagement() {
  const { user: currentAuthUser } = useAuthStore();
  const isSuperAdmin = currentAuthUser?.role === 'SUPER_ADMIN';

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Available Fields from DB
  const [availableFields, setAvailableFields] = useState<string[]>([]);

  // Role & Subject Assignment Modal State
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [modalRole, setModalRole] = useState<'STUDENT' | 'ADMIN'>('STUDENT');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [customFieldInput, setCustomFieldInput] = useState('');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [roleModalError, setRoleModalError] = useState('');

  const loadUsers = async (p = page, q = search, r = roleFilter) => {
    setIsLoading(true);
    setError('');
    const res = await adminGetUsers({ page: p, search: q, role: r, limit: 15 });
    if (res.success && res.data) {
      setUsers(res.data.users);
      setTotalUsers(res.data.totalUsers);
      setTotalPages(res.data.totalPages || 1);
      setPage(res.data.page || 1);
    } else {
      setError(res.error || 'Failed to load user accounts.');
    }
    setIsLoading(false);
  };

  const loadFields = async () => {
    const res = await adminGetFields();
    if (res.success && res.data) {
      setAvailableFields(res.data.allFields || res.data.fields || []);
    }
  };

  useEffect(() => {
    loadUsers(1, search, roleFilter);
    if (isSuperAdmin) {
      loadFields();
    }
  }, [roleFilter, isSuperAdmin]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers(1, search, roleFilter);
  };

  const openRoleModal = (user: AdminUser) => {
    setSelectedUser(user);
    setModalRole(user.role === 'ADMIN' ? 'ADMIN' : 'STUDENT');
    setSelectedFields(user.assignedFields || []);
    setCustomFieldInput('');
    setRoleModalError('');
  };

  const toggleFieldSelection = (field: string) => {
    if (selectedFields.includes(field)) {
      setSelectedFields(selectedFields.filter(f => f !== field));
    } else {
      setSelectedFields([...selectedFields, field]);
    }
  };

  const handleAddCustomField = () => {
    const trimmed = customFieldInput.trim();
    if (!trimmed) return;
    if (!availableFields.includes(trimmed)) {
      setAvailableFields([...availableFields, trimmed]);
    }
    if (!selectedFields.includes(trimmed)) {
      setSelectedFields([...selectedFields, trimmed]);
    }
    setCustomFieldInput('');
  };

  const handleRoleChangeConfirm = async () => {
    if (!selectedUser) return;
    setIsUpdatingRole(true);
    setRoleModalError('');

    if (modalRole === 'ADMIN' && selectedFields.length === 0) {
      setRoleModalError('Please assign at least one subject field to this teacher.');
      setIsUpdatingRole(false);
      return;
    }

    const res = await adminUpdateUserRole(selectedUser.id, modalRole, modalRole === 'ADMIN' ? selectedFields : []);
    if (res.success) {
      setUsers(users.map(u => u.id === selectedUser.id ? { 
        ...u, 
        role: modalRole, 
        assignedFields: modalRole === 'ADMIN' ? selectedFields : [] 
      } : u));
      setSelectedUser(null);
    } else {
      setRoleModalError(res.error || 'Failed to update role.');
    }
    setIsUpdatingRole(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar & Search / Filter Controls */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-slate-900">
              {isSuperAdmin ? 'Platform User & Teacher Directory' : 'Student Directory'}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-100">
              {totalUsers} {isSuperAdmin ? 'Accounts' : 'Students'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isSuperAdmin 
              ? 'Manage platform learners, appoint teachers, and assign subject syllabus permissions.'
              : 'View registered students and track their test preparation progress.'}
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </form>

          {/* Role Filter Tabs (Only for Super Admin) */}
          {isSuperAdmin && (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold w-full sm:w-auto justify-center">
              {(['ALL', 'STUDENT', 'ADMIN'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    roleFilter === r
                      ? 'bg-white text-primary-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {r === 'ALL' ? 'All Roles' : r === 'STUDENT' ? 'Students' : 'Teachers'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            <p className="text-sm font-medium">Loading user accounts...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No users found</p>
            <p className="text-xs text-slate-400 mt-1">Try changing your search term or role filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-800 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role & Assigned Fields</th>
                  <th className="px-6 py-4">Target Goal</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Practice Attempts</th>
                  <th className="px-6 py-4">Joined</th>
                  {isSuperAdmin && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                    
                    {/* User info with Avatar */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          src={user.avatarUrl}
                          name={user.fullName || user.email}
                          sizeClassName="w-10 h-10 text-sm"
                        />
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">
                            {user.fullName || 'Student'}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                          {user.phoneNumber && (
                            <p className="text-[11px] text-slate-400 mt-0.5">{user.phoneNumber}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Role & Assigned Fields */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          user.role === 'SUPER_ADMIN'
                            ? 'bg-purple-100 text-purple-800 border border-purple-300 shadow-xs'
                            : user.role === 'ADMIN'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-sky-50 text-sky-700 border border-sky-200'
                        }`}>
                          {user.role === 'SUPER_ADMIN' ? (
                            <>
                              <Crown className="w-3.5 h-3.5 text-purple-600" />
                              <span>Super Admin</span>
                            </>
                          ) : user.role === 'ADMIN' ? (
                            <>
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>Teacher</span>
                            </>
                          ) : (
                            <>
                              <GraduationCap className="w-3.5 h-3.5" />
                              <span>Student</span>
                            </>
                          )}
                        </span>

                        {/* Assigned Fields List */}
                        {user.role === 'ADMIN' && user.assignedFields && user.assignedFields.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {user.assignedFields.map((field, fIdx) => (
                              <span key={fIdx} className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                                {field}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Target Exam Goal */}
                    <td className="px-6 py-4">
                      <div className="text-xs">
                        <p className="font-bold text-slate-800">{user.targetExam}</p>
                        <p className="text-[11px] text-slate-400">{user.targetYear} • {user.currentLevel}</p>
                      </div>
                    </td>

                    {/* Email Verification */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                        user.isEmailVerified ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {user.isEmailVerified ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verified</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Unverified</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* Practice Attempts */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold">
                        <Activity className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{user.attemptCount} tests</span>
                      </div>
                    </td>

                    {/* Registration Date */}
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Actions (Only Super Admin can edit roles) */}
                    {isSuperAdmin && (
                      <td className="px-6 py-4 text-right">
                        {user.role !== 'SUPER_ADMIN' ? (
                          <button
                            type="button"
                            onClick={() => openRoleModal(user)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <UserCog className="w-3.5 h-3.5 text-primary-600" />
                            <span>Manage Role</span>
                          </button>
                        ) : (
                          <span className="text-xs text-purple-600 font-bold italic">Owner</span>
                        )}
                      </td>
                    )}

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!isLoading && totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <p>
              Showing Page <span className="font-bold text-slate-900">{page}</span> of{' '}
              <span className="font-bold text-slate-900">{totalPages}</span> ({totalUsers} total)
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => loadUsers(page - 1)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => loadUsers(page + 1)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SUPER ADMIN ROLE & SUBJECT ASSIGNMENT MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mx-auto mb-2">
                <Crown className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Manage Role & Syllabus Fields</h3>
              <p className="text-xs text-slate-500">
                Configure account privileges for <span className="font-bold text-slate-800">{selectedUser.fullName || selectedUser.email}</span>.
              </p>
            </div>

            {roleModalError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium">
                {roleModalError}
              </div>
            )}

            {/* Role Switcher */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setModalRole('STUDENT')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  modalRole === 'STUDENT'
                    ? 'border-sky-500 bg-sky-50/60 ring-2 ring-sky-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-2">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <p className="font-bold text-slate-900 text-sm">Student</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Learner access to practice and study plans.</p>
              </button>

              <button
                type="button"
                onClick={() => setModalRole('ADMIN')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  modalRole === 'ADMIN'
                    ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2">
                  <BookOpen className="w-4 h-4" />
                </div>
                <p className="font-bold text-slate-900 text-sm">Teacher / Admin</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Create & manage questions in assigned subjects.</p>
              </button>
            </div>

            {/* Subject Field Assignment (Only when Teacher is selected) */}
            {modalRole === 'ADMIN' && (
              <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Assigned Subject Fields:
                  </Label>
                  <span className="text-[11px] text-indigo-600 font-bold">
                    {selectedFields.length} selected
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  This teacher will only be able to view and manage questions/topics in the checked fields.
                </p>

                {/* Checklist */}
                <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                  {availableFields.map((field) => {
                    const isChecked = selectedFields.includes(field);
                    return (
                      <button
                        key={field}
                        type="button"
                        onClick={() => toggleFieldSelection(field)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                          isChecked 
                            ? 'bg-white border-indigo-500 text-indigo-900 shadow-xs' 
                            : 'bg-white/60 border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center text-white text-[10px] ${
                          isChecked ? 'bg-indigo-600' : 'border border-slate-300'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="truncate">{field}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Field */}
                <div className="pt-2 border-t border-slate-200 flex gap-2">
                  <input
                    type="text"
                    placeholder="Add new subject (e.g. Zoology)..."
                    value={customFieldInput}
                    onChange={(e) => setCustomFieldInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomField(); } }}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddCustomField}
                    className="gap-1 text-xs cursor-pointer bg-slate-800 hover:bg-slate-900"
                  >
                    <Plus className="w-3 h-3" /> Add
                  </Button>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="mt-6 flex gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedUser(null)}
                disabled={isUpdatingRole}
                className="flex-1 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleRoleChangeConfirm}
                isLoading={isUpdatingRole}
                className="flex-1 cursor-pointer bg-purple-600 hover:bg-purple-700 text-white"
              >
                Save Permissions
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
