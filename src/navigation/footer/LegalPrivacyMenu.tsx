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

const FooterMenuLink = ({ label, state }: { label: string; state: string }) => (
  <div className="menu-item">
    <Link className="menu-link px-3" state={state}>
      <span className="menu-title">{label}</span>
    </Link>
  </div>
);

export const LegalPrivacyMenu = () => {
  const { openDialog } = useModal();

  const openCookieSettings = () => {
    openDialog(CookieSettingsDialog);
  };

  return (
    <FooterDropdown title={translate('Legal & Privacy')}>
      <div className="menu-item">
        <span
          className="menu-link px-3"
          role="button"
          onClick={openCookieSettings}
          onKeyDown={openCookieSettings}
          tabIndex={-1}
        >
          <span className="menu-title">{translate('Cookie settings')}</span>
        </span>
      </div>
      <FooterMenuLink
        label={translate('Privacy policy')}
        state="about.privacy"
      />
      <FooterMenuLink label={translate('Terms of service')} state="about.tos" />
    </FooterDropdown>
  );
};
