import { UISref } from '@uirouter/react';

import { translate } from '@waldur/i18n';

export const ResourceLink = ({ row }) => (
  <UISref
    to="marketplace-project-resource-details"
    params={{
      uuid: row.project_uuid,
      resource_uuid: row.marketplace_resource_uuid,
    }}
  >
    <a className="cursor-pointer text-dark text-decoration-underline text-hover-primary">
      {translate('To instance')}
    </a>
  </UISref>
);
