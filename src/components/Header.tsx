
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full border-b border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-2xl">
            ♫
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              fm<span className="text-violet-400">data</span>
            </h1>

            <p className="hidden text-xs text-slate-400 sm:block">
              Music Analytics
            </p>
          </div>
        </Link>

        {/* Navegação */}
        <nav
          aria-label="Navegação principal"
          className="flex items-center gap-6"
        >
          <Link
            href="/"
            className="text-sm font-medium text-violet-400 transition-colors hover:text-violet-300"
          >
            Dashboard
          </Link>

          {/* Avatar */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold">
            FM
          </div>
        </nav>

      </div>
    </header>
  );
}
