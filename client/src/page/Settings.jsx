import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import toast from "react-hot-toast";
import {
  Settings as SettingsIcon,
  User,
  Lock,
  ShieldCheck,
  Save,
  KeyRound,
  Palette,
} from "lucide-react";

const Settings = () => {
  const { user, profile, refreshProfile } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  // Bio state
  const [bio, setBio] = useState(profile?.bio || "");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    if (profile?.bio) {
      setBio(profile.bio);
    }
  }, [profile]);

  const handleUpdateBio = async (e) => {
    e.preventDefault();
    try {
      setUpdatingProfile(true);
      await API.put("/api/profile", { bio });
      toast.success("Profile bio updated successfully!");
      refreshProfile();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    try {
      setUpdatingPassword(true);
      await API.post("/api/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to change password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const displayName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ""}`.trim()
    : user?.email?.split("@")[0] || "User";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
          <SettingsIcon className="h-7 w-7 text-yellow-500" /> Settings & Profile
        </h1>
        <p className="text-xs font-semibold text-slate-500 mt-1">
          Manage your personal account details, change passwords, and view system preferences.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card Summary Left */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs text-center space-y-4">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 text-3xl font-black text-slate-950 border-4 border-yellow-200 shadow-lg shadow-yellow-400/20">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">{displayName}</h3>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">{user?.email}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold text-yellow-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                {isAdmin ? "Administrator" : "Employee"}
              </span>
            </div>

            <div className="border-t border-slate-100 pt-4 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-semibold">Department:</span>
                <span className="font-bold text-slate-900">{profile?.department || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-semibold">Position:</span>
                <span className="font-bold text-slate-900">{profile?.position || "Staff"}</span>
              </div>
            </div>
          </div>

          {/* Lemon Theme Preference Box */}
          <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-50 to-yellow-50/50 p-6 shadow-xs space-y-3">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <Palette className="h-4 w-4 text-amber-600" /> Active System Theme
            </h4>
            <div className="flex items-center justify-between rounded-2xl bg-white p-3 border border-amber-200">
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full bg-yellow-400 border border-yellow-500"></span>
                <span className="text-xs font-bold text-slate-900">Lemon Fresh</span>
              </div>
              <span className="text-[10px] font-extrabold uppercase bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-md">
                Default
              </span>
            </div>
          </div>
        </div>

        {/* Right Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Details Form */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <User className="h-5 w-5 text-yellow-500" /> Profile Information
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Update your account bio and personal details.
              </p>
            </div>

            <form onSubmit={handleUpdateBio} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    disabled
                    value={profile?.firstName || "ADMIN"}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-600 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    disabled
                    value={profile?.lastName || ""}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-600 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  About / Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us a little about your role and responsibilities..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-semibold text-slate-800 focus:border-yellow-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="flex items-center gap-2 rounded-xl bg-yellow-400 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-xs hover:bg-yellow-300 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{updatingProfile ? "Saving..." : "Save Profile"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-yellow-500" /> Security & Password
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Ensure your account is using a secure password.
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-semibold focus:border-yellow-400 focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-semibold focus:border-yellow-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-semibold focus:border-yellow-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-yellow-400 shadow-xs hover:bg-slate-800 disabled:opacity-50"
                >
                  <Lock className="h-4 w-4" />
                  <span>{updatingPassword ? "Updating Password..." : "Update Password"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
