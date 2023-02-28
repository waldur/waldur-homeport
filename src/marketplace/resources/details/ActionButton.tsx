import { FC } from 'react';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

export const ActionButton: FC<{
  title: string;
  disabled?: boolean;
  tooltip?: string;
  iconClass: string;
  action?(): void;
  staff?: boolean;
}> = ({ title, disabled, tooltip, iconClass, action, staff }) => (
  <Tip
    label={[title, staff && translate('Staff action'), tooltip]
      .filter(Boolean)
      .join(' | ')}
    id="action-button"
  >
    <button
      className="btn btn-bg-light btn-icon btn-active-color-primary"
      onClick={() => action()}
      disabled={disabled}
    >
      <i className={`fa ${iconClass}`} />
    </button>
  </Tip>
);
