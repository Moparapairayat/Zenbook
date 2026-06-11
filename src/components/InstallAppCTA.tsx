import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Device = "ios" | "android" | "desktop" | "other";

function detectDevice(): Device {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  if (/Windows|Macintosh|Linux|CrOS/i.test(ua)) return "desktop";
  return "other";
}

function getMessage(device: Device, installed: boolean, canPrompt: boolean): string {
  if (installed) return "You're already using the installed app — enjoy!";
  if (canPrompt) return "Tap to install the app on your device in one step.";
  switch (device) {
    case "ios":
      return "On iPhone or iPad? Open in Safari, tap Share, then Add to Home Screen.";
    case "android":
      return "On Android? Open Chrome's menu and tap Install app for a faster experience.";
    case "desktop":
      return "On desktop? Click the install icon in your address bar to add it as an app.";
    default:
      return "Install the app for a faster, full-screen experience on any device.";
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface Props {
  variant?: "header" | "menu";
}

const InstallAppCTA = ({ variant = "header" }: Props) => {
  const navigate = useNavigate();
  const [device] = useState<Device>(() => detectDevice());
  const [installed, setInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const message = useMemo(
    () => getMessage(device, installed, !!deferredPrompt),
    [device, installed, deferredPrompt]
  );

  if (installed) return null;

  const handleClick = () => navigate("/install");

  if (variant === "menu") {
    return (
      <button
        onClick={handleClick}
        className="w-full flex items-start gap-2 px-2 py-1.5 rounded-md hover:bg-secondary transition-colors text-left"
      >
        <Download className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">Install app</p>
          <p className="text-[11px] text-muted-foreground leading-tight">{message}</p>
        </div>
      </button>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            className="hidden md:inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-primary/10 text-primary hover:bg-primary/15 transition-colors text-xs font-medium"
            aria-label="Install app"
          >
            <Download className="w-4 h-4" />
            <span>Install app</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[240px] text-xs">
          {message}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default InstallAppCTA;
