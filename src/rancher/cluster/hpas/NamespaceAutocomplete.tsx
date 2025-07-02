import React from 'react';
import { Field } from 'redux-form';
import { rancherNamespacesList } from 'waldur-js-client';

import { parseSelectData } from '@waldur/core/api';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';
import {
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

interface NamespaceAutocompleteProps {
  cluster: { uuid: string };
}

const loadNamespaces = async (query, prevOptions, { page }, clusterUuid) => {
  const response = await rancherNamespacesList({
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

export const NamespaceAutocomplete: React.FC<NamespaceAutocompleteProps> = ({
  cluster,
}) => (
  <Field
    name="namespace"
    component={(fieldProps) => (
      <AsyncPaginate
        placeholder={translate('Select namespace...')}
        loadOptions={(query, prevOptions, additional) =>
          loadNamespaces(query, prevOptions, additional, cluster.uuid)
        }
        defaultOptions
        getOptionValue={(option) => option.uuid}
        getOptionLabel={(option) => option.name}
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        noOptionsMessage={() => translate('No namespaces')}
        isClearable={true}
        {...REACT_SELECT_TABLE_FILTER}
      />
    )}
  />
);
