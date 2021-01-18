import { FC } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';

const CreateDiskDialog = lazyComponent(
  () => import(/* webpackChunkName: "CreateDiskDialog" */ './CreateDiskDialog'),
  'CreateDiskDialog',
);

const validators = [validateState('OK')];

export const CreateDiskAction: FC<any> = ({ resource }) => (
  <DialogActionButton
    title={translate('Create disk')}
    icon="fa fa-plus"
    modalComponent={CreateDiskDialog}
    resource={resource}
    validators={validators}
  />
);
