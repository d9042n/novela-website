import { forwardRef } from 'react';
import { Link, type LinkProps } from 'react-router';

export const RouterLink = forwardRef<HTMLAnchorElement, LinkProps>(
  (props, ref) => <Link ref={ref} {...props} />
);
RouterLink.displayName = 'RouterLink';
