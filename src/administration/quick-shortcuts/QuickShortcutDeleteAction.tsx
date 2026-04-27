import { externalLinksDestroy } from 'waldur-js-client';

import { DeleteButton } from '@/core/buttons';
import { translate } from '@/i18n';

import { useInvalidateShortcuts } from './utils';

export const QuickShortcutDeleteAction = ({ row, refetch }) => {
  const invalidateShortcuts = useInvalidateShortcuts();

  return (
    <DeleteButton
      row={row}
      apiFunction={(r) => externalLinksDestroy({ path: { uuid: r.uuid } })}
      refetch={refetch}
      onSuccess={invalidateShortcuts}
      confirmTitle={translate('Confirmation')}
      confirmMessage={translate(
        'Are you sure you want to delete the shortcut?',
      )}
      title={translate('Remove')}
    />
  );
};
