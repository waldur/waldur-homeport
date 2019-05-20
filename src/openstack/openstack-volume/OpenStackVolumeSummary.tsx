import * as React from 'react';

import { formatFilesize, getUUID } from '@waldur/core/utils';
import { withTranslation } from '@waldur/i18n';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import { Field, ResourceSummaryProps, PureResourceSummaryBase } from '@waldur/resource/summary';

const formatSize = props => {
  const filesize = formatFilesize(props.resource.size);
  return props.resource.bootable ? `${props.translate('bootable')} ${filesize}` : filesize;
};

const formatInstance = props =>
  props.resource.instance ? (
    <ResourceLink
      type="OpenStackTenant.Instance"
      uuid={getUUID(props.resource.instance)}
      label={props.resource.instance_name}
    />
  ) : <span>&ndash;</span>;

const PureOpenStackVolumeSummary = (props: ResourceSummaryProps) => {
  const { translate, resource } = props;
  return (
    <span>
      <PureResourceSummaryBase {...props}/>
      <Field
        label={translate('Size')}
        value={formatSize(props)}
      />
      <Field
        label={translate('Attached to')}
        value={formatInstance(props)}
      />
      <Field
        label={translate('Device')}
        value={resource.device}
      />
      <Field
        label={translate('Availability zone')}
        value={resource.availability_zone_name}
      />
    </span>
  );
};

export const OpenStackVolumeSummary = withTranslation(PureOpenStackVolumeSummary);
