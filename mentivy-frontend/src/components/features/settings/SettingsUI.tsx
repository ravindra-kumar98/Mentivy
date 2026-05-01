'use client';

import React, { useState } from 'react';
import { 
  User, 
  Target, 
  Shield, 
  Bell, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { updateProfile } from '@/app/actions/user-actions';

interface ProfileData {
  email: string;
  role: string;
  targetExam: string;
  dailyTimeAvailability: number;
  currentLevel: string;
}

export default function SettingsUI({ initialData }: { initialData: ProfileData }) {
  const [activeTab, setActiveTab] = useState('learning');
  const [data, setData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    const result = await updateProfile(data);
    if (result.success) {
      setMessage({ type: 'success', text: 'Settings updated successfully!' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update settings.' });
    }
    setIsSaving(false);
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'learning', name: 'Learning Goals', icon: Target },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
  ];

  return (
    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Account Settings</h2>
        <p className="mt-2 text-slate-500">Manage your profile, learning preferences, and security settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-200' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            
            {message && (
              <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 border ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
              }`}>
                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                  <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center border-4 border-white shadow-sm">
                    <User className="w-8 h-8 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Your Profile</h4>
                    <p className="text-sm text-slate-500">{data.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input value={data.email} disabled className="bg-slate-50 text-slate-500" />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Role</Label>
                    <Input value={data.role} disabled className="bg-slate-50 text-slate-500" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'learning' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-6">
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary-600">
                      <Trophy className="w-5 h-5" />
                      <h4 className="font-bold">Target Exam</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {['SSC CGL', 'UPSC', 'Banking', 'Railway'].map((exam) => (
                        <button
                          key={exam}
                          onClick={() => setData({ ...data, targetExam: exam })}
                          className={`p-4 rounded-2xl border-2 transition-all text-left ${
                            data.targetExam === exam 
                              ? 'border-primary-600 bg-primary-50 ring-4 ring-primary-50' 
                              : 'border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <span className={`text-sm font-bold ${data.targetExam === exam ? 'text-primary-700' : 'text-slate-700'}`}>{exam}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-sky-600">
                      <Clock className="w-5 h-5" />
                      <h4 className="font-bold">Daily Study Goal</h4>
                    </div>
                    <div className="space-y-6">
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-slate-500">Study Duration</span>
                        <span className="text-primary-600">{data.dailyTimeAvailability} Minutes</span>
                      </div>
                      <input 
                        type="range" 
                        min="30" 
                        max="480" 
                        step="15"
                        value={data.dailyTimeAvailability}
                        onChange={(e) => setData({ ...data, dailyTimeAvailability: parseInt(e.target.value) })}
                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
                      />
                      <p className="text-xs text-slate-400 italic">We recommend at least 120 minutes for optimal Spaced Repetition efficiency.</p>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-slate-900 mb-2">Password Management</h4>
                  <p className="text-sm text-slate-500 mb-4">To change your password, please verify your current identity.</p>
                  <Button variant="secondary" size="sm">Change Password</Button>
                </div>
                <div className="p-6 border border-red-100 bg-red-50/30 rounded-2xl">
                  <h4 className="font-bold text-red-900 mb-2">Danger Zone</h4>
                  <p className="text-sm text-red-600/80 mb-4">Deleting your account will erase all your learning history and SRS data permanently.</p>
                  <Button className="bg-red-600 hover:bg-red-700">Delete Account</Button>
                </div>
              </div>
            )}

            <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end">
              <Button 
                onClick={handleSave} 
                isLoading={isSaving}
                className="gap-2 px-8"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
