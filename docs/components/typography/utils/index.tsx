import { Code } from 'nextra/components';
import { createHighlighter } from 'shiki';
import Markdown from 'react-markdown';
import { TypeElement } from '#/input/datasets/api';
import { TypeArgument } from '#/input/graphique/api';

// `createHighlighter` is async, it initializes the internal and
// loads the themes and languages specified.
const highlighter = await createHighlighter({
  themes: ['one-dark-pro', 'one-light', 'github-light', 'github-dark'],
  langs: ['tsx'],
});

export const formatCode = (str: string) => highlighter.codeToHtml(str, {
  lang: 'tsx',
  themes: {
    light: 'github-light',
    dark: 'github-dark',
  },
  structure: 'inline',
  defaultColor: false,
});

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
  const signature = data?.signatures?.[0] ?? data.type.signatures[0];
  const name = data?.name ?? signature.name;

  const parameter = signature.parameters[0];
  const parameterName = (
    parameter.name === '__namedParameters' ? 'props' : parameter.name
  ).replace(`${exclude}.`, '');
  const parameterType = parameter.type.name.replace(`${exclude}.`, '');

  const returnType = signature.returnType.kind === 'union'
    ? formatUnion(signature.returnType.types)
    : signature.returnType.name ?? signature.returnType.type ?? '';

  const rawLabel = `(${parameterName}: ${parameterType}) => ${returnType}`;

  return {
    name,
    type: {
      label: shouldFormat ? formatCode(rawLabel) : rawLabel,
    },
  };
};

export const formatUnion = (types: any[]) => {
  const strings = types
    .map((t) => {
      const isNull = t.value === 'null';

      if (isNull) return t.value;

      return !isNull && t?.value ? `"${t.value}"` : t.type ?? t.name;
    })
    .sort((a, b) => (a && b && a < b ? 1 : -1))
    .sort((a) => (a === 'Date' ? -1 : 1))
    .sort((a) => (a === 'null' ? 1 : -1))
    .sort((_, b) => (b === 'undefined' ? -1 : 1))
    .join(' | ');
  return strings;
};

interface Description {
  description: string | null
  typeLabel?: string
}

export const formatPropertyDescription = ({
  description,
  typeLabel,
}: Description) => (
  <>
    <Markdown>{description}</Markdown>
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
);
