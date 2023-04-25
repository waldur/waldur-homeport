import { FunctionComponent } from 'react';

import { OrganizationGroup } from '@waldur/marketplace/offerings/service-providers/shared/OrganizationGroup';
import { OrganizationGroup as OrganizationGroupType } from '@waldur/marketplace/types';

interface OrganizationGroupProps {
  organizationGroups: OrganizationGroupType[];
}

export const OrganizationGroups: FunctionComponent<OrganizationGroupProps> = ({
  organizationGroups,
}) =>
  organizationGroups && organizationGroups.length > 0 ? (
    <div className="m-b">
      {organizationGroups.map(
        (organizationGroup: OrganizationGroupType, index: number) => (
          <OrganizationGroup
            key={index}
            organizationGroup={organizationGroup.name}
          />
        ),
      )}
    </div>
  ) : null;
