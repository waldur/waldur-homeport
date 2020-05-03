import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

export const formatPeriod = ({ year, month }) =>
  `${year}-${month < 10 ? '0' : ''}${month}`;

export const getTabTitle = () =>
  ({
    accounting: translate('Accounting'),
    billing: translate('Billing'),
  }[ENV.accountingMode]);

export const getPageTitle = () => `${ENV.shortPageTitle} | ${getTabTitle()}`;
