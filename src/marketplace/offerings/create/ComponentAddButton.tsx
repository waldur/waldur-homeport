import { Button } from 'react-bootstrap';

import { withTranslation, TranslateProps } from '@waldur/i18n';

interface ComponentAddButtonProps extends TranslateProps {
  onClick(): void;
}

export const ComponentAddButton = withTranslation(
  (props: ComponentAddButtonProps) => (
    <Button onClick={props.onClick}>
      <i className="fa fa-plus" /> {props.translate('Add component')}
    </Button>
  ),
);
