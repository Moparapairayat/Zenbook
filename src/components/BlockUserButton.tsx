import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { UserX, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface BlockUserButtonProps {
  targetUserId: string;
  className?: string;
}

const BlockUserButton = ({ targetUserId, className = "" }: BlockUserButtonProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { data: isBlocked } = useQuery({
    queryKey: ["is-blocked", user?.id, targetUserId],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from("blocked_users")
        .select("id")
        .eq("blocker_id", user.id)
        .eq("blocked_id", targetUserId)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user && user.id !== targetUserId,
  });

  if (!user || user.id === targetUserId) return null;

  const toggle = async () => {
    setLoading(true);
    if (isBlocked) {
      await supabase.from("blocked_users").delete().eq("blocker_id", user.id).eq("blocked_id", targetUserId);
      toast.success("User unblocked");
    } else {
      await supabase.from("blocked_users").insert({ blocker_id: user.id, blocked_id: targetUserId });
      toast.success("User blocked. Their listings will be hidden from you.");
    }
    queryClient.invalidateQueries({ queryKey: ["is-blocked", user.id, targetUserId] });
    queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
    queryClient.invalidateQueries({ queryKey: ["listings"] });
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1.5 text-xs transition-colors ${
        isBlocked
          ? "text-muted-foreground hover:text-foreground"
          : "text-muted-foreground hover:text-destructive"
      } ${className}`}
    >
      {isBlocked ? (
        <>
          <UserCheck className="w-3.5 h-3.5" /> Unblock User
        </>
      ) : (
        <>
          <UserX className="w-3.5 h-3.5" /> Block User
        </>
      )}
    </button>
  );
};

export default BlockUserButton;
