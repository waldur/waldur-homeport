import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';

import { lazyComponent } from '@/core/lazyComponent';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import { FooterDropdown } from './FooterDropdown';

const CookieSettingsDialog = lazyComponent(() =>
  import('../cookies/CookieSettingsDialog').then((module) => ({
    default: module.CookieSettingsDialog,
  })),
);

/**
 * Uses RadixDropdownMenu.Item directly rather than NavMenuItem — see
 * footer/MenuItem.tsx's own comment on the doubled `.menu-item` wrapper
 * this avoids.
 */
const FooterMenuLink = ({ label, state }: { label: string; state: string }) => (
  <li className="menu-item">
    <RadixDropdownMenu.Item asChild>
      <Link className="menu-link px-3" state={state}>
        <span className="menu-title">{label}</span>
      </Link>
    </RadixDropdownMenu.Item>
  </li>
);

export const LegalPrivacyMenu = () => {
  const { openDialog } = useModal();

  const openCookieSettings = () => {
    openDialog(CookieSettingsDialog);
  };

  return (
    <FooterDropdown title={translate('Legal & Privacy')}>
      <li className="menu-item">
        <RadixDropdownMenu.Item
          className="menu-link px-3"
          onSelect={openCookieSettings}
        >
          <span className="menu-title">{translate('Cookie settings')}</span>
        </RadixDropdownMenu.Item>
      </li>
      <FooterMenuLink
        label={translate('Privacy policy')}
        state="about.privacy"
      />
      <FooterMenuLink label={translate('Terms of service')} state="about.tos" />
    </FooterDropdown>
  );
};
