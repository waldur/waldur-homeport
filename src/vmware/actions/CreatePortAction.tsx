import { PlusCircle } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';

const CreatePortDialog = lazyComponent(
  () => import('./CreatePortDialog'),
  'CreatePortDialog',
);

const validators = [validateState('OK')];

export const CreatePortAction: FC<{ resource }> = ({ resource }) => (
  <DialogActionButton
    title={translate('Create Network adapter')}
    iconNode={<PlusCircle />}
    modalComponent={CreatePortDialog}
    resource={resource}
    validators={validators}
  />
);
