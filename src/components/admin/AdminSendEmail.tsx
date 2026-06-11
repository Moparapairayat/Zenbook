import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Send, Mail, Users, Search, TestTube, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const audienceOptions = [
  { value: "all", label: "All users" },
  { value: "active", label: "All Active users" },
  { value: "inactive", label: "All Inactive users" },
  { value: "no-login-week", label: "Users who didn't login for a week", approx: 3170 },
  { value: "no-login-month", label: "Users who didn't login for a month", approx: 13624 },
  { value: "no-login-3month", label: "Users who didn't login for 3 months", approx: 59013 },
  { value: "no-login-6month", label: "Users who didn't login for 6 months", approx: 24744 },
  { value: "no-login-9month", label: "Users who didn't login for 9 months", approx: 25805 },
  { value: "no-login-year", label: "Users who didn't login for a year", approx: 67058 },
];

const AdminSendEmail = () => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all");
  const [searchUsers, setSearchUsers] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [testFirst, setTestFirst] = useState(false);
  const [sending, setSending] = useState(false);

  const selectedAudience = audienceOptions.find((a) => a.value === audience);

  const handleAddUser = () => {
    if (searchUsers.trim() && !selectedUsers.includes(searchUsers.trim())) {
      setSelectedUsers((prev) => [...prev, searchUsers.trim()]);
      setSearchUsers("");
    }
  };

  const handleRemoveUser = (user: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u !== user));
  };

  const handleSend = async () => {
    if (!subject.trim()) {
      toast.error("Please enter an email subject");
      return;
    }
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-broadcast-email", {
        body: {
          subject: subject.trim(),
          message,
          audience,
          selectedUsers,
          testFirst,
        },
      });
      if (error) throw error;
      if (data?.dryRun) {
        toast.success(
          `Audience resolved: ${data.recipientCount} recipient(s). ${data.message}`
        );
      } else if (typeof data?.sent === "number") {
        toast.success(
          `Email sent to ${data.sent} of ${data.recipientCount} recipient(s)${
            data.failed ? ` — ${data.failed} failed` : ""
          }`
        );
      } else {
        toast.success("Broadcast queued");
      }
    } catch (err: any) {
      toast.error(`Failed to send: ${err?.message ?? "Unknown error"}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Send className="w-5 h-5 text-primary" />
          Send E-mail To Users
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Compose and send emails to your users. You can target specific user groups or individual users.
        </p>
      </div>

      {/* Compose */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">Compose Message</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Subject */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Choose the title for your message."
              className="h-9"
            />
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Message</Label>
              <Badge variant="secondary" className="text-[10px] font-normal">HTML Allowed</Badge>
            </div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here."
              className="min-h-[200px] resize-y font-mono text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Audience */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">Recipients</CardTitle>
          </div>
          <CardDescription className="text-xs">Choose the type of users you want to send the message to.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Audience Select */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Send E-mail To</Label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {audienceOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span>{opt.label}</span>
                    {opt.approx && (
                      <span className="text-muted-foreground ml-2 text-xs">
                        — approx. ({opt.approx.toLocaleString()} Users)
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Users */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Search Users (Optional)</Label>
            <p className="text-[10px] text-muted-foreground">
              Send only to those users, leave it empty to send to all users in the selected audience.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={searchUsers}
                  onChange={(e) => setSearchUsers(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddUser()}
                  placeholder="Search by username or email..."
                  className="h-9 pl-8 text-sm"
                />
              </div>
              <Button variant="outline" size="sm" onClick={handleAddUser} className="h-9">
                Add
              </Button>
            </div>

            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {selectedUsers.map((user) => (
                  <Badge key={user} variant="secondary" className="gap-1 text-xs pr-1">
                    {user}
                    <button
                      onClick={() => handleRemoveUser(user)}
                      className="ml-0.5 hover:text-destructive transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Test checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="test-email"
              checked={testFirst}
              onCheckedChange={(v) => setTestFirst(v === true)}
            />
            <label htmlFor="test-email" className="flex items-center gap-1.5 text-sm cursor-pointer">
              <TestTube className="w-3.5 h-3.5 text-muted-foreground" />
              Test Message (Send to my email first)
            </label>
          </div>

          {/* Summary */}
          {!testFirst && (
            <div className="rounded-lg bg-muted/40 border border-border p-3">
              <p className="text-xs text-muted-foreground">
                This email will be sent to{" "}
                {selectedUsers.length > 0 ? (
                  <span className="font-medium text-foreground">{selectedUsers.length} specific user(s)</span>
                ) : (
                  <span className="font-medium text-foreground">{selectedAudience?.label}</span>
                )}
                {selectedAudience?.approx && selectedUsers.length === 0 && (
                  <span> — approximately {selectedAudience.approx.toLocaleString()} users</span>
                )}
              </p>
            </div>
          )}

          {/* Send Button */}
          <div className="flex justify-end">
            <Button onClick={handleSend} disabled={sending} className="gap-1.5">
              <Send className="w-4 h-4" />
              {sending ? "Sending..." : testFirst ? "Send Test Email" : "Send Email"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSendEmail;
