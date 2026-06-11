import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Flag } from "lucide-react";
import { toast } from "sonner";

const REASONS = [
  "Scam or fraud",
  "Prohibited item",
  "Misleading description",
  "Inappropriate content",
  "Stolen goods",
  "Other",
];

interface ReportListingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  listingTitle: string;
}

const ReportListingModal = ({ open, onOpenChange, listingId, listingTitle }: ReportListingModalProps) => {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !reason) return;
    setSubmitting(true);
    const { error } = await (supabase as any).from("listing_reports").insert({
      listing_id: listingId,
      reporter_id: user.id,
      reason,
      description: description.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      if (error.code === "23505") toast.error("You've already reported this listing");
      else toast.error("Failed to submit report");
    } else {
      toast.success("Report submitted. We'll review it shortly.");
      onOpenChange(false);
      setReason("");
      setDescription("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-destructive" /> Report Listing
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Report "<span className="font-medium text-foreground">{listingTitle}</span>"
        </p>
        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground">Reason</p>
          <div className="grid grid-cols-2 gap-2">
            {REASONS.map((r) => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  reason === r
                    ? "border-destructive bg-destructive/10 text-destructive"
                    : "border-border bg-secondary/50 text-foreground hover:bg-secondary"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <Textarea
          placeholder="Additional details (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[80px] text-sm resize-none"
          maxLength={500}
        />
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleSubmit}
            disabled={!reason || submitting}
          >
            {submitting ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportListingModal;
