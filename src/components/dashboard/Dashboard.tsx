"use client";

/**
 * Dashboard — visão global de tudo o que ouviste.
 * Responde às 4 perguntas do enunciado: quem ouves mais, o que ouves mais,
 * quando ouves e que género domina; e mostra a análise única.
 *
 * Cada secção tem o seu filtro de período (no cabeçalho), guardado no store
 * como exceção ao período global (`periodo`).
 * useFiltrados devolve as reproduções de cada secção já filtradas, e os cálculos
 * vêm das funções puras de lib/, dentro de useMemo (um por secção).
 */
import { useMemo } from "react";
import type { Seccao } from "@/types";
import { ClockCircleIcon } from "@solar-icons/react/linear/clock-circle";
import { formatarDataHora, formatarHora } from "@/lib/dates";
import {
  generoMaisOuvido,
  horaDePico,
  scrobblesPorHora,
  topAlbuns,
  topArtistas,
  topMusicas,
  totalArtistasDistintos,
  totalScrobbles,
} from "@/lib/stats";
import { artistasDeMomento } from "@/lib/analise";
import { useFiltrados } from "@/hooks/useFiltrados";
import { usePeriodoDasSeccoes } from "@/hooks/usePeriodo";
import { Bloco } from "@/components/ui/Bloco";
import { Faixa } from "@/components/ui/Faixa";
import { EstadoCarregar, EstadoErro, EstadoVazio, VazioDoPeriodo } from "@/components/ui/Estados";
import { GraficoHoras } from "@/components/graficos/GraficoHoras";
import { FiltroPeriodo, OPCOES_PERIODO } from "./FiltroPeriodo";
import { Destaque } from "./Destaque";
import { Palco } from "./Palco";
import { TopArtistas } from "./TopArtistas";
import { TopMusicas } from "./TopMusicas";
import { TopAlbuns } from "./TopAlbuns";
import { AnaliseUnica } from "./AnaliseUnica";

export default function Dashboard() {
  const { porSeccao, todos, referencia, status, error, recarregar } = useFiltrados();
  const { periodos, setPeriodoDaSeccao } = usePeriodoDasSeccoes();

  const totais = useMemo(() => {
    const lista = porSeccao.totais;
    return {
      audicoes: totalScrobbles(lista),
      artistas: totalArtistasDistintos(lista),
      genero: generoMaisOuvido(lista),
      pico: horaDePico(scrobblesPorHora(lista)),
    };
  }, [porSeccao.totais]);
  const artistas = useMemo(() => topArtistas(porSeccao.artistas, 20), [porSeccao.artistas]);
  const horas = useMemo(() => {
    const porHora = scrobblesPorHora(porSeccao.horas);
    return { porHora, pico: horaDePico(porHora), total: porSeccao.horas.length };
  }, [porSeccao.horas]);
  const musicas = useMemo(() => topMusicas(porSeccao.musicas, 10), [porSeccao.musicas]);
  const albuns = useMemo(() => topAlbuns(porSeccao.albuns, 8), [porSeccao.albuns]);
  const analise = useMemo(() => artistasDeMomento(porSeccao.analise), [porSeccao.analise]);

  const frase = (s: Seccao) => OPCOES_PERIODO.find((o) => o.valor === periodos[s])?.frase ?? "";
  const filtro = (s: Seccao, nome: string) => (
    <FiltroPeriodo periodo={periodos[s]} onMudar={(p) => setPeriodoDaSeccao(s, p)} seccao={nome} />
  );

  const pronto = status === "success" && todos.length > 0;

  return (
    <>
      <Destaque
        subtitulo={
          referencia
            ? `O teu histórico de reproduções. Períodos contados a partir da última reprodução: ${formatarDataHora(referencia)}.`
            : "O teu histórico de reproduções."
        }
      />

      {status === "loading" && (
        <Faixa>
          <EstadoCarregar mensagem="A carregar o histórico de reproduções… Da primeira vez pode demorar até um minuto." />
        </Faixa>
      )}

      {status === "error" && (
        <Faixa>
          <EstadoErro titulo="Não foi possível carregar o histórico" mensagem={error} onTentar={recarregar} />
        </Faixa>
      )}

      {status === "success" && todos.length === 0 && (
        <Faixa>
          <EstadoVazio titulo="Ainda não há reproduções">O teu histórico do Last.fm está vazio.</EstadoVazio>
        </Faixa>
      )}

      {pronto && (
        <>
          <Palco
            audicoes={totais.audicoes}
            artistas={totais.artistas}
            genero={totais.genero}
            pico={totais.pico}
            fraseDoPeriodo={frase("totais")}
            filtro={filtro("totais", "totais")}
          />

          <Faixa>
            <TopArtistas itens={artistas} filtro={filtro("artistas", "Top 20 artistas")} />
          </Faixa>

          <Faixa fundo="rosa">
            <Bloco
              titulo="A que horas ouves"
              icone={<ClockCircleIcon size={22} />}
              descricao={`24 horas (0–23 UTC).${horas.pico !== null ? ` Hora de maior escuta: ${formatarHora(horas.pico)}.` : ""}`}
              variante="separador"
              filtro={filtro("horas", "A que horas ouves")}
            >
              {horas.total === 0 ? (
                <VazioDoPeriodo />
              ) : (
                <GraficoHoras
                  porHora={horas.porHora}
                  pico={horas.pico}
                  altura={280}
                  descricao={`Reproduções por hora do dia em UTC${horas.pico !== null ? `; mais reproduções às ${formatarHora(horas.pico)}` : ""}`}
                />
              )}
            </Bloco>
          </Faixa>

          <Faixa className="space-y-10">
            <TopMusicas itens={musicas} filtro={filtro("musicas", "Top 10 músicas")} />
            <TopAlbuns itens={albuns} filtro={filtro("albuns", "Top 8 álbuns")} />
            <AnaliseUnica itens={analise} filtro={filtro("analise", "análise única")} />
          </Faixa>
        </>
      )}
    </>
  );
}
