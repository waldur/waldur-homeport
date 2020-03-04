import * as React from 'react';

import { withTranslation, TranslateProps } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary/Field';
import { ResourceSummaryBase } from '@waldur/resource/summary/ResourceSummaryBase';
import { Resource } from '@waldur/resource/types';

interface ZabbixHost extends Resource {
  visible_name: string;
  status: string;
  interface_parameters?: {
    ip: string;
  };
  host_group_name: string;
}

interface Props extends TranslateProps {
  resource: ZabbixHost;
}

export const ZabbixHostSummary = withTranslation(
  ({ resource, translate }: Props) => (
    <>
      <ResourceSummaryBase resource={resource} />
      <Field label={translate('Host name')} value={resource.visible_name} />
      <Field label={translate('Host status')} value={resource.status} />
      <Field
        label={translate('Host IP address')}
        value={
          resource.interface_parameters && resource.interface_parameters.ip
        }
      />
      <Field
        label={translate('Host group name')}
        value={resource.host_group_name}
      />
    </>
  ),
);
