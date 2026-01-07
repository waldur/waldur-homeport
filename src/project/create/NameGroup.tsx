import { useCallback } from 'react';
import { Field } from 'react-final-form';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { StringField } from '@waldur/form';
import { FormFieldError } from '@waldur/form/FormFieldError';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { validateProjectName } from '../validators';

interface NameGroupProps {
  customer;
  loading?;
  error?;
  refetch?;
}

export const NameGroup = ({
  customer,
  loading,
  error,
  refetch,
}: NameGroupProps) => {
  // Validate function receives (value, allValues, meta)
  // Only run async validation when this field is active (focused)
  const validate = useCallback(
    (value, _allValues, meta) => {
      // Skip async validation if field is not active (user is typing in another field)
      if (meta && !meta.active) {
        return undefined;
      }
      return validateProjectName(value, { customer });
    },
    [customer],
  );
  return (
    <FormGroup
      label={translate('Project name')}
      required
      controlId="name"
      quickAction={
        error ? (
          <LoadingErred
            loadData={refetch}
            className="d-flex align-items-center gap-2 mb-1"
          />
        ) : loading ? (
          <div className="mb-2">
            <small className="text-muted me-2">
              {translate('Loading projects')}
            </small>
            <LoadingSpinnerIcon className="mb-2 w-20px h-20px" />
          </div>
        ) : null
      }
    >
      <Field
        component={StringField as any}
        name="name"
        placeholder={translate('e.g. Community Health Outreach')}
        description={translate('This name will be visible in accounting data.')}
        validate={validate}
        customer={customer}
      />
      <FormFieldError name="name" />
    </FormGroup>
  );
};
