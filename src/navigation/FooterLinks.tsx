import { ENV } from '@waldur/configs/default';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

export const FooterLinks = () => (
  <ul className="footer-nav">
    <li>
      <Link state="policy.privacy">{translate('Privacy policy')}</Link>
    </li>
    <li>
      <Link state="tos.index">{translate('Terms of Service')}</Link>
    </li>
    {ENV.plugins.WALDUR_CORE.SITE_EMAIL && (
      <li>{ENV.plugins.WALDUR_CORE.SITE_EMAIL}</li>
    )}
    {ENV.plugins.WALDUR_CORE.SITE_PHONE && (
      <li>{ENV.plugins.WALDUR_CORE.SITE_PHONE}</li>
    )}
  </ul>
);
