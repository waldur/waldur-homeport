import { FunctionComponent } from 'react';

import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { IPList } from '@/resource/IPList';
import { Field, ResourceSummaryProps } from '@/resource/summary';

import { EffectiveRoutesCard } from './EffectiveRoutesCard';

export const OpenStackRouterSummary: FunctionComponent<ResourceSummaryProps> = (
  props,
) => {
  const Component = props.formTableItem ? FormTable.Item : Field;

  const fixedIps: string[] = props.resource.fixed_ips ?? [];
  const externalFixedIps: string[] = (props.resource.external_fixed_ips ?? [])
    .map((ip: { ip_address?: string }) => ip?.ip_address)
    .filter(Boolean);
  const externalIpSet = new Set(externalFixedIps);
  // These are all fixed IPs; what sets the gateway's apart is that they are
  // external, not that the rest are "internal". OpenStack has no label of that
  // name for an address -- it says fixed IPs here and external fixed IPs for the
  // gateway, and keeps "internal" for the interface itself.
  const interfaceFixedIps = fixedIps.filter((ip) => !externalIpSet.has(ip));
  const mappedExternalIps: string[] = (
    props.resource.offering_external_ips ?? []
  ).filter((ip: string) => !externalIpSet.has(ip));

  return (
    <>
      <Component
        label={translate('Fixed IPs')}
        value={
          interfaceFixedIps.length ? (
            <IPList value={interfaceFixedIps} />
          ) : (
            'N/A'
          )
        }
      />

      {props.resource.has_external_gateway ? (
        <Component
          label={translate('External IPs')}
          value={
            externalFixedIps.length ? (
              <IPList value={externalFixedIps} />
            ) : (
              'N/A'
            )
          }
        />
      ) : null}

      {mappedExternalIps.length ? (
        <Component
          label={translate('Mapped public IPs')}
          value={<IPList value={mappedExternalIps} />}
        />
      ) : null}

      {props.formTableItem ? null : (
        <EffectiveRoutesCard routerUuid={props.resource.uuid} />
      )}
    </>
  );
};
