'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
}

export function ShareModal({ open, onOpenChange, url }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleOpen = () => {
    window.open(url, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Paste Created Successfully</DialogTitle>
          <DialogDescription>
            Share this link to allow others to view your paste.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input value={url} readOnly className="font-mono text-sm" />
            <Button
              onClick={handleCopy}
              size="icon"
              variant="outline"
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900 dark:bg-yellow-950/30">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium text-yellow-900 dark:text-yellow-100">
                Security Warning
              </p>
              <p className="text-yellow-800 dark:text-yellow-200">
                The encryption key is included in the URL. Anyone with this link
                can decrypt and view your paste. Share it carefully.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleOpen} className="flex-1">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Paste
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
