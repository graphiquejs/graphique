# Graphique Demo

This an included Vite app to use as a Graphique development sandbox / place to try out new package changes locally.

### Starting

Make sure you've already built the monorepo's individual packages with `npm run build`.

Then you can start the demo app from the monorepo root with:

```sh
npm run demo
```

### Watch for changes

It's useful to watch for changes to in-development packages with:

```sh
npm run watch -w @graphique/<package>
```

and the local demo app should hot reload with your changes applied.
