import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useSetupCheck } from "@/hooks/useSetupCheck";
import {
  Shield, User, Globe2, Settings, ChevronRight, ChevronLeft,
  Check, Lock, Mail, Eye, EyeOff, Rocket, Loader2, Sun, Moon,
  Upload, Image, AlertCircle,
} from "lucide-react";

const TOTAL_STEPS = 4;

const Setup = () => {
  const navigate = useNavigate();
  const { isDark, toggle } = useDarkMode();
  const { isSetupComplete, loading: setupLoading } = useSetupCheck();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [stepErrors, setStepErrors] = useState<string[]>([]);

  // Step 1 – Super Admin
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminConfirmPassword, setAdminConfirmPassword] = useState("");
  const [adminName, setAdminName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [adminCreated, setAdminCreated] = useState(false);

  // Step 2 – App Identity
  const [siteName, setSiteName] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [siteUrl, setSiteUrl] = useState(window.location.origin);

  // Step 3 – System Settings
  const [enableRegistration, setEnableRegistration] = useState(true);
  const [enableEmailVerification, setEnableEmailVerification] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [defaultLanguage, setDefaultLanguage] = useState("english");

  // Step 4 – Review & Launch
  const [launching, setLaunching] = useState(false);

  // Logo uploads
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [darkLogoFile, setDarkLogoFile] = useState<File | null>(null);
  const [darkLogoPreview, setDarkLogoPreview] = useState<string | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  // Redirect if already set up
  useEffect(() => {
    if (isSetupComplete === true) {
      navigate("/auth", { replace: true });
    }
  }, [isSetupComplete, navigate]);

  // Splash screen (index.html) covers initial loading — no duplicate preloader here.
  if (setupLoading || isSetupComplete === null) {
    return null;
  }

  const progressPercent = (step / TOTAL_STEPS) * 100;

  const handleFilePreview = (file: File, setPreview: (url: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadAsset = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from("site-assets")
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase.storage
      .from("site-assets")
      .getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  // Step 1 – Create admin via edge function
  const handleCreateAdmin = async () => {
    const errors: string[] = [];
    if (!adminName.trim()) errors.push("Full name is required");
    if (!adminEmail.trim()) errors.push("Email address is required");
    if (adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) errors.push("Invalid email format");
    if (!adminPassword) errors.push("Password is required");
    if (adminPassword && adminPassword.length < 8) errors.push("Password must be at least 8 characters");
    if (adminPassword !== adminConfirmPassword) errors.push("Passwords do not match");

    if (errors.length > 0) {
      setStepErrors(errors);
      return;
    }
    setStepErrors([]);
    setLoading(true);

    try {
      // Call edge function to create admin (uses service role, auto-confirms email)
      const { data, error } = await supabase.functions.invoke("setup-admin", {
        body: {
          email: adminEmail,
          password: adminPassword,
          displayName: adminName,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Now sign in the admin
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });
      if (signInError) throw signInError;

      setAdminCreated(true);
      toast.success("Super Admin account created successfully!");
      setStep(2);
    } catch (err: any) {
      setStepErrors([err.message || "Failed to create admin account"]);
    }
    setLoading(false);
  };

  // Step 2 – Save App Identity
  const handleSaveIdentity = async () => {
    if (!siteName.trim()) {
      setStepErrors(["App name is required"]);
      return;
    }
    setStepErrors([]);
    setLoading(true);

    try {
      let logoUrl = "";
      let darkLogoUrl = "";
      let faviconUrl = "";

      if (logoFile) logoUrl = await uploadAsset(logoFile, `setup/logo-${Date.now()}`);
      if (darkLogoFile) darkLogoUrl = await uploadAsset(darkLogoFile, `setup/dark-logo-${Date.now()}`);
      if (faviconFile) faviconUrl = await uploadAsset(faviconFile, `setup/favicon-${Date.now()}`);

      const { data: userData } = await supabase.auth.getUser();

      // Save website info
      await (supabase as any).from("site_settings").upsert(
        {
          setting_key: "admin_website_info",
          setting_value: { siteName, siteDescription, siteUrl },
          updated_at: new Date().toISOString(),
          updated_by: userData?.user?.id,
        },
        { onConflict: "setting_key" }
      );

      // Save design (logo/favicon)
      const designSettings: Record<string, string> = {};
      if (logoUrl) designSettings.logoUrl = logoUrl;
      if (darkLogoUrl) designSettings.darkLogoUrl = darkLogoUrl;
      if (faviconUrl) designSettings.faviconUrl = faviconUrl;

      if (Object.keys(designSettings).length > 0) {
        const { data: existing } = await (supabase as any)
          .from("site_settings")
          .select("setting_value")
          .eq("setting_key", "admin_design")
          .maybeSingle();

        const merged = { ...(existing?.setting_value || {}), ...designSettings };

        await (supabase as any).from("site_settings").upsert(
          {
            setting_key: "admin_design",
            setting_value: merged,
            updated_at: new Date().toISOString(),
            updated_by: userData?.user?.id,
          },
          { onConflict: "setting_key" }
        );
      }

      toast.success("App identity saved!");
      setStep(3);
    } catch (err: any) {
      setStepErrors([err.message || "Failed to save app identity"]);
    }
    setLoading(false);
  };

  // Step 3 – Save System Settings
  const handleSaveSystemSettings = async () => {
    setStepErrors([]);
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      await (supabase as any).from("site_settings").upsert(
        {
          setting_key: "admin_settings",
          setting_value: {
            enableRegistration,
            enableEmailVerification,
            maintenanceMode,
            defaultLanguage,
          },
          updated_at: new Date().toISOString(),
          updated_by: userData?.user?.id,
        },
        { onConflict: "setting_key" }
      );
      toast.success("System settings saved!");
      setStep(4);
    } catch (err: any) {
      setStepErrors([err.message || "Failed to save settings"]);
    }
    setLoading(false);
  };

  // Step 4 – Launch
  const handleLaunch = async () => {
    setLaunching(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      await (supabase as any).from("site_settings").upsert(
        {
          setting_key: "setup_complete",
          setting_value: { completed: true, completedAt: new Date().toISOString() },
          updated_at: new Date().toISOString(),
          updated_by: userData?.user?.id,
        },
        { onConflict: "setting_key" }
      );
      toast.success("🚀 Your app is ready! Redirecting...");
      setTimeout(() => navigate("/", { replace: true }), 1500);
    } catch (err: any) {
      toast.error(err.message || "Failed to launch");
      setLaunching(false);
    }
  };

  const stepLabels = [
    { icon: Shield, label: "Super Admin" },
    { icon: Globe2, label: "App Identity" },
    { icon: Settings, label: "System" },
    { icon: Rocket, label: "Launch" },
  ];

  const ErrorBanner = () =>
    stepErrors.length > 0 ? (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3 space-y-1">
        {stepErrors.map((e, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{e}</span>
          </div>
        ))}
      </div>
    ) : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Rocket className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Setup Wizard</h1>
            <p className="text-xs text-muted-foreground">Configure your application</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={toggle}>
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </div>

      {/* Progress */}
      <div className="px-6 pt-4">
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-1 sm:gap-2 py-4 px-4">
        {stepLabels.map((s, i) => {
          const StepIcon = s.icon;
          const stepNum = i + 1;
          const isActive = step === stepNum;
          const isCompleted = step > stepNum;
          return (
            <div key={i} className="flex items-center gap-1">
              {i > 0 && (
                <div className={`w-6 sm:w-10 h-px ${isCompleted ? "bg-primary" : "bg-border"}`} />
              )}
              <div
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isCompleted
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <StepIcon className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4 py-4 sm:py-6">
        <div className="w-full max-w-xl space-y-4">
          {/* Step 1: Super Admin */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <CardTitle>Create Super Admin</CardTitle>
                </div>
                <CardDescription>
                  This account will have full control over the platform. Keep these credentials safe.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ErrorBanner />
                <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Want to skip setup? Seed a demo admin + sample users and content.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={loading}
                    onClick={async () => {
                      setStepErrors([]);
                      setLoading(true);
                      try {
                        const { data, error } = await supabase.functions.invoke("seed-demo", { body: {} });
                        if (error) throw error;
                        if (data?.error) throw new Error(data.error);
                        const creds = data?.credentials;
                        if (creds?.email && creds?.password) {
                          await supabase.auth.signInWithPassword({ email: creds.email, password: creds.password });
                          toast.success(`Seeded! Signed in as ${creds.email}`);
                        } else {
                          toast.success("Demo data seeded!");
                        }
                        setTimeout(() => navigate("/", { replace: true }), 800);
                      } catch (err: any) {
                        setStepErrors([err.message || "Failed to seed demo data"]);
                        setLoading(false);
                      }
                    }}
                  >
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Rocket className="w-4 h-4 mr-2" />}
                    Skip & Seed Demo Data
                  </Button>
                  <p className="text-[11px] text-muted-foreground">
                    Default admin: <code>admin@example.com</code> / <code>Admin12345!</code>
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminName" className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Full Name
                  </Label>
                  <Input
                    id="adminName"
                    placeholder="John Doe"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail" className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email Address
                  </Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    placeholder="admin@example.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminPassword" className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="adminPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 8 characters"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminConfirmPassword" className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="adminConfirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={adminConfirmPassword}
                      onChange={(e) => setAdminConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use a strong password with at least 8 characters, including uppercase, lowercase, and numbers.
                  </p>
                </div>
                <Button
                  className="w-full"
                  onClick={handleCreateAdmin}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4 mr-2" />
                  )}
                  Create Admin & Continue
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: App Identity */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe2 className="w-5 h-5 text-primary" />
                  <CardTitle>App Identity</CardTitle>
                </div>
                <CardDescription>
                  Set your application name, description, and branding assets.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ErrorBanner />
                <div className="space-y-2">
                  <Label>App Name <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="My Social App"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="A brief description of your platform..."
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Site URL</Label>
                  <Input
                    placeholder="https://example.com"
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                  />
                </div>

                {/* Logo uploads */}
                <div className="space-y-1.5">
                  <Label className="text-sm">Branding Assets <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Light Logo", preview: logoPreview, setFile: setLogoFile, setPreview: setLogoPreview },
                      { label: "Dark Logo", preview: darkLogoPreview, setFile: setDarkLogoFile, setPreview: setDarkLogoPreview },
                      { label: "Favicon", preview: faviconPreview, setFile: setFaviconFile, setPreview: setFaviconPreview },
                    ].map((item) => (
                      <div key={item.label} className="space-y-1">
                        <p className="text-xs text-muted-foreground text-center">{item.label}</p>
                        <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-card">
                          {item.preview ? (
                            <img src={item.preview} alt={item.label} className="h-14 object-contain" />
                          ) : (
                            <Upload className="w-5 h-5 text-muted-foreground" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                item.setFile(f);
                                handleFilePreview(f, item.setPreview);
                              }
                            }}
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => { setStepErrors([]); setStep(1); }} className="flex-1" disabled={adminCreated}>
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button onClick={handleSaveIdentity} disabled={loading} className="flex-1">
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ChevronRight className="w-4 h-4 mr-2" />}
                    Save & Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: System Settings */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  <CardTitle>System Settings</CardTitle>
                </div>
                <CardDescription>
                  Configure registration, security, and basic system preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ErrorBanner />
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">Allow User Registration</p>
                    <p className="text-xs text-muted-foreground">Let new users sign up on your platform</p>
                  </div>
                  <Switch checked={enableRegistration} onCheckedChange={setEnableRegistration} />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">Email Verification</p>
                    <p className="text-xs text-muted-foreground">Require users to verify their email address</p>
                  </div>
                  <Switch checked={enableEmailVerification} onCheckedChange={setEnableEmailVerification} />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">Maintenance Mode</p>
                    <p className="text-xs text-muted-foreground">Only admins can access the app</p>
                  </div>
                  <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
                </div>
                <div className="space-y-2">
                  <Label>Default Language</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                    value={defaultLanguage}
                    onChange={(e) => setDefaultLanguage(e.target.value)}
                  >
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                    <option value="arabic">Arabic</option>
                    <option value="portuguese">Portuguese</option>
                    <option value="german">German</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => { setStepErrors([]); setStep(2); }} className="flex-1">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button onClick={handleSaveSystemSettings} disabled={loading} className="flex-1">
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ChevronRight className="w-4 h-4 mr-2" />}
                    Save & Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Review & Launch */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-primary" />
                  <CardTitle>Ready to Launch!</CardTitle>
                </div>
                <CardDescription>
                  Review your configuration below and launch your application.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-3">
                  {[
                    {
                      icon: Shield,
                      title: "Super Admin",
                      detail: adminEmail,
                    },
                    {
                      icon: Globe2,
                      title: "App Identity",
                      detail: `${siteName || "Not set"} • ${siteUrl}`,
                    },
                    {
                      icon: Settings,
                      title: "System Settings",
                      detail: `Registration: ${enableRegistration ? "On" : "Off"} • Email Verify: ${enableEmailVerification ? "On" : "Off"} • Maintenance: ${maintenanceMode ? "On" : "Off"}`,
                    },
                  ].map((item) => (
                    <div key={item.title} className="rounded-lg border border-border p-3 bg-muted/30">
                      <div className="flex items-center gap-2 mb-1">
                        <item.icon className="w-4 h-4 text-primary" />
                        <p className="text-sm font-semibold text-foreground">{item.title}</p>
                        <Check className="w-4 h-4 text-primary ml-auto" />
                      </div>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button
                    onClick={handleLaunch}
                    disabled={launching}
                    className="flex-1"
                  >
                    {launching ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Rocket className="w-4 h-4 mr-2" />
                    )}
                    Launch Application
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-border text-center space-y-1">
        <p className="text-xs text-muted-foreground">
          Step {step} of {TOTAL_STEPS} • Setup Wizard
        </p>
        <p className="text-[10px] text-muted-foreground/60">
          Powered by MOPARA PAIR AYAT
        </p>
      </div>
    </div>
  );
};

export default Setup;
