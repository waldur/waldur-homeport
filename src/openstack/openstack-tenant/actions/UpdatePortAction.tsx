import { PencilSimpleIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

const UpdatePortDialog = lazyComponent(() =>
  import('./UpdatePortDialog').then((module) => ({
    default: module.UpdatePortDialog,
  })),
);

const validators = [validateState('OK')];

export const UpdatePortAction: ActionItemType = ({ resource, refetch }) => (
  <DialogActionItem
    title={translate('Update IP')}
    iconNode={<PencilSimpleIcon weight="bold" />}
    modalComponent={UpdatePortDialog}
    resource={resource}
    validators={validators}
    extraResolve={{ refetch }}
  />
);
