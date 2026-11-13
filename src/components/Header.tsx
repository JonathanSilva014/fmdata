import Link from "next/link";
import { HeadphonesRoundSoundIcon } from "@solar-icons/react/bold/headphones-round-sound";

/**
 * Cabeçalho comum a todas as páginas: o logótipo, que leva ao dashboard.
 * - Ícone Solar de auscultadores com som num anel vermelho (skills solar-icons e
 *   impeccable: ícones de uma biblioteca real, nunca caracteres ou emoji).
 * - Fundo transparente e altura fixa (--altura-cabecalho): no dashboard, o papel
 *   quadriculado do topo passa por baixo do cabeçalho.
 * - O logótipo não é <h1>: cada página tem o seu próprio título principal.
 */
export default function Header() {
  return (
    <header className="relative z-10 w-full">
      <div className="mx-auto flex h-(--altura-cabecalho) max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="fmdata — ir para o dashboard" className="flex min-h-11 shrink-0 items-center gap-2.5">
          <span className="flex size-11 items-center justify-center rounded-full border-[3px] border-destaque bg-superficie text-destaque shadow-[0_0_14px_rgb(200_30_38/0.3)]">
            <HeadphonesRoundSoundIcon size={22} />
          </span>
          <span className="font-display text-2xl font-black italic text-destaque [font-stretch:125%]">fmdata.</span>
        </Link>
        <span aria-hidden="true" className="h-px flex-1 bg-destaque/70" />
        <span className="hidden shrink-0 text-[11px] font-bold tracking-[0.2em] text-destaque uppercase sm:block">
          Análise do teu Last.fm
        </span>
      </div>
    </header>
  );
}
