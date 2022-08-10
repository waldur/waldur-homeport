import { Link } from '@waldur/core/Link';
import { InlineSVG } from '@waldur/core/svg/InlineSVG';
import { translate } from '@waldur/i18n';

const marketplaceIcon = require('@waldur/images/icons/gen005.svg');

export const SidebarFooter = () => {
  return (
    <div className="aside-footer flex-column-auto p-5" id="kt_aside_footer">
      <Link
        state="marketplace-landing-user"
        className="btn btn-primary btn-custom w-100 btn-marketplace"
        data-cy="marketplace-button"
        data-kt-menu-trigger="click"
      >
        <span className="btn-label">
          <i className="line"></i>
          {translate('Marketplace')}
          <i className="fa fa-angle-right"></i>
        </span>
        <InlineSVG path={marketplaceIcon} className="btn-icon svg-icon-2" />
      </Link>
    </div>
  );
};
