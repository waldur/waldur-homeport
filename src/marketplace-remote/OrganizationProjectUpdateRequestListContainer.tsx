import { Panel } from '@waldur/core/Panel';

import { OrganizationProjectUpdateRequestListFilter } from './OrganizationProjectUpdateRequestListFilter';
import { OrganizationProjectUpdateRequestsList } from './OrganizationProjectUpdateRequestsList';

export const OrganizationProjectUpdateRequestListContainer = () => (
  <Panel>
    <OrganizationProjectUpdateRequestsList
      filters={<OrganizationProjectUpdateRequestListFilter />}
    />
  </Panel>
);
