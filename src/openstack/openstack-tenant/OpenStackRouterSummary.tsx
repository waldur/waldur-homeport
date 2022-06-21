import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import {
  Field,
  ResourceSummaryBase,
  ResourceSummaryProps,
} from '@waldur/resource/summary';

export const OpenStackRouterSummary: FunctionComponent<ResourceSummaryProps> = (
  props,
) => {
  return (
    <>
      <ResourceSummaryBase {...props} />
      <Field
        label={translate('Fixed IPs')}
        value={props.resource.fixed_ips.join(', ') || 'N/A'}
      />
    </>
  );
};
