import { useState, useRef } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../services/api';
import Loader from '../components/common/Loader';
import Alert from '../components/common/Alert';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { getImageUrl } from '../utils/formatters';

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfileInner />
    </ProtectedRoute>
  );
}

function ProfileInner() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', bio: user?.bio || '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState({ type: '', text: '' });
  const avatarRef = useRef();

  // Stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');

  // Change password
  const [showPwSection, setShowPwSection] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });

  const loadStats = async () => {
    if (stats) return;
    setStatsLoading(true);
    try {
      const { data } = await api.get('/users/stats');
      setStats(data.stats);
    } catch {
      setStatsError('Failed to load stats.');
    } finally {
      setStatsLoading(false);
    }
  };

  useState(() => { loadStats(); }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setRemoveAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!form.name.trim()) { setSaveMsg({ type: 'error', text: 'Name is required.' }); return; }
    setSaving(true); setSaveMsg({ type: '', text: '' });
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      if (form.phone) fd.append('phone', form.phone);
      if (form.bio) fd.append('bio', form.bio);
      if (avatarFile) fd.append('avatar', avatarFile);
      if (removeAvatar) fd.append('removeAvatar', 'true');
      const { data } = await api.put('/users/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(data.user);
      setSaveMsg({ type: 'success', text: 'Profile updated successfully.' });
      setEditing(false);
      setAvatarFile(null);
      setAvatarPreview('');
      setRemoveAvatar(false);
    } catch (e) {
      setSaveMsg({ type: 'error', text: e.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setForm({ name: user?.name || '', phone: user?.phone || '', bio: user?.bio || '' });
    setAvatarFile(null);
    setAvatarPreview('');
    setRemoveAvatar(false);
    setSaveMsg({ type: '', text: '' });
  };

  const validatePw = () => {
    if (!pwForm.currentPassword) return 'Current password is required.';
    if (!pwForm.newPassword || pwForm.newPassword.length < 6) return 'New password must be at least 6 characters.';
    if (pwForm.newPassword !== pwForm.confirmNewPassword) return 'Passwords do not match.';
    return '';
  };

  const handleChangePassword = async () => {
    const err = validatePw();
    if (err) { setPwMsg({ type: 'error', text: err }); return; }
    setPwLoading(true); setPwMsg({ type: '', text: '' });
    try {
      await api.put('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwMsg({ type: 'success', text: 'Password changed successfully.' });
      setPwForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (e) {
      setPwMsg({ type: 'error', text: e.response?.data?.message || 'Failed to change password.' });
    } finally {
      setPwLoading(false);
    }
  };

  const avatarSrc = avatarPreview || (!removeAvatar && user?.avatar ? getImageUrl(user.avatar) : null);
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  const statItems = [
    { label: 'Complaints Filed', key: 'totalComplaints', icon: '📋', color: 'bg-blue-50 text-blue-600' },
    { label: 'Resolved',         key: 'resolvedComplaints', icon: '✅', color: 'bg-green-50 text-green-600' },
    { label: 'Pickups',          key: 'totalPickups',  icon: '♻️', color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Eco Points',       key: 'ecoPoints',     icon: '🌿', color: 'bg-emerald-50 text-emerald-600' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 font-display mb-8">My Profile</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-start gap-5 mb-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-green-100 flex items-center justify-center ring-4 ring-white shadow">
              {avatarSrc ? (
                <img src={avatarSrc} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-green-600">{initials}</span>
              )}
            </div>
            {editing && (
              <>
                <button
                  onClick={() => avatarRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center text-sm shadow transition-colors"
                  title="Change avatar"
                >
                  ✎
                </button>
                {avatarSrc && (
                  <button
                    onClick={() => {
                      setAvatarFile(null);
                      setAvatarPreview('');
                      setRemoveAvatar(true);
                    }}
                    className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm shadow transition-colors"
                    title="Remove avatar"
                  >
                    ×
                  </button>
                )}
                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </>
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500 text-sm mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                {user?.role === 'admin' ? 'Admin' : 'User'}
              </span>
              {user?.isVerified && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">Verified</span>
              )}
            </div>
          </div>

          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Edit Form */}
        {editing ? (
          <div className="space-y-4 border-t border-gray-100 pt-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="A short bio about yourself..."
              />
            </div>

            {saveMsg.text && <Alert type={saveMsg.type} message={saveMsg.text} />}

            <div className="flex gap-3">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-5 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="border-t border-gray-100 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {user?.phone && (
              <div><span className="text-gray-500">Phone: </span><span className="text-gray-900">{user.phone}</span></div>
            )}
            {user?.bio && (
              <div className="sm:col-span-2"><span className="text-gray-500">Bio: </span><span className="text-gray-900">{user.bio}</span></div>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Activity Stats</h2>
        {statsLoading ? <Loader /> : statsError ? <Alert type="error" message={statsError} /> : stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {statItems.map(({ label, key, icon, color }) => (
              <div key={key} className={`rounded-xl p-4 ${color.split(' ')[0]}`}>
                <div className="text-2xl mb-1">{icon}</div>
                <p className={`text-2xl font-bold ${color.split(' ')[1]}`}>{stats[key] ?? 0}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <button
          onClick={() => setShowPwSection(s => !s)}
          className="w-full flex items-center justify-between text-left"
        >
          <div>
            <h2 className="font-semibold text-gray-900">Change Password</h2>
            <p className="text-sm text-gray-500 mt-0.5">Update your account password</p>
          </div>
          <span className={`text-gray-400 text-xl transition-transform ${showPwSection ? 'rotate-180' : ''}`}>
            ⌄
          </span>
        </button>

        {showPwSection && (
          <div className="mt-5 pt-5 border-t border-gray-100 space-y-4">
            {[
              { label: 'Current Password', key: 'currentPassword' },
              { label: 'New Password',     key: 'newPassword'     },
              { label: 'Confirm New Password', key: 'confirmNewPassword' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="password"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={pwForm[key]}
                  onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                  autoComplete="new-password"
                />
              </div>
            ))}

            {pwMsg.text && <Alert type={pwMsg.type} message={pwMsg.text} />}

            <button
              onClick={handleChangePassword}
              disabled={pwLoading}
              className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {pwLoading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}