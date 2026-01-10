import { FunnelSimpleIcon } from '@phosphor-icons/react';

import { translate } from '@waldur/i18n';

import { ToolbarButton } from './ToolbarButton';

interface TableFilterButtonProps {
  onClick: (event: React.MouseEvent) => void;
  hasFilter?: boolean;
  filterCount?: number;
}

export const TableFilterButton = ({
  onClick,
  hasFilter = false,
  filterCount = 0,
}: TableFilterButtonProps) => {
  return (
    <ToolbarButton
      tooltip={translate('Set filters')}
      iconNode={<FunnelSimpleIcon weight="bold" />}
      onClick={onClick}
      className="btn-toggle-filters"
      badge={hasFilter && filterCount > 0 ? filterCount : undefined}
    />
  );
};
