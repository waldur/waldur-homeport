import { TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { CompactActionButton } from '@waldur/table/CompactActionButton';

interface ActionsFieldProps {
  onRemove(): void;
}

export const ActionsField: FC<ActionsFieldProps> = ({ onRemove }) => (
  <td>
    <CompactActionButton
      action={onRemove}
      title={translate('Delete')}
      iconNode={<TrashIcon weight="bold" />}
      variant="danger"
    />
  </td>
);
