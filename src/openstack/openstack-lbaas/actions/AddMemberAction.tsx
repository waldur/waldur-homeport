import { UserPlusIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';

const CreateMemberDialog = lazyComponent(() =>
  import('./CreateMemberDialog').then((m) => ({
    default: m.CreateMemberDialog,
  })),
);

export const AddMemberAction: ActionItemType = ({ resource, refetch }) => (
  <DialogActionItem
    title={translate('Add member')}
    modalComponent={CreateMemberDialog}
    resource={resource}
    extraResolve={{ refetch }}
    iconNode={<UserPlusIcon weight="bold" />}
  />
);
