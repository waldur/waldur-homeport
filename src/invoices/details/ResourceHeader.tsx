import { Link } from '@waldur/core/Link';

export const ResourceHeader = ({ toggled, resource }) => (
  <div className="fs-6">
    {toggled ? (
      <i className="fa fa-chevron-down" />
    ) : (
      <i className="fa fa-chevron-right" />
    )}{' '}
    {resource.name} {resource.offering_name && `/ ${resource.offering_name} `}
    {resource.uuid ? (
      <Link
        state="marketplace-resource-details"
        params={{ resource_uuid: resource.uuid }}
        className="hidden-print"
      >
        <i className="fa fa-external-link" />
      </Link>
    ) : null}
  </div>
);
