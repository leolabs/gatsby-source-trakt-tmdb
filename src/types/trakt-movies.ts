export interface Ids {
  trakt: number;
  slug: string;
  imdb: string;
  tmdb: number;
}

export interface Movie {
  title: string;
  year: number;
  ids: Ids;
}

export interface WatchedMovie {
  plays: number;
  last_watched_at: Date;
  last_updated_at: Date;
  movie: Movie;
}

export interface WatchlistMovie {
  rank: number;
  listed_at: Date;
  type: "movie";
  movie: Movie;
}
