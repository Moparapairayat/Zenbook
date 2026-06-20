import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRef, useEffect, useState } from "react";
import Post from "@/components/Post";
import { UsersRound, Flag, Heart, MessageSquare, UserPlus, Mail, CalendarDays, Bell, Sparkles, Video, MapPin, Music, Trophy, Film, BookOpen, ThumbsUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "@/assets/default-avatar.jpg";
import ProfileIntroCard from "@/components/profile/ProfileIntroCard";
import ProfilePhotosCard from "@/components/profile/ProfilePhotosCard";
import ProfileFriendsCard from "@/components/profile/ProfileFriendsCard";
import StoryHighlights from "@/components/StoryHighlights";
import ProfileCheckInsTab from "@/components/profile/ProfileCheckInsTab";
import { Switch } from "@/components/ui/switch";
import CreatePost from "@/components/CreatePost";

interface ProfileTabContentProps {
  profileUserId: string;
  isOwn: boolean;
  activeTab: string;
  profile?: any;
  editingBio?: boolean;
  setEditingBio?: (v: boolean) => void;
  prefs?: any;
  updatePref?: (key: string, value: boolean) => void;
}

const ProfileTabContent = ({ profileUserId, isOwn, activeTab, profile, editingBio, setEditingBio, prefs, updatePref }: ProfileTabContentProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [displayedTab, setDisplayedTab] = useState(activeTab);
  const [animating, setAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab !== displayedTab) {
      setAnimating(true);
      const timeout = setTimeout(() => {
        setDisplayedTab(activeTab);
        setAnimating(false);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [activeTab, displayedTab]);

  const { data: posts } = useQuery({
    queryKey: ["user-posts", profileUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", profileUserId)
        .eq("archived", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const { data: prof } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .eq("user_id", profileUserId);
      const p = prof?.[0] || null;
      return (data as any[]).map((post: any) => ({ ...post, profiles: p }));
    },
    enabled: !!profileUserId,
  });

  const { data: friends } = useQuery({
    queryKey: ["user-friends-list", profileUserId],
    queryFn: async () => {
      const { data } = await supabase
        .from("friendships")
        .select("requester_id, addressee_id")
        .eq("status", "accepted")
        .or(`requester_id.eq.${profileUserId},addressee_id.eq.${profileUserId}`);
      if (!data?.length) return [];
      const friendIds = data.map((f: any) => f.requester_id === profileUserId ? f.addressee_id : f.requester_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", friendIds);
      return profiles || [];
    },
    enabled: !!profileUserId,
  });

  const photos = posts?.filter((p: any) => p.image_url || (p.image_urls?.length > 0)) || [];

  const { data: userGroups } = useQuery({
    queryKey: ["user-groups", profileUserId],
    queryFn: async () => {
      const { data } = await supabase
        .from("group_members")
        .select("group_id, groups(id, name, avatar_url)")
        .eq("user_id", profileUserId)
        .eq("status", "approved")
        .limit(12);
      return data?.map((m: any) => m.groups).filter(Boolean) || [];
    },
    enabled: !!profileUserId,
  });

  const { data: userPages } = useQuery({
    queryKey: ["user-pages", profileUserId],
    queryFn: async () => {
      const { data } = await supabase
        .from("pages")
        .select("id, name, slug, avatar_url")
        .eq("created_by", profileUserId)
        .limit(12);
      return data || [];
    },
    enabled: !!profileUserId,
  });

  const tab = displayedTab;

  return (
    <div
      ref={containerRef}
      className={`space-y-3 transition-all duration-150 ease-in-out ${animating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}
    >
      {tab === "posts" && (
        <>
          {isOwn && <CreatePost onPostCreated={() => queryClient.invalidateQueries({ queryKey: ["user-posts", profileUserId] })} />}
          {posts?.length === 0 && (
            <div className="bg-card rounded-xl border border-border/50 p-8 text-center">
              <p className="text-sm text-muted-foreground">{isOwn ? "Share your first post" : "No posts yet"}</p>
            </div>
          )}
          {posts?.map((post: any) => (
            <Post
              key={post.id}
              id={post.id}
              postUserId={post.user_id}
              author={post.profiles?.display_name || "Unknown User"}
              avatarUrl={post.profiles?.avatar_url}
              createdAt={post.created_at}
              content={post.content}
              image={post.image_url}
              imageUrls={post.image_urls || []}
              videoUrl={post.video_url || null}
              commentCount={0}
              privacy={post.privacy || "public"}
              backgroundStyle={post.background_style || null}
              location={post.location || null}
              feeling={post.feeling || null}
            />
          ))}
        </>
      )}

      {tab === "about" && profile && (
        <div className="space-y-3">
          <ProfileIntroCard
            profile={profile}
            profileUserId={profileUserId}
            isOwn={isOwn}
            editingBio={editingBio || false}
            setEditingBio={setEditingBio || (() => {})}
          />
          <StoryHighlights userId={profileUserId} isOwn={isOwn} />
        </div>
      )}

      {tab === "photos" && (
        <div className="space-y-3">
          <ProfilePhotosCard profileUserId={profileUserId} />
          <div className="bg-card rounded-xl border border-border/50 p-4">
            <h3 className="text-lg font-bold text-foreground mb-3">All Photos</h3>
            {photos.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">No photos yet</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
                {photos.map((post: any) => {
                  const imgUrl = post.image_url || post.image_urls?.[0];
                  return (
                    <div key={post.id} className="aspect-square rounded-lg overflow-hidden bg-secondary">
                      <img src={imgUrl} alt="" className="w-full h-full object-cover hover:brightness-90 transition-all cursor-pointer" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "reels" && (
        <div className="bg-card rounded-xl border border-border/50 p-6 text-center">
          <p className="text-sm text-muted-foreground">No reels to show</p>
        </div>
      )}

      {tab === "videos" && (
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" /> Videos
          </h3>
          <p className="text-center text-sm text-muted-foreground py-6">No videos to show</p>
        </div>
      )}

      {tab === "check-ins" && (
        <ProfileCheckInsTab isOwn={isOwn} />
      )}

      {tab === "music" && (
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <Music className="w-5 h-5 text-primary" /> Music
          </h3>
          <p className="text-center text-sm text-muted-foreground py-6">{isOwn ? "You haven't added any music yet" : "No music to show"}</p>
        </div>
      )}

      {tab === "sports" && (
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" /> Sports
          </h3>
          <p className="text-center text-sm text-muted-foreground py-6">{isOwn ? "You haven't added any sports yet" : "No sports to show"}</p>
        </div>
      )}

      {tab === "movies" && (
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <Film className="w-5 h-5 text-primary" /> Movies
          </h3>
          <p className="text-center text-sm text-muted-foreground py-6">{isOwn ? "You haven't added any movies yet" : "No movies to show"}</p>
        </div>
      )}

      {tab === "books" && (
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Books
          </h3>
          <p className="text-center text-sm text-muted-foreground py-6">{isOwn ? "You haven't added any books yet" : "No books to show"}</p>
        </div>
      )}

      {tab === "likes" && (
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <ThumbsUp className="w-5 h-5 text-primary" /> Likes
          </h3>
          <p className="text-center text-sm text-muted-foreground py-6">No liked pages or interests to show</p>
        </div>
      )}

      {tab === "friends" && (
        <div className="space-y-3">
          <ProfileFriendsCard profileUserId={profileUserId} friendCount={friends?.length || 0} />
          <div className="bg-card rounded-xl border border-border/50 p-4">
            <h3 className="text-lg font-bold text-foreground mb-3">All Friends</h3>
            {(!friends || friends.length === 0) ? (
              <p className="text-center text-sm text-muted-foreground py-6">No friends yet</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {friends.map((f: any) => (
                  <div
                    key={f.user_id}
                    onClick={() => navigate(`/profile/${f.user_id}`)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors"
                  >
                    <img src={f.avatar_url || defaultAvatar} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground truncate">{f.display_name || "User"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "groups" && (
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <h3 className="text-lg font-bold text-foreground mb-3">Groups</h3>
          {(!userGroups || userGroups.length === 0) ? (
            <p className="text-center text-sm text-muted-foreground py-6">Not in any groups</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {userGroups.map((g: any) => (
                <div
                  key={g.id}
                  onClick={() => navigate(`/groups/${g.id}`)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors"
                >
                  {g.avatar_url ? (
                    <img src={g.avatar_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <UsersRound className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-foreground truncate">{g.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "events" && (
        <div className="bg-card rounded-xl border border-border/50 p-6 text-center">
          <p className="text-sm text-muted-foreground">No events to show</p>
        </div>
      )}

      {tab === "pages" && (
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <h3 className="text-lg font-bold text-foreground mb-3">Pages</h3>
          {(!userPages || userPages.length === 0) ? (
            <p className="text-center text-sm text-muted-foreground py-6">{isOwn ? "You haven't created any pages" : "No pages"}</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {userPages.map((p: any) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/pages/${p.slug}`)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors"
                >
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Flag className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-foreground truncate">{p.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "notifications" && isOwn && prefs && updatePref && (
        <div className="bg-card rounded-xl shadow-sm border border-border/50 p-4 space-y-4">
          <h3 className="text-lg font-bold text-foreground">Notification Preferences</h3>
          <div className="space-y-3">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Memories</p>
            <div className="flex items-center justify-between">
              <div className="flex-1 pr-3">
                <p className="text-sm font-medium text-foreground flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-primary" /> Browser alerts</p>
                <p className="text-xs text-muted-foreground">Desktop notification for memories</p>
              </div>
              <Switch checked={prefs.memoryBrowserPush} onCheckedChange={(v) => updatePref("memoryBrowserPush", v)} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1 pr-3">
                <p className="text-sm font-medium text-foreground flex items-center gap-1.5"><Bell className="w-3.5 h-3.5 text-primary" /> In-app alerts</p>
                <p className="text-xs text-muted-foreground">Weekly memory notifications</p>
              </div>
              <Switch checked={prefs.memoryInApp} onCheckedChange={(v) => updatePref("memoryInApp", v)} />
            </div>
          </div>
          <div className="border-t border-border pt-3 space-y-3">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Social</p>
            {[
              { icon: Heart, color: "text-red-500", label: "Likes", desc: "Reactions to your posts", key: "likeAlerts" as const },
              { icon: MessageSquare, color: "text-blue-500", label: "Comments", desc: "Comments on your posts", key: "commentAlerts" as const },
              { icon: UserPlus, color: "text-green-500", label: "Friend requests", desc: "New friend requests", key: "friendRequestAlerts" as const },
              { icon: Mail, color: "text-purple-500", label: "Messages", desc: "New messages", key: "messageAlerts" as const },
            ].map(({ icon: Icon, color, label, desc, key }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex-1 pr-3">
                  <p className="text-sm font-medium text-foreground flex items-center gap-1.5"><Icon className={`w-3.5 h-3.5 ${color}`} /> {label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <Switch checked={prefs[key]} onCheckedChange={(v) => updatePref(key, v)} />
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-3 space-y-3">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Events</p>
            <div className="flex items-center justify-between">
              <div className="flex-1 pr-3">
                <p className="text-sm font-medium text-foreground flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-primary" /> Weekly event digest</p>
                <p className="text-xs text-muted-foreground">Summary of upcoming RSVP'd events</p>
              </div>
              <Switch checked={prefs.weeklyEventDigest} onCheckedChange={(v) => updatePref("weeklyEventDigest", v)} />
            </div>
          </div>
        </div>
      )}

      {tab === "notifications" && !isOwn && (
        <div className="bg-card rounded-xl border border-border/50 p-6 text-center">
          <p className="text-sm text-muted-foreground">Notification settings are only visible on your own profile.</p>
        </div>
      )}
    </div>
  );
};

export default ProfileTabContent;
