import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Bell, Save, Smartphone, Globe, Apple, Info, ExternalLink } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface PlatformConfigProps {
  title: string;
  icon: React.ReactNode;
  appId: string;
  apiKey: string;
  onAppIdChange: (v: string) => void;
  onApiKeyChange: (v: string) => void;
}

const PlatformConfig = ({ title, icon, appId, apiKey, onAppIdChange, onApiKeyChange }: PlatformConfigProps) => (
  <Card>
    <CardHeader className="pb-3">
      <div className="flex items-center gap-2">
        {icon}
        <CardTitle className="text-sm">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">OneSignal APP ID</Label>
        <Input
          value={appId}
          onChange={(e) => onAppIdChange(e.target.value)}
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          className="h-9 text-sm font-mono"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">REST API Key</Label>
        <Input
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder="Enter your REST API key"
          className="h-9 text-sm font-mono"
          type="password"
        />
      </div>
    </CardContent>
  </Card>
);

const defaultState = {
  pushEnabled: true,
  androidPush: true,
  iosPush: true,
  androidNative: true,
  iosNative: true,
  webPush: true,
  androidGlobalAppId: "",
  androidGlobalApiKey: "",
  iosGlobalAppId: "",
  iosGlobalApiKey: "",
  webGlobalAppId: "",
  webGlobalApiKey: "",
  androidMessengerAppId: "",
  androidMessengerApiKey: "",
  iosMessengerAppId: "",
  iosMessengerApiKey: "",
};

const AdminPushNotifications = () => {
  const { settings, loading, saving, saveSettings } = useSiteSettings("push_notifications");
  const [state, setState] = useState(defaultState);

  useEffect(() => {
    if (settings && Object.keys(settings).length) {
      setState({ ...defaultState, ...settings });
    }
  }, [settings]);

  const update = <K extends keyof typeof defaultState>(key: K, value: (typeof defaultState)[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    await saveSettings(state);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Push Notifications Settings
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure push notifications for web browsers and mobile applications using OneSignal.
        </p>
      </div>

      <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 border border-border">
        <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div className="text-xs text-muted-foreground space-y-1">
          <p>This system allows your script to send push notifications to any application who uses the API.</p>
          <a
            href="https://onesignal.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            Register at OneSignal to get started
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Feature Toggles</CardTitle>
          <CardDescription className="text-xs">Enable or disable push notification channels.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
            <div>
              <Label className="text-sm font-medium">Push Notifications System</Label>
              <p className="text-[10px] text-muted-foreground">
                Enable this feature and users will get notified on their browser / app while the app is closed.
              </p>
            </div>
            <Switch checked={state.pushEnabled} onCheckedChange={(v) => update("pushEnabled", v)} />
          </div>

          <Separator />

          <div className={!state.pushEnabled ? "opacity-50 pointer-events-none space-y-4" : "space-y-4"}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm">Android Push Messages</Label>
                  <p className="text-[10px] text-muted-foreground">Push User Messages Only</p>
                </div>
              </div>
              <Switch checked={state.androidPush} onCheckedChange={(v) => update("androidPush", v)} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Apple className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm">iOS Push Messages</Label>
                  <p className="text-[10px] text-muted-foreground">Push User Messages Only</p>
                </div>
              </div>
              <Switch checked={state.iosPush} onCheckedChange={(v) => update("iosPush", v)} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm">Android Push Native Site Notifications</Label>
                  <p className="text-[10px] text-muted-foreground">Likes, Followed, Comment etc.</p>
                </div>
              </div>
              <Switch checked={state.androidNative} onCheckedChange={(v) => update("androidNative", v)} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Apple className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm">iOS Push Native Site Notifications</Label>
                  <p className="text-[10px] text-muted-foreground">Likes, Followed, Comment etc.</p>
                </div>
              </div>
              <Switch checked={state.iosNative} onCheckedChange={(v) => update("iosNative", v)} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm">Web Push Notifications</Label>
                  <p className="text-[10px] text-muted-foreground">Chrome, Firefox etc. SSL required</p>
                </div>
              </div>
              <Switch checked={state.webPush} onCheckedChange={(v) => update("webPush", v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <a
          href="https://documentation.onesignal.com/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline inline-flex items-center gap-1"
        >
          Need Help? Read The Documentation
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <Separator />

      <div className={!state.pushEnabled ? "opacity-50 pointer-events-none space-y-6" : "space-y-6"}>
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-1">Global Notifications Settings</h3>
          <p className="text-[10px] text-muted-foreground mb-4">Likes, Dislikes, Comments, Follow etc.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PlatformConfig
              title="Android"
              icon={<Smartphone className="w-4 h-4 text-primary" />}
              appId={state.androidGlobalAppId}
              apiKey={state.androidGlobalApiKey}
              onAppIdChange={(v) => update("androidGlobalAppId", v)}
              onApiKeyChange={(v) => update("androidGlobalApiKey", v)}
            />
            <PlatformConfig
              title="iOS"
              icon={<Apple className="w-4 h-4 text-primary" />}
              appId={state.iosGlobalAppId}
              apiKey={state.iosGlobalApiKey}
              onAppIdChange={(v) => update("iosGlobalAppId", v)}
              onApiKeyChange={(v) => update("iosGlobalApiKey", v)}
            />
            <PlatformConfig
              title="Web"
              icon={<Globe className="w-4 h-4 text-primary" />}
              appId={state.webGlobalAppId}
              apiKey={state.webGlobalApiKey}
              onAppIdChange={(v) => update("webGlobalAppId", v)}
              onApiKeyChange={(v) => update("webGlobalApiKey", v)}
            />
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-semibold text-foreground mb-1">Messenger & Chat Push Notifications Settings</h3>
          <p className="text-[10px] text-muted-foreground mb-4">Separate OneSignal apps for real-time messaging push notifications.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PlatformConfig
              title="Android Messenger & Chat"
              icon={<Smartphone className="w-4 h-4 text-primary" />}
              appId={state.androidMessengerAppId}
              apiKey={state.androidMessengerApiKey}
              onAppIdChange={(v) => update("androidMessengerAppId", v)}
              onApiKeyChange={(v) => update("androidMessengerApiKey", v)}
            />
            <PlatformConfig
              title="iOS Messenger & Chat"
              icon={<Apple className="w-4 h-4 text-primary" />}
              appId={state.iosMessengerAppId}
              apiKey={state.iosMessengerApiKey}
              onAppIdChange={(v) => update("iosMessengerAppId", v)}
              onApiKeyChange={(v) => update("iosMessengerApiKey", v)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pb-4">
        <Button onClick={handleSave} disabled={saving || loading}>
          <Save className="w-4 h-4 mr-1.5" />
          {saving ? "Saving..." : "Save Push Settings"}
        </Button>
      </div>
    </div>
  );
};

export default AdminPushNotifications;
