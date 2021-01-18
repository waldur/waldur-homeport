import { FC } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';

const CreatePortDialog = lazyComponent(
  () => import(/* webpackChunkName: "CreatePortDialog" */ './CreatePortDialog'),
  'CreatePortDialog',
);

const validators = [validateState('OK')];

export const CreatePortAction: FC<any> = ({ resource }) => (
  <DialogActionButton
    title={translate('Create Network adapter')}
    icon="fa fa-plus"
    modalComponent={CreatePortDialog}
    resource={resource}
    validators={validators}
  />
);
