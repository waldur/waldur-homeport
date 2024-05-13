import { Trash } from '@phosphor-icons/react';
import { FC } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

interface ActionsFieldProps {
  onRemove(): void;
}

export const ActionsField: FC<ActionsFieldProps> = ({ onRemove }) => (
  <td>
    <Button
      variant="danger"
      size="sm"
      onClick={onRemove}
      className="d-flex align-items-center"
    >
      <span className="svg-icon svg-icon-2">
        <Trash />
      </span>{' '}
      {translate('Delete')}
    </Button>
  </td>
);
