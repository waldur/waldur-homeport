import { NetworkIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const PersonalAccessTokenNetworkAclDialog = lazyComponent(() =>
  import('./PersonalAccessTokenNetworkAclDialog').then((module) => ({
    default: module.PersonalAccessTokenNetworkAclDialog,
  })),
);

export const PersonalAccessTokenNetworkAclButton = ({ row, refetch }) => {
  const { openDialog } = useModal();

  return (
    <ActionItem
      title={translate('Edit allowed networks')}
      action={() =>
        openDialog(PersonalAccessTokenNetworkAclDialog, {
          resolve: { row, refetch },
        })
      }
      iconNode={<NetworkIcon weight="bold" />}
      disabled={!row.is_active}
      tooltip={
        !row.is_active
          ? translate('Cannot change the network ACL of a revoked token.')
          : undefined
      }
    />
  );
};
