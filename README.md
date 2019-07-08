# gatsby-source-trakt-tmdb

This source plugin for Gatsby fetches personal statistics from
[Trakt.tv](https://trakt.tv) and optionally enhances them with
metadata from [TMDB](https://tmdb.org). This can be used to
display a list of watched movies and series with their respective
posters.

gatsby-source-trakt-tmdb is compatible with [gatsby-image](https://www.gatsbyjs.org/packages/gatsby-image/)
so you can easily optimize posters and backdrop images during build time.

## Configuration

To use this plugin, you have to obtain API keys for Trakt.tv and TMDB:

- [Create an API key for Trakt.tv](https://trakt.tv/oauth/applications/new)
- [Create an API key for TMDB](https://www.themoviedb.org/settings/api)

```javascript
{
  resolve: `gatsby-source-trakt-tmdb`,
  options: {
    traktApiKey: "TRAKT_API_KEY",
    username: "YOUR_TRAKT_USERNAME",
    tmdbApiKey: "TMDB_API_KEY", // optional, to fetch metadata
    language: "en-US" // optional, language for metadata (e.g. titles)
    limit: 10 // optional, number of items to fetch per category
  },
},
```

Try to keep the limit below or at 10 items per category (40 items in total) to avoid
rate-limits by TMDb. Limit can also be an object providing individual limits for each
Trakt category:

```javascript
{
  limit: {
    watchedMovies: 6,
    watchedShows: 6,
    watchlistMovies: 6,
    watchlistShows: 6,
  },
}
```

## Contributing

As this is my first source plugin for Gatsby, I think it has
room for improvement. If you're interested in contributing,
please feel free to open a pull request.
