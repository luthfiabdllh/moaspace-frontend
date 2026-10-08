'use client';

import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface DatePickerProps {
  /** Nilai tanggal dalam format 'yyyy-MM-dd' (sama seperti <input type="date">). */
  value?: string | null;
  /** Dipanggil dengan string 'yyyy-MM-dd', atau undefined saat dikosongkan. */
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  /** Tanggal minimum/maksimum yang bisa dipilih (format 'yyyy-MM-dd'). */
  minDate?: string;
  maxDate?: string;
}

function parseValue(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const date = value.length <= 10 ? parseISO(value) : new Date(value);
  return isValid(date) ? date : undefined;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pilih tanggal',
  disabled,
  className,
  id,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selectedDate = React.useMemo(() => parseValue(value), [value]);

  const disabledMatchers = React.useMemo(() => {
    const matchers: Array<{ before: Date } | { after: Date }> = [];
    const minD = parseValue(minDate);
    const maxD = parseValue(maxDate);
    if (minD) matchers.push({ before: minD });
    if (maxD) matchers.push({ after: maxD });
    return matchers.length > 0 ? matchers : undefined;
  }, [minDate, maxDate]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal h-9 text-xs gap-1.5',
            !selectedDate && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="size-3.5 shrink-0" />
          <span className="truncate">
            {selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale: idLocale }) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            onChange(date ? format(date, 'yyyy-MM-dd') : undefined);
            setOpen(false);
          }}
          captionLayout="dropdown"
          locale={idLocale}
          disabled={disabledMatchers}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
