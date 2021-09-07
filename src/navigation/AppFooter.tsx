import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { BackendHealthStatusIndicator } from '@waldur/navigation/BackendHealthStatusIndicator';
import { getConfig } from '@waldur/store/config';

export const AppFooter: FunctionComponent = () => {
  const { buildId } = useSelector(getConfig);
  return (
    <footer className="footer hidden-print">
      <div className="pull-right">
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
      </div>
      <div>
        <BackendHealthStatusIndicator />
        <>{translate('Version')}</>: {buildId}
      </div>
    </footer>
  );
};
