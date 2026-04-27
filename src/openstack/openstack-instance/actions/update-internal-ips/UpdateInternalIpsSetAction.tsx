import { WrenchIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { OpenStackInstance } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateState } from '@/resource/actions/base';
import { DialogActionButton } from '@/resource/actions/DialogActionButton';

const UpdateInternalIpsDialog = lazyComponent(() =>
  import('./UpdateInternalIpsDialog').then((module) => ({
    default: module.UpdateInternalIpsDialog,
  })),
);

interface UpdateInternalIpsActionProps {
  resource: OpenStackInstance;
  refetch;
}

const validators = [validateState('OK')];

export const UpdateInternalIpsAction: FC<UpdateInternalIpsActionProps> = ({
  resource,
  refetch,
}) => (
  <DialogActionButton
    title={translate('Configure')}
    iconNode={<WrenchIcon weight="bold" />}
    modalComponent={UpdateInternalIpsDialog}
    resource={resource}
    validators={validators}
    extraResolve={{ refetch }}
  />
);
