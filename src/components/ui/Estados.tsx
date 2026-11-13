import type { ReactNode } from "react";
import { DangerTriangleIcon } from "@solar-icons/react/linear/danger-triangle";
import { RefreshIcon } from "@solar-icons/react/linear/refresh";
import { MusicLibraryIcon } from "@solar-icons/react/linear/music-library";

/** A carregar: anunciado aos leitores de ecrã, com uma barra animada discreta. */
export function EstadoCarregar({ mensagem }: { mensagem: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-3 py-16 text-center text-texto-suave">
      <div className="h-1 w-40 overflow-hidden rounded-full bg-superficie-alta">
        <div className="h-full w-1/3 animate-pulse rounded-full bg-destaque" />
      </div>
      <p className="max-w-md text-sm">{mensagem}</p>
    </div>
  );
}

/** Erro: diz o que falhou e oferece a recuperação. */
export function EstadoErro({ titulo, mensagem, onTentar }: { titulo: string; mensagem: string | null; onTentar?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-16 text-center">
      <DangerTriangleIcon size={32} className="text-perigo" />
      <p className="font-semibold">{titulo}</p>
      {mensagem && <p className="max-w-md text-sm text-texto-suave">{mensagem}</p>}
      {onTentar && (
        <button
          type="button"
          onClick={onTentar}
          className="mt-1 inline-flex items-center gap-2 bg-destaque-forte px-4 py-2 text-sm font-semibold text-sobre-destaque transition-colors hover:bg-destaque-claro"
        >
          <RefreshIcon size={18} /> Tentar de novo
        </button>
      )}
    </div>
  );
}

/** Vazio: explica porquê e o que fazer. */
export function EstadoVazio({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <MusicLibraryIcon size={32} className="text-texto-suave" />
      <p className="font-semibold">{titulo}</p>
      {children && <div className="max-w-md text-sm text-texto-suave">{children}</div>}
    </div>
  );
}

/** Secção sem reproduções no período que escolheu (cada secção tem o seu filtro). */
export function VazioDoPeriodo() {
  return <EstadoVazio titulo="Sem reproduções neste período">Escolhe um período maior no filtro desta secção.</EstadoVazio>;
}
