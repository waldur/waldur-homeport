import { useAvailableUserAgreements } from '@/about/useAvailableUserAgreements';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import { FooterDropdown } from './FooterDropdown';
import { FooterDropdownItem, FooterDropdownLink } from './FooterDropdownItems';

const CookieSettingsDialog = lazyComponent(() =>
  import('../cookies/CookieSettingsDialog').then((module) => ({
    default: module.CookieSettingsDialog,
  })),
);

export const LegalPrivacyMenu = () => {
  const { openDialog } = useModal();
  // A link to an agreement nobody has written leads to an empty page.
  const { hasPrivacyPolicy, hasTermsOfService } = useAvailableUserAgreements();

  const openCookieSettings = () => {
    openDialog(CookieSettingsDialog);
  };

  return (
    <FooterDropdown title={translate('Legal & Privacy')}>
      <FooterDropdownItem onSelect={openCookieSettings}>
        {translate('Cookie settings')}
      </FooterDropdownItem>
      {hasPrivacyPolicy && (
        <FooterDropdownLink
          label={translate('Privacy policy')}
          state="about.privacy"
        />
      )}
      {hasTermsOfService && (
        <FooterDropdownLink
          label={translate('Terms of service')}
          state="about.tos"
        />
      )}
    </FooterDropdown>
  );
};
