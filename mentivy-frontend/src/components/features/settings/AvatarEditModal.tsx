'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Camera, 
  Upload, 
  X, 
  Check, 
  Trash2, 
  Sparkles, 
  RefreshCw, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Move,
  Crop
} from 'lucide-react';
import { updateProfile } from '@/app/actions/user-actions';
import { useAuthStore } from '@/store/useAuthStore';

interface AvatarEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string;
  userInitial: string;
  onAvatarUpdated: (newAvatarUrl: string) => void;
}

// 12 Curated Diverse Human Student Avatars (100% Human Characters)
const PRESET_HUMAN_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aiden&backgroundColor=b6e3f4&hair=shortHairShortFlat&facialHairProbability=0',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma&backgroundColor=ffd5dc&hair=longHairBigHair&facialHairProbability=0',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam&backgroundColor=d1d4f9&hair=shortHairCurly&facialHairProbability=0',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia&backgroundColor=ffdfbf&hair=longHairStraight&facialHairProbability=0',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas&backgroundColor=c0aede&hair=shortHairShortWaved&accessories=eyepatch',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia&backgroundColor=b6e3f4&hair=longHairBob&glasses=prescription02',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Noah&backgroundColor=ffd5dc&hair=shortHairShortCurly&glasses=round',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Ava&backgroundColor=d1d4f9&hair=longHairCurly&glasses=prescription01',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Mia&backgroundColor=ffd5dc',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Sam&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex&backgroundColor=ffdfbf',
];

