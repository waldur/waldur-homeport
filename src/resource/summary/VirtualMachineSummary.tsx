import { formatRelative } from '@waldur/core/dateUtils';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { formatSummary } from '@waldur/resource/utils';

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
        <i className="fa fa-question-circle" />
      </Tip>
    )}
  </>
);

export const PureVirtualMachineSummary = (props: ResourceSummaryProps) => {
  return (
    <>
      <Field
        label={translate('Summary')}
        value={<ResourceSummaryField {...props} />}
      />
      <Field
        label={translate('Internal IP')}
        value={<IPList value={props.resource.internal_ips} />}
      />
      <Field
        label={translate('External IP')}
        value={<IPList value={props.resource.external_ips} />}
      />
      <Field
        label={translate('SSH key')}
        value={props.resource.key_name}
        helpText={props.resource.key_fingerprint}
      />
      <Field label={translate('Uptime')} value={formatUptime(props)} />
    </>
  );
};
