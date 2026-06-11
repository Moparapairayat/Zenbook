import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Code2, FileCode, Save, AlertTriangle } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const AdminCustomCode = () => {
  const { settings, loading, saving, saveSettings } = useSiteSettings("custom_code");
  const [headCss, setHeadCss] = useState("");
  const [headJs, setHeadJs] = useState("");
  const [bodyCss, setBodyCss] = useState("");
  const [bodyJs, setBodyJs] = useState("");
  const [cssEnabled, setCssEnabled] = useState(true);
  const [jsEnabled, setJsEnabled] = useState(true);

  useEffect(() => {
    if (!settings) return;
    if (typeof settings.headCss === "string") setHeadCss(settings.headCss);
    if (typeof settings.headJs === "string") setHeadJs(settings.headJs);
    if (typeof settings.bodyCss === "string") setBodyCss(settings.bodyCss);
    if (typeof settings.bodyJs === "string") setBodyJs(settings.bodyJs);
    if (typeof settings.cssEnabled === "boolean") setCssEnabled(settings.cssEnabled);
    if (typeof settings.jsEnabled === "boolean") setJsEnabled(settings.jsEnabled);
  }, [settings]);

  const handleSave = async () => {
    await saveSettings({ headCss, headJs, bodyCss, bodyJs, cssEnabled, jsEnabled });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Code2 className="w-5 h-5 text-primary" />
          Custom JS / CSS
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Add custom JavaScript and CSS code. Code is persisted to the backend and injected globally by the runtime loader.
        </p>
      </div>

      <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
        <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
        <p className="text-xs text-destructive">
          Be careful when adding custom code. Invalid JavaScript or CSS can break your website's layout or functionality. Always test changes in a safe environment first.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Global Toggles</CardTitle>
          <CardDescription className="text-xs">Enable or disable all custom code injection at once.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex items-center gap-3">
              <Switch checked={cssEnabled} onCheckedChange={setCssEnabled} />
              <div>
                <Label className="text-sm font-medium">Custom CSS</Label>
                <p className="text-[10px] text-muted-foreground">
                  {cssEnabled ? "CSS injection is active" : "CSS injection is paused"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={jsEnabled} onCheckedChange={setJsEnabled} />
              <div>
                <Label className="text-sm font-medium">Custom JavaScript</Label>
                <p className="text-[10px] text-muted-foreground">
                  {jsEnabled ? "JS injection is active" : "JS injection is paused"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={!cssEnabled ? "opacity-60 pointer-events-none" : ""}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-4.5 h-4.5 text-primary" />
            <CardTitle className="text-base">CSS — Head</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Injected inside <code className="text-[10px] bg-muted px-1 py-0.5 rounded">&lt;head&gt;</code> — ideal for overriding styles, fonts, and CSS variables.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={headCss}
            onChange={(e) => setHeadCss(e.target.value)}
            placeholder={`/* Custom CSS */\n.my-class {\n  color: red;\n}`}
            className="font-mono text-xs min-h-[140px] resize-y"
          />
        </CardContent>
      </Card>

      <Card className={!cssEnabled ? "opacity-60 pointer-events-none" : ""}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-4.5 h-4.5 text-primary" />
            <CardTitle className="text-base">CSS — Body</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Injected at the end of <code className="text-[10px] bg-muted px-1 py-0.5 rounded">&lt;body&gt;</code> — useful for component-specific overrides that need higher specificity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={bodyCss}
            onChange={(e) => setBodyCss(e.target.value)}
            placeholder={`/* Body CSS overrides */\n.footer {\n  background: #222;\n}`}
            className="font-mono text-xs min-h-[140px] resize-y"
          />
        </CardContent>
      </Card>

      <Separator />

      <Card className={!jsEnabled ? "opacity-60 pointer-events-none" : ""}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4.5 h-4.5 text-primary" />
            <CardTitle className="text-base">JavaScript — Head</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Injected inside <code className="text-[10px] bg-muted px-1 py-0.5 rounded">&lt;head&gt;</code> — best for analytics scripts, tracking pixels, and third-party integrations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={headJs}
            onChange={(e) => setHeadJs(e.target.value)}
            placeholder={`// Analytics or tracking code\n(function() {\n  // Your code here\n})();`}
            className="font-mono text-xs min-h-[140px] resize-y"
          />
        </CardContent>
      </Card>

      <Card className={!jsEnabled ? "opacity-60 pointer-events-none" : ""}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4.5 h-4.5 text-primary" />
            <CardTitle className="text-base">JavaScript — Body</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Injected at the end of <code className="text-[10px] bg-muted px-1 py-0.5 rounded">&lt;body&gt;</code> — runs after the DOM is ready. Ideal for DOM manipulation and widget initialization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={bodyJs}
            onChange={(e) => setBodyJs(e.target.value)}
            placeholder={`// DOM-ready scripts\ndocument.addEventListener('DOMContentLoaded', function() {\n  // Your code here\n});`}
            className="font-mono text-xs min-h-[140px] resize-y"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end pb-4">
        <Button onClick={handleSave} disabled={saving || loading}>
          <Save className="w-4 h-4 mr-1.5" />
          {saving ? "Saving..." : "Save Custom Code"}
        </Button>
      </div>
    </div>
  );
};

export default AdminCustomCode;
