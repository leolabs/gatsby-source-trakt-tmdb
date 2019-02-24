import createNodeHelpers from "gatsby-node-helpers";
import { WatchedMovie } from "./types/trakt-movies";
import { WatchedShow } from "./types/trakt-shows";

const { createNodeFactory } = createNodeHelpers({
  typePrefix: "Trakt",
});

const tryParseDate = (input: string | number | Date) => {
  const date = new Date(input);
  return !isNaN(date.getTime()) ? date : null;
};

export const WatchedMovieNode = createNodeFactory(
  "WatchedMovie",
  (node: WatchedMovie) => ({
    ...node,
    last_watched_at: tryParseDate(node.last_watched_at),
    last_updated_at: tryParseDate(node.last_updated_at),
  }),
);

export const WatchedShowNode = createNodeFactory(
  "WatchedShow",
  (node: WatchedShow) => ({
    ...node,
    last_watched_at: tryParseDate(node.last_watched_at),
    last_updated_at: tryParseDate(node.last_updated_at),
  }),
);

export const StatsNode = createNodeFactory("Stats", (node: WatchedShow) => ({
  ...node,
  last_watched_at: tryParseDate(node.last_watched_at),
  last_updated_at: tryParseDate(node.last_updated_at),
}));
