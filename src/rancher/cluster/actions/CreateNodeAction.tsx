import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { RancherCluster } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';

const CreateNodeDialog = lazyComponent(() =>
  import('../create/CreateNodeDialog').then((module) => ({
    default: module.CreateNodeDialog,
  })),
);

export const CreateNodeAction: FC<{ resource: RancherCluster }> = ({
  resource,
}) =>
  !ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE && Boolean(resource.tenant) ? (
    <DialogActionButton
      title={translate('Create node')}
      iconNode={<PlusCircleIcon weight="bold" />}
      modalComponent={CreateNodeDialog}
      resource={resource}
    />
  ) : null;
