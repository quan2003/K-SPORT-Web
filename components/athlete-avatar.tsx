"use client";

import Image from "next/image";
import { useState } from "react";

function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words.slice(-2).map((word) => word[0]).join("").toLocaleUpperCase("vi");
}

export function AthleteAvatar({
  name,
  src,
  priority = false,
  className = "",
}: {
  name: string;
  src?: string;
  priority?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <div className={`athlete-avatar has-photo ${className}`.trim()}>
        <Image
          src={src}
          alt={`Ảnh vận động viên ${name}`}
          fill
          sizes="(max-width: 760px) 96px, 180px"
          priority={priority}
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className={`athlete-avatar is-default ${className}`.trim()} role="img" aria-label={`Ảnh đại diện mặc định của ${name}`}>
      <svg viewBox="0 0 160 200" aria-hidden="true">
        <circle cx="80" cy="54" r="30" />
        <path d="M34 185v-41c0-37 20-58 46-58s46 21 46 58v41" />
        <path d="m56 96 24 25 24-25M80 121v64" />
      </svg>
      <span>{initials(name)}</span>
      <small>Ảnh mặc định</small>
    </div>
  );
}
