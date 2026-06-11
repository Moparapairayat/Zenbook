import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LifeBuoy, Phone, MessageCircle, Globe, Heart, Shield, ExternalLink } from "lucide-react";

interface FindSupportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const supportResources = [
  {
    title: "Crisis Text Line",
    description: "Text HOME to 741741 for free, 24/7 crisis support",
    icon: MessageCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    action: "Text HOME to 741741",
  },
  {
    title: "National Suicide Prevention Lifeline",
    description: "Free and confidential support for people in distress",
    icon: Phone,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    action: "Call 988",
  },
  {
    title: "SAMHSA Helpline",
    description: "Substance Abuse and Mental Health Services Administration",
    icon: Heart,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    action: "Call 1-800-662-4357",
  },
  {
    title: "Domestic Violence Hotline",
    description: "Support for victims of domestic violence",
    icon: Shield,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    action: "Call 1-800-799-7233",
  },
  {
    title: "Community Standards",
    description: "Learn about what's allowed on this platform",
    icon: Globe,
    color: "text-primary",
    bg: "bg-primary/10",
    action: "View guidelines",
  },
];

const FindSupportModal = ({ open, onOpenChange }: FindSupportModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-primary" />
            Find Support
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          If you or someone you know is struggling, these resources can help.
        </p>
        <div className="space-y-2 mt-2">
          {supportResources.map((resource) => (
            <div
              key={resource.title}
              className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${resource.bg} shrink-0`}>
                <resource.icon className={`w-5 h-5 ${resource.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{resource.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{resource.description}</p>
                <p className="text-xs font-medium text-primary mt-1">{resource.action}</p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FindSupportModal;
