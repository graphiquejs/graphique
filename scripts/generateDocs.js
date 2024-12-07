// @ts-check

import { readdir } from 'fs/promises'
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'

process.env.NODE_NO_WARNINGS = '1'

const startingDir = process.cwd()

const exclude = []
const excludeBuild = ['datasets']

const listPackages = async () =>
  (await readdir('./packages', { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory() && !exclude.includes(dirent.name))
    .map((dirent) => dirent.name)

const packages = await listPackages()

packages.forEach((p) => {
  process.chdir(`./packages/${p}`)
  console.log(`\n📦 Generating docs for @graphique/${p}...\n`)

  const docsInputDir = `../../docs/input/${p}`
  mkdirSync(`${docsInputDir}/build`, { recursive: true })

  execSync(`npx typedoc-json-parser`)
  console.log("✅ Extracting and parsing API's typedoc comments")

  execSync(`npx quicktype ${docsInputDir}/api.json -o ${docsInputDir}/api.ts`)
  console.log('✅ Generated doc types for API')

  copyFileSync('README.md', `${docsInputDir}/README.mdx`)
  console.log('✅ Copied README for docs')

  if (!excludeBuild.includes(p)) {
    copyFileSync('dist/index.js', `${docsInputDir}/build/index.js`)
    console.log('✅ Copied package build artifacts for docs')

    const dts = readFileSync('dist/index.d.ts', {
      encoding: 'utf-8',
    }).replaceAll('`', '\\`')

    writeFileSync(`${docsInputDir}/build/dts.ts`, `export default \`${dts}\`;`)

    const pkgJson = JSON.parse(
      readFileSync('package.json', { encoding: 'utf-8' }),
    )

    const { dependencies } = pkgJson

    writeFileSync(
      `${docsInputDir}/build/dependencies.ts`,
      `export default ${JSON.stringify(dependencies, null, 2)};`,
    )
  }

  process.chdir(startingDir)
})
