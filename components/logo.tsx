"use client";

import Image from "next/image";

interface LogoProps {
  compact?: boolean;
}

export function Logo({ compact = false }: LogoProps) {
  return (
    <div className="flex items-center justify-center">
      {/* COMPACT (collapsed sidebar) */}
      {compact ? (
        <div className="relative h-10 w-10">
          <Image
            src="https://res.cloudinary.com/drdotym31/image/upload/f_auto,q_auto/v1764049737/logo_zauzwn.jpg"
            alt="VSource Education"
            fill
            className="object-cover rounded-sm h-20 w-20"
            priority
          />
        </div>
      ) : (
        /* FULL LOGO */
        <div className="relative h-20 w-36 overflow-hidden rounded-xl bg-white">
          <Image
            src="https://res.cloudinary.com/drdotym31/image/upload/f_auto,q_auto/v1764049737/logo_zauzwn.jpg"
            alt="VSource Education"
            fill
            className="object-cover rounded-sm h-28 w-20"
            priority
          />
        </div>
      )}
    </div>
  );
}
