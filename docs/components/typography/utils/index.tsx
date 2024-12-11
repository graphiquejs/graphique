import { Code } from 'nextra/components'
import { createHighlighter } from 'shiki'
import Markdown, { Components } from 'react-markdown'
import A from '../A'

// `createHighlighter` is async, it initializes the internal and
// loads the themes and languages specified.
const highlighter = await createHighlighter({
  themes: ['one-dark-pro', 'one-light', 'github-light', 'github-dark'],
  langs: ['tsx'],
})

export const formatCode = (str: string) =>
  highlighter.codeToHtml(str, {
    lang: 'tsx',
    themes: {
      light: 'github-light',
      dark: 'github-dark',
    },
    structure: 'inline',
    defaultColor: false,
  })

export const formatUnion = (types: any[]) => {
  const strings = types
    .map((t) => {
      const isNull = t.value === 'null'
      if (isNull) return t.value

      const isTuple = t.kind === 'tuple'
      if (isTuple) {
        const tupleTypes = t.types.map(({ type }: { type: string }) => type)

        return `[${tupleTypes.join(', ')}]`
      }

      const isLiteral = t.kind === 'literal'
      const val = isLiteral && !Number(t.value) ? `"${t.value}"` : t.value

      return !isNull && t?.value ? val : t.type ?? t.name
    })
    .sort((a, b) => (a && b && a < b ? 1 : -1))
    .sort((a) => (a === 'Date' ? -1 : 1))
    .sort((a) => (a === 'null' ? 1 : -1))
    .sort((_, b) => (b === 'undefined' ? -1 : 1))
    .join(' | ')
  return strings
}

interface FunctionProps {
  data: any
  shouldFormat?: boolean
  exclude?: string
}

export const formatFunctionType = ({
  data,
  shouldFormat = false,
  exclude,
}: FunctionProps) => {
  let rawLabel: string
  const signature = data?.signatures?.[0] ?? data.type.signatures[0]
  const name = data?.name ?? signature.name

  const returnType =
    signature.returnType.kind === 'union'
      ? formatUnion(signature.returnType.types)
      : signature.returnType.name ?? signature.returnType.type ?? ''

  if (signature?.parameters?.length === 0) {
    rawLabel = `() => ${returnType}`
  } else {
    const params = signature.parameters.map((p: any) => {
      const isArray = p?.type?.kind === 'array' && p.type.type
      const isUnion = p?.type?.kind === 'union' && p.type.types

      const parameterName = (
        p?.name === '__namedParameters' ? 'props' : p?.name ?? ''
      ).replace(`${exclude}.`, '')

      let parameterType: string

      if (isArray)
        parameterType = `${(p.type.type.name ?? p.type.type.type)?.replace(
          `${exclude}.`,
          '',
        )}[]`
      else if (isUnion) parameterType = formatUnion(p.type.types)
      else
        parameterType =
          p?.type?.name?.replace(`${exclude}.`, '') ?? p?.type?.type ?? ''

      return `${parameterName}: ${parameterType}`
    })

    rawLabel = `(${params.join(', ')}) => ${returnType}`
  }

  return {
    name,
    type: {
      label: shouldFormat ? formatCode(rawLabel) : rawLabel,
    },
  }
}

export const formatTuple = (types: any[]) =>
  `[${types.map((t: any) => t.type).join(', ')}]`

interface Description {
  description: string | null
  typeLabel?: string
}

export const formatPropertyDescription = ({
  description,
  typeLabel,
}: Description) => (
  <>
    <Markdown components={{ a: A } as Components}>{description}</Markdown>
    {typeLabel && (
      <div style={{ marginTop: '0.45rem', fontSize: '0.95rem' }}>
        <Code
          dangerouslySetInnerHTML={{
            __html: formatCode(typeLabel),
          }}
        />
      </div>
    )}
  </>
)
