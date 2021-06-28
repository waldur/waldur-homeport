import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import {
  Field,
  PureResourceSummaryBase,
  ResourceSummaryProps,
} from '@waldur/resource/summary';

export const OpenStackRouterSummary: FunctionComponent<ResourceSummaryProps> = (
  props,
) => {
  return (
    <>
      <PureResourceSummaryBase {...props} />
      <Field
        label={translate('Fixed IPs')}
        value={props.resource.fixed_ips.join(', ') || 'N/A'}
      />
    </>
  );
};
