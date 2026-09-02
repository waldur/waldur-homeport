import { Link } from '@/core/Link';

/**
 * Deliberately plain — NOT a Radix menu item, even though it renders
 * inside a real Radix menu in one of its three call sites
 * (MobileMenu.tsx's grouped case, nested in FooterDropdown.tsx's
 * NavMenuContent). The other two — FooterLinks.tsx's desktop layout and
 * MobileMenu.tsx's own ungrouped case — render this as a *standalone*
 * top-level footer nav link, with no Root/Content anywhere above it.
 * A RadixDropdownMenu.Item (tried first, reverted here) throws
 * "`MenuItem` must be used within `Menu`" the instant it renders outside
 * one — real production crash, not a hypothetical. A component with
 * more than one host has to work correctly in *its narrowest* host, not
 * its richest one.
 */
export const MenuItem = ({
  label,
  state,
  icon,
  className = 'px-3',
}: {
  label: string;
  state: string;
  icon?: React.ReactNode;
  className?: string;
}) => (
  <li className="menu-item">
    <Link className={`menu-link ${className}`} state={state}>
      {icon && <span className="menu-icon">{icon}</span>}
      <span className="menu-title">{label}</span>
    </Link>
  </li>
);
