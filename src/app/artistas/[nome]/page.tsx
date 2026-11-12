/**
 * app/artistas/[nome]/page.tsx — página do artista.
 *
 * Com `cacheComponents: true` (next.config.ts), o nome do artista só se conhece
 * no pedido, por isso quem lê o parâmetro (useParams) tem de estar dentro de
 * <Suspense>; sem isso o `next build` falha.
 *
 * ⚠️ Por agora mostra a PÁGINA DE TESTE (ArtistaTeste), que serve para ver a
 * API, a store e os hooks a funcionar. O colega substitui-a pela página final.
 */
import { Suspense } from "react";
import ArtistaTeste from "@/components/artista/ArtistaTeste";

export default function ArtistaPage() {
  return (
    <Suspense fallback={<p className="p-6 text-slate-400">A carregar…</p>}>
      <ArtistaTeste />
    </Suspense>
  );
}
