import React, { useState, useRef } from 'react';
import { Upload, X, ArrowLeft, ArrowRight, Image as ImageIcon, Plus } from 'lucide-react';
import { uploadMediaFile } from '../services/storage';

export async function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    // If SVG, read as text data URL directly
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1200;
        const maxHeight = 900;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve((e.target?.result as string) || '');
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Use webp or jpeg at 0.78 quality for crisp, lightweight storage
        const dataUrl = canvas.toDataURL('image/jpeg', 0.78);
        resolve(dataUrl);
      };
      img.onerror = () => resolve((e.target?.result as string) || '');
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

interface MultiImageDropzoneProps {
  images: string[];
  onChange: (images: string[]) => void;
  label?: string;
  helperText?: string;
  maxImages?: number;
}

export const MultiImageDropzone: React.FC<MultiImageDropzoneProps> = ({
  images = [],
  onChange,
  label = 'Product Image Gallery',
  helperText = 'Drag & drop multiple product photos, or click to browse (JPG, PNG, WebP)',
  maxImages = 15
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: FileList | File[]) => {
    setErrorMessage(null);
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) {
      setErrorMessage('Please select valid image files (JPG, PNG, WebP, SVG).');
      return;
    }

    setIsProcessing(true);
    try {
      const uploadedList: string[] = [];
      let missingBucketMsg: string | null = null;

      for (const file of validFiles) {
        const res = await uploadMediaFile(file, 'products');
        if (res.url) {
          uploadedList.push(res.url);
        }
        if (res.bucketMissing && res.error) {
          missingBucketMsg = res.error;
        }
      }

      if (uploadedList.length > 0) {
        const updated = [...images, ...uploadedList].slice(0, maxImages);
        onChange(updated);
      }
      if (missingBucketMsg) {
        setErrorMessage(missingBucketMsg);
      }
    } catch {
      setErrorMessage('Failed to process one or more images. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-stone-200 uppercase tracking-wider">
          {label} ({images.length})
        </label>
        {images.length > 0 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-[11px] text-[#C5A880] hover:text-[#FAF6F0] flex items-center gap-1 font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add More Photos
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="p-2.5 bg-red-950/60 border border-red-800 text-red-200 rounded-xl text-xs">
          {errorMessage}
        </div>
      )}

      {/* Existing Images Thumbnails List */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-3 bg-[#15100D] border border-[#443227] rounded-2xl">
          {images.map((imgUrl, idx) => (
            <div 
              key={idx} 
              className="relative group rounded-xl overflow-hidden bg-[#1E1510] border border-[#443227] aspect-[4/3] flex items-center justify-center"
            >
              <img 
                src={imgUrl} 
                alt={`Gallery ${idx + 1}`} 
                className="w-full h-full object-cover" 
              />
              <span className="absolute top-1.5 left-1.5 bg-black/70 text-[#C5A880] text-[10px] font-bold px-1.5 py-0.5 rounded">
                #{idx + 1}
              </span>

              {/* Action Overlay */}
              <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 'left')}
                    className="p-1.5 bg-stone-800 hover:bg-stone-700 text-white rounded-lg transition-colors"
                    title="Move Left"
                  >
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  title="Remove Image"
                >
                  <X className="w-3 h-3" />
                </button>
                {idx < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 'right')}
                    className="p-1.5 bg-stone-800 hover:bg-stone-700 text-white rounded-lg transition-colors"
                    title="Move Right"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add Tile */}
          {images.length < maxImages && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[4/3] rounded-xl border border-dashed border-[#443227] hover:border-[#768A7D] bg-[#1E1510]/50 hover:bg-[#1E1510] flex flex-col items-center justify-center gap-1 text-stone-400 hover:text-white transition-all"
            >
              <Plus className="w-5 h-5 text-[#768A7D]" />
              <span className="text-[11px] font-medium">Add Photo</span>
            </button>
          )}
        </div>
      )}

      {/* Main Drag & Drop Zone if no images or for dropping multiple */}
      {images.length === 0 && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragging 
              ? 'border-[#768A7D] bg-[#768A7D]/20 scale-[1.01]' 
              : 'border-[#443227] hover:border-[#768A7D] bg-[#1F1510] hover:bg-[#251A14]'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-[#2A1D16] border border-[#443227] text-[#768A7D] flex items-center justify-center mx-auto mb-3 shadow-inner">
            {isProcessing ? (
              <div className="w-6 h-6 border-2 border-[#768A7D] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>
          <p className="text-xs sm:text-sm font-semibold text-[#FAF6F0]">
            {isProcessing ? 'Optimizing Media...' : 'Click to upload or Drag & Drop Multiple Photos'}
          </p>
          <p className="text-[11px] text-stone-400 mt-1 max-w-sm mx-auto leading-relaxed">
            {helperText}
          </p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={async (e) => {
          if (e.target.files && e.target.files.length > 0) {
            await processFiles(e.target.files);
          }
        }}
        className="hidden"
      />
    </div>
  );
};
