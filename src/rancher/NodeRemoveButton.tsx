import * as React from 'react';

import { translate } from '@waldur/i18n';

interface NodeRemoveButtonProps {
  onClick(): void;
}

export const NodeRemoveButton = (props: NodeRemoveButtonProps) => (
  <button
    type="button"
    className="close"
    aria-label={translate('Remove')}
    onClick={props.onClick}
  >
    <span aria-hidden="true">&times;</span>
  </button>
);
