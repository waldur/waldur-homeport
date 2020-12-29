import { FC } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

interface Props {
  onRemove(): void;
}

export const ActionsField: FC<Props> = ({ onRemove }) => (
  <td>
    <Button bsStyle="danger" bsSize="sm" onClick={onRemove}>
      <i className="fa fa-trash"></i>&nbsp;
      {translate('Delete')}
    </Button>
  </td>
);
