import { FunctionComponent } from 'react';

import { Tooltip } from '@waldur/core/Tooltip';

import { ServiceProviderIcon } from './ServiceProviderIcon';

export const OrganizationTitle: FunctionComponent<{ organization }> = ({
  organization,
}) =>
  organization.abbreviation ? (
    <Tooltip
      label={organization.name}
      id={`full-name-${organization.uuid}`}
      className="select-workspace-dialog__tooltip--order"
    >
      <div className="ellipsis">
        {organization.abbreviation}
        <ServiceProviderIcon organization={organization} />
      </div>
    </Tooltip>
  ) : (
    <div className="ellipsis">
      {organization.name}
      <ServiceProviderIcon organization={organization} />
    </div>
  );
