import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import React from 'react';
import { useSelector } from 'react-redux';
import { Field } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { getRuntimeStates } from '@waldur/marketplace/common/api';
import { getProject } from '@waldur/workspace/selectors';

export const RuntimeStateFilter: React.FC<{}> = () => {
  const { params } = useCurrentStateAndParams();
  const project = useSelector(getProject);

  const { data, isLoading } = useQuery(
    ['runtime-states', project.uuid, params.category_uuid],
    () => getRuntimeStates(project.uuid, params.category_uuid),
  );

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
        />
      )}
    />
  );
};
