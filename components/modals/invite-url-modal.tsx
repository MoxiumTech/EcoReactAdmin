'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";

interface InviteUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteUrl: string;
  email: string;
}

export const InviteUrlModal: React.FC<InviteUrlModalProps> = ({
  isOpen,
  onClose,
  inviteUrl,
  email,
}) => {
  const onCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    toast.success("Invitation URL copied to clipboard");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Staff Invitation Created</DialogTitle>
          <DialogDescription>
            {`Email sending failed. Please copy this invitation URL and send it to ${email} manually.`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Input
              readOnly
              value={inviteUrl}
              className="flex-1"
            />
            <Button
              onClick={onCopy}
              variant="secondary"
            >
              Copy
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            This invitation link will expire in 7 days.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
