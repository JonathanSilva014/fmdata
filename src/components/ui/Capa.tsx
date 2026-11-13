"use client";

import { useState } from "react";
import { VinylIcon } from "@solar-icons/react/linear/vinyl";

/**
 * Imagem de capa/foto com alternativa: se não houver URL ou se a imagem
 * falhar a carregar, mostra um disco no lugar (nunca uma imagem partida).
 */
export function Capa({ src, alt = "", className = "" }: { src: string | null | undefined; alt?: string; className?: string }) {
  const [falhou, setFalhou] = useState<string | null>(null);

  if (!src || falhou === src) {
    return (
      <div
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
        className={`flex shrink-0 items-center justify-center bg-superficie-alta text-texto-suave ${className}`}
      >
        <VinylIcon size="45%" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- imagens externas (Last.fm, Wikimedia) já vêm reduzidas
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFalhou(src)}
      // Se a imagem falhou antes de o React hidratar, o onError perdeu-se: verifica ao montar.
      ref={(img) => {
        if (img?.complete && img.naturalWidth === 0) setFalhou(src);
      }}
      className={`shrink-0 object-cover ${className}`}
    />
  );
}
