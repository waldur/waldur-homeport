import React, { FunctionComponent } from 'react';
import { FormControl } from 'react-bootstrap';
import { Field, useFormState } from 'react-final-form';

import { required } from '@/core/validators';
import { FieldError } from '@/form';
import { translate } from '@/i18n';

import { Namespace } from '../types';

import { DecoratedField } from './DecoratedField';
import { SelectControl } from './SelectControl';

const NamespaceSwitcher: FunctionComponent = () => (
  <Field
    name="useNewNamespace"
    component={(fieldProps) => (
      <button
        className="text-btn text-dark"
        type="button"
        onClick={() => fieldProps.input.onChange(!fieldProps.input.value)}
      >
        {fieldProps.input.value
          ? translate('Use an existing namespace')
          : translate('Add to a new namespace')}
      </button>
    )}
  />
);

interface NamespaceFieldProps {
  options: Namespace[];
}

export const NamespaceField: React.FC<NamespaceFieldProps> = ({ options }) => {
  const { values } = useFormState({ subscription: { values: true } });
  const useNew = values?.useNewNamespace;

  const renderControl = React.useCallback(
    (fieldProps) =>
      useNew ? (
        <>
          <FormControl
            id={fieldProps.id}
            {...fieldProps.input}
            placeholder={translate('e.g. MyApp')}
          />

          {fieldProps.meta.touched && (
            <FieldError error={fieldProps.meta.error} />
          )}
        </>
      ) : (
        <SelectControl
          id={fieldProps.id}
          options={options}
          input={fieldProps.input}
          getLabel={({ name }) => name}
          getValue={({ url }) => url}
        />
      ),

    [useNew, options],
  );

  const namespaceNames = React.useMemo(
    () => options.map((option) => option.name),
    [options],
  );

  const validateNamespace = React.useCallback(
    (value: string | Namespace) => {
      if (typeof value === 'string' && namespaceNames.includes(value)) {
        return translate('Namespace should be unique.');
      }
    },
    [namespaceNames],
  );

  return (
    <DecoratedField
      required={true}
      validate={[required, validateNamespace]}
      label={translate('Namespace')}
      variable={useNew ? 'newNamespace' : 'namespace'}
      action={options.length > 0 ? <NamespaceSwitcher /> : null}
      component={renderControl}
    />
  );
};
