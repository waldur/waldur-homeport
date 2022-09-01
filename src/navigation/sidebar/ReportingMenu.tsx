import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { isStaffOrSupport } from '@waldur/workspace/selectors';

import { MenuItem } from './MenuItem';

const Icon = require('./Reporting.svg');

export const ReportingMenu = () => {
  const visible = useSelector(isStaffOrSupport);
  if (!visible) {
    return null;
  }
  return (
    <MenuItem
      title={translate('Reporting')}
      state="marketplace-support-plan-usages"
      activeState="reporting"
      child={false}
      iconPath={Icon}
    />
  );
};
