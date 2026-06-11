import { useState, useEffect } from "react";
import TablePagination, { usePagination } from "@/components/admin/TablePagination";
import BulkActionsBar from "@/components/admin/BulkActionsBar";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Eye, CheckCircle, XCircle, AlertTriangle, Loader2, ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";

interface ContentReport {
  id: string;
  reporter_id: string;
  content_type: string;
  content_id: string;
  reason: string;
  description: string | null;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  created_at: string;
  reporter_profile?: { display_name: string | null } | null;
}

const contentTypeLabels: Record<string, string> = {
  post: "Post",
  comment: "Comment",
  group_post: "Group Post",
  page_post: "Page Post",
  reel: "Reel",
  message: "Message",
};

const statusColors: Record<string, "destructive" | "default" | "secondary" | "outline"> = {
  pending: "destructive",
  approved: "default",
  rejected: "secondary",
  escalated: "outline",
};

const logModAction = async (moderatorId: string, actionType: string, targetType: string, targetId: string, details: Record<string, any> = {}) => {
  await (supabase as any).from("moderation_log").insert({
    moderator_id: moderatorId,
    action_type: actionType,
    target_type: targetType,
    target_id: targetId,
    details,
  });
};

const ContentModerationQueue = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    let query = (supabase as any)
      .from("content_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "all") query = query.eq("status", filter);
    if (typeFilter !== "all") query = query.eq("content_type", typeFilter);

    const { data } = await query;

    // Fetch reporter profiles
    const reports = data || [];
    if (reports.length > 0) {
      const reporterIds = [...new Set(reports.map((r: any) => r.reporter_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", reporterIds as string[]);

      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));
      reports.forEach((r: any) => {
        r.reporter_profile = profileMap.get(r.reporter_id) || null;
      });
    }

    setReports(reports);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, [filter, typeFilter]);

  const handleAction = async (reportId: string, action: "approved" | "rejected" | "escalated") => {
    if (!user) return;
    setProcessing(true);
    await (supabase as any)
      .from("content_reports")
      .update({
        status: action,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_note: reviewNote || null,
      })
      .eq("id", reportId);

    await logModAction(user.id, `report_${action}`, "report", reportId, { review_note: reviewNote });
    toast.success(`Report ${action}`);
    setSelectedReport(null);
    setReviewNote("");
    setProcessing(false);
    setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: action, reviewed_by: user.id } : r)));
  };

  const [confirmBulkAction, setConfirmBulkAction] = useState<"approved" | "rejected" | null>(null);

  const handleBulkAction = async (action: "approved" | "rejected") => {
    if (!user || selected.size === 0) return;
    setProcessing(true);
    const ids = [...selected];
    await (supabase as any)
      .from("content_reports")
      .update({
        status: action,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .in("id", ids);

    await logModAction(user.id, "bulk_action", "report", ids[0], {
      action,
      count: ids.length,
      report_ids: ids,
    });

    toast.success(`${ids.length} reports ${action}`);
    setSelected(new Set());
    setConfirmBulkAction(null);
    setProcessing(false);
    setReports((prev) =>
      prev.map((r) => (ids.includes(r.id) ? { ...r, status: action, reviewed_by: user.id } : r))
    );
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    const pendingReports = reports.filter((r) => r.status === "pending");
    if (selected.size === pendingReports.length) setSelected(new Set());
    else setSelected(new Set(pendingReports.map((r) => r.id)));
  };

  const pendingCount = reports.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold text-foreground">Content Moderation Queue</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(contentTypeLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-1">
            {["pending", "approved", "rejected", "escalated", "all"].map((f) => (
              <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" className="h-8 text-xs capitalize" onClick={() => setFilter(f)}>
                {f}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <BulkActionsBar
        selectedCount={selected.size}
        totalCount={reports.filter((r) => r.status === "pending").length}
        onSelectAll={toggleAll}
        onClearSelection={() => setSelected(new Set())}
        allSelected={pendingCount > 0 && selected.size === pendingCount}
        actions={[
          { label: "Approve All", onClick: () => setConfirmBulkAction("approved"), variant: "default", icon: <CheckCircle className="w-3.5 h-3.5 mr-1" />, disabled: processing },
          { label: "Reject All", onClick: () => setConfirmBulkAction("rejected"), variant: "outline", icon: <XCircle className="w-3.5 h-3.5 mr-1" />, disabled: processing },
        ]}
      />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={pendingCount > 0 && selected.size === pendingCount}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id} className={selected.has(report.id) ? "bg-primary/5" : ""}>
                    <TableCell>
                      {report.status === "pending" && (
                        <Checkbox
                          checked={selected.has(report.id)}
                          onCheckedChange={() => toggleSelect(report.id)}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {contentTypeLabels[report.content_type] || report.content_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium max-w-[200px] truncate">{report.reason}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {report.reporter_profile?.display_name || "Unknown"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[report.status] || "secondary"} className="text-xs capitalize">
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(report.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setSelectedReport(report); setReviewNote(""); }}>
                          <Eye className="w-3.5 h-3.5 mr-1" /> View
                        </Button>
                        {report.status === "pending" && (
                          <>
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-green-600" onClick={() => handleAction(report.id, "approved")}>
                              <CheckCircle className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => handleAction(report.id, "rejected")}>
                              <XCircle className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {reports.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No content reports found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Report detail dialog */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Report Details</DialogTitle></DialogHeader>
          {selectedReport && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Content Type</p>
                  <p className="text-sm font-medium">{contentTypeLabels[selectedReport.content_type] || selectedReport.content_type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant={statusColors[selectedReport.status] || "secondary"} className="capitalize">{selectedReport.status}</Badge>
                </div>
              </div>
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
                <p className="text-xs text-muted-foreground">Reported by</p>
                <p className="text-sm">{selectedReport.reporter_profile?.display_name || "Unknown"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm">{new Date(selectedReport.created_at).toLocaleString()}</p>
              </div>
              {selectedReport.review_note && (
                <div>
                  <p className="text-xs text-muted-foreground">Review Note</p>
                  <p className="text-sm">{selectedReport.review_note}</p>
                </div>
              )}
              {selectedReport.status === "pending" && (
                <>
                  <Textarea
                    placeholder="Add a review note (optional)..."
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    className="min-h-[60px] resize-none text-sm"
                  />
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" onClick={() => handleAction(selectedReport.id, "approved")} disabled={processing}>
                      <CheckCircle className="w-4 h-4 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleAction(selectedReport.id, "rejected")} disabled={processing}>
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleAction(selectedReport.id, "escalated")} disabled={processing}>
                      <ArrowUpRight className="w-4 h-4 mr-1" /> Escalate
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmBulkAction}
        onOpenChange={(open) => !open && setConfirmBulkAction(null)}
        title={confirmBulkAction === "approved" ? "Approve Selected Reports" : "Reject Selected Reports"}
        description={`Are you sure you want to ${confirmBulkAction || "process"} ${selected.size} report(s)?`}
        confirmLabel={`${confirmBulkAction === "approved" ? "Approve" : "Reject"} ${selected.size}`}
        variant={confirmBulkAction === "rejected" ? "destructive" : "default"}
        onConfirm={() => confirmBulkAction && handleBulkAction(confirmBulkAction)}
        loading={processing}
      />
    </div>
  );
};

export default ContentModerationQueue;
