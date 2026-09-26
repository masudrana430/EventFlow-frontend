"use client";

import { useState } from "react";
import { Alert } from "@/components/Alert";
import { getErrorMessage } from "@/lib/api";
import { getLocalUser, logoutLocal } from "@/lib/auth";
import { authApi } from "@/lib/services";

export default function SecurityPage() {
  const user = typeof window !== "undefined" ? getLocalUser() : null;
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [setPassword, setSetPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");

  async function change(e: React.FormEvent) {
    e.preventDefault();
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setSuccess("Password changed successfully.");
      setMessage("");
      setCurrentPassword("");
      setNewPassword("");
    } catch (e) {
      setMessage(getErrorMessage(e));
      setSuccess("");
    }
  }

  async function createPassword(e: React.FormEvent) {
    e.preventDefault();
    try {
      await authApi.setPassword(setPassword);
      setSuccess("Password created for your Google account.");
      setMessage("");
      setSetPassword("");
    } catch (e) {
      setMessage(getErrorMessage(e));
    }
  }

  async function logoutEverywhere() {
    try {
      await authApi.logoutAll();
    } finally {
      logoutLocal();
      location.href = "/login";
    }
  }

  return (
    <div>
      <h1 className="page-title">Security</h1>
      <p className="mt-2 text-slate-500">Manage your EventFlow password and active sessions.</p>
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <form onSubmit={change} className="card">
          <h2 className="text-xl font-black">{user?.mustChangePassword ? "Set a permanent password" : "Change password"}</h2>
          <div className="mt-5 space-y-4">
            <label><span className="label">Current password</span><input className="input" type="password" value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} required /></label>
            <label><span className="label">New password</span><input className="input" type="password" minLength={8} value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} required /></label>
          </div>
          <button className="btn-primary mt-5">Update password</button>
        </form>

        <div className="space-y-6">
          <form onSubmit={createPassword} className="card">
            <h2 className="text-xl font-black">Google account password</h2>
            <p className="mt-2 text-sm text-slate-500">If your account was created with Google and has no password, create one here.</p>
            <input className="input mt-5" type="password" minLength={8} value={setPassword} onChange={(e)=>setSetPassword(e.target.value)} placeholder="New password" />
            <button className="btn-secondary mt-4">Set password</button>
          </form>
          <div className="card">
            <h2 className="text-xl font-black">Active sessions</h2>
            <p className="mt-2 text-sm text-slate-500">Sign out every EventFlow session associated with this account.</p>
            <button className="btn-danger mt-5" onClick={logoutEverywhere}>Logout all sessions</button>
          </div>
        </div>
      </div>
      {message && <div className="mt-5"><Alert type="error">{message}</Alert></div>}
      {success && <div className="mt-5"><Alert type="success">{success}</Alert></div>}
    </div>
  );
}
