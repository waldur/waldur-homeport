import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useAsync from 'react-use/lib/useAsync';
import { formValueSelector, clearFields } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { getProjectSecrets } from '../api';
import { FieldProps } from '../types';

import { FORM_ID } from './constants';
import { DecoratedField } from './DecoratedField';
import { SelectControl } from './SelectControl';

export const SecretField: React.FC<FieldProps> = props => {
  const project = useSelector(state =>
    formValueSelector(FORM_ID)(state, 'project'),
  );
  const { loading, error, value: options } = useAsync(
    () => (project ? getProjectSecrets(project.uuid) : Promise.resolve([])),
    [project],
  );

  const dispatch = useDispatch();

  const { variable } = props;

  const resetSecret = React.useCallback(() => {
    dispatch(clearFields(FORM_ID, false, false, variable));
  }, [dispatch, variable]);

  React.useEffect(() => resetSecret, [project, resetSecret]);

  const renderField = React.useCallback(
    fieldProps =>
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
