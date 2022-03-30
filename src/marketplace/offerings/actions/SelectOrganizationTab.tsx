import { Alert } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';
import { Field } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { ChoicesTable } from '@waldur/form/ChoicesTable';
import { translate } from '@waldur/i18n';

import { loadRemoteOrganizations } from './api';
import { importOfferingSelector } from './selectors';

export const SelectOrganizationTab = () => {
  const formData = useSelector(importOfferingSelector);
  const {
    loading,
    error,
    value: organizations,
  } = useAsync(() => {
    if (!formData?.api_url || !formData?.token) {
      return Promise.reject(
        new Error(translate('Please check the credentials again.')),
      );
    }
    return loadRemoteOrganizations(formData);
  }, []);
  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return (
      <Alert variant="danger">
        <h4>{translate('Unable to load organizations')}</h4>
        {error?.message && <p>{error.message}</p>}
      </Alert>
    );
  }
  if (organizations.length === 0) {
    return <>{translate('There are no organizations yet.')}</>;
  }
  return (
    <Field
      name="customer"
      component={(fieldProps) => (
        <ChoicesTable
          columns={[
            {
              name: 'name',
              label: translate('Name'),
            },
            {
              name: 'abbreviation',
              label: translate('Abbreviation'),
            },
            {
              name: 'email',
              label: translate('Contact email'),
            },
            {
              name: 'phone_number',
              label: translate('Contact phone'),
            },
          ]}
          choices={organizations as any}
          input={fieldProps.input}
        />
      )}
    />
  );
};
