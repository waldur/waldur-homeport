import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { BackendHealthStatusIndicator } from '@waldur/navigation/BackendHealthStatusIndicator';
import { getConfig } from '@waldur/store/config';

import { FooterLinks } from './FooterLinks';

export const AppFooter: FunctionComponent = () => {
  const { buildId } = useSelector(getConfig);
  return (
    <div className="footer py-4 d-flex flex-lg-column">
      <div className="container-fluid d-flex flex-column flex-md-row align-items-center justify-content-between">
        <div className="text-dark order-2 order-md-1">
          <BackendHealthStatusIndicator />
          <>{translate('Version')}</>: {buildId}
        </div>

        <FooterLinks />
      </div>
    </div>
  );
};
