import { FC, useMemo } from 'react';

import { TableWithTabs } from '@waldur/table/TableWithTabs';

import { getRancherTabsAndTitle } from './utils';

export const TeamTable: FC<{ resourceScope }> = ({ resourceScope }) => {
  const { title, tabs } = useMemo(() => getRancherTabsAndTitle('team'), []);

  return <TableWithTabs title={title} tabs={tabs} data={{ resourceScope }} />;
};
