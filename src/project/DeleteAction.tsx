import { translate } from '@/i18n';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

import { useProjectDelete } from './useProjectDelete';

export const DeleteAction = ({ project, refetch }) => {
  const { canDelete, callback } = useProjectDelete({ project, refetch });

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={callback}
      disabled={!canDelete}
    />
  );
};
