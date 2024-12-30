interface Props {
  height?: string
}

export const Spacer = ({ height = '2rem' }: Props) => <div style={{ height }} />
