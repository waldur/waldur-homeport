import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import React from 'react';
import { marketplaceRuntimeStatesList } from 'waldur-js-client';

import { translate } from '@/i18n';
import { SelectFilter } from '@/table';
import { useProject } from '@/workspace/hooks';

interface RuntimeStateFilterProps {
  /** Limits the offered states to the resources of a single offering. */
  offeringUuid?: string;
  /** Limits the offered states to the resources of a single organization. */
  customerUuid?: string;
  [key: string]: any;
}

export const RuntimeStateFilter: React.FC<RuntimeStateFilterProps> = ({
  offeringUuid,
  customerUuid,
  ...props
}) => {
  const { params } = useCurrentStateAndParams();
  const project = useProject();
  const categoryUuid = params.category_uuid;
  const projectUuid = project?.uuid;
  const hasScope = Boolean(
    offeringUuid || categoryUuid || projectUuid || customerUuid,
  );

  const { data, isLoading } = useQuery({
    queryKey: [
      'runtime-states',
      projectUuid,
      categoryUuid,
      offeringUuid,
      customerUuid,
    ],
    queryFn: () =>
      marketplaceRuntimeStatesList({
        query: {
          project_uuid: projectUuid,
          category_uuid: categoryUuid,
          offering_uuid: offeringUuid,
          customer_uuid: customerUuid,
        },
      }).then((r) => r.data),
    enabled: hasScope,
  });

  if (!hasScope) {
    return null;
  }

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
