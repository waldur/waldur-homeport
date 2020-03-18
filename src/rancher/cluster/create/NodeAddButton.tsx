import * as React from 'react';

import { translate } from '@waldur/i18n';

interface NodeAddButtonProps {
  onClick(): void;
}

export const NodeAddButton = (props: NodeAddButtonProps) => (
  <button type="button" className="btn btn-default" onClick={props.onClick}>
    <i className="fa fa-plus" /> {translate('Node plan')}
  </button>
);
