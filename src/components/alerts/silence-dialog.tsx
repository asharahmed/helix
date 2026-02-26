'use client';

import { useState } from 'react';
import { VolumeX } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateSilence } from '@/lib/hooks';
import { useToast } from '@/components/shared/toast';
import type { UnifiedAlert, AlertmanagerMatcher } from '@/lib/types';

interface SilenceDialogProps {
  alert: UnifiedAlert | null;
  onClose: () => void;
}

const DURATION_OPTIONS = [
  { label: '1 hour', value: 1 },
  { label: '2 hours', value: 2 },
  { label: '4 hours', value: 4 },
  { label: '8 hours', value: 8 },
  { label: '24 hours', value: 24 },
];

export function SilenceDialog({ alert, onClose }: SilenceDialogProps) {
  const [duration, setDuration] = useState('2');
  const [comment, setComment] = useState('');
  const createSilence = useCreateSilence();
  const { toast } = useToast();

  if (!alert) return null;

  const handleCreate = async () => {
    const matchers: AlertmanagerMatcher[] = Object.entries(alert.labels).map(
      ([name, value]) => ({
        name,
        value,
        isRegex: false,
        isEqual: true,
      })
    );

    const now = new Date();
    const endsAt = new Date(now.getTime() + parseInt(duration) * 3600000);

    try {
      await createSilence.mutateAsync({
        matchers,
        startsAt: now.toISOString(),
        endsAt: endsAt.toISOString(),
        createdBy: 'helix',
        comment: comment || `Silenced from Helix: ${alert.title}`,
      });
      toast({ title: 'Silence created successfully', variant: 'success' });
    } catch (err) {
      toast({ title: `Failed to create silence: ${err instanceof Error ? err.message : 'Unknown error'}`, variant: 'error' });
      return;
    }

    onClose();
    setComment('');
  };

  return (
    <Dialog open={!!alert} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <VolumeX className="h-5 w-5 text-amber" />
            Silence Alert
          </DialogTitle>
          <DialogDescription>
            Create a silence for <span className="font-mono text-cyan">{alert.title}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label className="label-text mb-1.5 block">Duration</label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="label-text mb-1.5 block">Comment</label>
            <Input
              placeholder="Reason for silencing..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div>
            <label className="label-text mb-1.5 block">Matchers</label>
            <div className="space-y-1">
              {Object.entries(alert.labels).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-cyan">{key}</span>
                  <span className="text-muted">=</span>
                  <span className="text-text-primary">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="warning"
              onClick={handleCreate}
              disabled={createSilence.isPending}
            >
              {createSilence.isPending ? 'Creating...' : 'Create Silence'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
