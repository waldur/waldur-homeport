import { WarningIcon } from '@phosphor-icons/react';

import { Tooltip } from 'waldur-ui';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';

import { ResourceIconName } from './ResourceIconName';
import { ResourceLink } from './ResourceLink';

interface ResourceNameProps {
  resource: {
    marketplace_uuid?: string;
    name?: string;
    uuid?: string;
    resource_type?: string;
    project_uuid?: string;
    is_link_valid?: boolean;
    marketplace_resource_uuid?: string;
  };
}

const ResourceWarning = (props: ResourceNameProps) =>
  props.resource.is_link_valid === false ? (
    <Tooltip
      label={translate('Provider does not comply with project policies')}
    >
      <WarningIcon className="text-muted ms-1" weight="bold" />
    </Tooltip>
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
        label={<ResourceIconName resource={props.resource} />}
      />

      <ResourceWarning resource={props.resource} />
    </>
  ) : (
    <ResourceIconName resource={props.resource} />
  );
