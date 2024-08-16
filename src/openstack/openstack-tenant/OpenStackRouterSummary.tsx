import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { Field, ResourceSummaryProps } from '@waldur/resource/summary';

export const OpenStackRouterSummary: FunctionComponent<ResourceSummaryProps> = (
  props,
) => {
  return (
    <>
      <Field
        label={translate('Fixed IPs')}
        value={props.resource.fixed_ips.join(', ') || 'N/A'}
      />
      {props.resource.offering_external_ips.length ? (
        <Field
          label={translate('External IPs')}
          value={props.resource.offering_external_ips.join(', ') || 'N/A'}
        />
      ) : null}
    </>
  );
};
