import { FunnelSimple } from '@phosphor-icons/react';
import { Button } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { HeaderButtonBullet } from '@waldur/navigation/header/HeaderButtonBullet';

export const TableFilterButton = ({ onClick, hasFilter = false }) => {
  return (
    <Tip id="table-filter-toggle-tip" label={translate('Set filters')}>
      <Button
        variant="outline-default"
        className="btn-outline btn-icon btn-toggle-filters position-relative"
        onClick={onClick}
      >
        <span className="svg-icon svg-icon-1">
          <FunnelSimple weight="bold" />
        </span>
        {hasFilter && (
          <HeaderButtonBullet size={8} blink={false} className="me-n2" />
        )}
      </Button>
    </Tip>
  );
};
