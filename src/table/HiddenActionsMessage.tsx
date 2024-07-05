import { WarningCircle, X } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';

import { OPTIONAL_COLUMN_ACTIONS_KEY } from './constants';
import { TableProps } from './Table';

interface HiddenActionsMessageProps {
  toggleColumn: TableProps['toggleColumn'];
  close(): void;
}

export const HiddenActionsMessage: FunctionComponent<
  HiddenActionsMessageProps
> = ({ toggleColumn, close }) => {
  return (
    <div className="d-flex gap-5 my-5 w-100">
      <div className="d-flex flex-center w-35px h-35px rounded-circle border border-light-warning">
        <div className="d-flex flex-center w-25px h-25px rounded-circle border border-warning">
          <WarningCircle size={20} className="text-warning" />
        </div>
      </div>
      <div className="fw-bold">
        <p className="mb-1">{translate('Action column is hidden.')}</p>
        <p className="text-muted mb-1">
          {translate('Some functionality may not be accessible.')}
        </p>
        <button
          className="text-anchor fw-bold"
          onClick={() =>
            toggleColumn(OPTIONAL_COLUMN_ACTIONS_KEY, { keys: [] }, true)
          }
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
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
