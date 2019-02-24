import fetch from "node-fetch";
import { MoviePlay } from "./types/trakt-movies";
import { ShowPlay } from "./types/trakt-shows";

const generateUrl = (userName: string, type: "movies" | "shows") =>
  `https://api.trakt.tv/users/${userName}/watched/${type}`;

const generateRequest = async (
  userName: string,
  type: "movies" | "shows",
  apiKey: string,
) => {
  const response = await fetch(generateUrl(userName, type), {
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`${response.statusText}: ${await response.text()}`);
  }

  switch (type) {
    case "movies":
      return (await response.json()) as MoviePlay[];
    case "shows":
      return (await response.json()) as ShowPlay[];
  }
};

export const getWatchedData = async (userName: string, apiKey: string) => {
  const [movies, shows] = await Promise.all([
    generateRequest(userName, "movies", apiKey),
    generateRequest(userName, "shows", apiKey),
  ]);

  return {
    movies: movies as MoviePlay[],
    shows: shows as ShowPlay[],
  };
};
