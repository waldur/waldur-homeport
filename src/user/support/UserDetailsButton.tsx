import { EyeIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { Menu } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

const UserPopover = lazyComponent(() =>
  import('@/user/UserPopover').then((module) => ({
    default: module.UserPopover,
  })),
);

export const UserDetailsButton: FunctionComponent<{ row }> = ({ row }) => {
  const { openDialog } = useModal();
  return (
    <Menu.Item
      icon={<EyeIcon weight="bold" />}
      onSelect={() =>
        // Open via UserPopover so the dialog fetches the full user
        // (usersRetrieve). The list row only carries a sparse fieldset, which
        // otherwise leaves fields like Organization address blank. Passing the
        // row as well seeds the dialog immediately while the full object loads.
        openDialog(UserPopover, {
          resolve: { user_uuid: row.uuid, user: row },
          size: 'lg',
        })
      }
    >
      {translate('Details')}
    </Menu.Item>
  );
};
