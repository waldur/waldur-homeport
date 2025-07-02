import React from 'react';
import { Props as SelectProps } from 'react-select';
import { Field } from 'redux-form';
import { rancherProjectsList } from 'waldur-js-client';

import { parseSelectData } from '@waldur/core/api';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';
import {
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

interface ProjectAutocompleteProps {
  cluster: { uuid: string };
  reactSelectProps?: Partial<SelectProps>;
}

const loadProjects = async (query, prevOptions, { page }, clusterUuid) => {
  const response = await rancherProjectsList({
    query: {
      name: query,
      cluster_uuid: clusterUuid,
      page,
      page_size: 10,
    },
  });
  return returnReactSelectAsyncPaginateObject(
    parseSelectData(response),
    prevOptions,
    page,
  );
};

export const ProjectAutocomplete: React.FC<ProjectAutocompleteProps> = ({
  cluster,
}) => (
  <Field
    name="project"
    component={(fieldProps) => (
      <AsyncPaginate
        placeholder={translate('Select project...')}
        loadOptions={(query, prevOptions, additional) =>
          loadProjects(query, prevOptions, additional, cluster.uuid)
        }
        defaultOptions
        getOptionValue={(option) => option.uuid}
        getOptionLabel={(option) => option.name}
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        noOptionsMessage={() => translate('No projects')}
        isClearable={true}
        {...REACT_SELECT_TABLE_FILTER}
      />
    )}
  />
);
