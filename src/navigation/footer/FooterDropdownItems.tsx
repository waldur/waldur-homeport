import { ComponentPropsWithoutRef } from 'react';

import { Menu } from 'waldur-ui';

import { NavMenuLink } from '@/navigation/NavMenu';

/**
 * A command row in a FooterDropdown. The `<li>` keeps FooterDropdown's
 * `<ul>` valid. Must render inside a FooterDropdown: Radix's Item throws
 * outside a menu, which is why footer/MenuItem.tsx (also rendered
 * standalone in the footer bar) is a separate component.
 */
export const FooterDropdownItem = (
  props: ComponentPropsWithoutRef<typeof Menu.Item>,
) => (
  <li>
    <Menu.Item {...props} />
  </li>
);

export const FooterDropdownLink = ({
  label,
  state,
}: {
  label: string;
  state: string;
}) => (
  <li>
    <NavMenuLink state={state} label={label} />
  </li>
);
