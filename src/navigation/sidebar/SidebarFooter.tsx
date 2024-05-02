import { InlineSVG } from '@waldur/core/svg/InlineSVG';
import { translate } from '@waldur/i18n';
import { LandingLink } from '@waldur/marketplace/links/LandingLink';
import { AdminMenu } from '@waldur/navigation/sidebar/AdminMenu';
import { SupportMenu } from '@waldur/navigation/sidebar/SupportMenu';

const marketplaceIcon = require('./Marketplace.svg');

export const SidebarFooter = () => {
  return (
    <div
      className="aside-footer flex-column-auto p-5 mb-3"
      id="kt_aside_footer"
    >
      <div className="aside-menu menu menu-column mb-3 border-bottom">
        <SupportMenu />
        <AdminMenu />
      </div>
      <div>
        <LandingLink
          className="btn btn-primary btn-custom w-100 btn-marketplace"
          data-cy="marketplace-button"
          data-kt-menu-trigger="click"
        >
          <InlineSVG
            path={marketplaceIcon}
            svgClassName="btn-icon svg-icon-2"
          />
          <span className="btn-label">
            {translate('Go to marketplace')}
            <i className="fa fa-angle-right angle" />
          </span>
        </LandingLink>
      </div>
    </div>
  );
};
