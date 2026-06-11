import defaultAvatar from "@/assets/default-avatar.jpg";
import xbookLogoDark from "@/assets/xbook-logo-dark-2.png";
import xbookLogoLight from "@/assets/xbook-logo-light-2.png";
import GlobalSearch from "@/components/GlobalSearch";
import InstallAppCTA from "@/components/InstallAppCTA";
import NotificationsDropdown from "@/components/NotificationsDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { useDarkMode } from "@/hooks/useDarkMode";
import useNotificationSound from "@/hooks/useNotificationSound";
import { useSidebarState } from "@/hooks/useSidebarState";
import { useSiteBranding } from "@/hooks/useSiteBranding";
import useWebNotifications from "@/hooks/useWebNotifications";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Activity, BellRing, Calendar, ChevronDown, CirclePlus, Clapperboard, Download, FileText, Flag, Grid3X3, HelpCircle, Home, LogOut, Megaphone, Menu, MessageCircle, MonitorPlay, Moon, MoreHorizontal, Settings, ShoppingBag, Store, Sun, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";


const Header = () => {
  const { user, signOut } = useAuth();
  const { profile } = useCurrentProfile();
  const { isDark, toggle: toggleDark } = useDarkMode();
  const { branding } = useSiteBranding();
  const { setEnabled, isEnabled } = useNotificationSound();
  const [soundOn, setSoundOn] = useState(isEnabled());
  const { permission, requestPermission, showNotification, isSupported } = useWebNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleMobile } = useSidebarState();

  // Unread messages count
  const { data: unreadMsgCount = 0, refetch: refetchUnread } = useQuery({
    queryKey: ["unread-messages-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      // Get all conversations the user is part of
      const { data: convos } = await supabase
        .from("conversations")
        .select("id")
        .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`);

      const { data: groupConvos } = await supabase
        .from("conversation_members")
        .select("conversation_id")
        .eq("user_id", user.id);

      const allConvoIds = new Set([
        ...(convos || []).map((c: any) => c.id),
        ...(groupConvos || []).map((c: any) => c.conversation_id),
      ]);

      if (allConvoIds.size === 0) return 0;

      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .in("conversation_id", [...allConvoIds])
        .neq("sender_id", user.id)
        .eq("read", false);

      return count ?? 0;
    },
    enabled: !!user,
    refetchInterval: 15000,
  });

  // Subscribe to realtime message inserts for live badge updates + web notifications
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("header-msg-badge")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload: any) => {
        refetchUnread();
        if (payload.new?.sender_id !== user.id) {
          showNotification("New Message", { body: "You received a new message", tag: "msg-" + payload.new?.id });
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" }, () => {
        refetchUnread();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, (payload: any) => {
        const n = payload.new;
        const typeLabels: Record<string, string> = { like: "New Like", comment: "New Comment", friend_request: "Friend Request", event_digest: "Weekly Event Digest" };
        showNotification(typeLabels[n?.type] || "Notification", { body: n?.message || "You have a new notification", tag: "notif-" + n?.id });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, refetchUnread, showNotification]);

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Users, label: "Friends", path: "/friends" },
    { icon: Clapperboard, label: "Reels", path: "/reels" },
    { icon: MonitorPlay, label: "Watch", path: "/watch" },
    { icon: Store, label: "Marketplace", path: "/marketplace" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card shadow-sm h-14 flex items-center px-2 sm:px-4 justify-between gap-1 sm:gap-2">
      <div className="flex items-center gap-1 sm:gap-2 min-w-0 lg:min-w-[280px]">
        <button onClick={toggleMobile} className="md:hidden w-9 h-9 rounded-full hover:bg-secondary flex items-center justify-center flex-shrink-0">
          <Menu className="w-5 h-5 text-foreground" />
        </button>
        <button onClick={() => navigate("/")} className="h-10 flex items-center justify-center flex-shrink-0">
          <img
            src={isDark ? (branding.darkLogoUrl || xbookLogoLight) : (branding.logoUrl || xbookLogoDark)}
            alt="ZenBook"
            className="h-9"
          />
        </button>
        <GlobalSearch />
      </div>

      <nav className="hidden lg:flex items-center gap-2 flex-1 justify-center max-w-[600px]">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              className={`flex-1 max-w-[120px] h-12 flex items-center justify-center rounded-lg transition-colors relative ${active
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-secondary"
                }`}
              title={label}
            >
              <Icon className="w-6 h-6" />
              {active && <span className="absolute -bottom-[5px] left-0 right-0 h-[3px] bg-primary rounded-t-full" />}
            </button>
          );
        })}
      </nav>

      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 justify-end">
        <InstallAppCTA variant="header" />
        {/* Dark mode — desktop only */}
        <button
          onClick={toggleDark}
          className="hidden lg:flex w-10 h-10 rounded-full bg-secondary items-center justify-center hover:bg-muted transition-colors"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun className="w-5 h-5 text-foreground" /> : <Moon className="w-5 h-5 text-foreground" />}
        </button>

        {/* Create / Grid menu — desktop only */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="hidden lg:flex w-10 h-10 rounded-full bg-secondary items-center justify-center hover:bg-muted transition-colors"
              title="Create"
            >
              <Grid3X3 className="w-5 h-5 text-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-3">
            <p className="text-sm font-semibold text-foreground mb-2 px-1">Create</p>
            <div className="grid grid-cols-1 gap-1">
              {[
                { icon: FileText, label: "Post", desc: "Share what's on your mind", action: () => navigate("/?create=post") },
                { icon: CirclePlus, label: "Story", desc: "Share a photo or video", action: () => navigate("/?create=story") },
                { icon: Clapperboard, label: "Reel", desc: "Create a short video", action: () => navigate("/reels?create=true") },
                { icon: Users, label: "Group", desc: "Build your community", action: () => navigate("/groups?create=true") },
                { icon: Flag, label: "Page", desc: "Promote your brand", action: () => navigate("/pages?create=true") },
                { icon: Calendar, label: "Event", desc: "Organize a gathering", action: () => navigate("/events?create=true") },
                { icon: ShoppingBag, label: "Product", desc: "List something for sale", action: () => navigate("/marketplace?create=true") },
                { icon: Megaphone, label: "Ad", desc: "Reach more people", action: () => navigate("/advertising?create=true") },
              ].map(({ icon: Icon, label, desc, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-[11px] text-muted-foreground leading-tight truncate">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Messages — hidden on very small screens, shown in more menu instead */}
        <button
          onClick={() => navigate("/messages")}
          className="hidden sm:flex w-10 h-10 rounded-full bg-secondary items-center justify-center hover:bg-muted transition-colors relative"
        >
          <MessageCircle className="w-5 h-5 text-foreground" />
          {unreadMsgCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[11px] font-bold flex items-center justify-center px-1">
              {unreadMsgCount > 99 ? "99+" : unreadMsgCount}
            </span>
          )}
        </button>

        {/* Notifications — hidden on very small screens */}
        <div className="hidden sm:flex">
          <NotificationsDropdown />
        </div>

        {/* More options — visible below lg, includes nav + messages/notifs on xs */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex lg:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-secondary items-center justify-center hover:bg-muted transition-colors relative"
              title="More options"
            >
              <MoreHorizontal className="w-5 h-5 text-foreground" />
              {/* Show badge on mobile when messages are hidden */}
              {unreadMsgCount > 0 && (
                <span className="sm:hidden absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-0.5">
                  {unreadMsgCount > 9 ? "9+" : unreadMsgCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {/* Messages & Notifications — only on xs screens */}
            <div className="sm:hidden">
              <DropdownMenuItem onClick={() => navigate("/messages")} className="gap-2 cursor-pointer">
                <MessageCircle className="w-4 h-4" />
                <span>Messages</span>
                {unreadMsgCount > 0 && (
                  <span className="ml-auto min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[11px] font-bold flex items-center justify-center px-1">
                    {unreadMsgCount > 99 ? "99+" : unreadMsgCount}
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/notifications")} className="gap-2 cursor-pointer">
                <BellRing className="w-4 h-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </div>
            <p className="text-xs font-semibold text-muted-foreground px-2 py-1.5">Navigate</p>
            {navItems.map(({ icon: Icon, label, path }) => (
              <DropdownMenuItem key={label} onClick={() => navigate(path)} className="gap-2 cursor-pointer">
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={toggleDark} className="gap-2 cursor-pointer">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{isDark ? "Light mode" : "Dark mode"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/install")} className="gap-2 cursor-pointer">
              <Download className="w-4 h-4" />
              <span>Install app</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <p className="text-xs font-semibold text-muted-foreground px-2 py-1.5">Create</p>
            {[
              { icon: FileText, label: "Post", action: () => navigate("/?create=post") },
              { icon: CirclePlus, label: "Story", action: () => navigate("/?create=story") },
              { icon: Clapperboard, label: "Reel", action: () => navigate("/reels?create=true") },
              { icon: Users, label: "Group", action: () => navigate("/groups?create=true") },
              { icon: Flag, label: "Page", action: () => navigate("/pages?create=true") },
              { icon: Calendar, label: "Event", action: () => navigate("/events?create=true") },
              { icon: ShoppingBag, label: "Product", action: () => navigate("/marketplace?create=true") },
              { icon: Megaphone, label: "Ad", action: () => navigate("/advertising?create=true") },
            ].map(({ icon: Icon, label, action }) => (
              <DropdownMenuItem key={label} onClick={action} className="gap-2 cursor-pointer">
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-0.5 rounded-full hover:bg-secondary transition-colors p-0.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden">
                <img src={profile?.avatar_url || defaultAvatar} alt={profile?.display_name || "Profile"} className="w-full h-full object-cover" />
              </div>
              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <div
              onClick={() => navigate("/profile")}
              className="flex items-center gap-3 p-3 cursor-pointer rounded-md hover:bg-secondary transition-colors"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                <img src={profile?.avatar_url || defaultAvatar} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{profile?.display_name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")} className="gap-2 cursor-pointer">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/activity-log")} className="gap-2 cursor-pointer">
              <Activity className="w-4 h-4" />
              <span>Activity Log</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings?section=help")} className="gap-2 cursor-pointer">
              <HelpCircle className="w-4 h-4" />
              <span>Help & Support</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/notifications")} className="gap-2 cursor-pointer">
              <BellRing className="w-4 h-4" />
              <span>Notifications</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
