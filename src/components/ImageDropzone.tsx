import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, Link as LinkIcon, Film, Check } from 'lucide-react';

interface ImageDropzoneProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  allowVideo?: boolean;
}

// Compress image on canvas to avoid blowing localStorage quota (keeps under 100KB)
async function compressImageFile(file: File): Promise<string> {
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
          resolve(e.target?.result as string || '');
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Use webp or jpeg at 0.82 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target?.result as string || '');
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  value,
  onChange,
  label = 'Media / Image',
  helperText = 'Drag & drop image or video here, or click to browse (JPG, PNG, WebP, SVG, MP4)',
  allowVideo = true
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setErrorMessage(null);
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setErrorMessage('Please provide an image (PNG, JPG, SVG, WebP) or video file.');
      return;
    }

    if (isVideo && !allowVideo) {
      setErrorMessage('Video is not supported for this field. Please provide an image.');
      return;
    }

    setIsProcessing(true);
    try {
      if (isImage) {
        const compressed = await compressImageFile(file);
        if (compressed) {
          onChange(compressed);
        }
      } else if (isVideo) {
        // For video files, read as data URL if small, or keep URL
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            onChange(e.target.result as string);
          }
          setIsProcessing(false);
        };
        reader.readAsDataURL(file);
        return;
      }
    } catch (err) {
      setErrorMessage('Failed to process file. Try pasting a direct URL.');
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const isVideoUrl = value && (value.includes('.mp4') || value.includes('data:video'));

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-stone-200 uppercase tracking-wider">
            {label}
          </label>
          {value && (
            <span className="text-[11px] text-[#768A7D] flex items-center gap-1 font-medium">
              <Check className="w-3.5 h-3.5" /> Media Loaded
            </span>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="p-2.5 bg-red-950/60 border border-red-800 text-red-200 rounded-xl text-xs">
          {errorMessage}
        </div>
      )}

      {/* Current Preview or Dropzone */}
      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-[#443227] bg-[#160F0C] group">
          <div className="aspect-[16/9] max-h-56 w-full flex items-center justify-center bg-[#140E0B]">
            {isVideoUrl ? (
              <video 
                src={value} 
                controls 
                className="max-h-56 w-full object-contain"
              />
            ) : (
              <img 
                src={value} 
                alt="Preview" 
                className="max-h-56 w-full object-contain p-2" 
              />
            )}
          </div>

          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 bg-[#768A7D] hover:bg-[#5C7367] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-md"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Replace File</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onChange('');
                setUrlInput('');
              }}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-md"
            >
              <X className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      ) : (
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
            {isProcessing ? 'Optimizing Media...' : 'Click to upload or Drag & Drop'}
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
        accept="image/*,video/mp4,video/webm"
        onChange={async (e) => {
          if (e.target.files && e.target.files[0]) {
            await processFile(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {/* Direct URL input toggle */}
      <div className="flex items-center justify-between text-[11px] pt-1">
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[#C5A880] hover:text-[#FAF6F0] flex items-center gap-1 transition-colors"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? 'Hide manual URL input' : 'Or paste direct image / video URL'}</span>
        </button>
      </div>

      {showUrlInput && (
        <div className="flex gap-2 pt-1 animate-in fade-in duration-150">
          <input
            type="text"
            placeholder="https://example.com/image.jpg or /src/assets/..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 p-2.5 bg-[#160F0C] border border-[#443227] rounded-xl text-xs text-stone-200 focus:outline-none focus:border-[#768A7D]"
          />
          <button
            type="button"
            onClick={() => {
              if (urlInput.trim()) {
                onChange(urlInput.trim());
                setUrlInput('');
                setShowUrlInput(false);
              }
            }}
            className="px-4 py-2 bg-[#768A7D] hover:bg-[#5C7367] text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
          >
            Apply URL
          </button>
        </div>
      )}
    </div>
  );
};
