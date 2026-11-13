"use client";

/**
 * Página do artista — visão detalhada de um artista. Sempre all-time
 * (ignora o filtro de período). Responde às 4 perguntas do enunciado:
 * quem é este artista, quanto o ouves, quando o ouves e com quem se parece.
 */
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, type ReactNode } from "react";
import { ArrowLeftIcon } from "@solar-icons/react/linear/arrow-left";
import { formatarHora } from "@/lib/dates";
import { horaDePico, scrobblesPorHora } from "@/lib/stats";
import {
  albunsDoArtista,
  artistasSemelhantes,
  resumoDoArtista,
  scrobblesPorMes,
  topMusicasDoArtista,
  ultimasAudicoes,
} from "@/lib/artist";
import { nomeDaRota } from "@/lib/rotas";
import { useArtistInfo } from "@/hooks/useArtistInfo";
import { useScrobblesDoArtista } from "@/hooks/useScrobblesDoArtista";
import { Bloco } from "@/components/ui/Bloco";
import { Faixa } from "@/components/ui/Faixa";
import { EstadoCarregar, EstadoErro, EstadoVazio } from "@/components/ui/Estados";
import { ListaMusicas } from "@/components/ui/ListaMusicas";
import { GraficoHoras } from "@/components/graficos/GraficoHoras";
import { GraficoMeses } from "@/components/graficos/GraficoMeses";
import { CabecalhoArtista } from "./CabecalhoArtista";
import { EstatisticasArtista } from "./EstatisticasArtista";
import { AlbunsArtista } from "./AlbunsArtista";
import { UltimasAudicoes } from "./UltimasAudicoes";
import { Semelhantes } from "./Semelhantes";
import { MusicNotesIcon } from "@solar-icons/react/linear/music-notes";
import { ClockCircleIcon } from "@solar-icons/react/linear/clock-circle";
import { CalendarIcon } from "@solar-icons/react/linear/calendar";

export default function PaginaArtista() {
  // useParams devolve o nome codificado (armadilha do enunciado): descodificar.
  const nome = nomeDaRota(useParams<{ nome: string }>().nome);
  const historico = useScrobblesDoArtista(nome);
  const perfil = useArtistInfo(nome);
  const { doArtista, todos } = historico;

  const dados = useMemo(() => {
    const porHora = scrobblesPorHora(doArtista);
    return {
      resumo: resumoDoArtista(doArtista, todos),
      musicas: topMusicasDoArtista(doArtista, 10),
      albuns: albunsDoArtista(doArtista),
      porMes: scrobblesPorMes(doArtista),
      porHora,
      pico: horaDePico(porHora),
      ultimas: ultimasAudicoes(doArtista, 10),
    };
  }, [doArtista, todos]);

  const semelhantes = useMemo(
    () => (perfil.data ? artistasSemelhantes(perfil.data, todos) : []),
    [perfil.data, todos],
  );

  if (historico.status === "loading") {
    return (
      <Estado>
        <EstadoCarregar mensagem="A carregar o histórico de reproduções… Da primeira vez pode demorar até um minuto." />
      </Estado>
    );
  }

  if (historico.status === "error") {
    return (
      <Estado>
        <EstadoErro titulo="Não foi possível carregar o histórico" mensagem={historico.error} onTentar={historico.recarregar} />
      </Estado>
    );
  }

  // Não encontrado: mensagem clara, sem rebentar a página.
  if (!historico.existe) {
    return (
      <Estado>
        <EstadoVazio titulo="Artista não encontrado">
          <p>“{nome}” não aparece no teu histórico de reproduções.</p>
          <Link href="/" className="mt-3 inline-block text-destaque underline">
            Voltar ao dashboard
          </Link>
        </EstadoVazio>
      </Estado>
    );
  }

  return (
    <>
      <CabecalhoArtista nome={nome} perfil={perfil} />

      <Faixa fundo="branco">
        <EstatisticasArtista resumo={dados.resumo} info={perfil.data} />
      </Faixa>

      <Faixa className="grid gap-6 lg:grid-cols-2">
        <Bloco titulo="Top 10 músicas" icone={<MusicNotesIcon size={20} />} descricao="As faixas deste artista que mais ouves.">
          <ListaMusicas itens={dados.musicas} mostrarAlbum={false} />
        </Bloco>
        <Bloco
          titulo="Relógio 24h"
          icone={<ClockCircleIcon size={20} />}
          descricao={`A que horas ouves este artista (UTC)${dados.pico !== null ? `. Mais vezes às ${formatarHora(dados.pico)}.` : "."}`}
        >
          <GraficoHoras porHora={dados.porHora} pico={dados.pico} altura={300} descricao={`Reproduções de ${nome} por hora do dia em UTC`} />
        </Bloco>
      </Faixa>

      <Faixa fundo="branco">
        <AlbunsArtista albuns={dados.albuns} />
      </Faixa>

      <Faixa fundo="rosa">
        <Bloco titulo="Scrobbles por mês" icone={<CalendarIcon size={22} />} descricao="A evolução da tua escuta ao longo do tempo." variante="separador">
          <GraficoMeses pontos={dados.porMes} descricao={`Reproduções de ${nome} por mês`} />
        </Bloco>
      </Faixa>

      <Faixa className="grid gap-6 lg:grid-cols-2">
        <UltimasAudicoes audicoes={dados.ultimas} />
        <Semelhantes artistas={semelhantes} aCarregar={perfil.status === "loading"} />
      </Faixa>
    </>
  );
}

/** Moldura dos estados (a carregar, erro, não encontrado), com o caminho de volta. */
function Estado({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-texto-suave hover:text-texto">
        <ArrowLeftIcon size={18} aria-hidden="true" /> Dashboard
      </Link>
      {children}
    </div>
  );
}
