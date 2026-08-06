import { FC, useMemo, useState } from 'react';
import { Offering } from 'waldur-js-client';

import { translate } from '@/i18n';
import { TableTab } from '@/table/types';

import { OfferingConsumerSubnetsTable } from '../access-subnets/OfferingConsumerSubnetsTable';
import { OfferingDefaultSubnetsTable } from '../access-subnets/OfferingDefaultSubnetsTable';

interface OwnProps {
  offering: Offering;
}

export const OfferingAccessSubnetsPanel: FC<OwnProps> = ({ offering }) => {
  const [activeTab, setActiveTab] = useState<'defaults' | 'consumers'>(
    'defaults',
  );

  const tabs: TableTab[] = useMemo(
    () => [
      {
        key: 'defaults',
        title: translate('Default allowed subnets'),
        onSelect: (key) => setActiveTab(key as 'defaults' | 'consumers'),
        active: activeTab === 'defaults',
      },
      {
        key: 'consumers',
        title: translate('Access subnets by organization'),
        onSelect: (key) => setActiveTab(key as 'defaults' | 'consumers'),
        active: activeTab === 'consumers',
      },
    ],
    [activeTab],
  );

  return activeTab === 'defaults' ? (
    <OfferingDefaultSubnetsTable offering={offering} tabs={tabs} />
  ) : (
    <OfferingConsumerSubnetsTable offering={offering} tabs={tabs} />
  );
};
