"use client";

/**
 * Scrobbles por mês (página do artista): área com a evolução ao longo do tempo.
 * Os meses sem reproduções já vêm a 0 de scrobblesPorMes(), por isso a linha
 * não "salta" períodos.
 */
import { useId } from "react";
import { Area, AreaChart, Tooltip, XAxis, YAxis } from "recharts";
import type { PontoMensal } from "@/types";
import { formatarMes } from "@/lib/dates";
import { formatarNumero } from "@/lib/formatar";
import { dica, eixo } from "./estilo";

export function GraficoMeses({ pontos, descricao }: { pontos: PontoMensal[]; descricao: string }) {
  const gradiente = `grad-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    // A cor vem de `text-destaque` através de currentColor (válido em atributos SVG).
    <div className="text-destaque">
      <AreaChart data={pontos} responsive width="100%" height={220} role="img" aria-label={descricao} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradiente} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity={0.35} />
            <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="mes" tickFormatter={formatarMes} minTickGap={28} {...eixo} />
        <YAxis width={48} allowDecimals={false} tickFormatter={formatarNumero} {...eixo} />
        <Tooltip
          {...dica}
          cursor={{ className: "stroke-borda" }}
          labelFormatter={(mes) => formatarMes(String(mes))}
          formatter={(valor) => [formatarNumero(Number(valor)), "Reproduções"]}
        />
        <Area
          type="monotone"
          dataKey="contagem"
          stroke="currentColor"
          strokeWidth={2}
          fill={`url(#${gradiente})`}
          dot={pontos.length < 3}
        />
      </AreaChart>
    </div>
  );
}
