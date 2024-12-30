interface Props {
  children?: string
  size?: string
}

const H1: React.FC<Props> = ({ children }) => {
  const isLong = children && children?.length > 15;
  const size = isLong ? '3xl' : '4xl';

  return (
    <h1
      style={{ lineHeight: 1.3 }}
      className={`_mt-8 _text-${size} ${
        isLong ? '_pb-4' : ''
      } _font-extrabold _tracking-tight _text-slate-900 dark:_text-slate-100 `}
    >
      {children}
    </h1>
  );
};

export default H1;
