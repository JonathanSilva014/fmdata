/**
 * store/useStore.ts — store global (Zustand).
 *
 * Resolve os quatro problemas do enunciado:
 *  1. Estado global   → `periodo`, o filtro de todo o dashboard; cada secção pode
 *                       ter uma exceção (`excecoes`), que o filtro global apaga.
 *  2. Cache           → cada pedido fica guardado num `Entry<T>`; se já há
 *                       resposta ("success" ou "not-found"), não se pede outra vez.
 *  3. Persistência    → middleware `persist` em localStorage, com `skipHydration`
 *                       (a reidratação é feita no cliente pelo hook useHydrated).
 *  4. Deduplicação    → pedidos iguais em simultâneo partilham a mesma promessa
 *                       (registo `emCurso`, fora da store).
 *
 * Decisão sobre o que persistir:
 *  O histórico completo tem ~51 700 scrobbles (~25 MB) e o localStorage aguenta
 *  ~5 MB. Por isso no localStorage ficam o período e os perfis (artistas, álbuns,
 *  fotos), que são pequenos; os scrobbles vão para o IndexedDB
 *  (services/armazemLocal.ts), que aguenta o tamanho, e valem durante 1 hora.
 *
 * Os componentes não usam esta store diretamente: usam os hooks de hooks/.
 */
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import type { AlbumInfo, ArtistInfo, Entry, ExcecoesDePeriodo, Periodo, PeriodosPorSeccao, Scrobble, Seccao } from "@/types";
import { normalizarNome, SECCOES } from "@/lib/filters";
import {
  isNotFound,
  mensagemDeErro,
  obterAlbumInfo,
  obterArtistInfo,
  obterImagemArtista,
  obterScrobbles,
} from "@/services/api";
import { guardarScrobbles, lerScrobblesGuardados } from "@/services/armazemLocal";

// ---------------------------------------------------------------------------
// Entry<T>: os estados possíveis de um dado da rede
// ---------------------------------------------------------------------------

const entradaVazia = <T>(): Entry<T> => ({ data: null, status: "idle", error: null, updatedAt: null });
const aCarregar = <T>(anterior?: Entry<T>): Entry<T> => ({
  data: anterior?.data ?? null,
  status: "loading",
  error: null,
  updatedAt: anterior?.updatedAt ?? null,
});
const comSucesso = <T>(data: T): Entry<T> => ({ data, status: "success", error: null, updatedAt: Date.now() });
const naoEncontrado = <T>(): Entry<T> => ({ data: null, status: "not-found", error: null, updatedAt: Date.now() });
const comErro = <T>(erro: unknown): Entry<T> => ({
  data: null,
  status: "error",
  error: mensagemDeErro(erro),
  updatedAt: null,
});

/** Já há resposta definitiva? Então não se volta a pedir (um "error" volta a tentar). */
const temResposta = (e?: Entry<unknown>) => e?.status === "success" || e?.status === "not-found";

// ---------------------------------------------------------------------------
// Chaves da cache: "Adele" e " adele" são o mesmo artista
// ---------------------------------------------------------------------------

export const chaveCacheArtista = (nome: string) => normalizarNome(nome);
export const chaveCacheAlbum = (artista: string, album: string) =>
  `${normalizarNome(artista)}::${normalizarNome(album)}`;

// ---------------------------------------------------------------------------
// Deduplicação: um pedido em curso por chave
// ---------------------------------------------------------------------------

const emCurso = new Map<string, Promise<void>>();

function semDuplicados(chave: string, pedido: () => Promise<void>): Promise<void> {
  const existente = emCurso.get(chave);
  if (existente) return existente;
  const promessa = pedido().finally(() => emCurso.delete(chave));
  emCurso.set(chave, promessa);
  return promessa;
}

// ---------------------------------------------------------------------------
// Forma da store
// ---------------------------------------------------------------------------

export interface StoreState {
  /** Filtro de período de todo o dashboard. */
  periodo: Periodo;
  /** Secções com um período diferente do global (o filtro global apaga-as). */
  excecoes: ExcecoesDePeriodo;
  /** Histórico completo. Só em memória (não persiste: ~25 MB). */
  scrobbles: Entry<Scrobble[]>;
  /** Perfis de artista, por nome normalizado. */
  artistas: Record<string, Entry<ArtistInfo>>;
  /** Perfis de álbum, por "artista::álbum" normalizado. */
  albuns: Record<string, Entry<AlbumInfo>>;
  /** Fotos de artista (top 20 do dashboard), por nome normalizado. */
  imagensArtistas: Record<string, Entry<string | null>>;

  /** Muda o período de TODO o dashboard (e apaga as exceções das secções). */
  setPeriodo: (periodo: Periodo) => void;
  /** Muda só uma secção; igual ao global deixa de ser exceção. */
  setPeriodoDaSeccao: (seccao: Seccao, periodo: Periodo) => void;
  carregarScrobbles: () => Promise<void>;
  carregarArtista: (nome: string) => Promise<void>;
  carregarAlbum: (artista: string, album: string) => Promise<void>;
  carregarImagemArtista: (nome: string) => Promise<void>;
}

/** Os registos de perfis em cache, e o tipo de dado de cada um. */
type Registos = Pick<StoreState, "artistas" | "albuns" | "imagensArtistas">;
type DadoDe<K extends keyof Registos> = Registos[K][string] extends Entry<infer T> ? T : never;

