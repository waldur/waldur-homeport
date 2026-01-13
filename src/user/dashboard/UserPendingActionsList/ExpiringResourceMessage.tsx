import { FC } from 'react';

import { Link } from '@waldur/core/Link';
import { translate, formatJsxTemplate } from '@waldur/i18n';

import { ExtendedUserAction } from './types';

export const ExpiringResourceMessage: FC<{ row: ExtendedUserAction }> = ({
  row,
}) => {
  return translate(
    '{resource}, a {offeringType} from the {offeringName} offering in project {project} under organization {organization}, will expire soon. Review the resource and {renew} to prevent downtime.',
    {
      resource: (
        <Link
          state="marketplace-resource-details"
          params={{ resource_uuid: row.resource_uuid }}
          label={row.resource_name || row.related_object_name || row.title}
          className="fw-bold"
        />
      ),
      offeringType: row.offering_type || translate('Resource'),
      offeringName: <span className="fw-medium">{row.offering_name}</span>,
      project:
        row.project_name && row.project_uuid ? (
          <Link
            state="project.dashboard"
            params={{ uuid: row.project_uuid }}
            label={row.project_name}
            className="fw-medium"
          />
        ) : (
          row.project_name || 'N/A'
        ),
      organization:
        row.organization_name && row.organization_uuid ? (
          <Link
            state="organization.dashboard"
            params={{ uuid: row.organization_uuid }}
            label={row.organization_name}
            className="fw-medium"
          />
        ) : (
          row.organization_name || 'N/A'
        ),
      renew: (
        <Link
          state="marketplace-resource-details"
          params={{ resource_uuid: row.resource_uuid, tab: 'actions' }}
          label={translate('renew it')}
        />
      ),
    },
    formatJsxTemplate,
  );
};
