import { PencilSimpleIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';

const EditPoolDialog = lazyComponent(() =>
  import('./EditPoolDialog').then((m) => ({
    default: m.EditPoolDialog,
  })),
);

export const EditPoolAction: ActionItemType = ({ resource, refetch }) => (
  <DialogActionItem
    title={translate('Edit')}
    modalComponent={EditPoolDialog}
    resource={resource}
    extraResolve={{ refetch }}
    iconNode={<PencilSimpleIcon weight="bold" />}
  />
);
