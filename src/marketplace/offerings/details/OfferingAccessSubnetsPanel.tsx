import { FC, useMemo, useState } from 'react';
import { Offering } from 'waldur-js-client';

import { translate } from '@/i18n';
import { TableTab } from '@/table/types';

import { OfferingDefaultSubnetsTable } from '../access-subnets/OfferingDefaultSubnetsTable';
import { OfferingResourceSubnetsTable } from '../access-subnets/OfferingResourceSubnetsTable';

interface OwnProps {
  offering: Offering;
}

export const OfferingAccessSubnetsPanel: FC<OwnProps> = ({ offering }) => {
  const [activeTab, setActiveTab] = useState<'defaults' | 'resources'>(
    'defaults',
  );

  const tabs: TableTab[] = useMemo(
    () => [
      {
        key: 'defaults',
        title: translate('Default allowed subnets'),
        onSelect: (key) => setActiveTab(key as 'defaults' | 'resources'),
        active: activeTab === 'defaults',
      },
      {
        key: 'resources',
        title: translate('Access subnets by resource'),
        onSelect: (key) => setActiveTab(key as 'defaults' | 'resources'),
        active: activeTab === 'resources',
      },
    ],
    [activeTab],
  );

  return activeTab === 'defaults' ? (
    <OfferingDefaultSubnetsTable offering={offering} tabs={tabs} />
  ) : (
    <OfferingResourceSubnetsTable offering={offering} tabs={tabs} />
  );
};
