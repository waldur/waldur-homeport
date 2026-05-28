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

      {props.resource.has_external_gateway ? (
        <>
          <Component
            label={translate('External gateway')}
            value={
              props.resource.external_network_name ||
              props.resource.external_network_id
            }
          />
          <Component
            label={translate('Source NAT (SNAT)')}
            value={
              props.resource.enable_snat === false
                ? translate('Disabled')
                : translate('Enabled')
            }
          />
          {Array.isArray(props.resource.external_fixed_ips) &&
          props.resource.external_fixed_ips.length ? (
            <Component
              label={translate('Gateway fixed IPs')}
              value={
                <IPList
                  value={props.resource.external_fixed_ips
                    .map((ip) => ip?.ip_address)
                    .filter(Boolean)}
                />
              }
            />
          ) : null}
        </>
      ) : null}
    </>
  );
};
