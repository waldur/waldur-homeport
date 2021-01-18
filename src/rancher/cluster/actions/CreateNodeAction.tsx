import { FC } from 'react';

import { ENV } from '@waldur/configs/default';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { Cluster } from '@waldur/rancher/types';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';

const CreateNodeDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "CreateNodeDialog" */ '../create/CreateNodeDialog'
    ),
  'CreateNodeDialog',
);

export const CreateNodeAction: FC<{ resource: Cluster }> = ({ resource }) =>
  !ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE &&
  Boolean(resource.tenant_settings) ? (
    <DialogActionButton
      title={translate('Create node')}
      icon="fa fa-plus"
      modalComponent={CreateNodeDialog}
      resource={resource}
    />
  ) : null;
