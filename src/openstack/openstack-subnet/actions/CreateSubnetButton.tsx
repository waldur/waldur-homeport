import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';

const CreateSubnetDialog = lazyComponent(() =>
  import('../../openstack-network/actions/CreateSubnetDialog').then(
    (module) => ({
      default: module.CreateSubnetDialog,
    }),
  ),
);

const validators = [validateState('OK')];

interface CreateSubnetButtonProps {
  resource: any;
  refetch: () => void;
}

export const CreateSubnetButton: FC<CreateSubnetButtonProps> = ({
  resource,
  refetch,
}) => (
  <DialogActionButton
    title={translate('Add')}
    variant="primary"
    iconNode={<PlusCircleIcon weight="bold" />}
    modalComponent={CreateSubnetDialog}
    resource={resource}
    validators={validators}
    extraResolve={{ refetch, showNetworkField: true }}
  />
);
