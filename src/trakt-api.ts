import fetch from 'node-fetch';

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

export const getTraktData = async (userName: string, apiKey: string) => {
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

  return {
    watchedMovies: watchedMovies as WatchedMovie[],
    watchedShows: watchedShows as WatchedShow[],
    watchlistMovies: watchlistMovies as WatchlistMovie[],
    watchlistShows: watchlistShows as WatchlistShow[],
    stats: stats as Stats,
  };
};
