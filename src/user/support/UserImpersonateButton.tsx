import { EyeIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

import { useImpersonate } from './useImpersonate';

export const UserImpersonateButton: FunctionComponent<{ row }> = ({ row }) => {
  const user = useUser();
  const { impersonate, isPending } = useImpersonate(row.uuid);

  if (!(user?.uuid !== row.uuid && user?.is_staff)) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Impersonate')}
      action={impersonate}
      iconNode={<EyeIcon weight="bold" />}
      disabled={isPending || !row.has_active_session}
      tooltip={
        !row.has_active_session &&
        translate(
          'Impersonation is not available for users without active session.',
        )
      }
      size="sm"
    />
  );
};
