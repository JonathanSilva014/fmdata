import { AlbumIcon } from "@solar-icons/react/linear/album";
import type { ReactNode } from "react";
import type { ItemRanking } from "@/types";
import { formatarNumero } from "@/lib/formatar";
import { Bloco } from "@/components/ui/Bloco";
import { Capa } from "@/components/ui/Capa";
import { VazioDoPeriodo } from "@/components/ui/Estados";

/** Top 8 álbuns em grelha visual: capa como fundo, com título, artista e plays. */
export function TopAlbuns({ itens, filtro }: { itens: ItemRanking[]; filtro?: ReactNode }) {
  return (
    <Bloco titulo="Top 8 álbuns" icone={<AlbumIcon size={20} />} descricao="Os álbuns mais ouvidos no período." filtro={filtro}>
      {itens.length === 0 && <VazioDoPeriodo />}
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {itens.map((a) => (
          <li key={a.chave} className="relative aspect-square overflow-hidden border border-borda">
            <Capa src={a.imagem} className="absolute inset-0 size-full" />
            {/* Sombra escura por baixo do texto branco: legível sobre qualquer capa */}
            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-2.5">
              <p className="line-clamp-2 text-sm leading-tight font-extrabold text-white">{a.nome}</p>
              <p className="truncate text-xs text-white/85">{a.subtitulo}</p>
              <p className="mt-1 inline-block bg-destaque px-1.5 py-0.5 text-[11px] font-extrabold tabular-nums text-sobre-destaque">
                {formatarNumero(a.contagem)} plays
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Bloco>
  );
}
