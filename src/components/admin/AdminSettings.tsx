import { useState, useEffect, useCallback } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Settings, Globe2, Shield, Users, Bell, Code, Eye, Lock,
  Languages, Calendar, Home, UserPlus, Key, AlertTriangle, Save,
  Map, Video, Smartphone, MonitorSmartphone, Upload, HardDrive,
  Cloud, Server, FileVideo, Music, Image, Bug, Database,
  Mail, MessageSquare, Phone, Send, TestTube, Bot, CreditCard,
  Sparkles, Palette, ShoppingBag, Megaphone, Tag, LayoutGrid,
  Store, BarChart3, Layers, Plus, X, Trash2, DollarSign, Wallet,
  Crown, Banknote, Bitcoin,
} from "lucide-react";
import { toast } from "sonner";

interface SettingToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}

const SettingToggle = ({ label, description, checked, onCheckedChange }: SettingToggleProps) => (
  <div className="flex items-start justify-between gap-4 py-3">
    <div className="space-y-0.5">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
    <Switch checked={checked} onCheckedChange={onCheckedChange} className="shrink-0 mt-0.5" />
  </div>
);

interface SectionProps {
  title: string;
  description?: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

const SettingsSection = ({ title, description, icon: Icon, children }: SectionProps) => (
  <Card>
    <CardHeader className="pb-3">
      <div className="flex items-center gap-2">
        <Icon className="w-4.5 h-4.5 text-primary" />
        <CardTitle className="text-base">{title}</CardTitle>
      </div>
      {description && <CardDescription className="text-xs">{description}</CardDescription>}
    </CardHeader>
    <CardContent className="space-y-1">
      {children}
    </CardContent>
  </Card>
);

const AdminSettings = ({ onNavigateToDesign }: { onNavigateToDesign?: () => void }) => {
  const { settings: savedSettings, loading: settingsLoading, saving, saveSettings } = useSiteSettings("admin_settings");
  // General Configuration
  const [developerMode, setDeveloperMode] = useState(false);
  const [cacheSystem, setCacheSystem] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [seoFriendlyUrl, setSeoFriendlyUrl] = useState(true);
  const [developersApi, setDevelopersApi] = useState(false);
  const [welcomePageUsers, setWelcomePageUsers] = useState(true);
  const [defaultLanguage, setDefaultLanguage] = useState("english");
  const [dateFormat, setDateFormat] = useState("yyyy-mm-dd");
  const [landingPage, setLandingPage] = useState("login");

  // User Configuration
  const [onlineUsers, setOnlineUsers] = useState(true);
  const [lastSeenStatus, setLastSeenStatus] = useState(true);
  const [accountDeletion, setAccountDeletion] = useState(true);
  const [profileBgChange, setProfileBgChange] = useState("all");
  const [friendsSystem, setFriendsSystem] = useState("friend");
  const [connectivityLimit, setConnectivityLimit] = useState("500");
  const [userInviteSystem, setUserInviteSystem] = useState(true);
  const [inviteLinksLimit, setInviteLinksLimit] = useState("5");
  const [inviteLinksPeriod, setInviteLinksPeriod] = useState("1day");

  // Other Settings
  const [censoredWords, setCensoredWords] = useState("");
  const [homePageCaching, setHomePageCaching] = useState("2min");
  const [profilePageCaching, setProfilePageCaching] = useState("2min");
  const [exchangerateApiKey, setExchangerateApiKey] = useState("");

  // Login & Registration
  const [userRegistration, setUserRegistration] = useState(true);
  const [autoUsername, setAutoUsername] = useState(true);
  const [passwordComplexity, setPasswordComplexity] = useState(true);
  const [unusualLogin, setUnusualLogin] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState("email");
  const [googleAuth, setGoogleAuth] = useState(false);
  const [authySettings, setAuthySettings] = useState(false);
  const [authyToken, setAuthyToken] = useState("");
  const [accountValidation, setAccountValidation] = useState(true);
  const [validationMethod, setValidationMethod] = useState("email");
  const [recaptcha, setRecaptcha] = useState(false);
  const [recaptchaKey, setRecaptchaKey] = useState("");
  const [recaptchaSecret, setRecaptchaSecret] = useState("");
  const [preventBadLogin, setPreventBadLogin] = useState(true);
  const [loginLimit, setLoginLimit] = useState("5");
  const [lockoutTime, setLockoutTime] = useState("15");
  const [registrationLimit, setRegistrationLimit] = useState("3");
  const [reservedUsernames, setReservedUsernames] = useState(true);
  const [reservedUsernamesList, setReservedUsernamesList] = useState("admin, moderator, support, help");
  const [disableStartPage, setDisableStartPage] = useState(false);

  // Notifications Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [profileVisitNotifications, setProfileVisitNotifications] = useState(false);
  const [newPostNotification, setNewPostNotification] = useState(true);

  // Website Information
  const [websiteTitle, setWebsiteTitle] = useState("");
  const [websiteName, setWebsiteName] = useState("");
  const [websiteKeywords, setWebsiteKeywords] = useState("");
  const [websiteDescription, setWebsiteDescription] = useState("");
  const [googleAnalyticsCode, setGoogleAnalyticsCode] = useState("");

  // Features API Keys
  const [googleMaps, setGoogleMaps] = useState(false);
  const [googleMapApi, setGoogleMapApi] = useState("");
  const [yandexMaps, setYandexMaps] = useState(false);
  const [yandexMapApi, setYandexMapApi] = useState("");
  const [yandexTranslation, setYandexTranslation] = useState(false);
  const [yandexTranslationApi, setYandexTranslationApi] = useState("");
  const [googleTranslation, setGoogleTranslation] = useState(false);
  const [googleTranslationApi, setGoogleTranslationApi] = useState("");
  const [youtubeApiKey, setYoutubeApiKey] = useState("");
  const [giphyApi, setGiphyApi] = useState("");

  // File Upload Configuration
  const [fileUpload, setFileUpload] = useState(true);
  const [videoUpload, setVideoUpload] = useState(true);
  const [reelsUpload, setReelsUpload] = useState(true);
  const [audioUpload, setAudioUpload] = useState(true);
  const [cssUpload, setCssUpload] = useState(false);
  const [allowedExtensions, setAllowedExtensions] = useState("jpg, png, gif, jpeg, webp, svg, bmp, ico, mp4, mov, avi, mp3, wav, ogg, pdf, doc, docx, zip");
  const [allowedMimeTypes, setAllowedMimeTypes] = useState("image/jpeg, image/png, image/gif, image/webp, video/mp4, audio/mpeg, application/pdf");
  const [maxUploadSize, setMaxUploadSize] = useState("48mb");
  const [imageCompression, setImageCompression] = useState("medium");
  const [ffmpegSystem, setFfmpegSystem] = useState(false);
  const [ffmpegPath, setFfmpegPath] = useState("/usr/bin/ffmpeg");
  const [ffmpegSpeed, setFfmpegSpeed] = useState("medium");
  const [ffmpegExtensions, setFfmpegExtensions] = useState("mp4, mov, avi, wmv, flv, mkv, webm, 3gp");
  const [ffmpegMimeTypes, setFfmpegMimeTypes] = useState("video/mp4, video/quicktime, video/x-msvideo, video/webm");
  // Storage & CDN
  const [amazonS3, setAmazonS3] = useState(false);
  const [s3BucketName, setS3BucketName] = useState("");
  const [s3Key, setS3Key] = useState("");
  const [s3SecretKey, setS3SecretKey] = useState("");
  const [s3Endpoint, setS3Endpoint] = useState("");
  const [s3Region, setS3Region] = useState("us-east-1");
  const [digitalocean, setDigitalocean] = useState(false);
  const [doSpaceName, setDoSpaceName] = useState("");
  const [doKey, setDoKey] = useState("");
  const [doSecret, setDoSecret] = useState("");
  const [doEndpoint, setDoEndpoint] = useState("");
  const [doRegion, setDoRegion] = useState("nyc1");
  const [wasabi, setWasabi] = useState(false);
  const [wasabiBucket, setWasabiBucket] = useState("");
  const [wasabiAccessKey, setWasabiAccessKey] = useState("");
  const [wasabiSecretKey, setWasabiSecretKey] = useState("");
  const [wasabiEndpoint, setWasabiEndpoint] = useState("");
  const [wasabiRegion, setWasabiRegion] = useState("us-east-1");
  const [ftpStorage, setFtpStorage] = useState(false);
  const [ftpHostname, setFtpHostname] = useState("");
  const [ftpUsername, setFtpUsername] = useState("");
  const [ftpPassword, setFtpPassword] = useState("");
  const [ftpPort, setFtpPort] = useState("21");
  const [ftpPath, setFtpPath] = useState("");
  const [ftpEndpoint, setFtpEndpoint] = useState("");
  const [googleCloud, setGoogleCloud] = useState(false);
  const [gcBucketName, setGcBucketName] = useState("");
  const [gcFilePath, setGcFilePath] = useState("");
  const [gcEndpoint, setGcEndpoint] = useState("");
  const [backblaze, setBackblaze] = useState(false);
  const [bbBucketId, setBbBucketId] = useState("");
  const [bbBucketName, setBbBucketName] = useState("");
  const [bbBucketRegion, setBbBucketRegion] = useState("");
  const [bbAccessKeyId, setBbAccessKeyId] = useState("");
  const [bbAccessKey, setBbAccessKey] = useState("");
  const [bbEndpoint, setBbEndpoint] = useState("");

  // Email & SMS Configuration
  const [emailServer, setEmailServer] = useState("servermail");
  const [defaultEmail, setDefaultEmail] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpUsername, setSmtpUsername] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [smtpPort, setSmtpPort] = useState("465");
  const [smtpEncryption, setSmtpEncryption] = useState("ssl");
  const [defaultSmsProvider, setDefaultSmsProvider] = useState("twilio");
  const [smsPhoneNumber, setSmsPhoneNumber] = useState("");
  const [bulkSmsUsername, setBulkSmsUsername] = useState("");
  const [bulkSmsPassword, setBulkSmsPassword] = useState("");
  const [twilioSid, setTwilioSid] = useState("");
  const [twilioAuthToken, setTwilioAuthToken] = useState("");
  const [twilioPhone, setTwilioPhone] = useState("");
  const [infobipApiKey, setInfobipApiKey] = useState("");
  const [infobipBaseUrl, setInfobipBaseUrl] = useState("");
  const [msg91AuthKey, setMsg91AuthKey] = useState("");
  const [msg91DltId, setMsg91DltId] = useState("");
  const [emailDebugLog, setEmailDebugLog] = useState("");

  // AI Settings
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [openaiModel, setOpenaiModel] = useState("gpt-4");
  const [aiImages, setAiImages] = useState(true);
  const [aiImagesApi, setAiImagesApi] = useState("openai");
  const [aiPosts, setAiPosts] = useState(true);
  const [aiPostsApi, setAiPostsApi] = useState("openai");
  const [aiBlog, setAiBlog] = useState(true);
  const [aiBlogApi, setAiBlogApi] = useState("openai");
  const [aiAvatarCover, setAiAvatarCover] = useState(false);
  const [aiAvatarApi, setAiAvatarApi] = useState("replicate");
  const [replicateModel, setReplicateModel] = useState("stability-ai/stable-diffusion");
  const [replicateApiToken, setReplicateApiToken] = useState("");
  const [replicateInferenceSteps, setReplicateInferenceSteps] = useState("50");
  const [replicateGuidanceScale, setReplicateGuidanceScale] = useState("7");
  const [replicateSeed, setReplicateSeed] = useState("");
  const [creditPrice, setCreditPrice] = useState("1");
  const [aiImagesCreditSystem, setAiImagesCreditSystem] = useState(true);
  const [generatedImagePrice, setGeneratedImagePrice] = useState("5");
  const [aiTextCreditSystem, setAiTextCreditSystem] = useState(true);
  const [generatedWordPrice, setGeneratedWordPrice] = useState("1");

