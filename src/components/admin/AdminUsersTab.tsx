import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { UserAccount } from '../../types';
import {
  Users,
  Shield,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Search,
  RefreshCw,
  Eye,
  ArrowUpRight,
  UserMinus,
  CheckCircle,
  AlertCircle,
  X,
  Info,
  Calendar,
  Mail,
  Lock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const AdminUsersTab: React.FC = () => {
  const {
    users,
    currentUser,
    promoteUserToAdmin,
    demoteAdminToStudent,
    refreshUsers,
    isLoadingUsers,
  } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const isArabic = language === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'student'>('all');
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Confirmation dialog state
  const [confirmModal, setConfirmModal] = useState<{
    user: UserAccount;
    targetRole: 'admin' | 'student';
  } | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);

  // Feedback notifications
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Reset page when search query or filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter]);

  // Memoized filtered users
  const filteredUsers = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return users.filter((u) => {
      const matchesSearch =
        !q ||
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  // Memoized user counts
  const totalAdmins = React.useMemo(() => users.filter((u) => u.role === 'admin').length, [users]);
  const totalStudents = React.useMemo(() => users.filter((u) => u.role === 'student').length, [users]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const handleOpenConfirm = (user: UserAccount, targetRole: 'admin' | 'student') => {
    setActionFeedback(null);
    if (targetRole === 'student' && currentUser?.id === user.id) {
      setActionFeedback({
        type: 'error',
        message: t.admin.selfDemoteForbidden || 'Action interdite : vous ne pouvez pas retirer vos propres droits d\'administrateur.',
      });
      return;
    }
    if (targetRole === 'student' && totalAdmins <= 1) {
      setActionFeedback({
        type: 'error',
        message: isArabic
          ? 'عملية غير مسموح بها: لا يمكن سحب صلاحيات آخر مشرف في المنصة.'
          : 'Action interdite : impossible de rétrograder le dernier administrateur de la plateforme.',
      });
      return;
    }
    setConfirmModal({ user, targetRole });
  };

  const handleExecuteRoleChange = async () => {
    if (!confirmModal) return;
    const { user, targetRole } = confirmModal;

    setIsProcessingAction(true);
    setActionFeedback(null);

    try {
      if (targetRole === 'admin') {
        const res = await promoteUserToAdmin(user.id);
        if (res.success) {
          setActionFeedback({
            type: 'success',
            message: isArabic
              ? `تمت ترقية ${user.full_name} إلى رتبة مشرف بنجاح.`
              : (language === 'en' ? `${user.full_name} was promoted to Administrator successfully.` : `${user.full_name} a été promu Administrateur avec succès.`),
          });
          setConfirmModal(null);
        } else {
          setActionFeedback({
            type: 'error',
            message: res.error || (isArabic ? 'حدث خطأ أثناء الترقية.' : (language === 'en' ? 'Error during promotion.' : 'Erreur lors de la promotion.')),
          });
        }
      } else {
        const res = await demoteAdminToStudent(user.id);
        if (res.success) {
          setActionFeedback({
            type: 'success',
            message: isArabic
              ? `تم سحب صلاحيات الإدارة من ${user.full_name} وإعادته إلى تلميذ.`
              : (language === 'en' ? `${user.full_name} was demoted to Student role.` : `${user.full_name} a été rétrogradé au rôle Étudiant.`),
          });
          setConfirmModal(null);
        } else {
          setActionFeedback({
            type: 'error',
            message: res.error || (isArabic ? 'حدث خطأ أثناء تعديل الرتبة.' : (language === 'en' ? 'Error during demotion.' : 'Erreur lors de la rétrogradation.')),
          });
        }
      }
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err?.message || (isArabic ? 'حدث خطأ غير متوقع.' : (language === 'en' ? 'An unexpected error occurred.' : 'Erreur inattendue.')),
      });
    } finally {
      setIsProcessingAction(false);
      setTimeout(() => {
        setActionFeedback((prev) => (prev?.type === 'success' ? null : prev));
      }, 5000);
    }
  };

  const handleRefresh = async () => {
    setActionFeedback(null);
    await refreshUsers();
    setActionFeedback({
      type: 'success',
      message: isArabic
        ? 'تم تحديث قائمة المستخدمين بنجاح من قاعدة البيانات.'
        : (language === 'en' ? 'User list synchronized with database.' : 'Liste des utilisateurs synchronisée avec la base de données.'),
    });
    setTimeout(() => {
      setActionFeedback((prev) => (prev?.type === 'success' ? null : prev));
    }, 3000);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* 1. Header & Subtitle */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40 text-xs font-bold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{isArabic ? 'إدارة المستخدمين' : (language === 'en' ? 'User Management' : 'User Management')}</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
              {users.length} {isArabic ? 'حساب' : (language === 'en' ? 'accounts' : 'comptes')}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {isArabic ? 'إدارة المستخدمين والصلاحيات' : (language === 'en' ? 'User Management' : 'User Management')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            {isArabic
              ? 'إدارة حسابات التلاميذ والمشرفين والتحكم في أدوار وصلاحيات الوصول.'
              : (language === 'en' ? 'Manage students, administrators, and user roles.' : 'Manage students, administrators, and user roles.')}
          </p>
        </div>

        {/* Refresh button in header */}
        <button
          id="admin-users-refresh-btn"
          onClick={handleRefresh}
          disabled={isLoadingUsers}
          className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer self-start sm:self-center shadow-2xs border border-slate-200/80 dark:border-slate-700 active:scale-95 disabled:opacity-50"
          title={isArabic ? 'تحديث القائمة من قاعدة البيانات' : (language === 'en' ? 'Refresh list' : 'Actualiser la liste')}
        >
          <RefreshCw
            className={`w-4 h-4 text-indigo-600 dark:text-indigo-400 ${
              isLoadingUsers ? 'animate-spin' : ''
            }`}
          />
          <span>{isArabic ? 'تحديث القائمة' : (language === 'en' ? 'Refresh' : 'Refresh')}</span>
        </button>
      </div>

      {/* 2. Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Users */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-xs transition-colors flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isArabic ? 'إجمالي المستخدمين' : (language === 'en' ? 'Total Users' : 'Total Users')}
            </div>
            <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
              {users.length}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              {isArabic ? 'جميع الحسابات المسجلة' : (language === 'en' ? 'All registered accounts' : 'All registered accounts')}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Students */}
        <div className="p-5 rounded-2xl bg-blue-50/40 dark:bg-[#131B2E] border border-blue-200/80 dark:border-blue-900/40 shadow-xs transition-colors flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{isArabic ? 'التلاميذ' : (language === 'en' ? 'Students' : 'Students')}</span>
            </div>
            <div className="text-3xl font-extrabold font-mono text-blue-600 dark:text-blue-400 mt-1">
              {totalStudents}
            </div>
            <div className="text-[11px] text-blue-600/70 dark:text-blue-400/60 mt-1">
              {isArabic ? 'دور: تلميذ البكالوريا' : (language === 'en' ? 'Role: BAC student' : 'Rôle : élève BAC')}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Administrators */}
        <div className="p-5 rounded-2xl bg-amber-50/40 dark:bg-[#131B2E] border border-amber-200/80 dark:border-amber-900/40 shadow-xs transition-colors flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>{isArabic ? 'المشرفون' : (language === 'en' ? 'Administrators' : 'Administrators')}</span>
            </div>
            <div className="text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400 mt-1">
              {totalAdmins}
            </div>
            <div className="text-[11px] text-amber-700/70 dark:text-amber-400/60 mt-1">
              {isArabic ? 'صلاحيات إدارة كاملة' : (language === 'en' ? 'Full admin privileges' : 'Privilèges admin complets')}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionFeedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in slide-in-from-top-1 ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-500/50 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-500/50 text-rose-900 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {actionFeedback.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span className="font-semibold">{actionFeedback.message}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between transition-colors">
        {/* Search input */}
        <div className="relative w-full sm:w-80">
          <Search
            className={`w-4 h-4 text-slate-400 absolute top-3 ${
              isRTL ? 'right-3' : 'left-3'
            }`}
          />
          <input
            id="admin-users-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isArabic
                ? 'بحث بالاسم أو البريد الإلكتروني...'
                : (language === 'en' ? 'Search by name or email...' : 'Search by name or email...')
            }
            className={`w-full py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors ${
              isRTL ? 'pr-9 pl-8 text-right' : 'pl-9 pr-8 text-left'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute top-2.5 ${isRTL ? 'left-2.5' : 'right-2.5'} text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-1.5 self-stretch sm:self-auto overflow-x-auto">
          <button
            id="filter-role-all"
            onClick={() => setRoleFilter('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              roleFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
            }`}
          >
            <span>{isArabic ? 'الكل' : (language === 'en' ? 'All' : 'All')}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                roleFilter === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {users.length}
            </span>
          </button>

          <button
            id="filter-role-student"
            onClick={() => setRoleFilter('student')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              roleFilter === 'student'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{isArabic ? 'التلاميذ' : (language === 'en' ? 'Students' : 'Students')}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                roleFilter === 'student'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {totalStudents}
            </span>
          </button>

          <button
            id="filter-role-admin"
            onClick={() => setRoleFilter('admin')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              roleFilter === 'admin'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{isArabic ? 'المشرفون' : (language === 'en' ? 'Administrators' : 'Administrators')}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                roleFilter === 'admin'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {totalAdmins}
            </span>
          </button>
        </div>
      </div>

      {/* 4. Desktop Users Table (hidden on mobile) */}
      <div className="hidden md:block rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs transition-colors">
        <table className="w-full text-xs text-left" dir={isRTL ? 'rtl' : 'ltr'}>
          <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">{isArabic ? 'المستخدم' : (language === 'en' ? 'Profile' : 'Profile')}</th>
              <th className="py-3.5 px-4">{isArabic ? 'البريد الإلكتروني' : (language === 'en' ? 'Email' : 'Email')}</th>
              <th className="py-3.5 px-4">{isArabic ? 'الدور' : (language === 'en' ? 'Role' : 'Role')}</th>
              <th className="py-3.5 px-4">{isArabic ? 'تاريخ التسجيل' : (language === 'en' ? 'Registration Date' : 'Registration Date')}</th>
              <th className="py-3.5 px-4 text-end">{isArabic ? 'الإجراءات' : (language === 'en' ? 'Actions' : 'Actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-semibold">
                    {isArabic ? 'لم يتم العثور على أي مستخدمين مطابقين.' : (language === 'en' ? 'No users matching your criteria.' : 'No users matching your criteria.')}
                  </p>
                </td>
              </tr>
            ) : (
              paginatedUsers.map((u) => {
                const isSelf = currentUser?.id === u.id;
                const isUserAdmin = u.role === 'admin';

                return (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Profile Picture + Full Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {u.avatar_url ? (
                          <img
                            src={u.avatar_url}
                            alt={u.full_name}
                            loading="lazy"
                            decoding="async"
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-2xs shrink-0">
                            {u.full_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                            <span>{u.full_name}</span>
                            {isSelf && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-extrabold border border-indigo-200 dark:border-indigo-500/40">
                                {isArabic ? 'أنت' : (language === 'en' ? 'You' : 'You')}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {u.stream === 'mathematiques'
                              ? isArabic ? 'شعبة رياضيات' : (language === 'en' ? 'Mathematics Stream' : 'Filière Mathématiques')
                              : isArabic ? 'شعبة علوم تجريبية' : (language === 'en' ? 'Experimental Sciences Stream' : 'Filière Sciences Exp.')}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                      {u.email}
                    </td>

                    {/* Role Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isUserAdmin
                            ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40 shadow-2xs'
                            : 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/40 shadow-2xs'
                        }`}
                      >
                        {isUserAdmin ? (
                          <>
                            <Shield className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            <span>{isArabic ? 'مشرف' : (language === 'en' ? 'Admin' : 'Admin')}</span>
                          </>
                        ) : (
                          <>
                            <GraduationCap className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            <span>{isArabic ? 'تلميذ' : (language === 'en' ? 'Student' : 'Student')}</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* Registration Date */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {u.created_at ? u.created_at.split('T')[0] : '2026-09-01'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-end">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Details button */}
                        <button
                          id={`user-view-${u.id}`}
                          onClick={() => setSelectedUser(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title={isArabic ? 'عرض تفاصيل الحساب' : (language === 'en' ? 'View profile details' : 'View profile details')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Make Admin or Remove Admin */}
                        {!isUserAdmin ? (
                          <button
                            id={`promote-btn-${u.id}`}
                            onClick={() => handleOpenConfirm(u, 'admin')}
                            className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/30 text-amber-800 dark:text-amber-200 border border-amber-300/80 dark:border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span>{isArabic ? 'ترقية إلى مشرف' : (language === 'en' ? 'Promote to Admin' : 'Make Admin')}</span>
                          </button>
                        ) : (
                          <button
                            id={`demote-btn-${u.id}`}
                            disabled={isSelf}
                            onClick={() => handleOpenConfirm(u, 'student')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isSelf
                                ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700/40 cursor-not-allowed'
                                : 'bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/40 shadow-2xs active:scale-95'
                            }`}
                            title={
                              isSelf
                                ? isArabic
                                  ? 'لا يمكنك سحب صلاحيات الإدارة من حسابك الخاص'
                                  : (language === 'en' ? 'You cannot remove your own admin role' : 'You cannot remove your own admin role')
                                : isArabic
                                ? 'إلغاء صفة المشرف'
                                : (language === 'en' ? 'Remove Admin' : 'Remove Admin')
                            }
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                            <span>{isArabic ? 'إلغاء الإدارة' : (language === 'en' ? 'Remove Admin' : 'Remove Admin')}</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 5. Mobile User Cards (rendered instead of table on small screens) */}
      <div className="block md:hidden space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white dark:bg-[#131B2E] rounded-2xl border border-slate-200 dark:border-slate-800">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold">
              {isArabic ? 'لم يتم العثور على أي مستخدمين مطابقين.' : (language === 'en' ? 'No users matching your criteria.' : 'No users matching your criteria.')}
            </p>
          </div>
        ) : (
          paginatedUsers.map((u) => {
            const isSelf = currentUser?.id === u.id;
            const isUserAdmin = u.role === 'admin';

            return (
              <div
                key={u.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors"
              >
                {/* Header: Avatar, Name, Role badge */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {u.avatar_url ? (
                      <img
                        src={u.avatar_url}
                        alt={u.full_name}
                        loading="lazy"
                        decoding="async"
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-2xs shrink-0">
                        {u.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5 text-xs">
                        <span>{u.full_name}</span>
                        {isSelf && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-extrabold border border-indigo-200 dark:border-indigo-500/40">
                            {isArabic ? 'أنت' : (language === 'en' ? 'You' : 'You')}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                        {u.email}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                      isUserAdmin
                        ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40'
                        : 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/40'
                    }`}
                  >
                    {isUserAdmin ? (
                      <>
                        <Shield className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        <span>{isArabic ? 'مشرف' : (language === 'en' ? 'Admin' : 'Admin')}</span>
                      </>
                    ) : (
                      <>
                        <GraduationCap className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        <span>{isArabic ? 'تلميذ' : (language === 'en' ? 'Student' : 'Student')}</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Info row */}
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 truncate">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>{u.created_at ? u.created_at.split('T')[0] : '2026-09-01'}</span>
                  </div>
                  <div className="text-end truncate">
                    {u.stream === 'mathematiques'
                      ? isArabic ? 'رياضيات' : (language === 'en' ? 'Mathematics' : 'Maths')
                      : isArabic ? 'علوم تجريبية' : (language === 'en' ? 'Experimental Sciences' : 'Sciences Exp.')}
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setSelectedUser(u)}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'التفاصيل' : (language === 'en' ? 'Details' : 'Details')}</span>
                  </button>

                  {!isUserAdmin ? (
                    <button
                      onClick={() => handleOpenConfirm(u, 'admin')}
                      className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-300/80 dark:border-amber-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'ترقية إلى مشرف' : (language === 'en' ? 'Promote to Admin' : 'Make Admin')}</span>
                    </button>
                  ) : (
                    <button
                      disabled={isSelf}
                      onClick={() => handleOpenConfirm(u, 'student')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                        isSelf
                          ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700/40 cursor-not-allowed'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/40 shadow-2xs'
                      }`}
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'إلغاء الإدارة' : (language === 'en' ? 'Remove Admin' : 'Remove Admin')}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls Bar */}
      {filteredUsers.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>
              {isArabic
                ? `عرض ${(currentPage - 1) * pageSize + 1} إلى ${Math.min(
                    currentPage * pageSize,
                    filteredUsers.length
                  )} من أصل ${filteredUsers.length} مستخدم`
                : (language === 'en'
                  ? `Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(
                      currentPage * pageSize,
                      filteredUsers.length
                    )} of ${filteredUsers.length} users`
                  : `Affichage de ${(currentPage - 1) * pageSize + 1} à ${Math.min(
                    currentPage * pageSize,
                    filteredUsers.length
                  )} sur ${filteredUsers.length} utilisateurs`)}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <div className="flex items-center gap-1">
              <span>{isArabic ? 'لكل صفحة:' : (language === 'en' ? 'Per page:' : 'Par page :')}</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage <= 1}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Previous Page"
            >
              <ChevronLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </button>

            <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-700 dark:text-slate-200">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Next Page"
            >
              <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {/* 6. Confirmation Dialog Modal (Make Admin / Remove Admin) */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl transition-colors">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    confirmModal.targetRole === 'admin'
                      ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-300'
                      : 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300'
                  }`}
                >
                  {confirmModal.targetRole === 'admin' ? (
                    <Shield className="w-5 h-5" />
                  ) : (
                    <UserMinus className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {confirmModal.targetRole === 'admin'
                      ? isArabic
                        ? 'تأكيد الترقية إلى مشرف'
                        : (language === 'en' ? 'Promote to Admin' : 'Make Admin')
                      : isArabic
                      ? 'تأكيد سحب صلاحيات الإدارة'
                      : (language === 'en' ? 'Remove Admin' : 'Remove Admin')}
                  </h3>
                  <div className="text-[11px] text-slate-400">
                    {confirmModal.targetRole === 'admin'
                      ? isArabic
                        ? 'ترقية رتبة المستخدم'
                        : (language === 'en' ? 'Promote user to administrator' : 'Promote user to administrator')
                      : isArabic
                        ? 'تخفيض الرتبة إلى تلميذ'
                        : (language === 'en' ? 'Demote user to student' : 'Demote user to student')}
                  </div>
                </div>
              </div>
              <button
                disabled={isProcessingAction}
                onClick={() => setConfirmModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body & Question */}
            <div className="space-y-3 text-xs">
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                {confirmModal.targetRole === 'admin'
                  ? isArabic
                    ? 'هل أنت متأكد من رغبتك في ترقية هذا المستخدم إلى مشرف؟'
                    : 'Are you sure you want to make this user an administrator?'
                  : isArabic
                  ? 'هل أنت متأكد من رغبتك في سحب صلاحيات الإدارة من هذا المستخدم؟'
                  : 'Are you sure you want to remove administrator privileges from this user?'}
              </p>

              {/* User preview card inside dialog */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                {confirmModal.user.avatar_url ? (
                  <img
                    src={confirmModal.user.avatar_url}
                    alt={confirmModal.user.full_name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                    {confirmModal.user.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 dark:text-white truncate">
                    {confirmModal.user.full_name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                    {confirmModal.user.email}
                  </div>
                </div>
              </div>

              {/* Explanatory note */}
              <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>
                  {confirmModal.targetRole === 'admin'
                    ? isArabic
                      ? 'سيكتسب هذا الحساب إمكانية نشر وتعديل وحذف الدروس والتمارين ومواضيع البكالوريا وإدارة رتب المستخدمين.'
                      : (language === 'en' ? 'This user will gain full permissions to create and publish lessons, exercises, BAC exams, and manage user roles.' : 'This user will gain full permissions to create and publish lessons, exercises, BAC exams, and manage user roles.')
                    : isArabic
                    ? 'سيتم إلغاء صلاحيات المشرف وسيعود الحساب إلى تلميذ عادي دون إمكانية الوصول إلى لوحة الإدارة.'
                    : (language === 'en' ? 'This user will be reverted to a normal student account and will lose access to the Admin Dashboard.' : 'This user will be reverted to a normal student account and will lose access to the Admin Dashboard.')}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isProcessingAction}
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {isArabic ? 'إلغاء' : (language === 'en' ? 'Cancel' : 'Cancel')}
              </button>

              <button
                type="button"
                id="modal-confirm-role-btn"
                disabled={isProcessingAction}
                onClick={handleExecuteRoleChange}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50 ${
                  confirmModal.targetRole === 'admin'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isProcessingAction && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {confirmModal.targetRole === 'admin'
                    ? isArabic
                      ? 'نعم، ترقية إلى مشرف'
                      : (language === 'en' ? 'Promote to Admin' : 'Make Admin')
                    : isArabic
                    ? 'نعم، سحب الإدارة'
                    : (language === 'en' ? 'Remove Admin' : 'Remove Admin')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{isArabic ? 'بطاقة بيانات المستخدم' : (language === 'en' ? 'User Profile Details' : 'User Profile Details')}</span>
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                {selectedUser.avatar_url ? (
                  <img
                    src={selectedUser.avatar_url}
                    alt={selectedUser.full_name}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold text-white shadow-xs shrink-0">
                    {selectedUser.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {selectedUser.full_name}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px] truncate">
                    {selectedUser.email}
                  </div>
                  <div className="mt-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                        selectedUser.role === 'admin'
                          ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40'
                          : 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/40'
                      }`}
                    >
                      {selectedUser.role === 'admin' ? (
                        <>
                          <Shield className="w-3 h-3" />
                          <span>{isArabic ? 'مشرف' : (language === 'en' ? 'Admin' : 'Admin')}</span>
                        </>
                      ) : (
                        <>
                          <GraduationCap className="w-3 h-3" />
                          <span>{isArabic ? 'تلميذ' : (language === 'en' ? 'Student' : 'Student')}</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">{isArabic ? 'معرف المستخدم (ID)' : (language === 'en' ? 'User ID (UUID)' : 'User ID (UUID)')} :</span>
                  <span className="font-mono text-slate-800 dark:text-slate-300 truncate max-w-[200px]">
                    {selectedUser.id}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">{isArabic ? 'الشعبة' : (language === 'en' ? 'Stream' : 'Stream')} :</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">
                    {selectedUser.stream === 'mathematiques'
                      ? isArabic ? 'رياضيات' : (language === 'en' ? 'Mathematics' : 'Mathématiques')
                      : isArabic ? 'علوم تجريبية' : (language === 'en' ? 'Experimental Sciences' : 'Sciences Exp.')}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">{isArabic ? 'اللغة المفضلة' : (language === 'en' ? 'Preferred Language' : 'Language')} :</span>
                  <span className="text-slate-800 dark:text-slate-200 uppercase font-mono">
                    {selectedUser.language}
                  </span>
                </div>
                {selectedUser.dream && (
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">{isArabic ? 'الحلم المستقبلي' : (language === 'en' ? 'Dream' : 'Dream')} :</span>
                    <span className="text-purple-600 dark:text-purple-300 font-semibold truncate max-w-[200px]">
                      {selectedUser.dream}
                    </span>
                  </div>
                )}
                {selectedUser.goal && (
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">{isArabic ? 'الهدف الأكاديمي' : (language === 'en' ? 'Goal' : 'Goal')} :</span>
                    <span className="text-emerald-600 dark:text-emerald-300 font-semibold truncate max-w-[200px]">
                      {selectedUser.goal}
                    </span>
                  </div>
                )}
                {selectedUser.target_score && (
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">{isArabic ? 'المعدل المستهدف' : (language === 'en' ? 'Target Score' : 'Target Score')} :</span>
                    <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">
                      {selectedUser.target_score}/20
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 dark:text-slate-400">{isArabic ? 'تاريخ الانضمام' : (language === 'en' ? 'Registration Date' : 'Registration Date')} :</span>
                  <span className="font-mono text-slate-800 dark:text-slate-300">
                    {selectedUser.created_at ? selectedUser.created_at.split('T')[0] : '2026-09-01'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                {isArabic ? 'إغلاق' : (language === 'en' ? 'Close' : 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
