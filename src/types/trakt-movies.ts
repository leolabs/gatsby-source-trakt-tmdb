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

export interface MoviePlay {
  plays: number;
  last_watched_at: Date;
  last_updated_at: Date;
  movie: Movie;
}