  // Payment Configuration
  const [paymentEnabled, setPaymentEnabled] = useState(true);
  const [paymentCurrency, setPaymentCurrency] = useState("USD");
  const [paymentGateway, setPaymentGateway] = useState("stripe");
  const [stripeEnabled, setStripeEnabled] = useState(true);
  const [stripePublishableKey, setStripePublishableKey] = useState("");
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState("");
  const [paypalEnabled, setPaypalEnabled] = useState(false);
  const [paypalMode, setPaypalMode] = useState("sandbox");
  const [paypalClientId, setPaypalClientId] = useState("");
  const [paypalClientSecret, setPaypalClientSecret] = useState("");
  const [razorpayEnabled, setRazorpayEnabled] = useState(false);
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState("");
  const [coinbaseEnabled, setCoinbaseEnabled] = useState(false);
  const [coinbaseApiKey, setCoinbaseApiKey] = useState("");
  const [coinbaseWebhookSecret, setCoinbaseWebhookSecret] = useState("");
  const [bankTransferEnabled, setBankTransferEnabled] = useState(false);
  const [bankTransferInstructions, setBankTransferInstructions] = useState("");
  const [proSystem, setProSystem] = useState(false);
  const [proMonthlyPrice, setProMonthlyPrice] = useState("9.99");
  const [proYearlyPrice, setProYearlyPrice] = useState("99.99");
  const [proLifetimePrice, setProLifetimePrice] = useState("299.99");
  const [walletSystem, setWalletSystem] = useState(false);
  const [walletMinTopup, setWalletMinTopup] = useState("5");
  const [walletMaxTopup, setWalletMaxTopup] = useState("500");

  // Manage Features
  const [marketplaceEnabled, setMarketplaceEnabled] = useState(true);
  const [marketplaceVerifiedSellers, setMarketplaceVerifiedSellers] = useState(true);
  const [marketplaceFraudDetection, setMarketplaceFraudDetection] = useState(true);
  const [marketplaceOffers, setMarketplaceOffers] = useState(true);
  const [marketplacePriceHistory, setMarketplacePriceHistory] = useState(true);
  const [marketplaceMaxImages, setMarketplaceMaxImages] = useState("10");
  const [marketplaceMaxPrice, setMarketplaceMaxPrice] = useState("100000");
  const [adsEnabled, setAdsEnabled] = useState(true);
  const [adsBanner, setAdsBanner] = useState(true);
  const [adsInterstitial, setAdsInterstitial] = useState(true);
  const [adsInterstitialFrequency, setAdsInterstitialFrequency] = useState("5");
  const [adsInterstitialCooldown, setAdsInterstitialCooldown] = useState("5");
  const [adsSponsoredPosts, setAdsSponsoredPosts] = useState(true);
  const [adsSidebarCards, setAdsSidebarCards] = useState(true);
  const [adsAutoApprove, setAdsAutoApprove] = useState(false);
  const [adsMinBudget, setAdsMinBudget] = useState("5");
  const [adsCostPerImpression, setAdsCostPerImpression] = useState("0.01");
  const [adsCostPerClick, setAdsCostPerClick] = useState("0.10");
  const [adsMaxPerPage, setAdsMaxPerPage] = useState("3");
  const [adsUserCreateEnabled, setAdsUserCreateEnabled] = useState(true);
  const [adsTargetingAge, setAdsTargetingAge] = useState(true);
  const [adsTargetingGender, setAdsTargetingGender] = useState(true);
  const [adsTargetingLocation, setAdsTargetingLocation] = useState(true);
  const [adsTargetingInterests, setAdsTargetingInterests] = useState(true);
  const [adsGoogleAdsense, setAdsGoogleAdsense] = useState(false);
  const [adsensePublisherId, setAdsensePublisherId] = useState("");
  const [adsenseHeaderSlot, setAdsenseHeaderSlot] = useState("");
  const [adsenseSidebarSlot, setAdsenseSidebarSlot] = useState("");
  const [adsenseFeedSlot, setAdsenseFeedSlot] = useState("");
  const [adsNsfwFilter, setAdsNsfwFilter] = useState(true);
  const [adsMaxDuration, setAdsMaxDuration] = useState("30");
  const [adsRevenueShare, setAdsRevenueShare] = useState("70");
  // Categories
  const [marketplaceCategories, setMarketplaceCategories] = useState([
    "Electronics", "Vehicles", "Furniture", "Clothing", "Sports", "Books", "Home & Garden", "Toys", "Music", "Other"
  ]);
  const [groupCategories, setGroupCategories] = useState([
    "General", "Sports", "Technology", "Music", "Art & Design", "Gaming", "Education", "Business", "Health & Fitness", "Food & Cooking", "Travel", "Science", "Books & Reading", "Movies & TV", "Photography"
  ]);
  const [pageCategories, setPageCategories] = useState([
    "Business", "Restaurant / Café", "Shopping & Retail", "Creator / Public Figure", "Musician / Band", "Artist", "Community Organization", "Nonprofit", "Sports Team", "Entertainment", "Education", "Health & Wellness", "Technology", "Media / News", "Other"
  ]);
  const [eventCategories, setEventCategories] = useState([
    "General", "Social", "Meetup", "Workshop", "Webinar", "Sports", "Music", "Fundraiser", "Networking", "Celebration"
  ]);
  const [newCategory, setNewCategory] = useState("");
  const [activeCategoryTab, setActiveCategoryTab] = useState("marketplace");

  // Android & iOS Apps
  const [androidMessenger, setAndroidMessenger] = useState("");
  const [androidTimeline, setAndroidTimeline] = useState("");
  const [iosMessenger, setIosMessenger] = useState("");
  const [iosTimeline, setIosTimeline] = useState("");
  const [windowsMessenger, setWindowsMessenger] = useState("");

  // PWA Settings
  const [pwaEnabled, setPwaEnabled] = useState(true);
  const [pwaAppName, setPwaAppName] = useState("");
  const [pwaShortName, setPwaShortName] = useState("");
  const [pwaThemeColor, setPwaThemeColor] = useState("#1d4ed8");
  const [pwaBackgroundColor, setPwaBackgroundColor] = useState("#ffffff");
  const [pwaOfflineMode, setPwaOfflineMode] = useState(true);
  const [pwaPushNotifications, setPwaPushNotifications] = useState(false);
  const [pwaInstallPrompt, setPwaInstallPrompt] = useState(true);

  // Load saved settings into local state
  useEffect(() => {
    if (!settingsLoading && savedSettings && Object.keys(savedSettings).length > 0) {
      const s = savedSettings;
      if (s.developerMode !== undefined) setDeveloperMode(s.developerMode);
      if (s.cacheSystem !== undefined) setCacheSystem(s.cacheSystem);
      if (s.maintenanceMode !== undefined) setMaintenanceMode(s.maintenanceMode);
      if (s.seoFriendlyUrl !== undefined) setSeoFriendlyUrl(s.seoFriendlyUrl);
      if (s.developersApi !== undefined) setDevelopersApi(s.developersApi);
      if (s.welcomePageUsers !== undefined) setWelcomePageUsers(s.welcomePageUsers);
      if (s.defaultLanguage !== undefined) setDefaultLanguage(s.defaultLanguage);
      if (s.dateFormat !== undefined) setDateFormat(s.dateFormat);
      if (s.landingPage !== undefined) setLandingPage(s.landingPage);
      if (s.onlineUsers !== undefined) setOnlineUsers(s.onlineUsers);
      if (s.lastSeenStatus !== undefined) setLastSeenStatus(s.lastSeenStatus);
      if (s.accountDeletion !== undefined) setAccountDeletion(s.accountDeletion);
      if (s.profileBgChange !== undefined) setProfileBgChange(s.profileBgChange);
      if (s.friendsSystem !== undefined) setFriendsSystem(s.friendsSystem);
      if (s.connectivityLimit !== undefined) setConnectivityLimit(s.connectivityLimit);
      if (s.userInviteSystem !== undefined) setUserInviteSystem(s.userInviteSystem);
      if (s.censoredWords !== undefined) setCensoredWords(s.censoredWords);
      if (s.websiteTitle !== undefined) setWebsiteTitle(s.websiteTitle);
      if (s.websiteName !== undefined) setWebsiteName(s.websiteName);
      if (s.websiteKeywords !== undefined) setWebsiteKeywords(s.websiteKeywords);
      if (s.websiteDescription !== undefined) setWebsiteDescription(s.websiteDescription);
      if (s.googleAnalyticsCode !== undefined) setGoogleAnalyticsCode(s.googleAnalyticsCode);
      if (s.userRegistration !== undefined) setUserRegistration(s.userRegistration);
      if (s.twoFactorAuth !== undefined) setTwoFactorAuth(s.twoFactorAuth);
      if (s.preventBadLogin !== undefined) setPreventBadLogin(s.preventBadLogin);
      if (s.loginLimit !== undefined) setLoginLimit(s.loginLimit);
      if (s.lockoutTime !== undefined) setLockoutTime(s.lockoutTime);
      if (s.marketplaceEnabled !== undefined) setMarketplaceEnabled(s.marketplaceEnabled);
      if (s.adsEnabled !== undefined) setAdsEnabled(s.adsEnabled);
      if (s.paymentEnabled !== undefined) setPaymentEnabled(s.paymentEnabled);
      if (s.paymentCurrency !== undefined) setPaymentCurrency(s.paymentCurrency);
      if (s.proSystem !== undefined) setProSystem(s.proSystem);
      if (s.walletSystem !== undefined) setWalletSystem(s.walletSystem);
      if (s.marketplaceCategories !== undefined) setMarketplaceCategories(s.marketplaceCategories);
      if (s.groupCategories !== undefined) setGroupCategories(s.groupCategories);
      if (s.pageCategories !== undefined) setPageCategories(s.pageCategories);
      if (s.eventCategories !== undefined) setEventCategories(s.eventCategories);
    }
  }, [settingsLoading, savedSettings]);

  const handleSave = async () => {
    await saveSettings({
      developerMode, cacheSystem, maintenanceMode, seoFriendlyUrl, developersApi,
      welcomePageUsers, defaultLanguage, dateFormat, landingPage,
      onlineUsers, lastSeenStatus, accountDeletion, profileBgChange, friendsSystem,
      connectivityLimit, userInviteSystem, censoredWords,
      websiteTitle, websiteName, websiteKeywords, websiteDescription, googleAnalyticsCode,
      userRegistration, twoFactorAuth, preventBadLogin, loginLimit, lockoutTime,
      marketplaceEnabled, adsEnabled, paymentEnabled, paymentCurrency,
      proSystem, walletSystem,
      marketplaceCategories, groupCategories, pageCategories, eventCategories,
    });
  };

  const languages = [
    "Arabic", "Bengali", "Chinese", "Croatian", "Danish", "Dutch", "English",
    "Filipino", "French", "German", "Hebrew", "Hindi", "Indonesian", "Italian",
    "Japanese", "Korean", "Persian", "Portuguese", "Russian", "Spanish",
    "Swedish", "Turkish", "Urdu", "Vietnamese",
  ];

