import zenbookLogoDark from "@/assets/zenbook-logo-dark.png";
import zenbookLogoLight from "@/assets/zenbook-logo-light.png";
import { useAuth } from "@/hooks/useAuth";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useSiteBranding } from "@/hooks/useSiteBranding";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "@/components/Header";
import ContentModerationQueue from "@/components/moderator/ContentModerationQueue";
import ModerationActivityLog from "@/components/moderator/ModerationActivityLog";
import UserWarningsBans from "@/components/moderator/UserWarningsBans";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  Cpu,
  Eye,
  FileText,
  Flag,
  LayoutDashboard,
  Loader2,
  Menu,
  ShieldAlert,
  X,
  XCircle
} from "lucide-react";
import { toast } from "sonner";

interface Report {
  id: string;
  listing_id: string;
  reporter_id: string;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
  listing?: { id: string; title: string; price: number; status: string; user_id: string };
  reporter?: { display_name: string | null };
}

interface FraudSignal {
  id: string;
  listing_id: string;
  signal_type: string;
  severity: string;
  description: string;
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
  metadata: any;
  listing?: { id: string; title: string; price: number; status: string; user_id: string };
}

type ModSection = "overview" | "reports" | "fraud" | "content_queue" | "warnings" | "activity_log";

const navItems: { id: ModSection; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "content_queue", label: "Content Queue", icon: ClipboardList },
  { id: "reports", label: "User Reports", icon: Flag },
  { id: "fraud", label: "Fraud Signals", icon: Cpu },
  { id: "warnings", label: "Warnings & Bans", icon: ShieldAlert },
  { id: "activity_log", label: "Activity Log", icon: FileText },
];

const ModeratorPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isDark } = useDarkMode();
  const { branding } = useSiteBranding();
  const [reports, setReports] = useState<Report[]>([]);
  const [fraudSignals, setFraudSignals] = useState<FraudSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [fraudLoading, setFraudLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "reviewed" | "all">("pending");
  const [fraudFilter, setFraudFilter] = useState<"unresolved" | "resolved" | "all">("unresolved");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<FraudSignal | null>(null);
  const [processing, setProcessing] = useState(false);
  const [activeSection, setActiveSection] = useState<ModSection>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      let query = (supabase as any)
        .from("listing_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter === "pending") query = query.eq("status", "pending");
      else if (filter === "reviewed") query = query.neq("status", "pending");

      const { data } = await query;
      setReports(data || []);
      setLoading(false);
    };
    fetchReports();
  }, [filter]);

  // Fetch fraud signals
  useEffect(() => {
    const fetchFraud = async () => {
      setFraudLoading(true);
      let query = (supabase as any)
        .from("listing_fraud_signals")
        .select("*")
        .order("created_at", { ascending: false });

      if (fraudFilter === "unresolved") query = query.eq("resolved", false);
      else if (fraudFilter === "resolved") query = query.eq("resolved", true);

      const { data } = await query;
      setFraudSignals(data || []);
      setFraudLoading(false);
    };
    fetchFraud();
  }, [fraudFilter]);

  const handleReportAction = async (reportId: string, action: "reviewed" | "dismissed") => {
    setProcessing(true);
    await (supabase as any)
      .from("listing_reports")
      .update({ status: action })
      .eq("id", reportId);
    toast.success(`Report ${action}`);
    setSelectedReport(null);
    setProcessing(false);
    setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: action } : r)));
  };

  const handleResolveSignal = async (signalId: string) => {
    setProcessing(true);
    await (supabase as any)
      .from("listing_fraud_signals")
      .update({ resolved: true, resolved_at: new Date().toISOString() })
      .eq("id", signalId);
    toast.success("Signal resolved");
    setSelectedSignal(null);
    setProcessing(false);
    setFraudSignals((prev) => prev.map((s) => (s.id === signalId ? { ...s, resolved: true } : s)));
  };

  const pendingReports = reports.filter((r) => r.status === "pending").length;
  const unresolvedFraud = fraudSignals.filter((s) => !s.resolved).length;
  const totalActions = pendingReports + unresolvedFraud;

  const getBadgeCount = (section: ModSection) => {
    if (section === "reports") return pendingReports;
    if (section === "fraud") return unresolvedFraud;
    if (section === "overview") return totalActions;
    return 0;
  };

  const sectionTitle = navItems.find((n) => n.id === activeSection)?.label || "Overview";

  return (
    <>
      <Header />
      <div className="fixed inset-0 top-14 flex bg-background">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Left Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            }`}
        >
          {/* Sidebar header */}
          <div className="h-14 flex items-center gap-3 px-4 border-b border-border shrink-0">
            <img src={isDark ? (branding.darkLogoUrl || zenbookLogoLight) : (branding.logoUrl || zenbookLogoDark)} alt="ZenBook" className="h-7" />
            <span className="font-bold text-foreground text-lg">Moderator</span>
            <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Nav items */}
          <ScrollArea className="flex-1 py-3">
            <nav className="px-3 space-y-1">
              {navItems.map((item) => {
                const count = getBadgeCount(item.id);
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                  >
                    <item.icon className="w-4.5 h-4.5 shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {count > 0 && (
                      <Badge variant="destructive" className="text-[10px] h-5 px-1.5 shrink-0">
                        {count}
                      </Badge>
                    )}
                    {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0 text-primary" />}
                  </button>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-border shrink-0">
            <Button variant="outline" size="sm" className="w-full" onClick={() => navigate("/")}>
              ← Back to App
            </Button>
          </div>
        </aside>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Fixed header */}
          <header className="h-14 flex items-center gap-3 px-4 lg:px-6 border-b border-border bg-card shrink-0">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">{sectionTitle}</h1>
            {totalActions > 0 && (
              <Badge variant="destructive" className="text-xs">{totalActions} action{totalActions > 1 ? "s" : ""} needed</Badge>
            )}
          </header>

          {/* Scrollable content */}
          <ScrollArea className="flex-1">
            <div className="p-4 lg:p-6 max-w-5xl">

              {/* Overview */}
              {activeSection === "overview" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="cursor-pointer" onClick={() => setActiveSection("reports")}>
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                          <Flag className="w-5 h-5 text-destructive" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">{pendingReports}</p>
                          <p className="text-xs text-muted-foreground">Pending Reports</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="cursor-pointer" onClick={() => setActiveSection("fraud")}>
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">{unresolvedFraud}</p>
                          <p className="text-xs text-muted-foreground">Open Fraud Signals</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="cursor-pointer" onClick={() => setActiveSection("content_queue")}>
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <ClipboardList className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-foreground">Content Queue</p>
                          <p className="text-xs text-muted-foreground">Review flagged content</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="cursor-pointer" onClick={() => setActiveSection("warnings")}>
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                          <ShieldAlert className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-foreground">Warnings & Bans</p>
                          <p className="text-xs text-muted-foreground">Manage user actions</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="cursor-pointer" onClick={() => setActiveSection("activity_log")}>
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-foreground">Activity Log</p>
                          <p className="text-xs text-muted-foreground">Audit trail</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {reports.length === 0 && fraudSignals.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
                          <p>No recent activity</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {reports.slice(0, 5).map((r) => (
                            <div key={r.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50">
                              <Flag className="w-4 h-4 text-destructive shrink-0" />
                              <span className="text-sm flex-1 truncate">Report: {r.reason}</span>
                              <Badge variant={r.status === "pending" ? "destructive" : "secondary"} className="text-[10px]">{r.status}</Badge>
                            </div>
                          ))}
                          {fraudSignals.slice(0, 5).map((s) => (
                            <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50">
                              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                              <span className="text-sm flex-1 truncate">{s.signal_type}: {s.description}</span>
                              <Badge variant={s.resolved ? "outline" : "destructive"} className="text-[10px]">{s.resolved ? "Resolved" : "Active"}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Reports */}
              {activeSection === "reports" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground">User Reports</h2>
                    <div className="flex gap-1">
                      {(["pending", "reviewed", "all"] as const).map((f) => (
                        <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" className="h-8 text-xs capitalize" onClick={() => setFilter(f)}>
                          {f}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Card>
                    <CardContent className="p-0">
                      {loading ? (
                        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Reason</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reports.map((report) => (
                              <TableRow key={report.id}>
                                <TableCell className="text-sm font-medium">{report.reason}</TableCell>
                                <TableCell>
                                  <Badge variant={report.status === "pending" ? "destructive" : "secondary"} className="text-xs">
                                    {report.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                  {new Date(report.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex gap-1 justify-end">
                                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSelectedReport(report)}>
                                      <Eye className="w-3.5 h-3.5 mr-1" /> View
                                    </Button>
                                    {report.status === "pending" && (
                                      <>
                                        <Button variant="ghost" size="sm" className="h-7 text-xs text-green-600" onClick={() => handleReportAction(report.id, "reviewed")}>
                                          <CheckCircle className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => handleReportAction(report.id, "dismissed")}>
                                          <XCircle className="w-3.5 h-3.5" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                            {reports.length === 0 && (
                              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No reports found.</TableCell></TableRow>
                            )}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Fraud Signals */}
              {activeSection === "fraud" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground">Fraud Signals</h2>
                    <div className="flex gap-1">
                      {(["unresolved", "resolved", "all"] as const).map((f) => (
                        <Button key={f} variant={fraudFilter === f ? "default" : "outline"} size="sm" className="h-8 text-xs capitalize" onClick={() => setFraudFilter(f)}>
                          {f}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Card>
                    <CardContent className="p-0">
                      {fraudLoading ? (
                        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Type</TableHead>
                              <TableHead>Severity</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {fraudSignals.map((signal) => (
                              <TableRow key={signal.id}>
                                <TableCell className="text-sm font-medium">{signal.signal_type}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={signal.severity === "high" ? "destructive" : "secondary"}
                                    className="text-xs"
                                  >
                                    {signal.severity}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{signal.description}</TableCell>
                                <TableCell>
                                  <Badge variant={signal.resolved ? "outline" : "destructive"} className="text-xs">
                                    {signal.resolved ? "Resolved" : "Active"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  {!signal.resolved && (
                                    <Button variant="ghost" size="sm" className="h-7 text-xs text-green-600" onClick={() => handleResolveSignal(signal.id)}>
                                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Resolve
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                            {fraudSignals.length === 0 && (
                              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No fraud signals found.</TableCell></TableRow>
                            )}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Content Moderation Queue */}
              {activeSection === "content_queue" && <ContentModerationQueue />}

              {/* User Warnings & Bans */}
              {activeSection === "warnings" && <UserWarningsBans />}

              {/* Moderation Activity Log */}
              {activeSection === "activity_log" && <ModerationActivityLog />}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Report detail dialog */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Report Details</DialogTitle></DialogHeader>
          {selectedReport && (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Reason</p>
                <p className="text-sm font-medium">{selectedReport.reason}</p>
              </div>
              {selectedReport.description && (
                <div>
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="text-sm">{selectedReport.description}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge variant={selectedReport.status === "pending" ? "destructive" : "secondary"}>{selectedReport.status}</Badge>
              </div>
              {selectedReport.status === "pending" && (
                <div className="flex gap-2 pt-2">
                  <Button size="sm" onClick={() => handleReportAction(selectedReport.id, "reviewed")} disabled={processing}>
                    <CheckCircle className="w-4 h-4 mr-1" /> Mark Reviewed
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleReportAction(selectedReport.id, "dismissed")} disabled={processing}>
                    <XCircle className="w-4 h-4 mr-1" /> Dismiss
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ModeratorPanel;
