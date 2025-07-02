import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { IPList } from '@waldur/resource/IPList';
import { Field, ResourceSummaryProps } from '@waldur/resource/summary';

export const OpenStackRouterSummary: FunctionComponent<ResourceSummaryProps> = (
  props,
) => {
  return (
    <>
      <Field
        label={translate('Fixed IPs')}
        value={
          props.resource.fixed_ips?.length ? (
            <IPList value={props.resource.fixed_ips} />
          ) : (
            'N/A'
          )
        }
      />

      {props.resource.offering_external_ips.length ? (
        <Field
          label={translate('External IPs')}
          value={
            props.resource.offering_external_ips?.length ? (
              <IPList value={props.resource.offering_external_ips} />
            ) : (
              'N/A'
            )
          }
        />
      ) : null}
    </>
  );
};
