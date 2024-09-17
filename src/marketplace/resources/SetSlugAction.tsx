import { PencilSimpleLine } from '@phosphor-icons/react';
import { useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';
import { getUser } from '@waldur/workspace/selectors';

const SetSlugDialog = lazyComponent(
  () => import('./SetSlugDialog'),
  'SetSlugDialog',
);

export const SetSlugAction: ActionItemType = ({ resource, refetch }) => {
  const user = useSelector(getUser);
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
      iconNode={<PencilSimpleLine />}
    />
  );
};
