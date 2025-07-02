import { WarningCircleIcon, XIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { RadarIcon } from '@waldur/core/RadarIcon';
import { translate } from '@waldur/i18n';

import { COLUMN_ACTIONS_KEY } from './constants';
import { TableProps } from './types';

interface HiddenActionsMessageProps {
  toggleColumn: TableProps['toggleColumn'];
  close(): void;
}

export const HiddenActionsMessage: FunctionComponent<
  HiddenActionsMessageProps
> = ({ toggleColumn, close }) => {
  return (
    <div className="d-flex gap-5 my-5 w-100">
      <RadarIcon
        IconComponent={WarningCircleIcon}
        variant="warning"
        className="me-2"
      />

      <div className="fw-bold">
        <p className="mb-1">{translate('Action column is hidden.')}</p>
        <p className="text-muted mb-1">
          {translate('Some functionality may not be accessible.')}
        </p>
        <button
          type="button"
          className="text-anchor fw-bold"
          onClick={() => toggleColumn(COLUMN_ACTIONS_KEY, { keys: [] }, true)}
        >
          {translate('Restore column')}
        </button>
      </div>
      <div className="ms-auto">
        <button
          type="button"
          className="btn btn-sm btn-icon btn-active-light-primary"
          onClick={close}
        >
          <XIcon size={18} />
        </button>
      </div>
    </div>
  );
};
