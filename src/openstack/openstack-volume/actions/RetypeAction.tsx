import { ArrowURightDownIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateState, validateRuntimeState } from '@/resource/actions/base';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';

const RetypeDialog = lazyComponent(() =>
  import('./RetypeDialog').then((module) => ({ default: module.RetypeDialog })),
);

const validators = [validateRuntimeState('available'), validateState('OK')];

export const RetypeAction: ActionItemType = ({ resource, refetch }) => (
  <DialogActionItem
    title={translate('Retype')}
    validators={validators}
    modalComponent={RetypeDialog}
    resource={resource}
    extraResolve={{ refetch }}
    iconNode={<ArrowURightDownIcon weight="bold" />}
  />
);
