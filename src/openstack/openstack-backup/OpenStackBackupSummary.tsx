import * as React from 'react';

import { getUUID } from '@waldur/core/utils';
import { withTranslation } from '@waldur/i18n';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import {
  Field,
  ResourceSummaryProps,
  PureResourceSummaryBase,
} from '@waldur/resource/summary';

const formatInstance = props => (
  <ResourceLink
    type="OpenStackTenant.Instance"
    uuid={getUUID(props.instance)}
    label={props.instance_name}
  />
);

const PureOpenStackBackupSummary = (props: ResourceSummaryProps) => {
  const { translate, resource } = props;
  return (
    <span>
      <PureResourceSummaryBase {...props} />
      <Field label={translate('Instance')} value={formatInstance(resource)} />
    </span>
  );
};

export const OpenStackBackupSummary = withTranslation(
  PureOpenStackBackupSummary,
);
