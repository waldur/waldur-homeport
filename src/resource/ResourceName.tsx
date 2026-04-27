import { WarningIcon } from '@phosphor-icons/react';

import { Link } from '@/core/Link';
import { Tip } from '@/core/Tooltip';
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
    <Tip
      id={`resourceWarning-${props.resource.uuid}`}
      label={translate('Provider does not comply with project policies')}
    >
      {' '}
      <WarningIcon className="text-muted" weight="bold" />
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
        label={<ResourceIconName resource={props.resource} />}
      />

      <ResourceWarning resource={props.resource} />
    </>
  ) : (
    <ResourceIconName resource={props.resource} />
  );
