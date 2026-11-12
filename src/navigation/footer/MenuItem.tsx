import { Link } from '@/core/Link';

/**
 * A standalone footer bar link (FooterLinks.tsx's desktop layout and
 * MobileMenu.tsx's ungrouped case). Deliberately not a Radix menu item:
 * those throw outside a menu. Inside a FooterDropdown, use
 * FooterDropdownLink (FooterDropdownItems.tsx) instead.
 */
/**
 * A footer bar link with
 * `px-3`: brand-coloured (brand-600, brand-300 in dark mode), 8px x 9.75px. Shared with
 * FooterDropdown's trigger.
 */
export const FOOTER_LINK_CLASSNAME =
  'flex cursor-pointer items-center px-[9.75px] py-[8px] text-brand no-underline';

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
      <span>{label}</span>
    </Link>
  </li>
);
