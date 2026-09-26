"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/Alert";
import { Loading } from "@/components/Loading";
import { getErrorMessage } from "@/lib/api";
import { getMe, getLocalUser } from "@/lib/auth";
import { organizerApi, profileApi } from "@/lib/services";
import type { AuthUser } from "@/types";

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", location: "" });
  const [organizer, setOrganizer] = useState<any>(null);
  const [organizerForm, setOrganizerForm] = useState({
    organizationName: "",
    phone: "",
    address: "",
    websiteUrl: "",
    socialMediaUrl: "",
    payoutMethod: "",
    payoutAccountName: "",
    payoutAccountNumber: "",
  });
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getMe().then((r) => {
      setUser(r.data);
      setForm({ name: r.data.name || "", phone: r.data.phone || "", location: "" });
      if (r.data.role === "ORGANIZER") {
        organizerApi.me().then((x:any) => {
          setOrganizer(x.data);
          setOrganizerForm({
            organizationName: x.data?.organizationName || "",
            phone: x.data?.phone || "",
            address: x.data?.address || "",
            websiteUrl: x.data?.websiteUrl || "",
            socialMediaUrl: x.data?.socialMediaUrl || "",
            payoutMethod: x.data?.payoutMethod || "",
            payoutAccountName: x.data?.payoutAccountName || "",
            payoutAccountNumber: x.data?.payoutAccountNumber || "",
          });
        }).catch(()=>undefined);
      }
    }).catch((e)=>setMessage(getErrorMessage(e)));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response: any = await profileApi.update({
        name: form.name,
        ...(form.phone ? { phone: form.phone } : {}),
        ...(user?.role === "ATTENDEE" && form.location ? { attendee: { location: form.location } } : {}),
      });
      setUser(response.data || user);
      setSuccess("Profile updated.");
    } catch (e) {
      setMessage(getErrorMessage(e));
    }
  }

  async function saveOrganizer(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        organizationName: organizerForm.organizationName,
        phone: organizerForm.phone,
        address: organizerForm.address,
        websiteUrl: organizerForm.websiteUrl || null,
        socialMediaUrl: organizerForm.socialMediaUrl || null,
        payoutMethod: organizerForm.payoutMethod || undefined,
        payoutAccountName: organizerForm.payoutAccountName || undefined,
        payoutAccountNumber: organizerForm.payoutAccountNumber || undefined,
      };
      const response: any = await organizerApi.updateMe(payload);
      setOrganizer(response.data || organizer);
      setSuccess("Organizer profile updated.");
      setMessage("");
    } catch (e) {
      setMessage(getErrorMessage(e));
    }
  }

  async function upload(file?: File) {
    if (!file) return;
    try {
      await profileApi.uploadImage(file);
      const fresh = await getMe();
      setUser(fresh.data);
      setSuccess("Profile image updated.");
    } catch (e) {
      setMessage(getErrorMessage(e));
    }
  }

  if (!user && !message) return <main className="container-page py-12"><Loading /></main>;

  return <main className="container-page py-12">
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <div className="card h-fit">
        <div className="mx-auto grid h-28 w-28 place-items-center overflow-hidden rounded-full bg-slate-100 text-3xl font-black text-slate-400">
          {user?.imageUrl ? <img src={user.imageUrl} alt={user.name} className="h-full w-full object-cover" /> : user?.name?.[0]}
        </div>
        <p className="mt-5 text-center text-xl font-black">{user?.name}</p>
        <p className="mt-1 text-center text-sm text-slate-500">{user?.role?.replace("_"," ")}</p>
        <label className="btn-secondary mt-5 w-full cursor-pointer">
          Change photo
          <input type="file" accept="image/*" className="hidden" onChange={(e)=>upload(e.target.files?.[0])} />
        </label>
      </div>
      <div className="space-y-6">
        <form className="card" onSubmit={save}>
          <h1 className="text-2xl font-black">Profile settings</h1>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label><span className="label">Name</span><input className="input" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} /></label>
            <label><span className="label">Email</span><input className="input bg-slate-50" value={user?.email || ""} disabled /></label>
            <label><span className="label">Phone</span><input className="input" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} /></label>
            {user?.role === "ATTENDEE" && <label><span className="label">Location</span><input className="input" value={form.location} onChange={(e)=>setForm({...form,location:e.target.value})} /></label>}
          </div>
          {message && <div className="mt-4"><Alert type="error">{message}</Alert></div>}
          {success && <div className="mt-4"><Alert type="success">{success}</Alert></div>}
          <button className="btn-primary mt-6">Save profile</button>
        </form>

        {organizer && (
          <form className="card" onSubmit={saveOrganizer}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black">Organizer profile</h2>
              <span className="badge">{organizer.approvalStatus}</span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label><span className="label">Organization name</span><input className="input" value={organizerForm.organizationName} onChange={(e)=>setOrganizerForm({...organizerForm,organizationName:e.target.value})} /></label>
              <label><span className="label">Phone</span><input className="input" value={organizerForm.phone} onChange={(e)=>setOrganizerForm({...organizerForm,phone:e.target.value})} /></label>
              <label className="sm:col-span-2"><span className="label">Address</span><input className="input" value={organizerForm.address} onChange={(e)=>setOrganizerForm({...organizerForm,address:e.target.value})} /></label>
              <label><span className="label">Website</span><input className="input" type="url" value={organizerForm.websiteUrl} onChange={(e)=>setOrganizerForm({...organizerForm,websiteUrl:e.target.value})} /></label>
              <label><span className="label">Social media URL</span><input className="input" type="url" value={organizerForm.socialMediaUrl} onChange={(e)=>setOrganizerForm({...organizerForm,socialMediaUrl:e.target.value})} /></label>
              <label><span className="label">Payout method</span><input className="input" value={organizerForm.payoutMethod} onChange={(e)=>setOrganizerForm({...organizerForm,payoutMethod:e.target.value})} placeholder="BANK / MFS" /></label>
              <label><span className="label">Payout account name</span><input className="input" value={organizerForm.payoutAccountName} onChange={(e)=>setOrganizerForm({...organizerForm,payoutAccountName:e.target.value})} /></label>
              <label className="sm:col-span-2"><span className="label">Payout account number</span><input className="input" value={organizerForm.payoutAccountNumber} onChange={(e)=>setOrganizerForm({...organizerForm,payoutAccountNumber:e.target.value})} /></label>
            </div>
            <button className="btn-secondary mt-5">Save organizer profile</button>
          </form>
        )}
      </div>
    </div>
  </main>;
}
