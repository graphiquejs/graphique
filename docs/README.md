# Graphique Docs

To update Graphique docs, first make sure you've already built the individual packages with `npm run build`, and then generate the necessary inputs that are used in the docs site.

_All should be run from the monorepo's root_.

```sh
npm run docs:generate
```

### Start docs site locally

```sh
npm run docs:start
```

### Linting

```sh
npm run docs:lint
```

### Typecheck

```sh
npm run typecheck:docs
```

### Build

```sh
npm run docs:build
```

### Deploy

The Graphique docs site is deployed using [Vercel](https://vercel.com). Run from the project root.

#### Preview

```sh
vercel ## preview-specific url
```

#### Production

```sh
vercel --prod ## graphique.dev
```
