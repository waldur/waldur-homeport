import { Button } from 'react-bootstrap';

import { withTranslation, TranslateProps } from '@waldur/i18n';

interface PlanAddButtonProps extends TranslateProps {
  onClick(): void;
}

export const PlanAddButton = withTranslation((props: PlanAddButtonProps) => (
  <Button onClick={props.onClick}>
    <i className="fa fa-plus" /> {props.translate('Add plan')}
  </Button>
));
