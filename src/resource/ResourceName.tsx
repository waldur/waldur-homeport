import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

import { ResourceLink } from './ResourceLink';
import { formatDefault, formatResourceType, getResourceIcon } from './utils';

interface ResourceIconProps {
  resource: {
    name: string;
    uuid: string;
    resource_type: string;
  };
}

interface ResourceNameProps {
  resource: {
    name: string;
    uuid: string;
    resource_type: string;
    project_uuid: string;
    is_link_valid?: boolean;
    marketplace_resource_uuid?: string;
  };
}

export const ResourceIcon: FunctionComponent<ResourceIconProps> = (props) => (
  <Tip
    id={`resourceIcon-${props.resource.uuid}`}
    label={formatResourceType(props.resource)}
  >
    <img
      src={getResourceIcon(props.resource.resource_type)}
      className="me-1"
      width={25}
    />{' '}
    {formatDefault(props.resource.name)}
  </Tip>
);

const ResourceWarning = (props: ResourceNameProps) =>
  props.resource.is_link_valid === false ? (
    <Tip
      id={`resourceWarning-${props.resource.uuid}`}
      label={translate('Provider does not comply with project policies')}
    >
      {' '}
      <i className="fa fa-exclamation-triangle text-muted" />
    </Tip>
  ) : null;

export const ResourceName = (props: ResourceNameProps) =>
  props.resource.marketplace_resource_uuid ? (
    <Link
      state="marketplace-project-resource-details"
      params={{
        resource_uuid: props.resource.marketplace_resource_uuid,
        uuid: props.resource.project_uuid,
      }}
      label={props.resource.name}
    />
  ) : (
    <>
      <ResourceLink
        uuid={props.resource.uuid}
        type={props.resource.resource_type}
        project={props.resource.project_uuid}
        label={<ResourceIcon resource={props.resource} />}
      />
      <ResourceWarning resource={props.resource} />
    </>
  );
