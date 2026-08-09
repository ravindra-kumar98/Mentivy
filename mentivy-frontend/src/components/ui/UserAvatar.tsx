'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  className?: string;
  sizeClassName?: string;
}

export function UserAvatar({
  src,
  name,
  className,
  sizeClassName = "w-9 h-9 text-sm"
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  // Reset error state if src changes
  useEffect(() => {
    setImgError(false);
  }, [src]);

  const initial = (name?.trim() || 'S').charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        "rounded-full bg-primary-100 border border-primary-200 text-primary-700 font-bold flex items-center justify-center overflow-hidden shrink-0 select-none relative",
        sizeClassName,
        className
      )}
    >
      {src && !imgError ? (
        <img
          src={src}
          alt=""
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="leading-none">{initial}</span>
      )}
    </div>
  );
}

export default UserAvatar;
