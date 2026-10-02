import { useCurrentStateAndParams } from '@uirouter/react';
import { Resource } from 'waldur-js-client';

import { Link } from '@/core/Link';
import { formatJsxTemplate, translate } from '@/i18n';
import openstackIcon from '@/images/appstore/icon-openstack.png';
import { isDescendantOf } from '@/navigation/useTabs';

interface ParentLinkProps {
  parent_name: string;
  /** UI-Router state to navigate to */
  state: string;
  /** Params for the state link */
  params: Record<string, string>;
  icon?: string;
  iconAlt?: string;
}

export const ParentLink = ({
  parent_name,
  state,
  params,
  icon,
  iconAlt,
}: ParentLinkProps) => (
  <>
    {icon && <img src={icon} width={15} className="me-1" alt={iconAlt || ''} />}
    {translate(
      'Part of {resource}',
      {
        resource: (
          <Link state={state} params={params}>
            {parent_name}
          </Link>
        ),
      },
      formatJsxTemplate,
    )}
  </>
);

export const ParentResourceLink = ({ resource }: { resource: Resource }) => {
  // In the provider workspace the parent is opened in the provider's view too,
  // as the consumer page is not readable by provider-side roles.
  const { state, params } = useCurrentStateAndParams();
  const inProviderWorkspace = isDescendantOf('marketplace-provider', state);
  return resource.parent_uuid && resource.parent_name ? (
    <p className="text-muted fs-7 mb-0">
      {inProviderWorkspace ? (
        <ParentLink
          parent_name={resource.parent_name}
          state="marketplace-provider-resource-details"
          params={{ uuid: params.uuid, resource_uuid: resource.parent_uuid }}
          icon={openstackIcon}
          iconAlt="openstack"
        />
      ) : (
        <ParentLink
          parent_name={resource.parent_name}
          state="marketplace-resource-details"
          params={{ resource_uuid: resource.parent_uuid }}
          icon={openstackIcon}
          iconAlt="openstack"
        />
      )}
    </p>
  ) : (
    <p className="me-1"> </p>
  );
};
