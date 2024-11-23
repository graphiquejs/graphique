import { Url } from 'next/dist/shared/lib/router/router';
import Link from 'next/link';
import { AnchorHTMLAttributes } from 'react';

const A: React.FC<AnchorHTMLAttributes<HTMLAnchorElement>> = ({
  children,
  href,
}) => (
  <Link
    className="_text-primary-600 _underline _decoration-from-font [text-underline-position:from-font]"
    href={href as Url}
  >
    {children}
  </Link>
);

export default A;
