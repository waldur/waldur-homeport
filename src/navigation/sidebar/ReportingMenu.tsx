import { ChartBarIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';

import { translate } from '@/i18n';
import { useUser } from '@/workspace/hooks';

import { hasAnyReportingEnabled } from '../../reporting/utils';

import { MenuItem } from './MenuItem';

interface ReportingMenuProps {
  disabled?: boolean;
  disabledTooltip?: string;
}

export const ReportingMenu: FC<ReportingMenuProps> = ({
  disabled,
  disabledTooltip,
}) => {
  const user = useUser();
  const isStaff = user?.is_staff || user?.is_support;
  const anyEnabled = useMemo(() => hasAnyReportingEnabled(), []);
  const visible = isStaff && anyEnabled;
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
