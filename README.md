<div align="center">
  <a href="https://graphique.dev">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./assets/graphique_logo_dark_bg.png">
      <img alt="Graphique logo" src="./assets/graphique_logo_light_bg.png" width=300px />
      </picture>
  </a>
  <p>
  An interactive visualization system for React based on the Grammar of Graphics
  </p>
</div>

<hr />

## Graphique

Graphique allows you to create flexible and reusable interactive visualizations in a structured way by:

- mapping data properties to visual properties — using _aesthetics_ specified by scales (how to draw)
- composing or layering relatively simple graphical objects or geometries (what to draw)
- using reasonable defaults that can be configured with components for flexibility
- updating based on changes in your UI's state

## Examples/Docs

Examples and docs are available at https://graphique.dev.

## Development

<details>

<summary style="font-weight: bold">Get started with local development</summary>

<br />

To start working on Graphique, first install the necessary dependencies for the monorepo.

```sh
npm install
```

Then build the individual packages.

```sh
npm run build
```

### Testing

```sh
npm test
```

#### Run only some tests

For example, you can also choose to run only some tests with things like:

```sh
# run only GeomLine tests
npm test GeomLine

# run only Tooltip tests (multiple Geoms)
npm test Tooltip
```

### Demo local packages

For a development sandbox / place to try out new package changes locally, there's a Vite app in `./demo`.

You can start the demo app with:

```sh
npm run demo
```

### Publishing and releasing

Use `npm run release` to publish and release new version(s) of package(s).

</details>
