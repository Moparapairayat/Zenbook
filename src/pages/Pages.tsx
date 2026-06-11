import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Plus, Search, Flag } from "lucide-react";
import { PAGE_CATEGORIES } from "@/constants/pageCategories";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CreatePage from "@/components/CreatePage";
import PageCard from "@/components/PageCard";
import { useSponsoredPosts } from "@/hooks/useSponsoredPosts";
import SponsoredPostCard from "@/components/SponsoredPostCard";
import HorizontalBannerAd from "@/components/ads/HorizontalBannerAd";
import AppPageShell from "@/components/AppPageShell";

const Pages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<"discover" | "my" | "following">("discover");
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(searchParams.get("create") === "true");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: sponsoredPosts = [] } = useSponsoredPosts(selectedCategory);
  const [followingId, setFollowingId] = useState<string | null>(null);

  // Fetch all pages
  const { data: allPages } = useQuery({
    queryKey: ["pages", search],
    queryFn: async () => {
      let query = supabase.from("pages").select("*").order("created_at", { ascending: false });
      if (search.trim()) {
        query = query.ilike("name", `%${search.trim()}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  // Fetch user's followed pages
  const { data: myFollows } = useQuery({
    queryKey: ["my-page-follows", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("page_followers")
        .select("page_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  // Fetch follower counts
  const pageIds = allPages?.map((p: any) => p.id) || [];
  const { data: followerCounts } = useQuery({
    queryKey: ["page-follower-counts", pageIds],
    queryFn: async () => {
      if (!pageIds.length) return {};
      const { data, error } = await supabase
        .from("page_followers")
        .select("page_id")
        .in("page_id", pageIds);
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach((f: any) => {
        counts[f.page_id] = (counts[f.page_id] || 0) + 1;
      });
      return counts;
    },
    enabled: pageIds.length > 0,
  });

  const followedPageIds = new Set((myFollows || []).map((f: any) => f.page_id));
  const countsMap = (followerCounts || {}) as Record<string, number>;

  const handleFollow = async (pageId: string) => {
    if (!user) return;
    setFollowingId(pageId);
    try {
      if (followedPageIds.has(pageId)) {
        await supabase.from("page_followers").delete().eq("page_id", pageId).eq("user_id", user.id);
        toast.success("Unfollowed page");
      } else {
        await supabase.from("page_followers").insert({ page_id: pageId, user_id: user.id });
        toast.success("Now following this page!");
      }
      queryClient.invalidateQueries({ queryKey: ["my-page-follows"] });
      queryClient.invalidateQueries({ queryKey: ["page-follower-counts"] });
    } catch {
      toast.error("Something went wrong");
    }
    setFollowingId(null);
  };

  // Filter pages
  let displayPages = allPages || [];
  if (tab === "my") {
    displayPages = displayPages.filter((p: any) => p.created_by === user?.id);
  } else if (tab === "following") {
    displayPages = displayPages.filter((p: any) => followedPageIds.has(p.id));
  }
  if (selectedCategory) {
    displayPages = displayPages.filter((p: any) => p.category === selectedCategory);
  }

  return (
    <AppPageShell>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Flag className="w-7 h-7 text-primary" />
            Pages
          </h1>
          <Button onClick={() => setShowCreate(true)} size="sm">
            <Plus className="w-4 h-4" />
            Create Page
          </Button>
        </div>

        {/* Tabs + Filters (single row) */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex bg-secondary rounded-lg p-1">
            {(["discover", "my", "following"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "discover" ? "Discover" : t === "my" ? "My Pages" : "Following"}
              </button>
            ))}
          </div>

          <Select value={selectedCategory || "all"} onValueChange={(val) => setSelectedCategory(val === "all" ? null : val)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {PAGE_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 ml-auto"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {showSearch && (
          <div className="relative mb-5 animate-fade-in">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search pages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary text-foreground border border-border text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
        )}

        {/* Banner Ad */}
        <HorizontalBannerAd category={selectedCategory} variant="standard" className="mb-5" />

        {/* Pages grid */}
        {displayPages.length === 0 ? (
          <div className="bg-card rounded-xl shadow-sm p-12 text-center">
            <Flag className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium text-foreground">
              {tab === "my" ? "You haven't created any pages yet" : tab === "following" ? "You're not following any pages" : "No pages found"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {tab === "my" ? "Create a page to represent your business, brand, or community." : "Discover and follow pages to see their updates in your feed."}
            </p>
            {tab === "my" && (
              <Button onClick={() => setShowCreate(true)} className="mt-4">
                Create Your First Page
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayPages.map((page: any) => (
                <PageCard
                  key={page.id}
                  id={page.id}
                  name={page.name}
                  slug={page.slug}
                  description={page.description}
                  avatarUrl={page.avatar_url}
                  coverPhotoUrl={page.cover_photo_url}
                  category={page.category}
                  followerCount={countsMap[page.id] || 0}
                  isFollowing={followedPageIds.has(page.id)}
                  onFollow={handleFollow}
                  following={followingId === page.id}
                />
              ))}
            </div>
            {sponsoredPosts.length > 0 && displayPages.length >= 3 && (
              <SponsoredPostCard post={sponsoredPosts[0]} />
            )}
          </div>
        )}

        <CreatePage open={showCreate} onClose={() => setShowCreate(false)} />
    </AppPageShell>
  );
};

export default Pages;
