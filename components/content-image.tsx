"use client";

import { useState } from "react";

type ContentImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
  fallbackSrc?: string;
};

/** An externally supplied CMS image with a reliable local fallback. */
export function ContentImage({
  src,
  fallbackSrc = "/images/karate-training.png",
  alt = "",
  ...props
}: ContentImageProps) {
  const source = src?.trim() || fallbackSrc;
  return <FallbackImage key={source} source={source} fallbackSrc={fallbackSrc} alt={alt} {...props} />;
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
