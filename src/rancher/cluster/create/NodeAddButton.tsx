import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

interface NodeAddButtonProps {
  onClick(): void;
}

export const NodeAddButton: FunctionComponent<NodeAddButtonProps> = (props) => (
  <Button onClick={props.onClick}>
    <i className="fa fa-plus" /> {translate('Node plan')}
  </Button>
);
