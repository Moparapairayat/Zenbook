import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { useDarkMode } from "@/hooks/useDarkMode";
import useNotificationSound from "@/hooks/useNotificationSound";
import useWebNotifications from "@/hooks/useWebNotifications";
import { ArrowLeft, Bell, Globe, HelpCircle, Palette, Shield, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AppPageShell from "@/components/AppPageShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const sections = [
  { id: "account", label: "Account", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy & Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "language", label: "Language & Region", icon: Globe },
  { id: "help", label: "Help & Support", icon: HelpCircle },
] as const;

type SectionId = (typeof sections)[number]["id"];

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile } = useCurrentProfile();
  const { isDark, toggle: toggleDark } = useDarkMode();
  const { setEnabled: setSoundEnabled, isEnabled: isSoundEnabled } = useNotificationSound();
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const { permission, requestPermission, isSupported } = useWebNotifications();
  const [activeSection, setActiveSection] = useState<SectionId>("account");

  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, bio })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Failed to save profile");
    } else {
      toast.success("Profile updated");
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "account":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email || ""} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Your email cannot be changed here</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell people about yourself"
                  rows={3}
                />
              </div>
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-destructive mb-2">Danger Zone</h4>
                <Button variant="destructive" onClick={signOut}>
                  Log Out
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "notifications":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Control how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notification Sounds</Label>
                  <p className="text-sm text-muted-foreground">Play a sound when you receive notifications</p>
                </div>
                <Switch
                  checked={soundOn}
                  onCheckedChange={(checked) => {
                    setSoundOn(checked);
                    setSoundEnabled(checked);
                  }}
                />
              </div>
              <Separator />
              {isSupported && (
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Desktop Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      {permission === "granted"
                        ? "Desktop notifications are enabled"
                        : permission === "denied"
                          ? "Desktop notifications are blocked by your browser"
                          : "Get notified even when the tab is in the background"}
                    </p>
                  </div>
                  {permission === "granted" ? (
                    <span className="text-sm font-medium text-primary">Enabled</span>
                  ) : (
                    <Button variant="outline" size="sm" onClick={requestPermission} disabled={permission === "denied"}>
                      Enable
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case "privacy":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>Manage your privacy settings and account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Online Status</Label>
                  <p className="text-sm text-muted-foreground">Show when you're active on xBook</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Read Receipts</Label>
                  <p className="text-sm text-muted-foreground">Let people know when you've read their messages</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Blocked Users</Label>
                <p className="text-sm text-muted-foreground">Manage users you've blocked</p>
                <Button variant="outline" size="sm" onClick={() => navigate("/safety")}>
                  View Safety Center
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "appearance":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of xBook</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Use dark theme for a comfortable viewing experience</p>
                </div>
                <Switch checked={isDark} onCheckedChange={toggleDark} />
              </div>
            </CardContent>
          </Card>
        );

      case "language":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Language & Region</CardTitle>
              <CardDescription>Set your preferred language and regional settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <p className="text-sm text-muted-foreground">English (US) — more languages coming soon</p>
              </div>
              <div className="space-y-2">
                <Label>Time Zone</Label>
                <p className="text-sm text-muted-foreground">
                  {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case "help":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Help & Support</CardTitle>
              <CardDescription>Get help with using xBook</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/safety")}>
                <Shield className="w-4 h-4" />
                Safety Center
              </Button>
              <p className="text-sm text-muted-foreground">
                For additional help, contact support or visit our help center.
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <AppPageShell as="div">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar nav - horizontal scroll on mobile, vertical on desktop */}
        <nav className="flex flex-wrap md:flex-col md:w-56 md:shrink-0 gap-1 pb-2 md:pb-0">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex items-center gap-2 md:gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeSection === id
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-secondary"
                }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">{renderContent()}</div>
      </div>
    </AppPageShell>
  );
};

export default Settings;
