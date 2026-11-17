import React, { useEffect, useState } from 'react';
import { CatPawIcon } from './CatIcons';

interface ResilientImageProps {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export function ResilientImage({
  src,
  fallbackSrc,
  alt,
  className = 'w-full h-full object-cover',
  fallbackLabel,
}: ResilientImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      return;
    }
    setHasError(true);
  };

  if (hasError || !currentSrc) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#FDF1F5] to-[#F9E0E9] text-[#AD2F59] p-4 text-center"
        role="img"
        aria-label={alt}
      >
        <CatPawIcon className="w-8 h-8 opacity-75" />
        <span className="text-xs font-medium text-[#70525E] line-clamp-2 max-w-[180px]">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={handleError}
      className={className}
    />
  );
}
