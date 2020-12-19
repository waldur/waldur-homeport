import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';

interface NodeRemoveButtonProps {
  onClick(): void;
}

export const NodeRemoveButton: FunctionComponent<NodeRemoveButtonProps> = (
  props,
) => (
  <button
    type="button"
    className="close"
    aria-label={translate('Remove')}
    onClick={props.onClick}
  >
    <span aria-hidden="true">&times;</span>
  </button>
);
