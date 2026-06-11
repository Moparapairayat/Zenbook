import { useState, useEffect } from "react";
import TablePagination, { usePagination } from "@/components/admin/TablePagination";
import BulkActionsBar from "@/components/admin/BulkActionsBar";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, FileText, Trash2, Eye, Image, Video, MessageSquare, Pin, Archive, Globe, Lock, Users, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface PostItem {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  image_url?: string | null;
  image_urls?: string[] | null;
  video_url?: string | null;
  privacy?: string;
  pinned?: boolean;
  archived?: boolean;
  comments_disabled?: boolean;
  feeling?: string | null;
  location?: string | null;
  profile?: { display_name: string | null; avatar_url: string | null } | null;
}

interface GroupPostItem {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  group_id: string;
  image_url?: string | null;
  image_urls?: string[] | null;
  pinned?: boolean;
  profile?: { display_name: string | null; avatar_url: string | null } | null;
  group?: { name: string } | null;
}

interface PagePostItem {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
  page_id: string;
  image_url?: string | null;
  image_urls?: string[] | null;
  scheduled_at?: string | null;
  profile?: { display_name: string | null; avatar_url: string | null } | null;
  page?: { name: string } | null;
}

type PostTab = "feed" | "group" | "page";

const AdminPostsManagement = () => {
  const [activeTab, setActiveTab] = useState<PostTab>("feed");
  const [feedPosts, setFeedPosts] = useState<PostItem[]>([]);
  const [groupPosts, setGroupPosts] = useState<GroupPostItem[]>([]);
  const [pagePosts, setPagePosts] = useState<PagePostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [privacyFilter, setPrivacyFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; type: PostTab } | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const fetchProfiles = async (userIds: string[]) => {
    if (!userIds.length) return {};
    const unique = [...new Set(userIds)];
    const { data } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", unique);
    const map: Record<string, { display_name: string | null; avatar_url: string | null }> = {};
    data?.forEach((p) => { map[p.user_id] = p; });
    return map;
  };

  const fetchFeedPosts = async () => {
    setLoading(true);
    const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(200);
    if (data) {
      const profiles = await fetchProfiles(data.map((p) => p.user_id));
      setFeedPosts(data.map((p) => ({ ...p, profile: profiles[p.user_id] || null })) as any);
    } else {
      setFeedPosts([]);
    }
    setLoading(false);
  };

  const fetchGroupPosts = async () => {
    setLoading(true);
    const { data } = await supabase.from("group_posts").select("*").order("created_at", { ascending: false }).limit(200);
    if (data) {
      const profiles = await fetchProfiles(data.map((p) => p.user_id));
      const groupIds = [...new Set(data.map((p) => p.group_id))];
      const { data: groups } = await supabase.from("groups").select("id, name").in("id", groupIds);
      const groupMap: Record<string, { name: string }> = {};
      groups?.forEach((g) => { groupMap[g.id] = { name: g.name }; });
      setGroupPosts(data.map((p) => ({ ...p, profile: profiles[p.user_id] || null, group: groupMap[p.group_id] || null })) as any);
    } else {
      setGroupPosts([]);
    }
    setLoading(false);
  };

  const fetchPagePosts = async () => {
    setLoading(true);
    const { data } = await supabase.from("page_posts").select("*").order("created_at", { ascending: false }).limit(200);
    if (data) {
      const profiles = await fetchProfiles(data.map((p) => p.created_by));
      const pageIds = [...new Set(data.map((p) => p.page_id))];
      const { data: pages } = await supabase.from("pages").select("id, name").in("id", pageIds);
      const pageMap: Record<string, { name: string }> = {};
      pages?.forEach((pg) => { pageMap[pg.id] = { name: pg.name }; });
      setPagePosts(data.map((p) => ({ ...p, profile: profiles[p.created_by] || null, page: pageMap[p.page_id] || null })) as any);
    } else {
      setPagePosts([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    setSelected(new Set());
    if (activeTab === "feed") fetchFeedPosts();
    else if (activeTab === "group") fetchGroupPosts();
    else if (activeTab === "page") fetchPagePosts();
  }, [activeTab]);

  const handleDeletePost = async (postId: string, type: PostTab) => {
    setDeleting(true);
    const table = type === "feed" ? "posts" : type === "group" ? "group_posts" : "page_posts";
    const { error } = await (supabase as any).from(table).delete().eq("id", postId);
    if (error) {
      toast.error("Failed to delete post");
    } else {
      toast.success("Post deleted successfully");
      setSelectedPost(null);
      setConfirmDelete(null);
      if (type === "feed") fetchFeedPosts();
      else if (type === "group") fetchGroupPosts();
      else fetchPagePosts();
    }
    setDeleting(false);
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    setDeleting(true);
    const table = activeTab === "feed" ? "posts" : activeTab === "group" ? "group_posts" : "page_posts";
    const ids = [...selected];
    const { error } = await (supabase as any).from(table).delete().in("id", ids);
    if (error) {
      toast.error("Failed to delete posts");
    } else {
      toast.success(`${ids.length} post(s) deleted`);
      setSelected(new Set());
      setConfirmBulkDelete(false);
      if (activeTab === "feed") fetchFeedPosts();
      else if (activeTab === "group") fetchGroupPosts();
      else fetchPagePosts();
    }
    setDeleting(false);
  };

  const getMediaCount = (post: any) => {
    let count = 0;
    if (post.image_url) count++;
    if (post.image_urls?.length) count += post.image_urls.length;
    if (post.video_url) count++;
    return count;
  };

  const privacyIcon = (privacy: string) => {
    switch (privacy) {
      case "public": return <Globe className="w-3.5 h-3.5 text-emerald-500" />;
      case "friends": return <Users className="w-3.5 h-3.5 text-blue-500" />;
      case "private": return <Lock className="w-3.5 h-3.5 text-amber-500" />;
      default: return <Globe className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  const filterPosts = (posts: any[]) => {
    let filtered = posts;
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.content?.toLowerCase().includes(q) ||
        p.profile?.display_name?.toLowerCase().includes(q)
      );
    }
    if (activeTab === "feed" && privacyFilter !== "all") {
      filtered = filtered.filter(p => p.privacy === privacyFilter);
    }
    return filtered;
  };

  const currentPosts = activeTab === "feed" ? filterPosts(feedPosts) : activeTab === "group" ? filterPosts(groupPosts) : filterPosts(pagePosts);
  const pagination = usePagination(currentPosts, 15);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === currentPosts.length) setSelected(new Set());
    else setSelected(new Set(currentPosts.map((p: any) => p.id)));
  };

  const totalCounts = {
    feed: feedPosts.length,
    group: groupPosts.length,
    page: pagePosts.length,
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Posts Management</h2>
            <p className="text-sm text-muted-foreground">View and manage all posts across the platform.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="cursor-pointer" onClick={() => setActiveTab("feed")}>
            <CardContent className="p-4 flex items-center gap-3">
              <FileText className={`w-8 h-8 ${activeTab === "feed" ? "text-primary" : "text-muted-foreground"}`} />
              <div>
                <p className="text-2xl font-bold text-foreground">{totalCounts.feed}</p>
                <p className="text-xs text-muted-foreground">Feed Posts</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer" onClick={() => setActiveTab("group")}>
            <CardContent className="p-4 flex items-center gap-3">
              <Users className={`w-8 h-8 ${activeTab === "group" ? "text-primary" : "text-muted-foreground"}`} />
              <div>
                <p className="text-2xl font-bold text-foreground">{totalCounts.group}</p>
                <p className="text-xs text-muted-foreground">Group Posts</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer" onClick={() => setActiveTab("page")}>
            <CardContent className="p-4 flex items-center gap-3">
              <Globe className={`w-8 h-8 ${activeTab === "page" ? "text-primary" : "text-muted-foreground"}`} />
              <div>
                <p className="text-2xl font-bold text-foreground">{totalCounts.page}</p>
                <p className="text-xs text-muted-foreground">Page Posts</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as PostTab)}>
          <TabsList>
            <TabsTrigger value="feed">Feed Posts</TabsTrigger>
            <TabsTrigger value="group">Group Posts</TabsTrigger>
            <TabsTrigger value="page">Page Posts</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by content or user..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          {activeTab === "feed" && (
            <Select value={privacyFilter} onValueChange={setPrivacyFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Privacy" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Privacy</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="friends">Friends</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Badge variant="secondary" className="text-xs">
            {currentPosts.length} post{currentPosts.length !== 1 ? "s" : ""}
          </Badge>
        </div>

        <BulkActionsBar
          selectedCount={selected.size}
          totalCount={currentPosts.length}
          onSelectAll={toggleAll}
          onClearSelection={() => setSelected(new Set())}
          allSelected={selected.size === currentPosts.length && currentPosts.length > 0}
          actions={[
            {
              label: `Delete ${selected.size}`,
              onClick: () => setConfirmBulkDelete(true),
              variant: "destructive",
              icon: <Trash2 className="w-3.5 h-3.5 mr-1" />,
            },
          ]}
        />

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : currentPosts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium">No posts found</p>
                <p className="text-xs mt-1">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={selected.size === currentPosts.length && currentPosts.length > 0}
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Content</TableHead>
                    {activeTab === "group" && <TableHead>Group</TableHead>}
                    {activeTab === "page" && <TableHead>Page</TableHead>}
                    {activeTab === "feed" && <TableHead>Privacy</TableHead>}
                    <TableHead>Media</TableHead>
                    <TableHead>Flags</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagination.paginatedItems.map((post: any) => {
                    const mediaCount = getMediaCount(post);
                    return (
                      <TableRow key={post.id} className={selected.has(post.id) ? "bg-primary/5" : ""}>
                        <TableCell>
                          <Checkbox
                            checked={selected.has(post.id)}
                            onCheckedChange={() => toggleSelect(post.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-7 h-7">
                              <AvatarImage src={post.profile?.avatar_url || ""} />
                              <AvatarFallback className="text-[10px]">
                                {(post.profile?.display_name || "U").charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium truncate max-w-[120px]">
                              {post.profile?.display_name || "Unknown"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[250px]">
                          <p className="text-sm truncate text-muted-foreground">
                            {post.content?.slice(0, 80) || "—"}
                            {post.content?.length > 80 ? "…" : ""}
                          </p>
                        </TableCell>
                        {activeTab === "group" && (
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{post.group?.name || "Unknown"}</Badge>
                          </TableCell>
                        )}
                        {activeTab === "page" && (
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{post.page?.name || "Unknown"}</Badge>
                          </TableCell>
                        )}
                        {activeTab === "feed" && (
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {privacyIcon(post.privacy)}
                              <span className="text-xs capitalize text-muted-foreground">{post.privacy}</span>
                            </div>
                          </TableCell>
                        )}
                        <TableCell>
                          {mediaCount > 0 ? (
                            <div className="flex items-center gap-1">
                              {(post.image_url || post.image_urls?.length > 0) && <Image className="w-3.5 h-3.5 text-blue-500" />}
                              {post.video_url && <Video className="w-3.5 h-3.5 text-purple-500" />}
                              <span className="text-xs text-muted-foreground">{mediaCount}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {post.pinned && <Pin className="w-3.5 h-3.5 text-amber-500" />}
                            {post.archived && <Archive className="w-3.5 h-3.5 text-muted-foreground" />}
                            {post.comments_disabled && <MessageSquare className="w-3.5 h-3.5 text-destructive line-through" />}
                            {post.scheduled_at && <Clock className="w-3.5 h-3.5 text-blue-500" />}
                            {!post.pinned && !post.archived && !post.comments_disabled && !post.scheduled_at && (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(post.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedPost({ ...post, _type: activeTab })} title="View">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost" size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setConfirmDelete({ id: post.id, type: activeTab })}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <TablePagination {...pagination} onPageChange={pagination.setCurrentPage} />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Post Detail Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={(o) => !o && setSelectedPost(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post Details</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedPost.profile?.avatar_url || ""} />
                  <AvatarFallback>{(selectedPost.profile?.display_name || "U").charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">{selectedPost.profile?.display_name || "Unknown User"}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(selectedPost.created_at), "MMM d, yyyy 'at' h:mm a")}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedPost._type === "feed" && (
                  <Badge variant="outline" className="gap-1">{privacyIcon(selectedPost.privacy)} {selectedPost.privacy}</Badge>
                )}
                {selectedPost._type === "group" && selectedPost.group && <Badge variant="outline">Group: {selectedPost.group.name}</Badge>}
                {selectedPost._type === "page" && selectedPost.page && <Badge variant="outline">Page: {selectedPost.page.name}</Badge>}
                {selectedPost.pinned && <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30">Pinned</Badge>}
                {selectedPost.archived && <Badge variant="secondary">Archived</Badge>}
                {selectedPost.comments_disabled && <Badge variant="destructive">Comments Off</Badge>}
                {selectedPost.feeling && <Badge variant="outline">Feeling: {selectedPost.feeling}</Badge>}
                {selectedPost.location && <Badge variant="outline">📍 {selectedPost.location}</Badge>}
                {selectedPost.scheduled_at && (
                  <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30">
                    Scheduled: {format(new Date(selectedPost.scheduled_at), "MMM d, h:mm a")}
                  </Badge>
                )}
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{selectedPost.content || "No content"}</p>
              </div>

              {(selectedPost.image_url || selectedPost.image_urls?.length > 0 || selectedPost.video_url) && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Media</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedPost.image_url && <img src={selectedPost.image_url} alt="Post media" className="rounded-lg w-full h-24 object-cover" />}
                    {selectedPost.image_urls?.map((url: string, idx: number) => (
                      <img key={idx} src={url} alt={`Post media ${idx + 1}`} className="rounded-lg w-full h-24 object-cover" />
                    ))}
                    {selectedPost.video_url && (
                      <div className="rounded-lg w-full h-24 bg-muted flex items-center justify-center">
                        <Video className="w-6 h-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground ml-1">Video</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground space-y-1 border-t pt-3">
                <p>Post ID: <code className="bg-muted px-1 rounded">{selectedPost.id}</code></p>
                <p>User ID: <code className="bg-muted px-1 rounded">{selectedPost.user_id || selectedPost.created_by}</code></p>
                {selectedPost.group_id && <p>Group ID: <code className="bg-muted px-1 rounded">{selectedPost.group_id}</code></p>}
                {selectedPost.page_id && <p>Page ID: <code className="bg-muted px-1 rounded">{selectedPost.page_id}</code></p>}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedPost(null)}>Close</Button>
                <Button
                  variant="destructive" size="sm" disabled={deleting}
                  onClick={() => {
                    setSelectedPost(null);
                    setConfirmDelete({ id: selectedPost.id, type: selectedPost._type });
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete Post
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Single delete confirm */}
      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        title="Delete Post"
        description="Are you sure you want to delete this post? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => confirmDelete && handleDeletePost(confirmDelete.id, confirmDelete.type)}
        loading={deleting}
      />

      {/* Bulk delete confirm */}
      <ConfirmDialog
        open={confirmBulkDelete}
        onOpenChange={setConfirmBulkDelete}
        title="Delete Selected Posts"
        description={`Are you sure you want to delete ${selected.size} post(s)? This action cannot be undone.`}
        confirmLabel={`Delete ${selected.size} Posts`}
        onConfirm={handleBulkDelete}
        loading={deleting}
      />
    </>
  );
};

export default AdminPostsManagement;
