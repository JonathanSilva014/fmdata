import type { ItemRanking } from "@/types";
import { formatarNumero } from "@/lib/formatar";
import { Capa } from "./Capa";

/**
 * Lista de músicas com posição, capa, faixa e contagem.
 * Usada no top 10 do dashboard (com o álbum) e no top 10 do artista.
 */
export function ListaMusicas({ itens, mostrarAlbum }: { itens: ItemRanking[]; mostrarAlbum: boolean }) {
  return (
    <ol className="divide-y divide-borda">
      {itens.map((m, i) => (
        <li key={m.chave} className="flex items-center gap-3 py-2.5">
          <span className="w-6 shrink-0 text-right font-display font-black italic tabular-nums text-destaque">{i + 1}</span>
          <Capa src={m.imagem} className="size-11 border border-borda" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{m.nome}</p>
            {mostrarAlbum && m.album && <p className="truncate text-sm text-texto-suave">{m.album}</p>}
          </div>
          <span className="shrink-0 text-sm tabular-nums text-texto-suave">{formatarNumero(m.contagem)}</span>
        </li>
      ))}
    </ol>
  );
}
