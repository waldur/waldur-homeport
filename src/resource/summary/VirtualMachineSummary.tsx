import { QuestionIcon } from '@phosphor-icons/react';

import { formatRelative } from '@/core/dateUtils';
import { Tip } from '@/core/Tooltip';
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
      <Tip
        id="resourceSummary"
        label={translate('Flavor name: {flavor_name}', {
          flavor_name: resource.flavor_name,
        })}
      >
        {' '}
        <QuestionIcon size={17} weight="bold" />
      </Tip>
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

      <Component
        label={translate('Internal IP')}
        value={<IPList value={props.resource.internal_ips} />}
      />

      <Component
        label={translate('Floating IP')}
        value={<IPList value={props.resource.external_ips} />}
      />

      <Component
        label={translate('External IPs')}
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
