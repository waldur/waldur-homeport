import * as React from 'react';

import { formatFilesize, getUUID } from '@waldur/core/utils';
import { withTranslation } from '@waldur/i18n';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import {
  Field,
  ResourceSummaryProps,
  PureResourceSummaryBase,
} from '@waldur/resource/summary';

const formatVolume = props => (
  <ResourceLink
    type="OpenStackTenant.Volume"
    uuid={getUUID(props.source_volume)}
    label={props.source_volume_name}
  />
);

const PureOpenStackSnapshotSummary = (props: ResourceSummaryProps) => {
  const { translate, resource } = props;
  return (
    <span>
      <PureResourceSummaryBase {...props} />
      <Field label={translate('Size')} value={formatFilesize(resource.size)} />
      <Field label={translate('Volume')} value={formatVolume(resource)} />
    </span>
  );
};

export const OpenStackSnapshotSummary = withTranslation(
  PureOpenStackSnapshotSummary,
);
