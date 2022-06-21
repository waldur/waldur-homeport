import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

interface PlanAddButtonProps {
  onClick(): void;
}

export const PlanAddButton = (props: PlanAddButtonProps) => (
  <Button onClick={props.onClick}>
    <i className="fa fa-plus" /> {translate('Add plan')}
  </Button>
);
