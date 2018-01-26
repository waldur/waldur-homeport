import * as React from 'react';

import { Field } from '@waldur/resource/summary/Field';
import { ResourceSummaryBase } from '@waldur/resource/summary/ResourceSummaryBase';

export const ZabbixHostSummary = ({ resource, translate }) => (
  <>
    <ResourceSummaryBase resource={resource}/>
    <Field
      label={translate('Host name')}
      value={resource.visible_name}
    />
    <Field
      label={translate('Host status')}
      value={resource.status}
    />
    <Field
      label={translate('Host IP address')}
      value={resource.interface_parameters.ip}
    />
    <Field
      label={translate('Host group name')}
      value={resource.host_group_name}
    />
  </>
);
