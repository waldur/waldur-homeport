import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { OpenStackInstance } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateOpenStackInstanceManagePermission } from '@/openstack/utils';
import { validateState } from '@/resource/actions/base';
import { RESOURCE_ACTION_FORM } from '@/resource/actions/constants';
import { DialogActionButton } from '@/resource/actions/DialogActionButton';

const CreateBackupDialog = lazyComponent(() =>
  import('./CreateBackupDialog').then((module) => ({
    default: module.CreateBackupDialog,
  })),
);

interface CreateBackupActionProps {
  resource: OpenStackInstance;
}

const validators = [
  validateState('OK'),
  validateOpenStackInstanceManagePermission,
];

export const CreateBackupAction: FC<CreateBackupActionProps> = ({
  resource,
}) => (
  <DialogActionButton
    title={translate('Create')}
    iconNode={<PlusCircleIcon weight="bold" />}
    modalComponent={CreateBackupDialog}
    formId={RESOURCE_ACTION_FORM}
    resource={resource}
    validators={validators}
  />
);
