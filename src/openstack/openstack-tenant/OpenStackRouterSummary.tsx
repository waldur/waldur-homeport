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
  const internalIps = fixedIps.filter((ip) => !externalIpSet.has(ip));
  const mappedExternalIps: string[] = (
    props.resource.offering_external_ips ?? []
  ).filter((ip: string) => !externalIpSet.has(ip));

  return (
    <>
      <Component
        label={translate('Internal IPs')}
        value={internalIps.length ? <IPList value={internalIps} /> : 'N/A'}
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
