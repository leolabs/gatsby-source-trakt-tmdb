import { createRemoteFileNode } from "gatsby-source-filesystem";

import { getTraktData } from "./trakt-api";
import { getTmdbMetadata, generateImageUrl } from "./tmdb-api";
import { WatchedMovieNode, WatchedShowNode, StatsNode } from "./nodes";
import { Movie } from "./types/tmdb-movie";

interface PluginOptions {
  username: string;
  traktApiKey: string;
  tmdbApiKey?: string;
  language?: string;
}

const referenceRemoteFile = async (
  url: string,
  { cache, createNode, createNodeId, store },
) => {
  const fileNode = await createRemoteFileNode({
    url,
    store,
    cache,
    createNode,
    createNodeId,
  });

  if (fileNode) {
    return { localFile___NODE: fileNode.id };
  }

  return null;
};

const referenceTmdbImage = async (image: string | undefined, helpers) =>
  image ? referenceRemoteFile(generateImageUrl(image), helpers) : null;

export const sourceNodes = async (
  { actions, createNodeId, store, cache, touchNode },
  pluginOptions: PluginOptions,
) => {
  const { createNode } = actions;
  const helpers = { cache, createNode, createNodeId, store, touchNode };

  const { watchedMovies, watchedShows, stats } = await getTraktData(
    pluginOptions.username,
    pluginOptions.traktApiKey,
  );

  createNode(StatsNode(stats));

  await Promise.all([
    ...watchedMovies.map(async movie => {
      if (pluginOptions.tmdbApiKey) {
        const movieMeta = (await getTmdbMetadata(
          "movie",
          movie.movie.ids.tmdb,
          pluginOptions.tmdbApiKey,
          pluginOptions.language,
          cache,
        )) as Movie;

        const enhancedMovieMeta = {
          ...movieMeta,
          poster: await referenceTmdbImage(movieMeta.poster_path, helpers),
          backdrop: await referenceTmdbImage(movieMeta.backdrop_path, helpers),
        };

        const movieNode = WatchedMovieNode({
          ...movie,
          id: movie.movie.ids.trakt,
          tmdb_metadata: enhancedMovieMeta,
        });

        createNode(movieNode);
      } else {
        createNode(
          WatchedMovieNode({
            ...movie,
            id: movie.movie.ids.trakt,
          }),
        );
      }
    }),
    ...watchedShows.map(async show => {
      if (pluginOptions.tmdbApiKey) {
        const showMeta = (await getTmdbMetadata(
          "tv",
          show.show.ids.tmdb,
          pluginOptions.tmdbApiKey,
          pluginOptions.language,
          cache,
        )) as Movie;

        const enhancedShowMeta = {
          ...showMeta,
          poster: await referenceTmdbImage(showMeta.poster_path, helpers),
          backdrop: await referenceTmdbImage(showMeta.backdrop_path, helpers),
        };

        const showNode = WatchedShowNode({
          ...show,
          id: show.show.ids.trakt,
          tmdb_metadata: enhancedShowMeta,
        });

        createNode(showNode);
      } else {
        createNode(
          WatchedShowNode({
            ...show,
            id: show.show.ids.trakt,
          }),
        );
      }
    }),
  ]);

  return;
};
