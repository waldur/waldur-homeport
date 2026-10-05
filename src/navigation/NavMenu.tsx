import { ComponentPropsWithoutRef, ReactNode } from 'react';

import { Menu } from 'waldur-ui';

import { Link } from '@/core/Link';

/**
 * A nav menu row that navigates to a ui-router state: waldur-ui's
 * Menu.Item composed with the app's Link. The header, page tabs and footer
 * menus are otherwise plain waldur-ui `Menu` parts in the nav look.
 *
 * The label sits in a span because Link gives a bare string child its
 * `text-anchor` link style (brand colour, larger font, underline on hover),
 * which also replaces the row's own text colour.
 */
export const NavMenuLink = ({
  state,
  params,
  label,
  ...props
}: Omit<ComponentPropsWithoutRef<typeof Menu.Item>, 'asChild' | 'children'> & {
  state: string;
  params?: Record<string, any>;
  label: ReactNode;
}) => (
  <Menu.Item asChild {...props}>
    <Link state={state} params={params}>
      <span>{label}</span>
    </Link>
  </Menu.Item>
);
