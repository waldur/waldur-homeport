import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useForm, useFormState } from 'react-final-form';
import { rancherProjectsSecretsList, Secret } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

import { FieldProps } from '../types';

import { DecoratedField } from './DecoratedField';
import { SelectControl } from './SelectControl';

export const SecretField: React.FC<FieldProps> = (props) => {
  const { values } = useFormState({ subscription: { values: true } });
  const project = values?.project;
  const {
    isLoading: loading,
    error,
    data: options,
  } = useQuery({
    queryKey: ['SecretField', project],

    queryFn: () =>
      project
        ? rancherProjectsSecretsList({ path: { uuid: project.uuid } }).then(
            (r) => r.data,
          )
        : Promise.resolve<Secret[]>([]),
  });

  const form = useForm();

  const { variable } = props;

  const resetSecret = React.useCallback(() => {
    form.change(variable, undefined);
  }, [form, variable]);

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
