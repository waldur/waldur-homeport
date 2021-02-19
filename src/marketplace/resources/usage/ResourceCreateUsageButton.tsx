import { FunctionComponent } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
// import { Resource } from '@waldur/resource/types';

const ResourceCreateUsageDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ResourceCreateUsageDialog" */ './ResourceCreateUsageDialog'
    ),
  'ResourceCreateUsageDialog',
);

const validators = [validateState('OK', 'Updating', 'Deleting')];

export const ResourceCreateUsageButton: FunctionComponent<{
  resource: any;
}> = ({ resource }) =>
  resource.marketplace_resource_uuid !== null ? (
    <DialogActionItem
      validators={validators}
      title={translate('Report usage')}
      icon="fa fa-plus"
      // dialogSize="lg"
      modalComponent={ResourceCreateUsageDialog}
      // resource={resource}
      resource={{
        ...resource,
        offering_uuid: resource.offering_uuid,
        resource_uuid: resource.uuid,
        resource_name: resource.name,
        customer_name: resource.customer_name,
        project_name: resource.project_name,
        backend_id: resource.backend_id,
      }}
    />
  ) : null;
