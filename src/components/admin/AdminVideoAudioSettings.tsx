import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Video, Phone, Eye, Keyboard, Info, ExternalLink, Save } from "lucide-react";
import { toast } from "sonner";

const AdminVideoAudioSettings = () => {
  // Chat settings
  const [chatEnabled, setChatEnabled] = useState(true);
  const [messageSeenAlert, setMessageSeenAlert] = useState(true);
  const [userTypingSystem, setUserTypingSystem] = useState(true);

  // Video/Audio toggles
  const [videoCallsEnabled, setVideoCallsEnabled] = useState(false);
  const [audioCallsEnabled, setAudioCallsEnabled] = useState(false);

  // Provider selection
  const [activeProvider, setActiveProvider] = useState<"none" | "agora" | "twilio">("none");

  // Agora config
  const [agoraAppId, setAgoraAppId] = useState("");
  const [agoraAppCertificate, setAgoraAppCertificate] = useState("");
  const [agoraCustomerId, setAgoraCustomerId] = useState("");
  const [agoraCustomerSecret, setAgoraCustomerSecret] = useState("");

  // Twilio config
  const [twilioAccountSid, setTwilioAccountSid] = useState("");
  const [twilioApiKeySid, setTwilioApiKeySid] = useState("");
  const [twilioApiKeySecret, setTwilioApiKeySecret] = useState("");

  const handleSave = () => {
    toast.success("Video & Audio settings saved successfully");
  };

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Chat & Video Chat Configuration</p>
            <p className="text-xs text-muted-foreground mt-1">
              Configure real-time messaging, video calls, and audio calls for your platform.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Chat Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Chat Settings</CardTitle>
          </div>
          <CardDescription>Configure the real-time messaging system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Chat System</Label>
              <p className="text-xs text-muted-foreground">
                Enable chat system to chat with friends on the platform.
              </p>
            </div>
            <Switch checked={chatEnabled} onCheckedChange={setChatEnabled} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Message Seen Alert</Label>
                <Eye className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                Checks if the message was seen in chat system. Recommended for powerful servers.
              </p>
            </div>
            <Switch checked={messageSeenAlert} onCheckedChange={setMessageSeenAlert} disabled={!chatEnabled} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">User Typing System</Label>
                <Keyboard className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                Checks if the user is typing in chat system. Recommended for powerful servers.
              </p>
            </div>
            <Switch checked={userTypingSystem} onCheckedChange={setUserTypingSystem} disabled={!chatEnabled} />
          </div>
        </CardContent>
      </Card>

      {/* Video & Audio Call Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Video & Audio Chat Settings</CardTitle>
          </div>
          <CardDescription>Enable or disable video and audio calling features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Video Calls</Label>
                <Video className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                Enable video chat feature for users to make video calls on your site.
              </p>
            </div>
            <Switch checked={videoCallsEnabled} onCheckedChange={setVideoCallsEnabled} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Audio Calls</Label>
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                Enable audio chat feature for users to make audio calls on your site.
              </p>
            </div>
            <Switch checked={audioCallsEnabled} onCheckedChange={setAudioCallsEnabled} />
          </div>
        </CardContent>
      </Card>

      {/* Agora API Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-primary" />
              <div>
                <CardTitle className="text-base">Agora API Configuration</CardTitle>
                <CardDescription className="mt-1">Video calls powered by Agora.io</CardDescription>
              </div>
            </div>
            <Badge variant={activeProvider === "agora" ? "default" : "secondary"} className="text-xs">
              {activeProvider === "agora" ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Agora Video Calls</Label>
              <p className="text-xs text-muted-foreground">
                Enable Agora to start video chat service. Enabling Agora will disable Twilio. Agora supports video calls only.
              </p>
            </div>
            <Switch
              checked={activeProvider === "agora"}
              onCheckedChange={(checked) => setActiveProvider(checked ? "agora" : "none")}
            />
          </div>

          <div className="p-3 rounded-lg bg-secondary/50 flex items-start gap-2">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              To start using this feature, you'll need to create an account at{" "}
              <a href="https://www.agora.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                Agora.io <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="agora-app-id">App ID</Label>
              <Input
                id="agora-app-id"
                value={agoraAppId}
                onChange={(e) => setAgoraAppId(e.target.value)}
                placeholder="Enter Agora App ID"
                disabled={activeProvider !== "agora"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agora-app-cert">App Certificate</Label>
              <Input
                id="agora-app-cert"
                type="password"
                value={agoraAppCertificate}
                onChange={(e) => setAgoraAppCertificate(e.target.value)}
                placeholder="Enter App Certificate"
                disabled={activeProvider !== "agora"}
              />
              <p className="text-[11px] text-muted-foreground">
                The secret key is not showing due to security reasons, you can still overwrite the current one.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="agora-customer-id">Customer ID</Label>
              <Input
                id="agora-customer-id"
                value={agoraCustomerId}
                onChange={(e) => setAgoraCustomerId(e.target.value)}
                placeholder="Enter Customer ID"
                disabled={activeProvider !== "agora"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agora-customer-secret">Customer Secret</Label>
              <Input
                id="agora-customer-secret"
                type="password"
                value={agoraCustomerSecret}
                onChange={(e) => setAgoraCustomerSecret(e.target.value)}
                placeholder="Enter Customer Secret"
                disabled={activeProvider !== "agora"}
              />
              <p className="text-[11px] text-muted-foreground">
                The secret key is not showing due to security reasons, you can still overwrite the current one.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Twilio API Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              <div>
                <CardTitle className="text-base">Twilio API Configuration</CardTitle>
                <CardDescription className="mt-1">Video & Audio calls powered by Twilio</CardDescription>
              </div>
            </div>
            <Badge variant={activeProvider === "twilio" ? "default" : "secondary"} className="text-xs">
              {activeProvider === "twilio" ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Twilio Video / Audio Calls</Label>
              <p className="text-xs text-muted-foreground">
                Enable Twilio to start video chat service. Enabling Twilio will disable Agora. Twilio supports video and audio calls.
              </p>
            </div>
            <Switch
              checked={activeProvider === "twilio"}
              onCheckedChange={(checked) => setActiveProvider(checked ? "twilio" : "none")}
            />
          </div>

          <div className="p-3 rounded-lg bg-secondary/50 flex items-start gap-2">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              To start using this feature, you'll need to create an account at{" "}
              <a href="https://www.twilio.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                Twilio <ExternalLink className="w-3 h-3" />
              </a>{" "}
              and purchase the "Programmable Video" product.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="twilio-account-sid">Live Account SID</Label>
              <Input
                id="twilio-account-sid"
                value={twilioAccountSid}
                onChange={(e) => setTwilioAccountSid(e.target.value)}
                placeholder="Enter Account SID"
                disabled={activeProvider !== "twilio"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twilio-api-key-sid">API Key SID</Label>
              <Input
                id="twilio-api-key-sid"
                value={twilioApiKeySid}
                onChange={(e) => setTwilioApiKeySid(e.target.value)}
                placeholder="Enter API Key SID"
                disabled={activeProvider !== "twilio"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twilio-api-key-secret">API Key Secret</Label>
              <Input
                id="twilio-api-key-secret"
                type="password"
                value={twilioApiKeySecret}
                onChange={(e) => setTwilioApiKeySecret(e.target.value)}
                placeholder="Enter API Key Secret"
                disabled={activeProvider !== "twilio"}
              />
              <p className="text-[11px] text-muted-foreground">
                The secret key is not showing due to security reasons, you can still overwrite the current one.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default AdminVideoAudioSettings;
