import { QueryFunction } from 'react-query';

import { fixURL } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { parseResponse } from '@waldur/table/api';

import { ResourcesSection } from '../ResourcesSection';
import { DataPage } from '../types';

export const SecurityGroupsSection = ({ resource }) => {
  const loadData: QueryFunction<DataPage> = async (context) => {
    const response = await parseResponse(
      fixURL('/openstack-security-groups/'),
      {
        tenant: resource.url,
        fields: ['name', 'rules'],
        page: context.pageParam,
      },
      { signal: context.signal },
    );
    return {
      data: response.rows.map((instance) => ({
        name: instance.name,
        summary: translate('Rules: {rules}', {
          rules: instance.rules.length,
        }),
        state: instance.state,
      })),
      nextPage: response.nextPage,
    };
  };
  return (
    <ResourcesSection
      loadData={loadData}
      queryKey="security_groups"
      canAdd={true}
    />
  );
};
