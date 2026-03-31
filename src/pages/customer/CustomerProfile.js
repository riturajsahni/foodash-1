import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import Navbar from '../../components/common/Navbar';
import { User, Phone, Mail, MapPin, Lock, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomerProfile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: { street: user?.address?.street || '', city: user?.address?.city || '', state: user?.address?.state || '', pincode: user?.address?.pincode || '' } });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setAddr = (k, v) => setForm(p => ({ ...p, address: { ...p.address, [k]: v } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(form);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const handleChangePw = async () => {
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setChangingPw(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
      toast.success('Password changed!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setChangingPw(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <h1 className="font-display text-2xl font-bold text-gray-900">My Profile</h1>

        {/* Avatar */}
        <div className="card p-5 flex items-center gap-4">
          <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center text-white font-display font-bold text-2xl">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-lg">{user?.name}</h2>
            <p className="text-sm text-gray-400 flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{user?.email}</p>
          </div>
        </div>

        {/* Profile form */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><User className="w-4 h-4 text-brand-500" />Personal Info</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} className="input text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
              <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input value={form.phone} onChange={e => set('phone', e.target.value)} className="input pl-9 text-sm" /></div>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-500" />Delivery Address</h3>
          <div className="space-y-2">
            <input value={form.address.street} onChange={e => setAddr('street', e.target.value)} className="input text-sm" placeholder="Street address" />
            <div className="grid grid-cols-2 gap-2">
              <input value={form.address.city} onChange={e => setAddr('city', e.target.value)} className="input text-sm" placeholder="City" />
              <input value={form.address.pincode} onChange={e => setAddr('pincode', e.target.value)} className="input text-sm" placeholder="Pincode" />
            </div>
            <input value={form.address.state} onChange={e => setAddr('state', e.target.value)} className="input text-sm" placeholder="State" />
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary mt-4 flex items-center gap-2">
            <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        {/* Change password */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Lock className="w-4 h-4 text-brand-500" />Change Password</h3>
          <div className="space-y-2">
            <input type="password" value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} className="input text-sm" placeholder="Current password" />
            <input type="password" value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} className="input text-sm" placeholder="New password" />
            <input type="password" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} className="input text-sm" placeholder="Confirm new password" />
          </div>
          <button onClick={handleChangePw} disabled={changingPw} className="btn-secondary mt-4 flex items-center gap-2">
            <Lock className="w-4 h-4" />{changingPw ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  );
}
