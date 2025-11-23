'use client';

import { useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Upload, Trash2, FileText, ExternalLink } from 'lucide-react';

interface PdfUploadProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  eventId?: string;
}

export function PdfUpload({ value, onChange, placeholder, eventId }: PdfUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await response.json();
      onChange(data.url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload PDF');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (eventId) {
      try {
        const response = await fetch(`/api/admin/events/${eventId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brochure: '' })
        });
        if (!response.ok) throw new Error('Failed to remove brochure');
      } catch (err: any) {
        setError(err.message || 'Failed to remove PDF');
        return;
      }
    }
    onChange('');
    setError(null);
  };

  return (
    <div className="space-y-2">
      {value && value.trim() !== '' ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
            <FileText className="h-5 w-5 text-red-600" />
            <span className="flex-1 text-sm truncate">{value.split('/').pop()}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.open(value, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRemove();
              }}
              disabled={uploading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <iframe
              src={value}
              className="w-full h-96"
              title="PDF Preview"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
          <Input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || 'Or enter PDF URL'}
            disabled={uploading}
          />
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
