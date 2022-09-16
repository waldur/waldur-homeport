import { InlineSVG } from '@waldur/core/svg/InlineSVG';
import { translate } from '@waldur/i18n';
import { LandingLink } from '@waldur/marketplace/links/LandingLink';

const marketplaceIcon = require('./Marketplace.svg');

export const SidebarFooter = () => {
  return (
    <div className="aside-footer flex-column-auto p-5" id="kt_aside_footer">
      <LandingLink
        className="btn btn-primary btn-custom w-100 btn-marketplace"
        data-cy="marketplace-button"
        data-kt-menu-trigger="click"
      >
        <InlineSVG path={marketplaceIcon} svgClassName="btn-icon svg-icon-2" />
        <span className="btn-label">
          {translate('Go to Marketplace')}
          <i className="fa fa-angle-right angle" />
        </span>
      </LandingLink>
    </div>
  );
};
