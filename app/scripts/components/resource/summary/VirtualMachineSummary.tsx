import * as React from 'react';

import { formatRelative } from '@waldur/core/dateUtils';
import { Tooltip } from '@waldur/core/Tooltip';
import { withTranslation } from '@waldur/i18n';
import { formatSummary, formatCommaList } from '@waldur/resource/utils';

import { Field } from './Field';
import { ResourceAccessInfo } from './ResourceAccessInfo';
import { PureResourceSummaryBase } from './ResourceSummaryBase';
import { ResourceSummaryProps } from './types';

const formatUptime = props =>
  props.resource.start_time ? formatRelative(props.resource.start_time) : null;

const ResourceSummaryField = ({ translate, resource }) => (
  <>
    {formatSummary(resource)}
    {resource.flavor_name && (
      <Tooltip
        id="resourceSummary"
        label={translate('Flavor name: {flavor_name}', {flavor_name: resource.flavor_name})}>
        {' '}
        <i className="fa fa-question-circle"/>
      </Tooltip>
    )}
  </>
);

export const PureVirtualMachineSummary = (props: ResourceSummaryProps) => {
  const { translate } = props;
  return (
    <>
      <PureResourceSummaryBase {...props}/>
      <Field
        label={translate('Summary')}
        value={<ResourceSummaryField {...props}/>}
      />
      <Field
        label={translate('Access')}
        value={<ResourceAccessInfo {...props}/>}
      />
      <Field
        label={translate('Internal IP')}
        value={formatCommaList(props.resource.internal_ips)}
      />
      <Field
        label={translate('External IP')}
        value={formatCommaList(props.resource.external_ips)}
      />
      <Field
        label={translate('SSH key')}
        value={props.resource.key_name}
      />
      <Field
        label={translate('Uptime')}
        value={formatUptime(props)}
      />
    </>
  );
};

export const VirtualMachineSummary = withTranslation(PureVirtualMachineSummary);
