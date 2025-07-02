import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useAsync } from 'react-use';
import { formValueSelector, clearFields } from 'redux-form';
import { rancherProjectsSecretsRetrieve } from 'waldur-js-client';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { type RootState } from '@waldur/store/reducers';

import { FieldProps } from '../types';

import { FORM_ID } from './constants';
import { DecoratedField } from './DecoratedField';
import { SelectControl } from './SelectControl';

export const SecretField: React.FC<FieldProps> = (props) => {
  const project = useSelector((state: RootState) =>
    formValueSelector(FORM_ID)(state, 'project'),
  );
  const {
    loading,
    error,
    value: options,
  } = useAsync(
    () =>
      project
        ? rancherProjectsSecretsRetrieve({ path: { uuid: project.uuid } }).then(
            (r) => r.data,
          )
        : Promise.resolve([]),
    [project],
  );

  const dispatch = useDispatch();

  const { variable } = props;

  const resetSecret = React.useCallback(() => {
    dispatch(clearFields(FORM_ID, false, false, variable));
  }, [dispatch, variable]);

  React.useEffect(() => resetSecret, [project, resetSecret]);

  const renderField = React.useCallback(
    (fieldProps) =>
      loading ? (
        <LoadingSpinner />
      ) : error ? (
        <>{translate('Unable to load data.')}</>
      ) : (
        <SelectControl
          options={options}
          input={fieldProps.input}
          getLabel={({ name }) => name}
          getValue={({ id }) => id}
        />
      ),

    [options, loading, error],
  );
  return <DecoratedField {...props} component={renderField} />;
};
