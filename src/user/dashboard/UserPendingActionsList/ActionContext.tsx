import { FC } from 'react';
import { UserAction } from 'waldur-js-client';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

import { ExtendedUserAction } from './types';

export const ActionContext: FC<{ row: UserAction }> = ({ row }) => {
  const extendedRow = row as unknown as ExtendedUserAction;

  return (
    <div className="d-flex align-items-center gap-3 flex-wrap mt-2">
      {extendedRow.organization_name && extendedRow.organization_uuid && (
        <div className="d-flex align-items-center gap-1">
          <span className="text-muted small">{translate('Organization')}:</span>
          <Link
            state="organization.dashboard"
            params={{ uuid: extendedRow.organization_uuid }}
            label={extendedRow.organization_name}
            className="small fw-medium"
          />
        </div>
      )}
      {extendedRow.project_name && extendedRow.project_uuid && (
        <div className="d-flex align-items-center gap-1">
          <span className="text-muted small">{translate('Project')}:</span>
          <Link
            state="project.dashboard"
            params={{ uuid: extendedRow.project_uuid }}
            label={extendedRow.project_name}
            className="small fw-medium"
          />
        </div>
      )}
      {extendedRow.offering_name && (
        <div className="d-flex align-items-center gap-1">
          <span className="text-muted small">{translate('Offering')}:</span>
          <span className="small">{extendedRow.offering_name}</span>
        </div>
      )}
    </div>
  );
};
