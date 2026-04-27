import { FunctionComponent } from 'react';

import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { IPList } from '@/resource/IPList';
import { Field, ResourceSummaryProps } from '@/resource/summary';

export const OpenStackRouterSummary: FunctionComponent<ResourceSummaryProps> = (
  props,
) => {
  const Component = props.formTableItem ? FormTable.Item : Field;
  return (
    <>
      <Component
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
        <Component
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
