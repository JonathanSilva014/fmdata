import type { Scrobble } from "@/types";
import { formatarDataHora, parseDataScrobble } from "@/lib/dates";
import { Bloco } from "@/components/ui/Bloco";
import { HistoryIcon } from "@solar-icons/react/linear/history";

/** Últimas 10 reproduções: da mais recente para a mais antiga, com faixa e data. */
export function UltimasAudicoes({ audicoes }: { audicoes: Scrobble[] }) {
  return (
    <Bloco titulo="Últimas 10 reproduções" icone={<HistoryIcon size={20} />} descricao="O teu histórico recente com este artista.">
      <ol className="divide-y divide-borda">
        {audicoes.map((s) => {
          const data = parseDataScrobble(s);
          return (
            <li key={`${s.date_uts}-${s.track_name}`} className="flex items-baseline justify-between gap-4 py-2.5">
              <span className="min-w-0 truncate font-semibold">{s.track_name}</span>
              {data && (
                <time dateTime={data.toISOString()} className="shrink-0 text-sm tabular-nums text-texto-suave">
                  {formatarDataHora(data)}
                </time>
              )}
            </li>
          );
        })}
      </ol>
    </Bloco>
  );
}
