import { FunnelSimpleIcon } from '@phosphor-icons/react';
import { Button } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

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
    <Tip id="table-filter-toggle-tip" label={translate('Set filters')}>
      <Button
        variant="tertiary"
        className="btn-icon btn-toggle-filters position-relative"
        size="lg"
        onClick={onClick}
      >
        <span className="svg-icon svg-icon-2">
          <FunnelSimpleIcon weight="bold" />
        </span>
        {hasFilter && filterCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger fs-9">
            {filterCount > 9 ? '9+' : filterCount}
          </span>
        )}
      </Button>
    </Tip>
  );
};
