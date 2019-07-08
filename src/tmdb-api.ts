import fetch from 'node-fetch';

import { Movie } from './types/tmdb-movie';
import { TvShow } from './types/tmdb-tv-show';

const timeout = ms => new Promise(res => setTimeout(res, ms));

export const generateImageUrl = (image: string) =>
  `https://image.tmdb.org/t/p/original/${image.replace(/^\//, '')}`;

export const getTmdbMetadata = async (
  type: 'movie' | 'tv',
  id: number,
  apiKey: string,
  language?: string,
  cache?: any,
  tries: number = 5,
): Promise<Movie | TvShow> => {
  const url = new URL(`https://api.themoviedb.org/3/${type}/${id}`);
  url.searchParams.append('api_key', apiKey);

  if (language) {
    url.searchParams.append('language', language);
  }

  const cacheKey = `tmdb-${type}-${id}`;

  // Sometimes, cache.get is not a function for whatever reason.
  // In those cases, we just skip the caching.
  if (cache && typeof cache.get === 'function') {
    const cachedResult = await cache.get(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }
  }

  const result = await fetch(String(url), {
    timeout: 10000,
  });

  if (!result.ok) {
    if (result.status === 429 && tries > 0) {
      const retry = Number(result.headers.get('retry-after')) + 1;
      console.log(
        `[TMDB ${type}/${id}] Too many requests, retrying in ${retry} seconds...`,
      );
      await timeout(retry * 1000);
    }

    throw new Error(
      `[TMDB ${type}/${id}] ${result.statusText}: ${await result.text()}`,
    );
  }

  const data = await result.json();

  if (cache && typeof cache.set === 'function') {
    cache.set(cacheKey, data);
  }

  switch (type) {
    case 'movie':
      return data as Movie;
    case 'tv':
      return data as TvShow;
  }
};
