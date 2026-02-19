import { FC, useMemo } from 'react';
import { PublicOfferingDetails } from 'waldur-js-client';

import { TableWithTabs } from '@waldur/table/TableWithTabs';

import { getRancherTabsAndTitle } from './utils';

export const TeamTable: FC<{
  resourceScope;
  offering: PublicOfferingDetails;
}> = ({ resourceScope, offering }) => {
  const { title, tabs } = useMemo(() => getRancherTabsAndTitle('team'), []);

  return (
    <TableWithTabs
      title={title}
      tabs={tabs}
      data={{ resourceScope, offering }}
    />
  );
};
