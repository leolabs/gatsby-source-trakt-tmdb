import { createRemoteFileNode } from 'gatsby-source-filesystem';

import { getTraktData } from './trakt-api';
import { getTmdbMetadata, generateImageUrl } from './tmdb-api';
import {
  WatchedMovieNode,
  WatchedShowNode,
  StatsNode,
  WatchlistMovieNode,
  WatchlistShowNode,
} from './nodes';
import { Movie } from './types/tmdb-movie';
import { WatchlistMovie, WatchedMovie } from './types/trakt-movies';
import { WatchedShow, WatchlistShow } from './types/trakt-shows';

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

const createMovieNode = async (
  nodeType: typeof WatchedMovieNode | typeof WatchlistMovieNode,
  movie: WatchlistMovie | WatchedMovie,
  helpers,
  pluginOptions: PluginOptions,
) => {
  if (pluginOptions.tmdbApiKey) {
    const movieMeta = (await getTmdbMetadata(
      'movie',
      movie.movie.ids.tmdb,
      pluginOptions.tmdbApiKey,
      pluginOptions.language,
      helpers.cache,
    )) as Movie;

    const enhancedMovieMeta = {
      ...movieMeta,
      poster: await referenceTmdbImage(movieMeta.poster_path, helpers),
      backdrop: await referenceTmdbImage(movieMeta.backdrop_path, helpers),
    };

    const movieNode = nodeType({
      ...movie,
      id: movie.movie.ids.trakt,
      tmdb_metadata: enhancedMovieMeta,
    });

    helpers.createNode(movieNode);
  } else {
    helpers.createNode(
      nodeType({
        ...movie,
        id: movie.movie.ids.trakt,
      }),
    );
  }
};

const createShowNode = async (
  nodeType: typeof WatchedShowNode | typeof WatchlistShowNode,
  show: WatchlistShow | WatchedShow,
  helpers,
  pluginOptions: PluginOptions,
) => {
  if (pluginOptions.tmdbApiKey) {
    const showMeta = (await getTmdbMetadata(
      'tv',
      show.show.ids.tmdb,
      pluginOptions.tmdbApiKey,
      pluginOptions.language,
      helpers.cache,
    )) as Movie;

    const enhancedShowMeta = {
      ...showMeta,
      poster: await referenceTmdbImage(showMeta.poster_path, helpers),
      backdrop: await referenceTmdbImage(showMeta.backdrop_path, helpers),
    };

    const showNode = nodeType({
      ...show,
      id: show.show.ids.trakt,
      tmdb_metadata: enhancedShowMeta,
    });

    helpers.createNode(showNode);
  } else {
    helpers.createNode(
      nodeType({
        ...show,
        id: show.show.ids.trakt,
      }),
    );
  }
};

export const sourceNodes = async (
  { actions, createNodeId, store, cache, touchNode },
  pluginOptions: PluginOptions,
) => {
  const { createNode } = actions;
  const helpers = { cache, createNode, createNodeId, store, touchNode };

  const {
    watchedMovies,
    watchedShows,
    watchlistMovies,
    watchlistShows,
    stats,
  } = await getTraktData(pluginOptions.username, pluginOptions.traktApiKey);

  createNode(StatsNode(stats));

  await Promise.all([
    ...watchedMovies.map(movie =>
      createMovieNode(WatchedMovieNode, movie, helpers, pluginOptions),
    ),
    ...watchedShows.map(async show =>
      createShowNode(WatchedShowNode, show, helpers, pluginOptions),
    ),
    ...watchlistMovies.map(movie =>
      createMovieNode(WatchlistMovieNode, movie, helpers, pluginOptions),
    ),
    ...watchlistShows.map(async show =>
      createShowNode(WatchlistShowNode, show, helpers, pluginOptions),
    ),
  ]);

  return;
};
