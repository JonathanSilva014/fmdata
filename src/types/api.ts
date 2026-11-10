/**
 * Contratos dos endpoints que devolvem dados do Last.fm.
 * Fonte: openapi.json (snapshot local do spec).
 */

/** Reprodução normalizada devolvida por /scrobbles. */
export interface Scrobble {
  track_name: string;
  artist_name: string;
  artist_mbid: string;
  album_name: string;
  album_mbid: string;
  track_mbid: string;
  track_url: string;
  /** 1 quando a faixa está marcada como favorita; 0 caso contrário. */
  loved: number;
  nowplaying: boolean;
  /** Tags separadas por vírgula; pode ser vazio. */
  tags: string;
  /** ISO 8601; null em nowplaying ou data inválida. */
  date_iso: string | null;
  /** Unix timestamp em segundos; null em nowplaying ou data inválida. */
  date_uts: number | null;
  image_url: string | null;
}

/** Perfil completo devolvido por /artist-info. */
export interface ArtistProfile {
  name: string;
  image_url: string;
  /** Tags separadas por vírgula; pode ser vazio. */
  tags: string;
  /** Artistas semelhantes separados por vírgula; pode ser vazio. */
  similar_artists: string;
  bio_summary: string;
  bio_content: string;
  listeners_global: number;
  playcount_global: number;
  user_playcount: number;
  mbid: string;
  url_lastfm: string;
  url_wikipedia: string | null;
  url_musicbrainz: string | null;
  country_origin: string;
  /** Tipo textual devolvido pela API; pode ser vazio. */
  type: string;
  year_formed: string;
}

/** Perfil completo devolvido por /album-info. */
export interface AlbumProfile {
  album_name: string;
  artist_name: string;
  image_url: string;
  track_count: number;
  /** Nomes das faixas separados por ";". */
  tracklist_names: string;
  /** Tags separadas por vírgula; pode ser vazio. */
  tags: string;
  release_date: string;
  album_mbid: string;
  artist_mbid: string;
  listeners_global: number;
  playcount_global: number;
  user_playcount: number;
  url_lastfm: string;
  wiki_summary: string;
}

/** Nome usado no guia de etapas para o perfil de artista. */
export type ArtistInfo = ArtistProfile;

/** Nome usado no guia de etapas para o perfil de álbum. */
export type AlbumInfo = AlbumProfile;

/** Contagem de reproduções numa hora do dia, em UTC. */
export interface HourCount {
  /** Hora do dia em UTC (0–23). */
  hour: number;
  scrobbles: number;
}

/** Resposta de /health. */
export interface HealthResponse {
  status: "ok";
}
