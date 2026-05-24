import { FC } from 'react';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';

import { ExtendedUserAction } from './types';

export const ActionContext: FC<{ row: ExtendedUserAction }> = ({ row }) => {
  return (
    <div className="d-flex align-items-center gap-3 flex-wrap mt-2">
      {row.organization_name && row.organization_uuid && (
        <div className="d-flex align-items-center gap-1">
          <span className="text-muted small">{translate('Organization')}:</span>
          <Link
            state="organization.dashboard"
            params={{ uuid: row.organization_uuid }}
            label={row.organization_name}
            className="small fw-medium"
          />
        </div>
      )}
      {row.project_name && row.project_uuid && (
        <div className="d-flex align-items-center gap-1">
          <span className="text-muted small">{translate('Project')}:</span>
          <Link
            state="project.dashboard"
            params={{ uuid: row.project_uuid }}
            label={row.project_name}
            className="small fw-medium"
          />
        </div>
      )}
      {row.offering_name && (
        <div className="d-flex align-items-center gap-1">
          <span className="text-muted small">{translate('Offering')}:</span>
          <span className="small">{row.offering_name}</span>
        </div>
      )}
    </div>
  );
};
