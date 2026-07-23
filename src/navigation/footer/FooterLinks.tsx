import { useEffect } from 'react';

import { MenuComponent } from '@/metronic/components';

import { LegalPrivacyMenu } from './LegalPrivacyMenu';
import { MenuItem } from './MenuItem';
import { MobileMenu } from './MobileMenu';
import { SupportMenu } from './SupportMenu';
import { useFooterLinks } from './useFooterLinks';

export const FooterLinks = () => {
  const { isMd, config } = useFooterLinks();

  useEffect(() => {
    MenuComponent.reinitialization();
  }, []);

  return (
    <ul
      className={`menu menu-brand fw-bold order-1 ${
        isMd ? 'justify-content-between w-100' : 'gap-8px'
      }`}
      data-kt-menu="true"
    >
      {isMd ? (
        /* Mobile Layout */
        <MobileMenu dynamicItems={config.dynamic} />
      ) : (
        /* Desktop Layout */
        config.dynamic.map((item) => <MenuItem key={item.id} {...item} />)
      )}
      <LegalPrivacyMenu />
      {/* Support is always at the end in both layouts */}
      <SupportMenu />
    </ul>
  );
};
