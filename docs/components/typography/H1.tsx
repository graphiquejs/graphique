import { useWindowWidth } from '@react-hook/window-size'

interface Props {
  children?: string
  size?: string
}

const H1: React.FC<Props> = ({ children }) => {
  const width = useWindowWidth()
  const isNarrow = width < 440

  const isLong = children && children?.length > 15
  const condensedSize = isLong ? '1.875rem' : '2.25rem'
  const fontSize = isLong && isNarrow ? '1.7rem' : condensedSize

  return (
    <h1
      style={{ lineHeight: 1.3, fontSize }}
      className={`_mt-8 ${
        isLong ? '_pb-4' : ''
      } _font-extrabold _tracking-tight _text-slate-900 dark:_text-slate-100 `}
    >
      {children}
    </h1>
  )
}

export default H1