/** Parte da store que vai para o localStorage. */
type EstadoPersistido = Pick<StoreState, "periodo" | "excecoes" | "artistas" | "albuns" | "imagensArtistas">;

/** Só guarda respostas definitivas: nunca "loading" (ficaria preso) nem "error". */
function soRespostas<T>(registo: Record<string, Entry<T>>): Record<string, Entry<T>> {
  return Object.fromEntries(Object.entries(registo).filter(([, e]) => temResposta(e)));
}

/**
 * localStorage "seguro": no servidor (sem window) não faz nada, e se o espaço
 * acabar (QuotaExceededError) a app continua a funcionar, só sem persistir.
 */
const localStorageSeguro: StateStorage = {
  getItem: (nome) => {
    try {
      return typeof window === "undefined" ? null : window.localStorage.getItem(nome);
    } catch {
      return null;
    }
  },
  setItem: (nome, valor) => {
    try {
      if (typeof window !== "undefined") window.localStorage.setItem(nome, valor);
    } catch {
      // Sem espaço ou bloqueado: segue sem persistir.
    }
  },
  removeItem: (nome) => {
    try {
      if (typeof window !== "undefined") window.localStorage.removeItem(nome);
    } catch {
      // ignora
    }
  },
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useStore = create<StoreState>()(
  persist(
    (set, get) => {
      /**
       * Os três registos (artistas, álbuns, fotos) carregam-se da mesma maneira:
       * cache → deduplicação → loading → sucesso / não encontrado / erro.
       */
      function carregarNoRegisto<K extends keyof Registos>(
        campo: K,
        chave: string,
        pedido: () => Promise<DadoDe<K>>,
      ): Promise<void> {
        if (!chave || temResposta(get()[campo][chave])) return Promise.resolve();
        return semDuplicados(`${campo}:${chave}`, async () => {
          const guardar = (entrada: Entry<DadoDe<K>>) =>
            set((s) => ({ [campo]: { ...s[campo], [chave]: entrada } }) as Partial<StoreState>);
          guardar(aCarregar(get()[campo][chave] as Entry<DadoDe<K>> | undefined));
          try {
            guardar(comSucesso(await pedido()));
          } catch (erro) {
            guardar(isNotFound(erro) ? naoEncontrado() : comErro(erro));
          }
        });
      }

      return {
        periodo: "tudo",
        excecoes: {},
        scrobbles: entradaVazia<Scrobble[]>(),
        artistas: {},
        albuns: {},
        imagensArtistas: {},

        setPeriodo: (periodo) => set({ periodo, excecoes: {} }),
        setPeriodoDaSeccao: (seccao, periodo) =>
          set((s) => {
            const excecoes = { ...s.excecoes };
            if (periodo === s.periodo) delete excecoes[seccao];
            else excecoes[seccao] = periodo;
            return { excecoes };
          }),

        carregarScrobbles: () => {
          if (temResposta(get().scrobbles)) return Promise.resolve();
          return semDuplicados("scrobbles", async () => {
            set((s) => ({ scrobbles: aCarregar(s.scrobbles) }));
            // 1.º o IndexedDB: depois de um refresh, o histórico já lá está e não se pede outra vez.
            const guardado = await lerScrobblesGuardados(Date.now());
            if (guardado) {
              set({ scrobbles: { data: guardado.dados, status: "success", error: null, updatedAt: guardado.em } });
              return;
            }
            try {
              const dados = await obterScrobbles();
              const agora = Date.now();
              set({ scrobbles: { data: dados, status: "success", error: null, updatedAt: agora } });
              void guardarScrobbles(dados, agora);
            } catch (erro) {
              set({ scrobbles: comErro<Scrobble[]>(erro) });
            }
          });
        },

        carregarArtista: (nome) =>
          carregarNoRegisto("artistas", chaveCacheArtista(nome), () => obterArtistInfo(nome)),

        carregarAlbum: (artista, album) =>
          carregarNoRegisto("albuns", chaveCacheAlbum(artista, album), () => obterAlbumInfo(artista, album)),

        carregarImagemArtista: (nome) =>
          carregarNoRegisto("imagensArtistas", chaveCacheArtista(nome), () => obterImagemArtista(nome)),
      };
    },
    {
      name: "fmdata",
      // v1: só `periodo`; v2: `periodos`, um por secção; v3: `periodo` global + `excecoes`.
      version: 3,
      migrate: (guardado, versao) => {
        const antigo = (guardado ?? {}) as Partial<EstadoPersistido> & { periodos?: PeriodosPorSeccao };
        if (versao === 2 && antigo.periodos) {
          const { periodos, ...resto } = antigo;
          // O global passa a ser o dos totais; as secções diferentes ficam como exceção.
          const periodo = periodos.totais ?? "tudo";
          const excecoes = Object.fromEntries(SECCOES.filter((s) => periodos[s] !== periodo).map((s) => [s, periodos[s]]));
          return { ...resto, periodo, excecoes } as EstadoPersistido;
        }
        return { ...antigo, periodo: antigo.periodo ?? "tudo", excecoes: antigo.excecoes ?? {} } as EstadoPersistido;
      },
      storage: createJSONStorage<EstadoPersistido>(() => localStorageSeguro),
      skipHydration: true,
      partialize: (s): EstadoPersistido => ({
        periodo: s.periodo,
        excecoes: s.excecoes,
        artistas: soRespostas(s.artistas),
        albuns: soRespostas(s.albuns),
        imagensArtistas: soRespostas(s.imagensArtistas),
      }),
    },
  ),
);
