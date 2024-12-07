const SVG: React.FC<React.SVGAttributes<unknown>> = (props) => (
  <svg
    fill="currentColor"
    height="16"
    viewBox="0 0 16 16"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  />
)

export const ExportIcon = (
  props: React.SVGAttributes<unknown>,
): React.ReactElement => (
  <SVG fill="none" stroke="currentColor" {...props}>
    <path
      d="M6.66665 3.33337H4.33331C3.78103 3.33337 3.33331 3.78109 3.33331 4.33337V11.6667C3.33331 12.219 3.78103 12.6667 4.33331 12.6667H11.6666C12.2189 12.6667 12.6666 12.219 12.6666 11.6667V9.33337"
      strokeLinecap="round"
    />
    <path
      d="M10 3.33337H12.5667C12.6219 3.33337 12.6667 3.37815 12.6667 3.43337V6.00004"
      strokeLinecap="round"
    />
    <path d="M7.33331 8.66668L12.5333 3.46667" strokeLinecap="round" />
  </SVG>
)

export const PreviewIcon = (
  props: React.SVGAttributes<unknown>,
): React.ReactElement => (
  <SVG
    fill="currentColor"
    viewBox="0 0 48 48"
    width="18"
    height="18"
    {...props}
  >
    <title>Preview</title>
    <path d="M16 37.85v-28l22 14Zm3-14Zm0 8.55 13.45-8.55L19 15.3Z"></path>
  </SVG>
)
