import { useEffect } from 'react';

import { MenuComponent } from '@waldur/metronic/components';

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
        <>
          <MenuItem {...config.privacy} />
          <MobileMenu dynamicItems={config.dynamic} tosItem={config.tos} />
        </>
      ) : (
        /* Desktop Layout */
        <>
          {config.dynamic.map((item) => (
            <MenuItem key={item.id} {...item} />
          ))}
          <MenuItem {...config.privacy} />
          <MenuItem {...config.tos} />
        </>
      )}

      {/* Support is always at the end in both layouts */}
      <SupportMenu />
    </ul>
  );
};
