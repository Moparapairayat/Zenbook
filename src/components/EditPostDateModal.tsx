import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface EditPostDateModalProps {
  postId: string;
  currentDate: string;
  onClose: () => void;
}

const EditPostDateModal = ({ postId, currentDate, onClose }: EditPostDateModalProps) => {
  const queryClient = useQueryClient();
  const currentParsed = new Date(currentDate);
  const [date, setDate] = useState<Date | undefined>(currentParsed);
  const [time, setTime] = useState(format(currentParsed, "HH:mm"));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!date) return;
    setSaving(true);

    const [hours, minutes] = time.split(":").map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);

    // Don't allow future dates
    if (newDate > new Date()) {
      toast.error("Post date cannot be in the future");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("posts")
      .update({ created_at: newDate.toISOString() })
      .eq("id", postId);

    if (error) {
      toast.error("Failed to update post date");
    } else {
      toast.success("Post date updated");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      onClose();
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-card rounded-xl w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Edit Post Date</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Change when this post appears on your timeline.
          </p>
        </div>

        <div className="p-5 space-y-4">
          {/* Current date display */}
          <div className="text-xs text-muted-foreground">
            Current: <span className="font-medium text-foreground">{format(currentParsed, "PPP 'at' p")}</span>
          </div>

          {/* Date picker */}
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => d > new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time picker */}
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Time</label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        </div>

        <div className="p-5 border-t border-border flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} disabled={!date || saving} className="flex-1">
            {saving ? "Saving..." : "Save Date"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditPostDateModal;
