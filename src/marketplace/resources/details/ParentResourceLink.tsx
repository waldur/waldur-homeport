import { Resource } from 'waldur-js-client';

import { Link } from '@waldur/core/Link';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import openstackIcon from '@waldur/images/appstore/icon-openstack.png';

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
  <p className="text-muted fs-7 mb-0">
    <i>
      {icon && (
        <img src={icon} width={15} className="me-1" alt={iconAlt || ''} />
      )}
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
    </i>
  </p>
);

export const ParentResourceLink = ({ resource }: { resource: Resource }) =>
  resource.parent_uuid && resource.parent_name ? (
    <ParentLink
      parent_name={resource.parent_name}
      state="marketplace-resource-details"
      params={{ resource_uuid: resource.parent_uuid }}
      icon={openstackIcon}
      iconAlt="openstack"
    />
  ) : (
    <p className="me-1"> </p>
  );
