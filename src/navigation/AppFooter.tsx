import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { BackendHealthStatusIndicator } from '@waldur/navigation/BackendHealthStatusIndicator';
import { getConfig } from '@waldur/store/config';

import { FooterLinks } from './FooterLinks';

export const AppFooter: FunctionComponent = () => {
  const { buildId } = useSelector(getConfig);
  return (
    <footer className="footer hidden-print">
      <div className="pull-right">
        <FooterLinks />
      </div>
      <div>
        <BackendHealthStatusIndicator />
        <>{translate('Version')}</>: {buildId}
      </div>
    </footer>
  );
};
