import { Link } from '@/core/Link';

/**
 * A standalone footer bar link (FooterLinks.tsx's desktop layout and
 * MobileMenu.tsx's ungrouped case). Deliberately not a Radix menu item:
 * those throw outside a menu. Inside a FooterDropdown, use
 * FooterDropdownLink (FooterDropdownItems.tsx) instead.
 */
/**
 * A footer bar link, ported from Metronic's `.menu-brand .menu-link` with
 * the `px-3` every call site used: brand-coloured, 8px x 9.75px. Shared
 * with FooterDropdown's trigger.
 */
export const FOOTER_LINK_CLASSNAME =
  'flex cursor-pointer items-center px-[9.75px] py-[8px] text-[var(--footer-link-text)] no-underline';

export const MenuItem = ({
  label,
  state,
  icon,
}: {
  label: string;
  state: string;
  icon?: React.ReactNode;
}) => (
  <li>
    <Link className={FOOTER_LINK_CLASSNAME} state={state}>
      {icon && (
        <span className="me-[8px] flex w-[20px] shrink-0 items-center justify-center">
          {icon}
        </span>
      )}
      {/* A span, so Link doesn't give the label its `text-anchor` style. */}
      <span>{label}</span>
    </Link>
  </li>
);
