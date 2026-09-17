import { QuestionIcon } from '@phosphor-icons/react';

import { Tooltip } from 'waldur-ui';

import { formatRelative } from '@/core/dateUtils';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { formatSummary } from '@/resource/utils';

import { IPList } from '../IPList';

import { Field } from './Field';
import { ResourceSummaryProps } from './types';

const formatUptime = (props) =>
  props.resource.start_time ? formatRelative(props.resource.start_time) : null;

export const ResourceSummaryField = ({ resource }) => (
  <>
    {formatSummary(resource)}
    {resource.flavor_name && (
      <Tooltip
        label={translate('Flavor name: {flavor_name}', {
          flavor_name: resource.flavor_name,
        })}
      >
        <QuestionIcon size={17} weight="bold" className="ms-1" />
      </Tooltip>
    )}
  </>
);

export const PureVirtualMachineSummary = (props: ResourceSummaryProps) => {
  const Component = props.formTableItem ? FormTable.Item : Field;
  return (
    <>
      <Component
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
      <Component
        label={translate('Fixed IPs')}
        value={<IPList value={props.resource.internal_ips} />}
      />

      <Component
        label={translate('External IPs')}
        value={<IPList value={props.resource.external_ips} />}
      />

      <Component
        label={translate('Mapped public IPs')}
        value={<IPList value={props.resource.external_address} />}
      />

      <Component
        label={translate('SSH key')}
        value={props.resource.key_name}
        tooltip={props.resource.key_fingerprint}
        hasCopy
      />

      <Component label={translate('Uptime')} value={formatUptime(props)} />
    </>
  );
};
