import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { OpenStackInstance } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { RESOURCE_ACTION_FORM } from '@waldur/resource/actions/constants';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';

const CreateBackupDialog = lazyComponent(() =>
  import('./CreateBackupDialog').then((module) => ({
    default: module.CreateBackupDialog,
  })),
);

interface CreateBackupActionProps {
  resource: OpenStackInstance;
}

const validators = [validateState('OK')];

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
