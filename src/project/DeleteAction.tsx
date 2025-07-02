import { TrashIcon } from '@phosphor-icons/react';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

import { useProjectDelete } from './useProjectDelete';

export const DeleteAction = ({ project, refetch }) => {
  const { canDelete, callback } = useProjectDelete({ project, refetch });

  return (
    <ActionItem
      title={translate('Delete')}
      className="text-danger"
      iconColor="danger"
      action={callback}
      disabled={!canDelete}
      iconNode={<TrashIcon weight="bold" />}
    />
  );
};
