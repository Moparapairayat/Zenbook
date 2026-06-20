import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Globe, Lock, Users, Settings, UserPlus, LogOut, Shield, ShieldCheck, UserMinus, Image as ImageIcon, ArrowLeft, Camera, Loader2, MessageCircle, Pencil, Check, X, MoreHorizontal, Trash2, Pin, Tag, Link, Copy, CheckCheck, Crown, Bell, BellOff, BarChart3, Rocket } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GROUP_CATEGORIES } from "@/constants/groupCategories";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

import defaultAvatar from "@/assets/default-avatar.jpg";
import GroupPostInteractions from "@/components/GroupPostInteractions";
import ImageLightbox from "@/components/ImageLightbox";
import GroupEvents from "@/components/GroupEvents";
import GroupAnalytics from "@/components/GroupAnalytics";
import { useGroupNotificationPrefs } from "@/hooks/useGroupNotificationPrefs";
import { useSponsoredPosts } from "@/hooks/useSponsoredPosts";
import SponsoredPostCard from "@/components/SponsoredPostCard";
import HorizontalBannerAd from "@/components/ads/HorizontalBannerAd";
import AppPageShell from "@/components/AppPageShell";
import BoostPostModal from "@/components/BoostPostModal";

const GroupDetail = () => {
  const { groupId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventsRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postImages, setPostImages] = useState<File[]>([]);
  const [postImagePreviews, setPostImagePreviews] = useState<string[]>([]);
  const postImageInputRef = useRef<HTMLInputElement>(null);
  const [posting, setPosting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrivacy, setEditPrivacy] = useState<"public" | "private">("public");
  const [editCategory, setEditCategory] = useState("General");
  const [editRules, setEditRules] = useState("");
  const [saving, setSaving] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviting, setInviting] = useState<string | null>(null);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPost, setLightboxPost] = useState<any>(null);
  const [transferTarget, setTransferTarget] = useState<any>(null);
  const [showNotifSettings, setShowNotifSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [boostPostId, setBoostPostId] = useState<string | null>(null);
  const [boostPostContent, setBoostPostContent] = useState("");
  const { prefs: notifPrefs, toggleMute, updatePrefs: updateNotifPrefs } = useGroupNotificationPrefs(groupId);
  // sponsoredPosts hook moved below group query
  // Auto-scroll to events section when deep-linked
  useEffect(() => {
    if (searchParams.get("tab") === "events" && eventsRef.current) {
      setTimeout(() => {
        eventsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 500);
    }
  }, [searchParams]);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingPostContent, setEditingPostContent] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const handleEditPost = async (postId: string) => {
    if (!editingPostContent.trim()) return;
    setSavingEdit(true);
    try {
      const { error } = await supabase
        .from("group_posts")
        .update({ content: editingPostContent.trim() })
        .eq("id", postId);
      if (error) throw error;
      setEditingPostId(null);
      refetchPosts();
      toast.success("Post updated");
    } catch {
      toast.error("Failed to update post");
    } finally {
      setSavingEdit(false);
    }
  };

  const { data: group } = useQuery({
    queryKey: ["group", groupId],
    queryFn: async () => {
      const { data, error } = await supabase.from("groups").select("*").eq("id", groupId!).single();
      if (error) throw error;
      return data as any;
    },
    enabled: !!groupId,
  });
  const { data: sponsoredPosts = [] } = useSponsoredPosts(group?.category);

  const { data: members, refetch: refetchMembers } = useQuery({
    queryKey: ["group-detail-members", groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("group_members")
        .select("*")
        .eq("group_id", groupId!)
        .order("joined_at");
      if (error) throw error;

      const userIds = (data || []).map((m: any) => m.user_id);
      if (!userIds.length) return [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
      return (data || []).map((m: any) => ({ ...m, profile: profileMap.get(m.user_id) }));
    },
    enabled: !!groupId,
  });

  const { data: posts, refetch: refetchPosts } = useQuery({
    queryKey: ["group-posts", groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("group_posts")
        .select("*")
        .eq("group_id", groupId!)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const userIds = [...new Set((data || []).map((p: any) => p.user_id))];
      if (!userIds.length) return [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
      return (data || []).map((p: any) => ({ ...p, profile: profileMap.get(p.user_id) }));
    },
    enabled: !!groupId,
  });

  // Fetch friends who are NOT already in the group
  const { data: invitableFriends } = useQuery({
    queryKey: ["invitable-friends", groupId, user?.id],
    queryFn: async () => {
      if (!user || !groupId) return [];
      // Get accepted friendships
      const { data: friendships } = await supabase
        .from("friendships")
        .select("requester_id, addressee_id")
        .eq("status", "accepted")
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);
      if (!friendships?.length) return [];

      const friendIds = friendships.map((f: any) =>
        f.requester_id === user.id ? f.addressee_id : f.requester_id
      );

      // Get current group member user_ids
      const { data: currentMembers } = await supabase
        .from("group_members")
        .select("user_id")
        .eq("group_id", groupId);
      const memberIds = new Set((currentMembers || []).map((m: any) => m.user_id));

      // Filter out already-members
      const availableIds = friendIds.filter((id: string) => !memberIds.has(id));
      if (!availableIds.length) return [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", availableIds);
      return profiles || [];
    },
    enabled: !!user && !!groupId && showInvite,
  });

  const approvedMembers = members?.filter((m: any) => m.status === "approved") || [];
  const pendingMembers = members?.filter((m: any) => m.status === "pending") || [];
  const currentMember = approvedMembers.find((m: any) => m.user_id === user?.id);
  const isAdmin = currentMember?.role === "admin";
  const isMod = currentMember?.role === "moderator" || isAdmin;
  const isSoleAdmin = isAdmin && approvedMembers.filter((m: any) => m.role === "admin").length === 1;

  const handleGenerateInviteLink = async () => {
    if (!groupId || !user) return;
    setGeneratingLink(true);
    try {
      // Check for existing active invite
      const { data: existing } = await supabase
        .from("group_invites" as any)
        .select("code")
        .eq("group_id", groupId)
        .eq("is_active", true)
        .limit(1);

      if (existing && (existing as any[]).length > 0) {
        const code = (existing as any[])[0].code;
        setInviteLink(`${window.location.origin}/groups/invite/${code}`);
      } else {
        const { data, error } = await supabase
          .from("group_invites" as any)
          .insert({ group_id: groupId, created_by: user.id } as any)
          .select("code")
          .single();
        if (error) throw error;
        setInviteLink(`${window.location.origin}/groups/invite/${(data as any).code}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate invite link");
    } finally {
      setGeneratingLink(false);
    }
  };

  const handleCopyInviteLink = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    toast.success("Invite link copied!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleInviteFriend = async (friendId: string) => {
    if (!groupId) return;
    setInviting(friendId);
    try {
      const { error } = await supabase
        .from("group_members")
        .insert({ group_id: groupId, user_id: friendId, role: "member", status: "approved" });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["invitable-friends", groupId] });
      queryClient.invalidateQueries({ queryKey: ["group-detail-members", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("Friend added to group!");
    } catch (err: any) {
      toast.error(err.message || "Failed to invite");
    } finally {
      setInviting(null);
    }
  };

  const handlePost = async () => {
    if (!user || (!postContent.trim() && postImages.length === 0) || !groupId) return;
    setPosting(true);
    try {
      // Upload images
      let uploadedUrls: string[] = [];
      if (postImages.length > 0) {
        for (const file of postImages) {
          const ext = file.name.split(".").pop();
          const path = `${groupId}/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { error: uploadErr } = await supabase.storage
            .from("group-images")
            .upload(path, file);
          if (uploadErr) throw uploadErr;
          const { data: { publicUrl } } = supabase.storage
            .from("group-images")
            .getPublicUrl(path);
          uploadedUrls.push(publicUrl);
        }
      }

      const { error } = await supabase
        .from("group_posts")
        .insert({
          group_id: groupId,
          user_id: user.id,
          content: postContent.trim() || " ",
          image_url: uploadedUrls[0] || null,
          image_urls: uploadedUrls.length > 0 ? uploadedUrls : null,
        });
      if (error) throw error;
      setPostContent("");
      setPostImages([]);
      setPostImagePreviews([]);
      refetchPosts();
      toast.success("Posted to group!");
    } catch (err: any) {
      toast.error(err.message || "Failed to post");
    } finally {
      setPosting(false);
    }
  };

  const handlePostImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + postImages.length > 10) {
      toast.error("Maximum 10 images per post");
      return;
    }
    const newFiles = [...postImages, ...files].slice(0, 10);
    setPostImages(newFiles);
    setPostImagePreviews(newFiles.map((f) => URL.createObjectURL(f)));
    e.target.value = "";
  };

  const removePostImage = (index: number) => {
    const newFiles = postImages.filter((_, i) => i !== index);
    setPostImages(newFiles);
    setPostImagePreviews(newFiles.map((f) => URL.createObjectURL(f)));
  };

  const handleImageUpload = async (file: File, type: "avatar" | "cover") => {
    if (!groupId || !isAdmin) return;
    const setUploading = type === "avatar" ? setUploadingAvatar : setUploadingCover;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${groupId}/${type}s/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("group-images")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("group-images")
        .getPublicUrl(path);

      const updateField = type === "avatar" ? "avatar_url" : "cover_photo_url";
      const { error: updateError } = await supabase
        .from("groups")
        .update({ [updateField]: publicUrl } as never)
        .eq("id", groupId);
      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success(`${type === "avatar" ? "Avatar" : "Cover photo"} updated!`);
    } catch (err: any) {
      toast.error(err.message || `Failed to upload ${type}`);
    } finally {
      setUploading(false);
    }
  };

  const openSettings = () => {
    if (!group) return;
    setEditName(group.name);
    setEditDescription(group.description || "");
    setEditPrivacy(group.privacy as "public" | "private");
    setEditCategory((group as any).category || "General");
    setEditRules((group as any).rules || "");
    setShowSettings(true);
  };

  const handleSaveSettings = async () => {
    if (!groupId || !editName.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("groups")
        .update({
          name: editName.trim().slice(0, 100),
          description: editDescription.trim().slice(0, 500) || null,
          privacy: editPrivacy,
          category: editCategory,
          rules: editRules.trim() || null,
        } as any)
        .eq("id", groupId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["my-groups"] });
      setShowSettings(false);
      toast.success("Group settings updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handleLeave = async () => {
    if (!user || !groupId) return;
    try {
      await supabase.from("group_members").delete().eq("group_id", groupId).eq("user_id", user.id);
      queryClient.invalidateQueries({ queryKey: ["my-groups"] });
      toast.success("Left group");
      navigate("/groups");
    } catch {
      toast.error("Failed to leave group");
    }
  };

  const handleApproveMember = async (memberId: string) => {
    try {
      await supabase.from("group_members").update({ status: "approved" }).eq("id", memberId);
      refetchMembers();
      toast.success("Member approved!");
    } catch {
      toast.error("Failed to approve");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await supabase.from("group_members").delete().eq("id", memberId);
      refetchMembers();
      toast.success("Member removed");
    } catch {
      toast.error("Failed to remove");
    }
  };

  const handleSetRole = async (memberId: string, role: string) => {
    try {
      await supabase.from("group_members").update({ role }).eq("id", memberId);
      refetchMembers();
      toast.success(`Role updated to ${role}`);
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleMuteMember = async (memberId: string, muted: boolean) => {
    try {
      await supabase.from("group_members").update({ status: muted ? "muted" : "approved" }).eq("id", memberId);
      refetchMembers();
      toast.success(muted ? "Member muted" : "Member unmuted");
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleTransferOwnership = async () => {
    if (!transferTarget || !groupId || !user) return;
    try {
      // Promote the target to admin
      await supabase.from("group_members").update({ role: "admin" }).eq("id", transferTarget.id);
      // Update groups.created_by to the new owner
      await supabase.from("groups").update({ created_by: transferTarget.user_id } as any).eq("id", groupId);
      // Demote self to member
      const selfMember = approvedMembers.find((m: any) => m.user_id === user.id);
      if (selfMember) {
        await supabase.from("group_members").update({ role: "member" }).eq("id", selfMember.id);
      }
      setTransferTarget(null);
      refetchMembers();
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      toast.success(`Ownership transferred to ${transferTarget.profile?.display_name || "member"}`);
    } catch {
      toast.error("Failed to transfer ownership");
    }
  };
  const handlePinPost = async (postId: string, pinned: boolean) => {
    if (!user || !groupId) return;
    try {
      const { error } = await supabase
        .from("group_posts")
        .update(pinned
          ? { pinned: true, pinned_at: new Date().toISOString(), pinned_by: user.id }
          : { pinned: false, pinned_at: null, pinned_by: null }
        )
        .eq("id", postId);
      if (error) throw error;
      refetchPosts();
      toast.success(pinned ? "Post pinned" : "Post unpinned");
    } catch {
      toast.error("Failed to update pin");
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      // Find the post to get its image URLs before deleting
      const post = posts?.find((p: any) => p.id === postId);
      const imageUrls: string[] = post?.image_urls || [];

      // Delete images from storage bucket
      if (imageUrls.length > 0) {
        const filePaths = imageUrls
          .map((url: string) => {
            const match = url.match(/group-images\/(.+)$/);
            return match ? match[1] : null;
          })
          .filter(Boolean) as string[];

        if (filePaths.length > 0) {
          await supabase.storage.from("group-images").remove(filePaths);
        }
      }

      await supabase.from("group_posts").delete().eq("id", postId);
      refetchPosts();
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (!group) return <div className="min-h-screen bg-background" />;

  return (
    <AppPageShell as="div">
        {/* Back */}
        <Button variant="ghost" size="sm" onClick={() => navigate("/groups")} className="mb-4 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Groups
        </Button>

        {/* Group Header */}
        <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border">
          {/* Cover Photo */}
          <div
            className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 relative"
            style={group.cover_photo_url ? { backgroundImage: `url(${group.cover_photo_url})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
          />
          <div className="p-5 -mt-10">
            <div className="flex items-end gap-4">
              {/* Avatar */}
              <div
                className="w-20 h-20 rounded-xl bg-primary/20 border-4 border-card flex items-center justify-center overflow-hidden relative"
              >
                {group.avatar_url ? (
                  <img src={group.avatar_url} alt={group.name} className="w-full h-full object-cover" />
                ) : (
                  <Users className="w-10 h-10 text-primary" />
                )}
              </div>
              <div className="flex-1 pb-1">
                <h1 className="text-xl font-bold text-foreground">{group.name}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {group.privacy === "private" ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                  <span>{group.privacy === "private" ? "Private" : "Public"} group</span>
                  <span>·</span>
                  <span>{approvedMembers.length} {approvedMembers.length === 1 ? "member" : "members"}</span>
                </div>
              </div>
            </div>
            {((group as any).category && (group as any).category !== "General") && (
              <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <Tag className="w-3 h-3" />
                {(group as any).category}
              </span>
            )}
            {group.description && (
              <p className="text-sm text-muted-foreground mt-2">{group.description}</p>
            )}
            {(group as any).rules && (
              <details className="mt-2 text-sm">
                <summary className="text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Group Rules
                </summary>
                <p className="mt-1.5 text-muted-foreground whitespace-pre-line text-xs bg-secondary/50 rounded-lg p-3">
                  {(group as any).rules}
                </p>
              </details>
            )}

            <div className="flex items-center gap-2 mt-4">
              {currentMember && group.conversation_id && (
                <Button size="sm" onClick={() => navigate(`/messages?conversation=${group.conversation_id}`)}>
                  <MessageCircle className="w-4 h-4" />
                  Group Chat
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={() => setShowMembers(!showMembers)}>
                <Users className="w-4 h-4" />
                Members {pendingMembers.length > 0 && isMod && `(${pendingMembers.length} pending)`}
              </Button>
              {currentMember && (
                <Button variant="secondary" size="sm" onClick={() => setShowInvite(!showInvite)}>
                  <UserPlus className="w-4 h-4" />
                  Invite
                </Button>
              )}
              {currentMember && (
                <Button
                  variant={notifPrefs.muted ? "ghost" : "secondary"}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setShowNotifSettings(!showNotifSettings)}
                  title={notifPrefs.muted ? "Notifications muted" : "Notification settings"}
                >
                  {notifPrefs.muted ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                </Button>
              )}
              {currentMember && (
                <Button variant="ghost" size="sm" onClick={() => setShowLeaveConfirm(true)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <LogOut className="w-4 h-4" />
                  Leave
                </Button>
              )}
            </div>
          </div>
        </div>


        {/* Notification Settings Panel */}
        {showNotifSettings && currentMember && (
          <div className="bg-card rounded-xl shadow-sm border border-border mt-4 p-4 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notification Settings
              </h2>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowNotifSettings(false)}>
                <X className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>

            <div className="space-y-3">
              {/* Mute All */}
              <label className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 cursor-pointer">
                <div className="flex items-center gap-2">
                  <BellOff className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Mute all notifications</p>
                    <p className="text-xs text-muted-foreground">Silence all alerts from this group</p>
                  </div>
                </div>
                <button
                  onClick={toggleMute}
                  className={`relative w-10 h-6 rounded-full transition-colors ${
                    notifPrefs.muted ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    notifPrefs.muted ? "left-5" : "left-1"
                  }`} />
                </button>
              </label>

              {!notifPrefs.muted && (
                <>
                  {/* New Posts */}
                  <label className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 cursor-pointer transition-colors">
                    <div>
                      <p className="text-sm font-medium text-foreground">New posts</p>
                      <p className="text-xs text-muted-foreground">Get notified when members post</p>
                    </div>
                    <button
                      onClick={() => updateNotifPrefs({ notify_posts: !notifPrefs.notify_posts })}
                      className={`relative w-10 h-6 rounded-full transition-colors ${
                        notifPrefs.notify_posts ? "bg-primary" : "bg-muted-foreground/30"
                      }`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        notifPrefs.notify_posts ? "left-5" : "left-1"
                      }`} />
                    </button>
                  </label>

                  {/* Comments */}
                  <label className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 cursor-pointer transition-colors">
                    <div>
                      <p className="text-sm font-medium text-foreground">Comments</p>
                      <p className="text-xs text-muted-foreground">Get notified about comments on your posts</p>
                    </div>
                    <button
                      onClick={() => updateNotifPrefs({ notify_comments: !notifPrefs.notify_comments })}
                      className={`relative w-10 h-6 rounded-full transition-colors ${
                        notifPrefs.notify_comments ? "bg-primary" : "bg-muted-foreground/30"
                      }`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        notifPrefs.notify_comments ? "left-5" : "left-1"
                      }`} />
                    </button>
                  </label>

                  {/* Events */}
                  <label className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 cursor-pointer transition-colors">
                    <div>
                      <p className="text-sm font-medium text-foreground">Events</p>
                      <p className="text-xs text-muted-foreground">Get notified about new events and reminders</p>
                    </div>
                    <button
                      onClick={() => updateNotifPrefs({ notify_events: !notifPrefs.notify_events })}
                      className={`relative w-10 h-6 rounded-full transition-colors ${
                        notifPrefs.notify_events ? "bg-primary" : "bg-muted-foreground/30"
                      }`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        notifPrefs.notify_events ? "left-5" : "left-1"
                      }`} />
                    </button>
                  </label>
                </>
              )}
            </div>
          </div>
        )}


        {/* Invite Friends Panel */}
        {showInvite && currentMember && (
          <div className="bg-card rounded-xl shadow-sm border border-border mt-4 p-4 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-foreground flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Invite Friends
              </h2>
              <button onClick={() => setShowInvite(false)} className="p-1 rounded hover:bg-secondary transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            {/* Shareable Invite Link */}
            {isMod && (
              <div className="mb-4 pb-4 border-b border-border">
                <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                  <Link className="w-3.5 h-3.5" />
                  Shareable Invite Link
                </p>
                {inviteLink ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={inviteLink}
                      className="flex-1 px-3 py-2 bg-secondary rounded-lg text-sm text-foreground border-none outline-none truncate"
                    />
                    <button
                      onClick={handleCopyInviteLink}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
                    >
                      {copiedLink ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedLink ? "Copied!" : "Copy"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerateInviteLink}
                    disabled={generatingLink}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {generatingLink ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link className="w-4 h-4" />}
                    {generatingLink ? "Generating..." : "Generate Invite Link"}
                  </button>
                )}
              </div>
            )}

            <p className="text-sm font-medium text-foreground mb-2">Invite Friends</p>
            {!invitableFriends?.length ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No friends available to invite. They may already be members.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {invitableFriends.map((friend: any) => (
                  <div key={friend.user_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                    <img
                      src={friend.avatar_url || defaultAvatar}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <span className="flex-1 text-sm font-medium text-foreground truncate">
                      {friend.display_name || "Unknown"}
                    </span>
                    <button
                      onClick={() => handleInviteFriend(friend.user_id)}
                      disabled={inviting === friend.user_id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {inviting === friend.user_id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <UserPlus className="w-3 h-3" />
                      )}
                      {inviting === friend.user_id ? "Adding..." : "Add"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Members Panel */}
        {showMembers && (
          <div className="bg-card rounded-xl shadow-sm border border-border mt-4 p-4 animate-fade-in">
            <h2 className="font-bold text-foreground mb-3">Members</h2>

            <div className="space-y-2">
              {approvedMembers.map((m: any) => (
                <div key={m.id} className={`flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors ${m.user_id === user?.id ? "ring-1 ring-primary/20 bg-primary/5" : ""}`}>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <img
                        src={m.profile?.avatar_url || defaultAvatar}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover cursor-pointer"
                        onClick={() => navigate(`/profile/${m.user_id}`)}
                      />
                      {m.role === "admin" && (
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                          <Crown className="w-2.5 h-2.5" />
                        </span>
                      )}
                      {m.role === "moderator" && (
                        <span className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-0.5">
                          <ShieldCheck className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-foreground cursor-pointer hover:underline" onClick={() => navigate(`/profile/${m.user_id}`)}>
                          {m.profile?.display_name || "Unknown"}
                        </span>
                        {m.user_id === user?.id && <span className="text-[10px] font-medium text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">You</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        {m.role === "admin" && <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">Admin</span>}
                        {m.role === "moderator" && <span className="text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">Mod</span>}
                        {m.role === "member" && <span className="text-[10px] text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded">Member</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Events */}
        {currentMember && (
          <div ref={eventsRef}>
            <GroupEvents groupId={groupId!} isAdminOrMod={isMod} />
          </div>
        )}

        {/* Post Composer */}
        {currentMember && currentMember.status !== "muted" && (
          <div className="bg-card rounded-xl shadow-sm border border-border mt-4 p-4">
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Write something to the group..."
              className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground resize-none outline-none focus:ring-2 focus:ring-primary/30"
              rows={3}
            />
            {/* Image previews */}
            {postImagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {postImagePreviews.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePostImage(i)}
                      className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between mt-2">
              <button
                onClick={() => postImageInputRef.current?.click()}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
                Photo
              </button>
              <input
                ref={postImageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePostImageSelect}
              />
              <button
                onClick={handlePost}
                disabled={(!postContent.trim() && postImages.length === 0) || posting}
                className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {posting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        )}

        {/* Banner Ad */}
        <HorizontalBannerAd category={group?.category} variant="slim" className="mt-4" />

        {/* Posts Feed */}
        <div className="space-y-4 mt-4">
          {[...(posts || [])].sort((a: any, b: any) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return 0;
          }).map((post: any, index: number) => (
            <div key={post.id}>
            <div className={`bg-card rounded-xl shadow-sm border p-4 ${post.pinned ? "border-primary/40 ring-1 ring-primary/20" : "border-border"}`}>
              {post.pinned && (
                <div className="flex items-center gap-1.5 text-xs text-primary font-medium mb-2 -mt-1">
                  <Pin className="w-3 h-3" /> Pinned post
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={post.profile?.avatar_url || defaultAvatar}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover cursor-pointer"
                    onClick={() => navigate(`/profile/${post.user_id}`)}
                  />
                  <div>
                    <p className="text-sm font-semibold text-foreground cursor-pointer hover:underline" onClick={() => navigate(`/profile/${post.user_id}`)}>
                      {post.profile?.display_name || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      {post.updated_at !== post.created_at && " · edited"}
                    </p>
                  </div>
                </div>
                {(post.user_id === user?.id || isMod) && (
                  <div className="relative group/menu">
                    <button className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[140px] opacity-0 invisible group-focus-within/menu:opacity-100 group-focus-within/menu:visible transition-all z-10">
                      {post.user_id === user?.id && (
                        <button
                          onClick={() => {
                            setEditingPostId(post.id);
                            setEditingPostContent(post.content || "");
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit post
                        </button>
                      )}
                      {isMod && (
                        <button
                          onClick={() => handlePinPost(post.id, !post.pinned)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                        >
                          <Pin className="w-3.5 h-3.5" /> {post.pinned ? "Unpin post" : "Pin post"}
                        </button>
                        )}
                        {post.user_id === user?.id && (
                          <button
                            onClick={() => { setBoostPostId(post.id); setBoostPostContent(post.content || ""); }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                          >
                            <Rocket className="w-3.5 h-3.5" /> Boost post
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-secondary transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete post
                        </button>
                    </div>
                  </div>
                )}
              </div>
              {editingPostId === post.id ? (
                <div className="mt-3">
                  <textarea
                    value={editingPostContent}
                    onChange={(e) => setEditingPostContent(e.target.value)}
                    className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none min-h-[80px]"
                    maxLength={5000}
                    autoFocus
                  />
                  <div className="flex items-center gap-2 mt-2 justify-end">
                    <button
                      onClick={() => setEditingPostId(null)}
                      className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleEditPost(post.id)}
                      disabled={!editingPostContent.trim() || savingEdit}
                      className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {savingEdit ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                post.content?.trim() && (
                  <p className="text-foreground text-[15px] mt-3 whitespace-pre-wrap">{post.content}</p>
                )
              )}
              {/* Post Images */}
              {(() => {
                const images: string[] = post.image_urls?.length > 0
                  ? post.image_urls
                  : post.image_url
                    ? [post.image_url]
                    : [];
                if (images.length === 0) return null;
                return (
                  <div className={`mt-3 grid gap-1 rounded-lg overflow-hidden ${
                    images.length === 1 ? "grid-cols-1" : images.length === 2 ? "grid-cols-2" : "grid-cols-2"
                  }`}>
                    {images.slice(0, 4).map((url: string, i: number) => (
                      <div
                        key={i}
                        className={`relative ${images.length === 3 && i === 0 ? "col-span-2" : ""} ${images.length === 1 ? "max-h-96" : "aspect-square"} overflow-hidden cursor-pointer`}
                        onClick={() => {
                          setLightboxImages(images);
                          setLightboxIndex(i);
                          setLightboxPost(post);
                          setLightboxOpen(true);
                        }}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        {i === 3 && images.length > 4 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white text-2xl font-bold">+{images.length - 4}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
              <GroupPostInteractions postId={post.id} groupId={groupId!} postAuthorId={post.user_id} postAuthorName={post.profile?.display_name || "Unknown"} postContent={post.content || ""} />
            </div>
            {sponsoredPosts.length > 0 && (index + 1) % 4 === 0 && sponsoredPosts[Math.floor(index / 4) % sponsoredPosts.length] && (
              <div className="mt-4">
                <SponsoredPostCard post={sponsoredPosts[Math.floor(index / 4) % sponsoredPosts.length]} />
              </div>
            )}
            </div>
          ))}

          {(!posts || posts.length === 0) && currentMember && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No posts yet. Be the first to share something!
            </div>
          )}

          {!currentMember && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Join this group to see posts and start participating.
            </div>
          )}
        </div>
      <ImageLightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        postId={lightboxPost?.id}
        postType="group_post"
        authorName={lightboxPost?.profile?.display_name || "User"}
        authorAvatar={lightboxPost?.profile?.avatar_url}
        authorId={lightboxPost?.user_id}
        createdAt={lightboxPost?.created_at}
      />

      <AlertDialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isSoleAdmin ? "You're the only admin" : "Leave group?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {isSoleAdmin ? (
                <>You must transfer ownership or promote another member to admin before you can leave <span className="font-semibold">{group?.name}</span>. Open the Members panel and use the <Crown className="w-3.5 h-3.5 inline text-primary" /> button to transfer ownership.</>
              ) : (
                <>Are you sure you want to leave <span className="font-semibold">{group?.name}</span>? You'll lose access to the group's posts and chat.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {isSoleAdmin ? (
              <AlertDialogCancel>Got it</AlertDialogCancel>
            ) : (
              <>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleLeave}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Leave Group
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Transfer Ownership Dialog */}
      <AlertDialog open={!!transferTarget} onOpenChange={(open) => !open && setTransferTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Transfer ownership?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to transfer ownership of <span className="font-semibold">{group?.name}</span> to <span className="font-semibold">{transferTarget?.profile?.display_name || "this member"}</span>? You will be demoted to a regular member.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleTransferOwnership}>
              Transfer Ownership
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {boostPostId && (
        <BoostPostModal
          postId={boostPostId}
          postContent={boostPostContent}
          onClose={() => { setBoostPostId(null); setBoostPostContent(""); }}
        />
      )}
    </AppPageShell>
  );
};

export default GroupDetail;
