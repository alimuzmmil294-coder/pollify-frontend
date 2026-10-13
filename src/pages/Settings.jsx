import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config.js";
import ConfirmDialog from "../components/ConfirmDialog";
import PageHeader from "../components/PageHeader";
import PasswordInput from "../components/PasswordInput";
import { Button } from "../components/ui/Button";
import { Card, CardTitle } from "../components/ui/Card";
import { Input, Label, Textarea } from "../components/ui/Field";

const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function Settings() {
  const { user, email, token, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [image, setImage] = useState(null);
  const [fieldError, setFieldError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const authHeaders = { Authorization: `Bearer ${token}` };

  function chooseImage(file) {
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) return setFieldError("Choose a JPEG, PNG, or WebP image.");
    if (file.size > MAX_IMAGE_FILE_SIZE) return setFieldError("Profile image must be 5 MB or smaller.");
    setImage(file);
    setFieldError("");
  }

  async function saveProfile(event) {
    event.preventDefault();
    setFieldError("");
    setProfileSaving(true);
    try {
      const hasImage = Boolean(image);
      const body = hasImage ? new FormData() : JSON.stringify({ name, username, bio });
      if (hasImage) { body.append("name", name); body.append("username", username); body.append("bio", bio); body.append("image", image); }
      const response = await fetch(`${API_BASE_URL}/auth/profile`, { method: "PATCH", headers: hasImage ? authHeaders : { ...authHeaders, "Content-Type": "application/json" }, body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not save profile.");
      updateUser(data.user);
      setImage(null);
      toast.success("Profile saved.");
    } catch (error) { toast.error(error.message || "Could not save profile."); } finally { setProfileSaving(false); }
  }

  async function changePassword(event) {
    event.preventDefault();
    setFieldError("");
    if (!currentPassword || !newPassword || !confirmPassword) return setFieldError("Complete all password fields.");
    if (newPassword.length < 8) return setFieldError("New password must be at least 8 characters.");
    if (newPassword !== confirmPassword) return setFieldError("New passwords do not match.");
    setPasswordSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/password`, { method: "PATCH", headers: { ...authHeaders, "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword, newPassword }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not update password.");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      toast.success("Password updated.");
    } catch (error) { toast.error(error.message || "Could not update password."); } finally { setPasswordSaving(false); }
  }

  async function deleteAccount() {
    setDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/account`, { method: "DELETE", headers: authHeaders });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not delete account.");
      logout();
      navigate("/login", { replace: true });
    } catch (error) { toast.error(error.message || "Could not delete account."); setDeleting(false); setDeleteOpen(false); }
  }

  return <div className="max-w-2xl"><PageHeader title="Settings" description="Manage your profile, security, and account." />
    <Card className="mb-6 flex items-center gap-4"><div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--color-brand)]/30 bg-[var(--color-surface-hover)] font-semibold">{user?.avatar ? <img src={user.avatar} alt="Profile" className="h-full w-full object-cover" /> : email?.charAt(0)?.toUpperCase() || "U"}</div><div><p className="font-semibold">{user?.name}</p><p className="text-sm text-[var(--color-text-faint)]">@{user?.username}</p></div></Card>
    {fieldError && <p role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{fieldError}</p>}
    <form onSubmit={saveProfile}><Card className="mb-6 space-y-5"><CardTitle>Profile</CardTitle><div><Label htmlFor="profile-image">PROFILE IMAGE</Label><Input id="profile-image" type="file" accept="image/jpeg,image/png,image/webp" disabled={profileSaving} onChange={(event) => chooseImage(event.target.files?.[0])} className="mt-2 file:mr-3 file:border-0 file:bg-[var(--color-surface-hover)] file:px-2 file:py-1 file:text-xs file:text-[var(--color-text)]" /><p className="mt-2 text-xs text-[var(--color-text-faint)]">JPEG, PNG, or WebP · maximum 5 MB{image ? ` · selected: ${image.name}` : ""}</p></div><div className="grid gap-5 sm:grid-cols-2"><div><Label htmlFor="name">DISPLAY NAME</Label><Input id="name" required value={name} onChange={(event) => setName(event.target.value)} className="mt-2" /></div><div><Label htmlFor="username">USERNAME</Label><Input id="username" value={username} onChange={(event) => setUsername(event.target.value)} className="mt-2" /></div></div><div><Label htmlFor="bio">BIO</Label><Textarea id="bio" value={bio} maxLength={160} rows={3} onChange={(event) => setBio(event.target.value)} className="mt-2" /></div><div><Label htmlFor="email">EMAIL</Label><Input id="email" value={email} readOnly aria-readonly="true" className="mt-2 opacity-65" /><p className="mt-2 text-xs text-[var(--color-text-faint)]">Email changes require a verified identity flow and are not available.</p></div><Button type="submit" disabled={profileSaving}>{profileSaving ? "Saving..." : "Save profile"}</Button></Card></form>
    <form onSubmit={changePassword}><Card className="mb-6 space-y-4"><CardTitle>Password & security</CardTitle><div><Label htmlFor="current-password">CURRENT PASSWORD</Label><PasswordInput id="current-password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-2" /></div><div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="new-password">NEW PASSWORD</Label><PasswordInput id="new-password" autoComplete="new-password" required minLength="8" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-2" /></div><div><Label htmlFor="confirm-password">CONFIRM PASSWORD</Label><PasswordInput id="confirm-password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-2" /></div></div><Button type="submit" disabled={passwordSaving}>{passwordSaving ? "Updating..." : "Change password"}</Button></Card></form>
    <Card className="border-red-500/30"><CardTitle className="text-red-400">Danger zone</CardTitle><p className="mt-2 text-sm text-[var(--color-text-muted)]">Deleting your account permanently removes your account and related data.</p><div className="mt-4"><ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete your account?" description="This action permanently removes your account and its related data. It cannot be undone." confirmLabel="Delete account" onConfirm={deleteAccount} pending={deleting} trigger={<Button variant="destructive">Delete account</Button>} /></div></Card>
  </div>;
}
