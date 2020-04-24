import * as React from 'react';
import * as FormControl from 'react-bootstrap/lib/FormControl';
import { useSelector } from 'react-redux';
import { Field, formValueSelector } from 'redux-form';

import { translate } from '@waldur/i18n';

import { DecoratedField } from './DecoratedField';
import { SelectControl } from './SelectControl';

const NamespaceSwitcher = () => (
  <Field
    name="useNewNamespace"
    component={fieldProps => (
      <a
        role="button"
        onClick={() => fieldProps.input.onChange(!fieldProps.input.value)}
      >
        {fieldProps.input.value
          ? translate('Use an existing namespace')
          : translate('Add to a new namespace')}
      </a>
    )}
  />
);

export const NamespaceField = ({ options }) => {
  const useNew = useSelector(state =>
    formValueSelector('RancherTemplateQuestions')(state, 'useNewNamespace'),
  );

  const renderControl = React.useCallback(
    fieldProps =>
      useNew ? (
        <FormControl
          {...fieldProps.input}
          placeholder={translate('e.g. MyApp')}
        />
      ) : (
        <SelectControl options={options} input={fieldProps.input} />
      ),
    [useNew, options],
  );

  return (
    <DecoratedField
      required={true}
      label={translate('Namespace')}
      variable={useNew ? 'newNamespace' : 'namespace'}
      action={options.length > 0 ? <NamespaceSwitcher /> : null}
      component={renderControl}
    />
  );
};
