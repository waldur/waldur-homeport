import { FunctionComponent } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { Resource } from '@waldur/resource/types';

const ResourceShowUsageDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ResourceShowUsageDialog" */ './ResourceShowUsageDialog'
    ),
  'ResourceShowUsageDialog',
);

const validators = [validateState('OK')];

export const ResourcesShowUsageButton: FunctionComponent<{
  resource: Resource;
}> = ({ resource }) =>
  resource.marketplace_resource_uuid !== null ? (
    <DialogActionItem
      validators={validators}
      title={translate('Show usage')}
      icon="fa fa-eye"
      dialogSize="lg"
      modalComponent={ResourceShowUsageDialog}
      resource={resource}
    />
  ) : null;
