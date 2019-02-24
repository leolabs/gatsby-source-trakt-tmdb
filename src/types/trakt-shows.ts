export interface Ids {
  trakt: number;
  slug: string;
  tvdb: number;
  imdb: string;
  tmdb: number;
  tvrage?: number;
}

export interface Show {
  title: string;
  year: number;
  ids: Ids;
}

export interface Episode {
  number: number;
  plays: number;
  last_watched_at: Date;
}

export interface Season {
  number: number;
  episodes: Episode[];
}

export interface WatchedShow {
  plays: number;
  last_watched_at: Date;
  last_updated_at: Date;
  show: Show;
  seasons: Season[];
}

export interface WatchlistShow {
  rank: number;
  listed_at: Date;
  type: 'show';
  show: Show;
}
