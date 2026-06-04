import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import React from 'react';
import { marketplaceRuntimeStatesList } from 'waldur-js-client';

import { translate } from '@/i18n';
import { SelectFilter } from '@/table';
import { useProject } from '@/workspace/hooks';

export const RuntimeStateFilter: React.FC<any> = (props) => {
  const { params } = useCurrentStateAndParams();
  const project = useProject();

  const { data, isLoading } = useQuery({
    queryKey: ['runtime-states', project?.uuid, params.category_uuid],
    queryFn: () =>
      marketplaceRuntimeStatesList({
        query: {
          project_uuid: project?.uuid,
          category_uuid: params.category_uuid,
        },
      }).then((r) => r.data),
  });

  return (
    <SelectFilter
      title={translate('Runtime state')}
      name="runtime_state"
      badgeValue={(value) => value?.label}
      placeholder={translate('Select state...')}
      options={data}
      isLoading={isLoading}
      isDisabled={isLoading}
      isClearable={true}
      {...props}
    />
  );
};
