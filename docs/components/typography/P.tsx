interface Props {
  children?: React.ReactNode
}

const P: React.FC<Props> = ({ children }) => <p className="_mt-4">{children}</p>;

export default P;
