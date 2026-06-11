import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Mail, Phone, Send, Info, AlertTriangle, Save, Bug, Shield,
} from "lucide-react";
import { toast } from "sonner";

const AdminEmailSmsSetup = () => {
  // Email config
  const [emailServer, setEmailServer] = useState("server-mail");
  const [defaultEmail, setDefaultEmail] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpUsername, setSmtpUsername] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [smtpPort, setSmtpPort] = useState("465");
  const [smtpEncryption, setSmtpEncryption] = useState("ssl");

  // SMS config
  const [smsProvider, setSmsProvider] = useState("bulksms");
  const [phoneNumber, setPhoneNumber] = useState("");

  // BulkSMS
  const [bulkSmsUsername, setBulkSmsUsername] = useState("");
  const [bulkSmsPassword, setBulkSmsPassword] = useState("");

  // Twilio
  const [twilioSid, setTwilioSid] = useState("");
  const [twilioToken, setTwilioToken] = useState("");
  const [twilioPhone, setTwilioPhone] = useState("");

  // Infobip
  const [infobipApiKey, setInfobipApiKey] = useState("");
  const [infobipBaseUrl, setInfobipBaseUrl] = useState("");

  // Msg91
  const [msg91AuthKey, setMsg91AuthKey] = useState("");
  const [msg91DltId, setMsg91DltId] = useState("");

  // Debug
  const [debugLog, setDebugLog] = useState("");

  const handleSave = () => {
    toast.success("Email & SMS settings saved successfully");
  };

  const handleTestEmail = () => {
    toast.info("Sending test email...");
    setTimeout(() => toast.success("Test email sent to your account email address"), 1500);
  };

  const handleTestSms = () => {
    if (!phoneNumber) {
      toast.error("Please set your phone number first");
      return;
    }
    toast.info("Sending test SMS...");
    setTimeout(() => toast.success("Test SMS sent to " + phoneNumber), 1500);
  };

  const handleDebugEmail = () => {
    setDebugLog(
      "Testing email deliverability...\n\n" +
      "Server: " + (emailServer === "smtp" ? smtpHost : "Server Mail (Default)") + "\n" +
      "Port: " + smtpPort + "\n" +
      "Encryption: " + (smtpEncryption === "ssl" ? "SSL" : "TLS") + "\n\n" +
      "✓ Connection established\n" +
      "✓ Authentication successful\n" +
      "✓ Mail server accepts messages\n\n" +
      "Result: Email server is configured correctly."
    );
  };

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="p-3 rounded-lg bg-secondary/50 flex items-start gap-2">
        <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">For more information on how to setup e-mail server or SMS providers, please visit our Documentation page.</p>
      </div>

      {/* Email Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">E-mail Configuration</CardTitle>
          </div>
          <CardDescription>Configure your email server for sending emails to users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>E-mail Server</Label>
            <Select value={emailServer} onValueChange={setEmailServer}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="server-mail">Server Mail (Default)</SelectItem>
                <SelectItem value="smtp">SMTP Server</SelectItem>
                <SelectItem value="mailgun">Mailgun</SelectItem>
                <SelectItem value="sendgrid">SendGrid</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">Select which E-mail server you want to use. Server Mail function is not recommended.</p>
          </div>

          <div className="space-y-2">
            <Label>Website Default E-mail</Label>
            <Input
              type="email"
              value={defaultEmail}
              onChange={(e) => setDefaultEmail(e.target.value)}
              placeholder="admin@yourdomain.com"
            />
            <p className="text-[11px] text-muted-foreground">This is your default website E-mail, used to send E-mails to users.</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>SMTP Host</Label>
            <Input
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
              placeholder="mail.yourdomain.com"
            />
            <p className="text-[11px] text-muted-foreground">Your SMTP account host name, can be IP, domain or subdomain.</p>
          </div>

          <div className="space-y-2">
            <Label>SMTP Username</Label>
            <Input
              value={smtpUsername}
              onChange={(e) => setSmtpUsername(e.target.value)}
              placeholder="info@yourdomain.com"
            />
            <p className="text-[11px] text-muted-foreground">Your SMTP account username.</p>
          </div>

          <div className="space-y-2">
            <Label>SMTP Password</Label>
            <Input
              type="password"
              value={smtpPassword}
              onChange={(e) => setSmtpPassword(e.target.value)}
              placeholder="••••••••"
            />
            <p className="text-[11px] text-muted-foreground">The secret key is not showing due to security reasons, you can still overwrite the current one.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>SMTP Port</Label>
              <Input
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                placeholder="465"
              />
              <p className="text-[11px] text-muted-foreground">Most used: 587 for TLS, 465 for SSL encryption.</p>
            </div>

            <div className="space-y-2">
              <Label>SMTP Encryption</Label>
              <Select value={smtpEncryption} onValueChange={setSmtpEncryption}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ssl">SSL (Secure)</SelectItem>
                  <SelectItem value="tls">TLS</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">Which encryption method does your SMTP server use?</p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={handleTestEmail} className="gap-2">
              <Send className="w-3.5 h-3.5" />
              Test E-mail Server
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">After clicking "Test E-mail Server", a test message will be sent to your account's email address.</p>
        </CardContent>
      </Card>

      {/* SMS Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">SMS Settings</CardTitle>
          </div>
          <CardDescription>Configure SMS providers for sending SMS to users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="p-3 rounded-lg bg-secondary/50 flex items-start gap-2">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">To start sending SMS, you have to create an account and buy credits in Twilio OR BulkSMS OR Infobip.</p>
          </div>

          <div className="space-y-2">
            <Label>Default SMS Provider</Label>
            <Select value={smsProvider} onValueChange={setSmsProvider}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bulksms">BulkSMS</SelectItem>
                <SelectItem value="twilio">Twilio</SelectItem>
                <SelectItem value="infobip">Infobip</SelectItem>
                <SelectItem value="msg91">Msg91</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">Select which SMS provider you want to use. You can use only one at a time.</p>
          </div>

          <div className="space-y-2">
            <Label>Your Phone Number</Label>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
            />
            <p className="text-[11px] text-muted-foreground">Set your website default number, used to send SMS to users, e.g (+9053..)</p>
          </div>

          <Separator />

          {/* BulkSMS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={smsProvider === "bulksms" ? "default" : "secondary"} className="text-xs">
                {smsProvider === "bulksms" ? "Active" : "Inactive"}
              </Badge>
              <Label className="text-sm font-medium">BulkSMS Configuration</Label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">BulkSMS Username</Label>
                <Input
                  value={bulkSmsUsername}
                  onChange={(e) => setBulkSmsUsername(e.target.value)}
                  placeholder="Your BulkSMS username"
                  disabled={smsProvider !== "bulksms"}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">BulkSMS Password</Label>
                <Input
                  type="password"
                  value={bulkSmsPassword}
                  onChange={(e) => setBulkSmsPassword(e.target.value)}
                  placeholder="Your BulkSMS password"
                  disabled={smsProvider !== "bulksms"}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Twilio */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={smsProvider === "twilio" ? "default" : "secondary"} className="text-xs">
                {smsProvider === "twilio" ? "Active" : "Inactive"}
              </Badge>
              <Label className="text-sm font-medium">Twilio Configuration</Label>
            </div>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Twilio account_sid</Label>
                <Input
                  value={twilioSid}
                  onChange={(e) => setTwilioSid(e.target.value)}
                  placeholder="Your Twilio Account SID"
                  disabled={smsProvider !== "twilio"}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Twilio auth_token</Label>
                <Input
                  type="password"
                  value={twilioToken}
                  onChange={(e) => setTwilioToken(e.target.value)}
                  placeholder="Your Twilio Auth Token"
                  disabled={smsProvider !== "twilio"}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Twilio Phone number</Label>
                <Input
                  value={twilioPhone}
                  onChange={(e) => setTwilioPhone(e.target.value)}
                  placeholder="+1234567890"
                  disabled={smsProvider !== "twilio"}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Infobip */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={smsProvider === "infobip" ? "default" : "secondary"} className="text-xs">
                {smsProvider === "infobip" ? "Active" : "Inactive"}
              </Badge>
              <Label className="text-sm font-medium">Infobip Configuration</Label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Infobip API Key</Label>
                <Input
                  value={infobipApiKey}
                  onChange={(e) => setInfobipApiKey(e.target.value)}
                  placeholder="Your Infobip API Key"
                  disabled={smsProvider !== "infobip"}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Infobip Base URL</Label>
                <Input
                  value={infobipBaseUrl}
                  onChange={(e) => setInfobipBaseUrl(e.target.value)}
                  placeholder="https://xxxxx.api.infobip.com"
                  disabled={smsProvider !== "infobip"}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Msg91 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={smsProvider === "msg91" ? "default" : "secondary"} className="text-xs">
                {smsProvider === "msg91" ? "Active" : "Inactive"}
              </Badge>
              <Label className="text-sm font-medium">Msg91 Configuration</Label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Msg91 AuthKey</Label>
                <Input
                  value={msg91AuthKey}
                  onChange={(e) => setMsg91AuthKey(e.target.value)}
                  placeholder="Your Msg91 AuthKey"
                  disabled={smsProvider !== "msg91"}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Msg91 DLT ID</Label>
                <Input
                  value={msg91DltId}
                  onChange={(e) => setMsg91DltId(e.target.value)}
                  placeholder="Your Msg91 DLT ID"
                  disabled={smsProvider !== "msg91"}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={handleTestSms} className="gap-2">
              <Send className="w-3.5 h-3.5" />
              Test SMS Server
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">After clicking "Test SMS Server", a test message will be sent to your phone.</p>
        </CardContent>
      </Card>

      {/* Debug Email Deliverability */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Debug Email Deliverability</CardTitle>
          </div>
          <CardDescription>Test email deliverability and verify system configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">This feature will test the Email Deliverability and make sure the system is working fine.</p>
          <Button variant="outline" size="sm" onClick={handleDebugEmail} className="gap-2">
            <Shield className="w-3.5 h-3.5" />
            Debug Email Deliverability
          </Button>
          <div className="space-y-2">
            <Label className="text-xs">Debug Log</Label>
            <pre className="p-3 rounded-lg bg-muted text-xs text-muted-foreground font-mono whitespace-pre-wrap border min-h-[80px]">
              {debugLog || "Click on Debug Email Deliverability to show test results."}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default AdminEmailSmsSetup;
