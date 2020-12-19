import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { getConfig } from '@waldur/store/config';

export const AppFooter: FunctionComponent = () => {
  const {
    buildId,
    companyName,
    companyUrl,
    supportEmail,
    supportPhone,
  } = useSelector(getConfig);
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
          {supportEmail && <li>{supportEmail}</li>}
          {supportPhone && <li>{supportPhone}</li>}
          {companyName && (
            <li>
              <a href={companyUrl}>{companyName}</a>
            </li>
          )}
        </ul>
      </div>
      <div>
        <>{translate('Version')}</>: {buildId}
      </div>
    </footer>
  );
};
