import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import React from 'react';
import { useSelector } from 'react-redux';
import { Field } from 'redux-form';
import { marketplaceRuntimeStatesList } from 'waldur-js-client';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { REACT_SELECT_TABLE_FILTER, Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { getProject } from '@waldur/workspace/selectors';

export const RuntimeStateFilter: React.FC<{}> = () => {
  const { params } = useCurrentStateAndParams();
  const project = useSelector(getProject);

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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Field
      name="runtime_state"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Select state...')}
          options={data}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          isClearable={true}
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  );
};
