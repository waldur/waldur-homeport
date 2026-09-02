import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';

import { Link } from '@/core/Link';

/**
 * A real page navigation — closing its footer dropdown on click is
 * harmless and expected (the whole page transitions away regardless),
 * matching how UserDropdown.tsx treats every Link-based row.
 *
 * Uses RadixDropdownMenu.Item directly rather than NavMenuItem
 * (@/navigation/NavMenu): NavMenuItem's own `.menu-item` wrapper div
 * would double up with the `<li className="menu-item">` this component
 * already needs for itself (a direct `<li>` child of FooterLinks.tsx's
 * `<ul>` — Metronic styles the row by class, not tag, but the list
 * still needs valid `<li>` children).
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
    <RadixDropdownMenu.Item asChild>
      <Link className={`menu-link ${className}`} state={state}>
        {icon && <span className="menu-icon">{icon}</span>}
        <span className="menu-title">{label}</span>
      </Link>
    </RadixDropdownMenu.Item>
  </li>
);