export function AvatarEditModal({
  isOpen,
  onClose,
  currentAvatarUrl = '',
  userInitial,
  onAvatarUpdated
}: AvatarEditModalProps) {
  const { user: authUser, updateUser } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatarUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Interactive Cropper States ---
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [imgDimensions, setImgDimensions] = useState<{ baseWidth: number; baseHeight: number }>({ baseWidth: 240, baseHeight: 240 });
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedAvatar(currentAvatarUrl || '');
      setRawImageSrc(null);
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
      setErrorMessage('');
    }
  }, [isOpen, currentAvatarUrl]);

  if (!isOpen || !mounted) return null;

  // Handle file selection and measure natural dimensions
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image file size must be less than 10MB.');
      return;
    }

    setErrorMessage('');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const tempImg = new Image();
        tempImg.onload = () => {
          const nw = tempImg.naturalWidth || 240;
          const nh = tempImg.naturalHeight || 240;
          
          // Fit image so it covers or fits cleanly within 240px container
          const aspect = nw / nh;
          let bw = 240;
          let bh = 240;
          if (aspect >= 1) {
            bh = 240;
            bw = 240 * aspect;
          } else {
            bw = 240;
            bh = 240 / aspect;
          }

          setImgDimensions({ baseWidth: bw, baseHeight: bh });
          setRawImageSrc(tempImg.src);
          setZoom(1);
          setRotation(0);
          setOffset({ x: 0, y: 0 });
        };
        tempImg.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Drag / Pan Events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // 1:1 Pixel-Perfect Canvas Crop Engine matching exactly what is shown inside the 240px circle
  const handleCropAndApply = () => {
    if (!rawImageSrc || !imageRef.current) return;

    const img = imageRef.current;
    const viewportSize = 240;
    const outputSize = 320; // 320x320 crisp high-dpi circular avatar
    const factor = outputSize / viewportSize;

    const canvas = document.createElement('canvas');
    canvas.width = outputSize;
    canvas.height = outputSize;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Move origin to exact center of output canvas
    ctx.translate(outputSize / 2, outputSize / 2);

    // 2. Apply drag translation (scaled to canvas factor)
    ctx.translate(offset.x * factor, offset.y * factor);

    // 3. Apply 90° rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // 4. Apply zoom scaling
    ctx.scale(zoom, zoom);

    // 5. Draw image centered at (0, 0)
    const drawW = imgDimensions.baseWidth * factor;
    const drawH = imgDimensions.baseHeight * factor;
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

    // Export as highly compressed JPEG (~35-45 KB)
    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setSelectedAvatar(compressedDataUrl);
    setRawImageSrc(null); // Return to main preview view
  };

  const handleSaveAvatar = async () => {
    setIsSaving(true);
    setErrorMessage('');

    try {
      const res = await updateProfile({ avatarUrl: selectedAvatar });
      if (res.success) {
        onAvatarUpdated(selectedAvatar);
        if (authUser) {
          updateUser({ avatarUrl: selectedAvatar });
        }
        onClose();
      } else {
        setErrorMessage(res.error || 'Failed to update avatar.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while saving avatar.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveAvatar = () => {
    setSelectedAvatar('');
    setRawImageSrc(null);
    setErrorMessage('');
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* CROPPER STUDIO VIEW */}
        {rawImageSrc ? (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-primary-50 text-primary-600 mb-1 border border-primary-100 mx-auto">
                <Crop className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Crop & Position Photo</h2>
              <p className="text-xs text-slate-500">Drag to center your face inside the circle, use zoom and rotate controls.</p>
            </div>

            {/* Circular Viewport Box (240x240) */}
            <div 
              className="relative w-60 h-60 mx-auto rounded-full border-4 border-primary-500 shadow-xl overflow-hidden bg-slate-950 cursor-grab active:cursor-grabbing select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                ref={imageRef}
                src={rawImageSrc}
                alt="Source to crop"
                draggable={false}
                style={{
                  width: `${imgDimensions.baseWidth}px`,
                  height: `${imgDimensions.baseHeight}px`,
                  maxWidth: 'none',
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) rotate(${rotation}deg) scale(${zoom})`,
                  transformOrigin: 'center center',
                  pointerEvents: 'none'
                }}
              />
              
              {/* Drag Indicator Overlay */}
              <div className="absolute inset-0 border border-white/25 rounded-full pointer-events-none flex items-center justify-center">
                <Move className="w-6 h-6 text-white/40" />
              </div>
            </div>

            {/* Controls: Zoom Slider + Rotate + Reset */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              
              {/* Zoom Control */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setZoom(z => Math.max(1, z - 0.15))}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />

                <button
                  type="button"
                  onClick={() => setZoom(z => Math.min(3, z + 0.15))}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              {/* Rotate & Reset Controls */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 text-xs">
                <button
                  type="button"
                  onClick={handleRotate}
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5 text-primary-600" />
                  <span>Rotate 90°</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setRotation(0);
                    setOffset({ x: 0, y: 0 });
                  }}
                  className="text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                >
                  Reset Position
                </button>
              </div>
            </div>

            {/* Cropper Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRawImageSrc(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 cursor-pointer transition-colors"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleCropAndApply}
                className="py-2.5 px-6 rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold text-sm shadow-md shadow-primary-500/25 cursor-pointer transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Crop & Use Photo</span>
              </button>
            </div>
          </div>
        ) : (
          /* MAIN AVATAR SELECTION VIEW */
          <div className="space-y-6">
            
            {/* Header */}
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 mb-1 border border-primary-100 mx-auto">
                <Camera className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Customize Avatar</h2>
              <p className="text-sm text-slate-500">
                Upload your picture or choose from curated student avatars.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            {/* Live Avatar Preview */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-24 h-24 rounded-full border-4 border-primary-100 shadow-md overflow-hidden bg-primary-50 flex items-center justify-center">
                {selectedAvatar ? (
                  <img src={selectedAvatar} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black text-primary-600 uppercase select-none">
                    {userInitial}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                {selectedAvatar ? 'Custom Avatar Selected' : 'Default Letter Avatar Active'}
              </p>
            </div>

            {/* Action Options */}
            <div className="space-y-4">
              
              {/* Upload Button */}
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-primary-200 bg-primary-50/50 hover:bg-primary-50 text-primary-700 text-sm font-semibold cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload & Crop Photo</span>
                </button>

                {selectedAvatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="py-3 px-4 rounded-xl border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-600 text-sm font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
                    title="Reset to initial letter"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* 12 Curated Human Student Avatars */}
              <div>
                <div className="flex items-center gap-1.5 mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <Sparkles className="w-3.5 h-3.5 text-primary-600" />
                  <span>Or Pick a Student Avatar</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-48 overflow-y-auto p-1">
                  {PRESET_HUMAN_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedAvatar(url);
                        setErrorMessage('');
                      }}
                      className={`relative p-1 rounded-2xl border-2 transition-all cursor-pointer bg-slate-50 hover:scale-105 ${
                        selectedAvatar === url
                          ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-500/20'
                          : 'border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <img src={url} alt={`Student Avatar ${idx + 1}`} className="w-12 h-12 rounded-xl mx-auto object-cover" />
                      {selectedAvatar === url && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 cursor-pointer transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveAvatar}
                disabled={isSaving}
                className="py-2.5 px-6 rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold text-sm shadow-md shadow-primary-500/25 cursor-pointer transition duration-200 disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Avatar...</span>
                  </>
                ) : (
                  <span>Apply Avatar</span>
                )}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
