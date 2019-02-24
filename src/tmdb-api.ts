import fetch from "node-fetch";
import { Movie } from "./types/tmdb-movie";
import { TvShow } from "./types/tmdb-tv-show";

const timeout = ms => new Promise(res => setTimeout(res, ms));

export const generateImageUrl = (image: string) =>
  `https://image.tmdb.org/t/p/original/${image.replace(/^\//, "")}`;

export const getTmdbMetadata = async (
  type: "movie" | "tv",
  id: number,
  apiKey: string,
  language?: string,
  cache?: any,
  tries: number = 5,
): Promise<Movie | TvShow> => {
  const url = new URL(`https://api.themoviedb.org/3/${type}/${id}`);
  url.searchParams.append("api_key", apiKey);

  if (language) {
    url.searchParams.append("language", language);
  }

  const cacheKey = `tmdb-${type}-${id}`;

  if (cache) {
    const cachedResult = await cache.get(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }
  }

  const result = await fetch(String(url));

  if (!result.ok) {
    if (result.status === 429 && tries > 0) {
      const retry = Number(result.headers["X-RateLimit-Reset"]);
      console.log(`[TMDB ${type}/${id}] Retrying in a few seconds...`);
      await timeout((retry - Date.now()) * 1000);
      return getTmdbMetadata(type, id, apiKey, language, tries - 1);
    }

    throw new Error(
      `[TMDB ${type}/${id}] ${result.statusText}: ${await result.text()}`,
    );
  }

  const data = await result.json();

  if (cache) {
    cache.set(cacheKey, data);
  }

  switch (type) {
    case "movie":
      return data as Movie;
    case "tv":
      return data as TvShow;
  }
};
