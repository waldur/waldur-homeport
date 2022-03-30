import { FunctionComponent } from 'react';

import { Tip } from '@waldur/core/Tooltip';

import { ServiceProviderIcon } from './ServiceProviderIcon';

export const OrganizationTitle: FunctionComponent<{ organization }> = ({
  organization,
}) =>
  organization.abbreviation ? (
    <Tip
      label={organization.name}
      id={`full-name-${organization.uuid}`}
      className="select-workspace-dialog__tooltip--order"
    >
      <div className="ellipsis">
        {organization.abbreviation}
        <ServiceProviderIcon organization={organization} />
      </div>
    </Tip>
  ) : (
    <div className="ellipsis">
      {organization.name}
      <ServiceProviderIcon organization={organization} />
    </div>
  );
