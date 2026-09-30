import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { TemplateFieldDefinition } from '../types';

interface DynamicFormRendererProps {
  fields: TemplateFieldDefinition[];
  values: Record<string, any>;
  onChange?: (values: Record<string, any>) => void;
  readOnly?: boolean;
}

export function DynamicFormRenderer({
  fields,
  values,
  onChange,
  readOnly = false,
}: DynamicFormRendererProps) {
  const handleFieldChange = (key: string, val: any) => {
    if (!onChange || readOnly) return;
    onChange({
      ...values,
      [key]: val,
    });
  };

  if (!fields || fields.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
        Tidak ada field formulir khusus untuk template ini.
      </div>
    );
  }

  if (readOnly) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((f) => {
          const val = values[f.key];
          return (
            <div key={f.key} className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">{f.label}</span>
              <p className="text-sm font-semibold text-foreground whitespace-pre-wrap">
                {val !== undefined && val !== null && val !== ''
                  ? String(val)
                  : '—'}
              </p>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const value = values[field.key] ?? '';

        return (
          <div key={field.key} className="space-y-1.5">
            <Label htmlFor={`field-${field.key}`} className="flex items-center gap-1 text-sm font-medium">
              {field.label}
              {field.required && <span className="text-destructive">*</span>}
            </Label>

            {field.type === 'textarea' ? (
              <Textarea
                id={`field-${field.key}`}
                rows={3}
                placeholder={field.placeholder || `Masukkan ${field.label.toLowerCase()}...`}
                value={value}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleFieldChange(field.key, e.target.value)
                }
              />
            ) : field.type === 'select' ? (
              <select
                id={`field-${field.key}`}
                value={value}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
              >
                <option value="">Pilih {field.label}...</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : field.type === 'number' ? (
              <Input
                id={`field-${field.key}`}
                type="number"
                placeholder={field.placeholder || '0'}
                value={value}
                onChange={(e) =>
                  handleFieldChange(
                    field.key,
                    e.target.value === '' ? '' : Number(e.target.value)
                  )
                }
              />
            ) : field.type === 'date' ? (
              <Input
                id={`field-${field.key}`}
                type="date"
                value={value}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
              />
            ) : (
              <Input
                id={`field-${field.key}`}
                type="text"
                placeholder={field.placeholder || `Masukkan ${field.label.toLowerCase()}...`}
                value={value}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
