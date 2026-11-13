import { MusicNotesIcon } from "@solar-icons/react/linear/music-notes";
import type { ReactNode } from "react";
import type { ItemRanking } from "@/types";
import { formatarNumero } from "@/lib/formatar";
import { Bloco } from "@/components/ui/Bloco";
import { Capa } from "@/components/ui/Capa";
import { VazioDoPeriodo } from "@/components/ui/Estados";

/**
 * Top 10 músicas em lista compacta, em duas colunas (1.º–5.º e 6.º–10.º), como a do
 * 11.º ao 20.º artista: posição, capa, faixa, álbum e contagem.
 */
export function TopMusicas({ itens, filtro }: { itens: ItemRanking[]; filtro?: ReactNode }) {
  return (
    <Bloco titulo="Top 10 músicas" icone={<MusicNotesIcon size={20} />} descricao="As faixas que mais ouves no período." filtro={filtro}>
      {itens.length === 0 && <VazioDoPeriodo />}
      <ol className="grid gap-x-10 sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-5">
        {itens.map((m, i) => (
          <li key={m.chave} className="flex items-center gap-3 border-b border-borda py-2.5">
            <span className="w-7 shrink-0 text-right font-display text-lg font-black text-destaque italic">
              <span className="sr-only">Posição </span>
              {i + 1}
            </span>
            <Capa src={m.imagem} alt={m.album ? `Capa de ${m.album}` : ""} className="size-12 shrink-0 border border-borda" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{m.nome}</p>
              {m.album && <p className="truncate text-xs text-texto-suave">{m.album}</p>}
            </div>
            <span className="shrink-0 font-bold tabular-nums">
              {formatarNumero(m.contagem)}
              <span className="sr-only"> reproduções</span>
            </span>
          </li>
        ))}
      </ol>
    </Bloco>
  );
}
