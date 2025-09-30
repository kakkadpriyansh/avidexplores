'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link, X, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function ImageUpload({ 
  value, 
  onChange, 
  onRemove,
  label = 'Image', 
  placeholder = 'https://example.com/image.jpg',
  className = '' 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value);
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Sync URL input with value prop when it changes externally
  useEffect(() => {
    if (value !== urlInput) {
      setUrlInput(value);
      setImageError(false);
    }
  }, [value]);

  const handleFileUpload = async (file: File, skipConfirmation = false) => {
    if (!file) return;

    console.log('Starting file upload:', file.name, file.size, file.type);
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 10MB.',
        variant: 'destructive',
      });
      return;
    }

    // If there's an existing image and we haven't confirmed replacement, show dialog
    if (value && !skipConfirmation) {
      setPendingFile(file);
      setShowReplaceDialog(true);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // If replacing an existing image, include the old URL for cleanup
      if (value && value.startsWith('/uploads/')) {
        formData.append('replaceUrl', value);
      }

      console.log('Making fetch request to /api/upload...');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Upload error response:', errorData);
        
        try {
          const errorJson = JSON.parse(errorData);
          throw new Error(errorJson.error || `Upload failed: ${response.status}`);
        } catch {
          throw new Error(`Upload failed: ${response.status} - ${errorData}`);
        }
      }

      const data = await response.json();
      console.log('Upload success response:', data);
      
      onChange(data.url);
      setUrlInput(data.url);
      setImageError(false);
      
      toast({
        title: 'Upload successful',
        description: value ? 'Image replaced successfully.' : 'Image uploaded successfully.',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload image.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setPendingFile(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleUrlChange = (url: string) => {
    // If there's an existing image and we're changing to a different URL, show confirmation
    if (value && value !== url && url.trim()) {
      setPendingUrl(url);
      setShowReplaceDialog(true);
      return;
    }
    
    setUrlInput(url);
    onChange(url);
    setImageError(false);
  };

  const handleUrlBlur = () => {
    // Validate URL format when user leaves the input
    if (urlInput && urlInput !== value) {
      try {
        new URL(urlInput);
        onChange(urlInput);
      } catch {
        toast({
          title: 'Invalid URL',
          description: 'Please enter a valid image URL.',
          variant: 'destructive',
        });
        setUrlInput(value); // Reset to original value
      }
    }
  };

  const confirmReplace = () => {
    if (pendingFile) {
      handleFileUpload(pendingFile, true);
    } else if (pendingUrl) {
      setUrlInput(pendingUrl);
      onChange(pendingUrl);
      setImageError(false);
      setPendingUrl('');
    }
    setShowReplaceDialog(false);
  };

  const cancelReplace = () => {
    setPendingFile(null);
    setPendingUrl('');
    setShowReplaceDialog(false);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearImage = () => {
    if (onRemove) {
      onRemove();
    } else {
      onChange('');
    }
    setUrlInput('');
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const retryImageLoad = () => {
    setImageError(false);
  };

  return (
    <>
      <div className={className}>
        <Label className="text-sm font-medium">{label}</Label>
        
        <Tabs defaultValue="url" className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              URL
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="url" className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder={placeholder}
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onBlur={handleUrlBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUrlChange(urlInput);
                  }
                }}
                className="flex-1"
              />
              {value && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {urlInput !== value && urlInput.trim() && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleUrlChange(urlInput)}
                className="w-full"
              >
                {value ? 'Replace Image' : 'Set Image'}
              </Button>
            )}
          </TabsContent>
          
          <TabsContent value="upload" className="space-y-2">
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex-1"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {value ? 'Replace Image' : 'Choose File'}
                  </>
                )}
              </Button>
              {value && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Image Preview */}
        {value && (
          <div className="mt-3">
            <div className="relative w-full max-w-xs">
              {imageError ? (
                <div className="w-full h-32 border rounded-lg flex flex-col items-center justify-center bg-gray-50 text-gray-500">
                  <AlertTriangle className="h-6 w-6 mb-2" />
                  <p className="text-sm text-center mb-2">Failed to load image</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={retryImageLoad}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                </div>
              ) : (
                <img
                  src={value}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg border"
                  onError={handleImageError}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Replace Confirmation Dialog */}
      <AlertDialog open={showReplaceDialog} onOpenChange={setShowReplaceDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace existing image?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace the current image. The old image will no longer be accessible through this field.
              {pendingFile && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                  <strong>New file:</strong> {pendingFile.name} ({(pendingFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelReplace}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReplace}>Replace</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}