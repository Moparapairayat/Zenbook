import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, AppWindow, Check, Chrome, Download, ExternalLink, Monitor, MoreVertical, Plus, Share, Smartphone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type IOSBrowser = "safari" | "chrome" | "firefox" | "edge" | "other";

function detectIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const iOSUA = /iPhone|iPad|iPod/i.test(ua);
  // iPadOS 13+ reports as Mac; detect via touch points
  const iPadOS = ua.includes("Macintosh") && (navigator as any).maxTouchPoints > 1;
  return iOSUA || iPadOS;
}

function detectIOSBrowser(): IOSBrowser {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  if (/CriOS\//i.test(ua)) return "chrome";
  if (/FxiOS\//i.test(ua)) return "firefox";
  if (/EdgiOS\//i.test(ua)) return "edge";
  // Safari is the only one that doesn't add a custom token; check for "Safari" w/o Cri/Fxi/Edgi
  if (/Safari\//i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua)) return "safari";
  return "other";
}

const InstallApp = () => {
  const siteName = "ZenBook";
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
  const isIOS = useMemo(() => detectIOS(), []);
  const iosBrowser = useMemo<IOSBrowser>(() => (isIOS ? detectIOSBrowser() : "other"), [isIOS]);
  const defaultTab = isIOS ? "ios" : "android";
  const defaultIOSSubTab: IOSBrowser = iosBrowser === "safari" ? "safari" : iosBrowser === "other" ? "safari" : iosBrowser;

  useEffect(() => {
    document.title = `Install ${siteName} — Get the app`;
    const meta = document.querySelector('meta[name="description"]');
    const desc = `Install ${siteName} on your device for a fast, app-like experience with home screen access.`;
    if (meta) meta.setAttribute("content", desc);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const installedHandler = () => setIsInstalled(true);

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, [siteName]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsInstalled(true);
      }
    } finally {
      setInstalling(false);
    }
  };

  const benefits = [
    { icon: Smartphone, title: "App-like experience", desc: "Full-screen, no browser bars" },
    { icon: Download, title: "Quick access", desc: "Launch from your home screen" },
    { icon: AppWindow, title: "Faster loading", desc: "Optimized startup performance" },
    { icon: Check, title: "Auto updates", desc: "Always on the latest version" },
  ];

  return (
    <main className="min-h-full">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <header className="text-center space-y-3">
          <Badge variant="secondary" className="mb-2">Progressive Web App</Badge>
          <h1 className="text-4xl font-bold tracking-tight">Install {siteName}</h1>
          <p className="text-muted-foreground text-lg">
            Get the full app experience on any device — no app store required.
          </p>
        </header>

        {isInstalled ? (
          <Card className="p-8 text-center space-y-3 border-primary/30 bg-primary/5">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">{siteName} is installed</h2>
            <p className="text-muted-foreground">You're already running the installed app. Enjoy!</p>
          </Card>
        ) : deferredPrompt ? (
          <Card className="p-8 text-center space-y-4 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <Download className="w-10 h-10 text-primary mx-auto" />
            <div>
              <h2 className="text-xl font-semibold mb-1">Ready to install</h2>
              <p className="text-muted-foreground">One tap to add {siteName} to your device.</p>
            </div>
            <Button size="lg" onClick={handleInstall} disabled={installing}>
              <Download className="w-4 h-4 mr-2" />
              {installing ? "Installing..." : `Install ${siteName}`}
            </Button>
          </Card>
        ) : (
          <Card className="p-6 bg-muted/30">
            <p className="text-sm text-muted-foreground text-center">
              Install isn't available automatically in this browser. Follow the instructions below for your device.
            </p>
          </Card>
        )}

        <section>
          <h2 className="text-xl font-semibold mb-4">Why install?</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {benefits.map((b) => (
              <Card key={b.title} className="p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <b.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Step-by-step instructions</h2>
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="ios">iOS</TabsTrigger>
              <TabsTrigger value="android">Android</TabsTrigger>
              <TabsTrigger value="desktop">Desktop</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>

            <TabsContent value="ios" className="mt-4 space-y-4">
              {isIOS && iosBrowser !== "safari" && iosBrowser !== "other" && (
                <Card className="p-4 flex gap-3 border-primary/30 bg-primary/5">
                  <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">
                      You're on {iosBrowser === "chrome" ? "Chrome" : iosBrowser === "firefox" ? "Firefox" : "Edge"} for iOS
                    </p>
                    <p className="text-muted-foreground mt-0.5">
                      Apple only allows installing web apps to the Home Screen from <strong>Safari</strong>. Open this page in Safari to install {siteName}.
                    </p>
                  </div>
                </Card>
              )}

              <Tabs defaultValue={defaultIOSSubTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="safari">Safari</TabsTrigger>
                  <TabsTrigger value="chrome">Chrome / other</TabsTrigger>
                </TabsList>

                <TabsContent value="safari" className="mt-4">
                  <Card className="p-6 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Smartphone className="w-4 h-4" /> Safari on iPhone or iPad
                    </div>
                    <ol className="space-y-3 text-sm">
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-medium">1</span>
                        <span>Open {siteName} in <strong>Safari</strong>.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-medium">2</span>
                        <span>Tap the <Share className="inline w-4 h-4 mx-1" /> <strong>Share</strong> button (bottom on iPhone, top on iPad).</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-medium">3</span>
                        <span>Scroll and tap <Plus className="inline w-4 h-4 mx-1" /> <strong>Add to Home Screen</strong>.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-medium">4</span>
                        <span>Confirm the name and tap <strong>Add</strong> in the top-right corner.</span>
                      </li>
                    </ol>
                    <p className="text-xs text-muted-foreground">
                      Requires iOS 16.4+ for full PWA support. Earlier versions still create a Home Screen shortcut.
                    </p>
                  </Card>
                </TabsContent>

                <TabsContent value="chrome" className="mt-4">
                  <Card className="p-6 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Chrome className="w-4 h-4" /> Chrome, Firefox, or Edge on iOS
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Third-party iOS browsers <strong>cannot install web apps directly</strong> — Apple only allows this from Safari.
                    </p>
                    <ol className="space-y-3 text-sm">
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-medium">1</span>
                        <span>Tap the <MoreVertical className="inline w-4 h-4 mx-1" /> <strong>menu</strong> button.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-medium">2</span>
                        <span>Choose <ExternalLink className="inline w-4 h-4 mx-1" /> <strong>Open in Safari</strong>.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-medium">3</span>
                        <span>In Safari, tap <Share className="inline w-4 h-4 mx-1" /> <strong>Share</strong>.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-medium">4</span>
                        <span>Tap <Plus className="inline w-4 h-4 mx-1" /> <strong>Add to Home Screen</strong>, then <strong>Add</strong>.</span>
                      </li>
                    </ol>
                  </Card>
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="android" className="mt-4">
              <Card className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Smartphone className="w-4 h-4" /> Chrome on Android
                </div>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-medium">1</span>
                    <span>Open {siteName} in <strong>Chrome</strong>.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-medium">2</span>
                    <span>Tap the <strong>⋮ menu</strong> in the top-right.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-medium">3</span>
                    <span>Select <strong>Install app</strong> or <strong>Add to Home screen</strong>.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-medium">4</span>
                    <span>Confirm by tapping <strong>Install</strong>.</span>
                  </li>
                </ol>
              </Card>
            </TabsContent>

            <TabsContent value="desktop" className="mt-4">
              <Card className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Monitor className="w-4 h-4" /> Chrome, Edge, or Brave on Windows/Mac/Linux
                </div>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-medium">1</span>
                    <span>Look for the <Download className="inline w-4 h-4 mx-1" /> <strong>install icon</strong> in the address bar.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-medium">2</span>
                    <span>Or open the <strong>browser menu</strong> and choose <strong>Install {siteName}</strong>.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-medium">3</span>
                    <span>Click <strong>Install</strong> to add it as a desktop app.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-medium">4</span>
                    <span>Launch from your <strong>Start menu</strong>, <strong>Dock</strong>, or <strong>Applications</strong>.</span>
                  </li>
                </ol>
              </Card>
            </TabsContent>

            <TabsContent value="other" className="mt-4">
              <Card className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Chrome className="w-4 h-4" /> Firefox & other browsers
                </div>
                <p className="text-sm text-muted-foreground">
                  Firefox on Android supports installation through the menu (⋮ → <strong>Install</strong>). Desktop Firefox doesn't support PWA installation natively — we recommend using Chrome, Edge, or Brave instead.
                </p>
                <p className="text-sm text-muted-foreground">
                  Samsung Internet: tap the menu and choose <strong>Add page to → Home screen</strong>.
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        <Card className="p-6 bg-muted/30">
          <h3 className="font-semibold mb-2">Need help?</h3>
          <p className="text-sm text-muted-foreground">
            If installation isn't working, make sure you're using a supported browser and that your device has enough storage. The app works in your browser too — installation is optional.
          </p>
        </Card>
      </div>
    </main>
  );
};

export default InstallApp;
