/**
 * app/artistas/[nome]/page.tsx — página do artista.
 *
 * Com `cacheComponents: true` (next.config.ts), o nome só se conhece no pedido:
 * quem lê o parâmetro (useParams) tem de estar dentro de <Suspense>, senão o
 * `next build` falha (docs do Next 16; skill nextjs-app-router-patterns).
 */
import { Suspense } from "react";
import PaginaArtista from "@/components/artista/PaginaArtista";
import { EstadoCarregar } from "@/components/ui/Estados";

export default function ArtistaPage() {
  return (
    <Suspense fallback={<EstadoCarregar mensagem="A abrir a página do artista…" />}>
      <PaginaArtista />
    </Suspense>
  );
}
