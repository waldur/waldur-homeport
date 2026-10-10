import { FC } from 'react';
import { OpenStackSecurityGroup } from 'waldur-js-client';

import { translate } from '@/i18n';
import { EmbeddedTabs } from '@/table/EmbeddedTabs';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { SecurityGroupInstancesList } from './SecurityGroupInstancesList';
import { SecurityGroupRulesTable } from './SecurityGroupRulesList';

export const SecurityGroupExpandableRow: FC<{
  row: OpenStackSecurityGroup;
  fetch: (force?: boolean) => void;
}> = ({ row, fetch }) => {
  return (
    <ExpandableContainer>
      <EmbeddedTabs
        defaultValue="rules"
        listClassName="mb-4"
        tabs={[
          {
            key: 'rules',
            title: translate('Rules'),
            content: <SecurityGroupRulesTable row={row} />,
          },
          {
            key: 'instances',
            title: translate('Instances'),
            content: (
              <SecurityGroupInstancesList row={row} refetchGroups={fetch} />
            ),
          },
        ]}
      />
    </ExpandableContainer>
  );
};
