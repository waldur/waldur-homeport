import { FunctionComponent } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';

const ResourceShowUsageDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ResourceShowUsageDialog" */ './ResourceShowUsageDialog'
    ),
  'ResourceShowUsageDialog',
);

interface ResourceShowUsageButtonProps {
  resource: any;
  offeringUuid?: string;
  resourceUuid?: string;
}

const validators = [validateState('OK')];

export const ResourceShowUsageButton: FunctionComponent<ResourceShowUsageButtonProps> = ({
  resource,
  offeringUuid,
  resourceUuid,
}: any) =>
  resource.is_usage_based ? (
    <DialogActionItem
      validators={validators}
      title={translate('Show usage')}
      icon="fa fa-eye"
      dialogSize="lg"
      modalComponent={ResourceShowUsageDialog}
      resource={resource}
      extraResolve={{ offeringUuid, resourceUuid }}
    />
  ) : null;
