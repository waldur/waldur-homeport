import { FunctionComponent } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { Resource } from '@waldur/resource/types';
// import { Resource } from '@waldur/resource/types';

const ResourceShowUsageDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ResourceShowUsageDialog" */ './ResourceShowUsageDialog'
    ),
  'ResourceShowUsageDialog',
);

// interface ResourceShowUsageButtonProps extends Resource {
interface ResourceShowUsageButtonProps {
  resource?: Resource;
  offeringUuid: string;
  resourceUuid: string;
}

// const validators = [validateState('OK')];

export const ResourceShowUsageButton: FunctionComponent<ResourceShowUsageButtonProps> = ({
  resource,
  offeringUuid,
  resourceUuid,
}: any) => {
  // console.log('ResourceShowUsageButton props', props);
  return (
    <DialogActionItem
      // validators={validators}
      title={translate('Show usage')}
      icon="fa fa-eye"
      dialogSize="lg"
      modalComponent={ResourceShowUsageDialog}
      resource={resource}
      extraResolve={{ offeringUuid, resourceUuid }}
    />
  );
};
