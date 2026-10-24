import { ComponentPropsWithoutRef } from 'react';

import { Menu } from 'waldur-ui';

import { NavMenuLink } from '@/navigation/NavMenu';

/**
 * A command row in a FooterDropdown. The `<li>` keeps FooterDropdown's
 * `<ul>` valid. Selecting it closes the dropdown. footer/MenuItem.tsx is
 * the footer bar's own link, styled for the bar rather than the panel.
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
