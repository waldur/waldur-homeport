import { FunctionComponent } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { Resource } from '@waldur/resource/types';

import { UsageReportContext } from './types';

const ResourceCreateUsageDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ResourceCreateUsageDialog" */ './ResourceCreateUsageDialog'
    ),
  'ResourceCreateUsageDialog',
);

interface ResourceCreateUsageButtonProps extends UsageReportContext {
  disabled: boolean;
  resource?: Resource;
}

const validators = [validateState('OK', 'Updating', 'Deleting')];

export const ResourceCreateUsageButton: FunctionComponent<ResourceCreateUsageButtonProps> = (
  props,
) => (
  <DialogActionItem
    validators={validators}
    title={translate('Report usage')}
    icon="fa fa-plus"
    modalComponent={ResourceCreateUsageDialog}
    resource={props.resource}
    extraResolve={{
      resource_uuid: props.resource_uuid,
      resource_name: props.resource_name,
    }}
  />
);
