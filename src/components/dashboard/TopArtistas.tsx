"use client";

import Link from "next/link";
import { Microphone3Icon } from "@solar-icons/react/linear/microphone-3";
import type { ItemRanking } from "@/types";
import { formatarNumero, plural } from "@/lib/formatar";
import { caminhoArtista } from "@/lib/rotas";
import type { ReactNode } from "react";
import { useImagemArtista } from "@/hooks/useImagemArtista";
import { Bloco } from "@/components/ui/Bloco";
import { Capa } from "@/components/ui/Capa";
import { VazioDoPeriodo } from "@/components/ui/Estados";

/**
 * Top 20 artistas, com o foco no n.º 1:
 * - 1.º em grande, à esquerda (foto, nome clicável, contagem);
 * - 2.º ao 10.º numa lista em duas colunas (foto redonda com a posição, nome, contagem);
 * - 11.º ao 20.º numa lista compacta como a do Top 10 músicas.
 */
export function TopArtistas({ itens, filtro }: { itens: ItemRanking[]; filtro?: ReactNode }) {
  const [primeiro, ...outros] = itens;
  const ate10 = outros.slice(0, 9);
  const resto = outros.slice(9);

  return (
    <Bloco titulo="Top 20 artistas" icone={<Microphone3Icon size={22} />} descricao="Quem ouves mais no período." variante="separador" filtro={filtro}>
      {itens.length === 0 && <VazioDoPeriodo />}
      <div className="flex flex-wrap gap-8">
        {primeiro && <PrimeiroLugar item={primeiro} />}

        <div className="min-w-0 flex-[999_1_520px]">
          {ate10.length > 0 && (
            <ol className="grid gap-x-10 gap-y-4 sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-5">
              {ate10.map((item, i) => (
                <LinhaArtista key={item.chave} item={item} posicao={i + 2} />
              ))}
            </ol>
          )}

          {resto.length > 0 && (
            <div className="mt-6 border-t-2 border-borda-forte pt-4">
              <h3 className="font-display text-sm font-extrabold tracking-wide text-destaque uppercase italic">Do 11.º ao 20.º</h3>
              <ol className="mt-2 grid gap-x-10 sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-5">
                {resto.map((item, i) => (
                  <LinhaCompacta key={item.chave} item={item} posicao={i + 11} />
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </Bloco>
  );
}

/** 11.º ao 20.º: linha compacta como a do Top 10 músicas (posição, foto pequena, nome, contagem). */
function LinhaCompacta({ item, posicao }: { item: ItemRanking; posicao: number }) {
  const nome = item.artista ?? item.nome;
  const foto = useImagemArtista(nome);
  return (
    <li className="flex items-center gap-3 border-b border-borda py-2">
      <span className="w-7 shrink-0 text-right font-display font-black text-destaque italic">{posicao}</span>
      <Capa src={foto.data} className="size-9 border border-borda" />
      <Link href={caminhoArtista(nome)} className="min-w-0 flex-1 truncate font-semibold hover:text-destaque">
        <span className="sr-only">{posicao}.º </span>
        {item.nome}
      </Link>
      <span className="shrink-0 font-bold tabular-nums">{formatarNumero(item.contagem)}</span>
    </li>
  );
}

/** O 1.º lugar, em destaque. */
function PrimeiroLugar({ item }: { item: ItemRanking }) {
  const nome = item.artista ?? item.nome;
  const foto = useImagemArtista(nome);
  return (
    <div className="flex flex-[1_1_240px] items-center gap-4 sm:max-w-72 sm:flex-col sm:items-stretch sm:gap-2">
      <Capa src={foto.data} alt={`Foto de ${nome}`} className="aspect-square w-28 shrink-0 border-2 border-borda-forte sm:w-full" />
      <div className="flex min-w-0 flex-col gap-1 sm:gap-2">
        <p className="font-display text-sm font-extrabold tracking-wide text-destaque uppercase italic">1.º do período</p>
        <Link href={caminhoArtista(nome)} className="font-display text-2xl font-black break-words italic hover:text-destaque sm:text-3xl">
          {item.nome}
        </Link>
        <p className="text-texto-suave">{plural(item.contagem, "reprodução", "reproduções")}</p>
      </div>
    </div>
  );
}

/** 2.º ao 10.º: cada linha pede a sua foto (a capa dos scrobbles não é a foto do artista). */
function LinhaArtista({ item, posicao }: { item: ItemRanking; posicao: number }) {
  const nome = item.artista ?? item.nome;
  const foto = useImagemArtista(nome);
  return (
    <li className="flex items-center gap-4">
      <div className="relative shrink-0">
        <Capa src={foto.data} className="size-16 rounded-full border-2 border-borda-forte" />
        <span
          aria-hidden="true"
          className="absolute -top-1 -left-1 flex size-7 items-center justify-center rounded-full bg-destaque font-display text-xs font-black text-sobre-destaque italic"
        >
          {posicao}.º
        </span>
      </div>
      <div className="min-w-0">
        <Link href={caminhoArtista(nome)} className="block truncate font-display text-lg font-black uppercase italic hover:text-destaque">
          <span className="sr-only">{posicao}.º </span>
          {item.nome}
        </Link>
        <span className="font-bold tabular-nums text-destaque">{plural(item.contagem, "reprodução", "reproduções")}</span>
      </div>
    </li>
  );
}
