import { FunnelSimple } from '@phosphor-icons/react';
import { Button } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

export const TableFilterButton = ({ onClick }) => {
  return (
    <Tip id="table-filter-toggle-tip" label={translate('Set filters')}>
      <Button
        variant="outline-default"
        className="btn-outline btn-icon btn-toggle-filters"
        onClick={onClick}
      >
        <span className="svg-icon svg-icon-1">
          <FunnelSimple weight="bold" />
        </span>
      </Button>
    </Tip>
  );
};
