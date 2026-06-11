import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HandCoins, Check, X, Clock, CheckCircle2, XCircle, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface ListingOffersProps {
  listingId: string;
  listingTitle: string;
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending", icon: <Clock className="w-3 h-3" />, variant: "secondary" },
  accepted: { label: "Accepted", icon: <CheckCircle2 className="w-3 h-3" />, variant: "default" },
  rejected: { label: "Declined", icon: <XCircle className="w-3 h-3" />, variant: "destructive" },
};

const ListingOffers = ({ listingId, listingTitle }: ListingOffersProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ["listing-offers", listingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listing_offers")
        .select("*")
        .eq("listing_id", listingId)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const buyerIds = [...new Set((data as any[]).map((o: any) => o.buyer_id))];
      if (buyerIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", buyerIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
      return (data as any[]).map((o: any) => ({ ...o, buyer: profileMap.get(o.buyer_id) || null }));
    },
    enabled: !!user && !!listingId,
  });

  const respondToOffer = async (offerId: string, buyerId: string, status: "accepted" | "rejected") => {
    if (!user) return;

    const { error } = await supabase
      .from("listing_offers")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", offerId);

    if (error) {
      toast.error("Failed to update offer");
      return;
    }

    // Notify the buyer
    await supabase.from("notifications").insert({
      user_id: buyerId,
      actor_id: user.id,
      type: status === "accepted" ? "offer_accepted" : "offer_rejected",
      message: status === "accepted"
        ? `accepted your offer on "${listingTitle}"`
        : `declined your offer on "${listingTitle}"`,
      reference_id: listingId,
    });

    toast.success(status === "accepted" ? "Offer accepted!" : "Offer declined");
    queryClient.invalidateQueries({ queryKey: ["listing-offers", listingId] });
  };

  const handleMessageBuyer = async (buyerId: string) => {
    if (!user) return;

    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("is_group", false)
      .or(
        `and(participant_one.eq.${user.id},participant_two.eq.${buyerId}),and(participant_one.eq.${buyerId},participant_two.eq.${user.id})`
      )
      .maybeSingle();

    if (existing) {
      navigate(`/messages?conversation=${existing.id}`);
      return;
    }

    const { data: conv, error } = await supabase
      .from("conversations")
      .insert({ participant_one: user.id, participant_two: buyerId, is_group: false })
      .select("id")
      .single();

    if (error) {
      toast.error("Failed to start conversation");
      return;
    }
    navigate(`/messages?conversation=${conv.id}`);
  };

  const pendingOffers = offers.filter((o: any) => o.status === "pending");
  const pastOffers = offers.filter((o: any) => o.status !== "pending");

  if (isLoading) return null;
  if (offers.length === 0) return null;

  return (
    <div className="rounded-lg bg-card shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <HandCoins className="w-4 h-4 text-primary" /> Offers
        </h3>
        {pendingOffers.length > 0 && (
          <Badge variant="default" className="text-[10px]">
            {pendingOffers.length} pending
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        {pendingOffers.map((offer: any) => (
          <div key={offer.id} className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={offer.buyer?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {(offer.buyer?.display_name || "?")[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">{offer.buyer?.display_name || "Unknown"}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(offer.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <p className="text-lg font-bold text-foreground">${Number(offer.amount).toLocaleString()}</p>
            </div>

            {offer.message && (
              <p className="text-xs text-muted-foreground italic bg-secondary/50 rounded-md px-2.5 py-1.5">
                "{offer.message}"
              </p>
            )}

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="flex-1 h-8 text-xs"
                onClick={() => respondToOffer(offer.id, offer.buyer_id, "accepted")}
              >
                <Check className="w-3.5 h-3.5 mr-1" /> Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-8 text-xs"
                onClick={() => respondToOffer(offer.id, offer.buyer_id, "rejected")}
              >
                <X className="w-3.5 h-3.5 mr-1" /> Decline
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => handleMessageBuyer(offer.buyer_id)}
                title="Message buyer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}

        {pastOffers.length > 0 && (
          <div className="space-y-2">
            {pendingOffers.length > 0 && (
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider pt-1">Previous</p>
            )}
            {pastOffers.map((offer: any) => {
              const cfg = STATUS_CONFIG[offer.status] || STATUS_CONFIG.pending;
              return (
                <div key={offer.id} className="flex items-center justify-between rounded-lg border border-border p-2.5">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-7 h-7">
                      <AvatarImage src={offer.buyer?.avatar_url || ""} />
                      <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                        {(offer.buyer?.display_name || "?")[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-medium text-foreground">{offer.buyer?.display_name || "Unknown"}</p>
                      <p className="text-[10px] text-muted-foreground">
                        ${Number(offer.amount).toLocaleString()} · {formatDistanceToNow(new Date(offer.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <Badge variant={cfg.variant} className="text-[10px] flex items-center gap-1">
                    {cfg.icon} {cfg.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingOffers;
