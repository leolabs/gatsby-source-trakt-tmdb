export interface Movies {
  plays: number;
  watched: number;
  minutes: number;
  collected: number;
  ratings: number;
  comments: number;
}

export interface Shows {
  watched: number;
  collected: number;
  ratings: number;
  comments: number;
}

export interface Seasons {
  ratings: number;
  comments: number;
}

export interface Episodes {
  plays: number;
  watched: number;
  minutes: number;
  collected: number;
  ratings: number;
  comments: number;
}

export interface Network {
  friends: number;
  followers: number;
  following: number;
}

export interface Distribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  6: number;
  7: number;
  8: number;
  9: number;
  10: number;
}

export interface Ratings {
  total: number;
  distribution: Distribution;
}

export interface Stats {
  movies: Movies;
  shows: Shows;
  seasons: Seasons;
  episodes: Episodes;
  network: Network;
  ratings: Ratings;
}
