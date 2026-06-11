import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Megaphone, LayoutTemplate, PanelRight, PanelBottom, FileText, Eye, EyeOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { sanitizeAdHtml } from "@/lib/sanitizeHtml";

interface AdSlot {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  placeholder: string;
}

const adSlots: AdSlot[] = [
  {
    id: "header",
    label: "Header",
    description: "Appears on all pages right under the nav bar (HTML Allowed)",
    icon: LayoutTemplate,
    placeholder: '<div class="ad-header">\n  <!-- Your header ad code here -->\n  <a href="https://example.com">\n    <img src="banner-728x90.jpg" alt="Ad" />\n  </a>\n</div>',
  },
  {
    id: "sidebar",
    label: "Sidebar",
    description: "Appears on the bottom of home sidebar (HTML Allowed)",
    icon: PanelRight,
    placeholder: '<div class="ad-sidebar">\n  <!-- Your sidebar ad code here -->\n  <a href="https://example.com">\n    <img src="sidebar-300x250.jpg" alt="Ad" />\n  </a>\n</div>',
  },
  {
    id: "footer",
    label: "Footer",
    description: "Appears on all pages right before the footer (HTML Allowed)",
    icon: PanelBottom,
    placeholder: '<div class="ad-footer">\n  <!-- Your footer ad code here -->\n  <a href="https://example.com">\n    <img src="footer-728x90.jpg" alt="Ad" />\n  </a>\n</div>',
  },
  {
    id: "posts1",
    label: "Posts 1",
    description: "Appears after 10 posts are loaded, between the posts (HTML Allowed)",
    icon: FileText,
    placeholder: '<div class="ad-in-feed">\n  <!-- Ad shown after 10 posts -->\n</div>',
  },
  {
    id: "posts2",
    label: "Posts 2",
    description: "Appears after 20 posts are loaded, between the posts (HTML Allowed)",
    icon: FileText,
    placeholder: '<div class="ad-in-feed">\n  <!-- Ad shown after 20 posts -->\n</div>',
  },
  {
    id: "posts3",
    label: "Posts 3",
    description: "Appears after 30 posts are loaded, between the posts (HTML Allowed)",
    icon: FileText,
    placeholder: '<div class="ad-in-feed">\n  <!-- Ad shown after 30 posts -->\n</div>',
  },
];

const defaultActive = adSlots.reduce<Record<string, boolean>>((acc, s) => {
  acc[s.id] = true;
  return acc;
}, {});

const AdminAdvertisements = () => {
  const { settings, loading, saving, saveSettings } = useSiteSettings("ads_placements");
  const [adContent, setAdContent] = useState<Record<string, string>>(
    adSlots.reduce<Record<string, string>>((acc, s) => ({ ...acc, [s.id]: "" }), {})
  );
  const [adActive, setAdActive] = useState<Record<string, boolean>>(defaultActive);
  const [previewSlot, setPreviewSlot] = useState<string | null>(null);

  // Hydrate from persisted settings
  useEffect(() => {
    if (settings && Object.keys(settings).length) {
      if (settings.content) setAdContent({ ...adContent, ...settings.content });
      if (settings.active) setAdActive({ ...defaultActive, ...settings.active });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const handleSave = async () => {
    await saveSettings({ content: adContent, active: adActive });
  };

  const handleClear = (slotId: string) => {
    setAdContent((prev) => ({ ...prev, [slotId]: "" }));
    toast.info(`${adSlots.find((s) => s.id === slotId)?.label} ad cleared`);
  };

  const filledCount = Object.values(adContent).filter((v) => v.trim().length > 0).length;
  const activeCount = Object.entries(adActive).filter(([id, active]) => active && adContent[id]?.trim()).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-primary" />
          Manage Site Advertisements
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure HTML ad placements across different areas of your website. Markup is sanitized before rendering.
        </p>
      </div>

      <div className="flex gap-3">
        <Badge variant="secondary" className="text-xs gap-1.5 py-1 px-2.5">
          {filledCount} / {adSlots.length} slots configured
        </Badge>
        <Badge variant="outline" className="text-xs gap-1.5 py-1 px-2.5">
          {activeCount} active
        </Badge>
      </div>

      {adSlots.map((slot) => (
        <Card key={slot.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <slot.icon className="w-4.5 h-4.5 text-primary" />
                <CardTitle className="text-base">{slot.label}</CardTitle>
                {adContent[slot.id]?.trim() && (
                  <Badge variant={adActive[slot.id] ? "default" : "secondary"} className="text-[10px]">
                    {adActive[slot.id] ? "Active" : "Paused"}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {adContent[slot.id]?.trim() && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => setAdActive((prev) => ({ ...prev, [slot.id]: !prev[slot.id] }))}
                      title={adActive[slot.id] ? "Pause" : "Activate"}
                    >
                      {adActive[slot.id] ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleClear(slot.id)}
                      title="Clear"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
            <CardDescription className="text-xs">{slot.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={adContent[slot.id]}
              onChange={(e) => setAdContent((prev) => ({ ...prev, [slot.id]: e.target.value }))}
              placeholder={slot.placeholder}
              className="font-mono text-xs min-h-[120px] leading-relaxed"
            />
            {adContent[slot.id]?.trim() && (
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5"
                  onClick={() => setPreviewSlot(previewSlot === slot.id ? null : slot.id)}
                >
                  <Eye className="w-3 h-3" />
                  {previewSlot === slot.id ? "Hide Preview" : "Preview"}
                </Button>
                {previewSlot === slot.id && (
                  <div className="mt-3 p-4 border border-dashed border-border rounded-lg bg-muted/30">
                    <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider font-medium">Sanitized Preview</p>
                    <div
                      className="bg-background rounded border border-border p-3 overflow-auto max-h-48"
                      dangerouslySetInnerHTML={{ __html: sanitizeAdHtml(adContent[slot.id]) }}
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end pb-4">
        <Button onClick={handleSave} disabled={saving || loading}>
          <Save className="w-4 h-4 mr-1.5" />
          {saving ? "Saving..." : "Save All Placements"}
        </Button>
      </div>
    </div>
  );
};

export default AdminAdvertisements;
