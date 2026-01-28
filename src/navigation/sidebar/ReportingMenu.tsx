import { ChartBarIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { isStaffOrSupport } from '@waldur/workspace/selectors';

import { MenuItem } from './MenuItem';

interface ReportingMenuProps {
  disabled?: boolean;
  disabledTooltip?: string;
}

export const ReportingMenu: FC<ReportingMenuProps> = ({
  disabled,
  disabledTooltip,
}) => {
  const visible = useSelector(isStaffOrSupport);
  if (!visible) {
    return null;
  }
  return (
    <MenuItem
      title={translate('Reporting')}
      state="reporting-dashboard"
      activeState="reporting"
      child={false}
      icon={<ChartBarIcon weight="bold" />}
      disabled={disabled}
      disabledTooltip={disabledTooltip}
    />
  );
};
