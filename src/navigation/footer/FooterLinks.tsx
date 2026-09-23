import { ENV } from '@/core/config';
import { translate } from '@/i18n';

import { LegalPrivacyMenu } from './LegalPrivacyMenu';
import { MenuItem } from './MenuItem';
import { MobileMenu } from './MobileMenu';
import { SupportMenu } from './SupportMenu';
import { useFooterLinks } from './useFooterLinks';

export const FooterLinks = () => {
  const { isMd, config } = useFooterLinks();

  return (
    <ul
      className={`menu menu-brand fw-bold order-1 ${
        isMd ? 'justify-content-between w-100' : 'gap-8px'
      }`}
    >
      {isMd ? (
        /* Mobile Layout */
        <MobileMenu dynamicItems={config.dynamic} />
      ) : (
        /* Desktop Layout */
        config.dynamic.map((item) => <MenuItem key={item.id} {...item} />)
      )}
      {/* Kept out of dynamic items so mobile never groups it under "More" */}
      {ENV.plugins.WALDUR_CORE.ABOUT_US_PAGE_ENABLED && (
        <MenuItem label={translate('About us')} state="about.about-us" />
      )}
      <LegalPrivacyMenu />
      {/* Support is always at the end in both layouts */}
      <SupportMenu />
    </ul>
  );
};
