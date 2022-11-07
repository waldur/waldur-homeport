import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { Field, ResourceSummaryProps } from '@waldur/resource/summary';

export const OpenStackRouterSummary: FunctionComponent<ResourceSummaryProps> = (
  props,
) => {
  return (
    <Field
      label={translate('Fixed IPs')}
      value={props.resource.fixed_ips.join(', ') || 'N/A'}
    />
  );
};
