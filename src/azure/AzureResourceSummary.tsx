import * as React from 'react';

import { Field, ResourceSummaryProps, PureResourceSummaryBase } from '@waldur/resource/summary';

import { AzureResource } from './types';

export function PureAzureResourceSummary<R extends AzureResource = any>(props: ResourceSummaryProps<R>) {
  const { translate, resource } = props;
  return (
    <>
      <PureResourceSummaryBase {...props} hideBackendId={true}/>
      <Field
        label={translate('Resource group')}
        value={resource.resource_group_name}
      />
      <Field
        label={translate('Location')}
        value={resource.location_name}
      />
    </>
  );
}
