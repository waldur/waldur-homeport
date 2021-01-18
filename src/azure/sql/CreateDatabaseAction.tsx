import { FC } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';

const CreateDatabaseDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "CreateDatabaseDialog" */ './CreateDatabaseDialog'
    ),
  'CreateDatabaseDialog',
);

const validators = [validateState('OK')];

export const CreateDatabaseAction: FC<any> = ({ resource }) => (
  <DialogActionButton
    title={translate('Create')}
    icon="fa fa-plus"
    modalComponent={CreateDatabaseDialog}
    resource={resource}
    validators={validators}
  />
);
