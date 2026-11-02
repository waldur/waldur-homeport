import { HelpIcon, PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { IPList } from '@/resource/IPList';
import { formatSummary } from '@/resource/utils';

import { ResourceSummaryProps } from './types';

export const ResourceSummaryField = ({ resource }) => (
  <>
    {formatSummary(resource)}
    {resource.flavor_name && (
      <HelpIcon
        label={translate('Flavor name: {flavor_name}', {
          flavor_name: resource.flavor_name,
        })}
        size={17}
        className="ms-1"
      />
    )}
  </>
);

export const PureVirtualMachineSummary = (props: ResourceSummaryProps) => {
  return (
    <>
      <PropertyItem
        label={translate('Summary')}
        value={<ResourceSummaryField {...props} />}
      />

      {/*
        Three different things, so three different names. `internal_ips` are the
        addresses the instance holds on the tenant's own networks -- fixed IPs,
        in Nova's own term, which says where an address comes from rather than
        who can reach it. `external_ips` are the floating IPs plus any directly
        connected ones, so "Floating IPs" would not cover them. `external_address`
        is narrower still: the address a floating IP is itself mapped to.
      */}
      <PropertyItem
        label={translate('Fixed IPs')}
        value={<IPList value={props.resource.internal_ips} />}
      />

      <PropertyItem
        label={translate('External IPs')}
        value={<IPList value={props.resource.external_ips} />}
      />

      <PropertyItem
        label={translate('Mapped public IPs')}
        value={<IPList value={props.resource.external_address} />}
      />

      <PropertyItem
        label={translate('SSH key')}
        value={props.resource.key_name}
        tooltip={props.resource.key_fingerprint}
        hasCopy
      />

      <PropertyItem
        label={translate('Uptime')}
        value={propVal.date(props.resource.start_time, {
          precision: 'datetime',
          relative: true,
        })}
      />
    </>
  );
};
