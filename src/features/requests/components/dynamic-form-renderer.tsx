'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NotionEditor } from '@/components/ui/notion-editor';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { TemplateFieldDefinition } from '../types';

function toFieldText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
}

interface DynamicFormRendererProps {
  fields: TemplateFieldDefinition[];
  values: Record<string, unknown>;
  onChange?: (values: Record<string, unknown>) => void;
  readOnly?: boolean;
}

export function DynamicFormRenderer({
  fields,
  values,
  onChange,
  readOnly = false,
}: DynamicFormRendererProps) {
  const handleFieldChange = (key: string, val: string | number) => {
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
          const stringVal = toFieldText(values[f.key]);
          const isHtml =
            stringVal.includes('<p>') ||
            stringVal.includes('<h') ||
            stringVal.includes('<ul') ||
            stringVal.includes('<li>') ||
            stringVal.includes('<blockquote');

          return (
            <div key={f.key} className={f.type === 'textarea' ? 'md:col-span-2 space-y-1' : 'space-y-1'}>
              <span className="text-xs font-medium text-muted-foreground">{f.label}</span>
              {isHtml ? (
                <div
                  className="prose-notion text-xs leading-relaxed text-foreground bg-muted/20 border border-border/60 rounded-lg p-3"
                  dangerouslySetInnerHTML={{ __html: stringVal }}
                />
              ) : (
                <p className="text-xs font-semibold text-foreground whitespace-pre-wrap">
                  {stringVal !== '' ? stringVal : '—'}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const value = toFieldText(values[field.key]);

        return (
          <div key={field.key} className="space-y-1.5">
            <Label htmlFor={`field-${field.key}`} className="flex items-center gap-1 text-xs font-medium">
              {field.label}
              {field.required && <span className="text-destructive">*</span>}
            </Label>

            {field.type === 'textarea' ? (
              <NotionEditor
                value={value}
                onChange={(html) => handleFieldChange(field.key, html)}
                placeholder={field.placeholder || `Ketik '/' untuk opsi format blok...`}
                minHeight="min-h-[140px]"
              />
            ) : field.type === 'select' ? (
              <Select
                value={value || undefined}
                onValueChange={(v) => handleFieldChange(field.key, v)}
              >
                <SelectTrigger id={`field-${field.key}`} className="h-9 w-full text-sm">
                  <SelectValue placeholder={`Pilih ${field.label}...`} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <DatePicker
                id={`field-${field.key}`}
                value={value}
                onChange={(v) => handleFieldChange(field.key, v || '')}
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
