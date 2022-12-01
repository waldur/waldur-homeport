import { UISref } from '@uirouter/react';

export const ResourceLink = ({ row, children }) => (
  <UISref
    to="marketplace-project-resource-details"
    params={{
      uuid: row.project_uuid,
      resource_uuid: row.marketplace_resource_uuid,
    }}
  >
    <a>{children}</a>
  </UISref>
);
