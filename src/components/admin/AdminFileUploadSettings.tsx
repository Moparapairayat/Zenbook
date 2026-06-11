import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Upload, Video, Music, FileText, Image, AlertTriangle, Info, Save, ExternalLink,
  HardDrive, Cloud, Server, Database, Play, Bug, Clapperboard,
} from "lucide-react";
import { toast } from "sonner";

const AWS_REGIONS = [
  { value: "us-east-1", label: "US East (N. Virginia)" },
  { value: "us-east-2", label: "US East (Ohio)" },
  { value: "us-west-1", label: "US West (N. California)" },
  { value: "us-west-2", label: "US West (Oregon)" },
  { value: "af-south-1", label: "Africa (Cape Town)" },
  { value: "ap-east-1", label: "Asia Pacific (Hong Kong)" },
  { value: "ap-south-1", label: "Asia Pacific (Mumbai)" },
  { value: "ap-northeast-1", label: "Asia Pacific (Tokyo)" },
  { value: "ap-northeast-2", label: "Asia Pacific (Seoul)" },
  { value: "ap-northeast-3", label: "Asia Pacific (Osaka)" },
  { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
  { value: "ap-southeast-2", label: "Asia Pacific (Sydney)" },
  { value: "ap-southeast-3", label: "Asia Pacific (Jakarta)" },
  { value: "ca-central-1", label: "Canada (Central)" },
  { value: "eu-central-1", label: "Europe (Frankfurt)" },
  { value: "eu-west-1", label: "Europe (Ireland)" },
  { value: "eu-west-2", label: "Europe (London)" },
  { value: "eu-west-3", label: "Europe (Paris)" },
  { value: "eu-south-1", label: "Europe (Milan)" },
  { value: "eu-north-1", label: "Europe (Stockholm)" },
  { value: "me-south-1", label: "Middle East (Bahrain)" },
  { value: "sa-east-1", label: "South America (São Paulo)" },
];

const DO_REGIONS = [
  { value: "nyc1", label: "New York [NYC1]" },
  { value: "nyc2", label: "New York [NYC2]" },
  { value: "nyc3", label: "New York [NYC3]" },
  { value: "sfo1", label: "San Francisco [SFO1]" },
  { value: "sfo2", label: "San Francisco [SFO2]" },
  { value: "tor1", label: "Toronto [TOR1]" },
  { value: "lon1", label: "London [LON1]" },
  { value: "fra1", label: "Frankfurt [FRA1]" },
  { value: "ams2", label: "Amsterdam [AMS2]" },
  { value: "ams3", label: "Amsterdam [AMS3]" },
  { value: "sgp1", label: "Singapore [SGP1]" },
  { value: "blr1", label: "Bangalore [BLR1]" },
];

const WASABI_REGIONS = [
  { value: "us-east-1", label: "us-east-1" },
  { value: "us-east-2", label: "us-east-2" },
  { value: "us-west-1", label: "us-west-1" },
  { value: "us-central-1", label: "us-central-1" },
  { value: "ca-central-1", label: "ca-central-1" },
  { value: "eu-west-1", label: "eu-west-1" },
  { value: "eu-west-2", label: "eu-west-2" },
  { value: "eu-central-1", label: "eu-central-1" },
  { value: "eu-central-2", label: "eu-central-2" },
  { value: "ap-northeast-1", label: "ap-northeast-1" },
  { value: "ap-northeast-2", label: "ap-northeast-2" },
  { value: "ap-southeast-1", label: "ap-southeast-1" },
  { value: "ap-southeast-2", label: "ap-southeast-2" },
];

const AdminFileUploadSettings = () => {
  // Upload toggles
  const [fileUploadEnabled, setFileUploadEnabled] = useState(true);
  const [videoUploadEnabled, setVideoUploadEnabled] = useState(true);
  const [reelsUploadEnabled, setReelsUploadEnabled] = useState(true);
  const [audioUploadEnabled, setAudioUploadEnabled] = useState(false);
  const [cssUploadEnabled, setCssUploadEnabled] = useState(false);

  // Upload limits
  const [allowedExtensions, setAllowedExtensions] = useState("jpg,png,gif,webp,mp4,mp3,pdf,doc,docx");
  const [allowedMimeTypes, setAllowedMimeTypes] = useState("image/jpeg,image/png,image/gif,image/webp,video/mp4,audio/mpeg,application/pdf");
  const [maxUploadSize, setMaxUploadSize] = useState("96");
  const [imageCompression, setImageCompression] = useState("medium");

  // FFMPEG
  const [ffmpegEnabled, setFfmpegEnabled] = useState(false);
  const [ffmpegPath, setFfmpegPath] = useState("/usr/bin/ffmpeg");
  const [ffmpegSpeed, setFfmpegSpeed] = useState("medium");
  const [ffmpegExtensions, setFfmpegExtensions] = useState("mp4,avi,mov,wmv,flv,mkv,webm");
  const [ffmpegMimeTypes, setFfmpegMimeTypes] = useState("video/mp4,video/avi,video/quicktime,video/x-ms-wmv,video/x-flv,video/x-matroska,video/webm");
  const [debugLog, setDebugLog] = useState("");

  // Storage providers — only one active at a time
  const [activeStorage, setActiveStorage] = useState<"local" | "s3" | "digitalocean" | "wasabi" | "ftp" | "gcloud" | "backblaze">("local");

  // Amazon S3
  const [s3Bucket, setS3Bucket] = useState("");
  const [s3Key, setS3Key] = useState("");
  const [s3Secret, setS3Secret] = useState("");
  const [s3Endpoint, setS3Endpoint] = useState("");
  const [s3Region, setS3Region] = useState("us-east-1");

  // DigitalOcean
  const [doSpace, setDoSpace] = useState("");
  const [doKey, setDoKey] = useState("");
  const [doSecret, setDoSecret] = useState("");
  const [doEndpoint, setDoEndpoint] = useState("");
  const [doRegion, setDoRegion] = useState("nyc1");

  // Wasabi
  const [wasabiBucket, setWasabiBucket] = useState("");
  const [wasabiAccessKey, setWasabiAccessKey] = useState("");
  const [wasabiSecretKey, setWasabiSecretKey] = useState("");
  const [wasabiEndpoint, setWasabiEndpoint] = useState("");
  const [wasabiRegion, setWasabiRegion] = useState("us-east-1");

  // FTP
  const [ftpHost, setFtpHost] = useState("");
  const [ftpUsername, setFtpUsername] = useState("");
  const [ftpPassword, setFtpPassword] = useState("");
  const [ftpPort, setFtpPort] = useState("21");
  const [ftpPath, setFtpPath] = useState("/upload");
  const [ftpEndpointUrl, setFtpEndpointUrl] = useState("");

  // Google Cloud
  const [gcloudBucket, setGcloudBucket] = useState("");
  const [gcloudFilePath, setGcloudFilePath] = useState("");
  const [gcloudEndpoint, setGcloudEndpoint] = useState("");

  // Backblaze
  const [bbBucketId, setBbBucketId] = useState("");
  const [bbBucketName, setBbBucketName] = useState("");
  const [bbRegion, setBbRegion] = useState("");
  const [bbAccessKeyId, setBbAccessKeyId] = useState("");
  const [bbAccessKey, setBbAccessKey] = useState("");
  const [bbEndpoint, setBbEndpoint] = useState("");

  const handleSave = () => {
    toast.success("File upload settings saved successfully");
  };

  const handleDebugFfmpeg = () => {
    setDebugLog("Checking FFMPEG installation...\n\n> " + ffmpegPath + " -version\n\nFFMPEG is not installed or path is incorrect.\nPlease verify the binary path and ensure FFMPEG is installed on your server.");
  };

  const handleTestConnection = (provider: string) => {
    toast.info(`Testing ${provider} connection...`);
    setTimeout(() => toast.success(`${provider} connection test completed`), 1500);
  };

  const setStorageProvider = (provider: typeof activeStorage) => {
    setActiveStorage(provider);
  };

  return (
    <div className="space-y-6">
      {/* Upload & File Sharing */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Upload & File Sharing Configuration</CardTitle>
          </div>
          <CardDescription>Control which file types users can upload and share</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">File Upload & Sharing</Label>
              <p className="text-xs text-muted-foreground">By enabling this feature, users can share and upload files on your site.</p>
            </div>
            <Switch checked={fileUploadEnabled} onCheckedChange={setFileUploadEnabled} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Video Upload & Sharing</Label>
                <Video className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Turn on the ability for users to share and upload videos. Configure the video converter from FFMPEG Settings below.</p>
            </div>
            <Switch checked={videoUploadEnabled} onCheckedChange={setVideoUploadEnabled} disabled={!fileUploadEnabled} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Reels Upload</Label>
                <Clapperboard className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Turn on the ability for users to share and upload reels. Configure the video converter from FFMPEG Settings below.</p>
            </div>
            <Switch checked={reelsUploadEnabled} onCheckedChange={setReelsUploadEnabled} disabled={!fileUploadEnabled} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Audio Upload & Sharing</Label>
                <Music className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Turn on the ability for users to share and upload music and audio files.</p>
            </div>
            <Switch checked={audioUploadEnabled} onCheckedChange={setAudioUploadEnabled} disabled={!fileUploadEnabled} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">CSS Upload & Modifications</Label>
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Allow users to upload their own CSS file to design their profile.</p>
            </div>
            <Switch checked={cssUploadEnabled} onCheckedChange={setCssUploadEnabled} disabled={!fileUploadEnabled} />
          </div>
        </CardContent>
      </Card>

      {/* Upload & File Limits */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Image className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Upload & File Limits</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="p-3 rounded-lg bg-destructive/10 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <p className="text-xs text-destructive">
              <strong>Important:</strong> Make sure you don't allow PHP, JS, HTML, XML, XPHP, PHP5 files — your site could be at risk.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Allowed Extensions</Label>
            <Textarea
              value={allowedExtensions}
              onChange={(e) => setAllowedExtensions(e.target.value)}
              placeholder="jpg,png,gif,webp,mp4..."
              rows={2}
            />
            <p className="text-[11px] text-muted-foreground">Only these file types can be uploaded. (separated with comma)</p>
          </div>

          <div className="space-y-2">
            <Label>Allowed MIME Types</Label>
            <Textarea
              value={allowedMimeTypes}
              onChange={(e) => setAllowedMimeTypes(e.target.value)}
              placeholder="image/jpeg,image/png..."
              rows={2}
            />
            <p className="text-[11px] text-muted-foreground">Only these MIME-types can be uploaded. (separated with comma)</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Max Upload Size</Label>
              <Select value={maxUploadSize} onValueChange={setMaxUploadSize}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["2", "6", "12", "24", "48", "96", "256", "512", "1024", "5120", "10240"].map((v) => (
                    <SelectItem key={v} value={v}>
                      {Number(v) >= 1024 ? `${Number(v) / 1024} GB` : `${v} MB`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">Max upload size for files, videos, music and images.</p>
            </div>

            <div className="space-y-2">
              <Label>Image Compression Level</Label>
              <Select value={imageCompression} onValueChange={setImageCompression}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="very-low">Very Low</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="very-high">Very High</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">Higher compression = less quality but smaller file size.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FFMPEG Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">FFMPEG Video Converter Settings</CardTitle>
          </div>
          <CardDescription>Compress, convert, and optimize videos to MP4</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">FFMPEG System</Label>
              <p className="text-xs text-muted-foreground">This system will compress, convert, and optimize videos to MP4. Requires "ffmpeg" installed on your server.</p>
            </div>
            <Switch checked={ffmpegEnabled} onCheckedChange={setFfmpegEnabled} />
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>FFMPEG Binary File Path</Label>
              <Input
                value={ffmpegPath}
                onChange={(e) => setFfmpegPath(e.target.value)}
                placeholder="/usr/bin/ffmpeg"
                disabled={!ffmpegEnabled}
              />
              <p className="text-[11px] text-muted-foreground">Example: Linux(/usr/bin/ffmpeg) or Windows(C:\ffmpeg\bin\ffmpeg.exe)</p>
            </div>

            <div className="space-y-2">
              <Label>Convert Video Speed</Label>
              <Select value={ffmpegSpeed} onValueChange={setFfmpegSpeed} disabled={!ffmpegEnabled}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["ultrafast", "superfast", "veryfast", "faster", "fast", "medium", "slow", "slower", "veryslow"].map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">Slower preset = better compression/quality. Faster preset = worse compression, higher filesize.</p>
            </div>

            <div className="space-y-2">
              <Label>Allowed Video Extensions</Label>
              <Textarea
                value={ffmpegExtensions}
                onChange={(e) => setFfmpegExtensions(e.target.value)}
                rows={2}
                disabled={!ffmpegEnabled}
              />
              <p className="text-[11px] text-muted-foreground">Only these video types can be uploaded. (separated with comma)</p>
            </div>

            <div className="space-y-2">
              <Label>Allowed Video MIME Types</Label>
              <Textarea
                value={ffmpegMimeTypes}
                onChange={(e) => setFfmpegMimeTypes(e.target.value)}
                rows={2}
                disabled={!ffmpegEnabled}
              />
              <p className="text-[11px] text-muted-foreground">Only these MIME-types can be uploaded. (separated with comma)</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-secondary/50 flex items-start gap-2">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">Make sure to debug FFMPEG below after configuring. For more information, visit our Documentation page.</p>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bug className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Debug FFMPEG</Label>
              </div>
              <Button variant="outline" size="sm" onClick={handleDebugFfmpeg} disabled={!ffmpegEnabled}>
                Run Debug
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">This will test the FFMPEG configuration and verify the system is working.</p>
            {debugLog && (
              <pre className="p-3 rounded-lg bg-muted text-xs text-muted-foreground font-mono whitespace-pre-wrap border">
                {debugLog}
              </pre>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Storage & CDN */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Storage & CDN Configuration</CardTitle>
          </div>
          <CardDescription>Configure external storage providers for file hosting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="p-3 rounded-lg bg-destructive/10 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <p className="text-xs text-destructive">
              <strong>Important:</strong> You can't enable multiple storages at the same time. Enabling one will automatically disable the others.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50 flex items-start gap-2">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">For more information on how to setup third party storage, please visit our Documentation page.</p>
          </div>
        </CardContent>
      </Card>

      {/* Amazon S3 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-primary" />
              <div>
                <CardTitle className="text-base">Amazon S3 Configuration</CardTitle>
                <CardDescription className="mt-1">Store files in Amazon S3</CardDescription>
              </div>
            </div>
            <Badge variant={activeStorage === "s3" ? "default" : "secondary"} className="text-xs">
              {activeStorage === "s3" ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Amazon S3 Storage</Label>
              <p className="text-xs text-muted-foreground">Enable Amazon Storage to store your files in Amazon S3.</p>
            </div>
            <Switch checked={activeStorage === "s3"} onCheckedChange={(c) => setStorageProvider(c ? "s3" : "local")} />
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Bucket Name</Label>
              <Input value={s3Bucket} onChange={(e) => setS3Bucket(e.target.value)} placeholder="Your Amazon S3 Bucket Name" disabled={activeStorage !== "s3"} />
            </div>
            <div className="space-y-2">
              <Label>S3 Key</Label>
              <Input value={s3Key} onChange={(e) => setS3Key(e.target.value)} placeholder="Your Amazon Key from AWS credentials" disabled={activeStorage !== "s3"} />
            </div>
            <div className="space-y-2">
              <Label>S3 Secret Key</Label>
              <Input type="password" value={s3Secret} onChange={(e) => setS3Secret(e.target.value)} placeholder="Your Amazon Secret from AWS credentials" disabled={activeStorage !== "s3"} />
              <p className="text-[11px] text-muted-foreground">The secret key is not showing due to security reasons, you can still overwrite the current one.</p>
            </div>
            <div className="space-y-2">
              <Label>Custom Endpoint (Optional)</Label>
              <Input value={s3Endpoint} onChange={(e) => setS3Endpoint(e.target.value)} placeholder="https://customCDNdomain.com" disabled={activeStorage !== "s3"} />
            </div>
            <div className="space-y-2">
              <Label>Bucket Region</Label>
              <Select value={s3Region} onValueChange={setS3Region} disabled={activeStorage !== "s3"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AWS_REGIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label} ({r.value})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {activeStorage === "s3" && (
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => handleTestConnection("Amazon S3")}>Test Connection</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* DigitalOcean Spaces */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              <div>
                <CardTitle className="text-base">DigitalOcean Spaces Configuration</CardTitle>
                <CardDescription className="mt-1">Store files in DigitalOcean Spaces</CardDescription>
              </div>
            </div>
            <Badge variant={activeStorage === "digitalocean" ? "default" : "secondary"} className="text-xs">
              {activeStorage === "digitalocean" ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">DigitalOcean Spaces Storage</Label>
              <p className="text-xs text-muted-foreground">Enable DigitalOcean Storage to store your files in DigitalOcean Spaces.</p>
            </div>
            <Switch checked={activeStorage === "digitalocean"} onCheckedChange={(c) => setStorageProvider(c ? "digitalocean" : "local")} />
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Space Name</Label>
              <Input value={doSpace} onChange={(e) => setDoSpace(e.target.value)} placeholder="Your DigitalOcean Space Bucket name" disabled={activeStorage !== "digitalocean"} />
            </div>
            <div className="space-y-2">
              <Label>Key</Label>
              <Input value={doKey} onChange={(e) => setDoKey(e.target.value)} placeholder="Your DigitalOcean Space credentials key" disabled={activeStorage !== "digitalocean"} />
            </div>
            <div className="space-y-2">
              <Label>Secret</Label>
              <Input type="password" value={doSecret} onChange={(e) => setDoSecret(e.target.value)} placeholder="Your DigitalOcean Space credentials secret" disabled={activeStorage !== "digitalocean"} />
              <p className="text-[11px] text-muted-foreground">The secret key is not showing due to security reasons, you can still overwrite the current one.</p>
            </div>
            <div className="space-y-2">
              <Label>Custom Endpoint (Optional)</Label>
              <Input value={doEndpoint} onChange={(e) => setDoEndpoint(e.target.value)} placeholder="https://customCDNdomain.com" disabled={activeStorage !== "digitalocean"} />
            </div>
            <div className="space-y-2">
              <Label>Bucket Region</Label>
              <Select value={doRegion} onValueChange={setDoRegion} disabled={activeStorage !== "digitalocean"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DO_REGIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {activeStorage === "digitalocean" && (
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => handleTestConnection("DigitalOcean")}>Test Connection</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wasabi */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-primary" />
              <div>
                <CardTitle className="text-base">Wasabi Configuration</CardTitle>
                <CardDescription className="mt-1">Store files in Wasabi cloud storage</CardDescription>
              </div>
            </div>
            <Badge variant={activeStorage === "wasabi" ? "default" : "secondary"} className="text-xs">
              {activeStorage === "wasabi" ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="p-3 rounded-lg bg-secondary/50 flex items-start gap-2">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">Wasabi has implemented updates to enhance security by disabling public access and altering configurations related to object and bucket accessibility.</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Wasabi Storage</Label>
              <p className="text-xs text-muted-foreground">Enable Wasabi Storage to store your files in Wasabi.</p>
            </div>
            <Switch checked={activeStorage === "wasabi"} onCheckedChange={(c) => setStorageProvider(c ? "wasabi" : "local")} />
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Bucket Name</Label>
              <Input value={wasabiBucket} onChange={(e) => setWasabiBucket(e.target.value)} placeholder="Your Wasabi Bucket Name" disabled={activeStorage !== "wasabi"} />
            </div>
            <div className="space-y-2">
              <Label>Access Key</Label>
              <Input value={wasabiAccessKey} onChange={(e) => setWasabiAccessKey(e.target.value)} placeholder="Your Wasabi Access Key" disabled={activeStorage !== "wasabi"} />
            </div>
            <div className="space-y-2">
              <Label>Secret Key</Label>
              <Input type="password" value={wasabiSecretKey} onChange={(e) => setWasabiSecretKey(e.target.value)} placeholder="Your Wasabi Secret Key" disabled={activeStorage !== "wasabi"} />
            </div>
            <div className="space-y-2">
              <Label>Custom Endpoint (Optional)</Label>
              <Input value={wasabiEndpoint} onChange={(e) => setWasabiEndpoint(e.target.value)} placeholder="https://customCDNdomain.com" disabled={activeStorage !== "wasabi"} />
            </div>
            <div className="space-y-2">
              <Label>Bucket Region</Label>
              <Select value={wasabiRegion} onValueChange={setWasabiRegion} disabled={activeStorage !== "wasabi"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {WASABI_REGIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {activeStorage === "wasabi" && (
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => handleTestConnection("Wasabi")}>Test Connection</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FTP */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              <div>
                <CardTitle className="text-base">FTP Settings</CardTitle>
                <CardDescription className="mt-1">Upload files to your own FTP server</CardDescription>
              </div>
            </div>
            <Badge variant={activeStorage === "ftp" ? "default" : "secondary"} className="text-xs">
              {activeStorage === "ftp" ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="p-3 rounded-lg bg-secondary/50 flex items-start gap-2">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground"><strong>Important:</strong> This may slow down your site's upload/delete speed. Make sure to use a fast FTP server.</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">FTP Storage</Label>
              <p className="text-xs text-muted-foreground">Enable FTP Storage to store your files in your own FTP server.</p>
            </div>
            <Switch checked={activeStorage === "ftp"} onCheckedChange={(c) => setStorageProvider(c ? "ftp" : "local")} />
          </div>

          <div className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>FTP Hostname</Label>
                <Input value={ftpHost} onChange={(e) => setFtpHost(e.target.value)} placeholder="IP or domain name" disabled={activeStorage !== "ftp"} />
              </div>
              <div className="space-y-2">
                <Label>FTP Port</Label>
                <Input value={ftpPort} onChange={(e) => setFtpPort(e.target.value)} placeholder="21" disabled={activeStorage !== "ftp"} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>FTP Username</Label>
                <Input value={ftpUsername} onChange={(e) => setFtpUsername(e.target.value)} placeholder="Your FTP username" disabled={activeStorage !== "ftp"} />
              </div>
              <div className="space-y-2">
                <Label>FTP Password</Label>
                <Input type="password" value={ftpPassword} onChange={(e) => setFtpPassword(e.target.value)} placeholder="Your FTP password" disabled={activeStorage !== "ftp"} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>FTP Path</Label>
              <Input value={ftpPath} onChange={(e) => setFtpPath(e.target.value)} placeholder="/upload" disabled={activeStorage !== "ftp"} />
              <p className="text-[11px] text-muted-foreground">The path to /upload files.</p>
            </div>
            <div className="space-y-2">
              <Label>FTP Endpoint</Label>
              <Input value={ftpEndpointUrl} onChange={(e) => setFtpEndpointUrl(e.target.value)} placeholder="wowonderftpstorage.com" disabled={activeStorage !== "ftp"} />
              <p className="text-[11px] text-muted-foreground">IP or domain where the FTP server is pointed to.</p>
            </div>
          </div>

          {activeStorage === "ftp" && (
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => handleTestConnection("FTP")}>Test Connection</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Google Cloud */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-primary" />
              <div>
                <CardTitle className="text-base">Google Cloud Settings</CardTitle>
                <CardDescription className="mt-1">Store files in Google Cloud Storage</CardDescription>
              </div>
            </div>
            <Badge variant={activeStorage === "gcloud" ? "default" : "secondary"} className="text-xs">
              {activeStorage === "gcloud" ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Google Cloud Storage</Label>
              <p className="text-xs text-muted-foreground">Enable Google Cloud Storage to store your files in Google Cloud.</p>
            </div>
            <Switch checked={activeStorage === "gcloud"} onCheckedChange={(c) => setStorageProvider(c ? "gcloud" : "local")} />
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Bucket Name</Label>
              <Input value={gcloudBucket} onChange={(e) => setGcloudBucket(e.target.value)} placeholder="Your Google Cloud Bucket Name" disabled={activeStorage !== "gcloud"} />
            </div>
            <div className="space-y-2">
              <Label>Google Cloud File Path</Label>
              <Input value={gcloudFilePath} onChange={(e) => setGcloudFilePath(e.target.value)} placeholder="Path to your Google Cloud JSON file" disabled={activeStorage !== "gcloud"} />
              <p className="text-[11px] text-muted-foreground">Should be a JSON file. Make sure to keep the file on your server.</p>
            </div>
            <div className="space-y-2">
              <Label>Custom Endpoint (Optional)</Label>
              <Input value={gcloudEndpoint} onChange={(e) => setGcloudEndpoint(e.target.value)} placeholder="https://customCDNdomain.com" disabled={activeStorage !== "gcloud"} />
            </div>
          </div>

          {activeStorage === "gcloud" && (
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => handleTestConnection("Google Cloud")}>Test Connection</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backblaze */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-primary" />
              <div>
                <CardTitle className="text-base">Backblaze Configuration</CardTitle>
                <CardDescription className="mt-1">Store files in Backblaze B2</CardDescription>
              </div>
            </div>
            <Badge variant={activeStorage === "backblaze" ? "default" : "secondary"} className="text-xs">
              {activeStorage === "backblaze" ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Backblaze Storage</Label>
              <p className="text-xs text-muted-foreground">Enable Backblaze Storage to store your files in Backblaze.</p>
            </div>
            <Switch checked={activeStorage === "backblaze"} onCheckedChange={(c) => setStorageProvider(c ? "backblaze" : "local")} />
          </div>

          <div className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bucket ID</Label>
                <Input value={bbBucketId} onChange={(e) => setBbBucketId(e.target.value)} placeholder="Your Backblaze Bucket ID" disabled={activeStorage !== "backblaze"} />
              </div>
              <div className="space-y-2">
                <Label>Bucket Name</Label>
                <Input value={bbBucketName} onChange={(e) => setBbBucketName(e.target.value)} placeholder="Your Backblaze Bucket Name" disabled={activeStorage !== "backblaze"} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Bucket Region</Label>
              <Input value={bbRegion} onChange={(e) => setBbRegion(e.target.value)} placeholder="Your Backblaze Bucket Region" disabled={activeStorage !== "backblaze"} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Access Key ID</Label>
                <Input value={bbAccessKeyId} onChange={(e) => setBbAccessKeyId(e.target.value)} placeholder="Your Backblaze Access Key ID" disabled={activeStorage !== "backblaze"} />
              </div>
              <div className="space-y-2">
                <Label>Access Key</Label>
                <Input type="password" value={bbAccessKey} onChange={(e) => setBbAccessKey(e.target.value)} placeholder="Your Backblaze Access Key" disabled={activeStorage !== "backblaze"} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Custom Endpoint (Optional)</Label>
              <Input value={bbEndpoint} onChange={(e) => setBbEndpoint(e.target.value)} placeholder="https://customCDNdomain.com" disabled={activeStorage !== "backblaze"} />
            </div>
          </div>

          {activeStorage === "backblaze" && (
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => handleTestConnection("Backblaze")}>Test Connection</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default AdminFileUploadSettings;
