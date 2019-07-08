import fetch from 'node-fetch';

import { Limits } from './gatsby-node';
import { WatchedMovie, WatchlistMovie } from './types/trakt-movies';
import { WatchedShow, WatchlistShow } from './types/trakt-shows';
import { Stats } from './types/trakt-stats';

const traktFetch = async (url: string, apiKey: string) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-version': '2',
      'trakt-api-key': apiKey,
    },
    timeout: 10000,
  });

  if (!response.ok) {
    throw new Error(
      `[${url}] ${response.statusText}: ${await response.text()}`,
    );
  }

  return response.json();
};

const generateUserUrl = (userName: string) =>
  `https://api.trakt.tv/users/${userName}`;

const generateRequest = async (
  userName: string,
  category: 'watched' | 'watchlist',
  type: 'movies' | 'shows',
  apiKey: string,
) => {
  return traktFetch(`${generateUserUrl(userName)}/${category}/${type}`, apiKey);
};

export const getStatsData = async (userName: string, apiKey: string) => {
  const response = await traktFetch(
    `${generateUserUrl(userName)}/stats`,
    apiKey,
  );
  return response as Stats;
};

export const getTraktData = async (
  userName: string,
  apiKey: string,
  limit: number | Limits = 10,
) => {
  const [
    watchedMovies,
    watchedShows,
    watchlistMovies,
    watchlistShows,
    stats,
  ] = await Promise.all([
    generateRequest(userName, 'watched', 'movies', apiKey),
    generateRequest(userName, 'watched', 'shows', apiKey),
    generateRequest(userName, 'watchlist', 'movies', apiKey),
    generateRequest(userName, 'watchlist', 'shows', apiKey),
    getStatsData(userName, apiKey),
  ]);

  const getLimit = (key: keyof Limits) =>
    typeof limit === 'number'
      ? limit
      : limit && limit.hasOwnProperty(key)
      ? limit[key]
      : undefined;

  const getFirst = (
    type: keyof Limits,
    content:
      | WatchedMovie[]
      | WatchedShow[]
      | WatchlistMovie[]
      | WatchlistShow[],
  ) => {
    if (content.length === 0) {
      return [];
    }

    const typeLimit = getLimit(type);

    if (!typeLimit) {
      return content;
    }

    if (type === 'watchedMovies' || type === 'watchedShows') {
      return content
        .sort(
          (a, b) =>
            new Date(b.last_watched_at).getTime() -
            new Date(a.last_watched_at).getTime(),
        )
        .slice(0);
    }

    if (type === 'watchlistMovies' || type === 'watchlistShows') {
      return content
        .sort(
          (a, b) =>
            new Date(b.listed_at).getTime() - new Date(a.listed_at).getTime(),
        )
        .slice(0, typeLimit);
    }
  };

  return {
    watchedMovies: getFirst('watchedMovies', watchedMovies) as WatchedMovie[],
    watchedShows: getFirst('watchedShows', watchedShows) as WatchedShow[],
    watchlistMovies: getFirst(
      'watchlistMovies',
      watchlistMovies,
    ) as WatchlistMovie[],
    watchlistShows: getFirst(
      'watchlistShows',
      watchlistShows,
    ) as WatchlistShow[],
    stats: stats as Stats,
  };
};
