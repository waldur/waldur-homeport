import { QueryFunction } from '@tanstack/react-query';

import { translate } from '@waldur/i18n';

import { ResourcesList } from '../ResourcesList';
import { DataPage } from '../types';

export const SecurityGroupsSection = ({ resource }) => {
  const loadData: QueryFunction<DataPage> = () => ({
    data: resource.security_groups.map((row) => ({
      name: row.name,
      summary: translate('Rules: {rules_count}', {
        rules_count: row.rules.length,
      }),
    })),
    nextPage: null,
  });
  return <ResourcesList loadData={loadData} queryKey="security_groups" />;
};
