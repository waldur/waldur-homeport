import * as React from 'react';

import { Tooltip } from '@waldur/core/Tooltip';
import { withTranslation } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';

import { ResourceLink } from './ResourceLink';
import { getResourceIcon, formatResourceType, formatDefault } from './utils';

interface ResourceNameProps {
  resource: {
    name: string;
    uuid: string;
    resource_type: string;
    is_link_valid: boolean;
  };
}

const ResourceIcon = (props: ResourceNameProps) => (
  <Tooltip
    id="resourceIcon"
    label={formatResourceType(props.resource)}>
    <img
      src={getResourceIcon(props.resource.resource_type)}
      className="img-xs m-r-xs"
    />
    {' '}
    {formatDefault(props.resource.name)}
  </Tooltip>
);

const ResourceWarning = withTranslation(props =>
  !props.resource.is_link_valid ? (
    <Tooltip
      id="resourceWarning"
      label={props.translate('Provider does not comply with project policies')}>
      {' '}
      <i className="fa fa-exclamation-triangle text-muted"/>
    </Tooltip>
  ) : null);

export const ResourceName = (props: ResourceNameProps) => (
  <span>
    <ResourceLink
      uuid={props.resource.uuid}
      type={props.resource.resource_type}
      label={<ResourceIcon resource={props.resource}/>}
    />
    <ResourceWarning resource={props.resource}/>
  </span>
);

export default connectAngularComponent(ResourceName, ['resource']);
