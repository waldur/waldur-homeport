import { LinkIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';
import { useUser } from '@/workspace/hooks';

import { ResourceAction } from './actions/constants';

const SetSlugDialog = lazyComponent(() =>
  import('./SetSlugDialog').then((module) => ({
    default: module.SetSlugDialog,
  })),
);

export const SetSlugAction: ActionItemType = ({ resource, refetch }) => {
  const user = useUser();
  if (!user.is_staff) {
    return null;
  }
  return (
    <DialogActionItem
      title={translate('Set slug')}
      modalComponent={SetSlugDialog}
      extraResolve={{ refetch }}
      resource={resource}
      staff
      iconNode={<LinkIcon weight="bold" />}
      actionId={ResourceAction.SET_SLUG}
    />
  );
};
