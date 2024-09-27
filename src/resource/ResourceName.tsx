import { Warning } from '@phosphor-icons/react';
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
    marketplace_uuid?: string;
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
      alt="resource"
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
      <Warning className="text-muted" />
    </Tip>
  ) : null;

export const ResourceName = (props: ResourceNameProps) =>
  props.resource.marketplace_resource_uuid ? (
    <Link
      state="marketplace-resource-details"
      params={{
        resource_uuid: props.resource.marketplace_resource_uuid,
      }}
      label={props.resource.name}
    />
  ) : props.resource.marketplace_uuid ? (
    <>
      <ResourceLink
        uuid={props.resource.marketplace_uuid}
        label={<ResourceIcon resource={props.resource} />}
      />
      <ResourceWarning resource={props.resource} />
    </>
  ) : (
    <ResourceIcon resource={props.resource} />
  );
