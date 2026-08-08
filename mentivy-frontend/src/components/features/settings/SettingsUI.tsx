'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  User, 
  Target, 
  Shield, 
  Bell, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Trophy,
  Sparkles,
  BarChart,
  Lock,
  Phone,
  Mail,
  Languages,
  Camera,
  ShieldCheck,
  Download,
  ExternalLink,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { updateProfile } from '@/app/actions/user-actions';
import { useAuthStore } from '@/store/useAuthStore';
import { ChangePasswordModal } from '@/components/features/settings/ChangePasswordModal';
import { AvatarEditModal } from '@/components/features/settings/AvatarEditModal';
import { DeleteAccountModal } from '@/components/features/settings/DeleteAccountModal';

export interface ProfileData {
  id?: string;
  fullName?: string;
  email: string;
  phoneNumber?: string;
  role: string;
  avatarUrl?: string;
  targetExam: string;
  targetYear?: number;
  dailyTimeAvailability: number;
  currentLevel: string;
  preferredLanguage?: string;
}

export default function SettingsUI({ initialData }: { initialData: ProfileData }) {
  const { user: authUser, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'learning' | 'security' | 'notifications' | 'privacy'>('profile');
  const [data, setData] = useState<ProfileData>({
    ...initialData,
    fullName: initialData?.fullName || authUser?.fullName || '',
    phoneNumber: (initialData?.phoneNumber || '').replace(/^\+91\s*/, ''),
    targetYear: initialData?.targetYear || 2026,
    preferredLanguage: initialData?.preferredLanguage || 'English',
    avatarUrl: initialData?.avatarUrl || authUser?.avatarUrl || ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Field validation errors
  const [fieldErrors, setFieldErrors] = useState<{ fullName?: string; phoneNumber?: string }>({});

  const validateInputs = (): boolean => {
    const errors: { fullName?: string; phoneNumber?: string } = {};

    const trimmedName = (data.fullName || '').trim();
    if (!trimmedName) {
      errors.fullName = 'Full name is required.';
    } else if (trimmedName.length < 2) {
      errors.fullName = 'Full name must be at least 2 characters long.';
    } else if (trimmedName.length > 50) {
      errors.fullName = 'Full name cannot exceed 50 characters.';
    } else if (!/^[a-zA-Z][a-zA-Z\s._-]{1,49}$/.test(trimmedName)) {
      errors.fullName = 'Full name must start with a letter and contain only letters, spaces, hyphens, or dots.';
    }

    const rawPhone = (data.phoneNumber || '').trim();
    if (rawPhone) {
      if (!/^[6-9]\d{9}$/.test(rawPhone)) {
        errors.phoneNumber = 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 50);
    setData(prev => ({ ...prev, fullName: value }));
    if (fieldErrors.fullName) {
      setFieldErrors(prev => ({ ...prev, fullName: undefined }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setData(prev => ({ ...prev, phoneNumber: numericOnly }));
    if (fieldErrors.phoneNumber) {
      setFieldErrors(prev => ({ ...prev, phoneNumber: undefined }));
    }
  };

  const handleSave = async () => {
    setMessage(null);
    if (!validateInputs()) {
      return;
    }

    setIsSaving(true);

    const payload = {
      ...data,
      phoneNumber: data.phoneNumber ? `+91 ${data.phoneNumber}` : ''
    };

    const result = await updateProfile(payload);
    if (result.success) {
      setMessage({ type: 'success', text: 'Account settings updated successfully!' });
      if (authUser) {
        updateUser({
          fullName: data.fullName || authUser.fullName,
          avatarUrl: data.avatarUrl || authUser.avatarUrl
        });
      }
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update settings.' });
    }
    setIsSaving(false);
  };

  // Self-serve study data exporter
  const handleExportData = () => {
    const exportPayload = {
      user: {
        email: data.email,
        fullName: data.fullName,
        targetExam: data.targetExam,
        dailyTimeAvailability: data.dailyTimeAvailability,
        currentLevel: data.currentLevel
      },
      exportedAt: new Date().toISOString(),
      platform: 'Mentivy AI Spaced Repetition'
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mentivy_study_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const userInitial = (data.fullName || data.email || 'S').charAt(0).toUpperCase();

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'learning', name: 'Learning Goals', icon: Target },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy & Data', icon: ShieldCheck },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      
      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      {/* Avatar Edit Modal */}
      <AvatarEditModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatarUrl={data.avatarUrl}
        userInitial={userInitial}
        onAvatarUpdated={(newAvatar) => {
          setData(prev => ({ ...prev, avatarUrl: newAvatar }));
          if (authUser) {
            updateUser({ avatarUrl: newAvatar });
          }
        }}
      />

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        userEmail={data.email}
      />

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Account Settings</h2>
        <p className="mt-2 text-slate-500">Manage your personal profile, learning goals, privacy, and account security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold cursor-pointer transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-200' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            
            {message && (
              <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 border ${
                message.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                  : 'bg-red-50 text-red-700 border-red-100'
              }`}>
                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            )}

            {/* TAB 1: PROFILE */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                
                {/* Avatar with Edit Badge */}
                <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center border-2 border-primary-100 shadow-sm text-primary-600 font-black text-2xl overflow-hidden">
                      {data.avatarUrl ? (
                        <img src={data.avatarUrl} alt={data.fullName || 'User'} className="w-full h-full object-cover" />
                      ) : (
                        <span>{userInitial}</span>
                      )}
                    </div>
                    
                    {/* Camera Edit Badge */}
                    <button
                      type="button"
                      onClick={() => setIsAvatarModalOpen(true)}
                      className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white flex items-center justify-center shadow-md border-2 border-white cursor-pointer transition-transform group-hover:scale-110"
                      title="Edit Avatar"
                      aria-label="Edit Profile Avatar"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{data.fullName || 'Student'}</h4>
                    <p className="text-sm text-slate-500">{data.email}</p>
                    <span className="inline-block mt-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-primary-50 text-primary-700 border border-primary-200">
                      {data.role || 'STUDENT'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <span className="text-[11px] font-medium text-slate-400">
                        {(data.fullName || '').length}/50
                      </span>
                    </div>
                    <Input 
                      id="fullName" 
                      value={data.fullName || ''} 
                      onChange={handleNameChange}
                      placeholder="Ravindra Kumar"
                      maxLength={50}
                      className={`bg-slate-50 border-slate-200 rounded-xl text-slate-900 focus:bg-white ${
                        fieldErrors.fullName ? 'border-red-400 focus:ring-red-400' : ''
                      }`}
                    />
                    {fieldErrors.fullName && (
                      <p className="text-xs text-red-500 font-medium">{fieldErrors.fullName}</p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="phoneNumber" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Phone Number
                      </Label>
                      <span className="text-[11px] font-medium text-slate-400">
                        {(data.phoneNumber || '').length}/10
                      </span>
                    </div>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-500 text-sm font-semibold select-none">
                        +91
                      </span>
                      <Input 
                        id="phoneNumber" 
                        value={data.phoneNumber || ''} 
                        onChange={handlePhoneChange}
                        placeholder="9876543210"
                        maxLength={10}
                        className={`rounded-l-none bg-slate-50 border-slate-200 text-slate-900 focus:bg-white ${
                          fieldErrors.phoneNumber ? 'border-red-400 focus:ring-red-400' : ''
                        }`}
                      />
                    </div>
                    {fieldErrors.phoneNumber && (
                      <p className="text-xs text-red-500 font-medium">{fieldErrors.phoneNumber}</p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Email Address
                    </Label>
                    <Input value={data.email} disabled className="bg-slate-100 text-slate-500 border-slate-200 rounded-xl cursor-not-allowed" />
                  </div>

                  {/* Account Role */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Account Role
                    </Label>
                    <Input value={data.role} disabled className="bg-slate-100 text-slate-500 border-slate-200 rounded-xl cursor-not-allowed capitalize" />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: LEARNING GOALS */}
            {activeTab === 'learning' && (
              <div className="space-y-8">
                
                {/* Target Exam Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary-600">
                    <Trophy className="w-5 h-5" />
                    <h4 className="font-bold text-slate-900">Target Exam</h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['SSC CGL', 'UPSC', 'Banking', 'Railway'].map((exam) => (
                      <button
                        key={exam}
                        type="button"
                        onClick={() => setData({ ...data, targetExam: exam })}
                        className={`p-4 rounded-2xl border-2 transition-all text-left cursor-pointer ${
                          data.targetExam === exam 
                            ? 'border-primary-600 bg-primary-50 text-primary-700 ring-2 ring-primary-500/20' 
                            : 'border-slate-100 hover:border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="text-sm font-bold block">{exam}</span>
                        <span className="text-[11px] text-slate-400 mt-0.5 block">Syllabus enabled</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Exam Year */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <label className="block text-sm font-bold text-slate-900">Target Exam Year</label>
                  <div className="flex gap-3">
                    {[2026, 2027, 2028].map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => setData({ ...data, targetYear: year })}
                        className={`flex-1 py-3 rounded-xl border text-sm font-bold cursor-pointer transition-colors ${
                          data.targetYear === year
                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Daily Study Goal */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-sky-600">
                    <Clock className="w-5 h-5" />
                    <h4 className="font-bold text-slate-900">Daily Study Goal</h4>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-6 space-y-4 border border-slate-100">
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-slate-500">Target Duration</span>
                      <span className="text-primary-600 font-extrabold text-base">
                        {data.dailyTimeAvailability} Minutes ({Math.round(data.dailyTimeAvailability / 60 * 10) / 10} hrs)
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="30" 
                      max="480" 
                      step="15"
                      value={data.dailyTimeAvailability}
                      onChange={(e) => setData({ ...data, dailyTimeAvailability: parseInt(e.target.value) })}
                      className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                    <div className="flex justify-between text-xs font-semibold text-slate-400">
                      <span>30 MIN</span>
                      <span>8 HOURS</span>
                    </div>
                  </div>
                </div>

                {/* Preparation Level */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <h4 className="font-bold text-slate-900">Preparation Level</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'BEGINNER', title: 'Beginner', desc: 'Core fundamentals', icon: Sparkles },
                      { id: 'INTERMEDIATE', title: 'Intermediate', desc: 'Weak areas mastery', icon: BarChart },
                      { id: 'ADVANCED', title: 'Advanced', desc: 'Hard questions & mocks', icon: Trophy },
                    ].map((lvl) => (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setData({ ...data, currentLevel: lvl.id })}
                        className={`p-4 rounded-2xl border-2 transition-all text-left cursor-pointer ${
                          data.currentLevel === lvl.id 
                            ? 'border-primary-600 bg-primary-50 text-primary-700 ring-2 ring-primary-500/20' 
                            : 'border-slate-100 hover:border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <lvl.icon className="w-4 h-4 text-primary-600" />
                          <span className="font-bold text-sm">{lvl.title}</span>
                        </div>
                        <p className="text-xs text-slate-400">{lvl.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferred Study Language */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-primary-600">
                    <Languages className="w-5 h-5" />
                    <label className="block text-sm font-bold text-slate-900">Preferred Study Language</label>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setData({ ...data, preferredLanguage: 'English' })}
                      className={`flex-1 py-3 rounded-xl border text-sm font-bold cursor-pointer transition-colors ${
                        data.preferredLanguage === 'English'
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      English
                    </button>

                    <button
                      type="button"
                      disabled
                      className="flex-1 py-3 rounded-xl border border-dashed border-slate-300 bg-slate-100 text-slate-400 text-sm font-bold cursor-not-allowed opacity-75 flex items-center justify-center gap-2 select-none"
                    >
                      <span>Hindi</span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 border border-slate-300">
                        Coming Soon
                      </span>
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: SECURITY */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                  <div className="flex items-center gap-3 text-slate-900">
                    <Lock className="w-5 h-5 text-primary-600" />
                    <h4 className="font-bold text-base">Password & Authentication</h4>
                  </div>
                  <p className="text-sm text-slate-500">
                    To change your account password, verify your current password and create a new secure one.
                  </p>
                  <Button 
                    type="button"
                    variant="secondary" 
                    size="sm"
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="cursor-pointer"
                  >
                    Change Password
                  </Button>
                </div>

                <div className="p-6 border border-red-100 bg-red-50/40 rounded-2xl space-y-4">
                  <h4 className="font-bold text-red-900 text-base">Danger Zone</h4>
                  <p className="text-sm text-red-600/80">
                    Deleting your account will erase all your learning history, Spaced Repetition SRS cards, and analytics permanently.
                  </p>
                  <Button 
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white cursor-pointer" 
                    size="sm"
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 4: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 text-base">Email & Security Alerts</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 cursor-pointer">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Login OTP & Security Notifications</p>
                        <p className="text-xs text-slate-400">Receive 6-digit verification codes for critical security events</p>
                      </div>
                      <input type="checkbox" defaultChecked disabled className="accent-primary-600 rounded cursor-not-allowed" />
                    </label>

                    <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 cursor-pointer">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Daily Study Goal Reminders</p>
                        <p className="text-xs text-slate-400">Get daily reminders to complete your revision targets</p>
                      </div>
                      <input type="checkbox" defaultChecked className="accent-primary-600 rounded cursor-pointer" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: PRIVACY & DATA */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                
                {/* Guarantee Overview */}
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                  <div className="flex items-center gap-3 text-slate-900">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-bold text-base">Privacy &amp; Data Protection Overview</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Your personal information and learning telemetry are protected under strict security standards. Passwords are encrypted with bcrypt hashing, sessions are secured with httpOnly JWT tokens, and your quiz scores are never shared with third-party advertisers.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                      <span className="text-xs font-bold text-slate-900 block">🔒 End-to-End Auth</span>
                      <p className="text-[11px] text-slate-400">HttpOnly cookies protect your active login against cross-site scripting.</p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                      <span className="text-xs font-bold text-slate-900 block">🧠 Spaced Repetition Telemetry</span>
                      <p className="text-[11px] text-slate-400">Test accuracy strictly feeds the Leitner 5-stage revision algorithm.</p>
                    </div>
                  </div>
                </div>

                {/* Self-Serve Data Export */}
                <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Download My Study Data</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Export a copy of your study schedule, accuracy stats, and profile as JSON.</p>
                    </div>
                    <Button 
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleExportData}
                      className="rounded-xl gap-1.5 text-xs font-bold cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export JSON</span>
                    </Button>
                  </div>
                </div>

                {/* Public Policy Link */}
                <div className="p-4 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-primary-700" />
                    <span className="text-xs font-bold text-primary-900">Read Official Privacy Policy Document</span>
                  </div>
                  <Link href="/privacy" target="_blank" className="inline-flex items-center gap-1 text-xs font-bold text-primary-700 hover:text-primary-800">
                    <span>View Document</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

              </div>
            )}

            {/* Save Changes Footer */}
            {activeTab !== 'security' && activeTab !== 'notifications' && activeTab !== 'privacy' && (
              <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end">
                <Button 
                  onClick={handleSave} 
                  isLoading={isSaving}
                  className="gap-2 px-8 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