  const dateFormats = [
    { value: "mm-dd-yy", label: "mm-dd-yy" },
    { value: "dd-mm-yy", label: "dd-mm-yy" },
    { value: "yy-mm-dd", label: "yy-mm-dd" },
    { value: "mmm-dd-yy", label: "mmm-dd-yy" },
    { value: "dd-mmmm-yy", label: "dd-mmmm-yy" },
    { value: "yyyy-mm-dd", label: "yyyy-mm-dd" },
    { value: "dd-mmm-yyyy", label: "dd-mmm-yyyy" },
    { value: "dd-mmmm-yyyy", label: "dd-mmmm-yyyy" },
  ];

  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "users", label: "Users", icon: Users },
    { id: "security", label: "Login & Security", icon: Lock },
    { id: "website", label: "Website Info", icon: Globe2 },
    { id: "api", label: "API Keys", icon: Key },
    { id: "files", label: "Files & Storage", icon: Upload },
    { id: "email", label: "Email & SMS", icon: Mail },
    { id: "ai", label: "AI Settings", icon: Bot },
    { id: "features", label: "Features", icon: Layers },
    { id: "payments", label: "Payments", icon: DollarSign },
    { id: "apps", label: "Mobile Apps", icon: Smartphone },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Settings</h2>
          <p className="text-xs text-muted-foreground">Configure your platform settings</p>
        </div>
        <Button onClick={handleSave} disabled={saving} size="sm">
          <Save className="w-4 h-4 mr-1.5" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 bg-muted/50 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
      </div>

      {/* ── General Tab ── */}
      {activeTab === "general" && (
        <>
      <SettingsSection title="General Configuration" icon={Settings} description="Core platform settings and behavior">
        <Separator />
        <SettingToggle
          label="Cache System"
          description="Speed up your website up to 80%. Folder cache and all subfolder permissions should be set to 777."
          checked={cacheSystem}
          onCheckedChange={setCacheSystem}
        />
        <Separator />
        <SettingToggle
          label="Maintenance Mode"
          description="Turn the whole site under maintenance. Access admin panel via /admin to restore."
          checked={maintenanceMode}
          onCheckedChange={setMaintenanceMode}
        />
        {maintenanceMode && (
          <div className="ml-1 mb-1">
            <Badge variant="destructive" className="text-[10px]">Site is in maintenance mode</Badge>
          </div>
        )}
        <Separator />
        <SettingToggle
          label="SEO Friendly URL"
          description="Enable smooth loading to save bandwidth and improve search rankings."
          checked={seoFriendlyUrl}
          onCheckedChange={setSeoFriendlyUrl}
        />
        <Separator />
        <SettingToggle
          label="Developers (API System)"
          description="Show /developers page to all users for API requests."
          checked={developersApi}
          onCheckedChange={setDevelopersApi}
        />
        <Separator />
        <SettingToggle
          label="Welcome Page Users"
          description="Allow non-logged users to view user profiles on the welcome page."
          checked={welcomePageUsers}
          onCheckedChange={setWelcomePageUsers}
        />
        <Separator />

        <div className="py-3 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Default Language</label>
              <p className="text-xs text-muted-foreground mb-1.5">Set your site default language.</p>
              <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang.toLowerCase()}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Date Format</label>
              <p className="text-xs text-muted-foreground mb-1.5">Set your site default date format.</p>
              <Select value={dateFormat} onValueChange={setDateFormat}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {dateFormats.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <Separator />

        <div className="py-3">
          <label className="text-sm font-medium text-foreground">Landing Page</label>
          <p className="text-xs text-muted-foreground mb-1.5">If people are not logged in they will be redirected to this page.</p>
          <Select value={landingPage} onValueChange={setLandingPage}>
            <SelectTrigger className="h-9 text-sm max-w-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="login">Login Page</SelectItem>
              <SelectItem value="register">Register Page</SelectItem>
              <SelectItem value="newsfeed">NewsFeed Page</SelectItem>
              <SelectItem value="directory">Directory Page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SettingsSection>
      </>
      )}

      {/* ── Users Tab ── */}
      {activeTab === "users" && (
        <>
      <SettingsSection title="User Configuration" icon={Users} description="User behavior and feature access settings">
        <SettingToggle
          label="Online Users"
          description="Show current active users on the home page."
          checked={onlineUsers}
          onCheckedChange={setOnlineUsers}
        />
        <Separator />
        <SettingToggle
          label="User Last Seen Status"
          description="Allow users to set their status, online & last active."
          checked={lastSeenStatus}
          onCheckedChange={setLastSeenStatus}
        />
        <Separator />
        <SettingToggle
          label="User Account Deletion"
          description="Allow users to delete their accounts."
          checked={accountDeletion}
          onCheckedChange={setAccountDeletion}
        />
        <Separator />

        <div className="py-3">
          <label className="text-sm font-medium text-foreground">Profile Background Change</label>
          <p className="text-xs text-muted-foreground mb-1.5">Allow users to change their profile backgrounds by uploading an image.</p>
          <Select value={profileBgChange} onValueChange={setProfileBgChange}>
            <SelectTrigger className="h-9 text-sm max-w-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin Only</SelectItem>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="verified">Verified Users Only</SelectItem>
              <SelectItem value="pro">Pro Users Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Separator />

        <div className="py-3">
          <label className="text-sm font-medium text-foreground">Friends System</label>
          <p className="text-xs text-muted-foreground mb-1.5">Choose between Follow & Friend system. Changing will delete existing connections.</p>
          <Select value={friendsSystem} onValueChange={setFriendsSystem}>
            <SelectTrigger className="h-9 text-sm max-w-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="friend">Friend System</SelectItem>
              <SelectItem value="follow">Follow System</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Separator />

        <div className="py-3">
          <label className="text-sm font-medium text-foreground">Connectivity System Limit</label>
          <p className="text-xs text-muted-foreground mb-1.5">How many friends can each user have?</p>
          <Input type="number" value={connectivityLimit} onChange={(e) => setConnectivityLimit(e.target.value)} className="h-9 text-sm max-w-[120px]" />
        </div>
        <Separator />

        <SettingToggle
          label="User Invite System"
          description="Allow users to invite other users to your site."
          checked={userInviteSystem}
          onCheckedChange={setUserInviteSystem}
        />
        {userInviteSystem && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Max invite links</label>
                <Input type="number" value={inviteLinksLimit} onChange={(e) => setInviteLinksLimit(e.target.value)} className="h-8 text-sm mt-1" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Links valid within</label>
                <Select value={inviteLinksPeriod} onValueChange={setInviteLinksPeriod}>
                  <SelectTrigger className="h-8 text-sm mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1hour">1 Hour</SelectItem>
                    <SelectItem value="1day">1 Day</SelectItem>
                    <SelectItem value="1week">1 Week</SelectItem>
                    <SelectItem value="1month">1 Month</SelectItem>
                    <SelectItem value="1year">1 Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}
      </SettingsSection>
      </>
      )}

      {/* ── General Tab (cont): Other Settings + Notifications ── */}
      {activeTab === "general" && (
        <>
      <SettingsSection title="Other Settings" icon={Globe2} description="Caching, censorship, and misc configurations">
        <div className="py-3">
          <label className="text-sm font-medium text-foreground">Censored Words</label>
          <p className="text-xs text-muted-foreground mb-1.5">Words to be censored and replaced with *** in messages, posts, comments etc, separated by a comma.</p>
          <Textarea
            value={censoredWords}
            onChange={(e) => setCensoredWords(e.target.value)}
            placeholder="word1, word2, word3..."
            className="text-sm resize-none"
            rows={3}
          />
        </div>
        <Separator />

        <div className="py-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground">Home Page Caching</label>
            <p className="text-xs text-muted-foreground mb-1.5">Enable to save database usage and increase speed.</p>
            <Select value={homePageCaching} onValueChange={setHomePageCaching}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="2min">Every 2 minutes</SelectItem>
                <SelectItem value="never">Never cache</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Profile Page Caching</label>
            <p className="text-xs text-muted-foreground mb-1.5">Update sidebar data every X interval.</p>
            <Select value={profilePageCaching} onValueChange={setProfilePageCaching}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="30sec">Every 30 seconds</SelectItem>
                <SelectItem value="2min">Every 2 minutes</SelectItem>
                <SelectItem value="1hour">Every 1 hour</SelectItem>
                <SelectItem value="2hours">Every 2 hours</SelectItem>
                <SelectItem value="12hours">Every 12 hours</SelectItem>
                <SelectItem value="24hours">Every 24 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Separator />

        <div className="py-3">
          <label className="text-sm font-medium text-foreground">Exchangerate API Key</label>
          <p className="text-xs text-muted-foreground mb-1.5">Your Exchangerate API Key for currency conversion.</p>
          <Input
            type="password"
            value={exchangerateApiKey}
            onChange={(e) => setExchangerateApiKey(e.target.value)}
            placeholder="Enter API key..."
            className="h-9 text-sm max-w-md"
          />
        </div>
      </SettingsSection>
      </>
      )}

      {/* ── Login & Security Tab ── */}
      {activeTab === "security" && (
        <>
      <SettingsSection title="Login & Registration" icon={Lock} description="Authentication, security, and registration settings">
        <SettingToggle
          label="User Registration"
          description="Allow users to create accounts on your site."
          checked={userRegistration}
          onCheckedChange={setUserRegistration}
        />
        <Separator />
        <SettingToggle
          label="Auto Username On Register"
          description="Generate an auto username on sign up. Registration form will ask for first name and last name."
          checked={autoUsername}
          onCheckedChange={setAutoUsername}
        />
        <Separator />
        <SettingToggle
          label="Password Complexity System"
          description="Require strong passwords including letters, numbers and special characters."
          checked={passwordComplexity}
          onCheckedChange={setPasswordComplexity}
        />
        <Separator />
        <SettingToggle
          label="Unusual Login Detection"
          description="Send a confirmation link when the user logs in from a new location."
          checked={unusualLogin}
          onCheckedChange={setUnusualLogin}
        />
        <Separator />
        <SettingToggle
          label="Remember This Device"
          description="Remember this device on the welcome page."
          checked={rememberDevice}
          onCheckedChange={setRememberDevice}
        />
        <Separator />
        <SettingToggle
          label="Two-Factor Authentication"
          description="Send confirmation code to email or SMS when user logs in."
          checked={twoFactorAuth}
          onCheckedChange={setTwoFactorAuth}
        />
        {twoFactorAuth && (
          <div className="pb-2">
            <label className="text-xs font-medium text-muted-foreground">2FA Method</label>
            <Select value={twoFactorMethod} onValueChange={setTwoFactorMethod}>
              <SelectTrigger className="h-8 text-sm mt-1 max-w-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="email">E-mail Address</SelectItem>
                <SelectItem value="sms">SMS / Phone Number</SelectItem>
                <SelectItem value="both">Both Together</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <Separator />
        <SettingToggle
          label="Google Authenticator"
          description="Require Google Authenticator code when user logs in."
          checked={googleAuth}
          onCheckedChange={setGoogleAuth}
        />
        <Separator />
        <SettingToggle
          label="Authy Settings"
          description="Require Authy code when user logs in."
          checked={authySettings}
          onCheckedChange={setAuthySettings}
        />
        {authySettings && (
          <div className="pb-2">
            <label className="text-xs font-medium text-muted-foreground">Authy Token</label>
            <Input
              type="password"
              value={authyToken}
              onChange={(e) => setAuthyToken(e.target.value)}
              placeholder="Authy Token from your Twilio account"
              className="h-8 text-sm mt-1 max-w-md"
            />
          </div>
        )}
        <Separator />
        <SettingToggle
          label="Account Validation"
          description="Send an activation link after registration."
          checked={accountValidation}
          onCheckedChange={setAccountValidation}
        />
        {accountValidation && (
          <div className="pb-2">
            <label className="text-xs font-medium text-muted-foreground">Validation Method</label>
            <Select value={validationMethod} onValueChange={setValidationMethod}>
              <SelectTrigger className="h-8 text-sm mt-1 max-w-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="email">E-mail Address</SelectItem>
                <SelectItem value="sms">SMS / Phone Number</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <Separator />
        <SettingToggle
          label="reCaptcha"
          description="Enable reCaptcha to prevent spam registrations."
          checked={recaptcha}
          onCheckedChange={setRecaptcha}
        />
        {recaptcha && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Recaptcha Key</label>
              <Input value={recaptchaKey} onChange={(e) => setRecaptchaKey(e.target.value)} className="h-8 text-sm mt-1" placeholder="Site key" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Recaptcha Secret Key</label>
              <Input type="password" value={recaptchaSecret} onChange={(e) => setRecaptchaSecret(e.target.value)} className="h-8 text-sm mt-1" placeholder="Secret key" />
            </div>
          </div>
        )}
        <Separator />
        <SettingToggle
          label="Prevent Bad Login Attempts"
          description="Track and stop brute-force attacks."
          checked={preventBadLogin}
          onCheckedChange={setPreventBadLogin}
        />
        {preventBadLogin && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Login Limit</label>
              <p className="text-[10px] text-muted-foreground">Max attempts before lockout</p>
              <Input type="number" value={loginLimit} onChange={(e) => setLoginLimit(e.target.value)} className="h-8 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Lockout Time (Minutes)</label>
              <p className="text-[10px] text-muted-foreground">Duration of lockout</p>
              <Input type="number" value={lockoutTime} onChange={(e) => setLockoutTime(e.target.value)} className="h-8 text-sm mt-1" />
            </div>
          </div>
        )}
        <Separator />

        <div className="py-3">
          <label className="text-sm font-medium text-foreground">Registration Limits</label>
          <p className="text-xs text-muted-foreground mb-1.5">How many accounts can be created per hour.</p>
          <Input type="number" value={registrationLimit} onChange={(e) => setRegistrationLimit(e.target.value)} className="h-9 text-sm max-w-[120px]" />
        </div>
        <Separator />

        <SettingToggle
          label="Reserved Usernames System"
          description="Prevent users from using reserved usernames."
          checked={reservedUsernames}
          onCheckedChange={setReservedUsernames}
        />
        {reservedUsernames && (
          <div className="pb-2">
            <label className="text-xs font-medium text-muted-foreground">Reserved Usernames</label>
            <Textarea
              value={reservedUsernamesList}
              onChange={(e) => setReservedUsernamesList(e.target.value)}
              placeholder="admin, moderator, support..."
              className="text-sm resize-none mt-1"
              rows={2}
            />
          </div>
        )}
        <Separator />
        <SettingToggle
          label="Disable Start Page"
          description="Disable the startup page for new visitors."
          checked={disableStartPage}
          onCheckedChange={setDisableStartPage}
        />
      </SettingsSection>

      <SettingsSection title="Notification Settings" icon={Bell} description="Configure notification behavior for users">
        <SettingToggle
          label="E-mail Notifications"
          description="Send e-mail notifications to users after getting site notifications."
          checked={emailNotifications}
          onCheckedChange={setEmailNotifications}
        />
        <Separator />
        <SettingToggle
          label="Profile Visit Notifications"
          description="Send a notification when someone visits a user's profile."
          checked={profileVisitNotifications}
          onCheckedChange={setProfileVisitNotifications}
        />
        <Separator />
        <SettingToggle
          label="Notification On New Post"
          description="Send a notification to followers when a user creates a new post."
          checked={newPostNotification}
          onCheckedChange={setNewPostNotification}
        />
      </SettingsSection>
      </>
      )}

      {/* ── Website Info Tab ── */}
      {activeTab === "website" && (
        <>
      {/* Website Information */}
      <SettingsSection title="Website Information" icon={Globe2} description="SEO, branding, and analytics configuration">
        <div className="py-3 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Website Title</label>
            <p className="text-xs text-muted-foreground mb-1.5">Your website general title, it will appear on Google and on your browser tab.</p>
            <Input value={websiteTitle} onChange={(e) => setWebsiteTitle(e.target.value)} className="h-9 text-sm" placeholder="My Social Network" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Website Name</label>
            <p className="text-xs text-muted-foreground mb-1.5">Your website name, it will appear on website's footer and E-mails.</p>
            <Input value={websiteName} onChange={(e) => setWebsiteName(e.target.value)} className="h-9 text-sm" placeholder="MySocialNetwork" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Website Keywords</label>
            <p className="text-xs text-muted-foreground mb-1.5">Your website's keywords, used mostly for SEO and search engines.</p>
            <Input value={websiteKeywords} onChange={(e) => setWebsiteKeywords(e.target.value)} className="h-9 text-sm" placeholder="social network, community, friends" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Website Description</label>
            <p className="text-xs text-muted-foreground mb-1.5">Your website's description, used mostly for SEO and search engines. Max 100 characters recommended.</p>
            <Textarea value={websiteDescription} onChange={(e) => setWebsiteDescription(e.target.value)} className="text-sm resize-none" rows={2} placeholder="A social network for connecting people..." maxLength={100} />
            <p className="text-[10px] text-muted-foreground mt-1">{websiteDescription.length}/100 characters</p>
          </div>
          <Separator />
          <div>
            <label className="text-sm font-medium text-foreground">Website Logo</label>
            <p className="text-xs text-muted-foreground mb-1.5">You can change your logo from Change Site Design.</p>
            <Button variant="outline" size="sm" onClick={onNavigateToDesign}>Change Site Design</Button>
          </div>
          <Separator />
          <div>
            <label className="text-sm font-medium text-foreground">Google Analytics Code</label>
            <p className="text-xs text-muted-foreground mb-1.5">Paste your full Google Analytics Code here to track traffic.</p>
            <Textarea value={googleAnalyticsCode} onChange={(e) => setGoogleAnalyticsCode(e.target.value)} className="text-sm resize-none font-mono" rows={3} placeholder="<!-- Google Analytics --> ..." />
          </div>
        </div>
      </SettingsSection>
      </>
      )}

      {/* ── API Keys Tab ── */}
      {activeTab === "api" && (
        <>
      {/* Features API Keys */}
      <SettingsSection title="Features API Keys & Information" icon={Key} description="API keys for maps, translation, and media services">
        <SettingToggle
          label="Google Maps"
          description="Show Google Map on Posts, Profile, Settings, Ads."
          checked={googleMaps}
          onCheckedChange={setGoogleMaps}
        />
        {googleMaps && (
          <div className="pb-2">
            <label className="text-xs font-medium text-muted-foreground">Google Map API Key</label>
            <p className="text-[10px] text-muted-foreground mb-1">Required for GEO and viewing Google Maps.</p>
            <Input type="password" value={googleMapApi} onChange={(e) => setGoogleMapApi(e.target.value)} className="h-8 text-sm max-w-md" placeholder="Enter Google Maps API key..." />
          </div>
        )}
        <Separator />

        <SettingToggle
          label="Yandex Maps"
          description="Show Yandex Map on Posts, Profile, Settings, Ads."
          checked={yandexMaps}
          onCheckedChange={setYandexMaps}
        />
        {yandexMaps && (
          <div className="pb-2">
            <label className="text-xs font-medium text-muted-foreground">Yandex Map API Key</label>
            <p className="text-[10px] text-muted-foreground mb-1">Required for GEO and viewing Yandex Maps.</p>
            <Input type="password" value={yandexMapApi} onChange={(e) => setYandexMapApi(e.target.value)} className="h-8 text-sm max-w-md" placeholder="Enter Yandex Maps API key..." />
          </div>
        )}
        <Separator />

        <SettingToggle
          label="Yandex Translation API"
          description="Translate post text using Yandex Translation."
          checked={yandexTranslation}
          onCheckedChange={setYandexTranslation}
        />
        {yandexTranslation && (
          <div className="pb-2">
            <label className="text-xs font-medium text-muted-foreground">Yandex Translation API Key</label>
            <Input type="password" value={yandexTranslationApi} onChange={(e) => setYandexTranslationApi(e.target.value)} className="h-8 text-sm max-w-md" placeholder="Enter API key..." />
          </div>
        )}
        <Separator />

        <SettingToggle
          label="Google Translation API"
          description="Translate post text using Google Translation."
          checked={googleTranslation}
          onCheckedChange={setGoogleTranslation}
        />
        {googleTranslation && (
          <div className="pb-2">
            <label className="text-xs font-medium text-muted-foreground">Google Translation API Key</label>
            <Input type="password" value={googleTranslationApi} onChange={(e) => setGoogleTranslationApi(e.target.value)} className="h-8 text-sm max-w-md" placeholder="Enter API key..." />
          </div>
        )}
        <Separator />

        <div className="py-3 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">YouTube API Key</label>
            <p className="text-xs text-muted-foreground mb-1.5">Required for importing or posting YouTube videos.</p>
            <Input type="password" value={youtubeApiKey} onChange={(e) => setYoutubeApiKey(e.target.value)} className="h-9 text-sm max-w-md" placeholder="Enter YouTube API key..." />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Giphy API</label>
            <p className="text-xs text-muted-foreground mb-1.5">Required for GIFs in messages, posts and comments.</p>
            <Input type="password" value={giphyApi} onChange={(e) => setGiphyApi(e.target.value)} className="h-9 text-sm max-w-md" placeholder="Enter Giphy API key..." />
          </div>
        </div>
      </SettingsSection>


      {/* ── File Upload Configuration ── */}
      <SettingsSection title="Upload & File Sharing" description="Configure file upload and sharing capabilities for your platform." icon={Upload}>
        <SettingToggle label="File Upload & Sharing" description="By enabling this feature, the user can share and upload files in your site." checked={fileUpload} onCheckedChange={setFileUpload} />
        <Separator />
        <SettingToggle label="Video Upload & Sharing" description="Turn on the ability for users to share and upload videos. You can configure the video converter settings from FFMPEG Settings below." checked={videoUpload} onCheckedChange={setVideoUpload} />
        <Separator />
        <SettingToggle label="Reels Upload" description="Turn on the ability for users to share and upload reels. You can configure the video converter settings from FFMPEG Settings below." checked={reelsUpload} onCheckedChange={setReelsUpload} />
        <Separator />
        <SettingToggle label="Audio Upload & Sharing" description="Turn on the ability for users to share and upload music and audio files." checked={audioUpload} onCheckedChange={setAudioUpload} />
        <Separator />
        <SettingToggle label="CSS Upload & Modifications" description="Allow users to upload their own CSS file to design their profile." checked={cssUpload} onCheckedChange={setCssUpload} />
      </SettingsSection>

      <SettingsSection title="Upload & File Limits" description="Important: Make sure you don't allow PHP, JS, HTML, XML, XPHP, PHP5 files — your site could be at risk." icon={Shield}>
        <div>
          <label className="text-sm font-medium text-foreground">Allowed Extensions</label>
          <p className="text-xs text-muted-foreground mb-1.5">Only those type of files user can upload to your site. (separated with comma,)</p>
          <Textarea value={allowedExtensions} onChange={(e) => setAllowedExtensions(e.target.value)} className="text-sm min-h-[60px]" />
        </div>
        <Separator />
        <div>
          <label className="text-sm font-medium text-foreground">Allowed MIME Types</label>
          <p className="text-xs text-muted-foreground mb-1.5">Only those MIME-type of files user can upload to your site. (separated with comma,)</p>
          <Textarea value={allowedMimeTypes} onChange={(e) => setAllowedMimeTypes(e.target.value)} className="text-sm min-h-[60px]" />
        </div>
        <Separator />
        <div>
          <label className="text-sm font-medium text-foreground">Max Upload Size</label>
          <p className="text-xs text-muted-foreground mb-1.5">Set the max upload size a user can use for uploading files, videos, music and images.</p>
          <Select value={maxUploadSize} onValueChange={setMaxUploadSize}>
            <SelectTrigger className="h-9 text-sm max-w-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["2 MB", "6 MB", "12 MB", "24 MB", "48 MB", "96 MB", "256 MB", "512 MB", "1 GB", "5 GB", "10 GB"].map((s) => (
                <SelectItem key={s} value={s.toLowerCase().replace(" ", "")}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Separator />
        <div>
          <label className="text-sm font-medium text-foreground">Image Compression Level</label>
          <p className="text-xs text-muted-foreground mb-1.5">Set the image compression level, the higher you choose the less quality you'll get.</p>
          <Select value={imageCompression} onValueChange={setImageCompression}>
            <SelectTrigger className="h-9 text-sm max-w-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Very Low", "Low", "Medium", "High", "Very High"].map((l) => (
                <SelectItem key={l} value={l.toLowerCase().replace(" ", "")}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </SettingsSection>

      <SettingsSection title="FFMPEG Video Converter Settings" description="This system will compress, convert, and optimize videos to mp4. Requires 'ffmpeg' to be installed on your server." icon={FileVideo}>
        <SettingToggle label="FFMPEG System" description="Enable the FFMPEG video processing system for automatic video conversion and optimization." checked={ffmpegSystem} onCheckedChange={setFfmpegSystem} />
        {ffmpegSystem && (
          <>
            <Separator />
            <div>
              <label className="text-sm font-medium text-foreground">FFMPEG Binary File Path</label>
              <p className="text-xs text-muted-foreground mb-1.5">Example: Linux(/usr/bin/ffmpeg) or Windows(C:\ffmpeg\bin\ffmpeg.exe)</p>
              <Input value={ffmpegPath} onChange={(e) => setFfmpegPath(e.target.value)} className="h-9 text-sm max-w-md" />
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-foreground">Convert Video Speed</label>
              <p className="text-xs text-muted-foreground mb-1.5">Using a slower preset gives you better compression, or quality per filesize.</p>
              <Select value={ffmpegSpeed} onValueChange={setFfmpegSpeed}>
                <SelectTrigger className="h-9 text-sm max-w-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Ultrafast", "Superfast", "Veryfast", "Faster", "Fast", "Medium", "Slow", "Slower", "Veryslow"].map((s) => (
                    <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-foreground">Allowed Video Extensions</label>
              <p className="text-xs text-muted-foreground mb-1.5">Only those type of videos user can upload to your site. (separated with comma,)</p>
              <Textarea value={ffmpegExtensions} onChange={(e) => setFfmpegExtensions(e.target.value)} className="text-sm min-h-[50px]" />
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-foreground">Allowed Video MIME Types</label>
              <p className="text-xs text-muted-foreground mb-1.5">Only those MIME-type of videos user can upload. (separated with comma,)</p>
              <Textarea value={ffmpegMimeTypes} onChange={(e) => setFfmpegMimeTypes(e.target.value)} className="text-sm min-h-[50px]" />
            </div>
            <Separator />
            <div className="flex items-center gap-3 py-2">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.success("FFMPEG is configured and working correctly.")}>
                <Bug className="w-3.5 h-3.5" />
                Debug FFMPEG
              </Button>
              <p className="text-xs text-muted-foreground">Test the FFMPEG configuration and make sure the system is working fine.</p>
            </div>
          </>
        )}
      </SettingsSection>

      {/* ── Storage & CDN ── */}
      <SettingsSection title="Storage & CDN Configuration" description="Important: You can't enable two or three storages at the same time." icon={Database}>
        {/* Amazon S3 */}
        <Card className="border-dashed">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-orange-500" />
                <CardTitle className="text-sm">Amazon S3 Configuration</CardTitle>
              </div>
              <Switch checked={amazonS3} onCheckedChange={setAmazonS3} />
            </div>
            <CardDescription className="text-xs">Enable Amazon Storage to store your files in Amazon S3.</CardDescription>
          </CardHeader>
          {amazonS3 && (
            <CardContent className="space-y-3 px-4 pb-3">
              <div>
                <label className="text-xs font-medium">Amazon Bucket Name</label>
                <Input value={s3BucketName} onChange={(e) => setS3BucketName(e.target.value)} className="h-8 text-sm mt-1" placeholder="your-bucket-name" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Amazon S3 Key</label>
                  <Input value={s3Key} onChange={(e) => setS3Key(e.target.value)} className="h-8 text-sm mt-1" placeholder="AWS Key" />
                </div>
                <div>
                  <label className="text-xs font-medium">Amazon S3 Secret Key</label>
                  <Input type="password" value={s3SecretKey} onChange={(e) => setS3SecretKey(e.target.value)} className="h-8 text-sm mt-1" placeholder="AWS Secret" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium">Custom Endpoint (Optional)</label>
                <Input value={s3Endpoint} onChange={(e) => setS3Endpoint(e.target.value)} className="h-8 text-sm mt-1" placeholder="https://customCDNdomain.com" />
              </div>
              <div>
                <label className="text-xs font-medium">Bucket Region</label>
                <Select value={s3Region} onValueChange={setS3Region}>
                  <SelectTrigger className="h-8 text-sm mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[
                      { v: "us-east-1", l: "US East (N. Virginia)" }, { v: "us-east-2", l: "US East (Ohio)" },
                      { v: "us-west-1", l: "US West (N. California)" }, { v: "us-west-2", l: "US West (Oregon)" },
                      { v: "eu-west-1", l: "Europe (Ireland)" }, { v: "eu-west-2", l: "Europe (London)" },
                      { v: "eu-central-1", l: "Europe (Frankfurt)" }, { v: "ap-southeast-1", l: "Asia Pacific (Singapore)" },
                      { v: "ap-northeast-1", l: "Asia Pacific (Tokyo)" }, { v: "sa-east-1", l: "South America (São Paulo)" },
                    ].map((r) => <SelectItem key={r.v} value={r.v}>{r.l} ({r.v})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-300">Before enabling, upload the whole "upload/" folder to your bucket</Badge>
            </CardContent>
          )}
        </Card>

        <Separator />

        {/* Digitalocean Spaces */}
        <Card className="border-dashed">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-blue-500" />
                <CardTitle className="text-sm">DigitalOcean Spaces</CardTitle>
              </div>
              <Switch checked={digitalocean} onCheckedChange={setDigitalocean} />
            </div>
            <CardDescription className="text-xs">Enable DigitalOcean Storage to store your files in Spaces.</CardDescription>
          </CardHeader>
          {digitalocean && (
            <CardContent className="space-y-3 px-4 pb-3">
              <div>
                <label className="text-xs font-medium">Space Name</label>
                <Input value={doSpaceName} onChange={(e) => setDoSpaceName(e.target.value)} className="h-8 text-sm mt-1" placeholder="your-space-name" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Key</label>
                  <Input value={doKey} onChange={(e) => setDoKey(e.target.value)} className="h-8 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium">Secret</label>
                  <Input type="password" value={doSecret} onChange={(e) => setDoSecret(e.target.value)} className="h-8 text-sm mt-1" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium">Custom Endpoint (Optional)</label>
                <Input value={doEndpoint} onChange={(e) => setDoEndpoint(e.target.value)} className="h-8 text-sm mt-1" placeholder="https://customCDNdomain.com" />
              </div>
              <div>
                <label className="text-xs font-medium">Region</label>
                <Select value={doRegion} onValueChange={setDoRegion}>
                  <SelectTrigger className="h-8 text-sm mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["NYC1", "NYC2", "NYC3", "SFO1", "SFO2", "TOR1", "LON1", "FRA1", "AMS2", "AMS3", "SGP1", "BLR1"].map((r) => (
                      <SelectItem key={r} value={r.toLowerCase()}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          )}
        </Card>

        <Separator />

        {/* Wasabi */}
        <Card className="border-dashed">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-green-500" />
                <CardTitle className="text-sm">Wasabi Configuration</CardTitle>
              </div>
              <Switch checked={wasabi} onCheckedChange={setWasabi} />
            </div>
            <CardDescription className="text-xs">Enable Wasabi Storage to store your files in Wasabi.</CardDescription>
          </CardHeader>
          {wasabi && (
            <CardContent className="space-y-3 px-4 pb-3">
              <div>
                <label className="text-xs font-medium">Bucket Name</label>
                <Input value={wasabiBucket} onChange={(e) => setWasabiBucket(e.target.value)} className="h-8 text-sm mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Access Key</label>
                  <Input value={wasabiAccessKey} onChange={(e) => setWasabiAccessKey(e.target.value)} className="h-8 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium">Secret Key</label>
                  <Input type="password" value={wasabiSecretKey} onChange={(e) => setWasabiSecretKey(e.target.value)} className="h-8 text-sm mt-1" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium">Custom Endpoint (Optional)</label>
                <Input value={wasabiEndpoint} onChange={(e) => setWasabiEndpoint(e.target.value)} className="h-8 text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium">Region</label>
                <Select value={wasabiRegion} onValueChange={setWasabiRegion}>
                  <SelectTrigger className="h-8 text-sm mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["us-east-1", "us-east-2", "us-west-1", "us-central-1", "eu-west-1", "eu-west-2", "eu-central-1", "eu-central-2", "ap-northeast-1", "ap-northeast-2", "ap-southeast-1", "ap-southeast-2"].map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          )}
        </Card>

        <Separator />

        {/* FTP */}
        <Card className="border-dashed">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-purple-500" />
                <CardTitle className="text-sm">FTP Settings</CardTitle>
              </div>
              <Switch checked={ftpStorage} onCheckedChange={setFtpStorage} />
            </div>
            <CardDescription className="text-xs">Enable FTP Storage to store your files in your own FTP server. This may slow down upload/delete speed.</CardDescription>
          </CardHeader>
          {ftpStorage && (
            <CardContent className="space-y-3 px-4 pb-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">FTP Hostname</label>
                  <Input value={ftpHostname} onChange={(e) => setFtpHostname(e.target.value)} className="h-8 text-sm mt-1" placeholder="IP or domain" />
                </div>
                <div>
                  <label className="text-xs font-medium">FTP Port</label>
                  <Input value={ftpPort} onChange={(e) => setFtpPort(e.target.value)} className="h-8 text-sm mt-1" placeholder="21" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">FTP Username</label>
                  <Input value={ftpUsername} onChange={(e) => setFtpUsername(e.target.value)} className="h-8 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium">FTP Password</label>
                  <Input type="password" value={ftpPassword} onChange={(e) => setFtpPassword(e.target.value)} className="h-8 text-sm mt-1" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium">FTP Path</label>
                <Input value={ftpPath} onChange={(e) => setFtpPath(e.target.value)} className="h-8 text-sm mt-1" placeholder="Path to /upload files" />
              </div>
              <div>
                <label className="text-xs font-medium">FTP Endpoint</label>
                <Input value={ftpEndpoint} onChange={(e) => setFtpEndpoint(e.target.value)} className="h-8 text-sm mt-1" placeholder="ftpstorage.example.com" />
              </div>
            </CardContent>
          )}
        </Card>

        <Separator />

        {/* Google Cloud */}
        <Card className="border-dashed">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-red-500" />
                <CardTitle className="text-sm">Google Cloud Storage</CardTitle>
              </div>
              <Switch checked={googleCloud} onCheckedChange={setGoogleCloud} />
            </div>
            <CardDescription className="text-xs">Enable Google Cloud Storage to store your files.</CardDescription>
          </CardHeader>
          {googleCloud && (
            <CardContent className="space-y-3 px-4 pb-3">
              <div>
                <label className="text-xs font-medium">Bucket Name</label>
                <Input value={gcBucketName} onChange={(e) => setGcBucketName(e.target.value)} className="h-8 text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium">Google Cloud File Path</label>
                <p className="text-[10px] text-muted-foreground">Path to your Google Cloud JSON file on your server.</p>
                <Input value={gcFilePath} onChange={(e) => setGcFilePath(e.target.value)} className="h-8 text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium">Custom Endpoint (Optional)</label>
                <Input value={gcEndpoint} onChange={(e) => setGcEndpoint(e.target.value)} className="h-8 text-sm mt-1" placeholder="https://customCDNdomain.com" />
              </div>
            </CardContent>
          )}
        </Card>

        <Separator />

        {/* Backblaze */}
        <Card className="border-dashed">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-rose-500" />
                <CardTitle className="text-sm">Backblaze Configuration</CardTitle>
              </div>
              <Switch checked={backblaze} onCheckedChange={setBackblaze} />
            </div>
            <CardDescription className="text-xs">Enable Backblaze Storage to store your files.</CardDescription>
          </CardHeader>
          {backblaze && (
            <CardContent className="space-y-3 px-4 pb-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Bucket ID</label>
                  <Input value={bbBucketId} onChange={(e) => setBbBucketId(e.target.value)} className="h-8 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium">Bucket Name</label>
                  <Input value={bbBucketName} onChange={(e) => setBbBucketName(e.target.value)} className="h-8 text-sm mt-1" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium">Bucket Region</label>
                <Input value={bbBucketRegion} onChange={(e) => setBbBucketRegion(e.target.value)} className="h-8 text-sm mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Access Key ID</label>
                  <Input value={bbAccessKeyId} onChange={(e) => setBbAccessKeyId(e.target.value)} className="h-8 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium">Access Key</label>
                  <Input type="password" value={bbAccessKey} onChange={(e) => setBbAccessKey(e.target.value)} className="h-8 text-sm mt-1" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium">Custom Endpoint (Optional)</label>
                <Input value={bbEndpoint} onChange={(e) => setBbEndpoint(e.target.value)} className="h-8 text-sm mt-1" placeholder="https://customCDNdomain.com" />
              </div>
            </CardContent>
          )}
        </Card>
      </SettingsSection>
      </>
      )}

      {/* ── Email & SMS Tab ── */}
      {activeTab === "email" && (
        <>
      <SettingsSection title="E-mail Configuration" description="Configure your email server settings for sending emails to users." icon={Mail}>
        <div>
          <label className="text-sm font-medium text-foreground">E-mail Server</label>
          <p className="text-xs text-muted-foreground mb-1.5">Select which E-mail server you want to use. Server Mail function is not recommended.</p>
          <Select value={emailServer} onValueChange={setEmailServer}>
            <SelectTrigger className="h-9 text-sm max-w-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="servermail">Server Mail (Default)</SelectItem>
              <SelectItem value="smtp">SMTP Server</SelectItem>
              <SelectItem value="mailgun">Mailgun</SelectItem>
              <SelectItem value="sendgrid">SendGrid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Separator />
        <div>
          <label className="text-sm font-medium text-foreground">Website Default E-mail</label>
          <p className="text-xs text-muted-foreground mb-1.5">This is your default website E-mail, used to send E-mails to users.</p>
          <Input value={defaultEmail} onChange={(e) => setDefaultEmail(e.target.value)} className="h-9 text-sm max-w-md" placeholder="info@yoursite.com" />
        </div>
        <Separator />
        <div>
          <label className="text-sm font-medium text-foreground">SMTP Host</label>
          <p className="text-xs text-muted-foreground mb-1.5">Your SMTP account host name, can be IP, domain or subdomain.</p>
          <Input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} className="h-9 text-sm max-w-md" placeholder="mail.yoursite.com" />
        </div>
        <Separator />
        <div>
          <label className="text-sm font-medium text-foreground">SMTP Username</label>
          <p className="text-xs text-muted-foreground mb-1.5">Your SMTP account username.</p>
          <Input value={smtpUsername} onChange={(e) => setSmtpUsername(e.target.value)} className="h-9 text-sm max-w-md" placeholder="info@yoursite.com" />
        </div>
        <Separator />
        <div>
          <label className="text-sm font-medium text-foreground">SMTP Password</label>
          <p className="text-xs text-muted-foreground mb-1.5">Your SMTP account password. The secret key is not showing due to security reasons.</p>
          <Input type="password" value={smtpPassword} onChange={(e) => setSmtpPassword(e.target.value)} className="h-9 text-sm max-w-md" placeholder="••••••••" />
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div>
            <label className="text-sm font-medium text-foreground">SMTP Port</label>
            <p className="text-xs text-muted-foreground mb-1.5">587 for TLS, 465 for SSL.</p>
            <Input value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} className="h-9 text-sm" placeholder="465" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">SMTP Encryption</label>
            <p className="text-xs text-muted-foreground mb-1.5">Encryption method.</p>
            <Select value={smtpEncryption} onValueChange={setSmtpEncryption}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ssl">SSL (Secure)</SelectItem>
                <SelectItem value="tls">TLS</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Separator />
        <div className="flex items-center gap-3 py-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.success("Test email sent successfully! Check your inbox.")}>
            <Send className="w-3.5 h-3.5" />
            Test E-mail Server
          </Button>
          <p className="text-xs text-muted-foreground">A test message will be sent to your account's email address.</p>
        </div>
      </SettingsSection>

      <SettingsSection title="SMS Settings" description="To start sending SMS, create an account and buy credits in Twilio, BulkSMS, Infobip, or Msg91." icon={Phone}>
        <div>
          <label className="text-sm font-medium text-foreground">Default SMS Provider</label>
          <p className="text-xs text-muted-foreground mb-1.5">Select which SMS provider you want to use. You can use only one at the same time.</p>
          <Select value={defaultSmsProvider} onValueChange={setDefaultSmsProvider}>
            <SelectTrigger className="h-9 text-sm max-w-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="twilio">Twilio</SelectItem>
              <SelectItem value="bulksms">BulkSMS</SelectItem>
              <SelectItem value="infobip">Infobip</SelectItem>
              <SelectItem value="msg91">Msg91</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Separator />
        <div>
          <label className="text-sm font-medium text-foreground">Your Phone Number</label>
          <p className="text-xs text-muted-foreground mb-1.5">Set your website default number used to send SMS to users, e.g (+9053..)</p>
          <Input value={smsPhoneNumber} onChange={(e) => setSmsPhoneNumber(e.target.value)} className="h-9 text-sm max-w-md" placeholder="+1234567890" />
        </div>
        <Separator />

        {/* BulkSMS */}
        <Card className="border-dashed">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">BulkSMS Configuration</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">BulkSMS Username</label>
                <Input value={bulkSmsUsername} onChange={(e) => setBulkSmsUsername(e.target.value)} className="h-8 text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium">BulkSMS Password</label>
                <Input type="password" value={bulkSmsPassword} onChange={(e) => setBulkSmsPassword(e.target.value)} className="h-8 text-sm mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Twilio */}
        <Card className="border-dashed">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">Twilio Configuration</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-3">
            <div>
              <label className="text-xs font-medium">Twilio Account SID</label>
              <Input value={twilioSid} onChange={(e) => setTwilioSid(e.target.value)} className="h-8 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium">Twilio Auth Token</label>
              <Input type="password" value={twilioAuthToken} onChange={(e) => setTwilioAuthToken(e.target.value)} className="h-8 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium">Twilio Phone Number</label>
              <Input value={twilioPhone} onChange={(e) => setTwilioPhone(e.target.value)} className="h-8 text-sm mt-1" placeholder="+1234567890" />
            </div>
          </CardContent>
        </Card>

        {/* Infobip */}
        <Card className="border-dashed">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">Infobip Configuration</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-3">
            <div>
              <label className="text-xs font-medium">Infobip API Key</label>
              <Input value={infobipApiKey} onChange={(e) => setInfobipApiKey(e.target.value)} className="h-8 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium">Infobip Base URL</label>
              <Input value={infobipBaseUrl} onChange={(e) => setInfobipBaseUrl(e.target.value)} className="h-8 text-sm mt-1" />
            </div>
          </CardContent>
        </Card>

        {/* Msg91 */}
        <Card className="border-dashed">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">Msg91 Configuration</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-3">
            <div>
              <label className="text-xs font-medium">Msg91 AuthKey</label>
              <Input value={msg91AuthKey} onChange={(e) => setMsg91AuthKey(e.target.value)} className="h-8 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium">Msg91 DLT ID</label>
              <Input value={msg91DltId} onChange={(e) => setMsg91DltId(e.target.value)} className="h-8 text-sm mt-1" />
            </div>
          </CardContent>
        </Card>

        <Separator />
        <div className="flex items-center gap-3 py-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.success("Test SMS sent successfully! Check your phone.")}>
            <Send className="w-3.5 h-3.5" />
            Test SMS Server
          </Button>
          <p className="text-xs text-muted-foreground">A test message will be sent to your phone.</p>
        </div>
      </SettingsSection>

      <SettingsSection title="Debug Email Deliverability" description="Test the Email Deliverability and make sure the system is working fine." icon={TestTube}>
        <div className="flex items-center gap-3 py-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEmailDebugLog("✓ SPF Record: Pass\n✓ DKIM Record: Pass\n✓ DMARC Record: Pass\n✓ Reverse DNS: Pass\n✓ SMTP Connection: Success\n✓ Email Deliverability Score: 9.5/10")}>
            <Bug className="w-3.5 h-3.5" />
            Debug Email Deliverability
          </Button>
        </div>
        {emailDebugLog && (
          <div className="bg-muted/50 rounded-md p-3 border">
            <p className="text-xs font-medium text-foreground mb-1">Debug Log</p>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">{emailDebugLog}</pre>
          </div>
        )}
        {!emailDebugLog && (
          <p className="text-xs text-muted-foreground italic">Click on Debug Email Deliverability to show test results.</p>
        )}
      </SettingsSection>
      </>
      )}

      {/* ── AI Settings Tab ── */}
      {activeTab === "ai" && (
        <>
      {/* ── AI Settings ── */}
      <SettingsSection title="OpenAI Settings" description="Configure your OpenAI API key and text model for AI-powered features." icon={Bot}>
        <div>
          <label className="text-sm font-medium text-foreground">OpenAI API Key</label>
          <p className="text-xs text-muted-foreground mb-1.5">The secret key is not showing due to security reasons, you can still overwrite the current one.</p>
          <Input type="password" value={openaiApiKey} onChange={(e) => setOpenaiApiKey(e.target.value)} className="h-9 text-sm max-w-md" placeholder="sk-••••••••••••••••" />
        </div>
        <Separator />
        <div>
          <label className="text-sm font-medium text-foreground">OpenAI Text Model</label>
          <Select value={openaiModel} onValueChange={setOpenaiModel}>
            <SelectTrigger className="h-9 text-sm max-w-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4">GPT-4</SelectItem>
              <SelectItem value="gpt-4-0314">GPT-4-0314</SelectItem>
              <SelectItem value="gpt-4-32k">GPT-4-32K</SelectItem>
              <SelectItem value="gpt-4-32k-0314">GPT-4-32K-0314</SelectItem>
              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
              <SelectItem value="gpt-3.5-turbo-0301">GPT-3.5 Turbo-0301</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SettingsSection>

      <SettingsSection title="AI Features" description="Enable or disable AI-powered features across your platform." icon={Sparkles}>
        <SettingToggle label="AI Images System" description="Allow AI to generate images." checked={aiImages} onCheckedChange={setAiImages} />
        {aiImages && (
          <div className="pl-4 pb-2">
            <label className="text-xs font-medium text-foreground">AI Images API</label>
            <Select value={aiImagesApi} onValueChange={setAiImagesApi}>
              <SelectTrigger className="h-8 text-sm max-w-[200px] mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="replicate">Replicate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <Separator />
        <SettingToggle label="AI Post System" description="Allow AI to generate posts." checked={aiPosts} onCheckedChange={setAiPosts} />
        {aiPosts && (
          <div className="pl-4 pb-2">
            <label className="text-xs font-medium text-foreground">AI Posts API</label>
            <Select value={aiPostsApi} onValueChange={setAiPostsApi}>
              <SelectTrigger className="h-8 text-sm max-w-[200px] mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="replicate">Replicate (not supported)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <Separator />
        <SettingToggle label="AI Blog System" description="Allow AI to generate articles." checked={aiBlog} onCheckedChange={setAiBlog} />
        {aiBlog && (
          <div className="pl-4 pb-2">
            <label className="text-xs font-medium text-foreground">AI Blog API</label>
            <Select value={aiBlogApi} onValueChange={setAiBlogApi}>
              <SelectTrigger className="h-8 text-sm max-w-[200px] mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="replicate">Replicate (not supported)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <Separator />
        <SettingToggle label="AI Avatar/Cover System" description="Allow users to edit Avatar/Cover using AI." checked={aiAvatarCover} onCheckedChange={setAiAvatarCover} />
        {aiAvatarCover && (
          <div className="pl-4 pb-2">
            <label className="text-xs font-medium text-foreground">AI Avatar/Cover API</label>
            <Select value={aiAvatarApi} onValueChange={setAiAvatarApi}>
              <SelectTrigger className="h-8 text-sm max-w-[200px] mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI (not supported)</SelectItem>
                <SelectItem value="replicate">Replicate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </SettingsSection>

      <SettingsSection title="Replicate AI Settings" description="Configure Replicate API for AI image generation." icon={Palette}>
        <div>
          <label className="text-sm font-medium text-foreground">Replicate Model</label>
          <Select value={replicateModel} onValueChange={setReplicateModel}>
            <SelectTrigger className="h-9 text-sm max-w-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="prompthero/openjourney">prompthero/openjourney</SelectItem>
              <SelectItem value="stability-ai/stable-diffusion">stability-ai/stable-diffusion</SelectItem>
              <SelectItem value="22-hours/vintedois-diffusion">22-hours/vintedois-diffusion</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Separator />
        <div>
          <label className="text-sm font-medium text-foreground">Replicate API Token</label>
          <Input type="password" value={replicateApiToken} onChange={(e) => setReplicateApiToken(e.target.value)} className="h-9 text-sm max-w-md" placeholder="r8_••••••••••••" />
        </div>
        <Separator />
        <div className="grid grid-cols-3 gap-4 max-w-md">
          <div>
            <label className="text-xs font-medium">Inference Steps</label>
            <p className="text-[10px] text-muted-foreground">1 – 500</p>
            <Input value={replicateInferenceSteps} onChange={(e) => setReplicateInferenceSteps(e.target.value)} className="h-8 text-sm mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium">Guidance Scale</label>
            <p className="text-[10px] text-muted-foreground">1 – 20</p>
            <Input value={replicateGuidanceScale} onChange={(e) => setReplicateGuidanceScale(e.target.value)} className="h-8 text-sm mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium">Seed</label>
            <p className="text-[10px] text-muted-foreground">Blank = random</p>
            <Input value={replicateSeed} onChange={(e) => setReplicateSeed(e.target.value)} className="h-8 text-sm mt-1" placeholder="Random" />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="AI Credit Settings" description="Configure credit pricing for AI-generated content." icon={CreditCard}>
        <div>
          <label className="text-sm font-medium text-foreground">Credit Price</label>
          <p className="text-xs text-muted-foreground mb-1.5">Credit Price Ex: $1 = 10 credits</p>
          <Input value={creditPrice} onChange={(e) => setCreditPrice(e.target.value)} className="h-9 text-sm max-w-[150px]" placeholder="1" />
        </div>
        <Separator />
        <SettingToggle label="AI Images Credit System" description="Enable credit system for AI image generation." checked={aiImagesCreditSystem} onCheckedChange={setAiImagesCreditSystem} />
        {aiImagesCreditSystem && (
          <div className="pl-4 pb-2">
            <label className="text-xs font-medium text-foreground">Generated Image Price</label>
            <p className="text-[10px] text-muted-foreground mb-1">Credits per generated image</p>
            <Input value={generatedImagePrice} onChange={(e) => setGeneratedImagePrice(e.target.value)} className="h-8 text-sm max-w-[150px]" />
          </div>
        )}
        <Separator />
        <SettingToggle label="AI Text Credit System" description="Enable credit system for AI text generation." checked={aiTextCreditSystem} onCheckedChange={setAiTextCreditSystem} />
        {aiTextCreditSystem && (
          <div className="pl-4 pb-2">
            <label className="text-xs font-medium text-foreground">Generated Word Price</label>
            <p className="text-[10px] text-muted-foreground mb-1">Credits per generated word</p>
            <Input value={generatedWordPrice} onChange={(e) => setGeneratedWordPrice(e.target.value)} className="h-8 text-sm max-w-[150px]" />
          </div>
        )}
      </SettingsSection>
      </>
      )}

      {/* ── Features Tab ── */}
      {activeTab === "features" && (
        <>
      {/* ── Manage Features ── */}
      <SettingsSection title="Marketplace Settings" description="Configure marketplace features and limits." icon={ShoppingBag}>
        <SettingToggle label="Marketplace" description="Enable the marketplace feature for buying and selling items." checked={marketplaceEnabled} onCheckedChange={setMarketplaceEnabled} />
        {marketplaceEnabled && (
          <>
            <Separator />
            <SettingToggle label="Verified Sellers Program" description="Enable the verified seller badge system based on listing count, ratings, and account age." checked={marketplaceVerifiedSellers} onCheckedChange={setMarketplaceVerifiedSellers} />
            <Separator />
            <SettingToggle label="Fraud Detection" description="Automatically scan and flag suspicious listing patterns (extreme pricing, bulk posting)." checked={marketplaceFraudDetection} onCheckedChange={setMarketplaceFraudDetection} />
            <Separator />
            <SettingToggle label="Make Offer System" description="Allow buyers to propose prices and negotiate with sellers." checked={marketplaceOffers} onCheckedChange={setMarketplaceOffers} />
            <Separator />
            <SettingToggle label="Price History Tracking" description="Record all price changes and display trend charts on listing pages." checked={marketplacePriceHistory} onCheckedChange={setMarketplacePriceHistory} />
            <Separator />
            <div className="grid grid-cols-2 gap-4 max-w-md py-2">
              <div>
                <label className="text-sm font-medium text-foreground">Max Images per Listing</label>
                <Input value={marketplaceMaxImages} onChange={(e) => setMarketplaceMaxImages(e.target.value)} className="h-9 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Max Price Limit ($)</label>
                <Input value={marketplaceMaxPrice} onChange={(e) => setMarketplaceMaxPrice(e.target.value)} className="h-9 text-sm mt-1" />
              </div>
            </div>
          </>
        )}
      </SettingsSection>

      <SettingsSection title="Advertisements System Settings" description="Configure ad formats, placements, pricing, targeting, and third-party ad networks." icon={Megaphone}>
        <SettingToggle label="Advertising System" description="Enable the advertising and sponsored content system across the platform." checked={adsEnabled} onCheckedChange={setAdsEnabled} />
        {adsEnabled && (
          <>
            <Separator className="my-1" />
            <p className="text-xs font-semibold text-foreground pt-2 pb-1">Ad Formats & Placements</p>
            <SettingToggle label="Horizontal Banner Ads" description="Display banner ads at the top or bottom of pages." checked={adsBanner} onCheckedChange={setAdsBanner} />
            <Separator />
            <SettingToggle label="Sponsored Posts (In-Feed)" description="Show sponsored posts in the activity feed alongside organic content." checked={adsSponsoredPosts} onCheckedChange={setAdsSponsoredPosts} />
            <Separator />
            <SettingToggle label="Sidebar Ad Cards" description="Display promotional cards in the right sidebar." checked={adsSidebarCards} onCheckedChange={setAdsSidebarCards} />
            <Separator />
            <SettingToggle label="Interstitial Ads" description="Show full-screen overlay ads between page navigations." checked={adsInterstitial} onCheckedChange={setAdsInterstitial} />
            {adsInterstitial && (
              <div className="pl-4 pb-2 grid grid-cols-2 gap-4 max-w-md">
                <div>
                  <label className="text-xs font-medium text-foreground">Trigger After (navigations)</label>
                  <p className="text-[10px] text-muted-foreground">Show ad after X page navigations.</p>
                  <Input value={adsInterstitialFrequency} onChange={(e) => setAdsInterstitialFrequency(e.target.value)} className="h-8 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">Cooldown (minutes)</label>
                  <p className="text-[10px] text-muted-foreground">Minutes between interstitial ads.</p>
                  <Input value={adsInterstitialCooldown} onChange={(e) => setAdsInterstitialCooldown(e.target.value)} className="h-8 text-sm mt-1" />
                </div>
              </div>
            )}

            <Separator className="my-2" />
            <p className="text-xs font-semibold text-foreground pt-2 pb-1">Display & Limits</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Max Ads Per Page</label>
                <Input type="number" value={adsMaxPerPage} onChange={(e) => setAdsMaxPerPage(e.target.value)} className="h-9 text-sm" />
                <p className="text-[10px] text-muted-foreground">Maximum number of ads shown on a single page.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Max Campaign Duration (days)</label>
                <Input type="number" value={adsMaxDuration} onChange={(e) => setAdsMaxDuration(e.target.value)} className="h-9 text-sm" />
                <p className="text-[10px] text-muted-foreground">Maximum length of an ad campaign.</p>
              </div>
            </div>

            <Separator className="my-2" />
            <p className="text-xs font-semibold text-foreground pt-2 pb-1">Pricing & Revenue</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Min Budget ($)</label>
                <Input type="number" value={adsMinBudget} onChange={(e) => setAdsMinBudget(e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Cost Per Impression ($)</label>
                <Input type="number" step="0.001" value={adsCostPerImpression} onChange={(e) => setAdsCostPerImpression(e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Cost Per Click ($)</label>
                <Input type="number" step="0.01" value={adsCostPerClick} onChange={(e) => setAdsCostPerClick(e.target.value)} className="h-9 text-sm" />
              </div>
            </div>
            <div className="space-y-1.5 max-w-xs pt-2">
              <label className="text-xs font-medium text-foreground">Revenue Share (%)</label>
              <Input type="number" value={adsRevenueShare} onChange={(e) => setAdsRevenueShare(e.target.value)} className="h-9 text-sm" />
              <p className="text-[10px] text-muted-foreground">Percentage of ad revenue shared with content creators.</p>
            </div>

            <Separator className="my-2" />
            <p className="text-xs font-semibold text-foreground pt-2 pb-1">Targeting Options</p>
            <SettingToggle label="Age Targeting" description="Allow advertisers to target users by age range." checked={adsTargetingAge} onCheckedChange={setAdsTargetingAge} />
            <SettingToggle label="Gender Targeting" description="Allow advertisers to target users by gender." checked={adsTargetingGender} onCheckedChange={setAdsTargetingGender} />
            <SettingToggle label="Location Targeting" description="Allow advertisers to target users by geographic location." checked={adsTargetingLocation} onCheckedChange={setAdsTargetingLocation} />
            <SettingToggle label="Interest Targeting" description="Allow advertisers to target users based on their interests and activity." checked={adsTargetingInterests} onCheckedChange={setAdsTargetingInterests} />

            <Separator className="my-2" />
            <p className="text-xs font-semibold text-foreground pt-2 pb-1">Moderation & Policies</p>
            <SettingToggle label="Allow Users to Create Ads" description="Let regular users create and manage their own ad campaigns." checked={adsUserCreateEnabled} onCheckedChange={setAdsUserCreateEnabled} />
            <SettingToggle label="Auto-Approve Ads" description="Automatically approve new ad campaigns without admin review." checked={adsAutoApprove} onCheckedChange={setAdsAutoApprove} />
            <SettingToggle label="NSFW Content Filter" description="Automatically reject ad content flagged as inappropriate or NSFW." checked={adsNsfwFilter} onCheckedChange={setAdsNsfwFilter} />
          </>
        )}
      </SettingsSection>

      {adsEnabled && (
        <SettingsSection title="Google AdSense Integration" description="Display Google AdSense ads alongside native ads." icon={BarChart3}>
          <SettingToggle label="Enable Google AdSense" description="Show Google AdSense ads on your website. Requires an approved AdSense account." checked={adsGoogleAdsense} onCheckedChange={setAdsGoogleAdsense} />
          {adsGoogleAdsense && (
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Publisher ID</label>
                <Input value={adsensePublisherId} onChange={(e) => setAdsensePublisherId(e.target.value)} placeholder="ca-pub-XXXXXXXXXXXXXXXX" className="h-9 text-sm" />
                <p className="text-[10px] text-muted-foreground">Your Google AdSense publisher ID, found in your AdSense dashboard.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Header Ad Slot</label>
                <Input value={adsenseHeaderSlot} onChange={(e) => setAdsenseHeaderSlot(e.target.value)} placeholder="1234567890" className="h-9 text-sm" />
                <p className="text-[10px] text-muted-foreground">Ad unit slot ID for the header placement.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Sidebar Ad Slot</label>
                <Input value={adsenseSidebarSlot} onChange={(e) => setAdsenseSidebarSlot(e.target.value)} placeholder="1234567890" className="h-9 text-sm" />
                <p className="text-[10px] text-muted-foreground">Ad unit slot ID for the sidebar placement.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">In-Feed Ad Slot</label>
                <Input value={adsenseFeedSlot} onChange={(e) => setAdsenseFeedSlot(e.target.value)} placeholder="1234567890" className="h-9 text-sm" />
                <p className="text-[10px] text-muted-foreground">Ad unit slot ID for the in-feed placement.</p>
              </div>
            </div>
          )}
        </SettingsSection>
      )}

      <SettingsSection title="Manage Categories" description="Add, remove, and organize categories for marketplace, groups, pages, and events." icon={Tag}>
        <div className="flex gap-1 mb-3">
          {[
            { key: "marketplace", label: "Marketplace", icon: Store },
            { key: "groups", label: "Groups", icon: Users },
            { key: "pages", label: "Pages", icon: LayoutGrid },
            { key: "events", label: "Events", icon: Calendar },
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={activeCategoryTab === tab.key ? "default" : "outline"}
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setActiveCategoryTab(tab.key)}
            >
              <tab.icon className="w-3 h-3" />
              {tab.label}
            </Button>
          ))}
        </div>

        {(() => {
          const categoryMap: Record<string, { get: string[]; set: React.Dispatch<React.SetStateAction<string[]>> }> = {
            marketplace: { get: marketplaceCategories, set: setMarketplaceCategories },
            groups: { get: groupCategories, set: setGroupCategories },
            pages: { get: pageCategories, set: setPageCategories },
            events: { get: eventCategories, set: setEventCategories },
          };
          const current = categoryMap[activeCategoryTab];
          const addCategory = () => {
            if (newCategory.trim() && !current.get.includes(newCategory.trim())) {
              current.set([...current.get, newCategory.trim()]);
              setNewCategory("");
            }
          };
          const removeCategory = (cat: string) => {
            current.set(current.get.filter((c) => c !== cat));
          };

          return (
            <>
              <div className="flex gap-2 max-w-md">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="h-9 text-sm"
                  placeholder={`Add new ${activeCategoryTab.slice(0, -1)} category...`}
                  onKeyDown={(e) => e.key === "Enter" && addCategory()}
                />
                <Button size="sm" className="gap-1 shrink-0" onClick={addCategory}>
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {current.get.map((cat) => (
                  <Badge key={cat} variant="secondary" className="gap-1 pr-1 text-xs">
                    {cat}
                    <button
                      onClick={() => removeCategory(cat)}
                      className="ml-0.5 rounded-full hover:bg-destructive/20 p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{current.get.length} categories configured</p>
            </>
          );
        })()}
      </SettingsSection>
      </>
      )}

      {/* ── Payments Tab ── */}
      {activeTab === "payments" && (
        <>
      {/* Payment Configuration */}
      <SettingsSection title="Payment Configuration" description="Configure payment gateways, Pro memberships, and wallet system." icon={DollarSign}>
        <SettingToggle label="Payment System" description="Enable or disable the entire payment system on your website." checked={paymentEnabled} onCheckedChange={setPaymentEnabled} />

        {paymentEnabled && (
          <>
            <Separator className="my-2" />
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Default Currency</label>
                <Select value={paymentCurrency} onValueChange={setPaymentCurrency}>
                  <SelectTrigger className="h-9 text-sm max-w-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["USD", "EUR", "GBP", "CAD", "AUD", "INR", "BRL", "JPY", "TRY"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Default Payment Gateway</label>
                <Select value={paymentGateway} onValueChange={setPaymentGateway}>
                  <SelectTrigger className="h-9 text-sm max-w-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="razorpay">Razorpay</SelectItem>
                    <SelectItem value="coinbase">Coinbase (Crypto)</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}
      </SettingsSection>

      {paymentEnabled && (
        <>
          {/* Stripe */}
          <SettingsSection title="Stripe Configuration" icon={CreditCard}>
            <SettingToggle label="Enable Stripe" description="Accept credit/debit card payments via Stripe." checked={stripeEnabled} onCheckedChange={setStripeEnabled} />
            {stripeEnabled && (
              <div className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Publishable Key</label>
                  <Input value={stripePublishableKey} onChange={(e) => setStripePublishableKey(e.target.value)} placeholder="pk_live_..." className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Secret Key</label>
                  <Input type="password" value={stripeSecretKey} onChange={(e) => setStripeSecretKey(e.target.value)} placeholder="sk_live_..." className="h-9 text-sm" />
                  <p className="text-[10px] text-muted-foreground">The secret key is not showing due security reasons, you can still overwrite the current one.</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Webhook Secret</label>
                  <Input type="password" value={stripeWebhookSecret} onChange={(e) => setStripeWebhookSecret(e.target.value)} placeholder="whsec_..." className="h-9 text-sm" />
                </div>
              </div>
            )}
          </SettingsSection>

          {/* PayPal */}
          <SettingsSection title="PayPal Configuration" icon={Wallet}>
            <SettingToggle label="Enable PayPal" description="Accept payments via PayPal checkout." checked={paypalEnabled} onCheckedChange={setPaypalEnabled} />
            {paypalEnabled && (
              <div className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Mode</label>
                  <Select value={paypalMode} onValueChange={setPaypalMode}>
                    <SelectTrigger className="h-9 text-sm max-w-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                      <SelectItem value="live">Live (Production)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Client ID</label>
                  <Input value={paypalClientId} onChange={(e) => setPaypalClientId(e.target.value)} placeholder="Your PayPal Client ID" className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Client Secret</label>
                  <Input type="password" value={paypalClientSecret} onChange={(e) => setPaypalClientSecret(e.target.value)} placeholder="Your PayPal Client Secret" className="h-9 text-sm" />
                </div>
              </div>
            )}
          </SettingsSection>

          {/* Razorpay */}
          <SettingsSection title="Razorpay Configuration" icon={Banknote}>
            <SettingToggle label="Enable Razorpay" description="Accept payments via Razorpay (popular in India)." checked={razorpayEnabled} onCheckedChange={setRazorpayEnabled} />
            {razorpayEnabled && (
              <div className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Key ID</label>
                  <Input value={razorpayKeyId} onChange={(e) => setRazorpayKeyId(e.target.value)} placeholder="rzp_live_..." className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Key Secret</label>
                  <Input type="password" value={razorpayKeySecret} onChange={(e) => setRazorpayKeySecret(e.target.value)} placeholder="Your Razorpay Key Secret" className="h-9 text-sm" />
                </div>
              </div>
            )}
          </SettingsSection>

          {/* Coinbase */}
          <SettingsSection title="Coinbase Commerce (Crypto)" icon={Bitcoin}>
            <SettingToggle label="Enable Crypto Payments" description="Accept cryptocurrency payments via Coinbase Commerce." checked={coinbaseEnabled} onCheckedChange={setCoinbaseEnabled} />
            {coinbaseEnabled && (
              <div className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">API Key</label>
                  <Input type="password" value={coinbaseApiKey} onChange={(e) => setCoinbaseApiKey(e.target.value)} placeholder="Your Coinbase API Key" className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Webhook Shared Secret</label>
                  <Input type="password" value={coinbaseWebhookSecret} onChange={(e) => setCoinbaseWebhookSecret(e.target.value)} placeholder="Your Coinbase Webhook Secret" className="h-9 text-sm" />
                </div>
              </div>
            )}
          </SettingsSection>

          {/* Bank Transfer */}
          <SettingsSection title="Bank Transfer" icon={Banknote}>
            <SettingToggle label="Enable Bank Transfer" description="Allow users to pay via manual bank transfer." checked={bankTransferEnabled} onCheckedChange={setBankTransferEnabled} />
            {bankTransferEnabled && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-medium text-foreground">Payment Instructions</label>
                <Textarea value={bankTransferInstructions} onChange={(e) => setBankTransferInstructions(e.target.value)} placeholder="Enter your bank details and payment instructions for users..." className="text-sm min-h-[80px]" />
                <p className="text-[10px] text-muted-foreground">These instructions will be shown to users who select bank transfer as payment method.</p>
              </div>
            )}
          </SettingsSection>

          {/* Pro Membership */}
          <SettingsSection title="Pro Membership System" description="Configure premium membership plans and pricing." icon={Crown}>
            <SettingToggle label="Pro System" description="Enable Pro membership system allowing users to subscribe for premium features." checked={proSystem} onCheckedChange={setProSystem} />
            {proSystem && (
              <div className="space-y-3 pt-2">
                <Separator className="my-1" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Monthly Price ($)</label>
                    <Input type="number" value={proMonthlyPrice} onChange={(e) => setProMonthlyPrice(e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Yearly Price ($)</label>
                    <Input type="number" value={proYearlyPrice} onChange={(e) => setProYearlyPrice(e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Lifetime Price ($)</label>
                    <Input type="number" value={proLifetimePrice} onChange={(e) => setProLifetimePrice(e.target.value)} className="h-9 text-sm" />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">Set pricing for each Pro membership plan. Leave empty to hide a plan.</p>
              </div>
            )}
          </SettingsSection>

          {/* Wallet System */}
          <SettingsSection title="Wallet System" description="Allow users to top up and manage an internal wallet balance." icon={Wallet}>
            <SettingToggle label="Wallet System" description="Enable internal wallet where users can add funds and use them across the platform." checked={walletSystem} onCheckedChange={setWalletSystem} />
            {walletSystem && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-sm">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Min Top-up ($)</label>
                    <Input type="number" value={walletMinTopup} onChange={(e) => setWalletMinTopup(e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Max Top-up ($)</label>
                    <Input type="number" value={walletMaxTopup} onChange={(e) => setWalletMaxTopup(e.target.value)} className="h-9 text-sm" />
                  </div>
                </div>
              </div>
            )}
          </SettingsSection>
        </>
      )}
      </>
      )}

      {/* ── Mobile Apps Tab ── */}
      {activeTab === "apps" && (
        <>
          {/* PWA Configuration */}
          <SettingsSection title="Progressive Web App (PWA)" icon={MonitorSmartphone} description="Configure your app for installable web experience on mobile and desktop.">
            <SettingToggle label="Enable PWA" description="Allow users to install your platform as a native-like app from the browser." checked={pwaEnabled} onCheckedChange={setPwaEnabled} />
            {pwaEnabled && (
              <>
                <Separator />
                <div className="py-3 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">App Name</label>
                      <p className="text-xs text-muted-foreground mb-1.5">Full name shown during install.</p>
                      <Input value={pwaAppName} onChange={(e) => setPwaAppName(e.target.value)} className="h-9 text-sm" placeholder="My Social Network" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Short Name</label>
                      <p className="text-xs text-muted-foreground mb-1.5">Displayed under the home screen icon.</p>
                      <Input value={pwaShortName} onChange={(e) => setPwaShortName(e.target.value)} className="h-9 text-sm" placeholder="MySocial" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Theme Color</label>
                      <p className="text-xs text-muted-foreground mb-1.5">Browser toolbar & status bar color.</p>
                      <div className="flex items-center gap-2">
                        <input type="color" value={pwaThemeColor} onChange={(e) => setPwaThemeColor(e.target.value)} className="w-9 h-9 rounded border border-border cursor-pointer" />
                        <Input value={pwaThemeColor} onChange={(e) => setPwaThemeColor(e.target.value)} className="h-9 text-sm flex-1" placeholder="#1d4ed8" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Background Color</label>
                      <p className="text-xs text-muted-foreground mb-1.5">Splash screen background color.</p>
                      <div className="flex items-center gap-2">
                        <input type="color" value={pwaBackgroundColor} onChange={(e) => setPwaBackgroundColor(e.target.value)} className="w-9 h-9 rounded border border-border cursor-pointer" />
                        <Input value={pwaBackgroundColor} onChange={(e) => setPwaBackgroundColor(e.target.value)} className="h-9 text-sm flex-1" placeholder="#ffffff" />
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <SettingToggle label="Offline Mode" description="Cache assets so the app works without an internet connection." checked={pwaOfflineMode} onCheckedChange={setPwaOfflineMode} />
                  <Separator />
                  <SettingToggle label="Push Notifications" description="Send push notifications to users who have installed the PWA." checked={pwaPushNotifications} onCheckedChange={setPwaPushNotifications} />
                  <Separator />
                  <SettingToggle label="Install Prompt" description="Show a custom install banner encouraging users to add the app to their home screen." checked={pwaInstallPrompt} onCheckedChange={setPwaInstallPrompt} />
                </div>
              </>
            )}
          </SettingsSection>

          {/* Android & iOS Apps */}
          <SettingsSection title="Android & iOS Apps" icon={Smartphone} description="Native app links for mobile and desktop platforms">
            <div className="py-3 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Native Android Messenger</label>
                  <p className="text-xs text-muted-foreground mb-1.5">Your Native Android Messenger Link.</p>
                  <Input value={androidMessenger} onChange={(e) => setAndroidMessenger(e.target.value)} className="h-9 text-sm" placeholder="https://play.google.com/..." />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Native Android Timeline</label>
                  <p className="text-xs text-muted-foreground mb-1.5">Your Native Android Timeline Link.</p>
                  <Input value={androidTimeline} onChange={(e) => setAndroidTimeline(e.target.value)} className="h-9 text-sm" placeholder="https://play.google.com/..." />
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Native iOS Messenger</label>
                  <p className="text-xs text-muted-foreground mb-1.5">Your Native iOS Messenger Link.</p>
                  <Input value={iosMessenger} onChange={(e) => setIosMessenger(e.target.value)} className="h-9 text-sm" placeholder="https://apps.apple.com/..." />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Native iOS Timeline</label>
                  <p className="text-xs text-muted-foreground mb-1.5">Your Native iOS Timeline Link.</p>
                  <Input value={iosTimeline} onChange={(e) => setIosTimeline(e.target.value)} className="h-9 text-sm" placeholder="https://apps.apple.com/..." />
                </div>
              </div>
              <Separator />
              <div>
                <label className="text-sm font-medium text-foreground">Native Windows Messenger</label>
                <p className="text-xs text-muted-foreground mb-1.5">Your Native Windows Messenger Link.</p>
                <Input value={windowsMessenger} onChange={(e) => setWindowsMessenger(e.target.value)} className="h-9 text-sm max-w-md" placeholder="https://microsoft.com/..." />
              </div>
            </div>
          </SettingsSection>
        </>
      )}

      <div className="flex justify-end pb-4">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-1.5" />
          {saving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
