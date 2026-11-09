"use client";

import Image from "next/image";
import { useState } from "react";

type ContentImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
  fallbackSrc?: string;
  priority?: boolean;
};

/** An externally supplied CMS image with a reliable local fallback. */
export function ContentImage({
  src,
  fallbackSrc = "/images/karate-training.png",
  alt = "",
  className,
  width = 900,
  height = 600,
  priority = false,
  ...props
}: ContentImageProps) {
  const source = src?.trim() || fallbackSrc;

  // Use optimized Next.js Image for local public assets
  if (source.startsWith("/images/") || source.startsWith("/")) {
    return (
      <Image
        src={source}
        alt={alt}
        width={Number(width) || 900}
        height={Number(height) || 600}
        className={className}
        priority={priority}
      />
    );
  }

  return (
    <FallbackImage
      key={source}
      source={source}
      fallbackSrc={fallbackSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      {...props}
    />
  );
}

function FallbackImage({
  source,
  fallbackSrc = "/images/karate-training.png",
  alt,
  ...props
}: Omit<ContentImageProps, "src"> & { source: string }) {
  const [currentSrc, setCurrentSrc] = useState(source);

  return (
    // Dynamic CMS URLs must not be passed through next/image host validation.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      onError={() => {
        if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
      }}
    />
  );
}
