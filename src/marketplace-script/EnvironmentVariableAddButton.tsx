import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

interface EnvironmentVariableAddButtonProps {
  onClick(): void;
}

export const EnvironmentVariableAddButton = (
  props: EnvironmentVariableAddButtonProps,
) => (
  <Button onClick={props.onClick}>
    <i className="fa fa-plus" /> {translate('Add environment variable')}
  </Button>
);
