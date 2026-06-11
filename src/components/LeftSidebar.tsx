import defaultAvatar from "@/assets/default-avatar.jpg";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { useSidebarState } from "@/hooks/useSidebarState";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Bookmark, Calendar, Clock, Coins, Flag, Megaphone, PanelLeft, PanelLeftClose, Settings, Shield, ShieldCheck, ShoppingBag, Users, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const menuItems = [
  { icon: Users, label: "Friends", path: "/friends" },
  { icon: Users, label: "Groups", path: "/groups" },
  { icon: Flag, label: "Pages", path: "/pages" },
  { icon: Calendar, label: "Events", path: "/events" },

  { icon: Clock, label: "Memories", path: "/memories" },
  { icon: Bookmark, label: "Saved", path: "/saved" },
  { icon: ShoppingBag, label: "Marketplace", path: "/marketplace" },
  { icon: Megaphone, label: "Advertising", path: "/advertising" },
  { icon: Coins, label: "Credits", path: "/credits" },
  { icon: Shield, label: "Safety Center", path: "/safety" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { profile } = useCurrentProfile();
  const { user } = useAuth();
  const { isCollapsed: collapsed, toggle, mobileOpen, closeMobile } = useSidebarState();
  const location = useLocation();

  const { data: userRole } = useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      if (!user) return "user";
      const { data } = await (supabase as any)
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (!data || data.length === 0) return "user";
      if (data.some((r: any) => r.role === "admin")) return "admin";
      if (data.some((r: any) => r.role === "moderator")) return "moderator";
      return "user";
    },
    enabled: !!user,
    staleTime: 300000,
  });

  const sidebarWidth = collapsed ? "w-[72px]" : "w-[280px]";

  const handleNavigate = (path: string) => {
    navigate(path);
    closeMobile();
  };

  const renderButton = (icon: React.ReactNode, label: string, onClick: () => void, extraClass?: string, isActive?: boolean) => {
    const btn = (
      <button
        onClick={onClick}
        className={`flex items-center gap-3 w-full p-2 rounded-lg transition-colors text-left ${collapsed && !mobileOpen ? "justify-center" : ""} ${isActive ? "bg-primary/10 text-primary" : "hover:bg-secondary"} ${extraClass || ""}`}
      >
        {icon}
        {(!collapsed || mobileOpen) && <span className={`text-[15px] font-medium truncate ${isActive ? "text-primary" : "text-foreground"}`}>{label}</span>}
      </button>
    );

    if (collapsed && !mobileOpen) {
      return (
        <Tooltip key={label}>
          <TooltipTrigger asChild>{btn}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>{label}</TooltipContent>
        </Tooltip>
      );
    }
    return btn;
  };

  const sidebarContent = (
    <nav className="space-y-1">
      {/* Toggle button - desktop only */}
      <button
        onClick={toggle}
        className={`hidden md:flex items-center gap-3 w-full p-2 rounded-lg hover:bg-secondary transition-colors text-left mb-1 ${collapsed ? "justify-center" : ""}`}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <div className="w-8 h-8 rounded-lg bg-card border border-border/60 shadow-sm flex items-center justify-center">
          {collapsed ? <PanelLeft className="w-4 h-4 text-muted-foreground" /> : <PanelLeftClose className="w-4 h-4 text-muted-foreground" />}
        </div>
        {!collapsed && <span className="text-[15px] font-medium text-muted-foreground">Collapse</span>}
      </button>

      {/* Profile */}
      {renderButton(
        <div className="w-10 h-10 rounded-full bg-card border border-border/60 shadow-sm p-0.5 flex-shrink-0">
          <img src={profile?.avatar_url || defaultAvatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
        </div>,
        profile?.display_name || "Your Profile",
        () => handleNavigate("/profile"),
        undefined,
        location.pathname === "/profile"
      )}

      {/* Menu items */}
      {menuItems.map(({ icon: Icon, label, path }) => {
        const active = path.includes("?")
          ? location.pathname + location.search === path
          : location.pathname === path;
        return renderButton(
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${active ? "bg-primary/20" : "bg-secondary"}`}>
            <Icon className={`w-5 h-5 ${active ? "text-primary" : "text-foreground"}`} />
          </div>,
          label,
          () => handleNavigate(path),
          undefined,
          active
        );
      })}

      {/* Admin Panel (admin only) */}
      {userRole === "admin" &&
        renderButton(
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${location.pathname === "/admin" ? "bg-primary/20" : "bg-destructive/10"}`}>
            <ShieldCheck className={`w-5 h-5 ${location.pathname === "/admin" ? "text-primary" : "text-destructive"}`} />
          </div>,
          "Admin Panel",
          () => handleNavigate("/admin"),
          undefined,
          location.pathname === "/admin"
        )}

      {/* Moderator Panel (moderator only) */}
      {userRole === "moderator" &&
        renderButton(
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${location.pathname === "/moderator" ? "bg-primary/20" : "bg-amber-500/10"}`}>
            <ShieldCheck className={`w-5 h-5 ${location.pathname === "/moderator" ? "text-primary" : "text-amber-600"}`} />
          </div>,
          "Moderator Panel",
          () => handleNavigate("/moderator"),
          undefined,
          location.pathname === "/moderator"
        )}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <ScrollArea className={`${sidebarWidth} flex-shrink-0 h-full hidden md:block transition-all duration-300 bg-card`}>
        <div className="p-3">
          {sidebarContent}
          {!collapsed && (
            <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground leading-relaxed px-2">
              <span className="cursor-pointer hover:underline" onClick={() => handleNavigate("/page/privacy")}>Privacy</span>
              {" · "}
              <span className="cursor-pointer hover:underline" onClick={() => handleNavigate("/page/terms")}>Terms</span>
              {" · "}
              <span className="cursor-pointer hover:underline" onClick={() => handleNavigate("/advertising")}>Advertising</span>
              {" · "}
              <span className="cursor-pointer hover:underline" onClick={() => handleNavigate("/page/ad-choices")}>Ad Choices</span>
              {" · "}
              <span className="cursor-pointer hover:underline" onClick={() => handleNavigate("/page/cookies")}>Cookies</span>
              {" · "}
              <span>xBook © {new Date().getFullYear()}</span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={closeMobile}
          />
          <aside className="fixed left-0 top-0 z-50 w-[280px] h-full overflow-y-auto scrollbar-hidden bg-card shadow-xl p-2 md:hidden animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between p-2 mb-2">
              <span className="text-lg font-bold text-foreground">Menu</span>
              <button onClick={closeMobile} className="w-9 h-9 rounded-full hover:bg-secondary flex items-center justify-center">
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>
            {sidebarContent}

          </aside>
        </>
      )}
    </>
  );
};

export default LeftSidebar;
