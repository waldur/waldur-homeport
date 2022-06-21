import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

interface ComponentAddButtonProps {
  onClick(): void;
}

export const ComponentAddButton = (props: ComponentAddButtonProps) => (
  <Button onClick={props.onClick}>
    <i className="fa fa-plus" /> {translate('Add component')}
  </Button>
);
