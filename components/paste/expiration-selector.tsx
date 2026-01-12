'use client';

import { useState } from 'react';
import { EXPIRATION_OPTIONS, type ExpirationOption, calculateCustomExpiration } from '@/lib/expiration';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ExpirationSelectorProps {
  value: ExpirationOption;
  onChange: (value: ExpirationOption) => void;
  onCustomDateChange?: (date: Date | null) => void;
}

export function ExpirationSelector({ value, onChange, onCustomDateChange }: ExpirationSelectorProps) {
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [customAmount, setCustomAmount] = useState('1');
  const [customUnit, setCustomUnit] = useState<'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'>('days');
  const [displayValue, setDisplayValue] = useState(value);

  const handleValueChange = (newValue: ExpirationOption) => {
    if (newValue === 'custom') {
      setShowCustomDialog(true);
    } else {
      setDisplayValue(newValue);
      onChange(newValue);
      if (onCustomDateChange) {
        onCustomDateChange(null);
      }
    }
  };

  const handleCustomSubmit = () => {
    const amount = parseInt(customAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    const customDate = calculateCustomExpiration(amount, customUnit);
    if (onCustomDateChange) {
      onCustomDateChange(customDate);
    }

    // Update display to show custom label
    setDisplayValue('custom');
    onChange('custom');
    setShowCustomDialog(false);
  };

  const getDisplayLabel = () => {
    if (displayValue === 'custom') {
      return `${customAmount} ${customUnit}`;
    }
    return EXPIRATION_OPTIONS.find(opt => opt.value === displayValue)?.label || 'Select';
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Label htmlFor="expiration" className="text-sm whitespace-nowrap">Expires:</Label>
        <Select value={displayValue} onValueChange={handleValueChange}>
          <SelectTrigger id="expiration" className="h-10 w-[140px]">
            <SelectValue>{getDisplayLabel()}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {EXPIRATION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Custom Expiration Time</DialogTitle>
            <DialogDescription>
              Set a custom expiration time for your paste
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select value={customUnit} onValueChange={(value: any) => setCustomUnit(value)}>
                  <SelectTrigger id="unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                    <SelectItem value="years">Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCustomSubmit}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
