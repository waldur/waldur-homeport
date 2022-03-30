import { ENV } from '@waldur/configs/default';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

import './FooterLinks.scss';

export const FooterLinks = () => (
  <ul className="menu menu-gray-600 menu-hover-primary fw-bold order-1">
    <li className="menu-item">
      <Link className="menu-link px-2" state="policy.privacy">
        {translate('Privacy policy')}
      </Link>
    </li>
    <li className="menu-item">
      <Link className="menu-link px-2" state="tos.index">
        {translate('Terms of Service')}
      </Link>
    </li>
    {ENV.plugins.WALDUR_CORE.SITE_EMAIL && (
      <li className="menu-item">{ENV.plugins.WALDUR_CORE.SITE_EMAIL}</li>
    )}
    {ENV.plugins.WALDUR_CORE.SITE_PHONE && (
      <li className="menu-item">{ENV.plugins.WALDUR_CORE.SITE_PHONE}</li>
    )}
  </ul>
);
